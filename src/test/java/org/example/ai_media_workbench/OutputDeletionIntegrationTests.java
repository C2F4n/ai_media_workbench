package org.example.ai_media_workbench;

import jakarta.servlet.http.Cookie;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;
import org.example.ai_media_workbench.common.storage.LocalMediaStorage;
import org.example.ai_media_workbench.dto.processing.CreatePlanRequest;
import org.example.ai_media_workbench.dto.user.DeleteUserRequest;
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

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties="spring.datasource.url=jdbc:h2:mem:output_deletion_tests;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE")
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OutputDeletionIntegrationTests {
    @TempDir static Path root;
    @DynamicPropertySource static void storage(DynamicPropertyRegistry registry) { registry.add("app.storage.root", () -> root.toString()); }
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JdbcTemplate jdbc;
    @Autowired PasswordEncoder passwords;
    @Autowired OutputService outputs;
    @Autowired ProcessingService processing;
    @Autowired MediaService media;
    @Autowired UserService users;
    @Autowired LocalMediaStorage storage;
    @Autowired TranscodeWorker worker;
    @Autowired AccountCleanupService cleanup;
    @MockitoBean MediaProbe probe;
    @MockitoBean MediaTranscoder transcoder;
    private static final String PASSWORD="Testing-2026!";
    private static final byte[] BYTES="verified-output".getBytes(java.nio.charset.StandardCharsets.US_ASCII);
    private final MediaMetadataVO metadata=new MediaMetadataVO("mov",1200,160,90,"h264",true,"aac");

    @BeforeEach void prepare() throws Exception {
        jdbc.update("UPDATE account_cleanup_job SET status='DONE'");
        when(probe.isAvailable()).thenReturn(true);
        when(probe.inspect(any())).thenReturn(metadata);
        when(probe.inspectAudio(any())).thenReturn(new MediaMetadataVO("mp3",1200,null,null,null,true,"mp3"));
        when(transcoder.isAvailable()).thenReturn(true);
        when(transcoder.isAudioExtractionAvailable()).thenReturn(true);
        doAnswer(call->{ Files.write(call.getArgument(1,Path.class),BYTES); return null; })
                .when(transcoder).convert(any(),any(),any(),any(),any());
    }

    @Test void deleteRequiresAuthenticationCsrfAndOwnershipAndRetainsTheOriginalWorkflow() throws Exception {
        Browser owner=login(),other=login(); String mediaId=source(owner);
        var result=completed(owner,mediaId,false);
        mvc.perform(delete("/api/outputs/"+result.id())).andExpect(status().isUnauthorized());
        mvc.perform(delete("/api/outputs/"+result.id()).cookie(owner.cookie())).andExpect(status().isForbidden());
        remove(other,result.id(),404); remove(owner,UUID.randomUUID().toString(),404);
        remove(owner,result.id(),200); remove(owner,result.id(),200);
        for(String suffix:List.of("","/preview","/download"))
            mvc.perform(get("/api/outputs/"+result.id()+suffix).cookie(owner.cookie())).andExpect(status().isNotFound());
        mvc.perform(get("/api/outputs").cookie(owner.cookie())).andExpect(jsonPath("data.total").value(0));
        mvc.perform(get("/api/tasks/"+result.taskId()).cookie(owner.cookie())).andExpect(status().isOk())
                .andExpect(jsonPath("data.status").value("SUCCEEDED")).andExpect(jsonPath("data.outputs").isEmpty());
        assertThat(processing.plan(owner.id(),result.planId()).status().name()).isEqualTo("EXECUTED");
        assertThat(processing.execute(owner.id(),result.planId(),1).id()).isEqualTo(result.taskId());
        assertThat(media.get(owner.id(),mediaId).status().name()).isEqualTo("READY");
        assertThat(jobCount(owner)).isEqualTo(1);
        cleanup.runPending(); assertThat(Files.exists(result.path())).isFalse();
        var replacement=completed(owner,mediaId,false);
        assertThat(replacement.taskId()).isNotEqualTo(result.taskId());
        assertThat(Files.readAllBytes(replacement.path())).isEqualTo(BYTES);
    }

    @Test void deletingAnMp3PreservesOtherResultsAndCoexistsWithMediaAndAccountCleanup() throws Exception {
        Browser owner=login(),other=login(); String mediaId=source(owner),otherMedia=source(other);
        var video=completed(owner,mediaId,false); var audio=completed(owner,mediaId,true);
        var privateVideo=completed(other,otherMedia,false);
        assertThat(outputs.get(owner.id(),audio.id()).contentType()).isEqualTo("audio/mpeg");
        outputs.delete(owner.id(),audio.id()); cleanup.runPending();
        assertThat(Files.exists(audio.path())).isFalse();
        assertThat(Files.exists(video.path())).isTrue(); assertThat(Files.exists(privateVideo.path())).isTrue();
        assertThat(processing.task(owner.id(),audio.taskId()).outputs()).isEmpty();
        assertThat(processing.task(owner.id(),video.taskId()).outputs()).hasSize(1);
        media.delete(owner.id(),mediaId); cleanup.runPending();
        outputs.delete(owner.id(),audio.id());
        assertThat(Files.exists(video.path())).isFalse(); assertThat(Files.exists(privateVideo.path())).isTrue();
        users.deleteAccount(owner.id(),new DeleteUserRequest(PASSWORD,owner.name())); cleanup.runPending();
        assertThat(jobCount(owner)).isEqualTo(3);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM account_cleanup_job WHERE user_id=? AND status='DONE'",Integer.class,owner.id())).isEqualTo(3);
        assertThat(Files.exists(privateVideo.path())).isTrue();
    }

    @Test void aMissingFileCanStillBeDeletedAndItsMetadataIsHiddenImmediately() throws Exception {
        Browser owner=login(); String mediaId=source(owner); var result=completed(owner,mediaId,false);
        Files.delete(result.path());
        mvc.perform(get("/api/outputs/"+result.id()).cookie(owner.cookie())).andExpect(status().isGone());
        remove(owner,result.id(),200); cleanup.runPending();
        assertThat(jdbc.queryForObject("SELECT status FROM account_cleanup_job WHERE output_id=?",String.class,result.id())).isEqualTo("DONE");
        assertThat(media.get(owner.id(),mediaId)).isNotNull();
        assertThat(processing.task(owner.id(),result.taskId()).outputs()).isEmpty();
    }

    @Test void queueFailureRollsBackDeletionAndCleanupRefusesAnActiveOutput() throws Exception {
        Browser owner=login(); var result=completed(owner,source(owner),false);
        jdbc.update("INSERT INTO account_cleanup_job(id,user_id,output_id,scope_key,status,attempts,next_attempt_at,created_at,updated_at) VALUES(?,?,?,?,'QUEUED',0,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",
                UUID.randomUUID().toString(),owner.id(),result.id(),"OUTPUT:"+result.id(),LocalDateTime.now().minusDays(1));
        assertThatThrownBy(()->outputs.delete(owner.id(),result.id())).isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
        assertThat(outputs.get(owner.id(),result.id())).isNotNull();
        cleanup.runPending(); assertThat(Files.exists(result.path())).isTrue();
        assertThat(jdbc.queryForObject("SELECT status FROM account_cleanup_job WHERE output_id=?",String.class,result.id())).isEqualTo("FAILED");
    }

    @Test void failedCleanupCanRecoverFromItsPersistentLeaseWithoutDeletingOtherFiles() throws Exception {
        Browser owner=login(); String mediaId=source(owner);
        var result=completed(owner,mediaId,false);
        var keep=completed(owner,mediaId,true);
        Files.delete(result.path()); Files.createDirectory(result.path());
        outputs.delete(owner.id(),result.id()); cleanup.runPending();
        assertThat(jdbc.queryForObject("SELECT status FROM account_cleanup_job WHERE output_id=?",String.class,result.id())).isEqualTo("FAILED");
        assertThat(Files.isDirectory(result.path())).isTrue(); assertThat(Files.exists(keep.path())).isTrue();
        Files.delete(result.path()); Files.write(result.path(),BYTES);
        jdbc.update("UPDATE account_cleanup_job SET status='RUNNING',updated_at=? WHERE output_id=?",LocalDateTime.now().minusDays(1),result.id());
        cleanup.runPending();
        assertThat(Files.exists(result.path())).isFalse(); assertThat(Files.exists(keep.path())).isTrue();
        assertThat(jdbc.queryForObject("SELECT status FROM account_cleanup_job WHERE output_id=?",String.class,result.id())).isEqualTo("DONE");
        assertThat(jdbc.queryForObject("SELECT attempts FROM account_cleanup_job WHERE output_id=?",Integer.class,result.id())).isEqualTo(2);
    }

    @Test void concurrentResultAndMediaDeletionRemainIdempotentAndCleanBothScopes() throws Exception {
        Browser owner=login(); String mediaId=source(owner); var result=completed(owner,mediaId,false);
        try(var pool=Executors.newFixedThreadPool(2)) {
            List<Callable<Void>> duplicates=List.of(()->{ outputs.delete(owner.id(),result.id()); return null; },
                    ()->{ outputs.delete(owner.id(),result.id()); return null; });
            for(var call:pool.invokeAll(duplicates)) call.get();
            assertThat(jobCount(owner)).isEqualTo(1);
            List<Callable<Void>> both=List.of(()->{ outputs.delete(owner.id(),result.id()); return null; },
                    ()->{ media.delete(owner.id(),mediaId); return null; });
            for(var call:pool.invokeAll(both)) call.get();
        }
        cleanup.runPending(); assertThat(jobCount(owner)).isEqualTo(2);
        try(var files=Files.list(root.resolve(owner.id()))) { assertThat(files.count()).isZero(); }
    }

    private void remove(Browser owner,String id,int code) throws Exception {
        var response=mvc.perform(delete("/api/outputs/"+id).cookie(owner.cookie()).header("X-CSRF-Token",owner.csrf()))
                .andExpect(status().is(code));
        if(code==200) response.andExpect(jsonPath("code").value("SUCCESS")).andExpect(jsonPath("data").isEmpty())
                .andExpect(jsonPath("details").isArray()).andExpect(header().exists("X-Request-Id"));
    }
    private int jobCount(Browser owner) { return jdbc.queryForObject("SELECT COUNT(*) FROM account_cleanup_job WHERE user_id=?",Integer.class,owner.id()); }
    private Completed completed(Browser owner,String mediaId,boolean audio) {
        Object parameters=audio ? Map.of("operation","extract_audio","outputFormat","mp3")
                : Map.of("operation","transcode","outputFormat","mp4","resolutionPreset","source","audioMode","keep");
        var plan=processing.create(owner.id(),new CreatePlanRequest(UUID.fromString(mediaId),json.valueToTree(parameters),null));
        var task=processing.execute(owner.id(),plan.id(),1); assertThat(worker.runOne()).isTrue();
        var output=processing.task(owner.id(),task.id()).outputs().getFirst();
        return new Completed(plan.id(),task.id(),output.id(),outputs.file(owner.id(),output.id()).path());
    }
    private String source(Browser owner) {
        String id=UUID.randomUUID().toString();
        var stored=storage.store(owner.id(),new MockMultipartFile("file","video.mp4","video/mp4",new byte[]{1}));
        jdbc.update("INSERT INTO media(id,user_id,original_filename,storage_key,size_bytes,kind,status,metadata_json,created_at,updated_at) VALUES(?,?,?,?,1,'VIDEO','READY',?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",
                id,owner.id(),"video.mp4",stored.key(),json.writeValueAsString(metadata));
        return id;
    }
    private Browser login() throws Exception {
        String id=UUID.randomUUID().toString(),name="o_"+id.replace("-","").substring(0,16);
        jdbc.update("INSERT INTO app_user(id,username,email,password_hash,display_name,email_verified,status,created_at,updated_at) VALUES(?,?,?,?,?,TRUE,'ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",
                id,name,name+"@example.com",passwords.encode(PASSWORD),name);
        var csrf=mvc.perform(get("/api/auth/csrf")).andReturn();
        String token=json.readTree(csrf.getResponse().getContentAsString()).path("data").path("token").asText();
        var login=mvc.perform(post("/api/auth/login").cookie(cookie(csrf)).header("X-CSRF-Token",token)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("username",name,"password",PASSWORD))))
                .andExpect(status().isOk()).andReturn();
        return new Browser(id,name,cookie(login),json.readTree(login.getResponse().getContentAsString()).path("data").path("csrfToken").asText());
    }
    private Cookie cookie(MvcResult result) {
        String value=result.getResponse().getHeaders("Set-Cookie").stream().filter(x->x.startsWith("AMW_SESSION=")).findFirst().orElseThrow();
        return new Cookie("AMW_SESSION",value.substring("AMW_SESSION=".length()).split(";",2)[0]);
    }
    private record Browser(String id,String name,Cookie cookie,String csrf) {}
    private record Completed(String planId,String taskId,String id,Path path) {}
}
