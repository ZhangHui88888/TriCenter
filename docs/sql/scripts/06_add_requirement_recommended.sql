-- 需求表新增「推荐」字段：标记推荐的需求在企业详情需求分析中优先展示
ALTER TABLE requirements ADD COLUMN is_recommended TINYINT DEFAULT 0 COMMENT '是否推荐（推荐的需求在企业详情需求分析中优先展示）' AFTER sort_order;
