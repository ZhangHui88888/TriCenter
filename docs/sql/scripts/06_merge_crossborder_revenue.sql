-- 06_merge_crossborder_revenue.sql
-- 跨境营收字段统一：废弃 cross_border_revenue_wan / cross_border_revenue_id，统一使用 last_year_revenue
-- 执行前请先备份 enterprises 表

-- Step 1: 将 cross_border_revenue_wan 存量数据合并到 last_year_revenue（仅当 last_year_revenue 为空时）
UPDATE enterprises
SET    last_year_revenue = cross_border_revenue_wan
WHERE  cross_border_revenue_wan IS NOT NULL
  AND  last_year_revenue IS NULL
  AND  is_deleted = 0;

-- Step 2: 确认合并结果（可选，手动检查）
-- SELECT id, name, cross_border_revenue_wan, cross_border_revenue_id, last_year_revenue
-- FROM   enterprises
-- WHERE  (cross_border_revenue_wan IS NOT NULL OR cross_border_revenue_id IS NOT NULL)
--   AND  is_deleted = 0;

-- Step 3: 删除废弃列（确认 Step 1 无误后执行）
ALTER TABLE enterprises DROP COLUMN cross_border_revenue_wan;
ALTER TABLE enterprises DROP COLUMN cross_border_revenue_id;
