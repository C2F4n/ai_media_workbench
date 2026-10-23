package org.example.ai_media_workbench.service.impl;

import jakarta.annotation.PreDestroy;
import java.time.Clock;
import java.time.Instant;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.SynchronousQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.example.ai_media_workbench.properties.TaskExecutionProperties;
import org.example.ai_media_workbench.properties.TranscodeProperties;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** 数据库仍是唯一等待队列；有空闲线程且资源允许时才领取任务，不建立隐藏的内存积压。 */
@Component
public class MediaTaskDispatcher {
    private static final org.slf4j.Logger log=org.slf4j.LoggerFactory.getLogger(MediaTaskDispatcher.class);
    private final TranscodeWorker worker;
    private final TranscodeProperties transcode;
    private final TaskExecutionProperties properties;
    private final HostResourceMonitor monitor;
    private final ThreadPoolExecutor executor;
    private final Clock clock;
    private final TaskLoadPolicy policy;
    private final AtomicInteger active=new AtomicInteger();
    private Instant nextStart=Instant.MIN;
    private TaskLoadPolicy.Decision previous;
    private volatile boolean stopping;
    public MediaTaskDispatcher(TranscodeWorker worker,TranscodeProperties transcode,TaskExecutionProperties properties,
            HostResourceMonitor monitor,Clock clock) {
        this.worker=worker; this.transcode=transcode; this.properties=properties; this.monitor=monitor; this.clock=clock;
        policy=new TaskLoadPolicy(properties,Runtime.getRuntime().availableProcessors());
        int maximum=properties.parallelLimit(Runtime.getRuntime().availableProcessors());
        // 私有线程池不注册为全局Executor Bean，避免替换Spring MVC的下载/异步请求执行器。
        executor=new ThreadPoolExecutor(maximum,maximum,30,TimeUnit.SECONDS,new SynchronousQueue<>(),
                Thread.ofPlatform().name("workbench-media-",0).factory());
        executor.allowCoreThreadTimeOut(true);
    }
    @Scheduled(fixedDelay=1000)
    public synchronized void scheduledRun() {
        if(stopping || !transcode.workerEnabled()) return;
        worker.recoverExpired();
        var decision=policy.evaluate(monitor.sample());
        if(!decision.equals(previous)) {
            log.info("Media task admission: limit={}, paused={}, reason={}",decision.parallelLimit(),decision.paused(),decision.reason());
            previous=decision;
        }
        if(decision.paused() || active.get()>=decision.parallelLimit() || clock.instant().isBefore(nextStart)) return;
        active.incrementAndGet();
        try {
            executor.execute(()->{
                try { if(!stopping && !Thread.currentThread().isInterrupted()) worker.runOne(); }
                catch(RuntimeException failure) { log.warn("Background media task iteration failed; queued work remains recoverable"); }
                finally { active.decrementAndGet(); }
            });
            nextStart=clock.instant().plus(properties.startInterval());
        } catch(RejectedExecutionException rejected) {
            // 拒绝时尚未从数据库领取，不回退到调度线程执行，也不丢失排队任务。
            active.decrementAndGet();
        }
    }
    @PreDestroy public synchronized void stop() {
        stopping=true; executor.shutdownNow();
        try {
            if(!executor.awaitTermination(10,TimeUnit.SECONDS)) log.warn("Media workers did not stop within shutdown grace period; leases remain recoverable");
        } catch(InterruptedException interrupted) { Thread.currentThread().interrupt(); }
    }
    int activeTasks() { return active.get(); }
}
