package org.example.ai_media_workbench.dto.processing;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

/** 同一素材的顺序即播放顺序，允许重复区间；不增加草稿实体或接受文件路径。 */
public record JoinClipsParameters(String operation,String outputFormat,List<ClipRange> clips,String audioMode) implements VideoParameters {
    public static final int MAX_CLIPS=20;
    public static final long MAX_DURATION_MS=900_000;
    public JoinClipsParameters { if(clips!=null) clips=List.copyOf(clips); }
    @Override @JsonIgnore public String resolutionPreset() { return "source"; }
    public record ClipRange(long startMs,long endMs) {}
    public long totalDurationMs() { return clips.stream().mapToLong(clip->clip.endMs()-clip.startMs()).sum(); }
    public boolean fitsWithin(long durationMs) {
        if(clips==null || clips.isEmpty() || clips.size()>MAX_CLIPS) return false;
        long total=0;
        for(var clip:clips) {
            if(clip==null || clip.startMs()<0 || clip.endMs()<=clip.startMs() || clip.endMs()>durationMs
                    || clip.endMs()-clip.startMs()<500 || clip.endMs()-clip.startMs()>MAX_DURATION_MS) return false;
            total+=clip.endMs()-clip.startMs();
            if(total>MAX_DURATION_MS) return false;
        }
        return true;
    }
}
