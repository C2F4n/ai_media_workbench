package org.example.ai_media_workbench;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AiMediaWorkbenchApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiMediaWorkbenchApplication.class, args);
    }

}
