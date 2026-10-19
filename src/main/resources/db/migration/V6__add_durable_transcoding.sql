ALTER TABLE operation_plan MODIFY COLUMN parameters_json TEXT;
ALTER TABLE operation_plan MODIFY COLUMN questions_json TEXT NOT NULL;
ALTER TABLE operation_plan MODIFY COLUMN warnings_json TEXT NOT NULL;
ALTER TABLE media_task MODIFY COLUMN parameters_json TEXT;
ALTER TABLE output_file MODIFY COLUMN metadata_json TEXT;
ALTER TABLE media_task ADD COLUMN run_token CHAR(36);
ALTER TABLE media_task ADD COLUMN lease_started_at DATETIME(6);
CREATE INDEX idx_task_lease ON media_task(status, lease_started_at);

-- Earlier framework-only executions have no lease owner and cannot be resumed safely.
UPDATE media_task SET stage='FAILED',error_code='TASK_INTERRUPTED',
    error_message='Processing interrupted; submit a new conversion.',finished_at=CURRENT_TIMESTAMP(6),status='FAILED'
    WHERE status IN ('RUNNING','CANCELLING');

-- Serialize queue admission across users without holding a transaction during FFmpeg.
CREATE TABLE processing_queue_lock (id INT NOT NULL PRIMARY KEY);
INSERT INTO processing_queue_lock(id) VALUES(1);
