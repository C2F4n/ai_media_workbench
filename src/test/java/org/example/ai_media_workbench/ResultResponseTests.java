package org.example.ai_media_workbench;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.DispatcherType;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import org.example.ai_media_workbench.common.exception.ApiExceptionController;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.common.exception.GlobalExceptionHandler;
import org.example.ai_media_workbench.common.exception.RateLimitException;
import org.example.ai_media_workbench.common.result.Result;
import org.example.ai_media_workbench.common.web.RequestIdFilter;
import org.example.ai_media_workbench.vo.common.ErrorDetailVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.InvalidDataAccessResourceUsageException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ResultResponseTests {
    private MockMvc mvc;
    private final ObjectMapper json = new ObjectMapper();

    @BeforeEach
    void setup() {
        mvc = MockMvcBuilders.standaloneSetup(new FixtureController(), new ApiExceptionController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .addFilters(new RequestIdFilter()).build();
    }

    @Test
    void threeFactoriesProduceTheSameEnvelope() {
        assertThat(Result.success().code()).isEqualTo("SUCCESS");
        assertThat(Result.success().data()).isNull();
        assertThat(Result.success(Map.of("id", "actual-id")).data()).containsEntry("id", "actual-id");
        var failure = Result.error(ErrorCode.INVALID_PARAMETERS, new ErrorDetailVO("name", "Required"));
        assertThat(failure.code()).isEqualTo("INVALID_PARAMETERS");
        assertThat(failure.data()).isNull();
        assertThat(failure.details()).containsExactly(new ErrorDetailVO("name", "Required"));
        assertThat(failure.requestId()).isNotBlank();
    }

    @Test
    void successAndEveryExceptionCategoryUseResultAndMatchRequestHeader() throws Exception {
        Map<String, String> codes = Map.of(
                "success", "SUCCESS", "business", "WEAK_PASSWORD", "database", "INTERNAL_ERROR",
                "duplicate", "RESOURCE_CONFLICT", "rate", "RATE_LIMITED", "credentials", "INVALID_CREDENTIALS",
                "disabled", "INVALID_CREDENTIALS", "missing-user", "INVALID_CREDENTIALS",
                "auth-database", "INTERNAL_ERROR", "not-found", "RESOURCE_NOT_FOUND");
        Map<String, Integer> statuses = Map.of(
                "success", 200, "business", 422, "database", 500, "duplicate", 409, "rate", 429,
                "credentials", 401, "disabled", 401, "missing-user", 401, "auth-database", 500, "not-found", 404);
        for (var entry : codes.entrySet()) {
            var response = mvc.perform(get("/fixture/" + entry.getKey()))
                    .andExpect(status().is(statuses.get(entry.getKey())))
                    .andExpect(jsonPath("code").value(entry.getValue()))
                    .andExpect(jsonPath("message").isNotEmpty())
                    .andExpect(jsonPath("requestId").isNotEmpty())
                    .andExpect(jsonPath("details").isArray()).andReturn().getResponse();
            var body = json.readTree(response.getContentAsString());
            assertThat(body.size()).isEqualTo(5);
            assertThat(body.get("requestId").asText()).isEqualTo(response.getHeader("X-Request-Id"));
            assertThat(response.getContentAsString()).doesNotContain("private SQL", "passwordHash", "stackTrace");
            if ("success".equals(entry.getKey())) {
                assertThat(body.get("data").get("id").asText()).isEqualTo("actual-id");
            } else {
                assertThat(body.get("data").isNull()).isTrue();
            }
            if ("rate".equals(entry.getKey())) assertThat(response.getHeader("Retry-After")).isEqualTo("17");
        }
    }

    @Test
    void duplicateRegistrationAndFrameworkErrorsRetainTheirHttpMeaning() throws Exception {
        mvc.perform(post("/api/auth/register")).andExpect(status().isConflict())
                .andExpect(jsonPath("code").value("ACCOUNT_ALREADY_EXISTS"));
        mvc.perform(post("/fixture/success")).andExpect(status().isMethodNotAllowed())
                .andExpect(header().exists("Allow")).andExpect(jsonPath("code").value("METHOD_NOT_ALLOWED"));
        mvc.perform(post("/fixture/body").contentType(MediaType.TEXT_PLAIN).content("text"))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("code").value("UNSUPPORTED_CONTENT_TYPE"));
        mvc.perform(post("/fixture/body").contentType(MediaType.APPLICATION_JSON).content("{"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("code").value("INVALID_REQUEST"));
    }

    @Test
    void errorRedispatchPreservesTheOriginalRequestId() throws Exception {
        var request = new MockHttpServletRequest("GET", "/error");
        request.setDispatcherType(DispatcherType.ERROR);
        request.setAttribute(RequestDispatcher.ERROR_REQUEST_URI, "/original");
        request.setAttribute(RequestIdFilter.ATTRIBUTE, "original-request-id");
        var response = new MockHttpServletResponse();
        new RequestIdFilter().doFilter(request, response, (incoming, outgoing) -> {
            assertThat(Result.error(ErrorCode.INTERNAL_ERROR).requestId()).isEqualTo("original-request-id");
        });
        assertThat(response.getHeader("X-Request-Id")).isEqualTo("original-request-id");
        assertThat(org.slf4j.MDC.get("requestId")).isNull();
    }

    @Test
    void containerErrorDispatchAlsoReturnsResultInsteadOfDefaultErrorBody() throws Exception {
        for (int code : new int[]{404, 413, 500}) {
            mvc.perform(get("/error").requestAttr(RequestDispatcher.ERROR_STATUS_CODE, code))
                    .andExpect(status().is(code)).andExpect(jsonPath("code").value(ErrorCode.forStatus(code).name()))
                    .andExpect(jsonPath("data").isEmpty()).andExpect(jsonPath("details").isArray());
        }
    }

    @Test
    void clientDisconnectDuringStreamingIsHandledWithoutWritingAnErrorBody() throws Exception {
        var response = mvc.perform(get("/fixture/disconnect")).andReturn().getResponse();
        // 断开连接不是服务端错误：既不能变成 500，也不能再写 Result 错误体。
        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(response.getContentAsString()).isEmpty();
    }

    @Test
    void failureAfterResponseCommittedDoesNotOverwriteTheStream() throws Exception {
        var response = mvc.perform(get("/fixture/broken-stream")).andReturn().getResponse();
        // 已经写出的字节保持原样，不回退成 500 JSON。
        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(response.getContentAsString()).isEqualTo("partial");
    }

    @RestController
    static class FixtureController {
        @GetMapping("/fixture/{scenario}")
        Result<Map<String, String>> scenario(@PathVariable String scenario) {
            return switch (scenario) {
                case "business" -> throw new BusinessException(ErrorCode.WEAK_PASSWORD);
                case "database" -> throw new InvalidDataAccessResourceUsageException("private SQL");
                case "duplicate" -> throw new DuplicateKeyException("private SQL");
                case "rate" -> throw new RateLimitException(17);
                case "credentials" -> throw new BadCredentialsException("private SQL");
                case "disabled" -> throw new DisabledException("private SQL");
                case "missing-user" -> throw new UsernameNotFoundException("private SQL");
                case "auth-database" -> throw new InternalAuthenticationServiceException("private SQL");
                case "not-found" -> throw new ResponseStatusException(HttpStatus.NOT_FOUND, "private SQL");
                default -> Result.success(Map.of("id", "actual-id"));
            };
        }

        @PostMapping("/api/auth/register")
        void duplicateRegistration() { throw new DuplicateKeyException("private SQL"); }

        @PostMapping(value = "/fixture/body", consumes = MediaType.APPLICATION_JSON_VALUE)
        Result<Map<String, String>> body(@RequestBody Map<String, String> body) { return Result.success(body); }

        @GetMapping("/fixture/disconnect")
        void disconnect() throws AsyncRequestNotUsableException {
            throw new AsyncRequestNotUsableException("Connection reset by peer");
        }

        @GetMapping("/fixture/broken-stream")
        void brokenStream(HttpServletResponse response) throws IOException {
            response.getOutputStream().write("partial".getBytes(StandardCharsets.UTF_8));
            response.flushBuffer();
            throw new IllegalStateException("stream failed after commit");
        }
    }
}
