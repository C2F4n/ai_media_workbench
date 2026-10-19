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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
    @Autowired jakarta.servlet.MultipartConfigElement multipartLimits;
    @MockitoBean MediaProbe probe;
    private final MediaMetadataVO metadata=new MediaMetadataVO("mov,mp4",1200,160,90,"h264",false,null);

    @BeforeEach
    void prepareProbe() {
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
                .andExpect(jsonPath("data.kind").value("VIDEO")).andExpect(jsonPath("data.previewUrl").isEmpty());
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
