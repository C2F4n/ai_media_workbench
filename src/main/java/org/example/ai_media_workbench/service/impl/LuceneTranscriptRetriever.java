package org.example.ai_media_workbench.service.impl;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;
import java.util.concurrent.Semaphore;
import java.util.stream.Collectors;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.cjk.CJKAnalyzer;
import org.apache.lucene.analysis.cn.smart.SmartChineseAnalyzer;
import org.apache.lucene.analysis.miscellaneous.PerFieldAnalyzerWrapper;
import org.apache.lucene.analysis.tokenattributes.CharTermAttribute;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.StoredField;
import org.apache.lucene.document.TextField;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.BooleanClause;
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.search.BoostQuery;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.TermQuery;
import org.apache.lucene.search.similarities.BM25Similarity;
import org.apache.lucene.store.ByteBuffersDirectory;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.dto.transcript.TranscriptSegment;
import org.example.ai_media_workbench.service.TranscriptRetriever;
import org.example.ai_media_workbench.vo.transcript.RetrievalVO;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

/**
 * RAG 的检索阶段：在当前账号提供的字幕快照内建内存索引，用 BM25 词汇相关性筛选候选。
 * 不是向量数据库，也不直接生成答案；候选再交给 TranscriptAnalyzer，证据由业务层校验。
 * 索引随请求关闭，不缓存或混用不同用户的原稿。
 */
@Service
public class LuceneTranscriptRetriever implements TranscriptRetriever {
    public static final int MAX_CONTEXT_BYTES = 32 * 1024;
    public static final int MAX_CONTEXT_SEGMENTS = 96;
    private static final int MAX_CHUNKS = 16;
    private final Semaphore indexes = new Semaphore(2);
    private final ObjectMapper json;

    public LuceneTranscriptRetriever(ObjectMapper json) { this.json = json; }

    @Override
    public Candidates retrieve(List<TranscriptSegment> segments, String query, boolean recommend) {
        if (!indexes.tryAcquire()) throw new BusinessException(ErrorCode.AI_BUSY);
        try (var directory = new ByteBuffersDirectory(); var smart = new SmartChineseAnalyzer(); var cjk = new CJKAnalyzer();
             var analyzer = new PerFieldAnalyzerWrapper(smart, Map.of("cjk", cjk))) {
            var chunks = chunks(segments);
            try (var writer = new IndexWriter(directory, new IndexWriterConfig(analyzer).setRAMBufferSizeMB(8)
                    .setSimilarity(new BM25Similarity()))) {
                for (int index = 0; index < chunks.size(); index++) {
                    var document = new Document();
                    var chunk = chunks.get(index);
                    document.add(new StoredField("chunk", index));
                    String text = segments.subList(chunk.start(), chunk.end()).stream()
                            .map(TranscriptSegment::text).collect(Collectors.joining("\n"));
                    document.add(new TextField("text", text, Field.Store.NO));
                    document.add(new TextField("cjk", text, Field.Store.NO));
                    writer.addDocument(document);
                }
            }
            var queryBuilder = new BooleanQuery.Builder();
            // 分词提高精度，双字词补偿中文词边界差异；两者都使用Lucene的BM25评分。
            addTerms(queryBuilder,analyzer,"text",query,2f);
            addTerms(queryBuilder,analyzer,"cjk",query,1f);
            var ranked = new LinkedHashSet<Integer>();
            try (var reader = DirectoryReader.open(directory)) {
                var searcher = new IndexSearcher(reader); searcher.setSimilarity(new BM25Similarity());
                for (var hit : searcher.search(queryBuilder.build(), MAX_CHUNKS).scoreDocs) {
                    ranked.add(searcher.storedFields().document(hit.doc).getField("chunk").numericValue().intValue());
                }
            }
            // 推荐无词汇命中时抽样覆盖原稿；普通搜索则保持空结果，不冒充完整语义检索。
            boolean coverage = recommend && ranked.isEmpty();
            if (coverage && !chunks.isEmpty()) {
                int count = Math.min(MAX_CHUNKS, chunks.size());
                for (int index = 0; index < count; index++) ranked.add(count == 1 ? 0 : index * (chunks.size() - 1) / (count - 1));
            }
            // 先按命中排名选块，去除重叠字幕后恢复原顺序；限制发给模型的段数及 JSON 字节数。
            var positions = new TreeSet<Integer>(); int bytes = 2;
            for (int chunkIndex : ranked) {
                var chunk = chunks.get(chunkIndex); var extra = new ArrayList<Integer>(); int extraBytes = 0;
                for (int index = chunk.start(); index < chunk.end(); index++) {
                    if (!positions.contains(index)) { extra.add(index); extraBytes += json.writeValueAsBytes(segments.get(index)).length + 1; }
                }
                if (positions.size() + extra.size() > MAX_CONTEXT_SEGMENTS || bytes + extraBytes > MAX_CONTEXT_BYTES) continue;
                positions.addAll(extra); bytes += extraBytes;
            }
            var selected = positions.stream().map(segments::get).toList();
            return new Candidates(selected, new RetrievalVO(coverage ? "BM25_COVERAGE" : "BM25", segments.size(), chunks.size(),
                    selected.size(), json.writeValueAsBytes(selected).length));
        } catch (IOException exception) {
            throw new BusinessException(ErrorCode.AI_ANALYSIS_FAILED);
        } finally { indexes.release(); }
    }

    /** 相邻块保留少量重叠，减少一句话刚好被分块边界切断而漏检的情况。 */
    private static List<Chunk> chunks(List<TranscriptSegment> segments) {
        var result = new ArrayList<Chunk>();
        for (int start = 0; start < segments.size();) {
            int end = start, bytes = 0;
            while (end < segments.size() && end - start < 8) {
                int size = segments.get(end).text().getBytes(StandardCharsets.UTF_8).length;
                if (end > start && bytes + size > 12 * 1024) break;
                bytes += size; end++;
            }
            result.add(new Chunk(start, end));
            if (end == segments.size()) break;
            start = Math.max(start + 1, end - 2);
        }
        return result;
    }
    private record Chunk(int start, int end) {}
    private static void addTerms(BooleanQuery.Builder builder, Analyzer analyzer, String field, String query, float boost) throws IOException {
        var terms = new LinkedHashSet<String>();
        try (var tokens = analyzer.tokenStream(field, query)) {
            var term = tokens.addAttribute(CharTermAttribute.class); tokens.reset();
            while (tokens.incrementToken() && terms.size() < 64) terms.add(term.toString());
            tokens.end();
        }
        for (String term : terms) builder.add(new BoostQuery(new TermQuery(new Term(field,term)),boost),BooleanClause.Occur.SHOULD);
    }
}
