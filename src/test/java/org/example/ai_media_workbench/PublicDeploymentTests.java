package org.example.ai_media_workbench;

import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.assertThat;

/** 真正经过嵌入式Tomcat的代理边界测试；仅使用H2和随机临时端口，结束后关闭。 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "public"})
@Import(PublicDeploymentTests.ProbeConfiguration.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class PublicDeploymentTests {
    @Value("${local.server.port}") int port;
    @Autowired ObjectMapper json;

    @Test
    void plaintextFailsBeforeCsrfSessionOrBusinessProcessing() throws Exception {
        String response = exchange("127.0.0.1", "/api/auth/csrf", "");
        assertThat(response).containsPattern("^HTTP/1\\.[01] 403").doesNotContain("Set-Cookie:");
        var result = json.readTree(body(response));
        assertThat(result.path("code").asString()).isEqualTo("HTTPS_REQUIRED");
        assertThat(result.path("data").isNull()).isTrue();
        assertThat(result.path("details").isArray()).isTrue();
        assertThat(result.path("requestId").asString()).isNotBlank();
    }

    @Test
    void trustedLoopbackProxyRestoresSecureSchemeAndClientIp() throws Exception {
        String response = exchange("127.0.0.1", "/assets/proxy-probe",
                "X-Forwarded-Proto: https\r\nX-Forwarded-For: 198.51.100.12\r\n");
        assertThat(response).containsPattern("^HTTP/1\\.[01] 200");
        var probe = json.readTree(body(response));
        assertThat(probe.path("secure").asBoolean()).isTrue();
        assertThat(probe.path("ip").asString()).isEqualTo("198.51.100.12");
        assertThat(response).containsIgnoringCase("Strict-Transport-Security:");
    }

    @Test
    void differentClientsRemainDistinctBehindTheTrustedProxy() throws Exception {
        for (String ip : new String[] {"198.51.100.12", "198.51.100.13"}) {
            String response = exchange("127.0.0.1", "/assets/proxy-probe",
                    "X-Forwarded-Proto: https\r\nX-Forwarded-For: " + ip + "\r\n");
            assertThat(json.readTree(body(response)).path("ip").asString()).isEqualTo(ip);
        }
    }

    @Test
    void secureSessionCookieIsIssuedOnlyOnAcceptedHttpsRequests() throws Exception {
        String response = exchange("127.0.0.1", "/api/auth/csrf",
                "X-Forwarded-Proto: https\r\nX-Forwarded-For: 198.51.100.12\r\n");
        assertThat(response).containsPattern("^HTTP/1\\.[01] 200");
        String cookie = response.lines().filter(line -> line.regionMatches(true, 0, "Set-Cookie:", 0, 11))
                .findFirst().orElseThrow();
        assertThat(cookie).contains("AMW_SESSION=", "Secure", "HttpOnly", "SameSite=Lax");
        assertThat(json.readTree(body(response)).path("data").path("token").asString()).isNotBlank();
    }

    @Test
    void untrustedPeerCannotPretendToBeHttpsUsingEitherForwardingHeader() throws Exception {
        String response = exchange("127.0.0.2", "/assets/proxy-probe",
                "X-Forwarded-Proto: https\r\nX-Forwarded-For: 198.51.100.12\r\n"
                        + "Forwarded: for=198.51.100.12;proto=https\r\n");
        assertThat(response).containsPattern("^HTTP/1\\.[01] 403").doesNotContain("Set-Cookie:");
        assertThat(json.readTree(body(response)).path("code").asString()).isEqualTo("HTTPS_REQUIRED");
    }

    @Test
    void forwardedHeaderAloneCannotBypassTheConfiguredProtocolHeader() throws Exception {
        String response = exchange("127.0.0.1", "/assets/proxy-probe",
                "Forwarded: for=198.51.100.12;proto=https\r\nX-Forwarded-Proto: http\r\n");
        assertThat(response).containsPattern("^HTTP/1\\.[01] 403");
    }

    private String exchange(String peer, String path, String headers) throws Exception {
        try (var socket = new Socket()) {
            socket.bind(new InetSocketAddress(InetAddress.getByName(peer), 0));
            socket.connect(new InetSocketAddress("127.0.0.1", port), 5000);
            socket.setSoTimeout(5000);
            socket.getOutputStream().write(("GET " + path + " HTTP/1.0\r\nHost: workbench.test\r\n"
                    + headers + "Connection: close\r\n\r\n").getBytes(StandardCharsets.US_ASCII));
            return new String(socket.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    private static String body(String response) {
        return response.substring(response.indexOf("\r\n\r\n") + 4);
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class ProbeConfiguration {
        @Bean ProxyProbe proxyProbe() { return new ProxyProbe(); }
    }

    @RestController
    static class ProxyProbe {
        @GetMapping("/assets/proxy-probe")
        Map<String, Object> probe(HttpServletRequest request) {
            return Map.of("secure", request.isSecure(), "ip", request.getRemoteAddr());
        }
    }
}
