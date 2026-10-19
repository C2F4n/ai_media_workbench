package org.example.ai_media_workbench;

import jakarta.servlet.http.Cookie;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.Callable;
import java.util.List;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.common.storage.LocalMediaStorage;
import org.example.ai_media_workbench.dto.processing.CreatePlanRequest;
import org.example.ai_media_workbench.dto.processing.CompressionParameters;
import org.example.ai_media_workbench.dto.user.DeleteUserRequest;
import org.example.ai_media_workbench.mapper.ProcessingMapper;
import org.example.ai_media_workbench.service.*;
import org.example.ai_media_workbench.service.impl.TranscodeWorker;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.JsonNode;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:processing_tests;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
        "app.transcode.queue-limit=2"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProcessingIntegrationTests {
    @TempDir static Path root;
    @DynamicPropertySource static void storage(DynamicPropertyRegistry registry) { registry.add("app.storage.root", () -> root.toString()); }
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JdbcTemplate jdbc;
    @Autowired PasswordEncoder passwords;
    @Autowired ProcessingMapper mapper;
    @Autowired ProcessingService processing;
    @Autowired UserService users;
    @Autowired LocalMediaStorage storage;
    @Autowired TranscodeWorker worker;
    @Autowired AccountCleanupService cleanup;
    @MockitoBean MediaProbe probe;
    @MockitoBean MediaTranscoder transcoder;
    private static final String PASSWORD = "Testing-2026!";
    private static final byte[] OUTPUT = "verified-output-bytes".getBytes(java.nio.charset.StandardCharsets.UTF_8);
    private final MediaMetadataVO metadata = new MediaMetadataVO("mov,mp4", 1200, 160, 90, "h264", false, null);
    private final Map<String, String> parameters = Map.of("operation", "transcode", "outputFormat", "mp4", "resolutionPreset", "720p", "audioMode", "keep");

    @BeforeEach void prepare() throws Exception {
        jdbc.update("UPDATE media_task SET status='CANCELLED',stage='CANCELLED' WHERE status IN ('QUEUED','RUNNING','CANCELLING')");
        when(probe.isAvailable()).thenReturn(true); when(probe.inspect(any())).thenReturn(metadata);
        when(transcoder.isAvailable()).thenReturn(true);
        doAnswer(call -> { Files.write(call.getArgument(1, Path.class), OUTPUT); return null; })
                .when(transcoder).convert(any(), any(), any(), any(), any());
    }

    @Test void workflowIsVersionedIdempotentPrivateAndStreamsRealStoredBytes() throws Exception {
        Browser owner = login(), other = login();
        String mediaId = source(owner);
        String planId = create(owner, mediaId);
        mvc.perform(patch("/api/operation-plans/" + planId).cookie(owner.cookie()).header("X-CSRF-Token", owner.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("expectedVersion", 1, "parameters", parameters))))
                .andExpect(status().isOk()).andExpect(jsonPath("data.version").value(2));
        execute(owner, planId, 1).andExpect(status().isConflict()).andExpect(jsonPath("code").value("PLAN_VERSION_CONFLICT"));
        String taskId = data(execute(owner, planId, 2).andExpect(status().isAccepted()).andReturn()).path("id").asText();
        execute(owner, planId, 2).andExpect(jsonPath("data.id").value(taskId));
        mvc.perform(get("/api/operation-plans/" + planId).cookie(other.cookie())).andExpect(status().isNotFound());
        execute(other, planId, 2).andExpect(status().isNotFound());
        mvc.perform(get("/api/tasks/" + taskId).cookie(other.cookie())).andExpect(status().isNotFound());
        assertThat(worker.runOne()).isTrue();
        var taskResult = mvc.perform(get("/api/tasks/" + taskId).cookie(owner.cookie())).andExpect(status().isOk())
                .andExpect(jsonPath("data.status").value("SUCCEEDED")).andExpect(jsonPath("data.progressPercent").value(100)).andReturn();
        assertThat(taskResult.getResponse().getContentAsString()).doesNotContain("storageKey", "userId", "runToken", "leaseStartedAt");
        String outputId = data(taskResult).path("outputs").get(0).path("id").asText();
        execute(owner, planId, 2).andExpect(status().isOk()).andExpect(jsonPath("data.id").value(taskId));
        mvc.perform(get("/api/outputs").cookie(owner.cookie())).andExpect(jsonPath("data.total").value(1));
        mvc.perform(get("/api/tasks").cookie(other.cookie())).andExpect(jsonPath("data.total").value(0));
        mvc.perform(get("/api/outputs/" + outputId + "/download").cookie(other.cookie())).andExpect(status().isNotFound());
        var download = mvc.perform(get("/api/outputs/" + outputId + "/download").cookie(owner.cookie()).header("Range", "bytes=0-3"))
                .andExpect(request().asyncStarted()).andReturn();
        mvc.perform(asyncDispatch(download)).andExpect(status().isOk()).andExpect(content().bytes(OUTPUT))
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("filename*=")));
        assertPreview(owner, outputId, "bytes=0-3", 206, java.util.Arrays.copyOfRange(OUTPUT, 0, 4));
        assertPreview(owner, outputId, "bytes=-3", 206, java.util.Arrays.copyOfRange(OUTPUT, OUTPUT.length - 3, OUTPUT.length));
        assertPreview(owner, outputId, "bytes=3-", 206, java.util.Arrays.copyOfRange(OUTPUT, 3, OUTPUT.length));
        assertPreview(owner, outputId, "bytes=0-1,4-5", 200, OUTPUT);
        assertPreview(owner, outputId, "not-a-range", 200, OUTPUT);
        mvc.perform(get("/api/outputs/" + outputId + "/preview").cookie(owner.cookie()).header("Range", "bytes=99999-"))
                .andExpect(status().isRequestedRangeNotSatisfiable()).andExpect(jsonPath("code").value("RANGE_NOT_SATISFIABLE"))
                .andExpect(header().string("Content-Range", "bytes */" + OUTPUT.length));
        storage.discard(mapper.output(owner.id(), outputId).getStorageKey());
        mvc.perform(get("/api/outputs/" + outputId + "/download").cookie(owner.cookie())).andExpect(status().isGone())
                .andExpect(jsonPath("code").value("OUTPUT_UNAVAILABLE"));
    }

    @Test void queuedAndRunningCancellationAreIdempotentAndDiscardPartialOutputs() throws Exception {
        Browser owner = login(); String mediaId = source(owner);
        String plan = create(owner, mediaId);
        String queued = data(execute(owner, plan, 1).andReturn()).path("id").asText();
        for (int i = 0; i < 2; i++) mvc.perform(post("/api/tasks/" + queued + "/cancel").cookie(owner.cookie()).header("X-CSRF-Token", owner.csrf()))
                .andExpect(status().isOk()).andExpect(jsonPath("data.status").value("CANCELLED"));
        execute(owner, plan, 1).andExpect(status().isOk()).andExpect(jsonPath("data.id").value(queued));
        String running = data(execute(owner, create(owner, mediaId), 1).andReturn()).path("id").asText();
        doAnswer(call -> {
            Files.write(call.getArgument(1, Path.class), OUTPUT);
            assertThat(processing.cancel(owner.id(), running).status().name()).isEqualTo("CANCELLING");
            throw new BusinessException(ErrorCode.TASK_CANCELLED);
        }).when(transcoder).convert(any(), any(), any(), any(), any());
        worker.runOne();
        assertThat(processing.task(owner.id(), running).status().name()).isEqualTo("CANCELLED");
        assertThat(mapper.taskOutputs(owner.id(), running)).isEmpty();
        try (var files = Files.list(root.resolve(owner.id()))) { assertThat(files.count()).isEqualTo(1); }
    }

    @Test void globalQueueLimitDoesNotFreezeAnUnacceptedPlanAndSecurityIsEnforced() throws Exception {
        Browser owner = login(), other = login(); String mediaId = source(owner);
        String first = data(execute(owner, create(owner, mediaId), 1).andReturn()).path("id").asText();
        execute(owner, create(owner, mediaId), 1).andExpect(status().isAccepted());
        String waiting = create(owner, mediaId);
        execute(owner, waiting, 1).andExpect(status().isServiceUnavailable()).andExpect(jsonPath("code").value("QUEUE_FULL"));
        assertThat(processing.plan(owner.id(), waiting).status().name()).isEqualTo("READY");
        processing.cancel(owner.id(), first);
        execute(owner, waiting, 1).andExpect(status().isAccepted());
        mvc.perform(post("/api/operation-plans").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/operation-plans").cookie(owner.cookie()).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/tasks").cookie(owner.cookie()).param("ownerId", other.id())).andExpect(status().isBadRequest());
        mvc.perform(get("/api/tasks").cookie(other.cookie()).param("mediaId", mediaId)).andExpect(status().isNotFound());
        mvc.perform(get("/api/tasks").cookie(owner.cookie()).param("pageSize", "101")).andExpect(status().isUnprocessableEntity());
    }

    @Test void failedVerificationCannotPublishAnOutputAndMissingDependenciesAreHonest() throws Exception {
        Browser owner = login(); String mediaId = source(owner);
        String plan = create(owner, mediaId);
        when(transcoder.isAvailable()).thenReturn(false);
        execute(owner, plan, 1).andExpect(status().isServiceUnavailable()).andExpect(jsonPath("code").value("TRANSCODE_UNAVAILABLE"));
        when(transcoder.isAvailable()).thenReturn(true);
        String task = data(execute(owner, plan, 1).andReturn()).path("id").asText();
        when(probe.inspect(any())).thenReturn(new MediaMetadataVO("mov", 1200, 80, 44, "h264", false, null));
        worker.runOne();
        assertThat(processing.task(owner.id(), task).status().name()).isEqualTo("FAILED");
        assertThat(mapper.taskOutputs(owner.id(), task)).isEmpty();
        mvc.perform(post("/api/tasks/" + task + "/cancel").cookie(owner.cookie()).header("X-CSRF-Token", owner.csrf()))
                .andExpect(status().isConflict()).andExpect(jsonPath("code").value("TASK_NOT_CANCELLABLE"));
        mvc.perform(post("/api/operation-plans").cookie(owner.cookie()).header("X-CSRF-Token", owner.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("mediaId", mediaId, "instruction", "convert"))))
                .andExpect(status().isServiceUnavailable()).andExpect(jsonPath("code").value("AI_UNAVAILABLE"));
        var forged = new java.util.HashMap<>(parameters); forged.put("outputPath", "outside.mp4");
        mvc.perform(post("/api/operation-plans").cookie(owner.cookie()).header("X-CSRF-Token", owner.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("mediaId", mediaId, "parameters", forged))))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test void expiredLeaseFailsSafelyAndOldExecutionCannotWriteBack() throws Exception {
        Browser owner = login(); String taskId = data(execute(owner, create(owner, source(owner)), 1).andReturn()).path("id").asText();
        String token = UUID.randomUUID().toString();
        mapper.claim(taskId, token, LocalDateTime.now().minusDays(1));
        var stale = mapper.task(owner.id(), taskId);
        var partial = storage.createOutput(owner.id(), taskId, token);
        worker.runOne();
        assertThat(processing.task(owner.id(), taskId).error().code()).isEqualTo("TASK_INTERRUPTED");
        assertThat(Files.exists(partial.path())).isFalse();
        stale.setFinishedAt(LocalDateTime.now());
        assertThat(mapper.finish(stale, LocalDateTime.now().minusHours(1))).isZero();
    }

    @Test void accountDeletionDuringConversionCannotPublishOrResurrectResources() throws Exception {
        Browser owner = login(); String task = data(execute(owner, create(owner, source(owner)), 1).andReturn()).path("id").asText();
        doAnswer(call -> {
            Files.write(call.getArgument(1, Path.class), OUTPUT);
            users.deleteAccount(owner.id(), new DeleteUserRequest(PASSWORD, owner.name()));
            return null;
        }).when(transcoder).convert(any(), any(), any(), any(), any());
        worker.runOne();
        assertThat(mapper.task(owner.id(), task)).isNull();
        assertThat(mapper.taskOutputs(owner.id(), task)).isEmpty();
        try (var files = Files.list(root.resolve(owner.id()))) { assertThat(files.count()).isEqualTo(1); }
    }

    @Test void concurrentExecuteRequestsShareOneTask() throws Exception {
        Browser owner = login(); String plan = create(owner, source(owner));
        try (var executor = Executors.newFixedThreadPool(4)) {
            List<Callable<String>> calls = java.util.stream.IntStream.range(0, 4)
                    .mapToObj(i -> (Callable<String>) () -> processing.execute(owner.id(), plan, 1).id()).toList();
            var results = executor.invokeAll(calls);
            var ids = new java.util.HashSet<String>();
            for (var result : results) ids.add(result.get());
            assertThat(ids).hasSize(1);
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM media_task WHERE plan_id=?", Integer.class, plan)).isEqualTo(1);
        }
    }

    @Test void compressionSnapshotsAreTypedAndACompleteResultMustMeetTheRequestedLimit() throws Exception {
        Browser owner = login(); String mediaId = source(owner, 400_000);
        var params = new java.util.HashMap<String, Object>(parameters);
        params.put("operation", "compress"); params.put("targetSizeBytes", 120_000);
        var plan = processing.create(owner.id(), new CreatePlanRequest(UUID.fromString(mediaId), json.valueToTree(params), null));
        assertThat(plan.parameters()).isInstanceOf(CompressionParameters.class);
        var task = processing.execute(owner.id(), plan.id(), 1);
        assertThat(((CompressionParameters) task.parameters()).targetSizeBytes()).isEqualTo(120_000);
        worker.runOne();
        var complete = processing.task(owner.id(), task.id());
        assertThat(complete.status().name()).isEqualTo("SUCCEEDED");
        assertThat(complete.outputs().getFirst().filename()).endsWith("-compressed.mp4");
        assertThat(complete.outputs().getFirst().sizeBytes()).isLessThanOrEqualTo(120_000);
        assertThat(processing.execute(owner.id(), plan.id(), 1).id()).isEqualTo(task.id());
    }

    @Test void missedCompressionTargetsNeverPublishOutputsAndCleanEncodingCaches() throws Exception {
        Browser owner = login(); String mediaId = source(owner, 400_000);
        var params = new java.util.HashMap<String, Object>(parameters);
        params.put("operation", "compress"); params.put("targetSizeBytes", 120_000);
        var plan = processing.create(owner.id(), new CreatePlanRequest(UUID.fromString(mediaId), json.valueToTree(params), null));
        var task = processing.execute(owner.id(), plan.id(), 1);
        doAnswer(call -> {
            Path target = call.getArgument(1, Path.class);
            Files.write(target, new byte[120_001]);
            Files.writeString(Path.of(target + ".pass-0.log"), "temporary encoder cache");
            return null;
        }).when(transcoder).convert(any(), any(), any(), any(), any());
        worker.runOne();
        assertThat(processing.task(owner.id(), task.id()).error().code()).isEqualTo("COMPRESSION_TARGET_UNREACHABLE");
        assertThat(mapper.taskOutputs(owner.id(), task.id())).isEmpty();
        try (var files = Files.list(root.resolve(owner.id()))) { assertThat(files.count()).isEqualTo(1); }
    }

    @Test void invalidAndUnachievableTargetsAreRejectedBeforeEnqueue() throws Exception {
        Browser owner = login(); String mediaId = source(owner, 400_000);
        for (Object target : new Object[]{0, -1, "120000", 1.5, new java.math.BigInteger("99999999999999999999999999"), 400_000, 500_000, 1000}) {
            var params = new java.util.HashMap<String, Object>(parameters);
            params.put("operation", "compress"); params.put("targetSizeBytes", target);
            mvc.perform(post("/api/operation-plans").cookie(owner.cookie()).header("X-CSRF-Token", owner.csrf())
                    .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("mediaId", mediaId, "parameters", params))))
                    .andExpect(status().isUnprocessableEntity());
        }
        assertThat(mapper.countPlans(owner.id(), null)).isZero();
        assertThat(mapper.countTasks(owner.id(), null)).isZero();
    }

    @Test void accountCleanupIncludesUnpublishedFilesAndEncoderCachesAfterAnInterruptedTask() throws Exception {
        Browser owner = login(); String taskId = data(execute(owner, create(owner, source(owner)), 1).andReturn()).path("id").asText();
        String token = UUID.randomUUID().toString(); mapper.claim(taskId, token, LocalDateTime.now());
        var partial = storage.createOutput(owner.id(), taskId, token);
        for (String suffix : LocalMediaStorage.ENCODING_LOG_SUFFIXES) Files.writeString(Path.of(partial.path() + suffix), "encoder cache");
        users.deleteAccount(owner.id(), new DeleteUserRequest(PASSWORD, owner.name()));
        cleanup.runPending();
        assertThat(jdbc.queryForObject("SELECT status FROM account_cleanup_job WHERE user_id=?", String.class, owner.id())).isEqualTo("DONE");
        try (var files = Files.list(root.resolve(owner.id()))) { assertThat(files.count()).isZero(); }
    }

    private void assertPreview(Browser user, String id, String range, int status, byte[] bytes) throws Exception {
        var result = mvc.perform(get("/api/outputs/" + id + "/preview").cookie(user.cookie()).header("Range", range))
                .andExpect(request().asyncStarted()).andReturn();
        mvc.perform(asyncDispatch(result)).andExpect(status().is(status)).andExpect(content().bytes(bytes));
    }
    private org.springframework.test.web.servlet.ResultActions execute(Browser user, String plan, int version) throws Exception {
        return mvc.perform(post("/api/operation-plans/" + plan + "/execute").cookie(user.cookie()).header("X-CSRF-Token", user.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("expectedVersion", version))));
    }
    private String create(Browser user, String mediaId) throws Exception {
        return data(mvc.perform(post("/api/operation-plans").cookie(user.cookie()).header("X-CSRF-Token", user.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("mediaId", mediaId, "parameters", parameters))))
                .andExpect(status().isCreated()).andReturn()).path("id").asText();
    }
    private JsonNode data(MvcResult result) { return json.readTree(result.getResponse().getContentAsByteArray()).path("data"); }
    private String source(Browser user) { return source(user, 1); }
    private String source(Browser user, int bytes) {
        String id = UUID.randomUUID().toString();
        var stored = storage.store(user.id(), new MockMultipartFile("file", "video.mp4", "video/mp4", new byte[bytes]));
        jdbc.update("INSERT INTO media(id,user_id,original_filename,storage_key,size_bytes,kind,status,metadata_json,created_at,updated_at) VALUES(?,?,?,?,?,'VIDEO','READY',?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",
                id, user.id(), "\u526a\u8f91.mp4", stored.key(), bytes, json.writeValueAsString(metadata));
        return id;
    }
    private Browser login() throws Exception {
        String id = UUID.randomUUID().toString(), name = "p_" + id.replace("-", "").substring(0, 16);
        jdbc.update("INSERT INTO app_user(id,username,email,password_hash,display_name,email_verified,status,created_at,updated_at) VALUES(?,?,?,?,?,TRUE,'ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",
                id, name, name + "@example.com", passwords.encode(PASSWORD), name);
        var csrf = mvc.perform(get("/api/auth/csrf")).andReturn();
        String token = data(csrf).path("token").asText();
        var login = mvc.perform(post("/api/auth/login").cookie(cookie(csrf)).header("X-CSRF-Token", token)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("username", name, "password", PASSWORD))))
                .andExpect(status().isOk()).andReturn();
        return new Browser(id, name, cookie(login), data(login).path("csrfToken").asText());
    }
    private Cookie cookie(MvcResult result) {
        String value = result.getResponse().getHeaders("Set-Cookie").stream().filter(x -> x.startsWith("AMW_SESSION=")).findFirst().orElseThrow();
        return new Cookie("AMW_SESSION", value.substring("AMW_SESSION=".length()).split(";", 2)[0]);
    }
    private record Browser(String id, String name, Cookie cookie, String csrf) {}
}
