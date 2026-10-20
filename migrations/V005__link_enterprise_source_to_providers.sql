-- 企业来源为服务商时，使用服务商档案 ID；旧 source_provider_id 字典关联保留用于历史数据展示。
ALTER TABLE enterprises
    ADD COLUMN source_provider_record_id INT NULL COMMENT '企业来源对应的服务商档案ID' AFTER source_provider_id,
    ADD INDEX idx_enterprises_source_provider_record (source_provider_record_id),
    ADD CONSTRAINT fk_enterprises_source_provider_record
        FOREIGN KEY (source_provider_record_id) REFERENCES providers(id);

-- 只迁移名称完全一致的旧选项，避免将历史数据错误关联到同名以外的服务商。
UPDATE enterprises e
JOIN system_options o ON o.id = e.source_provider_id AND o.category = 'source_provider'
JOIN (
    SELECT name, MIN(id) AS id
    FROM providers
    WHERE is_deleted = 0
    GROUP BY name
    HAVING COUNT(*) = 1
) p ON p.name = o.label
SET e.source_provider_record_id = p.id
WHERE e.source_provider_id IS NOT NULL;
