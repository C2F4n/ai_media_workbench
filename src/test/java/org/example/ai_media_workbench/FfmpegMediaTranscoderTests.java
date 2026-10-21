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
import org.example.ai_media_workbench.dto.processing.OperationParameters;
import org.example.ai_media_workbench.dto.processing.ExtractAudioParameters;
import org.example.ai_media_workbench.dto.processing.TrimParameters;
import org.example.ai_media_workbench.dto.processing.MuteParameters;
import org.example.ai_media_workbench.dto.processing.BurnSubtitleParameters;
import org.example.ai_media_workbench.dto.processing.JoinClipsParameters;
import org.example.ai_media_workbench.dto.processing.JoinClipsParameters.ClipRange;
import org.example.ai_media_workbench.dto.transcript.TranscriptSegment;
import org.example.ai_media_workbench.service.impl.AssSubtitles;
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

    @Test void nativeSubtitleBurnChangesOnlyFramesWithinTheSavedTimelineAndKeepsAudioAndSource() throws Exception {
        var probe=new FfprobeMediaProbe(new MediaToolProperties("ffprobe",Duration.ofSeconds(10),Duration.ofMinutes(2),1000,false),new ObjectMapper());
        assumeTrue(probe.isAvailable());
        var converter=new FfmpegMediaTranscoder(properties(Duration.ofSeconds(20))); assertThat(converter.isSubtitleBurnAvailable()).isTrue();
        Path directory=Files.createDirectories(root.resolve("字幕 路径's,[test]"));
        Path source=directory.resolve("source.mp4"),output=directory.resolve("burned.mp4"),ass=directory.resolve("burned.mp4.ass");
        run("ffmpeg","-v","error","-f","lavfi","-i","color=c=black:s=640x360:r=20:d=3",
                "-f","lavfi","-i","sine=frequency=440:sample_rate=48000:duration=3","-c:v","libx264","-c:a","aac","-pix_fmt","yuv420p","-y",source.toString());
        byte[] original=Files.readAllBytes(source);
        var segment=new TranscriptSegment(java.util.UUID.randomUUID(),1000L,2000L,"中文测试 {\\alpha&HFF&}可见字幕\\N原文\n第二行");
        Files.writeString(ass,AssSubtitles.render(List.of(segment),640,360),StandardCharsets.UTF_8);
        var parameters=new BurnSubtitleParameters("burn_subtitles","mp4",java.util.UUID.randomUUID(),1,"source","keep");
        converter.burnSubtitles(source,output,probe.inspect(source),parameters,ass,()->false);
        var actual=probe.inspect(output); assertThat(actual.videoCodec()).isEqualTo("h264"); assertThat(actual.audioCodec()).isEqualTo("aac");
        assertThat(actual.width()).isEqualTo(640); assertThat(actual.height()).isEqualTo(360);
        assertThat(Math.abs(actual.durationMs()-3000)).isLessThanOrEqualTo(250);
        assertThat(brightPixels(output,0.5)).isZero(); assertThat(brightPixels(output,1.5)).isGreaterThan(100);
        assertThat(brightPixels(output,2.5)).isZero(); assertThat(Files.readAllBytes(source)).isEqualTo(original);
        var json=new ObjectMapper(); assertThat(json.readValue(json.writeValueAsString(parameters),OperationParameters.class)).isEqualTo(parameters);
        assertThat(json.readTree(json.writeValueAsString(parameters)).size()).isEqualTo(6);
        assertThatThrownBy(()->converter.burnSubtitles(source,output,actual,parameters,ass,()->true))
                .isInstanceOfSatisfying(BusinessException.class,error->assertThat(error.code()).isEqualTo(ErrorCode.TASK_CANCELLED));
    }

    @Test void subtitleSerializationPreservesPlainTextAndEscapesOverrideTagsAndControls() {
        var segment=new TranscriptSegment(java.util.UUID.randomUUID(),101L,109L,"{\\p1}\\N<b>文字</b>\n下一行\t尾部");
        var ass=AssSubtitles.render(List.of(segment),640,360);
        assertThat(ass).contains("0:00:00.10,0:00:00.11","\\{\\\u2060p1}\\\u2060N<b>文字</b>\\N下一行    尾部");
        assertThat(ass.lines().filter(line->line.startsWith("Dialogue:")).count()).isEqualTo(1);
    }

    private long brightPixels(Path video,double seconds) throws Exception {
        Path image=root.resolve("frame-"+seconds+".png");
        run("ffmpeg","-v","error","-ss",Double.toString(seconds),"-i",video.toString(),"-frames:v","1","-y",image.toString());
        var pixels=javax.imageio.ImageIO.read(image.toFile()); long bright=0;
        for(int y=0;y<pixels.getHeight();y++) for(int x=0;x<pixels.getWidth();x++) if((pixels.getRGB(x,y)&255)>100) bright++;
        return bright;
    }

    @Test void nativeClipJoinPreservesReversedRepeatedOrderAndPadsShortAudioWithoutInventingSilentSourceAudio() throws Exception {
        var probe=new FfprobeMediaProbe(new MediaToolProperties("ffprobe",Duration.ofSeconds(10),Duration.ofMinutes(2),1000,false),new ObjectMapper());
        assumeTrue(probe.isAvailable()); var converter=new FfmpegMediaTranscoder(properties(Duration.ofSeconds(20)));
        Path directory=Files.createDirectories(root.resolve("拼接 路径's,[test]")),source=directory.resolve("source.mp4"),silent=directory.resolve("silent.mp4");
        run("ffmpeg","-v","error","-f","lavfi","-i","color=c=red:s=160x90:r=30:d=1[r];color=c=lime:s=160x90:r=30:d=1[g];color=c=blue:s=160x90:r=30:d=1[b];[r][g][b]concat=n=3:v=1:a=0",
                "-f","lavfi","-i","sine=frequency=440:sample_rate=48000:duration=0.8","-c:v","libx264","-c:a","aac","-pix_fmt","yuv420p","-y",source.toString());
        run("ffmpeg","-v","error","-i",source.toString(),"-an","-c:v","copy","-y",silent.toString());
        var parameters=new JoinClipsParameters("join_clips","mp4",List.of(new ClipRange(2000,3000),new ClipRange(0,1000),new ClipRange(2000,3000)),"keep");
        for(Path input:List.of(source,silent)) {
            byte[] original=Files.readAllBytes(input); Path output=directory.resolve(input.getFileName()+"-joined.mp4");
            converter.convert(input,output,probe.inspect(input),parameters,()->false);
            var actual=probe.inspect(output); assertThat(actual.videoCodec()).isEqualTo("h264");
            assertThat(actual.durationMs()).isBetween(2750L,3250L); assertThat(actual.hasAudio()).isEqualTo(input.equals(source));
            for(double seconds:new double[]{0.5,1.5,2.5}) {
                Path image=root.resolve("join-frame-"+seconds+".png"); run("ffmpeg","-v","error","-ss",Double.toString(seconds),"-i",output.toString(),"-frames:v","1","-y",image.toString());
                int pixel=javax.imageio.ImageIO.read(image.toFile()).getRGB(80,45);
                assertThat(seconds==1.5 ? (pixel>>16)&255 : pixel&255).isGreaterThan(150);
            }
            if(actual.hasAudio()) {
                assertThat(probe.inspectAudio(output).durationMs()).isBetween(2750L,3250L);
                assertThat(audioRms(output,0.2)).isLessThan(0.005); assertThat(audioRms(output,1.2)).isGreaterThan(0.01);
                assertThat(audioRms(output,2.2)).isLessThan(0.005);
            }
            assertThat(Files.readAllBytes(input)).isEqualTo(original);
            for(String suffix:org.example.ai_media_workbench.common.storage.LocalMediaStorage.JOIN_SUFFIXES) Files.deleteIfExists(Path.of(output+suffix));
        }
        var json=new ObjectMapper(); assertThat(json.readValue(json.writeValueAsString(parameters),OperationParameters.class)).isEqualTo(parameters);
        assertThat(json.readTree(json.writeValueAsString(parameters)).size()).isEqualTo(4);
    }

    private double audioRms(Path input,double start) throws Exception {
        Path raw=root.resolve("join-audio-"+start+".raw");
        run("ffmpeg","-v","error","-ss",Double.toString(start),"-i",input.toString(),"-t","0.2","-vn","-ac","1","-ar","48000","-f","f32le","-y",raw.toString());
        var samples=java.nio.ByteBuffer.wrap(Files.readAllBytes(raw)).order(java.nio.ByteOrder.LITTLE_ENDIAN); double sum=0; int count=0;
        while(samples.hasRemaining()) { double sample=samples.getFloat(); sum+=sample*sample; count++; }
        return Math.sqrt(sum/count);
    }

    @Test void nativeSpeechPreparationProducesMono16kMp3AndKeepsTheSource() throws Exception {
        var probe=new FfprobeMediaProbe(new MediaToolProperties("ffprobe",Duration.ofSeconds(10),Duration.ofMinutes(2),1000,false),new ObjectMapper());
        assumeTrue(probe.isAvailable());
        Path source=root.resolve("speech.mkv"),audio=root.resolve("speech.mp3");
        run("ffmpeg","-v","error","-f","lavfi","-i","color=c=blue:s=160x90:r=10:d=1",
                "-f","lavfi","-i","sine=frequency=440:sample_rate=48000:duration=2","-c:v","mpeg4","-c:a","pcm_s16le","-ac","2","-y",source.toString());
        byte[] before=Files.readAllBytes(source);
        var converter=new FfmpegMediaTranscoder(properties(Duration.ofSeconds(10)));
        converter.prepareSpeechAudio(source,audio,new MediaMetadataVO("matroska",1000,null,null,null,true,"pcm_s16le"),()->false);
        var detected=probe.inspectAudio(audio); assertThat(detected.audioCodec()).isEqualTo("mp3"); assertThat(detected.videoCodec()).isNull();
        assertThat(Math.abs(detected.durationMs()-1000)).isLessThanOrEqualTo(250);
        var process=new ProcessBuilder("ffprobe","-v","error","-select_streams","a:0","-show_entries","stream=sample_rate,channels","-of","json",audio.toString()).start();
        assertThat(process.waitFor(5,TimeUnit.SECONDS)).isTrue();
        var stream=new ObjectMapper().readTree(process.getInputStream().readAllBytes()).path("streams").get(0);
        assertThat(stream.path("sample_rate").asText()).isEqualTo("16000"); assertThat(stream.path("channels").asInt()).isEqualTo(1);
        assertThat(Files.readAllBytes(source)).isEqualTo(before);
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
        var old = json.readValue("{\"operation\":\"transcode\",\"outputFormat\":\"mp4\",\"resolutionPreset\":\"source\",\"audioMode\":\"keep\"}", OperationParameters.class);
        assertThat(old).isInstanceOf(TranscodeParameters.class);
        assertThat(json.readTree(json.writeValueAsString(old)).size()).isEqualTo(4);
        var compression = new CompressionParameters("compress", "mp4", 200_000, "720p", "keep");
        assertThat(json.readValue(json.writeValueAsString(compression), OperationParameters.class)).isEqualTo(compression);
        var audio = new ExtractAudioParameters("extract_audio", "mp3");
        assertThat(json.readValue(json.writeValueAsString(audio), OperationParameters.class)).isEqualTo(audio);
        assertThat(json.readTree(json.writeValueAsString(audio)).size()).isEqualTo(2);
        var trim = new TrimParameters("trim", "mp4", 250, 1250, "keep");
        assertThat(json.readValue(json.writeValueAsString(trim), OperationParameters.class)).isEqualTo(trim);
        assertThat(json.readTree(json.writeValueAsString(trim)).size()).isEqualTo(5);
        var mute = new MuteParameters("mute", "mp4", "source");
        assertThat(json.readValue(json.writeValueAsString(mute), OperationParameters.class)).isEqualTo(mute);
        assertThat(json.readTree(json.writeValueAsString(mute)).size()).isEqualTo(3);
        assertThat(trim.fitsWithin(1250)).isTrue(); assertThat(trim.fitsWithin(1249)).isFalse();
        assertThat(new TrimParameters("trim", "mp4", 0, 499, "keep").fitsWithin(1200)).isFalse();
        assertThat(new TrimParameters("trim", "mp4", 0, 500, "keep").fitsWithin(1200)).isTrue();
        assertThat(new TrimParameters("trim", "mp4", Long.MIN_VALUE, Long.MAX_VALUE, "keep").fitsWithin(1200)).isFalse();
    }

    @Test void nativeMutingRemovesEveryAudioTrackHandlesRotationAndKeepsTheSourceIntact() throws Exception {
        var probe = new FfprobeMediaProbe(new MediaToolProperties("ffprobe", Duration.ofSeconds(10), Duration.ofMinutes(2), 1000, false), new ObjectMapper());
        assumeTrue(probe.isAvailable(), "Install ffprobe for native mute checks");
        Path source = root.resolve("multi-track.mp4"), silent = root.resolve("silent.mp4"), rotated = root.resolve("rotated.mp4");
        try {
            run("ffmpeg", "-v", "error", "-f", "lavfi", "-i", "color=c=red:s=160x90:r=10:d=1",
                    "-f", "lavfi", "-i", "sine=frequency=440:duration=1", "-f", "lavfi", "-i", "sine=frequency=880:duration=1",
                    "-map", "0:v", "-map", "1:a", "-map", "2:a", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-y", source.toString());
        } catch (java.io.IOException missing) { assumeTrue(false, "Install ffmpeg for native mute checks"); return; }
        run("ffmpeg", "-v", "error", "-i", source.toString(), "-an", "-c:v", "copy", "-y", silent.toString());
        run("ffmpeg", "-v", "error", "-display_rotation", "90", "-i", source.toString(), "-map", "0", "-c", "copy", "-y", rotated.toString());
        var converter = new FfmpegMediaTranscoder(properties(Duration.ofSeconds(20)));
        for (Path input : List.of(source, silent, rotated)) {
            byte[] original = Files.readAllBytes(input);
            var before = probe.inspect(input);
            for (String resolution : List.of("source", "720p")) {
                Path output = root.resolve(resolution + "-muted-" + input.getFileName());
                converter.convert(input, output, before, new MuteParameters("mute", "mp4", resolution), () -> false);
                var after = probe.inspect(output);
                assertThat(after.hasAudio()).isFalse(); assertThat(after.audioCodec()).isNull();
                assertThat(after.videoCodec()).isEqualTo("h264");
                assertThat(after.width()).isEqualTo(before.width()); assertThat(after.height()).isEqualTo(before.height());
                assertThat(Math.abs(after.durationMs() - before.durationMs())).isLessThanOrEqualTo(250);
                Path pixel = root.resolve(resolution + input.getFileName() + ".rgb");
                run("ffmpeg", "-v", "error", "-i", output.toString(), "-frames:v", "1", "-vf", "scale=1:1", "-pix_fmt", "rgb24", "-f", "rawvideo", "-y", pixel.toString());
                assertThat(Byte.toUnsignedInt(Files.readAllBytes(pixel)[0])).isGreaterThan(200);
            }
            assertThat(Files.readAllBytes(input)).isEqualTo(original);
        }
    }

    @Test void nativeTrimmingUsesTheSelectedFramesAndKeepsAvailableAudioWithoutChangingTheSource() throws Exception {
        var probe = new FfprobeMediaProbe(new MediaToolProperties("ffprobe", Duration.ofSeconds(10), Duration.ofMinutes(2), 1000, false), new ObjectMapper());
        assumeTrue(probe.isAvailable(), "Install ffprobe for native trim checks");
        Path source=root.resolve("colors.mp4"),silent=root.resolve("silent.mp4"),rotated=root.resolve("rotated.mp4"),shortAudio=root.resolve("short-audio.mp4");
        try {
            run("ffmpeg","-v","error","-f","lavfi","-i","color=c=blue:s=160x90:r=10:d=1",
                    "-f","lavfi","-i","color=c=red:s=160x90:r=10:d=2","-f","lavfi","-i","sine=frequency=440:duration=3",
                    "-filter_complex","[0:v][1:v]concat=n=2:v=1:a=0[v]","-map","[v]","-map","2:a",
                    "-c:v","libx264","-g","30","-pix_fmt","yuv420p","-c:a","aac","-y",source.toString());
        } catch(java.io.IOException missing) { assumeTrue(false,"Install ffmpeg for native trim checks"); return; }
        run("ffmpeg","-v","error","-i",source.toString(),"-an","-c:v","copy","-y",silent.toString());
        run("ffmpeg","-v","error","-display_rotation","90","-i",source.toString(),"-c","copy","-y",rotated.toString());
        run("ffmpeg","-v","error","-f","lavfi","-i","color=c=red:s=160x90:r=10:d=3",
                "-f","lavfi","-i","sine=frequency=440:duration=0.6","-c:v","libx264","-pix_fmt","yuv420p","-c:a","aac","-y",shortAudio.toString());
        var converter=new FfmpegMediaTranscoder(properties(Duration.ofSeconds(20)));
        var trim=new TrimParameters("trim","mp4",1250,2250,"keep");
        for(Path input:List.of(source,silent,rotated,shortAudio)) {
            byte[] original=Files.readAllBytes(input);
            var before=probe.inspect(input); Path output=root.resolve("trimmed-"+input.getFileName());
            converter.convert(input,output,before,trim,()->false);
            var after=probe.inspect(output);
            assertThat(after.durationMs()).isBetween(750L,1250L); assertThat(after.videoCodec()).isEqualTo("h264");
            assertThat(after.width()).isEqualTo(before.width()); assertThat(after.height()).isEqualTo(before.height());
            assertThat(after.hasAudio()).isEqualTo(input.equals(source)||input.equals(rotated));
            if(after.hasAudio()) assertThat(after.audioCodec()).isEqualTo("aac");
            Path pixel=root.resolve(input.getFileName()+".rgb");
            run("ffmpeg","-v","error","-i",output.toString(),"-frames:v","1","-vf","scale=1:1","-pix_fmt","rgb24","-f","rawvideo","-y",pixel.toString());
            byte[] rgb=Files.readAllBytes(pixel); assertThat(rgb).hasSize(3);
            assertThat(Byte.toUnsignedInt(rgb[0])).isGreaterThan(200); assertThat(Byte.toUnsignedInt(rgb[2])).isLessThan(60);
            assertThat(Files.readAllBytes(input)).isEqualTo(original);
        }
    }

    @Test void trimUsesBoundedOutputSideSeekAndCanBeCancelled() throws Exception {
        Process available=mock(Process.class),stalled=mock(Process.class);
        when(available.getInputStream()).thenReturn(new ByteArrayInputStream(" V libx264 encoder\n A aac encoder\n".getBytes(StandardCharsets.UTF_8)));
        when(available.waitFor(4,TimeUnit.SECONDS)).thenReturn(true); when(available.exitValue()).thenReturn(0);
        when(stalled.waitFor(anyLong(),any(TimeUnit.class))).thenReturn(false);
        when(stalled.isAlive()).thenReturn(true); when(stalled.descendants()).thenAnswer(call->Stream.empty());
        try(var builders=mockConstruction(ProcessBuilder.class,(builder,context)->{
            when(builder.redirectOutput(any(ProcessBuilder.Redirect.class))).thenReturn(builder);
            when(builder.redirectError(any(ProcessBuilder.Redirect.class))).thenReturn(builder);
            when(builder.start()).thenReturn(context.getCount()==1?available:stalled);
            if(context.getCount()==2) {
                @SuppressWarnings("unchecked") var command=(List<String>)context.arguments().getFirst();
                assertThat(command).containsSubsequence("-ss","1.250","-t","1.000");
                assertThat(command.indexOf("-ss")).isGreaterThan(command.indexOf("-i"));
                assertThat(command).contains("libx264","aac","-nostdin").doesNotContain("copy");
            }
        })) {
            var converter=new FfmpegMediaTranscoder(properties(Duration.ofSeconds(10))); AtomicInteger polls=new AtomicInteger();
            assertThatThrownBy(()->converter.convert(root.resolve("source.bin"),root.resolve("trim.mp4"),
                    new MediaMetadataVO("mov",3000,160,90,"h264",false,null),new TrimParameters("trim","mp4",1250,2250,"keep"),()->polls.getAndIncrement()>0))
                    .isInstanceOfSatisfying(BusinessException.class,error->assertThat(error.code()).isEqualTo(ErrorCode.TASK_CANCELLED));
            verify(stalled,atLeastOnce()).destroyForcibly();
        }
    }

    @Test void nativeAudioExtractionUsesTheFirstTrackWithoutVideoAndChecksItsOwnDuration() throws Exception {
        var probe = new FfprobeMediaProbe(new MediaToolProperties("ffprobe", Duration.ofSeconds(10), Duration.ofMinutes(2), 1000, false), new ObjectMapper());
        assumeTrue(probe.isAvailable(), "Install ffprobe for native audio checks");
        Path source = root.resolve("two-audio-tracks.mkv"), output = root.resolve("audio.mp3");
        try {
            run("ffmpeg", "-v", "error", "-f", "lavfi", "-i", "color=c=blue:s=160x90:r=10:d=2",
                    "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=48000:duration=0.8",
                    "-f", "lavfi", "-i", "sine=frequency=880:sample_rate=48000:duration=1.5",
                    "-map", "0:v", "-map", "1:a", "-map", "2:a", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", "-y", source.toString());
        } catch (java.io.IOException missing) { assumeTrue(false, "Install ffmpeg for native audio checks"); return; }
        assertThat(probe.inspect(source).durationMs()).isBetween(1900L, 2100L);
        var firstTrack = probe.inspectAudio(source);
        assertThat(firstTrack.durationMs()).isBetween(750L, 900L);
        var converter = new FfmpegMediaTranscoder(properties(Duration.ofSeconds(20)));
        assertThat(converter.isAudioExtractionAvailable()).isTrue();
        long original = Files.size(source);
        converter.convert(source, output, firstTrack, new ExtractAudioParameters("extract_audio", "mp3"), () -> false);
        var result = probe.inspectAudio(output);
        assertThat(result.container()).isEqualTo("mp3"); assertThat(result.audioCodec()).isEqualTo("mp3");
        assertThat(result.videoCodec()).isNull(); assertThat(result.width()).isNull(); assertThat(result.height()).isNull();
        assertThat(result.durationMs()).isBetween(750L, 1100L);
        assertThat(Files.size(output)).isPositive(); assertThat(Files.size(source)).isEqualTo(original);
        assertThatThrownBy(() -> probe.inspect(output)).isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> probe.inspectAudio(Files.writeString(root.resolve("broken.mp3"), "not audio")))
                .isInstanceOf(BusinessException.class);
    }

    @Test void audioOnlyEncoderAvailabilityAndCancellationDoNotDependOnVideoCodecs() throws Exception {
        Process available = mock(Process.class), stalled = mock(Process.class);
        when(available.getInputStream()).thenReturn(new ByteArrayInputStream(" A libmp3lame encoder\n".getBytes(StandardCharsets.UTF_8)));
        when(available.waitFor(4, TimeUnit.SECONDS)).thenReturn(true); when(available.exitValue()).thenReturn(0);
        when(stalled.waitFor(anyLong(), any(TimeUnit.class))).thenReturn(false);
        when(stalled.isAlive()).thenReturn(true); when(stalled.descendants()).thenAnswer(call -> Stream.empty());
        try (var builders = mockConstruction(ProcessBuilder.class, (builder, context) -> {
            when(builder.redirectOutput(any(ProcessBuilder.Redirect.class))).thenReturn(builder);
            when(builder.redirectError(any(ProcessBuilder.Redirect.class))).thenReturn(builder);
            when(builder.start()).thenReturn(context.getCount() == 1 ? available : stalled);
            if (context.getCount() == 2) {
                @SuppressWarnings("unchecked") var command = (List<String>) context.arguments().getFirst();
                assertThat(command.getFirst()).isEqualTo("ffmpeg");
                assertThat(command).containsSubsequence("-map", "0:a:0").contains("-vn", "libmp3lame");
            }
        })) {
            var converter = new FfmpegMediaTranscoder(properties(Duration.ofSeconds(10)));
            assertThat(converter.isAvailable()).isFalse(); assertThat(converter.isAudioExtractionAvailable()).isTrue();
            AtomicInteger polls = new AtomicInteger();
            var audio = new MediaMetadataVO("mov", 800, null, null, null, true, "aac");
            assertThatThrownBy(() -> converter.convert(root.resolve("source.bin"), root.resolve("audio.mp3"), audio,
                    new ExtractAudioParameters("extract_audio", "mp3"), () -> polls.getAndIncrement() > 0))
                    .isInstanceOfSatisfying(BusinessException.class, error -> assertThat(error.code()).isEqualTo(ErrorCode.TASK_CANCELLED));
            verify(stalled, atLeastOnce()).destroyForcibly();
        }
    }

    @Test void timedOutAndCancelledChildrenAreDestroyedWithoutInvokingAShell() throws Exception {
        for (ErrorCode expected : new ErrorCode[]{ErrorCode.TRANSCODE_TIMEOUT, ErrorCode.TASK_CANCELLED}) {
            Process available = mock(Process.class), filters=mock(Process.class), stalled = mock(Process.class);
            when(available.getInputStream()).thenReturn(new ByteArrayInputStream(" V libx264 encoder\n A aac encoder\n".getBytes(StandardCharsets.UTF_8)));
            when(available.waitFor(4, TimeUnit.SECONDS)).thenReturn(true); when(available.exitValue()).thenReturn(0);
            when(filters.getInputStream()).thenReturn(new ByteArrayInputStream(" ... ass V->V\n".getBytes(StandardCharsets.UTF_8)));
            when(filters.waitFor(4,TimeUnit.SECONDS)).thenReturn(true); when(filters.exitValue()).thenReturn(0);
            when(stalled.waitFor(anyLong(), any(TimeUnit.class))).thenReturn(false);
            when(stalled.isAlive()).thenReturn(true); when(stalled.descendants()).thenAnswer(call -> Stream.empty());
            Path output = Files.createFile(root.resolve(expected.name() + ".mp4"));
            try (var builders = mockConstruction(ProcessBuilder.class, (builder, context) -> {
                when(builder.redirectOutput(any(ProcessBuilder.Redirect.class))).thenReturn(builder);
                when(builder.redirectError(any(ProcessBuilder.Redirect.class))).thenReturn(builder);
                when(builder.start()).thenReturn(context.getCount() == 1 ? available : context.getCount()==2 ? filters : stalled);
                if (context.getCount() == 3) {
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
