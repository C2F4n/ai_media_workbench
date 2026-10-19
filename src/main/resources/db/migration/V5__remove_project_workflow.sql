ALTER TABLE media ADD COLUMN user_id CHAR(36);
ALTER TABLE operation_plan ADD COLUMN user_id CHAR(36);
ALTER TABLE media_task ADD COLUMN user_id CHAR(36);
ALTER TABLE output_file ADD COLUMN user_id CHAR(36);

UPDATE media SET user_id = (SELECT p.user_id FROM project p WHERE p.id = media.project_id);
UPDATE operation_plan SET user_id = (SELECT p.user_id FROM project p WHERE p.id = operation_plan.project_id);
UPDATE media_task SET user_id = (SELECT p.user_id FROM project p WHERE p.id = media_task.project_id);
UPDATE output_file SET user_id = (SELECT p.user_id FROM project p WHERE p.id = output_file.project_id);

ALTER TABLE media MODIFY COLUMN user_id CHAR(36) NOT NULL;
ALTER TABLE operation_plan MODIFY COLUMN user_id CHAR(36) NOT NULL;
ALTER TABLE media_task MODIFY COLUMN user_id CHAR(36) NOT NULL;
ALTER TABLE output_file MODIFY COLUMN user_id CHAR(36) NOT NULL;

ALTER TABLE output_file DROP FOREIGN KEY fk_output_task;
ALTER TABLE media_task DROP FOREIGN KEY fk_task_plan;
ALTER TABLE media_task DROP FOREIGN KEY fk_task_media;
ALTER TABLE operation_plan DROP FOREIGN KEY fk_plan_media;
ALTER TABLE media DROP FOREIGN KEY fk_media_project;

ALTER TABLE media ADD CONSTRAINT uk_media_owner_id UNIQUE (user_id, id);
ALTER TABLE operation_plan ADD CONSTRAINT uk_plan_owner_id UNIQUE (user_id, id);
ALTER TABLE media_task ADD CONSTRAINT uk_task_owner_id UNIQUE (user_id, id);
ALTER TABLE media ADD CONSTRAINT fk_media_user FOREIGN KEY (user_id) REFERENCES app_user(id);
ALTER TABLE operation_plan ADD CONSTRAINT fk_plan_owned_media FOREIGN KEY (user_id, media_id) REFERENCES media(user_id, id);
ALTER TABLE media_task ADD CONSTRAINT fk_task_owned_media FOREIGN KEY (user_id, media_id) REFERENCES media(user_id, id);
ALTER TABLE media_task ADD CONSTRAINT fk_task_owned_plan FOREIGN KEY (user_id, plan_id) REFERENCES operation_plan(user_id, id);
ALTER TABLE output_file ADD CONSTRAINT fk_output_owned_task FOREIGN KEY (user_id, task_id) REFERENCES media_task(user_id, id);

ALTER TABLE output_file DROP INDEX idx_output_project_created;
ALTER TABLE media_task DROP INDEX idx_task_project_created;
ALTER TABLE media_task DROP INDEX uk_task_project_id;
ALTER TABLE operation_plan DROP INDEX idx_plan_project_created;
ALTER TABLE operation_plan DROP INDEX uk_plan_project_id;
ALTER TABLE media DROP INDEX idx_media_project_created;
ALTER TABLE media DROP INDEX uk_media_project_id;

ALTER TABLE output_file DROP COLUMN project_id;
ALTER TABLE media_task DROP COLUMN project_id;
ALTER TABLE operation_plan DROP COLUMN project_id;
ALTER TABLE media DROP COLUMN project_id;

CREATE INDEX idx_media_owner_created ON media(user_id, created_at, id);
CREATE INDEX idx_plan_owner_created ON operation_plan(user_id, created_at, id);
CREATE INDEX idx_task_owner_created ON media_task(user_id, created_at, id);
CREATE INDEX idx_output_owner_created ON output_file(user_id, created_at, id);

ALTER TABLE media ADD COLUMN probe_token CHAR(36);
ALTER TABLE media ADD COLUMN probe_started_at DATETIME(6);
ALTER TABLE media MODIFY COLUMN metadata_json TEXT;
CREATE INDEX idx_media_probe_queue ON media(status, deleted_at, probe_started_at, created_at);

-- Preserve existing names and ownership as historical metadata, never create new projects.
ALTER TABLE project RENAME TO legacy_project;
