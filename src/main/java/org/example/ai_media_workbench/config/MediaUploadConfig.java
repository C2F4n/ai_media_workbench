package org.example.ai_media_workbench.config;

import jakarta.servlet.MultipartConfigElement;
import org.example.ai_media_workbench.properties.MediaProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MediaUploadConfig {
    @Bean
    MultipartConfigElement multipartConfigElement(MediaProperties media) {
        long fileLimit=media.maxUploadSize().toBytes();
        // multipart 还有 boundary 和表单头，不能让“文件大小刚好合规”的请求被请求体上限拒绝。
        return new MultipartConfigElement("",fileLimit,Math.addExact(fileLimit,1024L*1024),0);
    }
}
