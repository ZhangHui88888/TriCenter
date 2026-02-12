-- ============================================================
-- 常州跨境电商三中心 - 企业信息管理系统
-- 用户初始化数据
-- ============================================================

-- 初始化管理员用户
-- 密码: admin123 (BCrypt加密)
-- 注意: 如需修改密码，请使用BCrypt加密后替换

INSERT INTO users (username, password, name, role, phone, email, status) VALUES
('admin', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '系统管理员', 'admin', '13800000000', 'admin@tricenter.com', 1),
('manager', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '业务主管', 'manager', '13800000001', 'manager@tricenter.com', 1),
('user', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '普通用户', 'user', '13800000002', 'user@tricenter.com', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ============================================================
-- 默认账号信息:
-- | 用户名   | 密码      | 角色     | 说明       |
-- |---------|----------|---------|-----------|
-- | admin   | admin123 | admin   | 系统管理员  |
-- | manager | admin123 | manager | 业务主管   |
-- | user    | admin123 | user    | 普通用户   |
-- ============================================================
