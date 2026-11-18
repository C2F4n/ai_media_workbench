package org.example.ai_media_workbench;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 后端启动入口。Spring Boot 扫描本包及子包，组装 Controller、Service、Mapper 等组件。
 * 配置扫描将 application.properties 绑定到 properties 包；定时调度驱动检测、转码和清理任务。
 */
@SpringBootApplication
@ConfigurationPropertiesScan("org.example.ai_media_workbench.properties")
@EnableScheduling
public class AiMediaWorkbenchApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiMediaWorkbenchApplication.class, args);
    }

}
