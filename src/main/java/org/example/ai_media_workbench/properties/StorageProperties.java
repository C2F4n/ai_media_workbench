package org.example.ai_media_workbench.properties;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/** 存储根目录；业务只能操作此根目录内受控文件，不接受客户端指定磁盘路径。 */
@Validated
@ConfigurationProperties("app.storage")
public record StorageProperties(@NotBlank String root) {}
