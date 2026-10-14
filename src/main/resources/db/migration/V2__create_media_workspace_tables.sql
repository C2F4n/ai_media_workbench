CREATE TABLE project (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6),
    CONSTRAINT fk_project_user FOREIGN KEY (user_id) REFERENCES app_user(id)
);
CREATE INDEX idx_project_owner_updated ON project(user_id, updated_at, id);

CREATE TABLE media (
    id CHAR(36) NOT NULL PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    storage_key VARCHAR(255) NOT NULL,
    size_bytes BIGINT NOT NULL,
    kind VARCHAR(16),
    status VARCHAR(16) NOT NULL,
    metadata_json JSON,
    error_code VARCHAR(64),
    error_message VARCHAR(500),
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6),
    CONSTRAINT fk_media_project FOREIGN KEY (project_id) REFERENCES project(id),
    CONSTRAINT ck_media_size CHECK (size_bytes > 0),
    CONSTRAINT ck_media_status CHECK (status IN ('PROBING', 'READY', 'FAILED')),
    CONSTRAINT ck_media_kind CHECK (kind IS NULL OR kind IN ('VIDEO', 'AUDIO')),
    CONSTRAINT uk_media_project_id UNIQUE (project_id, id)
);
CREATE INDEX idx_media_project_created ON media(project_id, created_at, id);

CREATE TABLE operation_plan (
    id CHAR(36) NOT NULL PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    media_id CHAR(36) NOT NULL,
    version INT NOT NULL,
    status VARCHAR(16) NOT NULL,
    instruction TEXT,
    parameters_json JSON,
    summary TEXT NOT NULL,
    questions_json JSON NOT NULL,
    warnings_json JSON NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6),
    CONSTRAINT fk_plan_media FOREIGN KEY (project_id, media_id) REFERENCES media(project_id, id),
    CONSTRAINT ck_plan_version CHECK (version > 0),
    CONSTRAINT ck_plan_status CHECK (status IN ('NEEDS_INPUT', 'READY', 'EXECUTED')),
    CONSTRAINT uk_plan_project_id UNIQUE (project_id, id)
);
CREATE INDEX idx_plan_project_created ON operation_plan(project_id, created_at, id);

CREATE TABLE media_task (
    id CHAR(36) NOT NULL PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    media_id CHAR(36) NOT NULL,
    plan_id CHAR(36),
    plan_version INT,
    kind VARCHAR(24) NOT NULL,
    source_id CHAR(36) NOT NULL,
    source_version INT,
    parameters_json JSON,
    status VARCHAR(16) NOT NULL,
    stage VARCHAR(24) NOT NULL,
    progress_percent INT,
    error_code VARCHAR(64),
    error_message VARCHAR(500),
    created_at DATETIME(6) NOT NULL,
    started_at DATETIME(6),
    finished_at DATETIME(6),
    deleted_at DATETIME(6),
    CONSTRAINT uk_task_plan UNIQUE (plan_id),
    CONSTRAINT fk_task_media FOREIGN KEY (project_id, media_id) REFERENCES media(project_id, id),
    CONSTRAINT fk_task_plan FOREIGN KEY (project_id, plan_id) REFERENCES operation_plan(project_id, id),
    CONSTRAINT ck_task_status CHECK (status IN ('QUEUED', 'RUNNING', 'CANCELLING', 'CANCELLED', 'SUCCEEDED', 'FAILED')),
    CONSTRAINT ck_task_kind CHECK (kind IN ('MEDIA_PROCESSING', 'TRANSCRIPTION', 'CLIP_EXPORT')),
    CONSTRAINT ck_task_progress CHECK (progress_percent IS NULL OR progress_percent BETWEEN 0 AND 100),
    CONSTRAINT uk_task_project_id UNIQUE (project_id, id)
);
CREATE INDEX idx_task_project_created ON media_task(project_id, created_at, id);
CREATE INDEX idx_task_queue ON media_task(status, created_at);

CREATE TABLE output_file (
    id CHAR(36) NOT NULL PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    task_id CHAR(36) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    storage_key VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    metadata_json JSON,
    created_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6),
    CONSTRAINT fk_output_task FOREIGN KEY (project_id, task_id) REFERENCES media_task(project_id, id),
    CONSTRAINT ck_output_size CHECK (size_bytes > 0)
);
CREATE INDEX idx_output_project_created ON output_file(project_id, created_at, id);
