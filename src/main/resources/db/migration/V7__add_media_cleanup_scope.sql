ALTER TABLE account_cleanup_job ADD COLUMN media_id CHAR(36);
-- A non-null scope preserves uniqueness for account jobs too (NULL is not unique in MySQL).
ALTER TABLE account_cleanup_job ADD COLUMN scope_key VARCHAR(36) NOT NULL DEFAULT 'ACCOUNT';
CREATE UNIQUE INDEX uk_cleanup_scope ON account_cleanup_job(user_id, scope_key);
-- Rebind the user FK so H2 does not retain the old unique backing index for it.
ALTER TABLE account_cleanup_job DROP FOREIGN KEY fk_account_cleanup_user;
ALTER TABLE account_cleanup_job DROP CONSTRAINT uk_account_cleanup_user;
ALTER TABLE account_cleanup_job ADD CONSTRAINT fk_account_cleanup_user
    FOREIGN KEY (user_id) REFERENCES app_user(id);
ALTER TABLE account_cleanup_job ADD CONSTRAINT fk_cleanup_owned_media
    FOREIGN KEY (user_id, media_id) REFERENCES media(user_id, id);
ALTER TABLE account_cleanup_job ADD CONSTRAINT ck_cleanup_scope CHECK (
    (media_id IS NULL AND scope_key = 'ACCOUNT') OR (media_id IS NOT NULL AND scope_key = media_id)
);
