CREATE TABLE cloud_credential (
    user_id CHAR(36) NOT NULL,
    provider VARCHAR(16) NOT NULL,
    mode VARCHAR(16) NOT NULL,
    encrypted_payload VARCHAR(8192) NULL,
    version INT NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (user_id, provider),
    CONSTRAINT fk_cloud_credential_user FOREIGN KEY (user_id) REFERENCES app_user(id),
    CONSTRAINT ck_cloud_credential_provider CHECK (provider IN ('tencent','aliyun','deepseek')),
    CONSTRAINT ck_cloud_credential_mode CHECK (mode IN ('SERVER','PERSONAL','OFF')),
    CONSTRAINT ck_cloud_credential_version CHECK (version >= 1),
    CONSTRAINT ck_cloud_credential_payload CHECK (
        (mode='PERSONAL' AND encrypted_payload IS NOT NULL) OR (mode<>'PERSONAL' AND encrypted_payload IS NULL))
);
