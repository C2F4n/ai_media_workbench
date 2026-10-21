package org.example.ai_media_workbench.common.storage;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.UUID;
import java.util.List;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.properties.MediaProperties;
import org.example.ai_media_workbench.properties.StorageProperties;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

/** 原文件名仅用于展示；受控目录、大小限制和磁盘路径检查集中在这里。 */
@Component
public class LocalMediaStorage {
    public static final List<String> OUTPUT_FORMATS = List.of("mp4", "mp3", "mkv", "mov", "webm", "m4a", "wav", "flac");
    public static final List<String> ENCODING_LOG_SUFFIXES = List.of(".pass-0.log", ".pass-0.log.mbtree",
            ".pass-0.log.temp", ".pass-0.log.mbtree.temp");
    public static final List<String> JOIN_SUFFIXES = java.util.stream.Stream.concat(
            java.util.stream.IntStream.range(0,20).boxed().flatMap(index -> java.util.stream.Stream.of(".join-"+index+".mp4", ".workflow-"+index+".mkv")),
            java.util.stream.Stream.of(".join.ffconcat", ".workflow.ffconcat")).toList();
    public static final List<String> OUTPUT_AUXILIARY_SUFFIXES = java.util.stream.Stream.concat(
            java.util.stream.Stream.concat(ENCODING_LOG_SUFFIXES.stream(),java.util.stream.Stream.of(".ass")),JOIN_SUFFIXES.stream()).toList();
    private final Path root;
    private final long maxBytes;

    public LocalMediaStorage(StorageProperties storage, MediaProperties media) {
        root = Path.of(storage.root()).toAbsolutePath().normalize();
        maxBytes = media.maxUploadSize().toBytes();
    }

    public StoredFile store(String userId, MultipartFile file) {
        if (file == null || file.isEmpty()) throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
        if (file.getSize() > maxBytes) throw new BusinessException(ErrorCode.FILE_TOO_LARGE);
        UUID.fromString(userId);
        String key = userId + "/" + UUID.randomUUID() + ".bin";
        Path target = null;
        boolean saved = false;
        try {
            Files.createDirectories(root);
            Path realRoot = root.toRealPath();
            Path directory = realRoot.resolve(userId);
            Files.createDirectories(directory);
            if (!directory.toRealPath().startsWith(realRoot)) throw new IOException("Invalid storage directory");
            target = directory.resolve(key.substring(key.indexOf('/') + 1));
            long size = 0;
            try (var input = file.getInputStream();
                 var output = Files.newOutputStream(target, StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE)) {
                byte[] buffer = new byte[64 * 1024];
                int count;
                while ((count = input.read(buffer)) != -1) {
                    size += count;
                    if (size > maxBytes) throw new BusinessException(ErrorCode.FILE_TOO_LARGE);
                    output.write(buffer, 0, count);
                }
            }
            if (size == 0) throw new BusinessException(ErrorCode.INVALID_PARAMETERS);
            saved = true;
            return new StoredFile(key, size);
        } catch (IOException exception) {
            throw new BusinessException(ErrorCode.STORAGE_ERROR);
        } finally {
            // 文件系统不参加数据库事务，写失败只清理由本次生成的路径，不递归删除目录。
            if (!saved && target != null) {
                try { Files.deleteIfExists(target); } catch (IOException ignored) { }
            }
        }
    }

    public Path resolve(String key) throws IOException {
        Path realRoot = root.toRealPath();
        Path relative = Path.of(key);
        Path file = realRoot.resolve(relative).normalize();
        if (relative.isAbsolute() || !file.startsWith(realRoot) || file.equals(realRoot)
                || !file.getParent().toRealPath().startsWith(realRoot)
                || !Files.isRegularFile(file, LinkOption.NOFOLLOW_LINKS)) {
            throw new IOException("Invalid media file");
        }
        return file;
    }

    public void discard(String key) throws IOException { Files.deleteIfExists(resolve(key)); }

    /** 删除受控输出及两遍编码缓存；文件不存在可重试，不递归删除目录。 */
    public void discardOutput(String key) throws IOException {
        if (exists(key)) discard(key);
        discardOutputAuxiliary(key);
    }

    /** 发布前清除字幕/编码辅助文件，失败时由运行租约保留清理线索。 */
    public void discardOutputAuxiliary(String key) throws IOException {
        for (String suffix : OUTPUT_AUXILIARY_SUFFIXES) if (exists(key + suffix)) discard(key + suffix);
    }

    public boolean exists(String key) {
        try { resolve(key); return true; }
        catch (IOException | RuntimeException exception) { return false; }
    }

    public record StoredFile(String key, long sizeBytes) {}

    /** Allocate a private, unique output before launching the tool; no user-supplied paths. */
    public OutputTarget createOutput(String userId, String taskId, String token) throws IOException {
        return createOutput(userId, taskId, token, "mp4");
    }

    public OutputTarget createOutput(String userId, String taskId, String token, String format) throws IOException {
        UUID.fromString(userId); UUID.fromString(taskId); UUID.fromString(token);
        if (!OUTPUT_FORMATS.contains(format)) throw new IOException("Invalid output format");
        Files.createDirectories(root);
        Path realRoot = root.toRealPath();
        Path directory = realRoot.resolve(userId);
        Files.createDirectories(directory);
        if (!directory.toRealPath().startsWith(realRoot)) throw new IOException("Invalid output directory");
        String filename = taskId + "-" + token + "." + format;
        Path path = directory.resolve(filename);
        Files.createFile(path);
        return new OutputTarget(userId + "/" + filename, path);
    }

    public record OutputTarget(String key, Path path) {}
}
