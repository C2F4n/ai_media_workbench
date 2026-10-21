package org.example.ai_media_workbench;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.TimeUnit;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.dto.processing.ExportParameters;
import org.example.ai_media_workbench.properties.MediaToolProperties;
import org.example.ai_media_workbench.properties.TranscodeProperties;
import org.example.ai_media_workbench.service.impl.ExportSettings;
import org.example.ai_media_workbench.service.impl.FfmpegMediaTranscoder;
import org.example.ai_media_workbench.service.impl.FfprobeMediaProbe;
import org.example.ai_media_workbench.common.web.MediaPreview;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.util.unit.DataSize;
import tools.jackson.databind.ObjectMapper;
import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

class ExportTests {
    @TempDir Path root;
    private final ObjectMapper json = new ObjectMapper();
    private final FfprobeMediaProbe probe = new FfprobeMediaProbe(new MediaToolProperties("ffprobe", Duration.ofSeconds(10), Duration.ofMinutes(2), 1000, false), json);
    private final FfmpegMediaTranscoder encoder = new FfmpegMediaTranscoder(new TranscodeProperties("ffmpeg", Duration.ofSeconds(30), Duration.ofMinutes(7), 20, DataSize.ofMegabytes(10), false));

    @ParameterizedTest
    @CsvSource({"mp4,h264", "mp4,hevc", "mp4,av1", "mov,h264", "mov,hevc", "mkv,h264", "mkv,hevc", "mkv,vp9", "mkv,av1", "webm,vp9", "webm,av1", "mp3,", "m4a,", "wav,", "flac,"})
    void nativeFormatsUseRequestedCodecsAndPreserveOriginal(String format, String codec) throws Exception {
        assumeTrue(probe.isAvailable() && encoder.exportFormats().contains(format));
        if (codec != null) assumeTrue(encoder.exportVideoCodecs().contains(codec));
        Path source = source(), target = root.resolve("export." + format);
        byte[] before = Files.readAllBytes(source);
        var p = new ExportParameters("export", format, codec, codec == null ? null : "custom", codec == null ? null : 120,
                codec == null ? null : 80, "keep", 200L, 1000L, null, false);
        encoder.export(source, target, null, codec == null ? probe.inspectAudio(source) : probe.inspect(source), p, () -> false);
        var result = codec == null ? probe.inspectAudio(target) : probe.inspect(target);
        assertThat(result.audioCodec()).isEqualTo(ExportSettings.audioCodec(format));
        assertThat(result.durationMs()).isBetween(700L, 1100L);
        if (codec != null) { assertThat(result.videoCodec()).isEqualTo(codec); assertThat(result.width()).isEqualTo(120); assertThat(result.height()).isEqualTo(66); }
        assertThat(Files.readAllBytes(source)).isEqualTo(before);
        assertThat(Files.size(target)).isPositive();
    }

    @ParameterizedTest @CsvSource({"mp4,h264", "webm,vp9"})
    void nativeCompositeTrimsCompressesMutesAndSeparatelySavesFullOriginalAudio(String format, String codec) throws Exception {
        assumeTrue(probe.isAvailable() && encoder.exportFormats().contains(format));
        Path source = source(), target = root.resolve("out." + format), audio = root.resolve("original.mp3");
        var p = new ExportParameters("export", format, codec, "480p", null, null, "mute", 200L, 1000L, 65536L, true);
        encoder.export(source, target, audio, probe.inspect(source), p, () -> false);
        var video = probe.inspect(target); assertThat(video.hasAudio()).isFalse(); assertThat(video.durationMs()).isBetween(700L, 1100L);
        assertThat(Files.size(target)).isLessThanOrEqualTo(65536);
        assertThat(probe.inspectAudio(audio).durationMs()).isBetween(1150L, 1400L);
        for (String suffix : org.example.ai_media_workbench.common.storage.LocalMediaStorage.ENCODING_LOG_SUFFIXES) assertThat(Files.exists(Path.of(target + suffix))).isFalse();
    }

    @Test void strictSettingsRejectCoercionUnknownFieldsUnsafeBoundsAndUnsupportedCombinations() {
        for (String extra : List.of(",\"width\":2.5", ",\"width\":\"200\"", ",\"extractAudio\":\"false\"", ",\"startMs\":0",
                ",\"startMs\":-1,\"endMs\":900", ",\"outputPath\":\"outside.mp4\"", ",\"videoCodec\":\"vp9\"",
                ",\"videoCodec\":\"hevc\",\"targetSizeBytes\":65536", ",\"resolutionPreset\":\"custom\",\"width\":999999,\"height\":1080")) {
            assertThatThrownBy(() -> ExportSettings.parse(json.readTree("{\"operation\":\"export\",\"outputFormat\":\"mp4\"" + extra + "}"))).isInstanceOf(BusinessException.class);
        }
        var p = ExportSettings.parse(json.readTree("{\"operation\":\"export\",\"outputFormat\":\"mp4\",\"startMs\":0,\"endMs\":2000}"));
        assertThatThrownBy(() -> ExportSettings.validateSource(p, new MediaMetadataVO("mov", 1200, 160, 90, "h264", false, null), 100000, 1000000)).isInstanceOf(BusinessException.class);
        assertThat(ExportSettings.parse(json.readTree("{\"operation\":\"export\",\"outputFormat\":\"flac\"}")).audioOnly()).isTrue();
    }

    @Test void resizePreservesAspectDoesNotUpscaleAndCapsResourceUse() {
        var source = new MediaMetadataVO("mov", 1200, 1920, 1080, "h264", true, "aac");
        for (String preset : List.of("source", "360p", "480p", "720p", "1080p", "1440p", "2160p")) {
            var p = new ExportParameters("export", "mp4", "h264", preset, null, null, "keep", null, null, null, false);
            int[] size = ExportSettings.dimensions(source, p); assertThat(size[0]).isLessThanOrEqualTo(1920); assertThat(size[1]).isLessThanOrEqualTo(1080);
        }
        var huge = new MediaMetadataVO("mov", 1200, 65536, 65536, "h264", false, null);
        int[] size = ExportSettings.dimensions(huge, new ExportParameters("export", "mp4", "h264", "source", null, null, "mute", null, null, null, false));
        assertThat((long) size[0] * size[1]).isLessThanOrEqualTo(8847360);
        assertThat(MediaPreview.supported(new MediaMetadataVO("matroska,webm", 1000, 160, 90, "vp9", true, "opus"))).isTrue();
        assertThat(MediaPreview.supported(new MediaMetadataVO("mov,mp4", 1000, 160, 90, "hevc", true, "aac"))).isFalse();
    }

    private Path source() throws Exception {
        Path file = root.resolve("source.mkv");
        var process = new ProcessBuilder("ffmpeg", "-v", "error", "-f", "lavfi", "-i", "testsrc2=s=160x90:r=10:d=1.2", "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=48000:duration=1.2", "-c:v", "mpeg4", "-c:a", "pcm_s16le", "-y", file.toString()).redirectError(ProcessBuilder.Redirect.DISCARD).start();
        assertThat(process.waitFor(10, TimeUnit.SECONDS)).isTrue(); assertThat(process.exitValue()).isZero(); return file;
    }
}
