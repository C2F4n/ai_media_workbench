package org.example.ai_media_workbench.service.impl;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.function.BooleanSupplier;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.dto.processing.VideoParameters;
import org.example.ai_media_workbench.dto.processing.CompressionParameters;
import org.example.ai_media_workbench.common.storage.LocalMediaStorage;
import org.example.ai_media_workbench.properties.TranscodeProperties;
import org.example.ai_media_workbench.service.MediaTranscoder;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;
import org.springframework.stereotype.Component;

/** Fixed FFmpeg argument list, bounded runtime/output/threads; never invokes a shell. */
@Component
public class FfmpegMediaTranscoder implements MediaTranscoder {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(FfmpegMediaTranscoder.class);
    private final TranscodeProperties properties;
    private final boolean available;

    public FfmpegMediaTranscoder(TranscodeProperties properties) {
        this.properties = properties;
        this.available = checkAvailable();
    }

    @Override public boolean isAvailable() { return available; }

    @Override
    public void convert(Path source, Path target, MediaMetadataVO metadata, VideoParameters parameters, BooleanSupplier cancelled) {
        if (!available) throw new BusinessException(ErrorCode.TRANSCODE_UNAVAILABLE);
        int[] size = dimensions(metadata, parameters);
        long deadline = System.nanoTime() + properties.timeout().toNanos();
        try {
            var base = List.of(properties.ffmpeg(), "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                    "-protocol_whitelist", "file", "-format_whitelist", "mov,matroska,webm", "-threads", "2", "-i", source.toAbsolutePath().toString(),
                    "-map", "0:v:0", "-map_metadata", "-1", "-sn", "-dn",
                    "-vf", "scale=" + size[0] + ":" + size[1] + ":flags=lanczos,setsar=1",
                    "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p", "-threads", "2", "-filter_threads", "1");
            var command = new ArrayList<>(base);
            long audioBitrate = 128_000;
            if (parameters instanceof CompressionParameters compression) {
                var budget = CompressionBudget.calculate(metadata, compression.targetSizeBytes());
                audioBitrate = 96_000;
                // 两遍编码共享同一时间预算；第一遍仅分析视频，不生成媒体结果。
                command.addAll(List.of("-b:v", Long.toString(budget.videoBitsPerSecond()), "-pass", "1", "-passlogfile",
                        target.toAbsolutePath() + ".pass", "-an", "-f", "null", "-"));
                run(command, target, cancelled, deadline);
                command = new ArrayList<>(base);
                command.addAll(List.of("-b:v", Long.toString(budget.videoBitsPerSecond()), "-pass", "2", "-passlogfile", target.toAbsolutePath() + ".pass"));
            } else command.addAll(List.of("-crf", "23"));
            command.addAll(List.of("-map", "0:a:0?", "-c:a", "aac", "-b:a", Long.toString(audioBitrate),
                    "-movflags", "+faststart", "-fs", Long.toString(Math.addExact(properties.maxOutputSize().toBytes(), 1)),
                    "-f", "mp4", target.toAbsolutePath().toString()));
            run(command, target, cancelled, deadline);
            if (Files.size(target) == 0) throw new BusinessException(ErrorCode.TRANSCODE_FAILED);
        } catch (BusinessException exception) { throw exception; }
        catch (Exception exception) { throw new BusinessException(ErrorCode.TRANSCODE_FAILED); }
        finally {
            for (String suffix : LocalMediaStorage.ENCODING_LOG_SUFFIXES) {
                try { Files.deleteIfExists(Path.of(target.toAbsolutePath() + suffix)); }
                catch (java.io.IOException exception) { log.warn("Encoding cache cleanup failed"); }
            }
        }
    }

    private void run(List<String> command, Path target, BooleanSupplier cancelled, long deadline) {
        Process process = null;
        try {
            if (cancelled.getAsBoolean()) throw new BusinessException(ErrorCode.TASK_CANCELLED);
            process = new ProcessBuilder(command)
                    .redirectOutput(ProcessBuilder.Redirect.DISCARD).redirectError(ProcessBuilder.Redirect.DISCARD).start();
            while (!process.waitFor(300, TimeUnit.MILLISECONDS)) {
                if (cancelled.getAsBoolean()) throw new BusinessException(ErrorCode.TASK_CANCELLED);
                if (System.nanoTime() >= deadline) throw new BusinessException(ErrorCode.TRANSCODE_TIMEOUT);
                checkSize(target);
            }
            if (cancelled.getAsBoolean()) throw new BusinessException(ErrorCode.TASK_CANCELLED);
            if (System.nanoTime() >= deadline) throw new BusinessException(ErrorCode.TRANSCODE_TIMEOUT);
            checkSize(target);
            if (process.exitValue() != 0) throw new BusinessException(ErrorCode.TRANSCODE_FAILED);
        } catch (BusinessException exception) {
            throw exception;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new BusinessException(ErrorCode.TASK_INTERRUPTED);
        } catch (Exception exception) {
            throw new BusinessException(ErrorCode.TRANSCODE_FAILED);
        } finally {
            if (process != null && process.isAlive()) {
                stop(process);
                try { process.waitFor(2, TimeUnit.SECONDS); }
                catch (InterruptedException interrupted) { Thread.currentThread().interrupt(); }
            }
        }
    }

    private void checkSize(Path target) throws java.io.IOException {
        if (Files.exists(target) && Files.size(target) > properties.maxOutputSize().toBytes()) throw new BusinessException(ErrorCode.OUTPUT_TOO_LARGE);
        long logBytes = 0;
        for (String suffix : LocalMediaStorage.ENCODING_LOG_SUFFIXES) {
            try { logBytes += Files.size(Path.of(target.toAbsolutePath() + suffix)); }
            catch (java.nio.file.NoSuchFileException absent) { /* 编码器会在临时日志与最终日志间重命名。 */ }
        }
        if (logBytes > 32L * 1024 * 1024) throw new BusinessException(ErrorCode.OUTPUT_TOO_LARGE);
    }

    public static int[] dimensions(MediaMetadataVO source, VideoParameters parameters) {
        double scale = parameters.resolutionPreset().equals("720p")
                ? Math.min(1d, 720d / Math.min(source.width(), source.height())) : 1d;
        int width = (int) (source.width() * scale) / 2 * 2;
        int height = (int) (source.height() * scale) / 2 * 2;
        if (width < 2 || height < 2) throw new BusinessException(ErrorCode.TRANSCODE_FAILED);
        return new int[]{width, height};
    }

    private boolean checkAvailable() {
        Process process = null;
        var readers = Executors.newVirtualThreadPerTaskExecutor();
        try {
            process = new ProcessBuilder(properties.ffmpeg(), "-hide_banner", "-encoders")
                    .redirectError(ProcessBuilder.Redirect.DISCARD).start();
            Process running = process;
            var result = readers.submit(() -> running.getInputStream().readNBytes(128 * 1024 + 1));
            if (!process.waitFor(4, TimeUnit.SECONDS) || process.exitValue() != 0) return false;
            byte[] bytes = result.get(1, TimeUnit.SECONDS);
            String encoders = new String(bytes, StandardCharsets.UTF_8);
            return bytes.length <= 128 * 1024 && encoders.contains(" libx264 ") && encoders.contains(" aac ");
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt(); return false;
        } catch (Exception exception) { return false; }
        finally {
            if (process != null && process.isAlive()) stop(process);
            readers.shutdownNow();
        }
    }

    private static void stop(Process process) {
        process.descendants().forEach(ProcessHandle::destroyForcibly);
        process.destroyForcibly();
    }
}
