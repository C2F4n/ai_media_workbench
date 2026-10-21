package org.example.ai_media_workbench;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.TimeUnit;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.common.storage.LocalMediaStorage;
import org.example.ai_media_workbench.dto.processing.OperationParameters;
import org.example.ai_media_workbench.dto.processing.WorkflowParameters;
import org.example.ai_media_workbench.properties.MediaToolProperties;
import org.example.ai_media_workbench.properties.TranscodeProperties;
import org.example.ai_media_workbench.service.impl.FfmpegMediaTranscoder;
import org.example.ai_media_workbench.service.impl.FfprobeMediaProbe;
import org.example.ai_media_workbench.service.impl.WorkflowSettings;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.util.unit.DataSize;
import tools.jackson.databind.ObjectMapper;
import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

class WorkflowTests {
    @TempDir Path root;
    private final ObjectMapper json = new ObjectMapper();
    private final MediaMetadataVO metadata = new MediaMetadataVO("mov", 20000, 1920, 1080, "h264", true, "aac");

    private WorkflowParameters plan(String steps, String format) {
        return WorkflowSettings.parse(json.readTree("{\"operation\":\"workflow\",\"outputFormat\":\"" + format + "\",\"steps\":[" + steps
                + ",{\"operation\":\"export\",\"outputFormat\":\"" + format + "\"}]}"));
    }
    private WorkflowSettings.Compiled compile(String steps) { return WorkflowSettings.compile(plan(steps, "mp4"), metadata, 10_000_000, 100_000_000); }

    @Test void sequentialTrimsConsumePreviousOutputAndRoundTripWithoutLosingTypes() {
        var p = plan("{\"operation\":\"trim\",\"startMs\":5000,\"endMs\":15000},{\"operation\":\"trim\",\"startMs\":2000,\"endMs\":6000}", "mp4");
        assertThat(json.readValue(json.writeValueAsString(p), OperationParameters.class)).isEqualTo(p);
        var result = WorkflowSettings.compile(p, metadata, 10_000_000, 100_000_000);
        assertThat(result.clips()).containsExactly(new org.example.ai_media_workbench.dto.processing.JoinClipsParameters.ClipRange(7000, 11000));
        assertThat(result.metadata().durationMs()).isEqualTo(4000);
    }

    @Test void joiningThenTrimmingMapsAcrossSeamsAndKeepsRepeatedReversedSelections() {
        var result = compile("{\"operation\":\"join_clips\",\"clips\":[{\"startMs\":15000,\"endMs\":20000},{\"startMs\":0,\"endMs\":5000}]},"
                + "{\"operation\":\"trim\",\"startMs\":3000,\"endMs\":7000},"
                + "{\"operation\":\"join_clips\",\"clips\":[{\"startMs\":2000,\"endMs\":4000},{\"startMs\":0,\"endMs\":2000},{\"startMs\":2000,\"endMs\":4000}]}");
        assertThat(result.clips()).extracting(c -> List.of(c.startMs(), c.endMs())).containsExactly(List.of(0L,2000L),List.of(18000L,20000L),List.of(0L,2000L));
        assertThat(result.metadata().durationMs()).isEqualTo(6000);
    }

    @Test void resizesRetainOrderWithoutUpscalingAndMutePropagatesToExportBudget() {
        var result = compile("{\"operation\":\"resize\",\"resolutionPreset\":\"360p\"},{\"operation\":\"resize\",\"resolutionPreset\":\"720p\"},{\"operation\":\"mute\"}");
        assertThat(result.metadata().width()).isEqualTo(640); assertThat(result.metadata().height()).isEqualTo(360);
        assertThat(result.videoFilters()).hasSize(3); assertThat(result.metadata().hasAudio()).isFalse(); assertThat(result.export().audioMode()).isEqualTo("mute");
        assertThatThrownBy(() -> WorkflowSettings.compile(plan("{\"operation\":\"mute\"}", "mp3"), metadata, 1000000, 10000000))
                .isInstanceOfSatisfying(BusinessException.class, e -> assertThat(e.code()).isEqualTo(ErrorCode.SOURCE_HAS_NO_AUDIO));
    }

    @Test void strictSchemaRejectsUnknownOperationsCommandsCoercionAndNonterminalExports() {
        for (String steps : List.of("{\"operation\":\"shell\"}", "{\"operation\":\"mute\",\"command\":\"ffmpeg\"}",
                "{\"operation\":\"trim\",\"startMs\":\"0\",\"endMs\":1000}", "{\"operation\":\"trim\",\"startMs\":0.1,\"endMs\":1000}",
                "{\"operation\":\"export\",\"outputFormat\":\"mp4\"}", "{\"operation\":\"resize\",\"resolutionPreset\":\"custom\",\"width\":4294967296,\"height\":2}"))
            assertThatThrownBy(() -> plan(steps, "mp4")).isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> compile("{\"operation\":\"trim\",\"startMs\":0,\"endMs\":5000},{\"operation\":\"trim\",\"startMs\":0,\"endMs\":6000}"))
                .isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> compile("{\"operation\":\"resize\",\"resolutionPreset\":\"custom\",\"width\":4096,\"height\":4096}"))
                .isInstanceOf(BusinessException.class);
    }

    @Test void repeatedSelectionExpansionIsBoundedBeforeAnyMediaExecution() {
        String clips = java.util.stream.IntStream.range(0, 20).mapToObj(i -> "{\"startMs\":0,\"endMs\":1000}").collect(java.util.stream.Collectors.joining(","));
        assertThatThrownBy(() -> compile("{\"operation\":\"join_clips\",\"clips\":[" + clips + "]},{\"operation\":\"join_clips\",\"clips\":[{\"startMs\":0,\"endMs\":20000},{\"startMs\":0,\"endMs\":20000}]}"))
                .isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> plan(String.join(",", java.util.Collections.nCopies(12, "{\"operation\":\"mute\"}")), "mp4"))
                .isInstanceOf(BusinessException.class);
    }

    @Test void nativeJoinTrimResizeMuteExecutesInOrderWithLosslessPrivateIntermediates() throws Exception {
        var encoder = encoder(20); var probe = probe(); assumeTrue(encoder.isWorkflowAvailable() && probe.isAvailable());
        Path source = source(), target = root.resolve("workflow.mp4"), sidecar = root.resolve("original.mp3");
        byte[] before = Files.readAllBytes(source);
        String steps = "{\"operation\":\"join_clips\",\"clips\":[{\"startMs\":2000,\"endMs\":3000},{\"startMs\":0,\"endMs\":1000}]},"
                + "{\"operation\":\"trim\",\"startMs\":500,\"endMs\":1500},{\"operation\":\"resize\",\"resolutionPreset\":\"custom\",\"width\":160,\"height\":90},{\"operation\":\"mute\"}";
        var p = plan(steps, "mp4");
        var list = new java.util.ArrayList<>(p.steps()); list.set(list.size()-1, new WorkflowParameters.Export("export", "mp4", "h264", 65536L, true));
        encoder.workflow(source, target, sidecar, probe.inspect(source), new WorkflowParameters("workflow", "mp4", list), () -> false);
        var output = probe.inspect(target);
        assertThat(output.durationMs()).isBetween(900L, 1150L); assertThat(output.width()).isEqualTo(160); assertThat(output.height()).isEqualTo(90);
        assertThat(output.hasAudio()).isFalse(); assertThat(Files.size(target)).isLessThanOrEqualTo(65536);
        assertThat(probe.inspectAudio(sidecar).durationMs()).isBetween(2950L, 3150L);
        assertThat(Files.readAllBytes(source)).isEqualTo(before);
        byte[] first = pixel(target, "0.15"), second = pixel(target, "0.75");
        assertThat(Byte.toUnsignedInt(first[1])).isGreaterThan(70); assertThat(Byte.toUnsignedInt(first[0])).isLessThan(30);
        assertThat(Byte.toUnsignedInt(second[0])).isGreaterThan(180); assertThat(Byte.toUnsignedInt(second[1])).isLessThan(30);
        for (String suffix : LocalMediaStorage.OUTPUT_AUXILIARY_SUFFIXES) assertThat(Files.exists(Path.of(target + suffix))).isFalse();
    }

    @Test void nativeAudioWorkflowAndDirectFusionSupportDifferentTerminalFormats() throws Exception {
        var encoder = encoder(20); var probe = probe(); assumeTrue(encoder.isWorkflowAvailable() && probe.isAvailable());
        Path source = source(), audio = root.resolve("selected.flac"), video = root.resolve("direct.webm");
        var p = plan("{\"operation\":\"join_clips\",\"clips\":[{\"startMs\":2000,\"endMs\":3000},{\"startMs\":0,\"endMs\":1000}]}", "flac");
        encoder.workflow(source, audio, null, probe.inspect(source), p, () -> false);
        assertThat(probe.inspectAudio(audio).durationMs()).isBetween(1950L, 2100L); assertThat(probe.inspectAudio(audio).audioCodec()).isEqualTo("flac");
        encoder.workflow(source, video, null, probe.inspect(source), plan("{\"operation\":\"trim\",\"startMs\":1000,\"endMs\":3000},{\"operation\":\"trim\",\"startMs\":500,\"endMs\":1500},{\"operation\":\"resize\",\"resolutionPreset\":\"custom\",\"width\":160,\"height\":90}", "webm"), () -> false);
        assertThat(probe.inspect(video).durationMs()).isBetween(950L, 1150L); assertThat(probe.inspect(video).videoCodec()).isEqualTo("vp9");
    }

    @Test void nativeCancellationAndCacheBudgetFailuresLeaveNoWorkflowAuxiliaryFiles() throws Exception {
        var encoder = encoder(1); var probe = probe(); assumeTrue(encoder.isWorkflowAvailable() && probe.isAvailable());
        Path source = source(), target = root.resolve("failed.mp4");
        var plan = plan("{\"operation\":\"join_clips\",\"clips\":[{\"startMs\":0,\"endMs\":3000},{\"startMs\":0,\"endMs\":3000}]}", "mp4");
        assertThatThrownBy(() -> encoder.workflow(source, target, null, probe.inspect(source), plan, () -> true)).isInstanceOf(BusinessException.class);
        for (String suffix : LocalMediaStorage.OUTPUT_AUXILIARY_SUFFIXES) assertThat(Files.exists(Path.of(target + suffix))).isFalse();
        assertThatThrownBy(() -> encoder.workflow(source, target, null, probe.inspect(source), plan, () -> false))
                .isInstanceOfSatisfying(BusinessException.class, e -> assertThat(e.code()).isEqualTo(ErrorCode.OUTPUT_TOO_LARGE));
        for (String suffix : LocalMediaStorage.OUTPUT_AUXILIARY_SUFFIXES) assertThat(Files.exists(Path.of(target + suffix))).isFalse();
    }

    @Test void nativeWorkflowPadsShortSourceAudioToTheCurrentVideoTimeline() throws Exception {
        var encoder = encoder(20); var probe = probe(); assumeTrue(encoder.isWorkflowAvailable() && probe.isAvailable());
        Path source = source(1), audio = root.resolve("tail.mp3"), video = root.resolve("tail.mp4");
        String trim = "{\"operation\":\"trim\",\"startMs\":2000,\"endMs\":3000}";
        encoder.workflow(source, audio, null, probe.inspect(source), plan(trim, "mp3"), () -> false);
        assertThat(probe.inspectAudio(audio).durationMs()).isBetween(950L, 1150L);
        encoder.workflow(source, video, null, probe.inspect(source), plan(trim, "mp4"), () -> false);
        assertThat(probe.inspect(video).durationMs()).isBetween(950L, 1150L); assertThat(probe.inspect(video).hasAudio()).isTrue();
    }

    private FfmpegMediaTranscoder encoder(long megabytes) { return new FfmpegMediaTranscoder(new TranscodeProperties("ffmpeg", Duration.ofSeconds(40), Duration.ofMinutes(7), 20, DataSize.ofMegabytes(megabytes), false)); }
    private FfprobeMediaProbe probe() { return new FfprobeMediaProbe(new MediaToolProperties("ffprobe", Duration.ofSeconds(10), Duration.ofMinutes(2), 1000, false), json); }
    private Path source() throws Exception { return source(3); }
    private Path source(int audioSeconds) throws Exception {
        Path path = root.resolve("source.mkv");
        var process = new ProcessBuilder("ffmpeg", "-v", "error", "-f", "lavfi", "-i", "color=c=red:s=640x360:r=30:d=1[r];color=c=blue:s=640x360:r=30:d=1[b];color=c=green:s=640x360:r=30:d=1[g];[r][b][g]concat=n=3:v=1:a=0",
                "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=48000:duration=" + audioSeconds, "-c:v", "libx264", "-c:a", "pcm_s16le", "-y", path.toString()).redirectError(ProcessBuilder.Redirect.DISCARD).start();
        assertThat(process.waitFor(10, TimeUnit.SECONDS)).isTrue(); assertThat(process.exitValue()).isZero(); return path;
    }
    private byte[] pixel(Path path, String time) throws Exception {
        var process = new ProcessBuilder("ffmpeg", "-v", "error", "-ss", time, "-i", path.toString(), "-frames:v", "1", "-vf", "scale=1:1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-").redirectError(ProcessBuilder.Redirect.DISCARD).start();
        byte[] result = process.getInputStream().readNBytes(3); assertThat(process.waitFor(10, TimeUnit.SECONDS)).isTrue(); assertThat(result).hasSize(3); return result;
    }
}
