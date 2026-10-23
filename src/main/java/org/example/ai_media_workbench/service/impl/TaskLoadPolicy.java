package org.example.ai_media_workbench.service.impl;

import org.example.ai_media_workbench.properties.TaskExecutionProperties;

/** 只控制新任务准入，不打断已运行的任务；升档需要连续健康样本，降档立即生效。 */
final class TaskLoadPolicy {
    private final TaskExecutionProperties properties;
    private final int maximum;
    private int limit=1;
    private int healthySamples;
    TaskLoadPolicy(TaskExecutionProperties properties,int processors) {
        this.properties=properties; maximum=properties.parallelLimit(processors);
    }
    Decision evaluate(HostResourceMonitor.Snapshot sample) {
        boolean cpuKnown=Double.isFinite(sample.cpuLoad()) && sample.cpuLoad()>=0 && sample.cpuLoad()<=1;
        boolean memoryKnown=sample.freeMemoryBytes()>=0;
        if(cpuKnown && sample.cpuLoad()>=properties.cpuHighWatermark()) return pause("CPU_BUSY");
        long reserve=properties.memoryReserve().toBytes();
        if(memoryKnown && (sample.freeMemoryBytes()<reserve || sample.freeMemoryBytes()-reserve<properties.memoryPerTask().toBytes()))
            return pause("LOW_MEMORY");
        if(!cpuKnown || !memoryKnown) {
            limit=1; healthySamples=0; return new Decision(1,false,"METRICS_UNAVAILABLE");
        }
        if(!properties.adaptive()) { limit=maximum; return new Decision(limit,false,"FIXED"); }
        if(sample.cpuLoad()<=properties.cpuHighWatermark()-0.20) {
            if(++healthySamples>=3) { limit=Math.min(maximum,limit+1); healthySamples=0; }
        } else healthySamples=0;
        return new Decision(limit,false,"READY");
    }
    private Decision pause(String reason) {
        healthySamples=0; limit=Math.max(1,limit-1); return new Decision(limit,true,reason);
    }
    record Decision(int parallelLimit,boolean paused,String reason) {}
}
