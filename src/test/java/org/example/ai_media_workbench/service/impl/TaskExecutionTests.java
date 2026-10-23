package org.example.ai_media_workbench.service.impl;

import java.time.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import org.example.ai_media_workbench.properties.*;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.util.unit.DataSize;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class TaskExecutionTests {
    private static final long GIB=1024L*1024*1024;
    private TaskExecutionProperties config(int maximum,boolean adaptive) {
        return new TaskExecutionProperties(maximum,adaptive,0.85,DataSize.ofGigabytes(2),DataSize.ofGigabytes(1),Duration.ofSeconds(3));
    }
    private TranscodeProperties transcode(boolean enabled) {
        return new TranscodeProperties("ffmpeg",Duration.ofMinutes(5),Duration.ofMinutes(7),20,DataSize.ofGigabytes(3),enabled);
    }
    @Test void autoLimitIsBoundedAndHealthySamplesRampWithoutFlapping() {
        var automatic=config(0,true);
        assertThat(automatic.parallelLimit(1)).isEqualTo(1); assertThat(automatic.parallelLimit(6)).isEqualTo(2);
        assertThat(automatic.parallelLimit(16)).isEqualTo(4); assertThat(automatic.parallelLimit(128)).isEqualTo(4);
        var policy=new TaskLoadPolicy(config(3,true),16); var healthy=new HostResourceMonitor.Snapshot(0.2,10*GIB);
        assertThat(policy.evaluate(healthy).parallelLimit()).isEqualTo(1);
        assertThat(policy.evaluate(healthy).parallelLimit()).isEqualTo(1);
        assertThat(policy.evaluate(new HostResourceMonitor.Snapshot(0.7,10*GIB)).parallelLimit()).isEqualTo(1);
        for(int i=0;i<2;i++) assertThat(policy.evaluate(healthy).parallelLimit()).isEqualTo(1);
        assertThat(policy.evaluate(healthy).parallelLimit()).isEqualTo(2);
        for(int i=0;i<20;i++) assertThat(policy.evaluate(healthy).parallelLimit()).isLessThanOrEqualTo(3);
        assertThat(policy.evaluate(healthy).parallelLimit()).isEqualTo(3);
        var hot=policy.evaluate(new HostResourceMonitor.Snapshot(0.85,10*GIB));
        assertThat(hot.paused()).isTrue(); assertThat(hot.parallelLimit()).isEqualTo(2); assertThat(hot.reason()).isEqualTo("CPU_BUSY");
        var scarce=policy.evaluate(new HostResourceMonitor.Snapshot(0.1,3*GIB-1));
        assertThat(scarce.paused()).isTrue(); assertThat(scarce.reason()).isEqualTo("LOW_MEMORY");
        assertThat(policy.evaluate(new HostResourceMonitor.Snapshot(0.1,3*GIB)).paused()).isFalse();
    }
    @Test void unavailableMetricsFallBackToOneButKnownPressureStillStopsAdmission() {
        var policy=new TaskLoadPolicy(config(4,false),16);
        assertThat(policy.evaluate(new HostResourceMonitor.Snapshot(0.1,10*GIB)).parallelLimit()).isEqualTo(4);
        for(var unknown:java.util.List.of(new HostResourceMonitor.Snapshot(-1,10*GIB),new HostResourceMonitor.Snapshot(Double.NaN,10*GIB),
                new HostResourceMonitor.Snapshot(0.1,-1),new HostResourceMonitor.Snapshot(2,10*GIB))) {
            var decision=policy.evaluate(unknown); assertThat(decision.parallelLimit()).isEqualTo(1);
            assertThat(decision.reason()).isEqualTo("METRICS_UNAVAILABLE"); assertThat(decision.paused()).isFalse();
        }
        assertThat(policy.evaluate(new HostResourceMonitor.Snapshot(0.9,-1)).paused()).isTrue();
        assertThat(policy.evaluate(new HostResourceMonitor.Snapshot(-1,GIB)).paused()).isTrue();
    }
    @Test void dispatcherCapsConcurrentTasksSpacesStartsAndKeepsRecoveryActiveUnderPressure() throws Exception {
        var worker=mock(TranscodeWorker.class); var monitor=mock(HostResourceMonitor.class); var clock=new MutableClock();
        when(monitor.sample()).thenReturn(new HostResourceMonitor.Snapshot(0.1,10*GIB));
        var entered=new CountDownLatch(2); var first=new CountDownLatch(1); var release=new CountDownLatch(1); var starts=new AtomicInteger();
        when(worker.runOne()).thenAnswer(call->{ starts.incrementAndGet(); first.countDown(); entered.countDown(); release.await(5,TimeUnit.SECONDS); return true; });
        var dispatcher=new MediaTaskDispatcher(worker,transcode(true),config(2,false),monitor,clock);
        try {
            dispatcher.scheduledRun(); assertThat(first.await(2,TimeUnit.SECONDS)).isTrue();
            dispatcher.scheduledRun(); assertThat(starts.get()).isEqualTo(1);
            clock.advance(3); dispatcher.scheduledRun(); assertThat(entered.await(2,TimeUnit.SECONDS)).isTrue();
            for(int i=0;i<5;i++) { clock.advance(3); dispatcher.scheduledRun(); }
            assertThat(dispatcher.activeTasks()).isEqualTo(2); assertThat(starts.get()).isEqualTo(2);
            when(monitor.sample()).thenReturn(new HostResourceMonitor.Snapshot(0.99,10*GIB));
            dispatcher.scheduledRun(); assertThat(dispatcher.activeTasks()).isEqualTo(2);
            verify(worker,times(9)).recoverExpired();
        } finally { release.countDown(); dispatcher.stop(); }
        assertThat(dispatcher.activeTasks()).isZero();
    }
    @Test void pressureDoesNotClaimWorkAndRejectedSubmissionReleasesTheSlot() {
        var worker=mock(TranscodeWorker.class); var monitor=mock(HostResourceMonitor.class); var clock=new MutableClock();
        when(monitor.sample()).thenReturn(new HostResourceMonitor.Snapshot(0.9,10*GIB));
        var dispatcher=new MediaTaskDispatcher(worker,transcode(true),config(2,false),monitor,clock);
        try {
            dispatcher.scheduledRun(); verify(worker).recoverExpired(); verify(worker,never()).runOne();
            when(monitor.sample()).thenReturn(new HostResourceMonitor.Snapshot(0.1,10*GIB));
            ((ThreadPoolExecutor)ReflectionTestUtils.getField(dispatcher,"executor")).shutdownNow();
            dispatcher.scheduledRun(); assertThat(dispatcher.activeTasks()).isZero(); verify(worker,never()).runOne();
        } finally { dispatcher.stop(); }
    }
    @Test void shutdownInterruptsWorkersAndDisabledSchedulerNeverTouchesTheQueue() throws Exception {
        var worker=mock(TranscodeWorker.class); var monitor=mock(HostResourceMonitor.class); var clock=new MutableClock();
        when(monitor.sample()).thenReturn(new HostResourceMonitor.Snapshot(0.1,10*GIB));
        var entered=new CountDownLatch(1); var interrupted=new CountDownLatch(1);
        when(worker.runOne()).thenAnswer(call->{
            entered.countDown(); try { new CountDownLatch(1).await(); }
            catch(InterruptedException stopped) { interrupted.countDown(); Thread.currentThread().interrupt(); }
            return false;
        });
        var dispatcher=new MediaTaskDispatcher(worker,transcode(true),config(2,false),monitor,clock);
        try {
            dispatcher.scheduledRun(); assertThat(entered.await(2,TimeUnit.SECONDS)).isTrue();
        } finally { dispatcher.stop(); }
        assertThat(interrupted.getCount()).isZero(); assertThat(dispatcher.activeTasks()).isZero();
        clearInvocations(worker,monitor); dispatcher.scheduledRun(); verifyNoInteractions(worker,monitor);
        var disabled=new MediaTaskDispatcher(worker,transcode(false),config(2,false),monitor,clock);
        try { disabled.scheduledRun(); verifyNoInteractions(worker,monitor); } finally { disabled.stop(); }
    }
    private static class MutableClock extends Clock {
        private Instant time=Instant.parse("2026-10-23T00:00:00Z");
        public ZoneId getZone() { return ZoneOffset.UTC; }
        public Clock withZone(ZoneId zone) { return this; }
        public Instant instant() { return time; }
        void advance(int seconds) { time=time.plusSeconds(seconds); }
    }
}
