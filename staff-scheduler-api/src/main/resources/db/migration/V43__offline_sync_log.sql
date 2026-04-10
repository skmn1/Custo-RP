-- Task 59: Offline sync log — records background-sync replay outcomes per employee

CREATE TABLE offline_sync_log (
    id             VARCHAR(36)  PRIMARY KEY,
    employee_id    VARCHAR(50)  NOT NULL,
    operation_type VARCHAR(50)  NOT NULL,
    endpoint       VARCHAR(200),
    method         VARCHAR(10),
    status         VARCHAR(20)  NOT NULL DEFAULT 'synced',
    queued_at      TIMESTAMP,
    synced_at      TIMESTAMP             DEFAULT now(),
    error_detail   TEXT,
    created_at     TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE INDEX idx_sync_log_employee ON offline_sync_log(employee_id, synced_at DESC);
