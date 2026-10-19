package org.example.ai_media_workbench.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Path;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.properties.MediaToolProperties;
import org.example.ai_media_workbench.service.MediaProbe;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/** 使用受控参数调用 ffprobe，不经过 shell，禁止网络协议和播放列表，限制耗时及输出大小。 */
@Component
public class FfprobeMediaProbe implements MediaProbe {
    private final MediaToolProperties properties;
    private final ObjectMapper json;
    private final boolean available;

    public FfprobeMediaProbe(MediaToolProperties properties, ObjectMapper json) {
        this.properties=properties;
        this.json=json;
        this.available=checkAvailable();
    }

    @Override
    public boolean isAvailable() { return available; }

    @Override
    public MediaMetadataVO inspect(Path file) {
        if(!available) throw new BusinessException(ErrorCode.MEDIA_TOOL_UNAVAILABLE);
        Process process=null;
        var readers=Executors.newVirtualThreadPerTaskExecutor();
        try {
            process=new ProcessBuilder(List.of(properties.ffprobe(),"-v","error","-protocol_whitelist","file",
                    "-format_whitelist","mov,matroska,webm","-show_entries",
                    "format=format_name,duration:stream=codec_type,codec_name,width,height,duration:stream_tags=rotate:stream_side_data=rotation",
                    "-of","json","-i",file.toAbsolutePath().toString()))
                    .redirectError(ProcessBuilder.Redirect.DISCARD).start();
            Process running=process;
            var output=readers.submit(() -> running.getInputStream().readNBytes(1024*1024+1));
            if(!process.waitFor(properties.timeout().toMillis(),TimeUnit.MILLISECONDS)) {
                stop(process);
                throw new BusinessException(ErrorCode.MEDIA_PROBE_TIMEOUT);
            }
            byte[] bytes=output.get(2,TimeUnit.SECONDS);
            if(process.exitValue()!=0 || bytes.length>1024*1024) throw new BusinessException(ErrorCode.MEDIA_PROBE_FAILED);
            return metadata(json.readTree(bytes));
        } catch (BusinessException exception) {
            throw exception;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new BusinessException(ErrorCode.MEDIA_PROBE_FAILED);
        } catch (Exception exception) {
            throw new BusinessException(ErrorCode.MEDIA_PROBE_FAILED);
        } finally {
            if(process!=null && process.isAlive()) stop(process);
            readers.shutdownNow();
        }
    }

    private MediaMetadataVO metadata(JsonNode document) {
        JsonNode video=null;
        String audio=null;
        for(JsonNode stream:document.path("streams")) {
            if("video".equals(stream.path("codec_type").asText()) && video==null) video=stream;
            if("audio".equals(stream.path("codec_type").asText()) && audio==null) audio=stream.path("codec_name").asText();
        }
        if(video==null) throw new BusinessException(ErrorCode.UNSUPPORTED_MEDIA);
        int width=video.path("width").asInt(),height=video.path("height").asInt();
        if(width<=0 || height<=0 || width>65536 || height>65536) throw new BusinessException(ErrorCode.MEDIA_PROBE_FAILED);
        long duration=duration(document.path("format").path("duration").asText());
        if(duration<=0) duration=duration(video.path("duration").asText());
        if(duration<=0) throw new BusinessException(ErrorCode.MEDIA_PROBE_FAILED);
        double rotation=video.path("tags").path("rotate").asDouble(0);
        for(JsonNode side:video.path("side_data_list")) if(side.has("rotation")) rotation=side.path("rotation").asDouble();
        if(Math.abs(Math.round(rotation))%180==90) { int swap=width; width=height; height=swap; }
        String container=document.path("format").path("format_name").asText();
        return new MediaMetadataVO(container,duration,width,height,video.path("codec_name").asText(),audio!=null,audio);
    }

    private long duration(String value) {
        try { return new BigDecimal(value).movePointRight(3).setScale(0,RoundingMode.CEILING).longValueExact(); }
        catch (NumberFormatException | ArithmeticException exception) { return 0; }
    }

    private boolean checkAvailable() {
        Process process=null;
        try {
            process=new ProcessBuilder(properties.ffprobe(),"-version").redirectOutput(ProcessBuilder.Redirect.DISCARD)
                    .redirectError(ProcessBuilder.Redirect.DISCARD).start();
            return process.waitFor(4,TimeUnit.SECONDS) && process.exitValue()==0;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt(); return false;
        } catch (Exception exception) {
            return false;
        } finally { if(process!=null && process.isAlive()) stop(process); }
    }

    private static void stop(Process process) {
        process.descendants().forEach(ProcessHandle::destroyForcibly);
        process.destroyForcibly();
    }
}
