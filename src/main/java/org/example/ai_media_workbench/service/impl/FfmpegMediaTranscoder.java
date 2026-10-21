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
import org.example.ai_media_workbench.dto.processing.OperationParameters;
import org.example.ai_media_workbench.dto.processing.ExtractAudioParameters;
import org.example.ai_media_workbench.dto.processing.CompressionParameters;
import org.example.ai_media_workbench.dto.processing.TrimParameters;
import org.example.ai_media_workbench.dto.processing.MuteParameters;
import org.example.ai_media_workbench.dto.processing.BurnSubtitleParameters;
import org.example.ai_media_workbench.dto.processing.JoinClipsParameters;
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
    private final boolean audioAvailable;
    private final boolean subtitleAvailable;

    public FfmpegMediaTranscoder(TranscodeProperties properties) {
        this.properties = properties;
        String encoders = listing("-encoders");
        this.available = encoders.contains(" libx264 ") && encoders.contains(" aac ");
        this.audioAvailable = encoders.contains(" libmp3lame ");
        this.subtitleAvailable = available && listing("-filters").contains(" ass ");
    }

    @Override public boolean isAvailable() { return available; }
    @Override public boolean isAudioExtractionAvailable() { return audioAvailable; }
    @Override public boolean isSubtitleBurnAvailable() { return subtitleAvailable; }

    @Override public void burnSubtitles(Path source,Path target,MediaMetadataVO metadata,BurnSubtitleParameters parameters,
                                        Path subtitleFile,BooleanSupplier cancelled) {
        if(!subtitleAvailable) throw new BusinessException(ErrorCode.SUBTITLE_BURN_UNAVAILABLE);
        if(!subtitleFile.toAbsolutePath().getParent().equals(target.toAbsolutePath().getParent())
                || !subtitleFile.getFileName().toString().matches("[A-Za-z0-9.-]+\\.ass"))
            throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
        convert(source,target,metadata,parameters,cancelled,subtitleFile);
    }

    /** 云端识别专用：16kHz 单声道 MP3，临时文件不作为用户输出发布。 */
    @Override public void prepareSpeechAudio(Path source, Path target, MediaMetadataVO metadata, BooleanSupplier cancelled) {
        extract(source, target, metadata, cancelled, true);
    }

    @Override
    public void convert(Path source, Path target, MediaMetadataVO metadata, OperationParameters parameters, BooleanSupplier cancelled) {
        if(parameters instanceof BurnSubtitleParameters) throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
        convert(source,target,metadata,parameters,cancelled,null);
    }

    private void convert(Path source,Path target,MediaMetadataVO metadata,OperationParameters parameters,BooleanSupplier cancelled,Path subtitleFile) {
        if(parameters instanceof JoinClipsParameters join) {
            join(source,target,metadata,join,cancelled); return;
        }
        if (parameters instanceof ExtractAudioParameters) {
            extract(source, target, metadata, cancelled, false);
            return;
        }
        if (!available) throw new BusinessException(ErrorCode.TRANSCODE_UNAVAILABLE);
        if (parameters instanceof TrimParameters trim && !trim.fitsWithin(metadata.durationMs()))
            throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
        int[] size = dimensions(metadata, (VideoParameters) parameters);
        long deadline = System.nanoTime() + properties.timeout().toNanos();
        try {
            var base = List.of(properties.ffmpeg(), "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                    "-protocol_whitelist", "file", "-format_whitelist", "mov,matroska,webm", "-threads", "2", "-i", source.toAbsolutePath().toString(),
                    "-map", "0:v:0", "-map_metadata", "-1", "-sn", "-dn",
                    "-vf", "scale=" + size[0] + ":" + size[1] + ":flags=lanczos,setsar=1"
                            + (subtitleFile==null ? "" : ",ass=filename="+subtitleFile.getFileName()),
                    "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p", "-threads", "2", "-filter_threads", "1");
            var command = new ArrayList<>(base);
            // 输出侧 seek 会解码后按时间裁切，不用 stream copy 跳到前一个关键帧。
            if (parameters instanceof TrimParameters trim) command.addAll(List.of("-ss", seconds(trim.startMs()), "-t", seconds(trim.endMs() - trim.startMs())));
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
            if (parameters instanceof MuteParameters) command.add("-an");
            else command.addAll(List.of("-map", "0:a:0?", "-c:a", "aac", "-b:a", Long.toString(audioBitrate)));
            command.addAll(List.of("-movflags", "+faststart", "-fs", Long.toString(Math.addExact(properties.maxOutputSize().toBytes(), 1)),
                    "-f", "mp4", target.toAbsolutePath().toString()));
            run(command, target, cancelled, deadline, subtitleFile==null ? null : subtitleFile.getParent());
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

    private void join(Path source,Path target,MediaMetadataVO metadata,JoinClipsParameters parameters,BooleanSupplier cancelled) {
        if(!available) throw new BusinessException(ErrorCode.TRANSCODE_UNAVAILABLE);
        if(!parameters.fitsWithin(metadata.durationMs()) || !target.getFileName().toString().matches("[A-Za-z0-9._-]+"))
            throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
        int[] size=dimensions(metadata,parameters); long deadline=System.nanoTime()+properties.timeout().toNanos();
        try {
            var manifest=new StringBuilder("ffconcat version 1.0\n");
            for(int index=0;index<parameters.clips().size();index++) {
                var clip=parameters.clips().get(index); String duration=seconds(clip.endMs()-clip.startMs());
                Path part=Path.of(target.toAbsolutePath()+".join-"+index+".mp4"); Files.createFile(part);
                var command=new ArrayList<>(List.of(properties.ffmpeg(),"-hide_banner","-loglevel","error","-nostdin","-y",
                        "-protocol_whitelist","file","-format_whitelist","mov,matroska,webm","-threads","2",
                        "-ss",seconds(clip.startMs()),"-i",source.toAbsolutePath().toString()));
                // 每次只解码一个区间，避免反向/重复选段时split分支积压整段高清帧。
                if(metadata.hasAudio()) command.addAll(List.of("-f","lavfi","-i","anullsrc=r=48000:cl=stereo"));
                command.addAll(List.of("-map","0:v:0","-vf","scale="+size[0]+":"+size[1]+":flags=lanczos,setsar=1,fps=30,tpad=stop_mode=clone:stop_duration="+duration+",trim=duration="+duration+",setpts=PTS-STARTPTS"));
                if(metadata.hasAudio()) command.addAll(List.of("-filter_complex",
                        "[0:a:0]aresample=48000:async=1:first_pts=0[a];[1:a:0][a]amix=inputs=2:duration=first:normalize=0,atrim=duration="+duration+",asetpts=PTS-STARTPTS[outa]",
                        "-map","[outa]","-c:a","aac","-b:a","128k","-ar","48000","-ac","2"));
                else command.add("-an");
                command.addAll(List.of("-map_metadata","-1","-sn","-dn","-c:v","libx264","-preset","veryfast","-crf","23","-pix_fmt","yuv420p",
                        "-threads","2","-filter_threads","1","-filter_complex_threads","1","-t",duration,
                        "-fs",Long.toString(Math.addExact(properties.maxOutputSize().toBytes(),1)),"-f","mp4",part.toString()));
                run(command,part,cancelled,deadline,null,target);
                if(Files.size(part)==0) throw new BusinessException(ErrorCode.CLIP_JOIN_FAILED);
                manifest.append("file '").append(part.getFileName()).append("'\nduration ").append(duration).append('\n');
            }
            Path list=Path.of(target.toAbsolutePath()+".join.ffconcat");
            Files.writeString(list,manifest,StandardCharsets.US_ASCII,java.nio.file.StandardOpenOption.CREATE_NEW);
            var command=new ArrayList<>(List.of(properties.ffmpeg(),"-hide_banner","-loglevel","error","-nostdin","-y",
                    "-protocol_whitelist","file","-format_whitelist","concat,mov","-f","concat","-safe","1","-threads","2","-i",list.getFileName().toString(),
                    "-map","0:v:0","-vf","fps=30,setsar=1","-c:v","libx264","-preset","veryfast","-crf","23","-pix_fmt","yuv420p","-threads","2","-filter_threads","1"));
            if(metadata.hasAudio()) command.addAll(List.of("-map","0:a:0","-af","aresample=48000:async=1:first_pts=0,apad=whole_dur="+seconds(parameters.totalDurationMs()),"-c:a","aac","-b:a","128k","-ar","48000","-ac","2"));
            else command.add("-an");
            command.addAll(List.of("-t",seconds(parameters.totalDurationMs()),"-map_metadata","-1","-sn","-dn","-movflags","+faststart",
                    "-fs",Long.toString(Math.addExact(properties.maxOutputSize().toBytes(),1)),"-f","mp4",target.toAbsolutePath().toString()));
            run(command,target,cancelled,deadline,target.toAbsolutePath().getParent(),target);
        } catch(BusinessException exception) { throw exception; }
        catch(Exception exception) { throw new BusinessException(ErrorCode.CLIP_JOIN_FAILED); }
    }

    private void extract(Path source, Path target, MediaMetadataVO metadata, BooleanSupplier cancelled, boolean speech) {
        if (!audioAvailable) throw new BusinessException(ErrorCode.AUDIO_EXTRACTION_UNAVAILABLE);
        if (!metadata.hasAudio()) throw new BusinessException(ErrorCode.SOURCE_HAS_NO_AUDIO);
        var command=new ArrayList<>(List.of(properties.ffmpeg(), "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                "-protocol_whitelist", "file", "-format_whitelist", "mov,matroska,webm", "-threads", "2", "-i", source.toAbsolutePath().toString(),
                "-map", "0:a:0", "-vn", "-sn", "-dn", "-map_metadata", "-1", "-c:a", "libmp3lame", "-b:a", speech ? "64k" : "192k",
                "-ar", speech ? "16000" : "44100", "-ac", speech ? "1" : "2", "-threads", "2",
                "-fs", Long.toString(Math.addExact(properties.maxOutputSize().toBytes(), 1)), "-f", "mp3", target.toAbsolutePath().toString()));
        if (speech) command.addAll(command.size()-1,List.of("-t",seconds(metadata.durationMs())));
        run(command,target,cancelled,System.nanoTime()+properties.timeout().toNanos());
    }

    private void run(List<String> command, Path target, BooleanSupplier cancelled, long deadline) {
        run(command,target,cancelled,deadline,null);
    }

    private void run(List<String> command,Path target,BooleanSupplier cancelled,long deadline,Path directory) {
        run(command,target,cancelled,deadline,directory,null);
    }

    private void run(List<String> command,Path target,BooleanSupplier cancelled,long deadline,Path directory,Path joinRoot) {
        Process process = null;
        try {
            if (cancelled.getAsBoolean()) throw new BusinessException(ErrorCode.TASK_CANCELLED);
            var builder=new ProcessBuilder(command);
            if(directory!=null) {
                // 过滤器只引用受控文件名，避免Windows盘符、空格、引号进入过滤表达式。
                String binary=command.getFirst();
                if(binary.contains("/") || binary.contains("\\")) builder.command().set(0,Path.of(binary).toAbsolutePath().toString());
                builder.directory(directory.toFile());
            }
            process = builder.redirectOutput(ProcessBuilder.Redirect.DISCARD).redirectError(ProcessBuilder.Redirect.DISCARD).start();
            while (!process.waitFor(300, TimeUnit.MILLISECONDS)) {
                if (cancelled.getAsBoolean()) throw new BusinessException(ErrorCode.TASK_CANCELLED);
                if (System.nanoTime() >= deadline) throw new BusinessException(ErrorCode.TRANSCODE_TIMEOUT);
                checkSize(target);
                if(joinRoot!=null) checkJoinBudget(joinRoot);
            }
            if (cancelled.getAsBoolean()) throw new BusinessException(ErrorCode.TASK_CANCELLED);
            if (System.nanoTime() >= deadline) throw new BusinessException(ErrorCode.TRANSCODE_TIMEOUT);
            checkSize(target);
            if(joinRoot!=null) checkJoinBudget(joinRoot);
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

    private static String seconds(long milliseconds) {
        return java.math.BigDecimal.valueOf(milliseconds, 3).toPlainString();
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

    private void checkJoinBudget(Path target) throws java.io.IOException {
        long total=0;
        for(String suffix:LocalMediaStorage.JOIN_SUFFIXES) {
            Path file=Path.of(target.toAbsolutePath()+suffix);
            if(Files.exists(file)) total=Math.addExact(total,Files.size(file));
            if(total>properties.maxOutputSize().toBytes()) throw new BusinessException(ErrorCode.OUTPUT_TOO_LARGE);
        }
    }

    public static int[] dimensions(MediaMetadataVO source, VideoParameters parameters) {
        double scale = parameters.resolutionPreset().equals("720p")
                ? Math.min(1d, 720d / Math.min(source.width(), source.height())) : 1d;
        int width = (int) (source.width() * scale) / 2 * 2;
        int height = (int) (source.height() * scale) / 2 * 2;
        if (width < 2 || height < 2) throw new BusinessException(ErrorCode.TRANSCODE_FAILED);
        return new int[]{width, height};
    }

    private String listing(String flag) {
        Process process = null;
        var readers = Executors.newVirtualThreadPerTaskExecutor();
        try {
            process = new ProcessBuilder(properties.ffmpeg(), "-hide_banner", flag)
                    .redirectError(ProcessBuilder.Redirect.DISCARD).start();
            Process running = process;
            var result = readers.submit(() -> running.getInputStream().readNBytes(128 * 1024 + 1));
            if (!process.waitFor(4, TimeUnit.SECONDS) || process.exitValue() != 0) return "";
            byte[] bytes = result.get(1, TimeUnit.SECONDS);
            String encoders = new String(bytes, StandardCharsets.UTF_8);
            return bytes.length <= 128 * 1024 ? encoders : "";
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt(); return "";
        } catch (Exception exception) { return ""; }
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
