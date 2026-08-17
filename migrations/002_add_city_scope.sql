-- migrate up
-- 单库多城市逻辑隔离：历史业务数据和现有用户统一归属常州。

CREATE TABLE cities (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    code        VARCHAR(32) NOT NULL COMMENT '稳定城市代码',
    name        VARCHAR(50) NOT NULL COMMENT '城市名称',
    status      TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1启用 0禁用',
    sort_order  INT NOT NULL DEFAULT 0 COMMENT '排序',
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_cities_code (code),
    INDEX idx_cities_status_sort (status, sort_order)
) COMMENT='城市';

INSERT INTO cities (code, name, status, sort_order) VALUES
('changzhou', '常州', 1, 10),
('suzhou', '苏州', 1, 20);

CREATE TABLE user_cities (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id     INT NOT NULL COMMENT '用户ID',
    city_id     INT NOT NULL COMMENT '城市ID',
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_cities_user_city (user_id, city_id),
    INDEX idx_user_cities_city_user (city_id, user_id),
    CONSTRAINT fk_user_cities_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_cities_city
        FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
) COMMENT='用户城市授权';

INSERT INTO user_cities (user_id, city_id)
SELECT u.id, c.id
FROM users u
JOIN cities c ON c.code = 'changzhou';

ALTER TABLE enterprises
    ADD COLUMN city_id INT NULL COMMENT '业务归属城市ID' AFTER id;

UPDATE enterprises
SET city_id = (SELECT id FROM cities WHERE code = 'changzhou')
WHERE city_id IS NULL;

ALTER TABLE enterprises
    MODIFY COLUMN city_id INT NOT NULL COMMENT '业务归属城市ID',
    ADD INDEX idx_enterprises_city_deleted (city_id, is_deleted),
    ADD INDEX idx_enterprises_city_stage (city_id, stage),
    ADD CONSTRAINT fk_enterprises_city
        FOREIGN KEY (city_id) REFERENCES cities(id);

ALTER TABLE operation_logs
    ADD COLUMN city_id INT NULL COMMENT '操作发生城市；全局管理操作为空' AFTER user_id,
    ADD INDEX idx_operation_logs_city_created (city_id, created_at),
    ADD CONSTRAINT fk_operation_logs_city
        FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL;

-- migrate down
-- 回退会删除城市授权关系和企业城市归属字段，执行前应备份数据库。

ALTER TABLE operation_logs
    DROP FOREIGN KEY fk_operation_logs_city,
    DROP INDEX idx_operation_logs_city_created,
    DROP COLUMN city_id;

ALTER TABLE enterprises
    DROP FOREIGN KEY fk_enterprises_city,
    DROP INDEX idx_enterprises_city_stage,
    DROP INDEX idx_enterprises_city_deleted,
    DROP COLUMN city_id;

DROP TABLE user_cities;
DROP TABLE cities;
