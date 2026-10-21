package org.example.ai_media_workbench.common.web;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.example.ai_media_workbench.common.exception.RangeNotSatisfiableException;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRange;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StreamUtils;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

/** 仅负责已鉴权文件的HTTP流响应；原素材和结果共用单段Range及文件名规则。 */
public final class MediaStreams {
    private MediaStreams() {}

    public static ResponseEntity<StreamingResponseBody> preview(Path path, long size, String type, String filename, String header) {
        List<HttpRange> ranges;
        try { ranges = header == null ? List.of() : HttpRange.parseRanges(header); }
        catch (IllegalArgumentException invalid) { ranges = List.of(); }
        if (ranges.size() != 1) return stream(path, size, type, filename, 0, size - 1, true, false);
        long start = ranges.getFirst().getRangeStart(size), end = ranges.getFirst().getRangeEnd(size);
        if (start >= size || start > end) throw new RangeNotSatisfiableException(size);
        return stream(path, size, type, filename, start, end, true, true);
    }

    public static ResponseEntity<StreamingResponseBody> download(Path path, long size, String type, String filename) {
        return stream(path, size, type, filename, 0, size - 1, false, false);
    }

    private static ResponseEntity<StreamingResponseBody> stream(Path path, long size, String type, String filename,
                                                               long start, long end, boolean inline, boolean partial) {
        StreamingResponseBody body = output -> {
            try (var input = Files.newInputStream(path)) { StreamUtils.copyRange(input, output, start, end); }
        };
        var response = ResponseEntity.status(partial ? 206 : 200)
                .contentType(MediaType.parseMediaType(type)).contentLength(end - start + 1)
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .header(HttpHeaders.CONTENT_DISPOSITION, (inline ? ContentDisposition.inline() : ContentDisposition.attachment())
                        .filename(filename, StandardCharsets.UTF_8).build().toString());
        if (inline) response.header(HttpHeaders.ACCEPT_RANGES, "bytes");
        if (partial) response.header(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + size);
        return response.body(body);
    }
}
