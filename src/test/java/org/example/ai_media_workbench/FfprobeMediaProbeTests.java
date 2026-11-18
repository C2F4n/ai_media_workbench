package org.example.ai_media_workbench;

import java.io.ByteArrayInputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.properties.MediaToolProperties;
import org.example.ai_media_workbench.service.impl.FfprobeMediaProbe;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import tools.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockConstruction;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class FfprobeMediaProbeTests {
    @TempDir Path files;
    private MediaToolProperties settings() { return new MediaToolProperties("ffprobe",Duration.ofSeconds(10),Duration.ofMinutes(2),1000,false); }

    @Test
    void nativeVideoAndRotationAreReadFromActualFiles() throws Exception {
        var probe=new FfprobeMediaProbe(settings(),new ObjectMapper());
        assumeTrue(probe.isAvailable(),"Install ffprobe to run native checks");
        Path video=files.resolve("native.mp4");
        Process generator;
        try {
            generator=new ProcessBuilder("ffmpeg","-v","error","-f","lavfi","-i","color=c=blue:s=160x90:r=10:d=0.4",
                    "-an","-c:v","libx264","-pix_fmt","yuv420p","-y",video.toString())
                    .redirectOutput(ProcessBuilder.Redirect.DISCARD).redirectError(ProcessBuilder.Redirect.DISCARD).start();
        } catch(java.io.IOException exception) { assumeTrue(false,"Install ffmpeg to generate fixture"); return; }
        try { assertThat(generator.waitFor(10,TimeUnit.SECONDS)).isTrue(); assertThat(generator.exitValue()).isZero(); }
        finally { generator.destroyForcibly(); }
        var metadata=probe.inspect(video);
        assertThat(metadata.width()).isEqualTo(160); assertThat(metadata.height()).isEqualTo(90);
        assertThat(metadata.durationMs()).isBetween(300L,500L); assertThat(metadata.hasAudio()).isFalse();
        assertThat(metadata.bitRate()).isPositive();
        assertThat(metadata.videoBitRate()).isPositive();
        assertThat(metadata.frameRate()).isEqualTo(10.0);
        assertThat(metadata.pixelFormat()).isEqualTo("yuv420p");
        assertThat(metadata.sampleRate()).isNull();
        Path rotated=files.resolve("rotated.mp4");
        Process rotate=new ProcessBuilder("ffmpeg","-v","error","-display_rotation","90","-i",video.toString(),"-c","copy","-y",rotated.toString())
                .redirectOutput(ProcessBuilder.Redirect.DISCARD).redirectError(ProcessBuilder.Redirect.DISCARD).start();
        try { assertThat(rotate.waitFor(10,TimeUnit.SECONDS)).isTrue(); assertThat(rotate.exitValue()).isZero(); }
        finally { rotate.destroyForcibly(); }
        assertThat(probe.inspect(rotated).width()).isEqualTo(90);
        assertThat(probe.inspect(rotated).height()).isEqualTo(160);
        assertThatThrownBy(()->probe.inspect(Files.writeString(files.resolve("broken.mp4"),"not a video")))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void extendedMetadataHandlesRationalRatesAndUnavailableFields() throws Exception {
        String source = """
                {"format":{"format_name":"mov,mp4","duration":"3.5","bit_rate":"5628000"},
                 "streams":[
                   {"codec_type":"video","codec_name":"h264","width":160,"height":90,
                    "bit_rate":"5500000","avg_frame_rate":"30000/1001","pix_fmt":"yuv420p"},
                   {"codec_type":"audio","codec_name":"aac","bit_rate":"128000","sample_rate":"48000",
                    "channels":2,"channel_layout":"stereo"}]}
                """;
        var details = inspectJson(source);
        assertThat(details.bitRate()).isEqualTo(5628000L);
        assertThat(details.videoBitRate()).isEqualTo(5500000L);
        assertThat(details.audioBitRate()).isEqualTo(128000L);
        assertThat(details.frameRate()).isEqualTo(29.97003);
        assertThat(details.sampleRate()).isEqualTo(48000);
        assertThat(details.channels()).isEqualTo(2);
        assertThat(details.channelLayout()).isEqualTo("stereo");
        var unavailable = inspectJson(source.replace("5628000", "N/A").replace("5500000", "999999999999999999999")
                .replace("128000", "-1").replace("48000", "N/A").replace("30000/1001", "0/0"));
        assertThat(unavailable.width()).isEqualTo(160);
        assertThat(unavailable.bitRate()).isNull();
        assertThat(unavailable.videoBitRate()).isNull();
        assertThat(unavailable.audioBitRate()).isNull();
        assertThat(unavailable.frameRate()).isNull();
        assertThat(unavailable.sampleRate()).isNull();
        var legacy = new ObjectMapper().readValue("""
                {"container":"mp4","durationMs":1200,"width":160,"height":90,
                 "videoCodec":"h264","hasAudio":false,"audioCodec":null}
                """, MediaMetadataVO.class);
        assertThat(legacy.width()).isEqualTo(160);
        assertThat(legacy.bitRate()).isNull();
        assertThat(legacy.channels()).isNull();
    }

    private MediaMetadataVO inspectJson(String source) throws Exception {
        Process version = mock(Process.class), inspection = mock(Process.class);
        when(version.waitFor(4, TimeUnit.SECONDS)).thenReturn(true);
        when(version.exitValue()).thenReturn(0);
        when(inspection.waitFor(anyLong(), any(TimeUnit.class))).thenReturn(true);
        when(inspection.exitValue()).thenReturn(0);
        when(inspection.getInputStream()).thenReturn(new ByteArrayInputStream(source.getBytes(StandardCharsets.UTF_8)));
        try (var builders = mockConstruction(ProcessBuilder.class, (builder, context) -> {
            when(builder.redirectOutput(any(ProcessBuilder.Redirect.class))).thenReturn(builder);
            when(builder.redirectError(any(ProcessBuilder.Redirect.class))).thenReturn(builder);
            when(builder.start()).thenReturn(context.getCount() == 1 ? version : inspection);
        })) {
            return new FfprobeMediaProbe(settings(), new ObjectMapper()).inspect(files.resolve("fixture.mp4"));
        }
    }

    @Test
    void timedOutChildIsDestroyedAndInputsAreNeverPassedThroughAShell() {
        Process version=mock(Process.class),stalled=mock(Process.class);
        try {
            when(version.waitFor(4,TimeUnit.SECONDS)).thenReturn(true);
            when(version.exitValue()).thenReturn(0);
            when(stalled.getInputStream()).thenReturn(new ByteArrayInputStream(new byte[0]));
            when(stalled.waitFor(anyLong(),any(TimeUnit.class))).thenReturn(false);
            when(stalled.isAlive()).thenReturn(true);
            when(stalled.descendants()).thenAnswer(call->Stream.empty());
            try(var builders=mockConstruction(ProcessBuilder.class,(builder,context)->{
                when(builder.redirectOutput(any(ProcessBuilder.Redirect.class))).thenReturn(builder);
                when(builder.redirectError(any(ProcessBuilder.Redirect.class))).thenReturn(builder);
                when(builder.start()).thenReturn(context.getCount()==1 ? version : stalled);
                if(context.getCount()==2) {
                    @SuppressWarnings("unchecked") var command=(List<String>)context.arguments().getFirst();
                    assertThat(command).containsSubsequence("-protocol_whitelist","file","-format_whitelist","mov,matroska,webm");
                    assertThat(command.getFirst()).isEqualTo("ffprobe");
                }
            })) {
                var probe=new FfprobeMediaProbe(settings(),new ObjectMapper());
                assertThatThrownBy(()->probe.inspect(files.resolve("video.bin"))).isInstanceOfSatisfying(BusinessException.class,
                        error->assertThat(error.code()).isEqualTo(ErrorCode.MEDIA_PROBE_TIMEOUT));
                verify(stalled,atLeastOnce()).destroyForcibly();
            }
        } catch(Exception exception) { throw new AssertionError(exception); }
    }
}
