package org.example.ai_media_workbench.service.impl;

import java.util.*;
import org.example.ai_media_workbench.common.exception.*;
import org.example.ai_media_workbench.common.security.AuthRateLimiter;
import org.example.ai_media_workbench.dto.transcript.*;
import org.example.ai_media_workbench.service.*;
import org.example.ai_media_workbench.vo.transcript.*;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

/** 分批只生成建议，不持数据库事务等候模型，不发布半成品，不自动重试。 */
@Service
public class TranscriptTranslationServiceImpl implements TranscriptTranslationService {
    private final TranscriptService transcripts;
    private final SubtitleTranslator translator;
    private final AuthRateLimiter limiter;
    private final ObjectMapper json;
    public TranscriptTranslationServiceImpl(TranscriptService transcripts,SubtitleTranslator translator,AuthRateLimiter limiter,ObjectMapper json) {
        this.transcripts=transcripts; this.translator=translator; this.limiter=limiter; this.json=json;
    }
    @Override public TranscriptTranslationVO translate(String userId,String id,TranslateTranscriptRequest input) {
        var snapshot=snapshot(userId,id,input.expectedVersion());
        if(input.segmentIds()==null || input.segmentIds().isEmpty() || input.segmentIds().size()>20
                || !Set.of("zh-CN","zh-TW","en","ja","ko","fr","de","es","ru","pt").contains(input.targetLanguage()))
            throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
        var segments=new ArrayList<TranscriptSegment>(); int previous=-1,characters=0;
        var sourceSegments=input.useOriginal() ? snapshot.originalSegments() : snapshot.segments();
        var positions=new HashMap<UUID,Integer>();
        for(int index=0;index<sourceSegments.size();index++) positions.put(sourceSegments.get(index).id(),index);
        for(var segmentId:input.segmentIds()) {
            var position=positions.get(segmentId);
            if(position==null || position<=previous) throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
            var segment=sourceSegments.get(position); segments.add(segment); previous=position;
            characters+=segment.text().codePointCount(0,segment.text().length());
        }
        if(characters>2000 || json.writeValueAsBytes(segments).length>16*1024)
            throw new BusinessException(ErrorCode.TRANSCRIPT_TRANSLATION_TOO_LARGE);
        if(!translator.isAvailable(userId)) throw new BusinessException(ErrorCode.AI_UNAVAILABLE);
        limiter.check("subtitle-translation:user:"+userId,60);
        var translated=translator.translate(List.copyOf(segments),input.targetLanguage(),userId);
        if(translated==null || translated.size()!=segments.size()) invalid();
        var bound=new ArrayList<TranscriptSegment>();
        for(int index=0;index<segments.size();index++) {
            var source=segments.get(index); var result=translated.get(index);
            if(result==null || !source.id().equals(result.id())) invalid();
            bound.add(new TranscriptSegment(source.id(),source.startMs(),source.endMs(),result.text()));
        }
        List<TranscriptSegment> checked;
        try { checked=TranscriptSegments.checked(bound,sourceSegments.getLast().endMs(),json); }
        catch(BusinessException failure) { throw new BusinessException(ErrorCode.AI_TRANSLATION_FAILED); }
        // 删除、注销、人工修改或重新识别后的晚到结果不再可用。
        snapshot(userId,id,input.expectedVersion());
        return new TranscriptTranslationVO(id,snapshot.version(),input.targetLanguage(),checked);
    }
    private TranscriptVO snapshot(String userId,String id,int version) {
        var item=transcripts.get(userId,id,null); var latest=transcripts.latest(userId,item.mediaId());
        if(!latest.id().equals(id) || item.version()!=version || latest.version()!=version)
            throw new BusinessException(ErrorCode.TRANSCRIPT_VERSION_CONFLICT);
        return item;
    }
    private static void invalid() { throw new BusinessException(ErrorCode.AI_TRANSLATION_FAILED); }
}
