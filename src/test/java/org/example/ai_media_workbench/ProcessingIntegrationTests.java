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
import org.example.ai_media_workbench.dto.processing.TrimParameters;
import org.example.ai_media_workbench.dto.processing.JoinClipsParameters;
import org.example.ai_media_workbench.dto.processing.JoinClipsParameters.ClipRange;
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
import static org.assertj.core.api.Assertions.assertThatThrownBy;
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
    @Autowired MediaService mediaService;
    @MockitoBean MediaProbe probe;
    @MockitoBean MediaTranscoder transcoder;
    @MockitoBean OperationPlanner planner;
    private static final String PASSWORD = "Testing-2026!";
    private static final byte[] OUTPUT = "verified-output-bytes".getBytes(java.nio.charset.StandardCharsets.UTF_8);
    private final MediaMetadataVO metadata = new MediaMetadataVO("mov,mp4", 1200, 160, 90, "h264", false, null);
    private final Map<String, String> parameters = Map.of("operation", "transcode", "outputFormat", "mp4", "resolutionPreset", "720p", "audioMode", "keep");

    @BeforeEach void prepare() throws Exception {
        jdbc.update("UPDATE account_cleanup_job SET status='DONE'");
        jdbc.update("UPDATE media_task SET status='CANCELLED',stage='CANCELLED' WHERE status IN ('QUEUED','RUNNING','CANCELLING')");
        when(probe.isAvailable()).thenReturn(true); when(probe.inspect(any())).thenReturn(metadata);
        when(transcoder.isAvailable()).thenReturn(true);
        when(transcoder.isAudioExtractionAvailable()).thenReturn(true);
        when(probe.inspectAudio(any())).thenAnswer(call -> call.getArgument(0, Path.class).toString().endsWith(".mp3")
                ? new MediaMetadataVO("mp3", 1230, null, null, null, true, "mp3")
                : new MediaMetadataVO("mov", 1200, null, null, null, true, "aac"));
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

    @Test void audioExtractionUsesItsOwnCapabilityAndReturnsPrivateMp3Streams() throws Exception {
        Browser owner = login(), other = login(); String mediaId = audioSource(owner);
        when(transcoder.isAvailable()).thenReturn(false);
        mvc.perform(get("/api/system/capabilities")).andExpect(status().isOk())
                .andExpect(jsonPath("data.supportedOperations[0]").value("extract_audio"))
                .andExpect(jsonPath("data.supportedOperations.length()").value(1));
        var plan = processing.create(owner.id(), new CreatePlanRequest(UUID.fromString(mediaId),
                json.valueToTree(Map.of("operation", "extract_audio", "outputFormat", "mp3")), null));
        var task = processing.execute(owner.id(), plan.id(), 1);
        worker.runOne();
        var complete = processing.task(owner.id(), task.id());
        assertThat(complete.status().name()).isEqualTo("SUCCEEDED");
        assertThat(json.readTree(json.writeValueAsString(complete.parameters())).size()).isEqualTo(2);
        var output = complete.outputs().getFirst();
        assertThat(output.contentType()).isEqualTo("audio/mpeg");
        assertThat(output.filename()).endsWith("-audio.mp3");
        assertThat(output.metadata().width()).isNull(); assertThat(output.metadata().videoCodec()).isNull();
        assertThat(output.metadata().audioCodec()).isEqualTo("mp3");
        mvc.perform(get(output.downloadUrl()).cookie(other.cookie())).andExpect(status().isNotFound());
        var result = mvc.perform(get(output.previewUrl()).cookie(owner.cookie()).header("Range", "bytes=0-3"))
                .andExpect(request().asyncStarted()).andReturn();
        mvc.perform(asyncDispatch(result)).andExpect(status().isPartialContent()).andExpect(content().contentType("audio/mpeg"))
                .andExpect(content().bytes(java.util.Arrays.copyOfRange(OUTPUT, 0, 4)));
        var download = mvc.perform(get(output.downloadUrl()).cookie(owner.cookie())).andExpect(request().asyncStarted()).andReturn();
        mvc.perform(asyncDispatch(download)).andExpect(status().isOk()).andExpect(content().contentType("audio/mpeg")).andExpect(content().bytes(OUTPUT));
    }

    @Test void silentSourcesExtraFieldsAndMissingMp3EncoderAreRejectedBeforeEnqueue() throws Exception {
        Browser owner = login(); String mediaId = source(owner);
        var params = Map.of("operation", "extract_audio", "outputFormat", "mp3");
        mvc.perform(post("/api/operation-plans").cookie(owner.cookie()).header("X-CSRF-Token", owner.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("mediaId", mediaId, "parameters", params))))
                .andExpect(status().isUnprocessableEntity()).andExpect(jsonPath("code").value("SOURCE_HAS_NO_AUDIO"));
        String withAudio = audioSource(owner);
        for (var invalid : List.of(Map.of("operation", "extract_audio", "outputFormat", "mp4"),
                Map.of("operation", "extract_audio", "outputFormat", "mp3", "outputPath", "forged.mp3"))) {
            mvc.perform(post("/api/operation-plans").cookie(owner.cookie()).header("X-CSRF-Token", owner.csrf())
                    .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("mediaId", withAudio, "parameters", invalid))))
                    .andExpect(status().isUnprocessableEntity());
        }
        when(transcoder.isAudioExtractionAvailable()).thenReturn(false);
        mvc.perform(post("/api/operation-plans").cookie(owner.cookie()).header("X-CSRF-Token", owner.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("mediaId", withAudio, "parameters", params))))
                .andExpect(status().isServiceUnavailable()).andExpect(jsonPath("code").value("AUDIO_EXTRACTION_UNAVAILABLE"));
        assertThat(mapper.countPlans(owner.id(), null)).isZero(); assertThat(mapper.countTasks(owner.id(), null)).isZero();
    }

    @Test void wrongAudioOutputsFailAndRunningAudioCancellationDoesNotPublishPartialFiles() throws Exception {
        Browser owner = login(); String mediaId = audioSource(owner);
        var input = new CreatePlanRequest(UUID.fromString(mediaId), json.valueToTree(Map.of("operation", "extract_audio", "outputFormat", "mp3")), null);
        var badTask = processing.execute(owner.id(), processing.create(owner.id(), input).id(), 1);
        doAnswer(call -> call.getArgument(0, Path.class).toString().endsWith(".mp3")
                ? new MediaMetadataVO("mp3", 100, null, null, null, true, "mp3")
                : new MediaMetadataVO("mov", 1200, null, null, null, true, "aac")).when(probe).inspectAudio(any());
        worker.runOne();
        assertThat(processing.task(owner.id(), badTask.id()).error().code()).isEqualTo("AUDIO_EXTRACTION_FAILED");
        assertThat(mapper.taskOutputs(owner.id(), badTask.id())).isEmpty();
        var cancelled = processing.execute(owner.id(), processing.create(owner.id(), input).id(), 1);
        doAnswer(call -> {
            Path path = call.getArgument(1, Path.class); assertThat(path.toString()).endsWith(".mp3"); Files.write(path, OUTPUT);
            processing.cancel(owner.id(), cancelled.id()); throw new BusinessException(ErrorCode.TASK_CANCELLED);
        }).when(transcoder).convert(any(), any(), any(), any(), any());
        worker.runOne();
        assertThat(processing.task(owner.id(), cancelled.id()).status().name()).isEqualTo("CANCELLED");
        try (var files = Files.list(root.resolve(owner.id()))) { assertThat(files.count()).isEqualTo(1); }
    }

    @Test void expiredAndDeletedAudioTasksCleanUnpublishedMp3Files() throws Exception {
        Browser owner = login(); String mediaId = audioSource(owner);
        var input = new CreatePlanRequest(UUID.fromString(mediaId), json.valueToTree(Map.of("operation", "extract_audio", "outputFormat", "mp3")), null);
        var task = processing.execute(owner.id(), processing.create(owner.id(), input).id(), 1);
        String token = UUID.randomUUID().toString(); mapper.claim(task.id(), token, LocalDateTime.now().minusDays(1));
        var expired = storage.createOutput(owner.id(), task.id(), token, "mp3");
        worker.runOne(); assertThat(Files.exists(expired.path())).isFalse();
        assertThat(processing.task(owner.id(), task.id()).error().code()).isEqualTo("TASK_INTERRUPTED");
        var next = processing.execute(owner.id(), processing.create(owner.id(), input).id(), 1);
        token = UUID.randomUUID().toString(); mapper.claim(next.id(), token, LocalDateTime.now());
        var partial = storage.createOutput(owner.id(), next.id(), token, "mp3");
        users.deleteAccount(owner.id(), new DeleteUserRequest(PASSWORD, owner.name())); cleanup.runPending();
        assertThat(Files.exists(partial.path())).isFalse();
        try (var files = Files.list(root.resolve(owner.id()))) { assertThat(files.count()).isZero(); }
    }

    @Test void deletingOneMediaRevokesAllRelatedResourcesWithoutTouchingAnotherMedia() throws Exception {
        Browser owner=login(); String mediaId=source(owner),keep=source(owner);
        String planId=create(owner,mediaId);
        String taskId=data(execute(owner,planId,1).andReturn()).path("id").asText();
        worker.runOne();
        String outputId=processing.task(owner.id(),taskId).outputs().getFirst().id();
        Path outputPath=storage.resolve(mapper.output(owner.id(),outputId).getStorageKey());
        String queuedPlan=create(owner,mediaId);
        String queuedTask=data(execute(owner,queuedPlan,1).andReturn()).path("id").asText();
        mediaService.delete(owner.id(),mediaId);
        for(String path:List.of("/api/media/"+mediaId,"/api/operation-plans/"+planId,"/api/tasks/"+taskId,
                "/api/tasks/"+queuedTask,"/api/outputs/"+outputId,"/api/outputs/"+outputId+"/preview","/api/outputs/"+outputId+"/download"))
            mvc.perform(get(path).cookie(owner.cookie())).andExpect(status().isNotFound());
        execute(owner,queuedPlan,1).andExpect(status().isNotFound());
        mvc.perform(get("/api/tasks").cookie(owner.cookie())).andExpect(jsonPath("data.total").value(0));
        mvc.perform(get("/api/outputs").cookie(owner.cookie())).andExpect(jsonPath("data.total").value(0));
        assertThat(jdbc.queryForObject("SELECT status FROM media_task WHERE id=?",String.class,queuedTask)).isEqualTo("CANCELLED");
        assertThat(mapper.activeCount()).isZero();
        cleanup.runPending(); assertThat(Files.exists(outputPath)).isFalse();
        assertThat(mediaService.get(owner.id(),keep)).isNotNull();
        try(var files=Files.list(root.resolve(owner.id()))) { assertThat(files.count()).isEqualTo(1); }
        users.deleteAccount(owner.id(),new DeleteUserRequest(PASSWORD,owner.name())); cleanup.runPending();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM account_cleanup_job WHERE user_id=?",Integer.class,owner.id())).isEqualTo(2);
        try(var files=Files.list(root.resolve(owner.id()))) { assertThat(files.count()).isZero(); }
    }

    @Test void deletingWhileExtractingStopsTheWorkerAndNeverPublishesAnMp3() throws Exception {
        Browser owner=login(); String mediaId=audioSource(owner);
        var input=new CreatePlanRequest(UUID.fromString(mediaId),json.valueToTree(Map.of("operation","extract_audio","outputFormat","mp3")),null);
        var task=processing.execute(owner.id(),processing.create(owner.id(),input).id(),1);
        doAnswer(call->{
            Files.write(call.getArgument(1,Path.class),OUTPUT);
            mediaService.delete(owner.id(),mediaId);
            assertThat(call.getArgument(4,java.util.function.BooleanSupplier.class).getAsBoolean()).isTrue();
            throw new BusinessException(ErrorCode.TASK_CANCELLED);
        }).when(transcoder).convert(any(),any(),any(),any(),any());
        worker.runOne();
        assertThat(mapper.taskOutputs(owner.id(),task.id())).isEmpty();
        assertThat(mapper.task(owner.id(),task.id())).isNull();
        assertThat(jdbc.queryForObject("SELECT status FROM media_task WHERE id=?",String.class,task.id())).isEqualTo("CANCELLED");
        try(var files=Files.list(root.resolve(owner.id()))) { assertThat(files.count()).isEqualTo(1); }
        assertThat(jdbc.queryForObject("SELECT next_attempt_at FROM account_cleanup_job WHERE user_id=?",LocalDateTime.class,owner.id()))
                .isAfter(LocalDateTime.now(java.time.ZoneOffset.UTC).plusMinutes(6));
        jdbc.update("UPDATE account_cleanup_job SET next_attempt_at=? WHERE user_id=?",LocalDateTime.now().minusDays(1),owner.id());
        cleanup.runPending();
        try(var files=Files.list(root.resolve(owner.id()))) { assertThat(files.count()).isZero(); }
    }

    @Test void deletionCleansInterruptedVideoAudioAndEncodingCachesWithinItsScope() throws Exception {
        Browser owner=login(); String mediaId=source(owner),keep=source(owner);
        String taskId=data(execute(owner,create(owner,mediaId),1).andReturn()).path("id").asText();
        String token=UUID.randomUUID().toString(); mapper.claim(taskId,token,LocalDateTime.now().minusDays(1));
        var video=storage.createOutput(owner.id(),taskId,token,"mp4");
        storage.createOutput(owner.id(),taskId,token,"mp3");
        for(String suffix:LocalMediaStorage.ENCODING_LOG_SUFFIXES) Files.writeString(Path.of(video.path()+suffix),"cache");
        mediaService.delete(owner.id(),mediaId); cleanup.runPending();
        assertThat(mediaService.get(owner.id(),keep)).isNotNull();
        try(var files=Files.list(root.resolve(owner.id()))) { assertThat(files.count()).isEqualTo(1); }
    }

    @Test void concurrentExecutionAndRepeatedDeletionLeaveNoActiveOrVisibleWork() throws Exception {
        Browser owner=login(); String mediaId=source(owner),planId=create(owner,mediaId);
        try(var pool=Executors.newFixedThreadPool(3)) {
            var calls=List.<Callable<Void>>of(()->{ mediaService.delete(owner.id(),mediaId); return null; },
                    ()->{ mediaService.delete(owner.id(),mediaId); return null; },
                    ()->{ try { processing.execute(owner.id(),planId,1); }
                        catch(BusinessException exception) { assertThat(exception.code()).isEqualTo(ErrorCode.RESOURCE_NOT_FOUND); } return null; });
            for(var result:pool.invokeAll(calls)) result.get();
        }
        assertThat(mapper.activeCount()).isZero();
        assertThat(mapper.countTasks(owner.id(),null)).isZero();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM account_cleanup_job WHERE user_id=?",Integer.class,owner.id())).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM media_task WHERE media_id=? AND deleted_at IS NULL",Integer.class,mediaId)).isZero();
    }

    @Test void trimPlansAreVersionedAndPublishOnlyTheSelectedDuration() throws Exception {
        Browser owner=login(),other=login(); String mediaId=source(owner);
        var input=trimInput(mediaId,100,800);
        var created=mvc.perform(post("/api/operation-plans").cookie(owner.cookie()).header("X-CSRF-Token",owner.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(input))).andExpect(status().isCreated())
                .andExpect(jsonPath("data.parameters.startMs").value(100)).andReturn();
        String id=data(created).path("id").asText();
        mvc.perform(patch("/api/operation-plans/"+id).cookie(owner.cookie()).header("X-CSRF-Token",owner.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("expectedVersion",1,"parameters",trimInput(mediaId,200,900).parameters()))))
                .andExpect(status().isOk()).andExpect(jsonPath("data.version").value(2));
        execute(owner,id,1).andExpect(status().isConflict());
        String task=data(execute(owner,id,2).andExpect(status().isAccepted()).andReturn()).path("id").asText();
        execute(owner,id,2).andExpect(jsonPath("data.id").value(task));
        when(probe.inspect(any())).thenReturn(new MediaMetadataVO("mov",700,160,90,"h264",false,null));
        worker.runOne(); var result=processing.task(owner.id(),task);
        assertThat(result.parameters()).isEqualTo(new TrimParameters("trim","mp4",200,900,"keep"));
        assertThat(json.valueToTree(result.parameters()).size()).isEqualTo(5);
        assertThat(result.status().name()).isEqualTo("SUCCEEDED");
        var output=result.outputs().getFirst(); assertThat(output.filename()).endsWith("-trimmed.mp4");
        assertThat(output.metadata().durationMs()).isEqualTo(700);
        assertPreview(owner,output.id(),"bytes=0-3",206,java.util.Arrays.copyOfRange(OUTPUT,0,4));
        mvc.perform(get("/api/outputs/"+output.id()+"/download").cookie(other.cookie())).andExpect(status().isNotFound());
        assertThat(mediaService.get(owner.id(),mediaId).metadata().durationMs()).isEqualTo(1200);
    }

    @Test void trimRejectsInvalidNumericRangesExtraFieldsAndMissingCodecsBeforeEnqueueing() throws Exception {
        Browser owner=login(); String mediaId=source(owner);
        for(Object[] values:List.of(new Object[]{-1,800},new Object[]{100,500},new Object[]{700,700},new Object[]{900,800},
                new Object[]{0,1201},new Object[]{0.5,800},new Object[]{"0",800},new Object[]{0,new java.math.BigInteger("9223372036854775808")})) {
            var parameters=new java.util.HashMap<String,Object>();
            parameters.put("operation","trim"); parameters.put("outputFormat","mp4"); parameters.put("audioMode","keep");
            parameters.put("startMs",values[0]); parameters.put("endMs",values[1]);
            mvc.perform(post("/api/operation-plans").cookie(owner.cookie()).header("X-CSRF-Token",owner.csrf())
                    .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("mediaId",mediaId,"parameters",parameters))))
                    .andExpect(status().isUnprocessableEntity()).andExpect(jsonPath("code").value("INVALID_PARAMETERS"));
        }
        var extra=json.valueToTree(trimInput(mediaId,0,500));
        ((tools.jackson.databind.node.ObjectNode)extra.path("parameters")).put("resolutionPreset","720p");
        mvc.perform(post("/api/operation-plans").cookie(owner.cookie()).header("X-CSRF-Token",owner.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(extra))).andExpect(status().isUnprocessableEntity());
        when(transcoder.isAvailable()).thenReturn(false);
        mvc.perform(post("/api/operation-plans").cookie(owner.cookie()).header("X-CSRF-Token",owner.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(trimInput(mediaId,0,500))))
                .andExpect(status().isServiceUnavailable());
        assertThat(mapper.countPlans(owner.id(),null)).isZero(); assertThat(mapper.countTasks(owner.id(),null)).isZero();
    }

    @Test void failedTrimVerificationAndCancellationNeverPublishPartialFiles() throws Exception {
        Browser owner=login(); String mediaId=source(owner); var input=trimInput(mediaId,100,700);
        var bad=processing.execute(owner.id(),processing.create(owner.id(),input).id(),1);
        worker.runOne(); assertThat(processing.task(owner.id(),bad.id()).error().code()).isEqualTo("TRIM_FAILED");
        assertThat(mapper.taskOutputs(owner.id(),bad.id())).isEmpty();
        var cancelled=processing.execute(owner.id(),processing.create(owner.id(),input).id(),1);
        doAnswer(call->{
            Files.write(call.getArgument(1,Path.class),OUTPUT); processing.cancel(owner.id(),cancelled.id());
            throw new BusinessException(ErrorCode.TASK_CANCELLED);
        }).when(transcoder).convert(any(),any(),any(),any(),any());
        worker.runOne(); assertThat(processing.task(owner.id(),cancelled.id()).status().name()).isEqualTo("CANCELLED");
        try(var files=Files.list(root.resolve(owner.id()))) { assertThat(files.count()).isEqualTo(1); }
    }

    @Test void trimCanFinishWithoutAudioInTheSelectedIntervalButCannotPublishAfterSourceDeletion() throws Exception {
        Browser owner=login(); String mediaId=audioSource(owner); var input=trimInput(mediaId,600,1200);
        when(probe.inspect(any())).thenReturn(new MediaMetadataVO("mov",600,160,90,"h264",false,null));
        var task=processing.execute(owner.id(),processing.create(owner.id(),input).id(),1); worker.runOne();
        assertThat(processing.task(owner.id(),task.id()).outputs().getFirst().metadata().hasAudio()).isFalse();
        var removed=processing.execute(owner.id(),processing.create(owner.id(),input).id(),1);
        doAnswer(call->{
            Files.write(call.getArgument(1,Path.class),OUTPUT); mediaService.delete(owner.id(),mediaId);
            assertThat(call.getArgument(4,java.util.function.BooleanSupplier.class).getAsBoolean()).isTrue();
            return null;
        }).when(transcoder).convert(any(),any(),any(),any(),any());
        worker.runOne(); assertThat(mapper.taskOutputs(owner.id(),removed.id())).isEmpty();
        assertThat(mapper.task(owner.id(),removed.id())).isNull(); assertThat(mapper.activeCount()).isZero();
    }

    @Test void mutePlansAreVersionedIdempotentAndPublishPrivateSilentMp4WithoutChangingSource() throws Exception {
        Browser owner = login(), other = login(); String mediaId = audioSource(owner);
        var created = mvc.perform(post("/api/operation-plans").cookie(owner.cookie()).header("X-CSRF-Token", owner.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(muteInput(mediaId, "source"))))
                .andExpect(status().isCreated()).andExpect(jsonPath("data.summary").value("MP4 / 原分辨率 / 移除音轨")).andReturn();
        String id = data(created).path("id").asText();
        mvc.perform(patch("/api/operation-plans/" + id).cookie(owner.cookie()).header("X-CSRF-Token", owner.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("expectedVersion", 1, "parameters", muteInput(mediaId, "720p").parameters()))))
                .andExpect(status().isOk()).andExpect(jsonPath("data.version").value(2));
        execute(owner, id, 1).andExpect(status().isConflict());
        String task = data(execute(owner, id, 2).andExpect(status().isAccepted()).andReturn()).path("id").asText();
        execute(owner, id, 2).andExpect(jsonPath("data.id").value(task));
        worker.runOne(); var result = processing.task(owner.id(), task);
        assertThat(result.status().name()).isEqualTo("SUCCEEDED");
        assertThat(json.valueToTree(result.parameters()).size()).isEqualTo(3);
        assertThat(json.valueToTree(result.parameters()).has("audioMode")).isFalse();
        var output = result.outputs().getFirst(); assertThat(output.filename()).endsWith("-muted.mp4");
        assertThat(output.metadata().hasAudio()).isFalse(); assertThat(output.metadata().audioCodec()).isNull();
        assertThat(output.metadata().durationMs()).isEqualTo(1200);
        assertPreview(owner, output.id(), "bytes=0-3", 206, java.util.Arrays.copyOfRange(OUTPUT, 0, 4));
        mvc.perform(get("/api/outputs/" + output.id() + "/download").cookie(other.cookie())).andExpect(status().isNotFound());
        assertThat(mediaService.get(owner.id(), mediaId).metadata().hasAudio()).isTrue();
        assertThat(mapper.countTasks(owner.id(), null)).isEqualTo(1);
    }

    @Test void muteRejectsExtraFieldsWrongFormatsOwnershipAndMissingToolsBeforeEnqueue() throws Exception {
        Browser owner = login(), other = login(); String mediaId = source(owner);
        for (var parameters : List.of(Map.of("operation", "mute", "outputFormat", "mp3", "resolutionPreset", "source"),
                Map.of("operation", "mute", "outputFormat", "mp4", "resolutionPreset", "1080p"),
                Map.of("operation", "mute", "outputFormat", "mp4", "resolutionPreset", "source", "audioMode", "keep"),
                Map.of("operation", "mute", "outputFormat", "mp4"))) {
            mvc.perform(post("/api/operation-plans").cookie(owner.cookie()).header("X-CSRF-Token", owner.csrf())
                    .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("mediaId", mediaId, "parameters", parameters))))
                    .andExpect(status().isUnprocessableEntity()).andExpect(jsonPath("code").value("INVALID_PARAMETERS"));
        }
        mvc.perform(post("/api/operation-plans").cookie(other.cookie()).header("X-CSRF-Token", other.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(muteInput(mediaId, "source"))))
                .andExpect(status().isNotFound());
        when(transcoder.isAvailable()).thenReturn(false);
        mvc.perform(post("/api/operation-plans").cookie(owner.cookie()).header("X-CSRF-Token", owner.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(muteInput(mediaId, "source"))))
                .andExpect(status().isServiceUnavailable());
        assertThat(mapper.countPlans(owner.id(), null)).isZero(); assertThat(mapper.countTasks(owner.id(), null)).isZero();
    }

    @Test void muteVerificationRejectsAnyAudioAndCancellationDiscardsThePartialFile() throws Exception {
        Browser owner = login(); String mediaId = audioSource(owner); var input = muteInput(mediaId, "source");
        when(probe.inspect(any())).thenReturn(new MediaMetadataVO("mov", 1200, 160, 90, "h264", true, "aac"));
        var bad = processing.execute(owner.id(), processing.create(owner.id(), input).id(), 1); worker.runOne();
        assertThat(processing.task(owner.id(), bad.id()).error().code()).isEqualTo("MUTE_FAILED");
        assertThat(mapper.taskOutputs(owner.id(), bad.id())).isEmpty();
        var cancelled = processing.execute(owner.id(), processing.create(owner.id(), input).id(), 1);
        doAnswer(call -> {
            Files.write(call.getArgument(1, Path.class), OUTPUT); processing.cancel(owner.id(), cancelled.id());
            throw new BusinessException(ErrorCode.TASK_CANCELLED);
        }).when(transcoder).convert(any(), any(), any(), any(), any());
        worker.runOne(); assertThat(processing.task(owner.id(), cancelled.id()).status().name()).isEqualTo("CANCELLED");
        try (var files = Files.list(root.resolve(owner.id()))) { assertThat(files.count()).isEqualTo(1); }
    }

    @Test void muteAcceptsSilentSourcesButCannotPublishAfterSourceDeletion() throws Exception {
        Browser owner = login(); String mediaId = source(owner); var input = muteInput(mediaId, "source");
        var task = processing.execute(owner.id(), processing.create(owner.id(), input).id(), 1); worker.runOne();
        assertThat(processing.task(owner.id(), task.id()).status().name()).isEqualTo("SUCCEEDED");
        var removed = processing.execute(owner.id(), processing.create(owner.id(), input).id(), 1);
        doAnswer(call -> {
            Files.write(call.getArgument(1, Path.class), OUTPUT); mediaService.delete(owner.id(), mediaId);
            assertThat(call.getArgument(4, java.util.function.BooleanSupplier.class).getAsBoolean()).isTrue(); return null;
        }).when(transcoder).convert(any(), any(), any(), any(), any());
        worker.runOne(); assertThat(mapper.taskOutputs(owner.id(), removed.id())).isEmpty();
        assertThat(mapper.activeCount()).isZero();
    }

    @Test void naturalLanguagePlansRequireConfirmationAndUseExistingVersionedTasks() throws Exception {
        Browser owner=login(); String mediaId=source(owner);
        when(planner.isAvailable(anyString())).thenReturn(true);
        when(planner.propose(anyString(),any(),anyString())).thenAnswer(call->{
            assertThat(org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive()).isFalse();
            var context=call.getArgument(1,OperationPlanner.Context.class);
            assertThat(context.metadata().durationMs()).isEqualTo(1200);
            assertThat(context.supportedOperations()).contains("trim","compress","mute").doesNotContain("extract_audio");
            return new OperationPlanner.Proposal(json.valueToTree(new TrimParameters("trim","mp4",0L,1000L,"keep")),List.of());
        });
        var result=mvc.perform(post("/api/operation-plans").cookie(owner.cookie()).header("X-CSRF-Token",owner.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("mediaId",mediaId,"instruction","截取前1秒"))))
                .andExpect(status().isCreated()).andExpect(jsonPath("data.status").value("READY"))
                .andExpect(jsonPath("data.instruction").value("截取前1秒")).andExpect(jsonPath("data.parameters.endMs").value(1000)).andReturn();
        String planId=data(result).path("id").asText();
        assertThat(mapper.taskForPlan(owner.id(),planId)).isNull();
        assertThat(processing.plan(owner.id(),planId).instruction()).isEqualTo("截取前1秒");
        var first=processing.execute(owner.id(),planId,1); var repeated=processing.execute(owner.id(),planId,1);
        assertThat(repeated.id()).isEqualTo(first.id());
        assertThat(first.parameters()).isInstanceOf(TrimParameters.class);
        assertThatThrownBy(()->processing.update(owner.id(),planId,new org.example.ai_media_workbench.dto.processing.UpdatePlanRequest(1,null,"改成静音")))
                .isInstanceOfSatisfying(BusinessException.class,error->assertThat(error.code()).isEqualTo(ErrorCode.RESOURCE_CONFLICT));
        verify(planner,times(1)).propose(anyString(),any(),anyString());
    }

    @Test void ambiguousRequestsPersistFixedQuestionsAndCanBeCompletedWithoutCallingAiAgain() throws Exception {
        Browser owner=login(); String mediaId=source(owner);
        when(planner.isAvailable(anyString())).thenReturn(true);
        when(planner.propose(anyString(),any(),anyString())).thenReturn(new OperationPlanner.Proposal(null,List.of(OperationPlanner.Question.TARGET_SIZE_REQUIRED)));
        var plan=processing.create(owner.id(),new CreatePlanRequest(UUID.fromString(mediaId),null,"压小一点"));
        assertThat(plan.status().name()).isEqualTo("NEEDS_INPUT"); assertThat(plan.parameters()).isNull();
        assertThat(plan.questions().getFirst().code()).isEqualTo("TARGET_SIZE_REQUIRED");
        assertThat(processing.plan(owner.id(),plan.id()).questions()).isEqualTo(plan.questions());
        assertThatThrownBy(()->processing.execute(owner.id(),plan.id(),1)).isInstanceOf(BusinessException.class);
        var completed=processing.update(owner.id(),plan.id(),new org.example.ai_media_workbench.dto.processing.UpdatePlanRequest(1,json.valueToTree(new org.example.ai_media_workbench.dto.processing.MuteParameters("mute","mp4","source")),null));
        assertThat(completed.version()).isEqualTo(2); assertThat(completed.status().name()).isEqualTo("READY");
        assertThat(completed.instruction()).isNull(); assertThat(completed.questions()).isEmpty();
        verify(planner,times(1)).propose(anyString(),any(),anyString());
    }

    @Test void aiPlanUpdatesReceivePreviousParametersButRejectVersionsChangedWhileWaiting() throws Exception {
        Browser owner=login(); String mediaId=source(owner); String planId=create(owner,mediaId);
        when(planner.isAvailable(anyString())).thenReturn(true);
        when(planner.propose(anyString(),any(),anyString())).thenAnswer(call->{
            assertThat(call.getArgument(1,OperationPlanner.Context.class).previousParameters().operation()).isEqualTo("transcode");
            assertThat(org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive()).isFalse();
            processing.update(owner.id(),planId,new org.example.ai_media_workbench.dto.processing.UpdatePlanRequest(1,json.valueToTree(new org.example.ai_media_workbench.dto.processing.MuteParameters("mute","mp4","source")),null));
            return new OperationPlanner.Proposal(json.valueToTree(new TrimParameters("trim","mp4",0L,1000L,"keep")),List.of());
        });
        assertThatThrownBy(()->processing.update(owner.id(),planId,new org.example.ai_media_workbench.dto.processing.UpdatePlanRequest(1,null,"改成前1秒")))
                .isInstanceOfSatisfying(BusinessException.class,error->assertThat(error.code()).isEqualTo(ErrorCode.PLAN_VERSION_CONFLICT));
        var preserved=processing.plan(owner.id(),planId); assertThat(preserved.version()).isEqualTo(2);
        assertThat(preserved.parameters().operation()).isEqualTo("mute");
    }

    @Test void cloudWaitingDoesNotBlockSourceDeletionAndCannotResurrectAPlan() throws Exception {
        Browser owner=login(); String mediaId=source(owner);
        when(planner.isAvailable(anyString())).thenReturn(true);
        when(planner.propose(anyString(),any(),anyString())).thenAnswer(call->{
            assertThat(org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive()).isFalse();
            try(var executor=Executors.newSingleThreadExecutor()) {
                executor.submit(()->mediaService.delete(owner.id(),mediaId)).get(2,java.util.concurrent.TimeUnit.SECONDS);
            }
            return new OperationPlanner.Proposal(json.valueToTree(new org.example.ai_media_workbench.dto.processing.MuteParameters("mute","mp4","source")),List.of());
        });
        assertThatThrownBy(()->processing.create(owner.id(),new CreatePlanRequest(UUID.fromString(mediaId),null,"移除声音")))
                .isInstanceOfSatisfying(BusinessException.class,error->assertThat(error.code()).isEqualTo(ErrorCode.RESOURCE_NOT_FOUND));
        assertThat(mapper.countPlans(owner.id(),mediaId)).isZero();
    }

    @Test void malformedAiParametersNeverCreatePlansOrTasksAndOwnershipIsCheckedBeforeBilling() throws Exception {
        Browser owner=login(), other=login(); String mediaId=source(owner);
        when(planner.isAvailable(anyString())).thenReturn(true);
        for(String value:List.of("{\"operation\":\"shell\",\"command\":\"x\"}",
                "{\"operation\":\"mute\",\"outputFormat\":\"mp4\",\"resolutionPreset\":\"source\",\"outputPath\":\"outside.mp4\"}",
                "{\"operation\":\"trim\",\"outputFormat\":\"mp4\",\"startMs\":0,\"endMs\":999999,\"audioMode\":\"keep\"}",
                "{\"operation\":\"trim\",\"outputFormat\":\"mp4\",\"startMs\":0.5,\"endMs\":1000,\"audioMode\":\"keep\"}",
                "{\"operation\":\"extract_audio\",\"outputFormat\":\"mp3\"}")) {
            when(planner.propose(anyString(),any(),anyString())).thenReturn(new OperationPlanner.Proposal(json.readTree(value),List.of()));
            mvc.perform(post("/api/operation-plans").cookie(owner.cookie()).header("X-CSRF-Token",owner.csrf())
                    .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("mediaId",mediaId,"instruction","test"))))
                    .andExpect(status().isUnprocessableEntity()).andExpect(jsonPath("code").value("AI_PLAN_FAILED"));
        }
        assertThat(mapper.countPlans(owner.id(),mediaId)).isZero(); assertThat(mapper.activeCount()).isZero();
        clearInvocations(planner);
        mvc.perform(post("/api/operation-plans").cookie(other.cookie()).header("X-CSRF-Token",other.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("mediaId",mediaId,"instruction","mute"))))
                .andExpect(status().isNotFound());
        verifyNoInteractions(planner);
    }

    @Test void invalidAiUpdatePreservesTheExistingPlanAndItsVersion() throws Exception {
        Browser owner=login(); String mediaId=source(owner); String planId=create(owner,mediaId);
        when(planner.isAvailable(anyString())).thenReturn(true);
        when(planner.propose(anyString(),any(),anyString())).thenThrow(new BusinessException(ErrorCode.AI_PLAN_FAILED));
        assertThatThrownBy(()->processing.update(owner.id(),planId,new org.example.ai_media_workbench.dto.processing.UpdatePlanRequest(1,null,"test")))
                .isInstanceOf(BusinessException.class);
        assertThat(processing.plan(owner.id(),planId).version()).isEqualTo(1);
        assertThat(processing.plan(owner.id(),planId).parameters().operation()).isEqualTo("transcode");
        assertThat(processing.plan(owner.id(),planId).instruction()).isNull();
    }

    private CreatePlanRequest muteInput(String mediaId, String resolution) {
        return new CreatePlanRequest(UUID.fromString(mediaId), json.valueToTree(
                new org.example.ai_media_workbench.dto.processing.MuteParameters("mute", "mp4", resolution)), null);
    }

    @Test void clipJoinFreezesOrderedParametersReusesOneTaskAndCleansPrivatePartsBeforePublishing() throws Exception {
        var owner=login(); var other=login(); String mediaId=source(owner);
        var input=joinInput(mediaId,List.of(new ClipRange(600,1200),new ClipRange(0,600)));
        var created=mvc.perform(post("/api/operation-plans").cookie(owner.cookie()).header("X-CSRF-Token",owner.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsBytes(input))).andExpect(status().isCreated()).andReturn();
        String id=data(created).path("id").asText(); assertThat(data(created).path("parameters").path("clips").get(0).path("startMs").asLong()).isEqualTo(600);
        String taskId=data(execute(owner,id,1).andExpect(status().isAccepted()).andReturn()).path("id").asText();
        execute(owner,id,1).andExpect(jsonPath("data.id").value(taskId)); execute(other,id,1).andExpect(status().isNotFound());
        doAnswer(call->{
            assertThat(org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive()).isFalse();
            Path target=call.getArgument(1); Files.write(target,OUTPUT);
            Files.writeString(Path.of(target+".join-0.mp4"),"private part"); Files.writeString(Path.of(target+".join.ffconcat"),"private manifest"); return null;
        }).when(transcoder).convert(any(),any(),any(),any(),any());
        worker.runOne(); var done=processing.task(owner.id(),taskId); assertThat(done.status().name()).isEqualTo("SUCCEEDED");
        assertThat(done.outputs().getFirst().filename()).endsWith("-joined.mp4");
        assertThat(((JoinClipsParameters)done.parameters()).clips()).containsExactly(new ClipRange(600,1200),new ClipRange(0,600));
        try(var files=Files.walk(root.resolve(owner.id()))) { assertThat(files.filter(path->path.toString().contains(".join")).toList()).isEmpty(); }
        var download=mvc.perform(get(done.outputs().getFirst().downloadUrl()).cookie(owner.cookie())).andExpect(request().asyncStarted()).andReturn();
        mvc.perform(asyncDispatch(download)).andExpect(status().isOk()).andExpect(content().bytes(OUTPUT));
        mvc.perform(get(done.outputs().getFirst().previewUrl()).cookie(other.cookie())).andExpect(status().isNotFound());
    }

    @Test void invalidJoinCountsRangesTotalsAndUnexpectedJsonAreRejectedWithoutEnqueuing() throws Exception {
        var owner=login(); String id=source(owner);
        for(var clips:List.of(List.<ClipRange>of(),List.of(new ClipRange(0,499)),List.of(new ClipRange(-1,600)),List.of(new ClipRange(0,1201)),
                List.of(new ClipRange(Long.MIN_VALUE,Long.MAX_VALUE)),java.util.Collections.nCopies(21,new ClipRange(0,600))))
            assertThatThrownBy(()->processing.create(owner.id(),joinInput(id,clips))).isInstanceOf(BusinessException.class);
        jdbc.update("UPDATE media SET metadata_json=? WHERE id=?",json.writeValueAsString(new MediaMetadataVO("mov",900000,160,90,"h264",false,null)),id);
        assertThatThrownBy(()->processing.create(owner.id(),joinInput(id,java.util.Collections.nCopies(20,new ClipRange(0,60000)))))
                .isInstanceOfSatisfying(BusinessException.class,error->assertThat(error.code()).isEqualTo(ErrorCode.INVALID_PARAMETERS));
        var valid=joinInput(id,List.of(new ClipRange(0,600)));
        for(String clip:List.of("{\"startMs\":0.5,\"endMs\":600}","{\"startMs\":\"0\",\"endMs\":600}","{\"startMs\":0,\"endMs\":600,\"path\":\"outside.mp4\"}")) {
            var node=json.readTree("{\"operation\":\"join_clips\",\"outputFormat\":\"mp4\",\"audioMode\":\"keep\",\"clips\":["+clip+"]}");
            mvc.perform(post("/api/operation-plans").cookie(owner.cookie()).header("X-CSRF-Token",owner.csrf())
                    .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsBytes(new CreatePlanRequest(UUID.fromString(id),node,null))))
                    .andExpect(status().isUnprocessableEntity());
        }
        mvc.perform(post("/api/operation-plans").cookie(owner.cookie()).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsBytes(valid)))
                .andExpect(status().isForbidden());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM media_task WHERE user_id=?",Integer.class,owner.id())).isZero();
    }

    @Test void joinCancellationDeletionAndVerificationFailureCannotPublishPartialResults() throws Exception {
        var owner=login(); String id=source(owner);
        var plan=processing.create(owner.id(),joinInput(id,List.of(new ClipRange(0,600)))); var bad=processing.execute(owner.id(),plan.id(),1);
        worker.runOne(); assertThat(processing.task(owner.id(),bad.id()).error().code()).isEqualTo("CLIP_JOIN_FAILED");
        var second=processing.create(owner.id(),joinInput(id,List.of(new ClipRange(0,600),new ClipRange(600,1200))));
        var cancelled=processing.execute(owner.id(),second.id(),1);
        doAnswer(call->{
            Path target=call.getArgument(1); Files.write(target,OUTPUT); Files.writeString(Path.of(target+".join-0.mp4"),"part");
            processing.cancel(owner.id(),cancelled.id()); assertThat(call.getArgument(4,java.util.function.BooleanSupplier.class).getAsBoolean()).isTrue(); return null;
        }).when(transcoder).convert(any(),any(),any(),any(),any());
        worker.runOne(); assertThat(processing.task(owner.id(),cancelled.id()).status().name()).isEqualTo("CANCELLED");
        var third=processing.create(owner.id(),joinInput(id,List.of(new ClipRange(0,600)))); var deleted=processing.execute(owner.id(),third.id(),1);
        doAnswer(call->{
            Path target=call.getArgument(1); Files.write(target,OUTPUT); Files.writeString(Path.of(target+".join-0.mp4"),"part");
            mediaService.delete(owner.id(),id); return null;
        }).when(transcoder).convert(any(),any(),any(),any(),any());
        worker.runOne(); assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM output_file WHERE task_id IN (?,?,?)",Integer.class,bad.id(),cancelled.id(),deleted.id())).isZero();
        try(var files=Files.walk(root.resolve(owner.id()))) { assertThat(files.filter(path->path.toString().endsWith(".mp4") || path.toString().contains(".join")).toList()).isEmpty(); }
    }

    @Test void expiredJoinLeaseRemovesEveryKnownPartAndManifestBeforeClearingItsToken() throws Exception {
        var owner=login(); String id=source(owner); var plan=processing.create(owner.id(),joinInput(id,List.of(new ClipRange(0,600))));
        var task=processing.execute(owner.id(),plan.id(),1); String token=UUID.randomUUID().toString();
        mapper.claim(task.id(),token,LocalDateTime.now().minusDays(1)); var target=storage.createOutput(owner.id(),task.id(),token,"mp4");
        for(String suffix:LocalMediaStorage.JOIN_SUFFIXES) Files.writeString(Path.of(target.path()+suffix),"private cache");
        worker.runOne(); assertThat(processing.task(owner.id(),task.id()).error().code()).isEqualTo("TASK_INTERRUPTED");
        assertThat(Files.exists(target.path())).isFalse();
        for(String suffix:LocalMediaStorage.JOIN_SUFFIXES) assertThat(Files.exists(Path.of(target.path()+suffix))).isFalse();
    }

    private CreatePlanRequest joinInput(String mediaId,List<ClipRange> clips) {
        return new CreatePlanRequest(UUID.fromString(mediaId),json.valueToTree(new JoinClipsParameters("join_clips","mp4",clips,"keep")),null);
    }

    private CreatePlanRequest trimInput(String mediaId,long start,long end) {
        return new CreatePlanRequest(UUID.fromString(mediaId),json.valueToTree(new TrimParameters("trim","mp4",start,end,"keep")),null);
    }

    private String audioSource(Browser owner) {
        String id = source(owner);
        var withAudio = new MediaMetadataVO("mov", 1200, 160, 90, "h264", true, "aac");
        jdbc.update("UPDATE media SET metadata_json=? WHERE id=?", json.writeValueAsString(withAudio), id);
        return id;
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
