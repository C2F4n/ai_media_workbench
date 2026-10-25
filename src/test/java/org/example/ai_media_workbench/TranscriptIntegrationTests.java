package org.example.ai_media_workbench;

import jakarta.servlet.http.Cookie;
import java.nio.file.*;
import java.time.*;
import java.util.*;
import java.util.function.BooleanSupplier;
import org.example.ai_media_workbench.common.exception.*;
import org.example.ai_media_workbench.common.storage.LocalMediaStorage;
import org.example.ai_media_workbench.dto.transcript.*;
import org.example.ai_media_workbench.dto.processing.*;
import org.example.ai_media_workbench.dto.user.DeleteUserRequest;
import org.example.ai_media_workbench.mapper.*;
import org.example.ai_media_workbench.service.*;
import org.example.ai_media_workbench.service.impl.TranscodeWorker;
import org.example.ai_media_workbench.vo.media.MediaMetadataVO;
import org.example.ai_media_workbench.vo.transcript.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.*;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.*;
import tools.jackson.databind.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:transcript_tests;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE","app.transcode.queue-limit=2"})
@AutoConfigureMockMvc @ActiveProfiles("test")
class TranscriptIntegrationTests {
    @TempDir static Path root;
    @DynamicPropertySource static void storage(DynamicPropertyRegistry registry) { registry.add("app.storage.root",()->root.toString()); }
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JdbcTemplate jdbc;
    @Autowired PasswordEncoder passwords;
    @MockitoSpyBean LocalMediaStorage storage;
    @Autowired TranscriptService transcripts;
    @Autowired ProcessingService processing;
    @Autowired ProcessingMapper tasks;
    @Autowired TranscodeWorker worker;
    @Autowired MediaService media;
    @Autowired UserService users;
    @Autowired TranscriptAnalysisService analysis;
    @Autowired TranscriptTranslationService translation;
    @MockitoBean MediaProbe probe;
    @MockitoBean MediaTranscoder transcoder;
    @MockitoBean SpeechRecognizer recognizer;
    @MockitoBean SubtitleCorrector corrector;
    @MockitoBean TranscriptAnalyzer analyzer;
    @MockitoBean SubtitleTranslator translator;
    private static final String PASSWORD="Testing-2026!";
    private final MediaMetadataVO sourceMetadata=new MediaMetadataVO("mov,mp4",5000,160,90,"h264",true,"aac");

    @BeforeEach void prepare() {
        jdbc.update("UPDATE media_task SET status='CANCELLED',stage='CANCELLED' WHERE status IN ('QUEUED','RUNNING','CANCELLING')");
        jdbc.update("UPDATE account_cleanup_job SET status='DONE'");
        when(probe.isAvailable()).thenReturn(true); when(transcoder.isAudioExtractionAvailable()).thenReturn(true);
        when(recognizer.providers(anyString())).thenReturn(List.of("tencent","aliyun")); when(recognizer.isAvailable(anyString(),anyString())).thenReturn(true);
        when(probe.inspectAudio(any())).thenAnswer(call->call.getArgument(0,Path.class).toString().endsWith(".mp3")
                ? new MediaMetadataVO("mp3",5040,null,null,null,true,"mp3") : new MediaMetadataVO("mov",5000,null,null,null,true,"aac"));
        doAnswer(call->{ Files.write(call.getArgument(1,Path.class),new byte[]{1,2,3}); return null; })
                .when(transcoder).prepareSpeechAudio(any(),any(),any(),any());
        when(recognizer.recognize(anyString(),any(),any(),any(),any(),anyString())).thenReturn(List.of(
                new SpeechRecognizer.RecognizedSegment(100,1100,"你好，世界。"),new SpeechRecognizer.RecognizedSegment(2000,4000,"第二段字幕。")));
        when(corrector.isAvailable(anyString())).thenReturn(true); when(corrector.correct(anyString(),anyString())).thenReturn("你好，世界！");
    }

    @Test void fullWorkflowIsPrivateVersionedAndKeepsOriginalRecognition() throws Exception {
        var owner=login(); var other=login(); String mediaId=source(owner);
        var accepted=mvc.perform(post("/api/media/"+mediaId+"/transcriptions").cookie(owner.cookie).header("X-CSRF-Token",owner.csrf)
                .contentType(MediaType.APPLICATION_JSON).content("{\"language\":\"zh-CN\",\"provider\":\"aliyun\",\"force\":false}"))
                .andExpect(status().isAccepted()).andExpect(jsonPath("data.kind").value("TRANSCRIPTION")).andReturn();
        String taskId=data(accepted).path("id").asText();
        assertThat(transcripts.transcribe(owner.id,mediaId,new TranscriptionRequest("zh-CN",true,"tencent")).id()).isEqualTo(taskId);
        assertThat(worker.runOne()).isTrue();
        var task=processing.task(owner.id,taskId);
        assertThat(task.status().name()).isEqualTo("SUCCEEDED"); assertThat(task.outputs()).isEmpty(); assertThat(task.parameters()).isNull();
        var reference=(TranscriptReference)task.transcript(); assertThat(reference.version()).isEqualTo(1);
        verify(recognizer).recognize(eq("aliyun"),eq("paraformer-realtime-v2"),any(),argThat(value->!value.isNegative()&&value.compareTo(Duration.ofMinutes(5))<=0),any(),eq(owner.id));
        var original=transcripts.latest(owner.id,mediaId); assertThat(original.version()).isEqualTo(1);
        var first=original.segments().getFirst();
        var changed=List.of(new TranscriptSegment(first.id(),first.startMs(),first.endMs(),"修改后的字幕。"),original.segments().get(1));
        mvc.perform(patch("/api/transcripts/"+original.id()).cookie(owner.cookie).header("X-CSRF-Token",owner.csrf)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(new UpdateTranscriptRequest(1,changed))))
                .andExpect(status().isOk()).andExpect(jsonPath("data.version").value(2));
        var edited=transcripts.get(owner.id,original.id(),null);
        assertThat(edited.originalSegments()).isEqualTo(original.segments()); assertThat(edited.segments()).isEqualTo(changed);
        assertThat(transcripts.get(owner.id,original.id(),1).segments()).isEqualTo(original.segments());
        assertThat(((TranscriptReference)processing.task(owner.id,taskId).transcript()).version()).isEqualTo(1);
        mvc.perform(get("/api/transcripts/"+original.id()+"/srt").cookie(owner.cookie).param("version","1"))
                .andExpect(status().isOk()).andExpect(header().string("Cache-Control","no-store"))
                .andExpect(content().bytes("1\r\n00:00:00,100 --> 00:00:01,100\r\n你好，世界。\r\n\r\n2\r\n00:00:02,000 --> 00:00:04,000\r\n第二段字幕。\r\n\r\n".getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        for(String path:List.of("/api/media/"+mediaId+"/transcript","/api/transcripts/"+original.id(),"/api/transcripts/"+original.id()+"/srt")) {
            mvc.perform(get(path).cookie(other.cookie)).andExpect(status().isNotFound()).andExpect(jsonPath("code").value("RESOURCE_NOT_FOUND"));
            mvc.perform(get(path)).andExpect(status().isUnauthorized());
        }
        try(var files=Files.list(root.resolve(owner.id))) { assertThat(files.count()).isEqualTo(1); }
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM output_file WHERE task_id=?",Integer.class,taskId)).isZero();
    }

    @Test void optimisticConflictsAndMalformedSegmentsDoNotCreateRevisions() throws Exception {
        var owner=login(); var item=generate(owner,source(owner)); var first=item.segments().getFirst();
        var invalid=List.of(List.of(new TranscriptSegment(first.id(),-1L,1000L,"text")),
                List.of(new TranscriptSegment(first.id(),100L,100L,"text")),List.of(new TranscriptSegment(first.id(),100L,5001L,"text")),
                List.of(new TranscriptSegment(first.id(),100L,1000L,"x\n\ny")),List.of(new TranscriptSegment(first.id(),100L,1000L," ")),
                List.of(new TranscriptSegment(first.id(),100L,1000L,"x\u0000y")),List.of(first,first));
        for(var segments:invalid) mvc.perform(patch("/api/transcripts/"+item.id()).cookie(owner.cookie).header("X-CSRF-Token",owner.csrf)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(new UpdateTranscriptRequest(1,segments))))
                .andExpect(status().isUnprocessableEntity());
        transcripts.update(owner.id,item.id(),new UpdateTranscriptRequest(1,item.segments()));
        mvc.perform(patch("/api/transcripts/"+item.id()).cookie(owner.cookie).header("X-CSRF-Token",owner.csrf)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(new UpdateTranscriptRequest(1,item.segments()))))
                .andExpect(status().isConflict()).andExpect(jsonPath("code").value("TRANSCRIPT_VERSION_CONFLICT"));
        assertThat(transcripts.get(owner.id,item.id(),null).version()).isEqualTo(2);
        mvc.perform(get("/api/transcripts/"+item.id()).cookie(owner.cookie).param("version","999")).andExpect(status().isNotFound());
        mvc.perform(get("/api/transcripts/"+item.id()).cookie(owner.cookie).param("ownerId",owner.id)).andExpect(status().isBadRequest());
        mvc.perform(patch("/api/transcripts/"+item.id()).cookie(owner.cookie).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test void selectedSpeechModelsAreValidatedSnapshottedAndPassedToTheWorker() throws Exception {
        var owner=login(); String mediaId=source(owner);
        mvc.perform(get("/api/system/capabilities").cookie(owner.cookie))
                .andExpect(status().isOk()).andExpect(jsonPath("data.asrModels.length()").value(4))
                .andExpect(jsonPath("data.asrModels[1].id").value("qwen-audio-3.1-asr-flash-streaming"));
        for (String model:List.of("qwen-audio-3.1-asr-flash-streaming","fun-asr-realtime","paraformer-realtime-v2")) {
            var task=transcripts.transcribe(owner.id,mediaId,new TranscriptionRequest("zh-CN",true,"aliyun",model));
            assertThat(json.readTree(tasks.task(owner.id,task.id()).getParametersJson()).path("model").asText()).isEqualTo(model);
            worker.runOne(); assertThat(processing.task(owner.id,task.id()).status().name()).isEqualTo("SUCCEEDED");
            verify(recognizer).recognize(eq("aliyun"),eq(model),any(),any(),any(),eq(owner.id));
        }
    }

    @Test void unsupportedAndCrossProviderModelsFailBeforeQueuingOrCloudCalls() throws Exception {
        var owner=login(); String mediaId=source(owner);
        for (String model:List.of("qwen-plus","16k_zh","qwen-audio-3.1-asr-flash-filetrans","","x".repeat(81)))
            mvc.perform(post("/api/media/"+mediaId+"/transcriptions").cookie(owner.cookie).header("X-CSRF-Token",owner.csrf)
                    .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsBytes(new TranscriptionRequest("zh-CN",false,"aliyun",model))))
                    .andExpect(status().isUnprocessableEntity()).andExpect(jsonPath("code").value("INVALID_PARAMETERS"));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM media_task WHERE user_id=?",Integer.class,owner.id)).isZero();
        verify(recognizer,never()).recognize(anyString(),any(),any(),any(),any(),anyString());
    }

    @Test void cloudErrorsReturnResultKeepSessionAndPersistInFailedSpeechTasks() throws Exception {
        var owner=login(); var item=generate(owner,source(owner)); var segment=item.segments().getFirst();
        for (var code:List.of(ErrorCode.CLOUD_AUTH_FAILED,ErrorCode.CLOUD_QUOTA_EXCEEDED,ErrorCode.CLOUD_NETWORK_ERROR,ErrorCode.CLOUD_TIMEOUT)) {
            doThrow(new BusinessException(code)).when(corrector).correct(anyString(),anyString());
            mvc.perform(post("/api/transcripts/"+item.id()+"/corrections").cookie(owner.cookie).header("X-CSRF-Token",owner.csrf)
                    .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsBytes(new CorrectTranscriptRequest(1,segment.id()))))
                    .andExpect(status().is(code.status().value())).andExpect(jsonPath("code").value(code.name()))
                    .andExpect(jsonPath("message").value(code.message())).andExpect(jsonPath("data").isEmpty())
                    .andExpect(jsonPath("details").isArray()).andExpect(jsonPath("requestId").isNotEmpty());
            mvc.perform(get("/api/users/me").cookie(owner.cookie)).andExpect(status().isOk());
        }
        when(recognizer.recognize(anyString(),any(),any(),any(),any(),anyString())).thenThrow(new BusinessException(ErrorCode.CLOUD_AUTH_FAILED));
        var task=transcripts.transcribe(owner.id,item.mediaId(),new TranscriptionRequest("zh-CN",true,"tencent")); worker.runOne();
        var result=processing.task(owner.id,task.id());
        assertThat(result.status().name()).isEqualTo("FAILED");
        assertThat(result.error().code()).isEqualTo("CLOUD_AUTH_FAILED");
        assertThat(result.error().message()).isEqualTo(ErrorCode.CLOUD_AUTH_FAILED.message());
        assertThat(transcripts.latest(owner.id,item.mediaId()).id()).isEqualTo(item.id());
    }

    @Test void forceRecognitionPreservesOldSubtitleOnFailureAndUsesNewIdOnlyOnSuccess() throws Exception {
        var owner=login(); String mediaId=source(owner); var old=generate(owner,mediaId);
        assertThatThrownBy(()->transcripts.transcribe(owner.id,mediaId,new TranscriptionRequest("zh-CN",false,"tencent")))
                .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.TRANSCRIPT_ALREADY_EXISTS));
        when(recognizer.recognize(anyString(),any(),any(),any(),any(),anyString())).thenThrow(new BusinessException(ErrorCode.ASR_FAILED));
        var failed=transcripts.transcribe(owner.id,mediaId,new TranscriptionRequest("zh-CN",true,"tencent")); worker.runOne();
        assertThat(processing.task(owner.id,failed.id()).error().code()).isEqualTo("ASR_FAILED");
        assertThat(transcripts.latest(owner.id,mediaId).id()).isEqualTo(old.id());
        doReturn(List.of(new SpeechRecognizer.RecognizedSegment(0,1000,"新字幕"))).when(recognizer).recognize(anyString(),any(),any(),any(),any(),anyString());
        var newer=generate(owner,mediaId,true); assertThat(newer.id()).isNotEqualTo(old.id());
        assertThat(transcripts.get(owner.id,old.id(),1).segments()).hasSize(2);
    }

    @Test void noSpeechAndInvalidCloudTimeAxisCannotPublishFakeSubtitles() throws Exception {
        var owner=login(); String mediaId=source(owner);
        for(var segments:List.of(List.<SpeechRecognizer.RecognizedSegment>of(),
                List.of(new SpeechRecognizer.RecognizedSegment(0,9000,"out of range")),
                List.of(new SpeechRecognizer.RecognizedSegment(0,1000,"first"),new SpeechRecognizer.RecognizedSegment(500,1500,"overlap")))) {
            when(recognizer.recognize(anyString(),any(),any(),any(),any(),anyString())).thenReturn(segments);
            var task=transcripts.transcribe(owner.id,mediaId,new TranscriptionRequest("zh-CN",false,"tencent")); worker.runOne();
            assertThat(processing.task(owner.id,task.id()).status().name()).isEqualTo("FAILED");
            assertThat(processing.task(owner.id,task.id()).transcript()).isNull();
            mvc.perform(get("/api/media/"+mediaId+"/transcript").cookie(owner.cookie)).andExpect(status().isNotFound());
        }
    }

    @Test void cancelDeleteAndExpiredLeaseCannotPublishLateRecognition() throws Exception {
        var owner=login(); String mediaId=source(owner);
        var queued=transcripts.transcribe(owner.id,mediaId,new TranscriptionRequest("zh-CN",false,"tencent"));
        processing.cancel(owner.id,queued.id()); assertThat(worker.runOne()).isFalse(); verifyNoInteractions(corrector);
        var running=transcripts.transcribe(owner.id,mediaId,new TranscriptionRequest("zh-CN",false,"tencent"));
        when(recognizer.recognize(anyString(),any(),any(),any(),any(),anyString())).thenAnswer(call->{
            processing.cancel(owner.id,running.id()); assertThat(call.getArgument(4,BooleanSupplier.class).getAsBoolean()).isTrue();
            return List.of(new SpeechRecognizer.RecognizedSegment(0,1000,"late"));
        });
        worker.runOne(); assertThat(processing.task(owner.id,running.id()).status().name()).isEqualTo("CANCELLED");
        var expired=transcripts.transcribe(owner.id,mediaId,new TranscriptionRequest("zh-CN",false,"tencent"));
        String token=UUID.randomUUID().toString(); tasks.claim(expired.id(),token,LocalDateTime.now().minusDays(1));
        var temp=storage.createOutput(owner.id,expired.id(),token,"mp3"); worker.runOne();
        assertThat(processing.task(owner.id,expired.id()).error().code()).isEqualTo("TASK_INTERRUPTED"); assertThat(Files.exists(temp.path())).isFalse();
        var deleted=transcripts.transcribe(owner.id,mediaId,new TranscriptionRequest("zh-CN",false,"tencent"));
        doAnswer(call->{ media.delete(owner.id,mediaId); return List.of(new SpeechRecognizer.RecognizedSegment(0,1000,"late")); })
                .when(recognizer).recognize(anyString(),any(),any(),any(),any(),anyString()); worker.runOne();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM transcript WHERE source_task_id=?",Integer.class,deleted.id())).isZero();
        assertThat(tasks.activeCount()).isZero();
    }

    @Test void missingConfigurationNoAudioAndQueueLimitAreCheckedBeforeSubmission() throws Exception {
        var owner=login(); var other=login(); String mediaId=source(owner);
        when(recognizer.isAvailable(anyString(),anyString())).thenReturn(false);
        mvc.perform(post("/api/media/"+mediaId+"/transcriptions").cookie(owner.cookie).header("X-CSRF-Token",owner.csrf)
                .contentType(MediaType.APPLICATION_JSON).content("{\"language\":\"zh-CN\"}"))
                .andExpect(status().isServiceUnavailable()).andExpect(jsonPath("code").value("ASR_UNAVAILABLE"));
        when(recognizer.isAvailable(anyString(),anyString())).thenReturn(true);
        transcripts.transcribe(owner.id,mediaId,new TranscriptionRequest("zh-CN",false,"tencent"));
        transcripts.transcribe(owner.id,source(owner),new TranscriptionRequest("zh-CN",false,"aliyun"));
        String third=source(owner);
        assertThatThrownBy(()->transcripts.transcribe(owner.id,third,new TranscriptionRequest("zh-CN",false,"tencent")))
                .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.QUEUE_FULL));
        jdbc.update("UPDATE media SET metadata_json=? WHERE id=?",json.writeValueAsString(new MediaMetadataVO("mp4",5000,160,90,"h264",false,null)),third);
        assertThatThrownBy(()->transcripts.transcribe(owner.id,third,new TranscriptionRequest("zh-CN",false,"tencent")))
                .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.SOURCE_HAS_NO_AUDIO));
        mvc.perform(post("/api/media/"+mediaId+"/transcriptions").cookie(other.cookie).header("X-CSRF-Token",other.csrf)
                .contentType(MediaType.APPLICATION_JSON).content("{\"language\":\"zh-CN\"}"))
                .andExpect(status().isNotFound());
        mvc.perform(post("/api/media/"+third+"/transcriptions").cookie(owner.cookie).header("X-CSRF-Token",owner.csrf)
                .contentType(MediaType.APPLICATION_JSON).content("{\"language\":\"zh-CN\",\"provider\":\"http://localhost\"}"))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test void cleanupFailureKeepsTheTokenUntilExpiredFilesCanBeRemoved() throws Exception {
        var owner=login(); String mediaId=source(owner);
        var task=transcripts.transcribe(owner.id,mediaId,new TranscriptionRequest("zh-CN",false,"tencent"));
        doThrow(new java.io.IOException("test disk failure")).when(storage).discardOutput(anyString());
        worker.runOne();
        var current=tasks.task(owner.id,task.id());
        assertThat(current.getRunToken()).isNotNull(); assertThat(current.getStatus().name()).isEqualTo("RUNNING");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM transcript WHERE source_task_id=?",Integer.class,task.id())).isZero();
        jdbc.update("UPDATE media_task SET lease_started_at=? WHERE id=?",LocalDateTime.now().minusDays(1),task.id());
        worker.runOne(); assertThat(tasks.task(owner.id,task.id()).getRunToken()).isNotNull();
        doCallRealMethod().when(storage).discardOutput(anyString());
        worker.runOne(); assertThat(tasks.task(owner.id,task.id()).getRunToken()).isNull();
        assertThat(processing.task(owner.id,task.id()).error().code()).isEqualTo("TASK_INTERRUPTED");
        try(var files=Files.list(root.resolve(owner.id))) { assertThat(files.count()).isEqualTo(1); }
    }

    @Test void accountDeletionDuringRecognitionCannotPublishOrExposeTheTranscript() throws Exception {
        var owner=login(); String mediaId=source(owner);
        var task=transcripts.transcribe(owner.id,mediaId,new TranscriptionRequest("zh-CN",false,"tencent"));
        doAnswer(call->{ users.deleteAccount(owner.id,new DeleteUserRequest(PASSWORD,jdbc.queryForObject("SELECT username FROM app_user WHERE id=?",String.class,owner.id)));
            return List.of(new SpeechRecognizer.RecognizedSegment(0,1000,"late")); })
                .when(recognizer).recognize(anyString(),any(),any(),any(),any(),anyString());
        worker.runOne();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM transcript WHERE source_task_id=?",Integer.class,task.id())).isZero();
        mvc.perform(get("/api/media/"+mediaId+"/transcript").cookie(owner.cookie)).andExpect(status().isUnauthorized());
    }

    @Test void correctionsAreSuggestionsOnlyAndCannotReturnAfterDeletionOrVersionChange() throws Exception {
        var owner=login(); var item=generate(owner,source(owner)); var segment=item.segments().getFirst();
        mvc.perform(post("/api/transcripts/"+item.id()+"/corrections").cookie(owner.cookie).header("X-CSRF-Token",owner.csrf)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(new CorrectTranscriptRequest(1,segment.id()))))
                .andExpect(status().isOk()).andExpect(jsonPath("data.correctedText").value("你好，世界！"));
        assertThat(transcripts.get(owner.id,item.id(),null).version()).isEqualTo(1);
        assertThat(transcripts.get(owner.id,item.id(),null).segments()).isEqualTo(item.segments());
        when(corrector.correct(anyString(),anyString())).thenAnswer(call->{ transcripts.update(owner.id,item.id(),new UpdateTranscriptRequest(1,item.segments())); return "late"; });
        assertThatThrownBy(()->transcripts.correct(owner.id,item.id(),new CorrectTranscriptRequest(1,segment.id())))
                .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.TRANSCRIPT_VERSION_CONFLICT));
        media.delete(owner.id,item.mediaId());
        mvc.perform(get("/api/transcripts/"+item.id()+"/srt").cookie(owner.cookie)).andExpect(status().isNotFound());
    }

    @Test void translationsArePrivateSuggestionsAndBilingualRevisionsExportAndBurnWithoutChangingOriginals() throws Exception {
        var owner=login(); var other=login(); var item=generate(owner,source(owner)); prepareTranslation();
        var input=translationRequest(item,false);
        String endpoint="/api/transcripts/"+item.id()+"/translations";
        mvc.perform(post(endpoint).cookie(other.cookie).header("X-CSRF-Token",other.csrf).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsBytes(input)))
                .andExpect(status().isNotFound());
        mvc.perform(post(endpoint).cookie(owner.cookie).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsBytes(input))).andExpect(status().isForbidden());
        mvc.perform(post(endpoint).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsBytes(input))).andExpect(status().isUnauthorized());
        verify(translator,never()).translate(anyList(),anyString(),anyString());
        var result=mvc.perform(post(endpoint).cookie(owner.cookie).header("X-CSRF-Token",owner.csrf).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsBytes(input)))
                .andExpect(status().isOk()).andExpect(header().string("Cache-Control","no-store")).andExpect(jsonPath("data.transcriptVersion").value(1))
                .andExpect(jsonPath("data.targetLanguage").value("en")).andExpect(jsonPath("data.segments[0].startMs").value(100))
                .andExpect(jsonPath("data.segments[0].text").value("Hello 1")).andReturn();
        assertThat(result.getResponse().getContentAsString()).doesNotContain("userId","storageKey","apiKey");
        assertThat(transcripts.get(owner.id,item.id(),null).segments()).isEqualTo(item.segments());
        var translated=translation.translate(owner.id,item.id(),input);
        var bilingual=new ArrayList<TranscriptSegment>();
        for(int i=0;i<item.segments().size();i++) { var s=item.segments().get(i); bilingual.add(new TranscriptSegment(s.id(),s.startMs(),s.endMs(),s.text()+"\n"+translated.segments().get(i).text())); }
        mvc.perform(patch("/api/transcripts/"+item.id()).cookie(owner.cookie).header("X-CSRF-Token",owner.csrf).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsBytes(new UpdateTranscriptRequest(1,bilingual)))).andExpect(status().isOk()).andExpect(jsonPath("data.version").value(2));
        var saved=transcripts.get(owner.id,item.id(),null);
        assertThat(saved.originalSegments()).isEqualTo(item.segments()); assertThat(transcripts.get(owner.id,item.id(),1).segments()).isEqualTo(item.segments());
        mvc.perform(get("/api/transcripts/"+item.id()+"/srt").cookie(owner.cookie).param("version","2"))
                .andExpect(status().isOk()).andExpect(content().string(org.hamcrest.Matchers.containsString("你好，世界。\r\nHello 1\r\n")));
        translation.translate(owner.id,item.id(),translationRequest(saved,true));
        verify(translator,atLeastOnce()).translate(eq(item.originalSegments()),eq("en"),eq(owner.id));
        prepareBurn();
        doAnswer(call->{
            String ass=Files.readString(call.getArgument(4,Path.class)); assertThat(ass).contains("你好，世界。\\NHello 1");
            Files.write(call.getArgument(1,Path.class),new byte[]{1,2,3}); return null;
        }).when(transcoder).burnSubtitles(any(),any(),any(),any(),any(),any());
        var plan=processing.create(owner.id,new CreatePlanRequest(UUID.fromString(item.mediaId()),burnParameters(saved),null));
        var task=processing.execute(owner.id,plan.id(),1); worker.runOne();
        assertThat(processing.task(owner.id,task.id()).status().name()).isEqualTo("SUCCEEDED");
    }

    @Test void translationRejectsUnknownDuplicateReversedIdsUnsupportedLanguagesAndExcessiveInputBeforeCallingModel() throws Exception {
        var owner=login(); var item=generate(owner,source(owner)); prepareTranslation();
        var ids=item.segments().stream().map(TranscriptSegment::id).toList();
        for(var input:List.of(new TranslateTranscriptRequest(1,"en",List.of(UUID.randomUUID()),false),
                new TranslateTranscriptRequest(1,"en",List.of(ids.getFirst(),ids.getFirst()),false),
                new TranslateTranscriptRequest(1,"en",List.of(ids.getLast(),ids.getFirst()),false),
                new TranslateTranscriptRequest(1,"en",Collections.nCopies(21,ids.getFirst()),false),
                new TranslateTranscriptRequest(1,"xx",ids,false))) {
            mvc.perform(post("/api/transcripts/"+item.id()+"/translations").cookie(owner.cookie).header("X-CSRF-Token",owner.csrf)
                    .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsBytes(input))).andExpect(status().isUnprocessableEntity());
        }
        var longSegments=item.segments().stream().map(s->new TranscriptSegment(s.id(),s.startMs(),s.endMs(),"x".repeat(1001))).toList();
        var latest=transcripts.update(owner.id,item.id(),new UpdateTranscriptRequest(1,longSegments));
        assertThatThrownBy(()->translation.translate(owner.id,item.id(),translationRequest(latest,false)))
                .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.TRANSCRIPT_TRANSLATION_TOO_LARGE));
        verify(translator,never()).translate(anyList(),anyString(),anyString());
    }

    @Test void invalidTranslationCannotInventIdsChangeOrderOrPublishBlankOversizedOrControlText() throws Exception {
        var owner=login(); var item=generate(owner,source(owner)); prepareTranslation();
        var first=item.segments().getFirst(); var last=item.segments().getLast();
        for(var result:List.of(List.<SubtitleTranslator.Translation>of(),
                List.of(new SubtitleTranslator.Translation(UUID.randomUUID(),"unknown"),new SubtitleTranslator.Translation(last.id(),"last")),
                List.of(new SubtitleTranslator.Translation(last.id(),"last"),new SubtitleTranslator.Translation(first.id(),"first")),
                List.of(new SubtitleTranslator.Translation(first.id()," "),new SubtitleTranslator.Translation(last.id(),"last")),
                List.of(new SubtitleTranslator.Translation(first.id(),"x\n\ny"),new SubtitleTranslator.Translation(last.id(),"last")),
                List.of(new SubtitleTranslator.Translation(first.id(),"x\u0000y"),new SubtitleTranslator.Translation(last.id(),"last")),
                List.of(new SubtitleTranslator.Translation(first.id(),"x".repeat(2001)),new SubtitleTranslator.Translation(last.id(),"last")))) {
            when(translator.translate(anyList(),anyString(),anyString())).thenReturn(result);
            assertThatThrownBy(()->translation.translate(owner.id,item.id(),translationRequest(item,false)))
                    .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.AI_TRANSLATION_FAILED));
        }
        when(translator.isAvailable(anyString())).thenReturn(false);
        assertThatThrownBy(()->translation.translate(owner.id,item.id(),translationRequest(item,false)))
                .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.AI_UNAVAILABLE));
        assertThat(transcripts.get(owner.id,item.id(),null).version()).isEqualTo(1);
    }

    @Test void translationRejectsLateResultsAfterEditReRecognitionDeletionOrAccountRevocation() throws Exception {
        for(String change:List.of("edit","recognize","delete","revoke")) {
            var owner=login(); var item=generate(owner,source(owner)); prepareTranslation();
            doAnswer(call->{
                assertThat(org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive()).isFalse();
                switch(change) {
                    case "edit" -> transcripts.update(owner.id,item.id(),new UpdateTranscriptRequest(1,item.segments()));
                    case "recognize" -> generate(owner,item.mediaId(),true);
                    case "delete" -> media.delete(owner.id,item.mediaId());
                    default -> users.deleteAccount(owner.id,new DeleteUserRequest(PASSWORD,jdbc.queryForObject("SELECT username FROM app_user WHERE id=?",String.class,owner.id)));
                }
                return item.segments().stream().map(s->new SubtitleTranslator.Translation(s.id(),"late")).toList();
            }).when(translator).translate(anyList(),anyString(),anyString());
            assertThatThrownBy(()->translation.translate(owner.id,item.id(),translationRequest(item,false))).isInstanceOf(BusinessException.class);
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM transcript_revision WHERE transcript_id=?",Integer.class,item.id())).isEqualTo(1+(change.equals("edit")?1:0));
        }
    }

    private void prepareTranslation() {
        when(translator.isAvailable(anyString())).thenReturn(true);
        doAnswer(call->{
            List<TranscriptSegment> segments=call.getArgument(0); var values=new ArrayList<SubtitleTranslator.Translation>();
            for(int i=0;i<segments.size();i++) values.add(new SubtitleTranslator.Translation(segments.get(i).id(),"Hello "+(i+1)));
            return values;
        }).when(translator).translate(anyList(),anyString(),anyString());
    }
    private TranslateTranscriptRequest translationRequest(TranscriptVO item,boolean original) {
        return new TranslateTranscriptRequest(item.version(),"en",(original?item.originalSegments():item.segments()).stream().map(TranscriptSegment::id).toList(),original);
    }

    @Test void searchAndRecommendationsReturnOnlyExactVersionedEvidenceWithoutCreatingTasks() throws Exception {
        var owner=login(); var item=generate(owner,source(owner));
        when(analyzer.isAvailable(anyString())).thenReturn(true);
        var first=item.segments().getFirst(); var last=item.segments().getLast();
        when(analyzer.analyze(anyString(),anyList(),any(),anyInt(),anyLong(),anyString())).thenReturn(List.of(new TranscriptAnalyzer.Selection(first.id(),last.id(),0.95,null,null)));
        var result=mvc.perform(post("/api/media/"+item.mediaId()+"/search").cookie(owner.cookie).header("X-CSRF-Token",owner.csrf)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(new SearchTranscriptRequest("第二段",UUID.fromString(item.id()),1,null))))
                .andExpect(status().isOk()).andExpect(jsonPath("data.matches[0].startMs").value(100))
                .andExpect(jsonPath("data.matches[0].endMs").value(4000)).andExpect(jsonPath("data.matches[0].evidence[0].text").value("你好，世界。"))
                .andExpect(jsonPath("data.matches[0].evidence[1].text").value("第二段字幕。")).andReturn();
        assertThat(result.getResponse().getContentAsString()).doesNotContain("storageKey","userId","runToken");
        verify(analyzer).analyze(eq("第二段"),eq(item.segments()),eq(TranscriptAnalyzer.Mode.SEARCH),eq(10),eq(0L),eq(owner.id));
        when(analyzer.analyze(anyString(),anyList(),any(),anyInt(),anyLong(),anyString())).thenReturn(List.of(new TranscriptAnalyzer.Selection(first.id(),last.id(),null,"相关片段","依据字幕中的第二段。")));
        var recommendations=analysis.recommend(owner.id,item.mediaId(),new RecommendClipsRequest("第二段",UUID.fromString(item.id()),1,4000L,null));
        assertThat(recommendations.clips().getFirst().evidence().getLast().text()).isEqualTo(last.text());
        assertThat(recommendations.clips().getFirst().startMs()).isEqualTo(first.startMs());
        assertThat(recommendations.clips().getFirst().endMs()).isEqualTo(last.endMs());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM media_task WHERE media_id=?",Integer.class,item.mediaId())).isEqualTo(1);
    }

    @Test void analysisReturnsEmptyResultsHonestlyAndEnforcesOwnerCsrfAndCredentialBoundaries() throws Exception {
        var owner=login(); var other=login(); var item=generate(owner,source(owner));
        var request=new SearchTranscriptRequest("不存在的内容",UUID.fromString(item.id()),1,10);
        when(analyzer.isAvailable(anyString())).thenReturn(true); when(analyzer.analyze(anyString(),anyList(),any(),anyInt(),anyLong(),anyString())).thenReturn(List.of());
        assertThat(analysis.search(owner.id,item.mediaId(),request).matches()).isEmpty();
        assertThat(analysis.recommend(owner.id,item.mediaId(),new RecommendClipsRequest("none",UUID.fromString(item.id()),1,1000L,3)).clips()).isEmpty();
        clearInvocations(analyzer);
        mvc.perform(post("/api/media/"+item.mediaId()+"/search").cookie(other.cookie).header("X-CSRF-Token",other.csrf)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(request))).andExpect(status().isNotFound());
        mvc.perform(post("/api/media/"+item.mediaId()+"/search").cookie(owner.cookie)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(request))).andExpect(status().isForbidden());
        mvc.perform(post("/api/media/"+item.mediaId()+"/search").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(analyzer);
        when(analyzer.isAvailable(anyString())).thenReturn(false);
        mvc.perform(post("/api/media/"+item.mediaId()+"/search").cookie(owner.cookie).header("X-CSRF-Token",owner.csrf)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(request))).andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("code").value("AI_UNAVAILABLE"));
    }

    @Test void unknownReversedOverlappingAndOutOfBudgetSelectionsAreRejected() throws Exception {
        var owner=login(); var item=generate(owner,source(owner)); var first=item.segments().getFirst(); var last=item.segments().getLast();
        when(analyzer.isAvailable(anyString())).thenReturn(true);
        var request=new SearchTranscriptRequest("test",UUID.fromString(item.id()),1,10);
        for(var selections:List.of(List.of(new TranscriptAnalyzer.Selection(UUID.randomUUID(),last.id(),0.9,null,null)),
                List.of(new TranscriptAnalyzer.Selection(last.id(),first.id(),0.9,null,null)),
                List.of(new TranscriptAnalyzer.Selection(first.id(),last.id(),0.9,null,null),new TranscriptAnalyzer.Selection(last.id(),last.id(),0.8,null,null)),
                List.of(new TranscriptAnalyzer.Selection(first.id(),first.id(),Double.NaN,null,null)))) {
            when(analyzer.analyze(anyString(),anyList(),any(),anyInt(),anyLong(),anyString())).thenReturn(selections);
            assertThatThrownBy(()->analysis.search(owner.id,item.mediaId(),request)).isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.AI_ANALYSIS_FAILED));
        }
        when(analyzer.analyze(anyString(),anyList(),any(),anyInt(),anyLong(),anyString())).thenReturn(List.of(new TranscriptAnalyzer.Selection(first.id(),last.id(),null,"title","reason")));
        assertThatThrownBy(()->analysis.recommend(owner.id,item.mediaId(),new RecommendClipsRequest("test",UUID.fromString(item.id()),1,1000L,3)))
                .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.AI_ANALYSIS_FAILED));
    }

    @Test void modifiedAndReplacedSubtitlesRejectStaleAnalysisIncludingVersionOneAba() throws Exception {
        var owner=login(); var item=generate(owner,source(owner)); var first=item.segments().getFirst();
        when(analyzer.isAvailable(anyString())).thenReturn(true);
        when(analyzer.analyze(anyString(),anyList(),any(),anyInt(),anyLong(),anyString())).thenAnswer(call->{
            assertThat(org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive()).isFalse();
            transcripts.update(owner.id,item.id(),new UpdateTranscriptRequest(1,item.segments()));
            return List.of(new TranscriptAnalyzer.Selection(first.id(),first.id(),0.9,null,null));
        });
        assertThatThrownBy(()->analysis.search(owner.id,item.mediaId(),new SearchTranscriptRequest("test",UUID.fromString(item.id()),1,10)))
                .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.TRANSCRIPT_VERSION_CONFLICT));
        var fresh=generate(owner,item.mediaId(),true); assertThat(fresh.version()).isEqualTo(1);
        clearInvocations(analyzer);
        assertThatThrownBy(()->analysis.search(owner.id,item.mediaId(),new SearchTranscriptRequest("test",UUID.fromString(item.id()),1,10)))
                .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.TRANSCRIPT_VERSION_CONFLICT));
        verifyNoInteractions(analyzer);
        doAnswer(call->{ generate(owner,item.mediaId(),true); return List.of(new TranscriptAnalyzer.Selection(fresh.segments().getFirst().id(),fresh.segments().getFirst().id(),0.9,null,null)); })
                .when(analyzer).analyze(anyString(),anyList(),any(),anyInt(),anyLong(),anyString());
        assertThatThrownBy(()->analysis.search(owner.id,item.mediaId(),new SearchTranscriptRequest("test",UUID.fromString(fresh.id()),1,10)))
                .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.TRANSCRIPT_VERSION_CONFLICT));
    }

    @Test void deletedSourceDuringAnalysisCannotReturnOldEvidence() throws Exception {
        var owner=login(); var item=generate(owner,source(owner)); var first=item.segments().getFirst();
        when(analyzer.isAvailable(anyString())).thenReturn(true);
        when(analyzer.analyze(anyString(),anyList(),any(),anyInt(),anyLong(),anyString())).thenAnswer(call->{
            media.delete(owner.id,item.mediaId()); return List.of(new TranscriptAnalyzer.Selection(first.id(),first.id(),0.9,null,null));
        });
        assertThatThrownBy(()->analysis.search(owner.id,item.mediaId(),new SearchTranscriptRequest("test",UUID.fromString(item.id()),1,10)))
                .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.RESOURCE_NOT_FOUND));
    }

    @Test void analysisInputLimitsAndRequestValidationApplyBeforeCloudCalls() throws Exception {
        var owner=login(); var item=generate(owner,source(owner));
        var many=new ArrayList<TranscriptSegment>();
        for(int index=0;index<601;index++) many.add(new TranscriptSegment(UUID.randomUUID(),index*2L,index*2L+1,"text"));
        var large=transcripts.update(owner.id,item.id(),new UpdateTranscriptRequest(1,many));
        assertThatThrownBy(()->analysis.search(owner.id,item.mediaId(),new SearchTranscriptRequest("test",UUID.fromString(item.id()),large.version(),10)))
                .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.TRANSCRIPT_ANALYSIS_TOO_LARGE));
        verifyNoInteractions(analyzer);
        var bytes=new ArrayList<TranscriptSegment>();
        for(int index=0;index<70;index++) bytes.add(new TranscriptSegment(UUID.randomUUID(),index*2L,index*2L+1,"字".repeat(2000)));
        var longText=transcripts.update(owner.id,item.id(),new UpdateTranscriptRequest(large.version(),bytes));
        assertThatThrownBy(()->analysis.search(owner.id,item.mediaId(),new SearchTranscriptRequest("test",UUID.fromString(item.id()),longText.version(),10)))
                .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.TRANSCRIPT_ANALYSIS_TOO_LARGE));
        verifyNoInteractions(analyzer);
        for(String body:List.of("{\"query\":\" \",\"transcriptId\":\""+item.id()+"\",\"transcriptVersion\":1}",
                "{\"query\":\"test\",\"transcriptId\":\""+item.id()+"\",\"transcriptVersion\":1,\"limit\":21}"))
            mvc.perform(post("/api/media/"+item.mediaId()+"/search").cookie(owner.cookie).header("X-CSRF-Token",owner.csrf)
                    .contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isUnprocessableEntity());
    }

    @Test void subtitleBurnUsesAnImmutableQueuedVersionAndPublishesOnePrivateOutput() throws Exception {
        var owner=login(); var item=generate(owner,source(owner)); prepareBurn();
        var plan=processing.create(owner.id,new CreatePlanRequest(UUID.fromString(item.mediaId()),burnParameters(item),null));
        assertThat(plan.summary()).contains("烧录字幕 v1");
        var task=processing.execute(owner.id,plan.id(),1); assertThat(processing.execute(owner.id,plan.id(),1).id()).isEqualTo(task.id());
        transcripts.update(owner.id,item.id(),new UpdateTranscriptRequest(1,List.of(new TranscriptSegment(UUID.randomUUID(),100L,1100L,"新版文字"))));
        doAnswer(call->{
            assertThat(org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive()).isFalse();
            Path ass=call.getArgument(4,Path.class); assertThat(Files.readString(ass)).contains("你好，世界。").doesNotContain("新版文字");
            Files.write(call.getArgument(1,Path.class),new byte[]{2,3,4}); return null;
        }).when(transcoder).burnSubtitles(any(),any(),any(),any(),any(),any());
        worker.runOne(); var done=processing.task(owner.id,task.id());
        assertThat(done.status().name()).isEqualTo("SUCCEEDED"); assertThat(done.outputs()).hasSize(1);
        assertThat(done.outputs().getFirst().filename()).endsWith("-subtitled.mp4");
        assertThat(((BurnSubtitleParameters)done.parameters()).transcriptVersion()).isEqualTo(1);
        try(var files=Files.walk(root)) { assertThat(files.filter(path->path.toString().endsWith(".ass")).toList()).isEmpty(); }
        var preview=mvc.perform(get(done.outputs().getFirst().previewUrl()).cookie(owner.cookie).header("Range","bytes=0-1"))
                .andExpect(request().asyncStarted()).andReturn();
        mvc.perform(asyncDispatch(preview)).andExpect(status().isPartialContent()).andExpect(header().string("Cache-Control","no-store"))
                .andExpect(content().bytes(new byte[]{2,3}));
        var download=mvc.perform(get(done.outputs().getFirst().downloadUrl()).cookie(owner.cookie)).andExpect(request().asyncStarted()).andReturn();
        mvc.perform(asyncDispatch(download)).andExpect(status().isOk()).andExpect(content().bytes(new byte[]{2,3,4}));
    }

    @Test void nativeSubtitleBurnRunsThroughTheWorkerAndAuthenticatedDownload() throws Exception {
        var owner=login(); var item=generate(owner,source(owner)); prepareBurn();
        String key=jdbc.queryForObject("SELECT storage_key FROM media WHERE id=?",String.class,item.mediaId());
        Path input=storage.resolve(key);
        var make=new ProcessBuilder("ffmpeg","-v","error","-f","lavfi","-i","color=c=black:s=160x90:r=20:d=5",
                "-f","lavfi","-i","sine=frequency=440:sample_rate=48000:duration=5","-c:v","libx264","-c:a","aac","-pix_fmt","yuv420p","-f","mp4","-y",input.toString())
                .redirectOutput(ProcessBuilder.Redirect.DISCARD).redirectError(ProcessBuilder.Redirect.DISCARD).start();
        try { assertThat(make.waitFor(15,java.util.concurrent.TimeUnit.SECONDS)).isTrue(); assertThat(make.exitValue()).isZero(); }
        finally { make.destroyForcibly(); }
        byte[] original=Files.readAllBytes(input);
        jdbc.update("UPDATE media SET size_bytes=? WHERE id=?",original.length,item.mediaId());
        var nativeTool=new org.example.ai_media_workbench.service.impl.FfmpegMediaTranscoder(new org.example.ai_media_workbench.properties.TranscodeProperties(
                "ffmpeg",Duration.ofSeconds(20),Duration.ofMinutes(7),20,org.springframework.util.unit.DataSize.ofMegabytes(10),false));
        var nativeProbe=new org.example.ai_media_workbench.service.impl.FfprobeMediaProbe(new org.example.ai_media_workbench.properties.MediaToolProperties(
                "ffprobe",Duration.ofSeconds(10),Duration.ofMinutes(2),1000,false),json);
        assertThat(nativeTool.isSubtitleBurnAvailable()).isTrue();
        when(probe.inspect(any())).thenAnswer(call->nativeProbe.inspect(call.getArgument(0,Path.class)));
        doAnswer(call->{ nativeTool.burnSubtitles(call.getArgument(0),call.getArgument(1),call.getArgument(2),call.getArgument(3),call.getArgument(4),call.getArgument(5)); return null; })
                .when(transcoder).burnSubtitles(any(),any(),any(),any(),any(),any());
        var plan=processing.create(owner.id,new CreatePlanRequest(UUID.fromString(item.mediaId()),burnParameters(item),null));
        var task=processing.execute(owner.id,plan.id(),1); worker.runOne(); var done=processing.task(owner.id,task.id());
        assertThat(done.status().name()).isEqualTo("SUCCEEDED"); var output=done.outputs().getFirst();
        assertThat(output.metadata().videoCodec()).isEqualTo("h264"); assertThat(output.metadata().audioCodec()).isEqualTo("aac");
        var download=mvc.perform(get(output.downloadUrl()).cookie(owner.cookie)).andExpect(request().asyncStarted()).andReturn();
        var response=mvc.perform(asyncDispatch(download)).andExpect(status().isOk()).andReturn();
        assertThat(response.getResponse().getContentAsByteArray().length).isEqualTo(output.sizeBytes());
        assertThat(Files.readAllBytes(input)).isEqualTo(original);
        mvc.perform(get(output.previewUrl())).andExpect(status().isUnauthorized());
        try(var files=Files.walk(root.resolve(owner.id))) { assertThat(files.filter(path->path.toString().endsWith(".ass")).toList()).isEmpty(); }
    }

    @Test void subtitleBurnRejectsStalePlansForeignTranscriptsAndUnconfiguredTools() throws Exception {
        var owner=login(); var other=login(); var item=generate(owner,source(owner)); prepareBurn();
        var plan=processing.create(owner.id,new CreatePlanRequest(UUID.fromString(item.mediaId()),burnParameters(item),null));
        transcripts.update(owner.id,item.id(),new UpdateTranscriptRequest(1,item.segments()));
        assertThatThrownBy(()->processing.execute(owner.id,plan.id(),1))
                .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.TRANSCRIPT_VERSION_CONFLICT));
        assertThatThrownBy(()->processing.create(owner.id,new CreatePlanRequest(UUID.fromString(item.mediaId()),burnParameters(item),null)))
                .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.TRANSCRIPT_VERSION_CONFLICT));
        var otherSource=source(other);
        assertThatThrownBy(()->processing.create(other.id,new CreatePlanRequest(UUID.fromString(otherSource),burnParameters(item),null)))
                .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.RESOURCE_NOT_FOUND));
        var sameOwnerOtherSource=source(owner);
        assertThatThrownBy(()->processing.create(owner.id,new CreatePlanRequest(UUID.fromString(sameOwnerOtherSource),burnParameters(item),null)))
                .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.RESOURCE_NOT_FOUND));
        when(transcoder.isSubtitleBurnAvailable()).thenReturn(false);
        var latest=transcripts.latest(owner.id,item.mediaId());
        assertThatThrownBy(()->processing.create(owner.id,new CreatePlanRequest(UUID.fromString(item.mediaId()),burnParameters(latest),null)))
                .isInstanceOfSatisfying(BusinessException.class,e->assertThat(e.code()).isEqualTo(ErrorCode.SUBTITLE_BURN_UNAVAILABLE));
        verify(transcoder,never()).burnSubtitles(any(),any(),any(),any(),any(),any());
    }

    @Test void subtitleBurnRequestValidationAndCsrfFailBeforeAnyTaskIsEnqueued() throws Exception {
        var owner=login(); var item=generate(owner,source(owner)); prepareBurn();
        var valid=burnParameters(item);
        var invalid=new ArrayList<JsonNode>();
        for(String key:List.of("transcriptId","transcriptVersion","resolutionPreset","audioMode")) {
            var node=(tools.jackson.databind.node.ObjectNode)valid.deepCopy(); node.remove(key); invalid.add(node);
        }
        invalid.add(((tools.jackson.databind.node.ObjectNode)valid.deepCopy()).put("transcriptVersion",1.5));
        invalid.add(((tools.jackson.databind.node.ObjectNode)valid.deepCopy()).put("transcriptVersion",0));
        invalid.add(((tools.jackson.databind.node.ObjectNode)valid.deepCopy()).put("transcriptId","../../external.ass"));
        invalid.add(((tools.jackson.databind.node.ObjectNode)valid.deepCopy()).put("audioMode","mute"));
        invalid.add(((tools.jackson.databind.node.ObjectNode)valid.deepCopy()).put("font","../../file"));
        for(var node:invalid) mvc.perform(post("/api/operation-plans").cookie(owner.cookie).header("X-CSRF-Token",owner.csrf)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsBytes(Map.of("mediaId",item.mediaId(),"parameters",node))))
                .andExpect(status().isUnprocessableEntity());
        mvc.perform(post("/api/operation-plans").cookie(owner.cookie).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsBytes(Map.of("mediaId",item.mediaId(),"parameters",valid)))).andExpect(status().isForbidden());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM media_task WHERE user_id=?",Integer.class,owner.id)).isEqualTo(1);
    }

    @Test void subtitleBurnFailureCancellationAndDeletionNeverPublishPartialFiles() throws Exception {
        var owner=login(); var item=generate(owner,source(owner)); prepareBurn();
        var plan=processing.create(owner.id,new CreatePlanRequest(UUID.fromString(item.mediaId()),burnParameters(item),null));
        var failed=processing.execute(owner.id,plan.id(),1);
        doAnswer(call->{ Files.write(call.getArgument(1,Path.class),new byte[]{1}); throw new BusinessException(ErrorCode.TRANSCODE_FAILED); })
                .when(transcoder).burnSubtitles(any(),any(),any(),any(),any(),any());
        worker.runOne(); assertThat(processing.task(owner.id,failed.id()).error().code()).isEqualTo("SUBTITLE_BURN_FAILED");
        var next=processing.create(owner.id,new CreatePlanRequest(UUID.fromString(item.mediaId()),burnParameters(item),null));
        var cancel=processing.execute(owner.id,next.id(),1);
        doAnswer(call->{
            Files.write(call.getArgument(1,Path.class),new byte[]{1}); processing.cancel(owner.id,cancel.id());
            assertThat(call.getArgument(5,BooleanSupplier.class).getAsBoolean()).isTrue(); return null;
        }).when(transcoder).burnSubtitles(any(),any(),any(),any(),any(),any());
        worker.runOne(); assertThat(processing.task(owner.id,cancel.id()).status().name()).isEqualTo("CANCELLED");
        var deletedPlan=processing.create(owner.id,new CreatePlanRequest(UUID.fromString(item.mediaId()),burnParameters(item),null));
        var deleted=processing.execute(owner.id,deletedPlan.id(),1);
        doAnswer(call->{ media.delete(owner.id,item.mediaId()); Files.write(call.getArgument(1,Path.class),new byte[]{1}); return null; })
                .when(transcoder).burnSubtitles(any(),any(),any(),any(),any(),any());
        worker.runOne();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM output_file WHERE task_id IN (?,?,?)",Integer.class,failed.id(),cancel.id(),deleted.id())).isZero();
        try(var files=Files.walk(root.resolve(owner.id))) { assertThat(files.filter(path->path.toString().endsWith(".ass") || path.toString().endsWith(".mp4")).toList()).isEmpty(); }
    }

    @Test void privateSubtitleCleanupFailureRetainsLeaseUntilExpiredRecoveryRemovesAllFiles() throws Exception {
        var owner=login(); var item=generate(owner,source(owner)); prepareBurn();
        var plan=processing.create(owner.id,new CreatePlanRequest(UUID.fromString(item.mediaId()),burnParameters(item),null));
        var task=processing.execute(owner.id,plan.id(),1);
        doThrow(new java.io.IOException("test failure")).when(storage).discardOutputAuxiliary(endsWith(".mp4"));
        worker.runOne();
        assertThat(jdbc.queryForObject("SELECT run_token FROM media_task WHERE id=?",String.class,task.id())).isNotBlank();
        assertThat(processing.task(owner.id,task.id()).outputs()).isEmpty();
        jdbc.update("UPDATE media_task SET lease_started_at=? WHERE id=?",LocalDateTime.now().minusDays(1),task.id());
        doCallRealMethod().when(storage).discardOutputAuxiliary(anyString()); worker.runOne();
        assertThat(processing.task(owner.id,task.id()).error().code()).isEqualTo("TASK_INTERRUPTED");
        try(var files=Files.walk(root.resolve(owner.id))) { assertThat(files.filter(path->path.toString().endsWith(".ass") || path.toString().endsWith(".mp4")).toList()).isEmpty(); }
    }

    private void prepareBurn() {
        when(transcoder.isAvailable()).thenReturn(true); when(transcoder.isSubtitleBurnAvailable()).thenReturn(true);
        when(probe.inspect(any())).thenReturn(sourceMetadata);
        doAnswer(call->{ Files.write(call.getArgument(1,Path.class),new byte[]{1,2,3}); return null; })
                .when(transcoder).burnSubtitles(any(),any(),any(),any(),any(),any());
    }
    private JsonNode burnParameters(TranscriptVO item) {
        return json.valueToTree(new BurnSubtitleParameters("burn_subtitles","mp4",UUID.fromString(item.id()),item.version(),"source","keep"));
    }

    private TranscriptVO generate(Browser owner,String id) { return generate(owner,id,false); }
    private TranscriptVO generate(Browser owner,String id,boolean force) {
        var task=transcripts.transcribe(owner.id,id,new TranscriptionRequest("zh-CN",force,"tencent")); worker.runOne();
        assertThat(processing.task(owner.id,task.id()).status().name()).isEqualTo("SUCCEEDED"); return transcripts.latest(owner.id,id);
    }
    private String source(Browser user) {
        String id=UUID.randomUUID().toString(); var stored=storage.store(user.id,new MockMultipartFile("file","视频.mp4","video/mp4",new byte[]{1}));
        jdbc.update("INSERT INTO media(id,user_id,original_filename,storage_key,size_bytes,kind,status,metadata_json,created_at,updated_at) VALUES(?,?,?,?,1,'VIDEO','READY',?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",
                id,user.id,"视频.mp4",stored.key(),json.writeValueAsString(sourceMetadata)); return id;
    }
    private Browser login() throws Exception {
        String id=UUID.randomUUID().toString(),name="s_"+id.replace("-","").substring(0,16);
        jdbc.update("INSERT INTO app_user(id,username,email,password_hash,display_name,email_verified,status,created_at,updated_at) VALUES(?,?,?,?,?,TRUE,'ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",
                id,name,name+"@example.com",passwords.encode(PASSWORD),name);
        var csrf=mvc.perform(get("/api/auth/csrf")).andReturn();
        var login=mvc.perform(post("/api/auth/login").cookie(cookie(csrf)).header("X-CSRF-Token",data(csrf).path("token").asText())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("username",name,"password",PASSWORD))))
                .andExpect(status().isOk()).andReturn(); return new Browser(id,cookie(login),data(login).path("csrfToken").asText());
    }
    private JsonNode data(MvcResult result) { return json.readTree(result.getResponse().getContentAsByteArray()).path("data"); }
    private Cookie cookie(MvcResult result) {
        String header=result.getResponse().getHeaders("Set-Cookie").stream().filter(value->value.startsWith("AMW_SESSION=")).findFirst().orElseThrow();
        return new Cookie("AMW_SESSION",header.substring(12).split(";",2)[0]);
    }
    private record Browser(String id,Cookie cookie,String csrf) {}
}
