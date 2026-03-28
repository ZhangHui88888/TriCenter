-- 服务商表新增「需求能力」字段：存储该服务商可解决的需求ID数组
ALTER TABLE providers ADD COLUMN capability_requirement_ids JSON COMMENT '需求能力：可解决的需求ID数组(关联requirements表id)' AFTER qualification;

-- 服务分类字典数据（若已存在则跳过）
INSERT IGNORE INTO system_options (category, value, label, sort_order) VALUES
('provider_category', 'logistics', '物流仓储', 1),
('provider_category', 'marketing', '营销推广', 2),
('provider_category', 'consulting', '咨询培训', 3),
('provider_category', 'it_service', 'IT技术服务', 4),
('provider_category', 'payment', '跨境支付', 5),
('provider_category', 'certification', '检测认证', 6),
('provider_category', 'legal', '法务合规', 7),
('provider_category', 'finance', '金融服务', 8),
('provider_category', 'supply_chain', '供应链服务', 9),
('provider_category', 'others', '其他', 99);
