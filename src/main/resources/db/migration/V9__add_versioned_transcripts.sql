CREATE TABLE transcript (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    media_id CHAR(36) NOT NULL,
    source_task_id CHAR(36) NOT NULL,
    version INT NOT NULL,
    language VARCHAR(16) NOT NULL,
    original_segments_json MEDIUMTEXT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    CONSTRAINT uk_transcript_owner_id UNIQUE (user_id, id),
    CONSTRAINT uk_transcript_source_task UNIQUE (source_task_id),
    CONSTRAINT fk_transcript_owned_media FOREIGN KEY (user_id, media_id) REFERENCES media(user_id, id),
    CONSTRAINT fk_transcript_owned_task FOREIGN KEY (user_id, source_task_id) REFERENCES media_task(user_id, id),
    CONSTRAINT ck_transcript_version CHECK (version >= 1),
    CONSTRAINT ck_transcript_language CHECK (language = 'zh-CN')
);
CREATE INDEX idx_transcript_media_created ON transcript(user_id, media_id, created_at, id);

CREATE TABLE transcript_revision (
    user_id CHAR(36) NOT NULL,
    transcript_id CHAR(36) NOT NULL,
    version INT NOT NULL,
    segments_json MEDIUMTEXT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (transcript_id, version),
    CONSTRAINT fk_revision_owned_transcript FOREIGN KEY (user_id, transcript_id) REFERENCES transcript(user_id, id),
    CONSTRAINT ck_revision_version CHECK (version >= 1)
);
