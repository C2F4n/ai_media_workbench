package org.example.ai_media_workbench;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.health.actuate.endpoint.HealthEndpoint;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class AiMediaWorkbenchApplicationTests {
    @Autowired HealthEndpoint health;

    @Test
    void contextLoads() {
    }

    @Test
    void disabledOptionalMailDoesNotMakeTheApplicationUnhealthy() {
        assertThat(health.health().getStatus().getCode()).isEqualTo("UP");
    }

}
