package org.example.ai_media_workbench;

import com.zaxxer.hikari.HikariDataSource;
import java.util.UUID;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;

class DefaultAccountMigrationTests {
    @Test
    void freshDatabaseCreatesAccountWithArgon2idPasswordAndDoesNotRestoreItAfterChanges() {
        try (var source = dataSource()) {
            var flyway = Flyway.configure().dataSource(source).load();
            flyway.migrate();
            var jdbc = new JdbcTemplate(source);
            var encoder = new Argon2PasswordEncoder(16, 32, 1, 19456, 2);
            String hash = jdbc.queryForObject("SELECT password_hash FROM app_user WHERE username='admin'", String.class);
            assertThat(hash).startsWith("$argon2id$").isNotEqualTo("Aa018779");
            assertThat(encoder.matches("Aa018779", hash)).isTrue();
            assertThat(encoder.matches("incorrect-password", hash)).isFalse();
            assertThat(jdbc.queryForObject("SELECT status FROM app_user WHERE username='admin'", String.class)).isEqualTo("ACTIVE");
            assertThat(jdbc.queryForObject("SELECT email_verified FROM app_user WHERE username='admin'", Boolean.class)).isFalse();

            String changedHash = encoder.encode("Changed-password-2026");
            jdbc.update("UPDATE app_user SET password_hash=?, display_name='Changed' WHERE username='admin'", changedHash);
            assertThat(flyway.migrate().migrationsExecuted).isZero();
            assertThat(jdbc.queryForObject("SELECT password_hash FROM app_user WHERE username='admin'", String.class)).isEqualTo(changedHash);
            jdbc.update("UPDATE app_user SET status='DELETED', password_hash='!DELETED' WHERE username='admin'");
            flyway.migrate();
            assertThat(jdbc.queryForObject("SELECT status FROM app_user WHERE username='admin'", String.class)).isEqualTo("DELETED");
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM app_user WHERE username='admin'", Integer.class)).isEqualTo(1);
        }
    }

    @Test
    void upgradePreservesAnExistingAdminAccount() {
        try (var source = dataSource()) {
            Flyway.configure().dataSource(source).target("11").load().migrate();
            var jdbc = new JdbcTemplate(source);
            String id = UUID.randomUUID().toString();
            jdbc.update("INSERT INTO app_user(id,username,email,display_name,password_hash,email_verified,status,created_at,updated_at) "
                    + "VALUES(?,'admin','owner@example.com','Existing owner','existing-password-hash',TRUE,'DISABLED',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)", id);
            Flyway.configure().dataSource(source).load().migrate();
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM app_user WHERE username='admin'", Integer.class)).isEqualTo(1);
            assertThat(jdbc.queryForObject("SELECT id FROM app_user WHERE username='admin'", String.class)).isEqualTo(id);
            assertThat(jdbc.queryForObject("SELECT password_hash FROM app_user WHERE username='admin'", String.class)).isEqualTo("existing-password-hash");
            assertThat(jdbc.queryForObject("SELECT email FROM app_user WHERE username='admin'", String.class)).isEqualTo("owner@example.com");
            assertThat(jdbc.queryForObject("SELECT status FROM app_user WHERE username='admin'", String.class)).isEqualTo("DISABLED");
        }
    }

    private HikariDataSource dataSource() {
        var source = new HikariDataSource();
        source.setJdbcUrl("jdbc:h2:mem:default_account_" + UUID.randomUUID() + ";MODE=MySQL;DATABASE_TO_LOWER=TRUE");
        source.setUsername("sa");
        source.setPassword("");
        source.setMaximumPoolSize(2);
        return source;
    }
}
