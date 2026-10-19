package org.example.ai_media_workbench;

import java.util.UUID;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import com.zaxxer.hikari.HikariDataSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LightweightMigrationTests {
    @Test
    void existingResourcesKeepTheirOwnerAndHistoricalProjectsAreArchived() {
        String url="jdbc:h2:mem:migration_"+UUID.randomUUID()+";MODE=MySQL;DATABASE_TO_LOWER=TRUE";
        var source=new HikariDataSource();
        source.setJdbcUrl(url); source.setUsername("sa"); source.setPassword(""); source.setMaximumPoolSize(2);
        var jdbc=new JdbcTemplate(source);
        try {
            Flyway.configure().dataSource(source).target("4").load().migrate();
            String user=UUID.randomUUID().toString(),other=UUID.randomUUID().toString(),project=UUID.randomUUID().toString();
            String media=UUID.randomUUID().toString(),plan=UUID.randomUUID().toString(),task=UUID.randomUUID().toString(),output=UUID.randomUUID().toString();
            for(String id:new String[]{user,other}) jdbc.update("INSERT INTO app_user(id,username,email,password_hash,display_name,email_verified,status,created_at,updated_at) VALUES(?,?,?,?,?,TRUE,'ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",
                    id,id.replace("-","").substring(0,20),id+"@example.com","test-only","Test");
            jdbc.update("INSERT INTO project(id,user_id,name,created_at,updated_at) VALUES(?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",project,user,"Preserved history");
            jdbc.update("INSERT INTO media(id,project_id,original_filename,storage_key,size_bytes,status,created_at,updated_at) VALUES(?,?,?,?,1,'READY',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",media,project,"video.mp4","safe.mp4");
            jdbc.update("INSERT INTO operation_plan(id,project_id,media_id,version,status,summary,questions_json,warnings_json,created_at,updated_at) VALUES(?,?,?,1,'READY','test','[]','[]',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",plan,project,media);
            jdbc.update("INSERT INTO media_task(id,project_id,media_id,plan_id,plan_version,kind,source_id,status,stage,created_at) VALUES(?,?,?,?,1,'MEDIA_PROCESSING',?,'SUCCEEDED','DONE',CURRENT_TIMESTAMP)",task,project,media,plan,plan);
            jdbc.update("INSERT INTO output_file(id,project_id,task_id,filename,storage_key,content_type,size_bytes,created_at) VALUES(?,?,?,?,?,'video/mp4',1,CURRENT_TIMESTAMP)",output,project,task,"output.mp4","output.mp4");
            jdbc.update("INSERT INTO account_cleanup_job(id,user_id,status,next_attempt_at,created_at,updated_at) VALUES(?,?,'QUEUED',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",UUID.randomUUID().toString(),user);
            Flyway.configure().dataSource(source).load().migrate();
            for(String table:new String[]{"media","operation_plan","media_task","output_file"}) {
                assertThat(jdbc.queryForObject("SELECT user_id FROM "+table,String.class)).isEqualTo(user);
                assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM information_schema.columns WHERE table_name=? AND column_name='project_id'",Integer.class,table)).isZero();
            }
            assertThat(jdbc.queryForObject("SELECT name FROM legacy_project WHERE id=?",String.class,project)).isEqualTo("Preserved history");
            assertThatThrownBy(()->jdbc.update("UPDATE operation_plan SET user_id=? WHERE id=?",other,plan))
                    .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
            assertThat(jdbc.queryForObject("SELECT scope_key FROM account_cleanup_job WHERE user_id=?",String.class,user)).isEqualTo("ACCOUNT");
            assertThatThrownBy(()->jdbc.update("INSERT INTO account_cleanup_job(id,user_id,status,next_attempt_at,created_at,updated_at) VALUES(?,?,'QUEUED',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",UUID.randomUUID().toString(),user))
                    .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
            jdbc.update("INSERT INTO account_cleanup_job(id,user_id,media_id,scope_key,status,next_attempt_at,created_at,updated_at) VALUES(?,?,?,?,'QUEUED',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",UUID.randomUUID().toString(),user,media,media);
            assertThatThrownBy(()->jdbc.update("INSERT INTO account_cleanup_job(id,user_id,media_id,scope_key,status,next_attempt_at,created_at,updated_at) VALUES(?,?,?,?,'QUEUED',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",UUID.randomUUID().toString(),other,media,media))
                    .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
        } finally { source.close(); }
    }
}
