package org.example.ai_media_workbench;

import java.time.Duration;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.example.ai_media_workbench.properties.AccountCleanupProperties;
import org.example.ai_media_workbench.properties.AuthProperties;
import org.example.ai_media_workbench.properties.MediaProperties;
import org.example.ai_media_workbench.properties.TranscodeProperties;
import org.example.ai_media_workbench.properties.TaskExecutionProperties;
import org.example.ai_media_workbench.properties.TransportProperties;
import org.example.ai_media_workbench.config.MediaUploadConfig;
import org.example.ai_media_workbench.properties.StorageProperties;
import org.example.ai_media_workbench.properties.RegistrationMailProperties;
import org.example.ai_media_workbench.service.impl.SystemServiceImpl;
import org.example.ai_media_workbench.service.RegistrationMailSender;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.test.context.ConfigDataApplicationContextInitializer;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.util.unit.DataSize;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PropertiesBindingTests {
    @TempDir Path directory;
    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(PropertyConfiguration.class, MediaUploadConfig.class);

    @Test
    void defaultsBindFromTheActualApplicationConfiguration() {
        contextRunner.run(context -> {
            assertThat(context).hasNotFailed();
            assertThat(context.getBean(AuthProperties.class).sessionIdleTimeout()).isEqualTo(Duration.ofMinutes(30));
            assertThat(context.getBean(AuthProperties.class).cookieSecure()).isFalse();
            assertThat(context.getBean(TransportProperties.class).requireHttps()).isFalse();
            assertThat(context.getEnvironment().getProperty("server.forward-headers-strategy")).isEqualTo("none");
            assertThat(context.getBean(StorageProperties.class).root()).isEqualTo("./storage");
            assertThat(context.getBean(AccountCleanupProperties.class).intervalMs()).isEqualTo(5000);
            assertThat(context.getBean(MediaProperties.class).maxUploadSize()).isEqualTo(DataSize.ofGigabytes(3));
            assertThat(context.getBean(TranscodeProperties.class).maxOutputSize()).isEqualTo(DataSize.ofGigabytes(3));
            var execution=context.getBean(TaskExecutionProperties.class);
            assertThat(execution.adaptive()).isTrue(); assertThat(execution.maxParallel()).isZero();
            assertThat(execution.memoryReserve()).isEqualTo(DataSize.ofGigabytes(2));
            assertThat(execution.memoryPerTask()).isEqualTo(DataSize.ofGigabytes(1));
            assertThat(execution.cpuHighWatermark()).isEqualTo(0.85); assertThat(execution.startInterval()).isEqualTo(Duration.ofSeconds(3));
            var multipart = context.getBean(jakarta.servlet.MultipartConfigElement.class);
            assertThat(multipart.getMaxFileSize()).isEqualTo(3221225472L).isGreaterThan(Integer.MAX_VALUE);
            assertThat(multipart.getMaxRequestSize()).isEqualTo(3221225472L + 1024 * 1024);
            assertThat(context.getBean(MediaProperties.class).maxDuration()).isEqualTo(Duration.ofMinutes(15));
            assertThat(context.getBean(RegistrationMailProperties.class).enabled()).isFalse();
            assertThat(context.getEnvironment().getProperty("management.health.mail.enabled")).isEqualTo("false");
            assertThat(context.getBean(RegistrationMailProperties.class).codeTtl()).isEqualTo(Duration.ofMinutes(10));
        });
    }

    @Test
    void capabilityLimitsAndServletUploadLimitShareTheSameConfiguration() {
        contextRunner.withPropertyValues("app.media.max-upload-size=16MB", "app.media.max-duration=3m",
                "app.auth.registration-enabled=false", "app.account-cleanup.enabled=false").run(context -> {
            assertThat(context).hasNotFailed();
            var media = context.getBean(MediaProperties.class);
            var capabilities = new SystemServiceImpl(context.getBean(AuthProperties.class), media,
                    mock(RegistrationMailSender.class), mock(org.example.ai_media_workbench.service.MediaProbe.class),
                    mock(org.example.ai_media_workbench.service.MediaTranscoder.class), mock(org.example.ai_media_workbench.service.SpeechRecognizer.class),
                    mock(org.example.ai_media_workbench.service.SubtitleCorrector.class),mock(org.example.ai_media_workbench.service.OperationPlanner.class),
                    mock(org.example.ai_media_workbench.service.TranscriptAnalyzer.class),mock(org.example.ai_media_workbench.service.CloudCredentialService.class)).getCapabilities();
            assertThat(capabilities.registration()).isFalse();
            assertThat(capabilities.maxUploadBytes()).isEqualTo(DataSize.ofMegabytes(16).toBytes());
            assertThat(context.getBean(jakarta.servlet.MultipartConfigElement.class).getMaxFileSize()).isEqualTo(DataSize.ofMegabytes(16).toBytes());
            assertThat(capabilities.maxDurationMs()).isEqualTo(Duration.ofMinutes(3).toMillis());
            assertThat(context.getEnvironment().getProperty("spring.servlet.multipart.max-file-size")).isEqualTo("16MB");
            assertThat(context.getBean(AccountCleanupProperties.class).enabled()).isFalse();
            assertThat(capabilities.aiPlans()).isFalse();
            assertThat(capabilities.mediaTool()).isFalse();
            var analyzer=mock(org.example.ai_media_workbench.service.TranscriptAnalyzer.class);
            when(analyzer.isAvailable(org.mockito.ArgumentMatchers.any())).thenReturn(true);
            var textOnly=new SystemServiceImpl(context.getBean(AuthProperties.class),media,
                    mock(RegistrationMailSender.class),mock(org.example.ai_media_workbench.service.MediaProbe.class),
                    mock(org.example.ai_media_workbench.service.MediaTranscoder.class),mock(org.example.ai_media_workbench.service.SpeechRecognizer.class),
                    mock(org.example.ai_media_workbench.service.SubtitleCorrector.class),mock(org.example.ai_media_workbench.service.OperationPlanner.class),analyzer,
                    mock(org.example.ai_media_workbench.service.CloudCredentialService.class)).getCapabilities();
            assertThat(textOnly.semanticSearch()).isTrue();
            assertThat(textOnly.clipRecommendations()).isTrue();
            assertThat(textOnly.mediaTool()).isFalse();
            var videoProbe=mock(org.example.ai_media_workbench.service.MediaProbe.class);
            var burnTool=mock(org.example.ai_media_workbench.service.MediaTranscoder.class);
            when(videoProbe.isAvailable()).thenReturn(true); when(burnTool.isSubtitleBurnAvailable()).thenReturn(true);
            var burnOnly=new SystemServiceImpl(context.getBean(AuthProperties.class),media,mock(RegistrationMailSender.class),videoProbe,burnTool,
                    mock(org.example.ai_media_workbench.service.SpeechRecognizer.class),mock(org.example.ai_media_workbench.service.SubtitleCorrector.class),
                    mock(org.example.ai_media_workbench.service.OperationPlanner.class),mock(org.example.ai_media_workbench.service.TranscriptAnalyzer.class),
                    mock(org.example.ai_media_workbench.service.CloudCredentialService.class)).getCapabilities();
            assertThat(burnOnly.supportedOperations()).containsExactly("burn_subtitles");
            assertThat(burnOnly.asr()).isFalse();
        });
    }

    @Test
    void invalidConfigurationIsRejectedAtStartup() {
        for (String property : new String[]{"app.auth.login-attempts=0", "app.auth.session-idle-timeout=0s",
                "app.storage.root=", "app.account-cleanup.interval-ms=0", "app.media.max-upload-size=0B",
                "app.media.max-duration=-1s", "app.registration-mail.code-ttl=0s", "app.registration-mail.max-attempts=0",
                "app.task-execution.max-parallel=-1", "app.task-execution.max-parallel=17", "app.task-execution.cpu-high-watermark=1",
                "app.task-execution.memory-reserve=-1B", "app.task-execution.memory-per-task=0B", "app.task-execution.start-interval=0s"}) {
            contextRunner.withPropertyValues(property).run(context -> assertThat(context).hasFailed());
        }
    }

    @Test
    void databasePasswordAndPortUsePrivateFallbackButExplicitEnvironmentNamesWin() {
        contextRunner.withPropertyValues("local.database.password=local-test-value", "local.server.port=18081").run(context -> {
            assertThat(context.getEnvironment().getProperty("spring.datasource.password")).isEqualTo("local-test-value");
            assertThat(context.getEnvironment().getProperty("server.port")).isEqualTo("18081");
        });
        contextRunner.withPropertyValues("local.database.password=local-test-value", "local.server.port=18081",
                "DB_PASSWORD=explicit-test-value", "SERVER_PORT=18082").run(context -> {
            assertThat(context.getEnvironment().getProperty("spring.datasource.password")).isEqualTo("explicit-test-value");
            assertThat(context.getEnvironment().getProperty("server.port")).isEqualTo("18082");
        });
    }

    @Test
    void privateMailLoadsByDefaultCanBeDisabledAndIsExcludedFromTestProfile() throws Exception {
        Path mail = directory.resolve("mail.properties"), config = directory.resolve("application.properties");
        Files.writeString(mail, "app.registration-mail.enabled=${REGISTRATION_MAIL_ENABLED:true}\n"
                + "app.registration-mail.from=fixture@example.com\nspring.mail.host=fixture.invalid\n", StandardCharsets.UTF_8);
        String template;
        try (var input = getClass().getResourceAsStream("/application.properties")) {
            template = new String(input.readAllBytes(), StandardCharsets.UTF_8);
        }
        Files.writeString(config, template.replace("optional:file:./.local/database.properties", "optional:" + directory.resolve("absent.properties").toUri()), StandardCharsets.UTF_8);
        try (var input = getClass().getResourceAsStream("/application-default.properties")) {
            Files.writeString(directory.resolve("application-default.properties"), new String(input.readAllBytes(), StandardCharsets.UTF_8)
                    .replace("optional:file:./.local/mail.properties", "optional:" + mail.toUri()), StandardCharsets.UTF_8);
        }
        var runner = new ApplicationContextRunner().withUserConfiguration(MailConfiguration.class)
                .withInitializer(new ConfigDataApplicationContextInitializer())
                .withPropertyValues("spring.config.location=" + config.toUri());
        runner.run(context -> {
            assertThat(context).hasNotFailed();
            assertThat(context.getBean(RegistrationMailProperties.class).enabled()).isTrue();
            assertThat(context.getEnvironment().getProperty("spring.mail.host")).isEqualTo("fixture.invalid");
        });
        runner.withPropertyValues("REGISTRATION_MAIL_ENABLED=false").run(context -> {
            assertThat(context).hasNotFailed();
            assertThat(context.getBean(RegistrationMailProperties.class).enabled()).isFalse();
        });
        runner.withPropertyValues("spring.profiles.active=test").run(context -> {
            assertThat(context).hasNotFailed();
            assertThat(context.getBean(RegistrationMailProperties.class).enabled()).isFalse();
            assertThat(context.getEnvironment().getProperty("spring.mail.host")).isEmpty();
            assertThat(context.getBean(AuthProperties.class).sessionIdleTimeout()).isEqualTo(Duration.ofMinutes(30));
        });
    }

    @TestConfiguration(proxyBeanMethods = false)
    @EnableConfigurationProperties({RegistrationMailProperties.class, AuthProperties.class})
    static class MailConfiguration {}

    @TestConfiguration(proxyBeanMethods = false)
    @PropertySource("classpath:application.properties")
    @EnableConfigurationProperties({AuthProperties.class, StorageProperties.class,
            AccountCleanupProperties.class, MediaProperties.class, TranscodeProperties.class, RegistrationMailProperties.class, TaskExecutionProperties.class, TransportProperties.class})
    static class PropertyConfiguration {}
}
