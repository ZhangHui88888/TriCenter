ALTER TABLE users
    ADD COLUMN token_version INT NOT NULL DEFAULT 0 COMMENT '认证会话版本' AFTER status,
    ADD COLUMN must_change_password TINYINT NOT NULL DEFAULT 0 COMMENT '下次登录必须改密' AFTER token_version;

