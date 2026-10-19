package org.example.ai_media_workbench;

import java.io.ByteArrayInputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.properties.MediaToolProperties;
import org.example.ai_media_workbench.service.impl.FfprobeMediaProbe;
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
