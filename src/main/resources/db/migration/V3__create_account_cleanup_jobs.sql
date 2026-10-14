CREATE TABLE account_cleanup_job (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    status VARCHAR(16) NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    next_attempt_at DATETIME(6) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    CONSTRAINT uk_account_cleanup_user UNIQUE (user_id),
    CONSTRAINT fk_account_cleanup_user FOREIGN KEY (user_id) REFERENCES app_user(id),
    CONSTRAINT ck_account_cleanup_status CHECK (status IN ('QUEUED', 'RUNNING', 'DONE', 'FAILED')),
    CONSTRAINT ck_account_cleanup_attempts CHECK (attempts >= 0)
);
CREATE INDEX idx_account_cleanup_pending ON account_cleanup_job(status, next_attempt_at);
