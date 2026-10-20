-- MANUAL ROLLBACK ONLY. Back up the database and obtain explicit confirmation first.
-- 此操作会移除 V005 后新增的服务商关联；旧 source_provider_id 字典关联不受影响。
ALTER TABLE enterprises
    DROP FOREIGN KEY fk_enterprises_source_provider_record,
    DROP INDEX idx_enterprises_source_provider_record,
    DROP COLUMN source_provider_record_id;
