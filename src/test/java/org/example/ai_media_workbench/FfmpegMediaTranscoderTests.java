package org.example.ai_media_workbench;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Stream;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.dto.processing.TranscodeParameters;
import org.example.ai_media_workbench.dto.processing.CompressionParameters;
import org.example.ai_media_workbench.dto.processing.VideoParameters;
import org.example.ai_media_workbench.service.impl.CompressionBudget;
import org.example.ai_media_workbench.properties.MediaToolProperties;
import org.example.ai_media_workbench.properties.TranscodeProperties;
import org.example.ai_media_workbench.service.impl.FfmpegMediaTranscoder;
import org.example.ai_media_workbench.service.impl.FfprobeMediaProbe;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.util.unit.DataSize;
import tools.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

class FfmpegMediaTranscoderTests {
    @TempDir Path root;
    private final TranscodeParameters parameters = new TranscodeParameters("transcode", "mp4", "720p", "keep");
    private TranscodeProperties properties(Duration timeout) {
        return new TranscodeProperties("ffmpeg", timeout, Duration.ofMinutes(7), 20, DataSize.ofMegabytes(10), false);
    }

    @Test void nativeConversionProducesPlayableMp4WithAudioAndCorrectDimensions() throws Exception {
        var probe = new FfprobeMediaProbe(new MediaToolProperties("ffprobe", Duration.ofSeconds(10), Duration.ofMinutes(2), 1000, false), new ObjectMapper());
        assumeTrue(probe.isAvailable(), "Install ffprobe for native conversion checks");
        Path source = root.resolve("source.mkv"), output = root.resolve("result.mp4");
        try {
            run("ffmpeg", "-v", "error", "-f", "lavfi", "-i", "testsrc2=size=1280x800:rate=5",
                    "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=48000", "-t", "0.6", "-c:v", "mpeg4", "-c:a", "pcm_s16le", "-y", source.toString());
        } catch (java.io.IOException missing) { assumeTrue(false, "Install ffmpeg for native conversion checks"); return; }
        var converter = new FfmpegMediaTranscoder(properties(Duration.ofSeconds(20)));
        assertThat(converter.isAvailable()).isTrue();
        byte[] original = Files.readAllBytes(source);
        var before = probe.inspect(source);
        converter.convert(source, output, before, parameters, () -> false);
        var after = probe.inspect(output);
        assertThat(after.width()).isEqualTo(1152); assertThat(after.height()).isEqualTo(720);
        assertThat(after.videoCodec()).isEqualTo("h264"); assertThat(after.audioCodec()).isEqualTo("aac");
        assertThat(after.hasAudio()).isTrue(); assertThat(Files.size(output)).isPositive();
        assertThat(Files.readAllBytes(source)).isEqualTo(original);
        Path small = root.resolve("small.mp4"), rotated = root.resolve("rotated.mp4"), portrait = root.resolve("portrait.mp4");
        run("ffmpeg", "-v", "error", "-f", "lavfi", "-i", "color=c=red:s=160x90:r=10:d=0.4", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-y", small.toString());
        run("ffmpeg", "-v", "error", "-display_rotation", "90", "-i", small.toString(), "-c", "copy", "-y", rotated.toString());
        converter.convert(rotated, portrait, probe.inspect(rotated), parameters, () -> false);
        assertThat(probe.inspect(portrait).width()).isEqualTo(90);
        assertThat(probe.inspect(portrait).height()).isEqualTo(160);
    }

    @Test void scalingKeepsPortraitAspectAndNeverEnlargesSmallOrOddSources() {
        assertThat(FfmpegMediaTranscoder.dimensions(metadata(1080, 1920), parameters)).containsExactly(720, 1280);
        assertThat(FfmpegMediaTranscoder.dimensions(metadata(161, 91), parameters)).containsExactly(160, 90);
        assertThat(FfmpegMediaTranscoder.dimensions(metadata(160, 90), parameters)).containsExactly(160, 90);
    }

    @Test void nativeTwoPassCompressionMeetsTheTargetWithAndWithoutAudioAndLeavesNoPassFiles() throws Exception {
        var probe = new FfprobeMediaProbe(new MediaToolProperties("ffprobe", Duration.ofSeconds(10), Duration.ofMinutes(2), 1000, false), new ObjectMapper());
        assumeTrue(probe.isAvailable(), "Install ffprobe for native compression checks");
        Path source = root.resolve("compression-source.mkv"), silent = root.resolve("silent.mkv");
        try {
            run("ffmpeg", "-v", "error", "-f", "lavfi", "-i", "testsrc2=size=640x360:rate=20",
                    "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=48000", "-t", "3", "-c:v", "mpeg4", "-q:v", "2", "-c:a", "pcm_s16le", "-y", source.toString());
        } catch (java.io.IOException missing) { assumeTrue(false, "Install ffmpeg for native compression checks"); return; }
        run("ffmpeg", "-v", "error", "-i", source.toString(), "-an", "-c:v", "copy", "-y", silent.toString());
        var converter = new FfmpegMediaTranscoder(properties(Duration.ofSeconds(20)));
        assertThat(converter.isAvailable()).isTrue();
        for (Path input : List.of(source, silent)) {
            long originalSize = Files.size(input), targetSize = 200_000;
            assertThat(originalSize).isGreaterThan(targetSize);
            var original = probe.inspect(input);
            var compressed = new CompressionParameters("compress", "mp4", targetSize, "720p", "keep");
            Path output = root.resolve(input.getFileName() + "-compressed.mp4");
            converter.convert(input, output, original, compressed, () -> false);
            var actual = probe.inspect(output);
            assertThat(Files.size(output)).isPositive().isLessThanOrEqualTo(targetSize).isLessThan(originalSize);
            assertThat(actual.width()).isEqualTo(640); assertThat(actual.height()).isEqualTo(360);
            assertThat(actual.videoCodec()).isEqualTo("h264"); assertThat(actual.hasAudio()).isEqualTo(original.hasAudio());
            assertThat(Math.abs(actual.durationMs() - original.durationMs())).isLessThanOrEqualTo(250);
            assertThat(Files.size(input)).isEqualTo(originalSize);
            for (String suffix : org.example.ai_media_workbench.common.storage.LocalMediaStorage.ENCODING_LOG_SUFFIXES)
                assertThat(Files.exists(Path.of(output + suffix))).isFalse();
        }
    }

    @Test void compressionBudgetRejectsImpossibleGoalsAndReservesSpaceForAudio() {
        assertThatThrownBy(() -> CompressionBudget.calculate(metadata(160, 90), 1000)).isInstanceOf(BusinessException.class);
        var longAudio = new MediaMetadataVO("mov", 900_000, 1280, 720, "h264", true, "aac");
        assertThatThrownBy(() -> CompressionBudget.calculate(longAudio, 100_000))
                .isInstanceOfSatisfying(BusinessException.class, error -> assertThat(error.code()).isEqualTo(ErrorCode.COMPRESSION_TARGET_UNREACHABLE));
        var withAudio = CompressionBudget.calculate(new MediaMetadataVO("mov", 1200, 160, 90, "h264", true, "aac"), 100_000);
        var silent = CompressionBudget.calculate(metadata(160, 90), 100_000);
        // metadata() 为400ms；用相同时长比较音轨预算。
        var silentSameDuration = CompressionBudget.calculate(new MediaMetadataVO("mov", 1200, 160, 90, "h264", false, null), 100_000);
        assertThat(withAudio.audioBitsPerSecond()).isEqualTo(96_000);
        assertThat(silentSameDuration.videoBitsPerSecond() - withAudio.videoBitsPerSecond()).isEqualTo(96_000);
        assertThat(silent.videoBitsPerSecond()).isPositive();
    }

    @Test void oldTranscodeSnapshotsAndNewCompressionSnapshotsRoundTripWithoutChangingShape() {
        var json = new ObjectMapper();
        var old = json.readValue("{\"operation\":\"transcode\",\"outputFormat\":\"mp4\",\"resolutionPreset\":\"source\",\"audioMode\":\"keep\"}", VideoParameters.class);
        assertThat(old).isInstanceOf(TranscodeParameters.class);
        assertThat(json.readTree(json.writeValueAsString(old)).size()).isEqualTo(4);
        var compression = new CompressionParameters("compress", "mp4", 200_000, "720p", "keep");
        assertThat(json.readValue(json.writeValueAsString(compression), VideoParameters.class)).isEqualTo(compression);
    }

    @Test void timedOutAndCancelledChildrenAreDestroyedWithoutInvokingAShell() throws Exception {
        for (ErrorCode expected : new ErrorCode[]{ErrorCode.TRANSCODE_TIMEOUT, ErrorCode.TASK_CANCELLED}) {
            Process available = mock(Process.class), stalled = mock(Process.class);
            when(available.getInputStream()).thenReturn(new ByteArrayInputStream(" V libx264 encoder\n A aac encoder\n".getBytes(StandardCharsets.UTF_8)));
            when(available.waitFor(4, TimeUnit.SECONDS)).thenReturn(true); when(available.exitValue()).thenReturn(0);
            when(stalled.waitFor(anyLong(), any(TimeUnit.class))).thenReturn(false);
            when(stalled.isAlive()).thenReturn(true); when(stalled.descendants()).thenAnswer(call -> Stream.empty());
            Path output = Files.createFile(root.resolve(expected.name() + ".mp4"));
            try (var builders = mockConstruction(ProcessBuilder.class, (builder, context) -> {
                when(builder.redirectOutput(any(ProcessBuilder.Redirect.class))).thenReturn(builder);
                when(builder.redirectError(any(ProcessBuilder.Redirect.class))).thenReturn(builder);
                when(builder.start()).thenReturn(context.getCount() == 1 ? available : stalled);
                if (context.getCount() == 2) {
                    @SuppressWarnings("unchecked") var command = (List<String>) context.arguments().getFirst();
                    assertThat(command.getFirst()).isEqualTo("ffmpeg");
                    assertThat(command).containsSubsequence("-protocol_whitelist", "file", "-format_whitelist", "mov,matroska,webm");
                    assertThat(command).contains("-nostdin", "libx264", "aac");
                }
            })) {
                var converter = new FfmpegMediaTranscoder(properties(expected == ErrorCode.TRANSCODE_TIMEOUT ? Duration.ofNanos(1) : Duration.ofSeconds(10)));
                AtomicInteger polls = new AtomicInteger();
                assertThatThrownBy(() -> converter.convert(root.resolve("input;not-a-shell.mkv"), output, metadata(160, 90), parameters,
                        () -> expected == ErrorCode.TASK_CANCELLED && polls.getAndIncrement() > 0))
                        .isInstanceOfSatisfying(BusinessException.class, error -> assertThat(error.code()).isEqualTo(expected));
                verify(stalled, atLeastOnce()).destroyForcibly();
            }
        }
    }

    private MediaMetadataVO metadata(int width, int height) { return new MediaMetadataVO("mov", 400, width, height, "h264", false, null); }
    private void run(String... command) throws Exception {
        var process = new ProcessBuilder(command).redirectOutput(ProcessBuilder.Redirect.DISCARD).redirectError(ProcessBuilder.Redirect.DISCARD).start();
        try { assertThat(process.waitFor(15, TimeUnit.SECONDS)).isTrue(); assertThat(process.exitValue()).isZero(); }
        finally { process.destroyForcibly(); }
    }
}
