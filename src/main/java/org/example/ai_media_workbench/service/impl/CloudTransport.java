package org.example.ai_media_workbench.service.impl;

import java.net.http.*;
import java.nio.ByteBuffer;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.Flow;
import java.util.function.BooleanSupplier;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.stereotype.Component;

/** 外部 I/O 边界：不跟随重定向，限制响应大小，取消和超时终止当前请求，不自动重试付费调用。 */
@Component
public class CloudTransport implements DisposableBean {
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8))
            .followRedirects(HttpClient.Redirect.NEVER).build();
    HttpClient client() { return client; }

    byte[] post(HttpRequest request, long deadline, BooleanSupplier cancelled, ErrorCode failure) {
        return post(request, deadline, cancelled, failure, failure);
    }
    byte[] get(HttpRequest request, long deadline, ErrorCode failure) {
        return post(request, deadline, () -> false, failure);
    }
    byte[] post(HttpRequest request, long deadline, BooleanSupplier cancelled, ErrorCode failure, ErrorCode rejected) {
        var future = client.sendAsync(request, info -> new LimitedBody(4 * 1024 * 1024));
        try {
            var response = await(future, deadline, cancelled, failure);
            if (response.statusCode() != 200) throw new BusinessException(
                    response.statusCode() == 400 || response.statusCode() == 413 ? rejected : failure);
            return response.body();
        } finally { future.cancel(true); }
    }
    static <T> T await(CompletableFuture<T> future, long deadline, BooleanSupplier cancelled, ErrorCode failure) {
        try {
            while (true) {
                check(deadline, cancelled);
                try { return future.get(200, TimeUnit.MILLISECONDS); }
                catch (TimeoutException waiting) { }
            }
        } catch (BusinessException exception) { throw exception; }
        catch (InterruptedException exception) {
            Thread.currentThread().interrupt(); throw new BusinessException(ErrorCode.TASK_INTERRUPTED);
        } catch (Exception exception) { throw new BusinessException(failure); }
        finally { if (!future.isDone()) future.cancel(true); }
    }
    static void check(long deadline, BooleanSupplier cancelled) {
        if (cancelled.getAsBoolean()) throw new BusinessException(ErrorCode.TASK_CANCELLED);
        if (System.nanoTime() >= deadline) throw new BusinessException(ErrorCode.TRANSCODE_TIMEOUT);
    }
    @Override public void destroy() { client.shutdownNow(); }

    private static final class LimitedBody implements HttpResponse.BodySubscriber<byte[]> {
        private final HttpResponse.BodySubscriber<byte[]> delegate = HttpResponse.BodySubscribers.ofByteArray();
        private final long limit;
        private Flow.Subscription subscription;
        private long count;
        LimitedBody(long limit) { this.limit=limit; }
        @Override public CompletionStage<byte[]> getBody() { return delegate.getBody(); }
        @Override public void onSubscribe(Flow.Subscription value) { subscription=value; delegate.onSubscribe(value); }
        @Override public void onNext(List<ByteBuffer> buffers) {
            for (var buffer:buffers) count += buffer.remaining();
            if (count > limit) { subscription.cancel(); delegate.onError(new IllegalStateException("Cloud response limit")); }
            else delegate.onNext(buffers);
        }
        @Override public void onError(Throwable error) { delegate.onError(error); }
        @Override public void onComplete() { delegate.onComplete(); }
    }
}
