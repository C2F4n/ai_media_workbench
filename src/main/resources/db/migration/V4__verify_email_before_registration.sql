CREATE TABLE registration_email_challenge (
    id CHAR(36) NOT NULL PRIMARY KEY,
    email VARCHAR(254) NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    consumed_at DATETIME(6),
    created_at DATETIME(6) NOT NULL,
    INDEX idx_registration_email_expiry (expires_at)
);

-- 旧账号的未验证邮箱不能阻挡真正持有者注册；原账号和项目均保留。
ALTER TABLE app_user DROP INDEX uk_app_user_email;
ALTER TABLE app_user ADD COLUMN verified_email VARCHAR(254)
    GENERATED ALWAYS AS (CASE WHEN email_verified = TRUE THEN email ELSE NULL END);
ALTER TABLE app_user ADD CONSTRAINT uk_app_user_verified_email UNIQUE (verified_email);
