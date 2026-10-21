ALTER TABLE output_file ADD CONSTRAINT uk_output_owner_id UNIQUE (user_id, id);
ALTER TABLE account_cleanup_job ADD COLUMN output_id CHAR(36);
ALTER TABLE account_cleanup_job DROP CONSTRAINT ck_cleanup_scope;
ALTER TABLE account_cleanup_job MODIFY COLUMN scope_key VARCHAR(64) NOT NULL DEFAULT 'ACCOUNT';
ALTER TABLE account_cleanup_job ADD CONSTRAINT fk_cleanup_owned_output
    FOREIGN KEY (user_id, output_id) REFERENCES output_file(user_id, id);
ALTER TABLE account_cleanup_job ADD CONSTRAINT ck_cleanup_scope CHECK (
    (media_id IS NULL AND output_id IS NULL AND scope_key = 'ACCOUNT')
    OR (media_id IS NOT NULL AND output_id IS NULL AND scope_key = media_id)
    OR (media_id IS NULL AND output_id IS NOT NULL AND scope_key = CONCAT('OUTPUT:', output_id))
);
