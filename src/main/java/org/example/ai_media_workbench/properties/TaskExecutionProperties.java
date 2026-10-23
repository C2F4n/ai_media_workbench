package org.example.ai_media_workbench.properties;

import java.time.Duration;
import jakarta.validation.constraints.*;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.util.unit.DataSize;
import org.springframework.validation.annotation.Validated;

/** 仅部署者控制的后台任务并发与资源余量，不接受用户请求覆盖。 */
@Validated
@ConfigurationProperties("app.task-execution")
public record TaskExecutionProperties(@Min(0) @Max(16) @DefaultValue("0") int maxParallel,
        @DefaultValue("true") boolean adaptive,
        @DecimalMin("0.5") @DecimalMax("0.99") @DefaultValue("0.85") double cpuHighWatermark,
        @NotNull @DefaultValue("2GB") DataSize memoryReserve,
        @NotNull @DefaultValue("1GB") DataSize memoryPerTask,
        @NotNull @DefaultValue("3s") Duration startInterval) {
    public int parallelLimit(int processors) {
        return maxParallel==0 ? Math.max(1,Math.min(4,processors/3)) : maxParallel;
    }
    @AssertTrue(message="Memory reserve must be nonnegative, task memory positive and start interval between 1s and 60s")
    public boolean isValidLimits() {
        return memoryReserve!=null && memoryReserve.toBytes()>=0 && memoryPerTask!=null && memoryPerTask.toBytes()>0
                && startInterval!=null && startInterval.compareTo(Duration.ofSeconds(1))>=0 && startInterval.compareTo(Duration.ofSeconds(60))<=0;
    }
}
