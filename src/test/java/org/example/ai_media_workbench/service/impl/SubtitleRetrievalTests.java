package org.example.ai_media_workbench.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.example.ai_media_workbench.dto.transcript.TranscriptSegment;
import org.example.ai_media_workbench.dto.transcript.SearchTranscriptRequest;
import org.example.ai_media_workbench.service.TranscriptAnalyzer;
import org.example.ai_media_workbench.service.TranscriptService;
import org.example.ai_media_workbench.common.security.AuthRateLimiter;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.vo.transcript.TranscriptVO;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class SubtitleRetrievalTests {
    private final ObjectMapper json=new ObjectMapper();
    private final LuceneTranscriptRetriever retriever=new LuceneTranscriptRetriever(json);

    @Test void retrievesChineseAndMixedLanguageEvidenceBeyondTheOldSixHundredSegmentLimit() {
        var segments=corpus(1200);
        var target=segment(900,"本机部署需要证书，HTTPS连接保护传输。"); segments.set(900,target);
        var result=retriever.retrieve(segments,"HTTPS证书",false);
        assertThat(result.segments()).contains(target).hasSizeLessThan(segments.size());
        assertThat(result.retrieval().totalSegments()).isEqualTo(1200);
        assertThat(result.retrieval().retrievedSegments()).isLessThanOrEqualTo(96);
        assertThat(result.retrieval().contextBytes()).isLessThanOrEqualTo(32768);
        assertThat(result.retrieval().method()).isEqualTo("BM25");
    }

    @Test void deterministicLabelledRecallAndContextReductionOnLongSyntheticSubtitles() {
        var segments=corpus(2400); int recalled=0;
        var labels=List.of("相机曝光补偿","电影对白降噪","视频编码格式","麦克风电平","字幕翻译校对","云端调用费用");
        for(int index=0;index<labels.size();index++) segments.set(100+index*350,segment(100+index*350,labels.get(index)));
        for(int index=0;index<labels.size();index++) {
            var expected=segments.get(100+index*350);
            var result=retriever.retrieve(segments,labels.get(index),false);
            if(result.segments().contains(expected)) recalled++;
            assertThat(result.segments()).hasSizeLessThan(100);
            assertThat(result.retrieval().contextBytes()).isLessThan(json.writeValueAsBytes(segments).length/4);
        }
        assertThat(recalled).isEqualTo(labels.size());
    }

    @Test void noHitDoesNotSendTheWholeTranscriptAndRecommendationsDeclareCoverageSampling() {
        var segments=corpus(1000);
        assertThat(retriever.retrieve(segments,"不存在的量子引力实验",false).segments()).isEmpty();
        var sampled=retriever.retrieve(segments,"精彩片段",true);
        assertThat(sampled.retrieval().method()).isEqualTo("BM25_COVERAGE");
        assertThat(sampled.segments()).isNotEmpty().hasSizeLessThan(1000);
        var changed=List.of(segment(0,"全新的内容：音轨"));
        assertThat(retriever.retrieve(changed,"音轨",false).segments()).containsExactlyElementsOf(changed);
        assertThat(retriever.retrieve(changed,"量子",false).segments()).isEmpty();
    }

    @Test void candidateContextIsByteBoundedEvenForMultibyteAndEscapedSubtitleText() {
        var segments=new ArrayList<TranscriptSegment>();
        for(int index=0;index<80;index++) segments.add(segment(index,"字幕"+"字\\\"".repeat(600)));
        var result=retriever.retrieve(segments,"字幕",false);
        assertThat(json.writeValueAsBytes(result.segments()).length).isLessThanOrEqualTo(32768);
        assertThat(result.segments()).isNotEmpty().hasSizeLessThan(80);
    }

    @Test void modelCannotBridgeOmittedSourceSegmentsOrReturnAnUnretrievedCitation() {
        var segments=corpus(1000);
        segments.set(40,segment(40,"uniquefox")); segments.set(940,segment(940,"uniquefox"));
        var candidates=retriever.retrieve(segments,"uniquefox",false);
        assertThat(candidates.segments()).contains(segments.get(40),segments.get(940)).doesNotContain(segments.get(500));
        var transcripts=mock(TranscriptService.class); var analyzer=mock(TranscriptAnalyzer.class);
        when(analyzer.isAvailable("owner")).thenReturn(true);
        var id=UUID.randomUUID();
        var snapshot=new TranscriptVO(id.toString(),"media",1,"zh-CN",segments,segments,null,null);
        when(transcripts.latest("owner","media")).thenReturn(snapshot);
        when(analyzer.analyze(anyString(),anyList(),any(),anyInt(),anyLong(),eq("owner"))).thenReturn(
                List.of(new TranscriptAnalyzer.Selection(segments.get(40).id(),segments.get(940).id(),0.9,null,null)));
        var service=new TranscriptAnalysisServiceImpl(transcripts,analyzer,mock(AuthRateLimiter.class),json,retriever);
        assertThatThrownBy(()->service.search("owner","media",new SearchTranscriptRequest("uniquefox",id,1,10))).isInstanceOf(BusinessException.class);
        clearInvocations(analyzer);
        assertThat(service.search("owner","media",new SearchTranscriptRequest("missinggalaxy",id,1,10)).matches()).isEmpty();
        verify(analyzer,never()).analyze(anyString(),anyList(),any(),anyInt(),anyLong(),anyString());
    }

    private static ArrayList<TranscriptSegment> corpus(int count) {
        var values=new ArrayList<TranscriptSegment>();
        for(int index=0;index<count;index++) values.add(segment(index,"普通背景内容，与目标无关。"));
        return values;
    }
    private static TranscriptSegment segment(int index,String text) {
        return new TranscriptSegment(UUID.randomUUID(),index*1000L,index*1000L+800,text);
    }
}
