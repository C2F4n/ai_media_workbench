package org.example.ai_media_workbench;

import jakarta.servlet.http.Cookie;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.mapper.MediaMapper;
import org.example.ai_media_workbench.service.MediaProbe;
import org.example.ai_media_workbench.service.impl.MediaProbeWorker;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doReturn;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:media_tests;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
        "app.media.max-upload-size=2048B"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MediaIntegrationTests {
    @TempDir static Path root;
    @DynamicPropertySource
    static void storage(DynamicPropertyRegistry registry) { registry.add("app.storage.root",()->root.toString()); }
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JdbcTemplate jdbc;
    @Autowired PasswordEncoder passwords;
    @Autowired MediaProbeWorker worker;
    @Autowired MediaMapper media;
    @Autowired org.example.ai_media_workbench.service.MediaService mediaService;
    @Autowired org.example.ai_media_workbench.service.AccountCleanupService cleanup;
    @Autowired jakarta.servlet.MultipartConfigElement multipartLimits;
    @MockitoBean MediaProbe probe;
    private final MediaMetadataVO metadata=new MediaMetadataVO("mov,mp4",1200,160,90,"h264",false,null);

    @BeforeEach
    void prepareProbe() {
        jdbc.update("UPDATE account_cleanup_job SET status='DONE'");
        jdbc.update("UPDATE media SET status='FAILED' WHERE status='PROBING'");
        when(probe.isAvailable()).thenReturn(true);
        when(probe.inspect(any())).thenReturn(metadata);
    }

    @Test
    void uploadIsProjectFreeAndOtherUsersCannotReadOrRetryIt() throws Exception {
        Browser owner=login(),other=login();
        var result=upload(owner,"../../video.mp4",new byte[]{1,2,3});
        assertThat(result.getResponse().getStatus()).isEqualTo(202);
        var body=json.readTree(result.getResponse().getContentAsString());
        String id=body.path("data").path("id").asText();
        assertThat(result.getResponse().getHeader("Location")).isEqualTo("/api/media/"+id);
        assertThat(body.path("data").path("originalFilename").asText()).isEqualTo("video.mp4");
        assertThat(result.getResponse().getContentAsString()).doesNotContain("projectId","userId","storageKey","probeToken");
        mvc.perform(get("/api/media").cookie(owner.cookie())).andExpect(status().isOk())
                .andExpect(jsonPath("data.total").value(1)).andExpect(jsonPath("data.items[0].status").value("PROBING"));
        mvc.perform(get("/api/media").cookie(other.cookie())).andExpect(jsonPath("data.total").value(0));
        mvc.perform(get("/api/media").param("userId",owner.id()).cookie(other.cookie())).andExpect(status().isBadRequest());
        mvc.perform(get("/api/media/"+id).cookie(other.cookie())).andExpect(status().isNotFound());
        mvc.perform(post("/api/media/"+id+"/probe").cookie(other.cookie()).header("X-CSRF-Token",other.csrf()))
                .andExpect(status().isNotFound());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM legacy_project WHERE user_id=?",Integer.class,owner.id())).isZero();
    }

    @Test
    void uploadRequiresAuthenticationCsrfAndExactlyOneNonemptyFile() throws Exception {
        assertThat(multipartLimits.getMaxFileSize()).isEqualTo(2048);
        assertThat(multipartLimits.getMaxRequestSize()).isGreaterThan(multipartLimits.getMaxFileSize());
        Browser browser=login();
        var file=new MockMultipartFile("file","video.mp4","video/mp4",new byte[]{1});
        mvc.perform(multipart("/api/media").file(file)).andExpect(status().isUnauthorized());
        mvc.perform(multipart("/api/media").file(file).cookie(browser.cookie())).andExpect(status().isForbidden());
        mvc.perform(multipart("/api/media").file(file).cookie(browser.cookie()).header("X-CSRF-Token",browser.csrf())
                .param("projectId",UUID.randomUUID().toString())).andExpect(status().isBadRequest());
        mvc.perform(multipart("/api/media").file(file).file(file).cookie(browser.cookie())
                .header("X-CSRF-Token",browser.csrf())).andExpect(status().isBadRequest());
        assertThat(upload(browser,"empty.mp4",new byte[0]).getResponse().getStatus()).isEqualTo(422);
        assertThat(upload(browser,"large.mp4",new byte[2049]).getResponse().getStatus()).isEqualTo(413);
        mvc.perform(get("/api/media?pageSize=101").cookie(browser.cookie())).andExpect(status().isUnprocessableEntity());
    }

    @Test
    void workerWritesMetadataAndReclaimsAnExpiredLease() throws Exception {
        Browser browser=login();
        String id=id(upload(browser,"video.mp4",new byte[]{1}));
        jdbc.update("UPDATE media SET probe_token=?,probe_started_at=? WHERE id=?","old-token",LocalDateTime.now().minusDays(1),id);
        assertThat(worker.runOne()).isTrue();
        mvc.perform(get("/api/media/"+id).cookie(browser.cookie())).andExpect(status().isOk())
                .andExpect(jsonPath("data.status").value("READY")).andExpect(jsonPath("data.metadata.width").value(160))
                .andExpect(jsonPath("data.kind").value("VIDEO")).andExpect(jsonPath("data.previewUrl").value("/api/media/"+id+"/preview"));
        var stale=media.findOwned(browser.id(),id); stale.setProbeToken("old-token");
        assertThat(media.complete(stale)).isZero();
        mvc.perform(post("/api/media/"+id+"/probe").cookie(browser.cookie()).header("X-CSRF-Token",browser.csrf()))
                .andExpect(status().isConflict());
    }

    @Test
    void failedDetectionCanBeRetriedAndDurationLimitIsEnforced() throws Exception {
        Browser browser=login();
        String id=id(upload(browser,"broken.mp4",new byte[]{1}));
        when(probe.inspect(any())).thenThrow(new BusinessException(ErrorCode.MEDIA_PROBE_FAILED));
        worker.runOne();
        mvc.perform(get("/api/media/"+id).cookie(browser.cookie())).andExpect(status().isOk())
                .andExpect(jsonPath("data.status").value("FAILED")).andExpect(jsonPath("data.error.code").value("MEDIA_PROBE_FAILED"));
        for(int attempt=0;attempt<2;attempt++) mvc.perform(post("/api/media/"+id+"/probe").cookie(browser.cookie())
                .header("X-CSRF-Token",browser.csrf())).andExpect(status().isAccepted());
        doReturn(new MediaMetadataVO("mov",900001,160,90,"h264",false,null)).when(probe).inspect(any());
        worker.runOne();
        mvc.perform(get("/api/media/"+id).cookie(browser.cookie())).andExpect(jsonPath("data.error.code").value("MEDIA_DURATION_EXCEEDED"));
    }

    @Test
    void accountDeletionDuringDetectionCannotResurrectTheMedia() throws Exception {
        Browser browser=login();
        String id=id(upload(browser,"video.mp4",new byte[]{1}));
        when(probe.inspect(any())).thenAnswer(call->{
            jdbc.update("UPDATE app_user SET status='DELETED' WHERE id=?",browser.id());
            jdbc.update("UPDATE media SET deleted_at=CURRENT_TIMESTAMP WHERE id=?",id);
            return metadata;
        });
        worker.runOne();
        assertThat(jdbc.queryForObject("SELECT status FROM media WHERE id=?",String.class,id)).isEqualTo("PROBING");
        assertThat(media.findOwned(browser.id(),id)).isNull();
    }

    @Test
    void missingToolRejectsUploadWithoutCreatingARecord() throws Exception {
        Browser browser=login(); when(probe.isAvailable()).thenReturn(false);
        assertThat(upload(browser,"video.mp4",new byte[]{1}).getResponse().getStatus()).isEqualTo(503);
        assertThat(media.countOwned(browser.id())).isZero();
    }

    @Test
    void deletionIsAuthenticatedScopedIdempotentAndCleansOnlyTheSelectedFile() throws Exception {
        Browser owner=login(),other=login();
        String id=id(upload(owner,"remove.mp4",new byte[]{1}));
        String keep=id(upload(owner,"keep.mp4",new byte[]{2}));
        String otherId=id(upload(other,"private.mp4",new byte[]{3}));
        Path deletedFile=root.resolve(media.findOwned(owner.id(),id).getStorageKey());
        mvc.perform(delete("/api/media/"+id)).andExpect(status().isUnauthorized());
        mvc.perform(delete("/api/media/"+id).cookie(owner.cookie())).andExpect(status().isForbidden());
        mvc.perform(delete("/api/media/"+id).cookie(other.cookie()).header("X-CSRF-Token",other.csrf()))
                .andExpect(status().isNotFound());
        mvc.perform(delete("/api/media/"+UUID.randomUUID()).cookie(owner.cookie()).header("X-CSRF-Token",owner.csrf()))
                .andExpect(status().isNotFound());
        for(int i=0;i<2;i++) mvc.perform(delete("/api/media/"+id).cookie(owner.cookie()).header("X-CSRF-Token",owner.csrf()))
                .andExpect(status().isOk()).andExpect(jsonPath("code").value("SUCCESS"))
                .andExpect(jsonPath("data").isEmpty()).andExpect(jsonPath("details").isArray());
        mvc.perform(get("/api/media/"+id).cookie(owner.cookie())).andExpect(status().isNotFound());
        mvc.perform(post("/api/media/"+id+"/probe").cookie(owner.cookie()).header("X-CSRF-Token",owner.csrf()))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/media").cookie(owner.cookie())).andExpect(jsonPath("data.total").value(1));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM account_cleanup_job WHERE user_id=?",Integer.class,owner.id())).isEqualTo(1);
        cleanup.runPending();
        assertThat(java.nio.file.Files.exists(deletedFile)).isFalse();
        assertThat(java.nio.file.Files.exists(root.resolve(media.findOwned(owner.id(),keep).getStorageKey()))).isTrue();
        assertThat(java.nio.file.Files.exists(root.resolve(media.findOwned(other.id(),otherId).getStorageKey()))).isTrue();
        assertThat(jdbc.queryForObject("SELECT status FROM app_user WHERE id=?",String.class,owner.id())).isEqualTo("ACTIVE");
    }

    @Test
    void deletionDuringDetectionCannotResurrectMediaAndDefersDiskCleanupUntilTheLeaseEnds() throws Exception {
        Browser owner=login(); String id=id(upload(owner,"probing.mp4",new byte[]{1}));
        Path file=root.resolve(media.findOwned(owner.id(),id).getStorageKey());
        when(probe.inspect(any())).thenAnswer(call->{ mediaService.delete(owner.id(),id); return metadata; });
        worker.runOne();
        assertThat(media.findOwned(owner.id(),id)).isNull();
        assertThat(jdbc.queryForObject("SELECT status FROM media WHERE id=?",String.class,id)).isEqualTo("PROBING");
        var ready=jdbc.queryForObject("SELECT next_attempt_at FROM account_cleanup_job WHERE user_id=? AND media_id=?",LocalDateTime.class,owner.id(),id);
        assertThat(ready).isAfter(java.time.LocalDateTime.now(java.time.ZoneOffset.UTC).plusSeconds(60));
        cleanup.runPending(); assertThat(java.nio.file.Files.exists(file)).isTrue();
        jdbc.update("UPDATE account_cleanup_job SET next_attempt_at=? WHERE user_id=?",LocalDateTime.now().minusDays(1),owner.id());
        cleanup.runPending(); assertThat(java.nio.file.Files.exists(file)).isFalse();
    }

    @Test
    void cleanupQueueFailureRollsBackDeletionAndActiveResourcesCannotBeCleaned() throws Exception {
        Browser owner=login(); String id=id(upload(owner,"protected.mp4",new byte[]{1}));
        String key=media.findOwned(owner.id(),id).getStorageKey();
        jdbc.update("INSERT INTO account_cleanup_job(id,user_id,media_id,scope_key,status,attempts,next_attempt_at,created_at,updated_at) VALUES(?,?,?,?,'QUEUED',0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",
                UUID.randomUUID().toString(),owner.id(),id,id);
        jdbc.update("UPDATE account_cleanup_job SET next_attempt_at=? WHERE user_id=?",LocalDateTime.now().minusDays(1),owner.id());
        org.assertj.core.api.Assertions.assertThatThrownBy(()->mediaService.delete(owner.id(),id))
                .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
        assertThat(media.findOwned(owner.id(),id)).isNotNull();
        cleanup.runPending();
        assertThat(java.nio.file.Files.exists(root.resolve(key))).isTrue();
        assertThat(jdbc.queryForObject("SELECT status FROM account_cleanup_job WHERE user_id=?",String.class,owner.id())).isEqualTo("FAILED");
    }

    @Test void sourcePreviewStreamsExactBytesAndSharesSingleRangeRulesWithOutputs() throws Exception {
        Browser owner = login(); byte[] bytes = new byte[]{0,1,2,3,4,5,6,7,8,9};
        String id = ready(owner, "../原片.mp4", bytes);
        var full = assertPreview(owner, id, null, 200, bytes);
        assertThat(org.springframework.http.ContentDisposition.parse(full.getResponse().getHeader("Content-Disposition")).getFilename()).isEqualTo("原片.mp4");
        assertPreview(owner, id, "bytes=2-4", 206, new byte[]{2,3,4});
        assertPreview(owner, id, "bytes=7-", 206, new byte[]{7,8,9});
        assertPreview(owner, id, "bytes=-3", 206, new byte[]{7,8,9});
        assertPreview(owner, id, "bytes=7-100", 206, new byte[]{7,8,9});
        assertPreview(owner, id, "bytes=-100", 206, bytes);
        for (String range : java.util.List.of("broken", "bytes=invalid", "bytes=0-1,4-5", "bytes=999999999999999999999999-"))
            assertPreview(owner, id, range, 200, bytes);
        mvc.perform(get("/api/media/"+id+"/preview").cookie(owner.cookie()).header("Range", "bytes=10-"))
                .andExpect(status().isRequestedRangeNotSatisfiable()).andExpect(header().string("Content-Range", "bytes */10"))
                .andExpect(jsonPath("code").value("RANGE_NOT_SATISFIABLE")).andExpect(jsonPath("data").isEmpty());
    }

    @Test void sourcePreviewAuthenticatesBeforeCheckingOwnershipOrRange() throws Exception {
        Browser owner = login(), other = login(); String id = ready(owner, "private.mp4", new byte[]{1,2});
        String url = "/api/media/"+id+"/preview";
        mvc.perform(get(url)).andExpect(status().isUnauthorized()).andExpect(jsonPath("code").value("UNAUTHENTICATED"));
        for (String target : java.util.List.of(url, "/api/media/"+UUID.randomUUID()+"/preview"))
            mvc.perform(get(target).cookie(other.cookie()).header("Range", "bytes=999-"))
                    .andExpect(status().isNotFound()).andExpect(jsonPath("code").value("RESOURCE_NOT_FOUND"));
        mvc.perform(get("/api/media/not-a-uuid/preview").cookie(owner.cookie())).andExpect(status().isBadRequest());
        assertPreview(owner, id, "bytes=0-0", 206, new byte[]{1});
        when(probe.isAvailable()).thenReturn(false);
        assertPreview(owner, id, null, 200, new byte[]{1,2});
    }

    @Test void sourcePreviewUsesDetectedContainerAndCodecsNotFilenameOrUploadMime() throws Exception {
        Browser owner = login(); String id = id(upload(owner, "misleading.mp4", new byte[]{1}));
        for (String state : java.util.List.of("PROBING", "FAILED")) {
            jdbc.update("UPDATE media SET status=? WHERE id=?", state, id);
            mvc.perform(get("/api/media/"+id).cookie(owner.cookie())).andExpect(jsonPath("data.previewUrl").isEmpty());
            mvc.perform(get("/api/media/"+id+"/preview").cookie(owner.cookie())).andExpect(status().isConflict())
                    .andExpect(jsonPath("code").value("MEDIA_PREVIEW_UNAVAILABLE"));
        }
        for (var info : java.util.List.of(new MediaMetadataVO("matroska,webm",1200,160,90,"h264",false,null),
                new MediaMetadataVO("mov,mp4",1200,160,90,"hevc",true,"aac"),
                new MediaMetadataVO("mov,mp4",1200,160,90,"h264",true,"ac3"))) {
            jdbc.update("UPDATE media SET kind='VIDEO',status='READY',metadata_json=? WHERE id=?", json.writeValueAsString(info), id);
            mvc.perform(get("/api/media/"+id).cookie(owner.cookie())).andExpect(jsonPath("data.previewUrl").isEmpty());
            mvc.perform(get("/api/media/"+id+"/preview").cookie(owner.cookie())).andExpect(status().isConflict());
        }
        jdbc.update("UPDATE media SET metadata_json=? WHERE id=?", json.writeValueAsString(
                new MediaMetadataVO("mov,mp4",1200,160,90,"h264",true,"aac")), id);
        assertPreview(owner, id, null, 200, new byte[]{1});
    }

    @Test void missingChangedOrEscapedSourceFilesReturnResultBeforeStartingAStream() throws Exception {
        Browser owner = login(); String id = ready(owner, "source.mp4", new byte[]{1,2,3});
        var item = media.findOwned(owner.id(), id); Path file = root.resolve(item.getStorageKey());
        java.nio.file.Files.write(file, new byte[]{1});
        mvc.perform(get("/api/media/"+id+"/preview").cookie(owner.cookie())).andExpect(status().isConflict())
                .andExpect(jsonPath("code").value("MEDIA_PREVIEW_UNAVAILABLE")).andExpect(jsonPath("data").isEmpty());
        java.nio.file.Files.delete(file);
        mvc.perform(get("/api/media/"+id+"/preview").cookie(owner.cookie())).andExpect(status().isConflict());
        jdbc.update("UPDATE media SET storage_key='../outside.mp4' WHERE id=?", id);
        var response = mvc.perform(get("/api/media/"+id+"/preview").cookie(owner.cookie())).andExpect(status().isConflict()).andReturn();
        assertThat(response.getResponse().getContentAsString()).doesNotContain(root.toString(), "outside.mp4", "storageKey");
        assertThat(mediaService.get(owner.id(), id).status().name()).isEqualTo("READY");
    }

    @Test void deletedSourcesAndRevokedSessionsCannotStartAnotherPreview() throws Exception {
        Browser owner = login(); String remove = ready(owner, "remove.mp4", new byte[]{1});
        String keep = ready(owner, "keep.mp4", new byte[]{2});
        mediaService.delete(owner.id(), remove);
        mvc.perform(get("/api/media/"+remove+"/preview").cookie(owner.cookie())).andExpect(status().isNotFound());
        assertPreview(owner, keep, null, 200, new byte[]{2});
        mvc.perform(post("/api/auth/logout").cookie(owner.cookie()).header("X-CSRF-Token", owner.csrf())).andExpect(status().isOk());
        mvc.perform(get("/api/media/"+keep+"/preview").cookie(owner.cookie())).andExpect(status().isUnauthorized());
    }

    private String ready(Browser owner, String filename, byte[] bytes) throws Exception {
        String id = id(upload(owner, filename, bytes)); assertThat(worker.runOne()).isTrue(); return id;
    }

    private MvcResult assertPreview(Browser owner, String id, String range, int expected, byte[] bytes) throws Exception {
        var requestBuilder = get("/api/media/"+id+"/preview").cookie(owner.cookie());
        if (range != null) requestBuilder.header("Range", range);
        var initial = mvc.perform(requestBuilder).andExpect(request().asyncStarted()).andReturn();
        return mvc.perform(asyncDispatch(initial)).andExpect(status().is(expected)).andExpect(content().bytes(bytes))
                .andExpect(content().contentType("video/mp4")).andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(header().string("Accept-Ranges", "bytes")).andExpect(header().string("Content-Length", Integer.toString(bytes.length))).andReturn();
    }

    private MvcResult upload(Browser browser,String filename,byte[] bytes) throws Exception {
        return mvc.perform(multipart("/api/media").file(new MockMultipartFile("file",filename,"video/mp4",bytes))
                .cookie(browser.cookie()).header("X-CSRF-Token",browser.csrf())).andReturn();
    }

    private String id(MvcResult result) { return json.readTree(result.getResponse().getContentAsByteArray()).path("data").path("id").asText(); }

    private Browser login() throws Exception {
        String id=UUID.randomUUID().toString(),name="m_"+id.replace("-","").substring(0,16);
        jdbc.update("INSERT INTO app_user(id,username,email,password_hash,display_name,email_verified,status,created_at,updated_at) VALUES(?,?,?,?,?,TRUE,'ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",
                id,name,name+"@example.com",passwords.encode("Media-Testing-Passphrase!"),name);
        var csrf=mvc.perform(get("/api/auth/csrf")).andReturn();
        Cookie cookie=cookie(csrf);
        String token=json.readTree(csrf.getResponse().getContentAsString()).path("data").path("token").asText();
        var login=mvc.perform(post("/api/auth/login").cookie(cookie).header("X-CSRF-Token",token)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("username",name,"password","Media-Testing-Passphrase!"))))
                .andExpect(status().isOk()).andReturn();
        return new Browser(id,cookie(login),json.readTree(login.getResponse().getContentAsString()).path("data").path("csrfToken").asText());
    }

    private Cookie cookie(MvcResult result) {
        String value=result.getResponse().getHeaders("Set-Cookie").stream().filter(x->x.startsWith("AMW_SESSION=")).findFirst().orElseThrow();
        return new Cookie("AMW_SESSION",value.substring("AMW_SESSION=".length()).split(";",2)[0]);
    }
    private record Browser(String id,Cookie cookie,String csrf) {}
}
