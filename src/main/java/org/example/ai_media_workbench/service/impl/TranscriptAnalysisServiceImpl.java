package org.example.ai_media_workbench.service.impl;

import java.util.*;
import org.example.ai_media_workbench.common.exception.*;
import org.example.ai_media_workbench.common.security.AuthRateLimiter;
import org.example.ai_media_workbench.dto.transcript.*;
import org.example.ai_media_workbench.service.*;
import org.example.ai_media_workbench.vo.transcript.*;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

/** 无索引表、无缓存旧稿。云端等待不持有事务，返回前重新核验最新字幕身份和版本。 */
@Service
public class TranscriptAnalysisServiceImpl implements TranscriptAnalysisService {
    public static final int MAX_SEGMENTS=600;
    public static final int MAX_INPUT_BYTES=128*1024;
    private final TranscriptService transcripts;
    private final TranscriptAnalyzer analyzer;
    private final AuthRateLimiter limiter;
    private final ObjectMapper json;
    public TranscriptAnalysisServiceImpl(TranscriptService transcripts,TranscriptAnalyzer analyzer,AuthRateLimiter limiter,ObjectMapper json) {
        this.transcripts=transcripts; this.analyzer=analyzer; this.limiter=limiter; this.json=json;
    }
    @Override public TranscriptSearchVO search(String userId,String mediaId,SearchTranscriptRequest input) {
        var snapshot=snapshot(userId,mediaId,input.transcriptId(),input.transcriptVersion());
        var selections=analyze(userId,input.query(),snapshot,TranscriptAnalyzer.Mode.SEARCH,input.limit(),0);
        var matches=bind(snapshot,selections,TranscriptAnalyzer.Mode.SEARCH,input.limit(),0).stream()
                .map(item->new TranscriptSearchVO.Match(item.startMs(),item.endMs(),item.selection().score(),item.evidence()))
                .sorted(Comparator.comparingDouble(TranscriptSearchVO.Match::score).reversed()).toList();
        snapshot(userId,mediaId,UUID.fromString(snapshot.id()),snapshot.version());
        return new TranscriptSearchVO(mediaId,snapshot.id(),snapshot.version(),matches,matches.isEmpty() ? "未找到有字幕依据的相关内容。" : null);
    }
    @Override public ClipRecommendationsVO recommend(String userId,String mediaId,RecommendClipsRequest input) {
        var snapshot=snapshot(userId,mediaId,input.transcriptId(),input.transcriptVersion());
        var selections=analyze(userId,input.query(),snapshot,TranscriptAnalyzer.Mode.RECOMMEND,input.limit(),input.maxTotalDurationMs());
        var clips=bind(snapshot,selections,TranscriptAnalyzer.Mode.RECOMMEND,input.limit(),input.maxTotalDurationMs()).stream()
                .map(item->new ClipRecommendationsVO.Clip(label(item.selection().title(),80),label(item.selection().reason(),300),item.startMs(),item.endMs(),item.evidence())).toList();
        snapshot(userId,mediaId,UUID.fromString(snapshot.id()),snapshot.version());
        return new ClipRecommendationsVO(mediaId,snapshot.id(),snapshot.version(),clips,clips.isEmpty() ? "未找到符合目标和时长限制的片段。" : null);
    }
    private TranscriptVO snapshot(String userId,String mediaId,UUID expectedId,int version) {
        var current=transcripts.latest(userId,mediaId);
        if(!current.id().equals(expectedId.toString()) || current.version()!=version) throw new BusinessException(ErrorCode.TRANSCRIPT_VERSION_CONFLICT);
        return current;
    }
    private List<TranscriptAnalyzer.Selection> analyze(String userId,String query,TranscriptVO snapshot,TranscriptAnalyzer.Mode mode,int limit,long budget) {
        if(snapshot.segments().size()>MAX_SEGMENTS || json.writeValueAsBytes(snapshot.segments()).length>MAX_INPUT_BYTES)
            throw new BusinessException(ErrorCode.TRANSCRIPT_ANALYSIS_TOO_LARGE);
        if(!analyzer.isAvailable(userId)) throw new BusinessException(ErrorCode.AI_UNAVAILABLE);
        limiter.check("subtitle-analysis:user:"+userId,20);
        return analyzer.analyze(query.strip(),snapshot.segments(),mode,limit,budget,userId);
    }
    private List<BoundSelection> bind(TranscriptVO snapshot,List<TranscriptAnalyzer.Selection> selections,TranscriptAnalyzer.Mode mode,int limit,long budget) {
        if(selections==null || selections.size()>limit) invalid();
        var positions=new HashMap<UUID,Integer>();
        for(int index=0;index<snapshot.segments().size();index++) positions.put(snapshot.segments().get(index).id(),index);
        var used=new HashSet<UUID>(); var result=new ArrayList<BoundSelection>(); long total=0;
        for(var selection:selections) {
            if(selection==null) invalid();
            Integer start=positions.get(selection.startSegmentId()),end=positions.get(selection.endSegmentId());
            if(start==null || end==null || start>end) invalid();
            var range=snapshot.segments().subList(start,end+1);
            for(var segment:range) if(!used.add(segment.id())) invalid();
            long startMs=range.getFirst().startMs(),endMs=range.getLast().endMs();
            if(mode==TranscriptAnalyzer.Mode.SEARCH) {
                if(selection.score()==null || !Double.isFinite(selection.score()) || selection.score()<0 || selection.score()>1) invalid();
            } else {
                if(endMs-startMs<500) invalid();
                total+=endMs-startMs;
                if(total>budget) invalid();
                label(selection.title(),80); label(selection.reason(),300);
            }
            result.add(new BoundSelection(startMs,endMs,selection,range.stream()
                    .map(segment->new TranscriptEvidence(segment.id(),segment.startMs(),segment.endMs(),segment.text())).toList()));
        }
        return List.copyOf(result);
    }
    private static String label(String value,int limit) {
        if(value==null || value.isBlank() || value.codePointCount(0,value.length())>limit || value.codePoints().anyMatch(Character::isISOControl)) invalid();
        return value.strip();
    }
    private static void invalid() { throw new BusinessException(ErrorCode.AI_ANALYSIS_FAILED); }
    private record BoundSelection(long startMs,long endMs,TranscriptAnalyzer.Selection selection,List<TranscriptEvidence> evidence) {}
}
