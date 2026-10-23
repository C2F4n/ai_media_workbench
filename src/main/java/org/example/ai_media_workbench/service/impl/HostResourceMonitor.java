package org.example.ai_media_workbench.service.impl;

import java.lang.management.ManagementFactory;
import org.springframework.stereotype.Component;

/** 观察整个操作系统环境，而不只计算Java进程，包含FFmpeg及本地模型的CPU/内存影响。 */
@Component
public class HostResourceMonitor {
    public Snapshot sample() {
        try {
            if(ManagementFactory.getOperatingSystemMXBean() instanceof com.sun.management.OperatingSystemMXBean bean)
                return new Snapshot(bean.getCpuLoad(),bean.getFreeMemorySize());
        } catch(RuntimeException unavailable) { /* 无权限或不支持时由调度策略降为单并发。 */ }
        return new Snapshot(-1,-1);
    }
    public record Snapshot(double cpuLoad,long freeMemoryBytes) {}
}
