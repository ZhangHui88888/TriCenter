CREATE TABLE audit_outbox (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id        CHAR(36) NOT NULL,
    event_type      VARCHAR(64) NOT NULL,
    aggregate_type  VARCHAR(64) NOT NULL,
    aggregate_id    VARCHAR(64),
    payload         JSON NOT NULL,
    status          VARCHAR(16) NOT NULL DEFAULT 'PENDING',
    attempts        INT NOT NULL DEFAULT 0,
    available_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at    DATETIME,
    last_error      VARCHAR(1000),
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_audit_outbox_event (event_id),
    INDEX idx_audit_outbox_pending (status, available_at, id)
) COMMENT='可靠审计事件发件箱';

