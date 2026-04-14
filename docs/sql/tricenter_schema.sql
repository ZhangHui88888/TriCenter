-- ============================================================
-- 常州跨境电商三中心 - 企业信息管理系统
-- 数据库建表脚本
-- ============================================================
--
-- 【执行说明】
-- 1) 本文件不仅建表，还包含 system_options、requirements 等种子数据；文末有默认用户 admin / manager / user（密码见文末注释）。
-- 2) 需整份执行到最后一条语句成功提交，users 里才会有账号。若只执行了前半段 DDL、或中途报错中断，users 为空时登录会提示「用户名或密码错误」。
-- 3) tricenter_init.sql 建议在 schema 之后执行：会 TRUNCATE 并重灌字典表、行业/品类及测试企业等；不执行 init 时，只要 schema 跑完全篇仍可登录，但可能缺少 init 里独有的选项/测试数据。
--
-- 数据库配置
-- 推荐: MySQL 8.0+ 或 PostgreSQL 14+
-- 字符集: UTF-8 (utf8mb4)
-- 排序规则: utf8mb4_unicode_ci

-- 开发阶段：允许重复执行，先删除旧表
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS market_reports;
DROP TABLE IF EXISTS operation_logs;
DROP TABLE IF EXISTS enterprise_service_records;
DROP TABLE IF EXISTS provider_service_areas;
DROP TABLE IF EXISTS provider_contacts;
DROP TABLE IF EXISTS providers;
DROP TABLE IF EXISTS enterprise_dimension_selections;
DROP TABLE IF EXISTS enterprise_requirements;
DROP TABLE IF EXISTS requirement_dimension_mapping;
DROP TABLE IF EXISTS requirements;
DROP TABLE IF EXISTS stage_change_logs;
DROP TABLE IF EXISTS follow_up_records;
DROP TABLE IF EXISTS enterprise_patents;
DROP TABLE IF EXISTS enterprise_products;
DROP TABLE IF EXISTS enterprise_contacts;
DROP TABLE IF EXISTS enterprises;
DROP TABLE IF EXISTS system_options;
DROP TABLE IF EXISTS requirement_categories;
DROP TABLE IF EXISTS product_categories;  -- 旧表，合并后可删
DROP TABLE IF EXISTS industry_categories; -- 旧表，合并后可删
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 表1: users (用户表)
-- ============================================================
CREATE TABLE users (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    username        VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password        VARCHAR(255) NOT NULL COMMENT '密码(加密)',
    name            VARCHAR(50) NOT NULL COMMENT '姓名',
    role            ENUM('admin', 'manager', 'user') DEFAULT 'user' COMMENT '角色',
    phone           VARCHAR(20) COMMENT '手机号',
    email           VARCHAR(100) COMMENT '邮箱',
    status          TINYINT DEFAULT 1 COMMENT '状态: 1启用 0禁用',
    last_login_at   DATETIME COMMENT '最后登录时间',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
) COMMENT='用户表';

-- ============================================================
-- 表2: categories (统一分类表，合并原 industry_categories + product_categories)
-- 企业行业分类(enterprises.industry_id)与产品品类(enterprise_products.category_id)共用此表
-- ============================================================
CREATE TABLE categories (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    parent_id   INT DEFAULT 0 COMMENT '父级ID，0为顶级',
    name        VARCHAR(50) NOT NULL COMMENT '分类名称',
    level       TINYINT NOT NULL COMMENT '层级：1/2/3',
    path        VARCHAR(100) COMMENT '完整路径，如：1/5/12',
    sort_order  INT DEFAULT 0 COMMENT '排序',
    is_enabled  TINYINT DEFAULT 1 COMMENT '是否启用',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_parent (parent_id),
    INDEX idx_path (path),
    INDEX idx_level (level)
) COMMENT='统一分类表（行业+产品品类共用）';

-- ============================================================
-- 表3b: requirement_categories (需求分类树)
-- ============================================================
CREATE TABLE requirement_categories (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    parent_id   INT DEFAULT 0 COMMENT '父级ID，0为顶级',
    name        VARCHAR(100) NOT NULL COMMENT '分类名称',
    level       TINYINT NOT NULL COMMENT '层级：1/2/3',
    path        VARCHAR(100) COMMENT '完整路径',
    sort_order  INT DEFAULT 0 COMMENT '排序',
    is_enabled  TINYINT DEFAULT 1 COMMENT '是否启用',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_parent (parent_id),
    INDEX idx_path (path),
    INDEX idx_level (level)
) COMMENT='需求分类树';

-- ============================================================
-- 表4: system_options (系统选项配置表)
-- ============================================================
CREATE TABLE system_options (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    category    VARCHAR(50) NOT NULL COMMENT '分类: region/industry/stage/source等',
    value       VARCHAR(50) NOT NULL COMMENT '选项值',
    label       VARCHAR(100) NOT NULL COMMENT '显示名称',
    color       VARCHAR(20) COMMENT '颜色(用于标签)',
    sort_order  INT DEFAULT 0 COMMENT '排序',
    is_enabled  TINYINT DEFAULT 1 COMMENT '是否启用',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_category_value (category, value),
    INDEX idx_category (category)
) COMMENT='系统选项配置表';


-- ============================================================
-- 表5: enterprises (企业主表)
-- ============================================================
CREATE TABLE enterprises (
    id                      INT PRIMARY KEY AUTO_INCREMENT,
    name                    VARCHAR(200) NOT NULL COMMENT '企业名称',
    credit_code             VARCHAR(18) COMMENT '统一社会信用代码',
    established_date        DATE COMMENT '成立日期',
    registered_capital      VARCHAR(50) COMMENT '注册资本（如500万元）',
    province                VARCHAR(20) DEFAULT '江苏省' COMMENT '省',
    city                    VARCHAR(20) DEFAULT '常州市' COMMENT '市',
    district                VARCHAR(20) NOT NULL COMMENT '区(所属区域)',
    address                 VARCHAR(500) COMMENT '详细地址',
    industry_id             INT COMMENT '行业分类ID(关联categories表)',
    enterprise_type         VARCHAR(20) NOT NULL COMMENT '企业类型: 生产型/贸易型/工贸一体/跨境卖家型/品牌运营型/供应链服务型/技术服务型/综合服务型/未定义',
    staff_size_id           INT COMMENT '人员规模ID(关联system_options表,category=staff_size)',
    website                 VARCHAR(200) COMMENT '官网',
    domestic_revenue_id     INT COMMENT '国内营收ID(关联system_options表,category=revenue，历史档位，优先以 domestic_revenue_wan 为准)',
    domestic_revenue_wan    DECIMAL(18,4) NULL COMMENT '国内营收(万元)，精确数值',
    source_id               INT COMMENT '企业来源ID(关联system_options表,category=source)',
    source_provider_id      INT COMMENT '企业来源-服务商二级分类ID(关联system_options表,category=source_provider，仅source为"服务商"时使用)',
    
    -- 漏斗阶段
    stage                   VARCHAR(20) DEFAULT 'POTENTIAL' COMMENT '漏斗阶段',

    -- 品牌信息
    has_own_brand           TINYINT DEFAULT 0 COMMENT '是否有自主品牌',
    brand_names             VARCHAR(500) COMMENT '品牌名称列表',
    
    -- 外贸信息
    target_region_ids       JSON COMMENT '主要销售区域ID数组(关联system_options表,category=region)',
    target_country_ids      JSON COMMENT '主要销售国家代码数组(ISO 3166-1 alpha-2)',
    trade_mode_id           INT COMMENT '外贸模式ID(关联system_options表,category=trade_mode)',
    has_import_export_license TINYINT DEFAULT 0 COMMENT '是否有进出口资质',
    import_export_code      VARCHAR(20) COMMENT '进出口收发货人代码',
    iso_certifications      VARCHAR(500) COMMENT 'ISO认证情况（如ISO9001:2015）',
    aeo_certification       VARCHAR(50) COMMENT '海关AEO认证等级',
    other_certifications    VARCHAR(500) COMMENT '其他资质证书',
    customs_declaration_mode VARCHAR(20) COMMENT '报关申报主体模式',
    trade_team_mode_id      INT COMMENT '外贸业务团队模式ID(关联system_options表,category=trade_team_mode)',
    trade_team_size         INT COMMENT '外贸团队人数',
    has_domestic_ecommerce  TINYINT DEFAULT 0 COMMENT '是否有国内电商经验',
    
    -- 外贸业绩分析
    last_year_revenue       DECIMAL(12,2) COMMENT '上年外贸营业额(万元)',
    year_before_last_revenue DECIMAL(12,2) COMMENT '上上年外贸营业额(万元)',
    market_changes          JSON COMMENT '市场变化: {up:[{type,id,rate}], down:[{type,id,rate}]}',
    mode_changes            JSON COMMENT '模式变化: {up:[{id,rate}], down:[{id,rate}]}',
    category_changes        JSON COMMENT '品类变化: {up:[{id,rate}], down:[{id,rate}]}',
    growth_reasons          JSON COMMENT '增长原因ID数组',
    decline_reasons         JSON COMMENT '下降原因ID数组',
    
    -- 跨境电商信息
    has_cross_border        TINYINT DEFAULT 0 COMMENT '是否开展跨境电商',
    cross_border_ratio      VARCHAR(20) COMMENT '跨境业务占比',
    cross_border_logistics  VARCHAR(100) COMMENT '跨境物流模式ID',
    payment_settlement      VARCHAR(100) COMMENT '支付结算方式ID',
    cross_border_team_size  INT COMMENT '跨境电商团队规模',
    using_erp               TINYINT DEFAULT 0 COMMENT '是否在用ERP',
    has_overseas_distributors TINYINT DEFAULT 0 COMMENT '是否有海外分销商',
    transformation_willingness VARCHAR(20) COMMENT '跨境转型意愿',
    investment_willingness  VARCHAR(20) COMMENT '愿意投入转型程度',
    cross_border_platforms  JSON COMMENT '跨境平台ID数组',
    target_markets          JSON COMMENT '目标市场及占比',
    
    -- 三中心评估
    service_cooperation_rating      TINYINT COMMENT '企业服务合作可能性(1-5星)',
    investment_cooperation_rating   TINYINT COMMENT '招商入驻合作可能性(1-5星)',
    incubation_cooperation_rating   TINYINT COMMENT '孵化转型合作可能性(1-5星)',
    brand_cooperation_rating        TINYINT COMMENT '品牌营销合作可能性(1-5星)',
    training_cooperation_rating     TINYINT COMMENT '人才培训合作可能性(1-5星)',
    overall_cooperation_rating      TINYINT COMMENT '跨境整体方案合作可能性(1-5星)',
    benchmark_possibility           INT COMMENT '标杆企业可能性百分比',
    additional_notes                TEXT COMMENT '其它补充说明',
    
    -- 政策支持
    has_policy_support      TINYINT DEFAULT 0 COMMENT '是否享受过政策支持',
    enjoyed_policies        JSON COMMENT '已享受政策列表',
    
    -- 竞争力信息
    competition_position    VARCHAR(50) COMMENT '行业竞争地位',
    competition_description TEXT COMMENT '竞争地位描述',
    pain_points             TEXT COMMENT '跨境业务痛点',
    current_risk_tags       JSON COMMENT '当前面临风险（标签列表）',
    risk_description        TEXT COMMENT '当前面临风险说明',
    
    -- 三中心合作
    tricenter_demands       JSON COMMENT '与三中心合作主要需求',
    tricenter_concerns      JSON COMMENT '不考虑合作主要顾虑',
    
    -- 需求分析
    dimension_selections    JSON COMMENT '企业画像维度选择',
    removed_requirements    JSON COMMENT '已移除的需求ID列表',
    added_requirements      JSON DEFAULT NULL COMMENT '手动添加到默认清单的需求ID列表',
    custom_requirements     JSON COMMENT '自定义需求列表',
    
    -- 跨系统关联
    booking_user_id         INT UNSIGNED COMMENT '关联园区小程序用户ID(booking.users.id)',
    
    -- 系统字段
    is_deleted              TINYINT DEFAULT 0 COMMENT '是否删除',
    created_at              DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_district (district),
    INDEX idx_industry (industry_id),
    INDEX idx_stage (stage),
    INDEX idx_source (source_id),
    INDEX idx_created (created_at),
    INDEX idx_booking_user (booking_user_id),
    FOREIGN KEY (industry_id) REFERENCES categories(id),
    FOREIGN KEY (source_id) REFERENCES system_options(id),
    FOREIGN KEY (source_provider_id) REFERENCES system_options(id)
) COMMENT='企业主表';

-- ------------------------------------------------------------
-- 跨境营收已统一使用 last_year_revenue 字段，cross_border_revenue_wan / cross_border_revenue_id 已废弃
-- ------------------------------------------------------------
-- 生产环境「仅升级」时：若 enterprises 尚无 domestic_revenue_wan，单独执行：
-- ALTER TABLE enterprises
--     ADD COLUMN domestic_revenue_wan DECIMAL(18,4) NULL COMMENT '国内营收(万元)，精确数值' AFTER domestic_revenue_id;
-- ------------------------------------------------------------
-- 生产环境「仅升级」时：若 enterprises 尚无 current_risk_tags / risk_description，单独执行（与上方 CREATE 二选一，勿重复加列）：
-- ALTER TABLE enterprises
--     ADD COLUMN current_risk_tags JSON NULL COMMENT '当前面临风险（标签列表）' AFTER pain_points,
--     ADD COLUMN risk_description TEXT NULL COMMENT '当前面临风险说明' AFTER current_risk_tags;
-- ------------------------------------------------------------
-- 生产环境「仅升级」：下线已废弃字段 desired_support / cooperation_demands（列内数据将删除）：
-- ALTER TABLE enterprises
--     DROP COLUMN desired_support,
--     DROP COLUMN cooperation_demands;
-- ------------------------------------------------------------
-- 生产环境「仅升级」时：若 enterprises 尚无 source_provider_id，单独执行：
-- ALTER TABLE enterprises
--     ADD COLUMN source_provider_id INT NULL COMMENT '企业来源-服务商二级分类ID(关联system_options表,category=source_provider)' AFTER source_id,
--     ADD CONSTRAINT fk_enterprises_source_provider FOREIGN KEY (source_provider_id) REFERENCES system_options(id);
-- 同时需插入 source_provider 字典数据（见下方 INSERT）。
-- ------------------------------------------------------------

-- ============================================================
-- 表6: enterprise_contacts (企业联系人)
-- ============================================================
CREATE TABLE enterprise_contacts (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    enterprise_id   INT NOT NULL COMMENT '企业ID',
    name            VARCHAR(100) NOT NULL COMMENT '联系人姓名',
    phone           VARCHAR(20) COMMENT '联系电话',
    position        VARCHAR(50) COMMENT '职位',
    is_primary      TINYINT DEFAULT 0 COMMENT '是否主要联系人',
    email           VARCHAR(100) COMMENT '邮箱',
    wechat          VARCHAR(50) COMMENT '微信',
    remark          VARCHAR(500) COMMENT '备注',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_enterprise (enterprise_id),
    FOREIGN KEY (enterprise_id) REFERENCES enterprises(id) ON DELETE CASCADE
) COMMENT='企业联系人表';

-- ============================================================
-- 表7: enterprise_products (企业产品)
-- ============================================================
CREATE TABLE enterprise_products (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    enterprise_id       INT NOT NULL COMMENT '企业ID',
    name                VARCHAR(200) NOT NULL COMMENT '产品名称',
    category_id         INT COMMENT '产品品类ID(关联categories表)',
    certification_ids   JSON COMMENT '认证标签ID数组',
    target_region_ids   JSON COMMENT '主要销售区域ID数组',
    target_country_ids  JSON COMMENT '主要销售国家代码数组(ISO 3166-1 alpha-2)',
    annual_sales        VARCHAR(50) COMMENT '年销售额',
    export_ratio        VARCHAR(20) COMMENT '出口占比（如60%）',
    profit_margin       VARCHAR(20) COMMENT '利润率（如15-20%）',
    
    -- 供应链与产能
    local_procurement_ratio  VARCHAR(20) COMMENT '原材料本地采购比例',
    automation_level_id      INT COMMENT '装备自动化程度ID',
    annual_capacity          VARCHAR(50) COMMENT '年产能',
    logistics_partner_ids    JSON COMMENT '物流合作方ID数组',
    
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_enterprise (enterprise_id),
    INDEX idx_category (category_id),
    FOREIGN KEY (enterprise_id) REFERENCES enterprises(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
) COMMENT='企业产品表';

-- ============================================================
-- 表8: enterprise_patents (专利信息)
-- ============================================================
CREATE TABLE enterprise_patents (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    enterprise_id   INT NOT NULL COMMENT '企业ID',
    name            VARCHAR(200) NOT NULL COMMENT '专利名称',
    patent_no       VARCHAR(50) COMMENT '专利号',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_enterprise (enterprise_id),
    FOREIGN KEY (enterprise_id) REFERENCES enterprises(id) ON DELETE CASCADE
) COMMENT='企业专利表';

-- ============================================================
-- 表9: follow_up_records (跟进记录)
-- ============================================================
CREATE TABLE follow_up_records (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    enterprise_id   INT NOT NULL COMMENT '企业ID',
    follow_type     VARCHAR(20) NOT NULL COMMENT '跟进类型: 电话/视频/拜访/会议',
    follow_date     DATE NOT NULL COMMENT '跟进日期',
    content         TEXT NOT NULL COMMENT '跟进内容',
    status          VARCHAR(50) COMMENT '整体状态',
    next_plan       VARCHAR(500) COMMENT '下一步计划',
    stage_from      VARCHAR(20) COMMENT '变更前阶段',
    stage_to        VARCHAR(20) COMMENT '变更后阶段',
    follower_id     INT COMMENT '跟进人ID',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_enterprise (enterprise_id),
    INDEX idx_follower (follower_id),
    INDEX idx_date (follow_date),
    FOREIGN KEY (enterprise_id) REFERENCES enterprises(id) ON DELETE CASCADE,
    FOREIGN KEY (follower_id) REFERENCES users(id)
) COMMENT='跟进记录表';

-- ============================================================
-- 表10: stage_change_logs (阶段变更日志)
-- ============================================================
CREATE TABLE stage_change_logs (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    enterprise_id   INT NOT NULL COMMENT '企业ID',
    stage_from      VARCHAR(20) NOT NULL COMMENT '变更前阶段',
    stage_to        VARCHAR(20) NOT NULL COMMENT '变更后阶段',
    reason          VARCHAR(500) COMMENT '变更原因',
    operator_id     INT COMMENT '操作人ID',
    follow_up_id    INT COMMENT '关联跟进记录ID',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_enterprise (enterprise_id),
    INDEX idx_created (created_at),
    FOREIGN KEY (enterprise_id) REFERENCES enterprises(id) ON DELETE CASCADE,
    FOREIGN KEY (operator_id) REFERENCES users(id),
    FOREIGN KEY (follow_up_id) REFERENCES follow_up_records(id)
) COMMENT='阶段变更日志表';

-- ============================================================
-- 表11: requirements (需求主表)
-- ============================================================
CREATE TABLE requirements (
    id              VARCHAR(20) PRIMARY KEY COMMENT '需求ID，如1.1.1，自定义需求为CUSTOM-时间戳',
    name            VARCHAR(100) NOT NULL COMMENT '需求名称',
    description     VARCHAR(500) COMMENT '需求简述',
    detail_description TEXT COMMENT '需求详细描述',
    phase           VARCHAR(50) NOT NULL COMMENT '所属阶段',
    category        VARCHAR(50) NOT NULL COMMENT '所属分类',
    is_universal    TINYINT DEFAULT 0 COMMENT '是否通用必选',
    is_enhanced     TINYINT DEFAULT 0 COMMENT '是否增强项',
    is_custom       TINYINT DEFAULT 0 COMMENT '是否自定义需求',
    enterprise_id   INT COMMENT '所属企业ID(自定义需求时填写)',
    sort_order      INT DEFAULT 0 COMMENT '排序',
    is_recommended  TINYINT DEFAULT 0 COMMENT '是否推荐（推荐的需求在企业详情需求分析中优先展示）',
    is_enabled      TINYINT DEFAULT 1 COMMENT '是否启用',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_phase (phase),
    INDEX idx_category (category),
    INDEX idx_universal (is_universal),
    INDEX idx_enhanced (is_enhanced),
    INDEX idx_custom (is_custom),
    INDEX idx_enterprise (enterprise_id),
    FOREIGN KEY (enterprise_id) REFERENCES enterprises(id) ON DELETE CASCADE
) COMMENT='需求主表';

-- ============================================================
-- 表12: requirement_dimension_mapping (需求维度映射表)
-- ============================================================
CREATE TABLE requirement_dimension_mapping (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    requirement_id  VARCHAR(20) NOT NULL COMMENT '需求ID',
    dimension_key   VARCHAR(50) NOT NULL COMMENT '维度键',
    dimension_value VARCHAR(50) NOT NULL COMMENT '维度值',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_requirement (requirement_id),
    INDEX idx_dimension (dimension_key, dimension_value),
    FOREIGN KEY (requirement_id) REFERENCES requirements(id) ON DELETE CASCADE
) COMMENT='需求维度映射表';

-- ============================================================
-- 表13: enterprise_requirements (企业需求关联表)
-- ============================================================
CREATE TABLE enterprise_requirements (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    enterprise_id   INT NOT NULL COMMENT '企业ID',
    requirement_id  VARCHAR(20) NOT NULL COMMENT '需求ID',
    source          VARCHAR(50) COMMENT '需求来源: universal/enhanced/dimension/custom',
    status          VARCHAR(20) DEFAULT 'active' COMMENT '状态: active/removed',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_enterprise_requirement (enterprise_id, requirement_id),
    INDEX idx_enterprise (enterprise_id),
    INDEX idx_status (status),
    FOREIGN KEY (enterprise_id) REFERENCES enterprises(id) ON DELETE CASCADE,
    FOREIGN KEY (requirement_id) REFERENCES requirements(id)
) COMMENT='企业需求关联表';

-- ============================================================
-- 表14: enterprise_dimension_selections (企业维度选择表)
-- ============================================================
CREATE TABLE enterprise_dimension_selections (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    enterprise_id   INT NOT NULL COMMENT '企业ID',
    dimension_key   VARCHAR(50) NOT NULL COMMENT '维度键',
    dimension_value VARCHAR(50) NOT NULL COMMENT '维度值',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_enterprise_dimension_value (enterprise_id, dimension_key, dimension_value),
    INDEX idx_enterprise (enterprise_id),
    FOREIGN KEY (enterprise_id) REFERENCES enterprises(id) ON DELETE CASCADE
) COMMENT='企业维度选择表';

-- ============================================================
-- 表15: providers (服务商主表)
-- ============================================================
CREATE TABLE providers (
    id                      INT PRIMARY KEY AUTO_INCREMENT,
    name                    VARCHAR(200) NOT NULL COMMENT '服务商名称',
    category                VARCHAR(50) NOT NULL COMMENT '旧服务分类兼容字段(关联system_options表,category=provider_category)',
    description             TEXT COMMENT '服务商简介',
    
    -- 企业资质
    credit_code             VARCHAR(18) COMMENT '统一社会信用代码',
    province                VARCHAR(20) DEFAULT '江苏省' COMMENT '省',
    city                    VARCHAR(20) DEFAULT '常州市' COMMENT '市',
    district                VARCHAR(20) COMMENT '区(所属区域)',
    address                 VARCHAR(500) COMMENT '详细地址',
    website                 VARCHAR(200) COMMENT '官网',
    logo                    VARCHAR(255) COMMENT 'Logo图片',
    
    -- 服务能力
    service_scope           TEXT COMMENT '服务范围描述',
    service_tags            JSON COMMENT '服务标签ID数组(关联system_options表,category=service_tag)',
    staff_size_id           INT COMMENT '人员规模ID(关联system_options表,category=staff_size)',
    qualification           TEXT COMMENT '资质证书描述',
    capability_requirement_ids JSON COMMENT '需求能力：可解决的需求ID数组(关联requirements表id)',
    
    -- 合作信息
    cooperation_start_date  DATE COMMENT '合作开始日期',
    cooperation_status      VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '合作状态: ACTIVE/SUSPENDED/TERMINATED',
    contract_end_date       DATE COMMENT '合同到期日期',
    
    -- 绩效评估
    service_rating          DECIMAL(2,1) DEFAULT 0.0 COMMENT '综合服务评分(来自小程序端同步)',
    total_service_count     INT DEFAULT 0 COMMENT '累计服务次数(来自小程序端同步)',
    total_served_enterprises INT DEFAULT 0 COMMENT '累计服务企业数(来自小程序端同步)',
    
    -- 跨系统关联
    booking_provider_id     INT UNSIGNED COMMENT '关联园区小程序服务商ID(booking.providers.id)',
    
    -- 系统字段
    is_deleted              TINYINT DEFAULT 0 COMMENT '是否删除',
    created_at              DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_category (category),
    INDEX idx_district (district),
    INDEX idx_cooperation_status (cooperation_status),
    INDEX idx_booking_provider (booking_provider_id)
) COMMENT='服务商主表';

-- ============================================================
-- 表16: provider_contacts (服务商联系人)
-- ============================================================
CREATE TABLE provider_contacts (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    provider_id     INT NOT NULL COMMENT '服务商ID',
    name            VARCHAR(50) NOT NULL COMMENT '联系人姓名',
    phone           VARCHAR(20) COMMENT '联系电话',
    position        VARCHAR(50) COMMENT '职位',
    is_primary      TINYINT DEFAULT 0 COMMENT '是否主要联系人',
    email           VARCHAR(100) COMMENT '邮箱',
    wechat          VARCHAR(50) COMMENT '微信',
    remark          VARCHAR(500) COMMENT '备注',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_provider (provider_id),
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
) COMMENT='服务商联系人表';

-- ============================================================
-- 表17: provider_service_areas (服务商服务领域)
-- ============================================================
CREATE TABLE provider_service_areas (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    provider_id     INT NOT NULL COMMENT '服务商ID',
    area_name       VARCHAR(100) NOT NULL COMMENT '服务领域名称',
    description     VARCHAR(500) COMMENT '领域描述',
    sort_order      INT DEFAULT 0 COMMENT '排序',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_provider (provider_id),
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
) COMMENT='服务商服务领域表';

-- ============================================================
-- 表18: enterprise_service_records (企业合作服务记录)
-- 含 attachments(JSON 附件元数据)、benchmark_possibility（原独立脚本 04/05 已并入本表定义）
-- ============================================================
CREATE TABLE enterprise_service_records (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    enterprise_id   INT NOT NULL COMMENT '企业ID',
    provider_id     INT COMMENT '服务商ID(可选,关联providers表)',
    service_type    VARCHAR(30) NOT NULL COMMENT '服务类型: training/policy/incubation/platform/settlement/activity/finance/other',
    service_name    VARCHAR(200) NOT NULL COMMENT '服务名称',
    service_date    DATE NOT NULL COMMENT '服务日期',
    status          VARCHAR(20) DEFAULT 'pending' COMMENT '状态: pending/in_progress/completed/terminated',
    responsible_id  INT COMMENT '负责人ID(关联users表)',
    contract_no     VARCHAR(100) COMMENT '合同/协议编号',
    description     TEXT COMMENT '服务内容描述',
    result          TEXT COMMENT '服务成果/备注',
    stage_from      VARCHAR(20) COMMENT '变更前漏斗阶段',
    stage_to        VARCHAR(20) COMMENT '变更后漏斗阶段',
    project_level   VARCHAR(10) COMMENT '项目级别: S/A/B/C',
    feasibility_score DECIMAL(3,1) COMMENT '可行性综合评分(1.0-5.0)',
    assessment_data JSON COMMENT '可行性评估各维度评分JSON',
    attachments     JSON COMMENT '附件元数据[{storedFileName,originalName,contentType,size}]',
    benchmark_possibility INT NULL COMMENT '标杆企业可能性百分比',
    is_deleted      TINYINT DEFAULT 0 COMMENT '是否删除',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_enterprise (enterprise_id),
    INDEX idx_provider (provider_id),
    INDEX idx_service_type (service_type),
    INDEX idx_service_date (service_date),
    INDEX idx_status (status),
    FOREIGN KEY (enterprise_id) REFERENCES enterprises(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES providers(id),
    FOREIGN KEY (responsible_id) REFERENCES users(id)
) COMMENT='企业合作服务记录表';

-- ============================================================
-- 表19: operation_logs (操作日志)
-- ============================================================
CREATE TABLE operation_logs (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         INT COMMENT '操作人ID',
    username        VARCHAR(50) COMMENT '操作人用户名',
    operation       VARCHAR(20) NOT NULL COMMENT '操作类型: CREATE/UPDATE/DELETE/IMPORT/EXPORT/STAGE_CHANGE',
    target_type     VARCHAR(30) NOT NULL COMMENT '操作对象类型: ENTERPRISE/CONTACT/PRODUCT/FOLLOW_UP',
    target_id       VARCHAR(50) COMMENT '操作对象ID',
    target_name     VARCHAR(200) COMMENT '操作对象名称',
    detail          VARCHAR(1000) COMMENT '操作详情',
    ip_address      VARCHAR(50) COMMENT 'IP地址',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user (user_id),
    INDEX idx_target (target_type, target_id),
    INDEX idx_created (created_at)
) COMMENT='操作日志表';

-- ============================================================
-- 表19: market_reports (市场调研报告表)
-- 一企业一行，基础版/深度版各存一个 JSON
-- ============================================================
CREATE TABLE market_reports (
    id                    BIGINT PRIMARY KEY AUTO_INCREMENT,
    enterprise_id         INT NOT NULL UNIQUE COMMENT '企业ID，一企业一行',
    basic_report_data     JSON COMMENT '基础版报告AI字段JSON',
    deep_report_data      JSON COMMENT '深度版报告AI字段JSON',
    basic_generated_at    DATETIME COMMENT '基础版最后生成时间',
    deep_generated_at     DATETIME COMMENT '深度版最后生成时间',
    created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_enterprise_id (enterprise_id)
) COMMENT='市场调研报告';

-- 建表完成

-- ============================================================
-- 系统基础数据初始化（字典、行业、产品品类、需求、默认用户）
-- 以下数据为系统运行必需，建表后自动初始化
-- 注意：不含测试企业数据，测试数据见 tricenter_init.sql 末尾
-- ============================================================

-- ============================================================
-- 常州跨境电商三中心 - 企业信息管理系统
-- 系统选项配置初始化数据 (system_options)
-- ============================================================

-- 开发阶段：允许重复执行，先清空旧数据
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE system_options;
TRUNCATE TABLE categories;
TRUNCATE TABLE requirements;
SET FOREIGN_KEY_CHECKS = 1;

-- ==================== 漏斗阶段 (stage) ====================
INSERT INTO system_options (category, value, label, color, sort_order) VALUES
('stage', 'POTENTIAL', '潜在企业', '#94a3b8', 1),
('stage', 'NO_DEMAND', '无明确需求', '#fbbf24', 2),
('stage', 'NO_INTENTION', '没有合作意向', '#ef4444', 3),
('stage', 'HAS_DEMAND', '有明确需求', '#3b82f6', 4),
('stage', 'SIGNED', '已签约', '#8b5cf6', 5),
('stage', 'SETTLED', '已入驻', '#10b981', 6),
('stage', 'INCUBATING', '重点孵化', '#f97316', 7);

-- ==================== 区 (district) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('district', 'wujin', '武进区', 1),
('district', 'xinbei', '新北区', 2),
('district', 'tianning', '天宁区', 3),
('district', 'zhonglou', '钟楼区', 4),
('district', 'jingkai', '经开区', 5),
('district', 'jintan', '金坛区', 6),
('district', 'liyang', '溧阳市', 7);

-- ==================== 企业类型 (enterprise_type) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('enterprise_type', 'production', '生产型', 1),
('enterprise_type', 'trading', '贸易型', 2),
('enterprise_type', 'both', '工贸一体', 3),
('enterprise_type', 'cross_border_seller', '跨境卖家型', 4),
('enterprise_type', 'brand_operator', '品牌运营型', 5),
('enterprise_type', 'supply_chain_service', '供应链服务型', 6),
('enterprise_type', 'technical_service', '技术服务型', 7),
('enterprise_type', 'comprehensive_service', '综合服务型', 8),
('enterprise_type', 'undefined', '未定义', 9);

-- ==================== 人员规模 (staff_size) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('staff_size', 'lt10', '10人以下', 1),
('staff_size', '10-50', '10-50人', 2),
('staff_size', '50-200', '50-200人', 3),
('staff_size', '200-500', '200-500人', 4),
('staff_size', '500-1000', '500-1000人', 5),
('staff_size', 'gt1000', '1000人以上', 6);

-- ==================== 营收规模 (revenue) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('revenue', 'lt200', '200万以下', 1),
('revenue', '200-500', '200-500万', 2),
('revenue', '500-1000', '500-1000万', 3),
('revenue', '1000-5000', '1000-5000万', 4),
('revenue', 'gt5000', '5000万以上', 5);

-- ==================== 国内营收 (domestic_revenue) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('domestic_revenue', 'lt200', '200万以下', 1),
('domestic_revenue', '200-500', '200-500万', 2),
('domestic_revenue', '500-1000', '500-1000万', 3),
('domestic_revenue', '1000-5000', '1000-5000万', 4),
('domestic_revenue', 'gt5000', '5000万以上', 5);

-- ==================== 跨境营收 (cross_border_revenue) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('cross_border_revenue', 'none', '无', 1),
('cross_border_revenue', 'lt200', '200万以下', 2),
('cross_border_revenue', '200-500', '200-500万', 3),
('cross_border_revenue', '500-1000', '500-1000万', 4),
('cross_border_revenue', '1000-5000', '1000-5000万', 5),
('cross_border_revenue', 'gt5000', '5000万以上', 6);

-- ==================== 企业来源 (source) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('source', 'survey', '调研', 1),
('source', 'referral', '转介绍', 2),
('source', 'inquiry', '主动咨询', 3),
('source', 'activity', '活动', 4),
('source', 'provider', '服务商', 5);

-- ==================== 企业来源-服务商子分类 (source_provider) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('source_provider', 'zhihuatong', '智慧通', 1),
('source_provider', 'czguanjie', '常州冠捷', 2);

-- ==================== 外贸模式 (trade_mode) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('trade_mode', '0110', '0110', 1),
('trade_mode', '1039', '1039', 2),
('trade_mode', '9610', '9610', 3),
('trade_mode', '9710', '9710', 4),
('trade_mode', '9810', '9810', 5),
('trade_mode', '1210', '1210', 6),
('trade_mode', '0139', '0139', 7),
('trade_mode', '8000', '8000', 8);

-- ==================== 外贸业务团队模式 (trade_team_mode) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('trade_team_mode', 'self_operated', '自营团队', 1),
('trade_team_mode', 'outsourced', '外包团队', 2),
('trade_team_mode', 'mixed', '混合模式', 3),
('trade_team_mode', 'none', '无专职团队', 4);

-- ==================== 外贸业务模式 (trade_business_mode) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('trade_business_mode', 'b2b_traditional', '传统B2B', 1),
('trade_business_mode', 'b2b_platform', 'B2B平台', 2),
('trade_business_mode', 'b2c_ecommerce', '跨境电商B2C', 3),
('trade_business_mode', 'overseas_warehouse', '海外仓直发', 4),
('trade_business_mode', 'dropshipping', '一件代发', 5),
('trade_business_mode', 'oem_odm', 'OEM/ODM', 6),
('trade_business_mode', 'brand_export', '品牌出口', 7),
('trade_business_mode', 'general_trade', '一般贸易', 8),
('trade_business_mode', 'cross_border_9610', '跨境电商9610', 9),
('trade_business_mode', 'cross_border_1039', '市场采购1039', 10),
('trade_business_mode', 'other', '其他', 11);

-- ==================== 销售区域 (region) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('region', 'north_america', '北美', 1),
('region', 'europe', '欧洲', 2),
('region', 'southeast_asia', '东南亚', 3),
('region', 'east_asia', '东亚', 4),
('region', 'south_asia', '南亚', 5),
('region', 'middle_east', '中东', 6),
('region', 'africa', '非洲', 7),
('region', 'south_america', '南美', 8),
('region', 'oceania', '大洋洲', 9);

-- ==================== 产品认证 (certification) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('certification', 'CE', 'CE认证', 1),
('certification', 'SGS', 'SGS认证', 2),
('certification', 'UL', 'UL认证', 3),
('certification', 'FCC', 'FCC认证', 4),
('certification', 'FDA', 'FDA认证', 5),
('certification', 'ISO9001', 'ISO9001', 6),
('certification', 'ISO14001', 'ISO14001', 7),
('certification', 'ROHS', 'ROHS认证', 8),
('certification', 'CCC', 'CCC认证', 9),
('certification', 'OTHER', '其他', 10);

-- ==================== 装备自动化程度 (automation_level) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('automation_level', 'low', '低（30%以下）', 1),
('automation_level', 'medium', '中（30%-60%）', 2),
('automation_level', 'high', '高（60%-80%）', 3),
('automation_level', 'very_high', '很高（80%以上）', 4);

-- ==================== 物流合作方 (logistics) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('logistics', 'DHL', 'DHL', 1),
('logistics', 'FEDEX', 'FedEx', 2),
('logistics', 'UPS', 'UPS', 3),
('logistics', 'SF', '顺丰', 4),
('logistics', 'ZTO', '中通', 5),
('logistics', 'YTO', '圆通', 6),
('logistics', 'STO', '申通', 7),
('logistics', 'YUNDA', '韵达', 8),
('logistics', 'EMS', 'EMS', 9),
('logistics', 'OTHER', '其他', 10);

-- ==================== 跟进类型 (follow_type) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('follow_type', 'phone', '电话', 1),
('follow_type', 'video', '视频', 2),
('follow_type', 'visit', '拜访', 3),
('follow_type', 'meeting', '会议', 4);

-- ==================== 增长原因 (growth_reason) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('growth_reason', 'market_demand', '市场需求旺盛', 1),
('growth_reason', 'ecommerce_channel', '跨境电商渠道拓展成功', 2),
('growth_reason', 'new_product', '新产品线上市表现良好', 3),
('growth_reason', 'brand_upgrade', '品牌升级带动销量', 4),
('growth_reason', 'price_advantage', '价格优势明显', 5),
('growth_reason', 'quality_improvement', '产品质量提升', 6),
('growth_reason', 'customer_expansion', '大客户开发成功', 7),
('growth_reason', 'platform_support', '平台流量扶持', 8),
('growth_reason', 'policy_benefit', '政策红利', 9),
('growth_reason', 'supply_chain', '供应链优化降本增效', 10),
('growth_reason', 'marketing', '营销推广效果显著', 11),
('growth_reason', 'season_peak', '季节性旺季', 12),
('growth_reason', 'other', '其他', 99);

-- ==================== 下降原因 (decline_reason) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('decline_reason', 'market_competition', '市场竞争加剧', 1),
('decline_reason', 'traditional_b2b', '传统B2B订单减少', 2),
('decline_reason', 'price_decline', '部分品类价格下降', 3),
('decline_reason', 'cost_increase', '原材料成本上涨', 4),
('decline_reason', 'exchange_rate', '汇率波动影响', 5),
('decline_reason', 'logistics_cost', '物流成本上升', 6),
('decline_reason', 'policy_change', '目标国政策变化', 7),
('decline_reason', 'quality_issue', '产品质量问题', 8),
('decline_reason', 'customer_loss', '主要客户流失', 9),
('decline_reason', 'platform_rule', '平台规则调整', 10),
('decline_reason', 'season_low', '季节性淡季', 11),
('decline_reason', 'supply_chain', '供应链问题', 12),
('decline_reason', 'other', '其他', 99);

-- ==================== 跨境平台 (cross_border_platform) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('cross_border_platform', 'amazon', '亚马逊(Amazon)', 1),
('cross_border_platform', 'alibaba', '阿里国际站(Alibaba.com)', 2),
('cross_border_platform', 'tiktok', 'TikTok Shop', 3),
('cross_border_platform', 'aliexpress', '速卖通(AliExpress)', 4),
('cross_border_platform', 'ebay', 'eBay', 5),
('cross_border_platform', 'shopify', '独立站(Shopify)', 6),
('cross_border_platform', 'temu', 'Temu', 7),
('cross_border_platform', 'shein', 'SHEIN', 8),
('cross_border_platform', 'walmart', '沃尔玛(Walmart)', 9),
('cross_border_platform', 'lazada', 'Lazada', 10),
('cross_border_platform', 'shopee', 'Shopee', 11),
('cross_border_platform', 'wish', 'Wish', 12),
('cross_border_platform', 'etsy', 'Etsy', 13),
('cross_border_platform', 'wayfair', 'Wayfair', 14),
('cross_border_platform', 'mercado', 'Mercado Libre', 15),
('cross_border_platform', 'rakuten', '乐天(Rakuten)', 16),
('cross_border_platform', 'jd_global', '京东国际(JD Global)', 17),
('cross_border_platform', 'other', '其他', 99);

-- ==================== 跨境物流模式 (cross_border_logistics) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('cross_border_logistics', 'sea_shipping', '海运', 1),
('cross_border_logistics', 'air_shipping', '空运', 2),
('cross_border_logistics', 'express', '国际快递', 3),
('cross_border_logistics', 'fba', 'FBA(亚马逊物流)', 4),
('cross_border_logistics', 'overseas_warehouse', '海外仓', 5),
('cross_border_logistics', 'dropshipping', '一件代发', 6),
('cross_border_logistics', 'china_post', '中国邮政小包', 7),
('cross_border_logistics', 'special_line', '专线物流', 8),
('cross_border_logistics', 'railway', '铁路运输', 9),
('cross_border_logistics', 'mixed', '混合模式', 10);

-- ==================== 支付结算方式 (payment_settlement) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('payment_settlement', 'tt', 'T/T电汇', 1),
('payment_settlement', 'lc', 'L/C信用证', 2),
('payment_settlement', 'paypal', 'PayPal', 3),
('payment_settlement', 'western_union', '西联汇款', 4),
('payment_settlement', 'pingpong', 'PingPong', 5),
('payment_settlement', 'worldfirst', '万里汇', 6),
('payment_settlement', 'lianlian', '连连支付', 7),
('payment_settlement', 'alipay', '支付宝国际', 8),
('payment_settlement', 'other', '其他', 99);

-- ==================== 已享受政策 (enjoyed_policy) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('enjoyed_policy', 'export_tax_rebate', '出口退税', 1),
('enjoyed_policy', 'cross_border_subsidy', '跨境电商补贴', 2),
('enjoyed_policy', 'tech_innovation', '科技创新补贴', 3),
('enjoyed_policy', 'talent_subsidy', '人才引进补贴', 4),
('enjoyed_policy', 'loan_discount', '贷款贴息', 5),
('enjoyed_policy', 'rent_subsidy', '租金补贴', 6),
('enjoyed_policy', 'exhibition_subsidy', '展会补贴', 7),
('enjoyed_policy', 'certification_subsidy', '认证补贴', 8),
('enjoyed_policy', 'other', '其他', 99);

-- ==================== 三中心合作项目 (tricenter_project) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('tricenter_project', 'enterprise_service', '企业服务', 1),
('tricenter_project', 'investment_settle', '招商入驻', 2),
('tricenter_project', 'incubation', '孵化转型', 3),
('tricenter_project', 'brand_marketing', '品牌营销', 4),
('tricenter_project', 'talent_training', '人才培训', 5),
('tricenter_project', 'overall_solution', '跨境整体方案', 6);

-- ==================== 不合作顾虑 (cooperation_concern) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('cooperation_concern', 'cost', '成本考虑', 1),
('cooperation_concern', 'no_need', '暂无需求', 2),
('cooperation_concern', 'self_sufficient', '自有团队足够', 3),
('cooperation_concern', 'trust', '信任问题', 4),
('cooperation_concern', 'timing', '时机不对', 5),
('cooperation_concern', 'other', '其他', 99);


-- ==================== 需求阶段 (requirement_phase) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('requirement_phase', 'phase_1', '第一阶段：准备期 — 战略规划与资源准备', 1),
('requirement_phase', 'phase_2', '第二阶段：启动期 — 渠道搭建与商品上线', 2),
('requirement_phase', 'phase_3', '第三阶段：成长期 — 营销推广与规模增长', 3),
('requirement_phase', 'phase_4', '第四阶段：成熟期 — 品牌深耕与持续优化', 4);

-- ==================== 需求分类 (requirement_category) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
-- 第一阶段分类
('requirement_category', '1.1', '品牌规划', 101),
('requirement_category', '1.2', '市场洞察', 102),
('requirement_category', '1.3', '搭建营销体系', 103),
('requirement_category', '1.4', '测品选品与前置验证评估', 104),
('requirement_category', '1.5', '战略与预算', 105),
('requirement_category', '1.6', '供应链与物流准备', 106),
('requirement_category', '1.7', '合规前置', 107),
('requirement_category', '1.8', '团队与组织准备', 108),
-- 第二阶段分类
('requirement_category', '2.1', '渠道与店铺建设', 201),
('requirement_category', '2.2', '商品内容与上架', 202),
('requirement_category', '2.3', '达人/社媒/直播启动', 203),
('requirement_category', '2.4', '包装与样品管理', 204),
-- 第三阶段分类
('requirement_category', '3.1', '获客与投放', 301),
('requirement_category', '3.2', '订单、财务与收汇', 302),
('requirement_category', '3.3', '客服与售后', 303),
('requirement_category', '3.4', '合规与风险的持续运营', 304),
('requirement_category', '3.5', '定价与利润管理', 305),
('requirement_category', '3.6', '外部服务商管理', 306),
('requirement_category', '3.7', '代运营', 307),
-- 第四阶段分类
('requirement_category', '4.1', '履约升级与交付体验', 401),
('requirement_category', '4.2', '私域与会员运营', 402),
('requirement_category', '4.3', '产品与品牌迭代', 403),
('requirement_category', '4.4', '新品规划', 404),
('requirement_category', '4.5', '规模化与降本增效', 405),
('requirement_category', '4.6', 'ESG与可持续', 406);

-- ============================================================
-- 需求分类树初始化数据 (requirement_categories)
-- ============================================================

-- 一级：阶段
INSERT INTO requirement_categories (id, parent_id, name, level, path, sort_order) VALUES
(1, 0, '战略规划与资源准备', 1, '1', 1),
(2, 0, '渠道搭建与商品上线', 1, '2', 2),
(3, 0, '营销推广与规模增长', 1, '3', 3),
(4, 0, '品牌深耕与持续优化', 1, '4', 4);

-- 二级：分类（阶段一）
INSERT INTO requirement_categories (id, parent_id, name, level, path, sort_order) VALUES
(11, 1, '品牌规划', 2, '1/11', 1),
(12, 1, '市场洞察', 2, '1/12', 2),
(13, 1, '搭建营销体系', 2, '1/13', 3),
(14, 1, '测品选品与前置认证评估', 2, '1/14', 4),
(15, 1, '战略与预算', 2, '1/15', 5),
(16, 1, '供应链与物流准备', 2, '1/16', 6),
(17, 1, '合规前置', 2, '1/17', 7),
(18, 1, '团队与组织准备', 2, '1/18', 8);

-- 三级：需求项（阶段一）
INSERT INTO requirement_categories (id, parent_id, name, level, path, sort_order) VALUES
(111, 11, '品牌定位与规划/设计', 3, '1/11/111', 1),
(121, 12, '市场/IP洞察', 3, '1/12/121', 1),
(131, 13, '用户旅程设计', 3, '1/13/131', 1),
(132, 13, '画像/要素/标签体系', 3, '1/13/132', 2),
(133, 13, '营销活动与节奏规划', 3, '1/13/133', 3),
(141, 14, '平台测品、双轨选品', 3, '1/14/141', 1),
(142, 14, '海外认证可行性评估', 3, '1/14/142', 2),
(151, 15, '出海路径规划', 3, '1/15/151', 1),
(152, 15, '营销战略与预算', 3, '1/15/152', 2),
(161, 16, '备货策略与库存预案', 3, '1/16/161', 1),
(162, 16, '物流渠道方案选型', 3, '1/16/162', 2),
(171, 17, '知识产权布局', 3, '1/17/171', 1),
(172, 17, '税务合规前置', 3, '1/17/172', 2),
(181, 18, '组织架构设计', 3, '1/18/181', 1),
(182, 18, '人才招聘', 3, '1/18/182', 2),
(183, 18, '人才培养', 3, '1/18/183', 3),
(184, 18, '自建团队/代运营选择', 3, '1/18/184', 4),
(185, 18, '跨时区与远程协作', 3, '1/18/185', 5),
(186, 18, '办公场地与工位', 3, '1/18/186', 6);

-- 二级：分类（阶段二）
INSERT INTO requirement_categories (id, parent_id, name, level, path, sort_order) VALUES
(21, 2, '渠道与店铺建设', 2, '2/21', 1),
(22, 2, '商品内容与上架', 2, '2/22', 2),
(23, 2, '达人/社媒/直播启动', 2, '2/23', 3),
(24, 2, '包装与样品管理', 2, '2/24', 4);

-- 三级：需求项（阶段二）
INSERT INTO requirement_categories (id, parent_id, name, level, path, sort_order) VALUES
(211, 21, '平台开店', 3, '2/21/211', 1),
(212, 21, '独立站建设', 3, '2/21/212', 2),
(221, 22, 'Listing与素材生产', 3, '2/22/221', 1),
(222, 22, '合规材料与上架门槛', 3, '2/22/222', 2),
(231, 23, '达人合作与结算', 3, '2/23/231', 1),
(232, 23, '直播间搭建与直播运营', 3, '2/23/232', 2),
(241, 24, '外包装设计', 3, '2/24/241', 1),
(242, 24, '防损包装', 3, '2/24/242', 2);

-- 二级：分类（阶段三）
INSERT INTO requirement_categories (id, parent_id, name, level, path, sort_order) VALUES
(31, 3, '获客与投放', 2, '3/31', 1),
(32, 3, '订单、财务与收款', 2, '3/32', 2),
(33, 3, '客服与售后', 2, '3/33', 3),
(34, 3, '合规与风险的持续运营', 2, '3/34', 4),
(35, 3, '定价与利润管理', 2, '3/35', 5),
(36, 3, '外部服务商管理', 2, '3/36', 6),
(37, 3, '代运营', 2, '3/37', 7);

-- 三级：需求项（阶段三）
INSERT INTO requirement_categories (id, parent_id, name, level, path, sort_order) VALUES
(311, 31, '流量推广与精准营销', 3, '3/31/311', 1),
(312, 31, '广告投放与优化', 3, '3/31/312', 2),
(321, 32, '跨境支付与资金管理', 3, '3/32/321', 1),
(322, 32, '出口退税与税务申报', 3, '3/32/322', 2),
(331, 33, '知识库/智能客服', 3, '3/33/331', 1),
(332, 33, '退换货、维修、质保服务', 3, '3/33/332', 2),
(341, 34, '平台合规', 3, '3/34/341', 1),
(342, 34, '知识产权维护', 3, '3/34/342', 2),
(351, 35, '多币种定价', 3, '3/35/351', 1),
(352, 35, '毛利/净利核算模型', 3, '3/35/352', 2),
(361, 36, '服务商类型', 3, '3/36/361', 1),
(362, 36, '供应商评估', 3, '3/36/362', 2),
(363, 36, '合同与结算', 3, '3/36/363', 3),
(371, 37, '代运营独立站', 3, '3/37/371', 1),
(372, 37, '代运营亚马逊（Amazon）', 3, '3/37/372', 2),
(373, 37, '代运营TikTok Shop', 3, '3/37/373', 3),
(374, 37, '代运营速卖通（AliExpress）', 3, '3/37/374', 4),
(375, 37, '代运营eBay', 3, '3/37/375', 5),
(376, 37, '代运营Shopee', 3, '3/37/376', 6),
(377, 37, '代运营Lazada', 3, '3/37/377', 7),
(378, 37, '代运营Temu', 3, '3/37/378', 8),
(379, 37, '代运营SHEIN', 3, '3/37/379', 9),
(3710, 37, '代运营Walmart', 3, '3/37/3710', 10),
(3711, 37, '代运营Mercado Libre', 3, '3/37/3711', 11),
(3712, 37, '代运营Ozon', 3, '3/37/3712', 12),
(3713, 37, '代运营阿里国际站（Alibaba.com）', 3, '3/37/3713', 13);

-- 二级：分类（阶段四）
INSERT INTO requirement_categories (id, parent_id, name, level, path, sort_order) VALUES
(41, 4, '履约升级与交付体验', 2, '4/41', 1),
(42, 4, '私域与会员运营', 2, '4/42', 2),
(43, 4, '产品与品牌迭代', 2, '4/43', 3),
(44, 4, '新品规划', 2, '4/44', 4);

-- 三级：需求项（阶段四）
INSERT INTO requirement_categories (id, parent_id, name, level, path, sort_order) VALUES
(411, 41, '报关/清关异常处理', 3, '4/41/411', 1),
(412, 41, '海外仓', 3, '4/41/412', 2),
(421, 42, '合伙人转介、交叉销售、复购', 3, '4/42/421', 1),
(431, 43, '产品迭代机制', 3, '4/43/431', 1),
(432, 43, '品牌推广与IP策略', 3, '4/43/432', 2),
(441, 44, '商品洞察', 3, '4/44/441', 1),
(442, 44, '产品定义', 3, '4/44/442', 2);

-- ============================================================
-- 常州跨境电商三中心 - 企业信息管理系统
-- 统一分类初始化数据 (categories)
-- 合并原 industry_categories + product_categories，企业行业与产品品类共用
-- ============================================================

-- ==================== 一级分类 ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(1, 0, '制造业', 1, '1', 1),
(2, 0, '贸易/零售', 1, '2', 2),
(3, 0, '服务业', 1, '3', 3),
(4, 0, '农林牧渔', 1, '4', 4);

-- ==================== 制造业（二级分类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
-- 轻工制造
(-89899, -89999, '园艺制品', 2, '-89999/-89899', 1),
(-89898, -89999, '家居用品', 2, '-89999/-89898', 2),
(-89897, -89999, '纺织服装', 2, '-89999/-89897', 3),
(-89896, -89999, '箱包皮具', 2, '-89999/-89896', 4),
(-89895, -89999, '鞋类制品', 2, '-89999/-89895', 5),
(-89894, -89999, '玩具礼品', 2, '-89999/-89894', 6),
(-89893, -89999, '文体用品', 2, '-89999/-89893', 7),
(-89892, -89999, '美容个护', 2, '-89999/-89892', 8),
(-89891, -89999, '食品加工', 2, '-89999/-89891', 9),
-- 重工制造
(-89890, -89999, '电子产品', 2, '-89999/-89890', 10),
(-89889, -89999, '电动工具', 2, '-89999/-89889', 11),
(-89888, -89999, '机械设备', 2, '-89999/-89888', 12),
(-89887, -89999, '汽车零部件', 2, '-89999/-89887', 13),
(-89886, -89999, '五金建材', 2, '-89999/-89886', 14),
(-89885, -89999, '照明灯具', 2, '-89999/-89885', 15),
(-89884, -89999, '安防器材', 2, '-89999/-89884', 16),
(-89883, -89999, '医疗器械', 2, '-89999/-89883', 17),
(-89882, -89999, '新能源', 2, '-89999/-89882', 18),
(-89881, -89999, '化工材料', 2, '-89999/-89881', 19),
(-89880, -89999, '自行车/电动车', 2, '-89999/-89880', 20),
(-89801, -89999, '其他制造', 2, '-89999/-89801', 99);

-- ==================== 园艺制品（三级分类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(10101, 101, '园艺工具', 3, '1/101/10101', 1),
(10102, 101, '园艺装饰', 3, '1/101/10102', 2),
(10103, 101, '花盆花器', 3, '1/101/10103', 3),
(10104, 101, '灌溉设备', 3, '1/101/10104', 4),
(10105, 101, '草坪设备', 3, '1/101/10105', 5),
(10106, 101, '温室大棚', 3, '1/101/10106', 6);

-- ==================== 家居用品（三级分类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(10201, 102, '厨房用品', 3, '1/102/10201', 1),
(10202, 102, '卫浴用品', 3, '1/102/10202', 2),
(10203, 102, '家纺布艺', 3, '1/102/10203', 3),
(10204, 102, '收纳整理', 3, '1/102/10204', 4),
(10205, 102, '家居装饰', 3, '1/102/10205', 5),
(10206, 102, '清洁用品', 3, '1/102/10206', 6),
(10207, 102, '家具制造', 3, '1/102/10207', 7),
(10208, 102, '宠物用品', 3, '1/102/10208', 8);

-- ==================== 纺织服装（三级分类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(10301, 103, '男装', 3, '1/103/10301', 1),
(10302, 103, '女装', 3, '1/103/10302', 2),
(10303, 103, '童装', 3, '1/103/10303', 3),
(10304, 103, '运动服饰', 3, '1/103/10304', 4),
(10305, 103, '内衣家居服', 3, '1/103/10305', 5),
(10306, 103, '服装辅料', 3, '1/103/10306', 6),
(10307, 103, '面料纺织', 3, '1/103/10307', 7);

-- ==================== 箱包皮具（三级分类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(10401, 104, '旅行箱包', 3, '1/104/10401', 1),
(10402, 104, '女包', 3, '1/104/10402', 2),
(10403, 104, '男包', 3, '1/104/10403', 3),
(10404, 104, '钱包卡包', 3, '1/104/10404', 4),
(10405, 104, '功能箱包', 3, '1/104/10405', 5);

-- ==================== 鞋类制品（三级分类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(10501, 105, '运动鞋', 3, '1/105/10501', 1),
(10502, 105, '休闲鞋', 3, '1/105/10502', 2),
(10503, 105, '皮鞋', 3, '1/105/10503', 3),
(10504, 105, '凉鞋拖鞋', 3, '1/105/10504', 4),
(10505, 105, '童鞋', 3, '1/105/10505', 5),
(10506, 105, '功能鞋', 3, '1/105/10506', 6);

-- ==================== 玩具礼品（三级分类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(10601, 106, '益智玩具', 3, '1/106/10601', 1),
(10602, 106, '电动玩具', 3, '1/106/10602', 2),
(10603, 106, '毛绒玩具', 3, '1/106/10603', 3),
(10604, 106, '模型玩具', 3, '1/106/10604', 4),
(10605, 106, '户外玩具', 3, '1/106/10605', 5),
(10606, 106, '节日礼品', 3, '1/106/10606', 6),
(10607, 106, '工艺品', 3, '1/106/10607', 7);

-- ==================== 文体用品（三级分类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(10701, 107, '办公文具', 3, '1/107/10701', 1),
(10702, 107, '体育器材', 3, '1/107/10702', 2),
(10703, 107, '户外装备', 3, '1/107/10703', 3),
(10704, 107, '健身器材', 3, '1/107/10704', 4),
(10705, 107, '乐器', 3, '1/107/10705', 5);

-- ==================== 美容个护（三级分类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(10801, 108, '护肤品', 3, '1/108/10801', 1),
(10802, 108, '彩妆', 3, '1/108/10802', 2),
(10803, 108, '美发护发', 3, '1/108/10803', 3),
(10804, 108, '美甲美睫', 3, '1/108/10804', 4),
(10805, 108, '个人护理', 3, '1/108/10805', 5),
(10806, 108, '香水香氛', 3, '1/108/10806', 6);

-- ==================== 食品加工（三级分类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(10901, 109, '休闲食品', 3, '1/109/10901', 1),
(10902, 109, '饮料冲调', 3, '1/109/10902', 2),
(10903, 109, '粮油调味', 3, '1/109/10903', 3),
(10904, 109, '保健食品', 3, '1/109/10904', 4),
(10905, 109, '茶叶', 3, '1/109/10905', 5);

-- ==================== 电子产品（三级分类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(11001, 110, '消费电子', 3, '1/110/11001', 1),
(11002, 110, '智能硬件', 3, '1/110/11002', 2),
(11003, 110, '电脑配件', 3, '1/110/11003', 3),
(11004, 110, '手机配件', 3, '1/110/11004', 4),
(11005, 110, '数码影音', 3, '1/110/11005', 5),
(11006, 110, '电子元器件', 3, '1/110/11006', 6),
(11007, 110, '工业电子', 3, '1/110/11007', 7);

-- ==================== 电动工具（三级分类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(11101, 111, '电钻', 3, '1/111/11101', 1),
(11102, 111, '电锯', 3, '1/111/11102', 2),
(11103, 111, '角磨机', 3, '1/111/11103', 3),
(11104, 111, '电动扳手', 3, '1/111/11104', 4),
(11105, 111, '抛光机', 3, '1/111/11105', 5),
(11106, 111, '电动螺丝刀', 3, '1/111/11106', 6),
(11107, 111, '电刨', 3, '1/111/11107', 7);

-- ==================== 机械设备（三级分类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(11201, 112, '通用机械', 3, '1/112/11201', 1),
(11202, 112, '农业机械', 3, '1/112/11202', 2),
(11203, 112, '工程机械', 3, '1/112/11203', 3),
(11204, 112, '包装机械', 3, '1/112/11204', 4),
(11205, 112, '食品机械', 3, '1/112/11205', 5),
(11206, 112, '纺织机械', 3, '1/112/11206', 6),
(11207, 112, '印刷机械', 3, '1/112/11207', 7);

-- ==================== 汽车零部件（三级分类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(11301, 113, '汽车电子', 3, '1/113/11301', 1),
(11302, 113, '汽车内饰', 3, '1/113/11302', 2),
(11303, 113, '汽车外饰', 3, '1/113/11303', 3),
(11304, 113, '发动机配件', 3, '1/113/11304', 4),
(11305, 113, '底盘配件', 3, '1/113/11305', 5),
(11306, 113, '汽车养护', 3, '1/113/11306', 6),
(11307, 113, '摩托车配件', 3, '1/113/11307', 7);

-- ==================== 五金建材（三级分类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(11401, 114, '门窗五金', 3, '1/114/11401', 1),
(11402, 114, '水暖管件', 3, '1/114/11402', 2),
(11403, 114, '紧固件', 3, '1/114/11403', 3),
(11404, 114, '手动工具', 3, '1/114/11404', 4),
(11405, 114, '建筑材料', 3, '1/114/11405', 5),
(11406, 114, '装饰材料', 3, '1/114/11406', 6);

-- ==================== 照明灯具（三级分类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(11501, 115, '室内照明', 3, '1/115/11501', 1),
(11502, 115, '户外照明', 3, '1/115/11502', 2),
(11503, 115, '商业照明', 3, '1/115/11503', 3),
(11504, 115, 'LED光源', 3, '1/115/11504', 4),
(11505, 115, '灯具配件', 3, '1/115/11505', 5);

-- ==================== 安防器材（三级分类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(11601, 116, '监控设备', 3, '1/116/11601', 1),
(11602, 116, '门禁系统', 3, '1/116/11602', 2),
(11603, 116, '报警器材', 3, '1/116/11603', 3),
(11604, 116, '消防器材', 3, '1/116/11604', 4),
(11605, 116, '防护用品', 3, '1/116/11605', 5);

-- ==================== 医疗器械（三级分类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(11701, 117, '医疗设备', 3, '1/117/11701', 1),
(11702, 117, '医疗耗材', 3, '1/117/11702', 2),
(11703, 117, '康复器械', 3, '1/117/11703', 3),
(11704, 117, '家用医疗', 3, '1/117/11704', 4),
(11705, 117, '实验室设备', 3, '1/117/11705', 5);

-- ==================== 新能源（三级分类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(11801, 118, '太阳能', 3, '1/118/11801', 1),
(11802, 118, '储能电池', 3, '1/118/11802', 2),
(11803, 118, '电动车', 3, '1/118/11803', 3),
(11804, 118, '充电设备', 3, '1/118/11804', 4);

-- ==================== 化工材料（三级分类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(11901, 119, '塑料制品', 3, '1/119/11901', 1),
(11902, 119, '橡胶制品', 3, '1/119/11902', 2),
(11903, 119, '涂料油漆', 3, '1/119/11903', 3),
(11904, 119, '胶黏剂', 3, '1/119/11904', 4),
(11905, 119, '化工原料', 3, '1/119/11905', 5);

-- ==================== 自行车/电动车（三级分类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(12001, 120, '自行车制造', 3, '1/120/12001', 1),
(12002, 120, '电动自行车制造', 3, '1/120/12002', 2),
(12003, 120, '自行车配件', 3, '1/120/12003', 3);

-- ==================== 贸易/零售（二级分类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(201, 2, '综合贸易', 2, '2/201', 1),
(202, 2, '进出口代理', 2, '2/202', 2),
(203, 2, '批发零售', 2, '2/203', 3),
(204, 2, '电商运营', 2, '2/204', 4),
(205, 2, '供应链管理', 2, '2/205', 5);

-- ==================== 服务业（二级分类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(301, 3, '物流仓储', 2, '3/301', 1),
(302, 3, '金融服务', 2, '3/302', 2),
(303, 3, '信息技术', 2, '3/303', 3),
(304, 3, '咨询服务', 2, '3/304', 4),
(305, 3, '营销推广', 2, '3/305', 5),
(306, 3, '人力资源', 2, '3/306', 6),
(307, 3, '检测认证', 2, '3/307', 7);

-- ==================== 农林牧渔（二级分类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(401, 4, '种植业', 2, '4/401', 1),
(402, 4, '畜牧业', 2, '4/402', 2),
(403, 4, '渔业', 2, '4/403', 3),
(404, 4, '林业', 2, '4/404', 4),
(405, 4, '农产品加工', 2, '4/405', 5);
-- ============================================================
-- 产品品类种子数据（原 product_categories，ID 已偏移 +100000 避免冲突）
-- 所有 id / parent_id / path 中的数字均已添加 +100000 偏移
-- ============================================================

-- ==================== 一级品类 ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(100001, 0, '园艺工具', 1, '100001', 1),
(100002, 0, '电动工具', 1, '100002', 2),
(100003, 0, '家居用品', 1, '100003', 3),
(100004, 0, '户外运动', 1, '100004', 4),
(100005, 0, '汽车配件', 1, '100005', 5),
(100006, 0, '电子产品', 1, '100006', 6),
(100007, 0, '纺织服装', 1, '100007', 7),
(100008, 0, '建材五金', 1, '100008', 8),
(100009, 0, '机械设备', 1, '100009', 9),
(100010, 0, '美容个护', 1, '100010', 10),
(100011, 0, '玩具礼品', 1, '100011', 11),
(100012, 0, '箱包皮具', 1, '100012', 12),
(100013, 0, '鞋类', 1, '100013', 13),
(100014, 0, '食品饮料', 1, '100014', 14),
(100015, 0, '医疗健康', 1, '100015', 15),
(100016, 0, '宠物用品', 1, '100016', 16),
(100017, 0, '照明灯具', 1, '100017', 17),
(100018, 0, '安防器材', 1, '100018', 18),
(100019, 0, '新能源', 1, '100019', 19),
(100020, 0, '化工材料', 1, '100020', 20),
(100021, 0, '家用电器', 1, '100021', 21),
(100022, 0, '软件与信息服务', 1, '100022', 22),
(100023, 0, '包装印刷', 1, '100023', 23),
(100024, 0, '精密制造', 1, '100024', 24),
(100099, 0, '其他', 1, '100099', 99);

-- ==================== 园艺工具（二级品类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(100101, 100001, '园艺手工具', 2, '100001/100101', 1),
(100102, 100001, '园艺电动工具', 2, '100001/100102', 2),
(100103, 100001, '园艺装饰品', 2, '100001/100103', 3),
(100104, 100001, '花盆花器', 2, '100001/100104', 4),
(100105, 100001, '灌溉设备', 2, '100001/100105', 5),
(100106, 100001, '草坪设备', 2, '100001/100106', 6);

-- 园艺手工具（三级品类）
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(110101, 100101, '铲子', 3, '100001/100101/110101', 1),
(110102, 100101, '剪刀', 3, '100001/100101/110102', 2),
(110103, 100101, '耙子', 3, '100001/100101/110103', 3),
(110104, 100101, '锄头', 3, '100001/100101/110104', 4),
(110105, 100101, '园艺刀', 3, '100001/100101/110105', 5);

-- ==================== 电动工具（二级品类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(100201, 100002, '电钻', 2, '100002/100201', 1),
(100202, 100002, '电锯', 2, '100002/100202', 2),
(100203, 100002, '角磨机', 2, '100002/100203', 3),
(100204, 100002, '电动扳手', 2, '100002/100204', 4),
(100205, 100002, '抛光机', 2, '100002/100205', 5),
(100206, 100002, '电动螺丝刀', 2, '100002/100206', 6),
(100207, 100002, '电刨', 2, '100002/100207', 7),
(100208, 100002, '热风枪', 2, '100002/100208', 8);

-- ==================== 家居用品（二级品类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(100301, 100003, '厨房用品', 2, '100003/100301', 1),
(100302, 100003, '卫浴用品', 2, '100003/100302', 2),
(100303, 100003, '收纳整理', 2, '100003/100303', 3),
(100304, 100003, '家居装饰', 2, '100003/100304', 4),
(100305, 100003, '清洁用品', 2, '100003/100305', 5),
(100306, 100003, '家纺布艺', 2, '100003/100306', 6),
(100307, 100003, '家具', 2, '100003/100307', 7);

-- 厨房用品（三级品类）
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(130101, 100301, '锅具', 3, '100003/100301/130101', 1),
(130102, 100301, '刀具', 3, '100003/100301/130102', 2),
(130103, 100301, '餐具', 3, '100003/100301/130103', 3),
(130104, 100301, '厨房小家电', 3, '100003/100301/130104', 4),
(130105, 100301, '烘焙工具', 3, '100003/100301/130105', 5);

-- ==================== 户外运动（二级品类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(100401, 100004, '露营装备', 2, '100004/100401', 1),
(100402, 100004, '运动器材', 2, '100004/100402', 2),
(100403, 100004, '户外服装', 2, '100004/100403', 3),
(100404, 100004, '登山装备', 2, '100004/100404', 4),
(100405, 100004, '骑行装备', 2, '100004/100405', 5),
(100406, 100004, '水上运动', 2, '100004/100406', 6),
(100407, 100004, '健身器材', 2, '100004/100407', 7);

-- ==================== 汽车配件（二级品类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(100501, 100005, '汽车电子', 2, '100005/100501', 1),
(100502, 100005, '汽车内饰', 2, '100005/100502', 2),
(100503, 100005, '汽车外饰', 2, '100005/100503', 3),
(100504, 100005, '维修保养', 2, '100005/100504', 4),
(100505, 100005, '汽车改装', 2, '100005/100505', 5),
(100506, 100005, '摩托车配件', 2, '100005/100506', 6);

-- ==================== 电子产品（二级品类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(100601, 100006, '消费电子', 2, '100006/100601', 1),
(100602, 100006, '智能硬件', 2, '100006/100602', 2),
(100603, 100006, '电脑配件', 2, '100006/100603', 3),
(100604, 100006, '手机配件', 2, '100006/100604', 4),
(100605, 100006, '数码影音', 2, '100006/100605', 5),
(100606, 100006, '游戏设备', 2, '100006/100606', 6);

-- 消费电子（三级品类）
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(160101, 100601, '蓝牙耳机', 3, '100006/100601/160101', 1),
(160102, 100601, '智能手表', 3, '100006/100601/160102', 2),
(160103, 100601, '充电宝', 3, '100006/100601/160103', 3),
(160104, 100601, '音箱', 3, '100006/100601/160104', 4),
(160105, 100601, '摄像头', 3, '100006/100601/160105', 5);

-- ==================== 纺织服装（二级品类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(100701, 100007, '男装', 2, '100007/100701', 1),
(100702, 100007, '女装', 2, '100007/100702', 2),
(100703, 100007, '童装', 2, '100007/100703', 3),
(100704, 100007, '运动服饰', 2, '100007/100704', 4),
(100705, 100007, '内衣家居服', 2, '100007/100705', 5),
(100706, 100007, '配饰', 2, '100007/100706', 6);

-- ==================== 建材五金（二级品类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(100801, 100008, '门窗五金', 2, '100008/100801', 1),
(100802, 100008, '水暖管件', 2, '100008/100802', 2),
(100803, 100008, '紧固件', 2, '100008/100803', 3),
(100804, 100008, '手动工具', 2, '100008/100804', 4),
(100805, 100008, '建筑材料', 2, '100008/100805', 5),
(100806, 100008, '装饰材料', 2, '100008/100806', 6);

-- ==================== 机械设备（二级品类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(100901, 100009, '通用机械', 2, '100009/100901', 1),
(100902, 100009, '农业机械', 2, '100009/100902', 2),
(100903, 100009, '工程机械', 2, '100009/100903', 3),
(100904, 100009, '包装机械', 2, '100009/100904', 4),
(100905, 100009, '食品机械', 2, '100009/100905', 5);

-- ==================== 美容个护（二级品类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(101001, 100010, '护肤品', 2, '100010/101001', 1),
(101002, 100010, '彩妆', 2, '100010/101002', 2),
(101003, 100010, '美发护发', 2, '100010/101003', 3),
(101004, 100010, '美甲美睫', 2, '100010/101004', 4),
(101005, 100010, '个人护理', 2, '100010/101005', 5),
(101006, 100010, '香水香氛', 2, '100010/101006', 6);

-- ==================== 玩具礼品（二级品类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(101101, 100011, '益智玩具', 2, '100011/101101', 1),
(101102, 100011, '电动玩具', 2, '100011/101102', 2),
(101103, 100011, '毛绒玩具', 2, '100011/101103', 3),
(101104, 100011, '模型玩具', 2, '100011/101104', 4),
(101105, 100011, '户外玩具', 2, '100011/101105', 5),
(101106, 100011, '节日礼品', 2, '100011/101106', 6),
(101107, 100011, '工艺品', 2, '100011/101107', 7);

-- ==================== 箱包皮具（二级品类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(101201, 100012, '旅行箱包', 2, '100012/101201', 1),
(101202, 100012, '女包', 2, '100012/101202', 2),
(101203, 100012, '男包', 2, '100012/101203', 3),
(101204, 100012, '钱包卡包', 2, '100012/101204', 4),
(101205, 100012, '功能箱包', 2, '100012/101205', 5);

-- ==================== 鞋类（二级品类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(101301, 100013, '运动鞋', 2, '100013/101301', 1),
(101302, 100013, '休闲鞋', 2, '100013/101302', 2),
(101303, 100013, '皮鞋', 2, '100013/101303', 3),
(101304, 100013, '凉鞋拖鞋', 2, '100013/101304', 4),
(101305, 100013, '童鞋', 2, '100013/101305', 5),
(101306, 100013, '功能鞋', 2, '100013/101306', 6);

-- ==================== 食品饮料（二级品类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(101401, 100014, '休闲食品', 2, '100014/101401', 1),
(101402, 100014, '饮料冲调', 2, '100014/101402', 2),
(101403, 100014, '粮油调味', 2, '100014/101403', 3),
(101404, 100014, '保健食品', 2, '100014/101404', 4),
(101405, 100014, '茶叶', 2, '100014/101405', 5);

-- ==================== 医疗健康（二级品类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(101501, 100015, '医疗设备', 2, '100015/101501', 1),
(101502, 100015, '医疗耗材', 2, '100015/101502', 2),
(101503, 100015, '康复器械', 2, '100015/101503', 3),
(101504, 100015, '家用医疗', 2, '100015/101504', 4);

-- ==================== 宠物用品（二级品类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(101601, 100016, '宠物食品', 2, '100016/101601', 1),
(101602, 100016, '宠物玩具', 2, '100016/101602', 2),
(101603, 100016, '宠物服饰', 2, '100016/101603', 3),
(101604, 100016, '宠物清洁', 2, '100016/101604', 4),
(101605, 100016, '宠物窝笼', 2, '100016/101605', 5);

-- ==================== 照明灯具（二级品类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(101701, 100017, '室内照明', 2, '100017/101701', 1),
(101702, 100017, '户外照明', 2, '100017/101702', 2),
(101703, 100017, '商业照明', 2, '100017/101703', 3),
(101704, 100017, 'LED光源', 2, '100017/101704', 4),
(101705, 100017, '灯具配件', 2, '100017/101705', 5);

-- ==================== 安防器材（二级品类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(101801, 100018, '监控设备', 2, '100018/101801', 1),
(101802, 100018, '门禁系统', 2, '100018/101802', 2),
(101803, 100018, '报警器材', 2, '100018/101803', 3),
(101804, 100018, '消防器材', 2, '100018/101804', 4),
(101805, 100018, '防护用品', 2, '100018/101805', 5);

-- ==================== 新能源（二级品类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(101901, 100019, '太阳能产品', 2, '100019/101901', 1),
(101902, 100019, '储能电池', 2, '100019/101902', 2),
(101903, 100019, '电动车配件', 2, '100019/101903', 3),
(101904, 100019, '充电设备', 2, '100019/101904', 4);

-- ==================== 化工材料（二级品类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(102001, 100020, '塑料制品', 2, '100020/102001', 1),
(102002, 100020, '橡胶制品', 2, '100020/102002', 2),
(102003, 100020, '涂料油墨', 2, '100020/102003', 3),
(102004, 100020, '胶粘制品', 2, '100020/102004', 4),
(102005, 100020, '阻燃材料', 2, '100020/102005', 5),
(102006, 100020, '新材料', 2, '100020/102006', 6),
(102007, 100020, '化工原料', 2, '100020/102007', 7);

-- ==================== 家用电器（二级品类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(102101, 100021, '大家电', 2, '100021/102101', 1),
(102102, 100021, '小家电', 2, '100021/102102', 2),
(102103, 100021, '厨房电器', 2, '100021/102103', 3),
(102104, 100021, '个护电器', 2, '100021/102104', 4),
(102105, 100021, '环境电器', 2, '100021/102105', 5),
(102106, 100021, '制冷设备', 2, '100021/102106', 6);

-- ==================== 软件与信息服务（二级品类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(102201, 100022, '企业软件', 2, '100022/102201', 1),
(102202, 100022, '电商服务', 2, '100022/102202', 2),
(102203, 100022, '金融科技', 2, '100022/102203', 3),
(102204, 100022, '医疗信息化', 2, '100022/102204', 4),
(102205, 100022, 'IT咨询与外包', 2, '100022/102205', 5),
(102206, 100022, '人力资源服务', 2, '100022/102206', 6);

-- ==================== 包装印刷（二级品类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(102301, 100023, '包装材料', 2, '100023/102301', 1),
(102302, 100023, '印刷制品', 2, '100023/102302', 2),
(102303, 100023, '广告展示', 2, '100023/102303', 3),
(102304, 100023, '标签标识', 2, '100023/102304', 4);

-- ==================== 精密制造（二级品类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(102401, 100024, '航空零部件', 2, '100024/102401', 1),
(102402, 100024, '精密铸锻件', 2, '100024/102402', 2),
(102403, 100024, '3D打印', 2, '100024/102403', 3),
(102404, 100024, '精密加工', 2, '100024/102404', 4),
(102405, 100024, '模具', 2, '100024/102405', 5);

-- ==================== 其他（二级品类） ====================
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(109901, 100099, '成人用品', 2, '100099/109901', 1),
(109902, 100099, '金融保险', 2, '100099/109902', 2),
(109903, 100099, '贸易批发', 2, '100099/109903', 3),
(109904, 100099, '外贸服务', 2, '100099/109904', 4),
(109905, 100099, '工程服务', 2, '100099/109905', 5),
(109906, 100099, '综合商品', 2, '100099/109906', 6);

-- ==================== 新增二级品类（补充产品匹配） ====================

-- 园艺工具（新增二级品类）
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(100200, 100001, '园艺用品', 2, '100001/100200', 21);

-- 电动工具（新增二级品类）
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(100209, 100002, '小电动工具', 2, '100002/100209', 9),
(100210, 100002, '无刷角磨机', 2, '100002/100210', 10),
(100211, 100002, '无刷直磨机', 2, '100002/100211', 11),
(100212, 100002, '无刷磁力钻', 2, '100002/100212', 12),
(100213, 100002, '无刷开槽机', 2, '100002/100213', 13),
(100214, 100002, '无刷切割机', 2, '100002/100214', 14);

-- 家居用品（新增二级品类）
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(100308, 100003, '家居', 2, '100003/100308', 8),
(100309, 100003, '生活家居', 2, '100003/100309', 9),
(100310, 100003, '办公用品', 2, '100003/100310', 10),
(100311, 100003, '日用百货', 2, '100003/100311', 11),
(100312, 100003, '婴儿用品', 2, '100003/100312', 12);

-- 户外运动（新增二级品类）
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(100408, 100004, '体育用品', 2, '100004/100408', 8);


-- 纺织服装（新增二级品类）
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(100707, 100007, '服装', 2, '100007/100707', 7),
(100708, 100007, '针织服装', 2, '100007/100708', 8),
(100709, 100007, '服装加工', 2, '100007/100709', 9);

-- 建材五金（新增二级品类）
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(100807, 100008, '电工电料', 2, '100008/100807', 7);

-- 箱包皮具（新增二级品类）
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(101206, 100012, '箱包', 2, '100012/101206', 6);

-- 宠物用品（新增二级品类）
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(101606, 100016, '宠物', 2, '100016/101606', 6);

-- 照明灯具（新增二级品类）
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(101706, 100017, '灯具', 2, '100017/101706', 6);

-- 新能源（新增二级品类）
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(101905, 100019, '新能源航空动力系统', 2, '100019/101905', 5),
(101906, 100019, '辅助电动力系统', 2, '100019/101906', 6);

-- 化工材料（新增二级品类）
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(102008, 100020, '环保产品', 2, '100020/102008', 8);

-- ==================== 新增三级品类（补充产品匹配） ====================

-- 园艺装饰品
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(110308, 100103, '园艺网', 3, '100001/100103/110308', 8);

-- 厨房用品
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(130106, 100301, '厨房用具', 3, '100003/100301/130106', 6);

-- 卫浴用品
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(130201, 100302, '智能马桶', 3, '100003/100302/130201', 1),
(130202, 100302, '整体卫浴', 3, '100003/100302/130202', 2);

-- 收纳整理
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(130301, 100303, '收纳箱', 3, '100003/100303/130301', 1);

-- 家居装饰
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(130401, 100304, '暖炉', 3, '100003/100304/130401', 1);

-- 清洁用品
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(130501, 100305, '刷子', 3, '100003/100305/130501', 1);

-- 家纺布艺
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(130601, 100306, '家纺', 3, '100003/100306/130601', 1),
(130602, 100306, '遮阳幕', 3, '100003/100306/130602', 2),
(130603, 100306, '保温幕', 3, '100003/100306/130603', 3),
(130604, 100306, '遮阳网', 3, '100003/100306/130604', 4),
(130605, 100306, '地垫', 3, '100003/100306/130605', 5),
(130606, 100306, '保健枕', 3, '100003/100306/130606', 6);

-- 家具
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(130701, 100307, '小家具', 3, '100003/100307/130701', 1),
(130702, 100307, '钢木家具', 3, '100003/100307/130702', 2),
(130703, 100307, '办公家具', 3, '100003/100307/130703', 3),
(130704, 100307, '家具柜', 3, '100003/100307/130704', 4),
(130705, 100307, '学习桌椅', 3, '100003/100307/130705', 5),
(130706, 100307, '升降桌', 3, '100003/100307/130706', 6),
(130707, 100307, '电脑桌', 3, '100003/100307/130707', 7),
(130708, 100307, '板式书架', 3, '100003/100307/130708', 8),
(130709, 100307, '绘图桌', 3, '100003/100307/130709', 9),
(130710, 100307, '缝纫桌', 3, '100003/100307/130710', 10),
(130711, 100307, '裁剪桌', 3, '100003/100307/130711', 11),
(130712, 100307, '金属桌椅', 3, '100003/100307/130712', 12),
(130713, 100307, '折叠床', 3, '100003/100307/130713', 13),
(130714, 100307, '电动床', 3, '100003/100307/130714', 14),
(130715, 100307, '沙发', 3, '100003/100307/130715', 15),
(130716, 100307, '钢木小家具', 3, '100003/100307/130716', 16),
(130717, 100307, '翻斗换鞋凳', 3, '100003/100307/130717', 17),
(130718, 100307, '板式家居', 3, '100003/100307/130718', 18);

-- 露营装备
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(140101, 100401, '烧烤炉', 3, '100004/100401/140101', 1);

-- 骑行装备
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(140501, 100405, '摩托车头盔', 3, '100004/100405/140501', 1);

-- 健身器材
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(140701, 100407, '瑜伽用品', 3, '100004/100407/140701', 1),
(140702, 100407, '健身产品', 3, '100004/100407/140702', 2);

-- 汽车电子
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(150101, 100501, '汽车用小电器', 3, '100005/100501/150101', 1),
(150102, 100501, '汽车应用电机', 3, '100005/100501/150102', 2);

-- 汽车内饰
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(150201, 100502, '内饰', 3, '100005/100502/150201', 1);

-- 汽车外饰
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(150301, 100503, '车灯', 3, '100005/100503/150301', 1),
(150302, 100503, '皮卡配件保险杠', 3, '100005/100503/150302', 2),
(150303, 100503, '尾灯', 3, '100005/100503/150303', 3),
(150304, 100503, '行李架', 3, '100005/100503/150304', 4);

-- 维修保养
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(150401, 100504, '水封', 3, '100005/100504/150401', 1),
(150402, 100504, '汽车空调压缩机', 3, '100005/100504/150402', 2);

-- 汽车改装
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(150501, 100505, '汽车改装件', 3, '100005/100505/150501', 1),
(150502, 100505, '改装车灯', 3, '100005/100505/150502', 2);

-- 消费电子
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(160106, 100601, '电声元器件', 3, '100006/100601/160106', 6),
(160107, 100601, '电源组', 3, '100006/100601/160107', 7);

-- 智能硬件
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(160201, 100602, '信息面板', 3, '100006/100602/160201', 1),
(160202, 100602, '传感器', 3, '100006/100602/160202', 2),
(160203, 100602, '电子标签', 3, '100006/100602/160203', 3),
(160204, 100602, '环网柜部件', 3, '100006/100602/160204', 4),
(160205, 100602, '环网柜', 3, '100006/100602/160205', 5),
(160206, 100602, '智能游学终端', 3, '100006/100602/160206', 6),
(160207, 100602, '智能家居', 3, '100006/100602/160207', 7),
(160208, 100602, '控制器', 3, '100006/100602/160208', 8);

-- 电脑配件
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(160301, 100603, '电路板', 3, '100006/100603/160301', 1),
(160302, 100603, '配线架', 3, '100006/100603/160302', 2),
(160303, 100603, '理线器', 3, '100006/100603/160303', 3),
(160304, 100603, '光纤', 3, '100006/100603/160304', 4),
(160305, 100603, '光纤配线架', 3, '100006/100603/160305', 5),
(160306, 100603, '连接器', 3, '100006/100603/160306', 6);

-- 数码影音
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(160501, 100605, '测距仪', 3, '100006/100605/160501', 1),
(160502, 100605, '显示器材', 3, '100006/100605/160502', 2);

-- 男装
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(170101, 100701, '牛仔', 3, '100007/100701/170101', 1),
(170102, 100701, '羽绒服', 3, '100007/100701/170102', 2),
(170103, 100701, '衬衫', 3, '100007/100701/170103', 3),
(170104, 100701, 'T恤', 3, '100007/100701/170104', 4),
(170105, 100701, '外套', 3, '100007/100701/170105', 5),
(170106, 100701, '牛仔休闲服装', 3, '100007/100701/170106', 6);

-- 运动服饰
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(170401, 100704, '功能性防护工作服', 3, '100007/100704/170401', 1),
(170402, 100704, '功能性防火服装', 3, '100007/100704/170402', 2);

-- 配饰
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(170601, 100706, '服装面料', 3, '100007/100706/170601', 1),
(170602, 100706, '针织面料', 3, '100007/100706/170602', 2),
(170603, 100706, '针织牛仔面料', 3, '100007/100706/170603', 3),
(170604, 100706, '高档面料', 3, '100007/100706/170604', 4),
(170605, 100706, '色织布', 3, '100007/100706/170605', 5),
(170606, 100706, '灯芯绒', 3, '100007/100706/170606', 6),
(170607, 100706, '台球布', 3, '100007/100706/170607', 7);

-- 门窗五金
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(180101, 100801, '开关', 3, '100008/100801/180101', 1),
(180102, 100801, '插座', 3, '100008/100801/180102', 2);

-- 水暖管件
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(180201, 100802, '液压管件', 3, '100008/100802/180201', 1),
(180202, 100802, '半导体管件', 3, '100008/100802/180202', 2);

-- 手动工具
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(180401, 100804, '工具', 3, '100008/100804/180401', 1),
(180402, 100804, '五金工具', 3, '100008/100804/180402', 2),
(180403, 100804, '钻头五金工具', 3, '100008/100804/180403', 3),
(180404, 100804, '砂轮片', 3, '100008/100804/180404', 4);

-- 建筑材料
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(180501, 100805, '铸件', 3, '100008/100805/180501', 1),
(180502, 100805, '涂料', 3, '100008/100805/180502', 2);

-- 装饰材料
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(180601, 100806, '亚克力装饰材料', 3, '100008/100806/180601', 1),
(180602, 100806, '地板', 3, '100008/100806/180602', 2);

-- 通用机械
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(190101, 100901, '电机', 3, '100009/100901/190101', 1),
(190102, 100901, '轧辊', 3, '100009/100901/190102', 2),
(190103, 100901, '齿轮', 3, '100009/100901/190103', 3),
(190104, 100901, '水泵', 3, '100009/100901/190104', 4),
(190105, 100901, '机械零部件', 3, '100009/100901/190105', 5),
(190106, 100901, '工业机器人', 3, '100009/100901/190106', 6),
(190107, 100901, '超声波设备', 3, '100009/100901/190107', 7),
(190108, 100901, '柴油发电机组', 3, '100009/100901/190108', 8),
(190109, 100901, '液压举升系统', 3, '100009/100901/190109', 9),
(190110, 100901, '微特电机', 3, '100009/100901/190110', 10),
(190111, 100901, '发电机冲片', 3, '100009/100901/190111', 11),
(190112, 100901, '伺服装置', 3, '100009/100901/190112', 12),
(190113, 100901, '无刷电机', 3, '100009/100901/190113', 13),
(190114, 100901, '深井水泵', 3, '100009/100901/190114', 14),
(190115, 100901, '油泵及水泵', 3, '100009/100901/190115', 15),
(190116, 100901, '汽车衡', 3, '100009/100901/190116', 16),
(190117, 100901, '真空设备', 3, '100009/100901/190117', 17),
(190118, 100901, '零配件', 3, '100009/100901/190118', 18);

-- 农业机械
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(190201, 100902, '农业机具', 3, '100009/100902/190201', 1);

-- 节日礼品
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(210601, 101106, '定制化促销礼品', 3, '100011/101106/210601', 1);

-- 功能箱包
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(220501, 101205, '环保袋', 3, '100012/101205/220501', 1);

-- 医疗设备
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(250101, 101501, '外科手术器械', 3, '100015/101501/250101', 1),
(250102, 101501, '吻合器', 3, '100015/101501/250102', 2),
(250103, 101501, '皮肤吻合器', 3, '100015/101501/250103', 3),
(250104, 101501, '穿刺器', 3, '100015/101501/250104', 4),
(250105, 101501, '取样钳', 3, '100015/101501/250105', 5),
(250106, 101501, '脊椎麻醉穿刺针', 3, '100015/101501/250106', 6),
(250107, 101501, '制药装备', 3, '100015/101501/250107', 7),
(250108, 101501, '制药干燥设备', 3, '100015/101501/250108', 8);

-- 医疗耗材
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(250201, 101502, '输液器', 3, '100015/101502/250201', 1),
(250202, 101502, '一次性注射器', 3, '100015/101502/250202', 2),
(250203, 101502, '注射器', 3, '100015/101502/250203', 3),
(250204, 101502, '尿袋', 3, '100015/101502/250204', 4),
(250205, 101502, '扩张器', 3, '100015/101502/250205', 5),
(250206, 101502, '导管', 3, '100015/101502/250206', 6),
(250207, 101502, 'PVC袋', 3, '100015/101502/250207', 7),
(250208, 101502, '引流袋', 3, '100015/101502/250208', 8),
(250209, 101502, '冲洗连接带', 3, '100015/101502/250209', 9),
(250210, 101502, '一次性医疗器材', 3, '100015/101502/250210', 10),
(250211, 101502, '一次性医疗用品', 3, '100015/101502/250211', 11);

-- 室内照明
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(270101, 101701, '三防灯', 3, '100017/101701/270101', 1);

-- 户外照明
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(270201, 101702, '路灯', 3, '100017/101702/270201', 1),
(270202, 101702, '户外灯', 3, '100017/101702/270202', 2),
(270203, 101702, '户外灯具', 3, '100017/101702/270203', 3);

-- 门禁系统
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(280201, 101802, '门禁卡', 3, '100018/101802/280201', 1);

-- 太阳能产品
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(290101, 101901, '光伏封装胶膜', 3, '100019/101901/290101', 1),
(290102, 101901, '高性能薄膜', 3, '100019/101901/290102', 2),
(290103, 101901, '光伏玻璃', 3, '100019/101901/290103', 3),
(290104, 101901, '光伏设备', 3, '100019/101901/290104', 4);

-- 电动车配件
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(290301, 101903, '电动自行车', 3, '100019/101903/290301', 1),
(290302, 101903, 'ebike', 3, '100019/101903/290302', 2),
(290303, 101903, '电动摩托车', 3, '100019/101903/290303', 3),
(290304, 101903, '电动滑板', 3, '100019/101903/290304', 4);

-- 塑料制品
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(300101, 102001, '地膜', 3, '100020/102001/300101', 1),
(300102, 102001, '塑料齿轮', 3, '100020/102001/300102', 2),
(300103, 102001, '塑料件', 3, '100020/102001/300103', 3);

-- 胶粘制品
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(300401, 102004, '工业胶带', 3, '100020/102004/300401', 1);

-- 阻燃材料
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(300501, 102005, '水菱镁阻燃剂', 3, '100020/102005/300501', 1);

-- 新材料
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(300601, 102006, '抗震新材料', 3, '100020/102006/300601', 1),
(300602, 102006, '纳米材料', 3, '100020/102006/300602', 2);

-- 大家电
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(310101, 102101, '移动空调', 3, '100021/102101/310101', 1),
(310102, 102101, '空调恒温系统', 3, '100021/102101/310102', 2);

-- 环境电器
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(310501, 102105, '除湿机', 3, '100021/102105/310501', 1);

-- 制冷设备
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(310601, 102106, '蒸发器', 3, '100021/102106/310601', 1),
(310602, 102106, '冷凝器', 3, '100021/102106/310602', 2);

-- 企业软件
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(320101, 102201, 'ERP', 3, '100022/102201/320101', 1),
(320102, 102201, 'MES', 3, '100022/102201/320102', 2),
(320103, 102201, 'QMS', 3, '100022/102201/320103', 3),
(320104, 102201, 'PLM', 3, '100022/102201/320104', 4),
(320105, 102201, 'BPM', 3, '100022/102201/320105', 5),
(320106, 102201, 'HRM', 3, '100022/102201/320106', 6);

-- 电商服务
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(320201, 102202, '出海企业服务', 3, '100022/102202/320201', 1),
(320202, 102202, '电商供应链管理', 3, '100022/102202/320202', 2),
(320203, 102202, '电商代运营', 3, '100022/102202/320203', 3);

-- 金融科技
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(320301, 102203, '支付系统', 3, '100022/102203/320301', 1);

-- 医疗信息化
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(320401, 102204, '医院运营平台', 3, '100022/102204/320401', 1);

-- IT咨询与外包
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(320501, 102205, '数智化产品开发', 3, '100022/102205/320501', 1),
(320502, 102205, '系统集成', 3, '100022/102205/320502', 2),
(320503, 102205, '网络系统集成', 3, '100022/102205/320503', 3),
(320504, 102205, '软硬件开发', 3, '100022/102205/320504', 4),
(320505, 102205, '云计算设备', 3, '100022/102205/320505', 5),
(320506, 102205, '互联网数据服务', 3, '100022/102205/320506', 6),
(320507, 102205, '物联网技术服务', 3, '100022/102205/320507', 7),
(320508, 102205, '工业互联网数据服务', 3, '100022/102205/320508', 8),
(320509, 102205, '网站设计', 3, '100022/102205/320509', 9);

-- 人力资源服务
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(320601, 102206, '人力资源管理咨询', 3, '100022/102206/320601', 1);

-- 包装材料
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(330101, 102301, '镀锡薄板', 3, '100023/102301/330101', 1);

-- 广告展示
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(330301, 102303, '活动展架', 3, '100023/102303/330301', 1),
(330302, 102303, '展台', 3, '100023/102303/330302', 2),
(330303, 102303, '易拉宝', 3, '100023/102303/330303', 3),
(330304, 102303, '展架', 3, '100023/102303/330304', 4);

-- 航空零部件
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(340101, 102401, '飞机坐具餐板', 3, '100024/102401/340101', 1),
(340102, 102401, '飞机坐具零件', 3, '100024/102401/340102', 2);

-- 3D打印
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(340301, 102403, '微纳3D打印系统', 3, '100024/102403/340301', 1);

-- 精密加工
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(340401, 102404, '电梯导轨', 3, '100024/102404/340401', 1),
(340402, 102404, '精密轴承', 3, '100024/102404/340402', 2),
(340403, 102404, '精密切削刀具', 3, '100024/102404/340403', 3);

-- 金融保险
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(1090201, 109902, '保险', 3, '100099/109902/1090201', 1);

-- 贸易批发
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(1090301, 109903, '批发', 3, '100099/109903/1090301', 1);

-- 外贸服务
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(1090401, 109904, '外贸代理', 3, '100099/109904/1090401', 1),
(1090402, 109904, '货物进出口', 3, '100099/109904/1090402', 2);

-- 工程服务
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(1090501, 109905, '工程', 3, '100099/109905/1090501', 1);

-- 综合商品
INSERT INTO categories (id, parent_id, name, level, path, sort_order) VALUES
(1090601, 109906, '综合类', 3, '100099/109906/1090601', 1),
(1090602, 109906, '大件', 3, '100099/109906/1090602', 2);

-- ============================================================
-- 常州跨境电商三中心 - 企业信息管理系统
-- 需求初始化数据 (requirements)
-- ============================================================

-- ============================================================
-- 第一阶段：准备期 — 战略规划与资源准备
-- ============================================================

-- 1.1 品牌规划
INSERT INTO requirements (id, name, description, detail_description, phase, category, sort_order) VALUES
('1.1.1', '品牌定位与规划设计', '客群定位、价格带、差异化卖点、品牌故事',
'基于洞察结果输出品牌战略：明确目标客群画像，确定产品价格区间，提炼区别于竞品的核心卖点，构建品牌叙事与视觉识别系统（VI）。',
'phase_1', '1.1', 1);

-- 1.2 市场洞察
INSERT INTO requirements (id, name, description, detail_description, phase, category, sort_order) VALUES
('1.2.1', '市场/IP洞察', '市场容量、趋势、竞品对标',
'通过第三方数据（如Jungle Scout、Helium 10）评估目标品类市场规模与增长趋势，分析头部竞品的定价、评分、卖点，识别市场机会与进入壁垒。',
'phase_1', '1.2', 1);

-- 1.3 搭建营销体系
INSERT INTO requirements (id, name, description, detail_description, phase, category, sort_order) VALUES
('1.3.1', '用户旅程设计', '认知-考虑-购买-复购',
'设计从用户首次接触品牌到完成首购、再到复购推荐的全链路触点，规划各阶段的内容、渠道与转化目标。',
'phase_1', '1.3', 1),
('1.3.2', '画像/要素/标签体系', '人货场标签体系',
'建立用户标签（如新客/老客、高价值/低活跃）、商品标签（如爆款/长尾、高毛利/引流）、场景标签（如大促/日销），用于精准营销与个性化推荐。',
'phase_1', '1.3', 2),
('1.3.3', '营销活动与节奏规划', '年度营销日历',
'制定年度营销日历，结合海外节日（黑五、Prime Day、圣诞）与品牌节奏，规划新品上市、促销活动、会员日等关键节点。',
'phase_1', '1.3', 3),
('1.3.4', 'O2O营销体系', '线上线下联动、全渠道触达',
'若有线下渠道，设计线上引流线下、线下体验线上购买的闭环，实现全渠道用户数据打通与统一营销。欧洲展厅（产品展示，品牌出海/D2C模式）。',
'phase_1', '1.3', 4);

-- 1.4 测品选品与前置验证评估
INSERT INTO requirements (id, name, description, detail_description, phase, category, sort_order) VALUES
('1.4.1', '平台测品、双轨选品', '小批量测试验证市场',
'通过小批量上架、广告测试、用户反馈等方式验证产品市场接受度；结合供应链能力与市场需求双向筛选，确定主推产品。',
'phase_1', '1.4', 1),
('1.4.2', '海外认证可行性评估', '目标市场所需认证、成本、周期',
'评估目标市场强制认证要求（如CE、FCC、FDA），预估认证费用、周期与所需技术文件，判断产品是否具备合规可行性。',
'phase_1', '1.4', 2),
('1.4.3', '品类规划与产品矩阵', '核心品类/延伸品类/机会品类',
'规划产品组合：核心品类贡献主要销售，延伸品类满足关联需求，机会品类探索新市场；区分引流款（低价获客）、利润款（主要盈利）、形象款（品牌背书）、测试款（验证方向）。',
'phase_1', '1.4', 3),
('1.4.4', '消费者洞察与调研', '用户调研、NPS/CSAT、行为分析',
'为品牌定位与选品提供数据输入：通过问卷、访谈、Review分析了解用户需求与痛点；建立满意度追踪机制（NPS/CSAT），分析行为路径与转化瓶颈。',
'phase_1', '1.4', 4);

-- 1.5 战略与预算
INSERT INTO requirements (id, name, description, detail_description, phase, category, sort_order) VALUES
('1.5.1', '出海路径规划', '平台/独立站/线下组合',
'根据品牌阶段、品类特性、资源禀赋，选择亚马逊等平台快速起量、独立站沉淀私域、线下渠道拓展的组合策略。',
'phase_1', '1.5', 1),
('1.5.2', '营销战略与预算', '阶段目标、预算分配',
'制定阶段性目标（如首年GMV、市场份额、用户增长），按渠道（广告/达人/社媒）与阶段（冷启动/放量/稳定）分配营销预算。',
'phase_1', '1.5', 2),
('1.5.3', '资金预算与融资/政府资源', '出口补贴、综试区、海关便利化',
'测算启动资金需求，了解跨境电商综试区政策优惠、出口退税政策、政府专项补贴，对接融资渠道（如供应链金融、跨境贷）。',
'phase_1', '1.5', 3),
('1.5.4', '行业协会与展会资源', '商会、广交会、CES、行业峰会',
'加入跨境电商行业协会获取政策解读与资源对接，参加广交会、CES等展会拓展客户与供应商资源，建立行业人脉。',
'phase_1', '1.5', 4),
('1.5.5', '并购与战略投资', '品牌收购、渠道投资、战略联盟',
'评估通过收购海外品牌快速进入市场的可行性，投资渠道资源或物流资产，与互补企业建立战略合作关系。',
'phase_1', '1.5', 5);

-- 1.6 供应链与物流准备
INSERT INTO requirements (id, name, description, detail_description, phase, category, sort_order) VALUES
('1.6.1', '备货策略与库存预案', '销售预测与库存管理',
'根据销售预测制定备货计划，设定安全库存水位，制定断货、滞销、大促等场景的库存应对预案。',
'phase_1', '1.6', 1),
('1.6.2', '物流渠道方案选型', '集运/海外仓/一件代发等',
'根据品类特性、目标市场、资金规模，评估各物流方式适用场景，确定初期物流组合策略。',
'phase_1', '1.6', 2),
('1.6.3', '采购渠道拓展', '货源开发、供应商筛选',
'针对贸易型企业，开发稳定货源渠道，建立供应商筛选与评估标准，确保产品质量与供货稳定性。',
'phase_1', '1.6', 3),
('1.6.4', '最小起订量谈判', '小单采购支持',
'针对初创/SOHO企业，与供应商协商降低MOQ（最小起订量），或寻找支持小批量采购的供应商，降低库存压力与资金占用。',
'phase_1', '1.6', 4);

-- 1.7 合规前置
INSERT INTO requirements (id, name, description, detail_description, phase, category, sort_order) VALUES
('1.7.1', '知识产权布局', '商标/专利/版权',
'在目标市场提前注册商标、申请专利、登记版权，防止品牌被抢注或产品被侵权，建立知识产权保护体系。',
'phase_1', '1.7', 1),
('1.7.2', '税务合规前置', 'VAT等注册与口径确认',
'在开店前完成目标国VAT税号注册，明确税务申报口径与频率，规划税务架构以优化税负。',
'phase_1', '1.7', 2),
('1.7.3', '数据隐私合规前置', '独立站数据采集合规',
'若运营独立站，需遵循GDPR（欧盟）、CCPA（加州）等数据隐私法规，制定隐私政策、用户同意机制与数据处理流程。',
'phase_1', '1.7', 3),
('1.7.4', '合同管理前置', '跨境合同模板、争议解决机制',
'准备跨境交易合同模板，明确付款条款、交付条件、违约责任，约定争议解决方式（如仲裁机构、适用法律）。',
'phase_1', '1.7', 4),
('1.7.5', '进出口合规', '进出口许可证、报关单、退税证明',
'在开店前完成目标国进出口许可证注册，明确报关单与退税证明要求。',
'phase_1', '1.7', 5);

-- 1.8 团队与组织准备
INSERT INTO requirements (id, name, description, detail_description, phase, category, sort_order) VALUES
('1.8.1', '组织架构设计', '跨境电商部门设置、岗位分工',
'设计跨境电商团队架构，明确运营、供应链、营销、客服、财务等岗位职责与协作机制。',
'phase_1', '1.8', 1),
('1.8.2', '人才招聘', '专业技能、语言能力',
'招聘具备平台运营、海外营销、跨境物流等专业技能的人才，重视外语能力与跨文化沟通能力。',
'phase_1', '1.8', 2),
('1.8.3', '人才培养', '培训体系、技能认证',
'建立培训体系，覆盖岗位技能与跨文化沟通能力提升，支持人才考证需求。',
'phase_1', '1.8', 3),
('1.8.4', '自建团队/代运营选择', '团队模式选择',
'根据企业资源与战略重要性，选择自建团队（掌控力强但成本高）或代运营（快速启动但依赖外部），或采用混合模式。',
'phase_1', '1.8', 4),
('1.8.5', '跨时区与远程协作', '会议安排、异步协作、文化融合',
'若有海外团队或合作伙伴，制定跨时区会议规范，使用异步协作工具（如Loom、Notion），尊重文化差异建立信任。',
'phase_1', '1.8', 5),
('1.8.6', '办公场地与工位', '自有办公室、共享工位、产业园入驻',
'根据团队规模与成本考量，选择自有办公室、联合办公空间或入驻跨境电商产业园/孵化器，享受政策扶持、资源对接与行业氛围。',
'phase_1', '1.8', 6);

-- ============================================================
-- 第二阶段：启动期 — 渠道搭建与商品上线
-- ============================================================

-- 2.1 渠道与店铺建设
INSERT INTO requirements (id, name, description, detail_description, phase, category, sort_order) VALUES
('2.1.1', '平台开店', '账号与主体、上传产品详情项、店铺运营',
'选择合适的主体（国内公司/海外公司）注册平台账号，完成店铺资质审核；上传符合平台规范的产品详情页，开启日常运营与广告投放。',
'phase_2', '2.1', 1),
('2.1.2', '独立站建设', '内容管理、用户管理',
'搭建品牌独立站（如Shopify、Magento），实现商品展示、内容发布、用户注册登录、订阅管理等功能，积累品牌私域资产。',
'phase_2', '2.1', 2),
('2.1.3', '线下渠道搭建', '开口官店/店中店/渠道对接',
'在海外开设品牌旗舰店或与零售商合作店中店，对接线下分销渠道（如超市、专卖店），整合线下资源实现全渠道覆盖。',
'phase_2', '2.1', 3),
('2.1.4', '海外实体与本地化运营', '海外公司注册、本地团队',
'根据业务需要注册海外公司（如美国LLC、欧洲GmbH），设立本地办公室招聘本地员工，与本地仓储、物流、服务商建立合作关系。',
'phase_2', '2.1', 4),
('2.1.5', '海外分销商/代理商管理', '分销体系建设、代理商招募',
'建立海外分销体系，制定分销商/代理商招募标准与政策，管理价格体系与窜货风险，提供渠道赋能与支持。',
'phase_2', '2.1', 5);

-- 2.2 商品内容与上架
INSERT INTO requirements (id, name, description, detail_description, phase, category, sort_order) VALUES
('2.2.1', 'Listing与素材生产', '图片/文案/视频/品牌故事/关键词优化',
'制作高质量产品主图、场景图、A+页面，撰写本地化文案与卖点描述，拍摄产品视频，进行关键词调研与埋词优化，提升搜索排名与转化率。',
'phase_2', '2.2', 1),
('2.2.2', '合规材料与上架门槛', '类目准入、资质/证书/测试报告',
'准备平台要求的类目准入资质（如品牌授权、检测报告），上传产品认证证书、符合性声明，确保产品标签与说明书符合目标市场法规。',
'phase_2', '2.2', 2),
('2.2.3', '多语言翻译与本地化', '详情页、客服、说明书本地化',
'将产品详情页、客服话术、使用说明书翻译成目标市场语言，适配本地支付方式、地址格式（如邮编规则）、计量单位（如英制/公制）。',
'phase_2', '2.2', 3);

-- 2.3 达人/社媒/直播启动
INSERT INTO requirements (id, name, description, detail_description, phase, category, sort_order) VALUES
('2.3.1', '达人合作与结算', 'KOL/KOC资源对接',
'对接海外KOL/KOC资源（如TikTok、YouTube、Instagram达人），制定合作模式（坑位费/佣金/赠品），建立达人结算与效果追踪机制。',
'phase_2', '2.3', 1),
('2.3.2', '直播间搭建与直播运营', '直播空间、团队、AI直播',
'搭建直播空间与设备，组建直播团队（主播、运营、场控），制定直播脚本与选品策略，运营TikTok Shop、Amazon Live等平台直播。部署AI数字人主播实现7×24小时不间断直播。',
'phase_2', '2.3', 2),
('2.3.3', '种草内容生产与分发', '社媒内容营销',
'生产适合社媒传播的种草内容（图文、短视频、用户测评），在TikTok、Instagram、Pinterest、YouTube等平台分发，积累品牌曝光与口碑。',
'phase_2', '2.3', 3);

-- 2.4 包装与样品管理
INSERT INTO requirements (id, name, description, detail_description, phase, category, sort_order) VALUES
('2.4.1', '外包装设计', '品牌包装、防伪标识、开箱体验',
'设计符合品牌调性的产品包装，增加防伪标识（如二维码验真），优化开箱体验（如定制包装盒、感谢卡、赠品）提升用户好感。',
'phase_2', '2.4', 1),
('2.4.2', '防损包装', '易碎品保护、运输测试',
'针对易碎、易损产品设计保护包装方案，进行跌落、振动、堆码等运输模拟测试，降低物流破损率。',
'phase_2', '2.4', 2),
('2.4.3', '环保包材', '可降解材料、FSC认证、减塑要求',
'响应海外环保法规与消费者偏好，使用可降解材料、FSC认证纸张，减少塑料使用，满足亚马逊等平台的环保包装要求。',
'phase_2', '2.4', 3),
('2.4.4', '样品流程', '打样申请、样品追踪、成本核销',
'建立样品申请流程（用途、数量、审批），追踪样品流向（发给达人/客户/展会），核销样品成本计入营销或研发费用。',
'phase_2', '2.4', 4);


-- ============================================================
-- 第三阶段：成长期 — 营销推广与规模增长
-- ============================================================

-- 3.1 获客与投放
INSERT INTO requirements (id, name, description, detail_description, phase, category, sort_order) VALUES
('3.1.1', '流量推广与精准营销', '平台广告与人群定向',
'通过平台搜索广告、展示广告、品牌广告等获取流量，结合用户画像与行为数据进行精准人群定向，提升广告转化效率。',
'phase_3', '3.1', 1),
('3.1.2', '站内外广告素材生产', '广告素材制作与优化',
'制作适配各广告位的素材（主图、视频、A+页面、社媒广告图），持续优化素材以提升点击率与转化率。',
'phase_3', '3.1', 2),
('3.1.3', '大数据主动拓客', '线索挖掘/触达',
'利用大数据工具挖掘潜在客户线索（如B2B场景），通过邮件、社媒、电话等方式主动触达，拓展客户资源。',
'phase_3', '3.1', 3),
('3.1.4', '市场活动灵活用工', '活动执行/外包协同',
'在大促或线下活动期间，通过灵活用工（临时工、外包团队）快速扩充执行人力，确保活动顺利落地。',
'phase_3', '3.1', 4),
('3.1.5', '广告投放与优化', '竞价策略、ACOS/ROAS/TACOS',
'制定竞价策略（自动/手动、分时调价），监控广告效果指标（ACOS广告成本占比、ROAS广告回报率、TACOS总广告成本占比），使用规则引擎或AI工具实现自动化调价与预算分配。',
'phase_3', '3.1', 5),
('3.1.6', 'A/B测试与实验', 'Listing测试、价格测试、广告测试',
'对Listing元素（主图、标题、五点描述、A+页面）、价格、广告素材与受众进行A/B测试，基于数据驱动决策优化。',
'phase_3', '3.1', 6),
('3.1.7', 'B2B询盘与报价管理', '询盘处理、报价策略、跟进转化',
'针对阿里国际站等B2B平台，建立询盘处理流程（响应时效、模板话术），制定报价策略（阶梯报价、MOQ差异化），跟进潜在客户促进转化。',
'phase_3', '3.1', 7),
('3.1.8', '数据分析与BI工具', '运营看板、决策支持系统',
'搭建运营数据看板，整合销售、广告、库存、财务数据；引入BI工具（如Power BI、Tableau）进行多维分析，支持数据驱动决策。',
'phase_3', '3.1', 8);

-- 3.2 订单、财务与收汇
INSERT INTO requirements (id, name, description, detail_description, phase, category, sort_order) VALUES
('3.2.1', '生产融资', '供应链金融',
'对接供应链金融产品，基于订单或应收账款获取生产融资，缓解资金周转压力。',
'phase_3', '3.2', 1),
('3.2.2', '跨境支付与资金管理', '多币种账户、汇率管理',
'开设多币种收款账户（如美元、欧元、英镑），接入本地支付方式（PayPal、Stripe、Klarna等），管理汇率风险（锁汇、换汇时机），确保资金安全与反洗钱合规。',
'phase_3', '3.2', 2),
('3.2.3', '财务核算与成本归集', '多币种记账、利润归属',
'实现多币种记账与汇兑损益核算，将成本（采购、物流、广告、平台费）归集到SKU/渠道/区域维度，精准核算利润。',
'phase_3', '3.2', 3),
('3.2.4', '出口退税与税务申报', '退税资质/单证/申报',
'办理出口退税资质，管理退税单证（报关单、发票、收汇凭证），按时申报出口退税；完成各国VAT、所得税申报；优化税务架构降低税负。',
'phase_3', '3.2', 4),
('3.2.5', '国际贸易结算方式', 'T/T、L/C、D/P、D/A',
'掌握传统外贸结算方式：电汇（T/T）、信用证（L/C）、付款交单（D/P）、承兑交单（D/A）；根据客户资质与订单规模选择合适结算方式，管理收款风险。',
'phase_3', '3.2', 5);

-- 3.3 客服与售后
INSERT INTO requirements (id, name, description, detail_description, phase, category, sort_order) VALUES
('3.3.1', '知识库/智能客服', '多渠道客服与智能机器人',
'提供多渠道客服（邮件、在线聊天、电话），建设产品与售后知识库，部署智能客服机器人处理常见问题，提升响应效率。',
'phase_3', '3.3', 1),
('3.3.2', '报税/批税/税务咨询', '客户税务问题响应',
'响应客户关于进口关税、增值税等税务问题的咨询，提供清关税费预估与解释。',
'phase_3', '3.3', 2),
('3.3.3', '退换货、维修、质保服务', '售后服务体系',
'制定退换货政策，建立本地退货地址或逆向物流渠道；提供维修服务（自修或授权维修点）；明确质保期限与服务范围。',
'phase_3', '3.3', 3),
('3.3.4', '评价与口碑管理', '邀评策略、差评监控',
'设计邀评策略（售后跟进邮件、包裹卡片）提升好评率；实时监控差评并主动联系客户解决问题；通过NLP分析Review情感，挖掘产品改进建议。',
'phase_3', '3.3', 4),
('3.3.5', '逆向物流与成本控制', '退货集运、翻新/二次销售',
'建立退货集运机制降低逆向物流成本；对退货进行分类处理（翻新后二次销售、报废销毁）；核算退货率、赔付率、质保成本。',
'phase_3', '3.3', 5);

-- 3.4 合规与风险的持续运营
INSERT INTO requirements (id, name, description, detail_description, phase, category, sort_order) VALUES
('3.4.1', '平台合规', '材料提交、抽检/下架/申诉',
'按平台要求提交合规材料（资质证书、检测报告），应对平台抽检与下架，准备申诉材料恢复链接；申请限制类目准入资质。',
'phase_3', '3.4', 1),
('3.4.2', '产品认证管理', '认证矩阵/标签说明书/证据链',
'建立产品认证矩阵（国家×品类×认证要求），管理标签与说明书合规性，归档技术文件与证据链，跟踪证书有效期与年审，明确责任主体与授权链（制造商/进口商/欧代/英代）。',
'phase_3', '3.4', 2),
('3.4.3', '知识产权维护', '侵权监控、平台投诉、诉讼',
'监控市场上的商标/专利/版权侵权行为，通过平台投诉机制下架侵权链接，必要时发送律师函或提起诉讼维护权益。',
'phase_3', '3.4', 3),
('3.4.4', '风险管理', '汇率/政策/供应链/账号/信用风险',
'识别并管理汇率风险（对冲）、政策风险（贸易壁垒）、供应链风险（供应商备份）、账号风险（合规运营）、信用风险（客户评估）。',
'phase_3', '3.4', 4),
('3.4.5', '保险与风险转移', '货运险/仓储险/产品责任险/信用险',
'配置险种组合（货运险、仓储险、产品责任险、信用险），购买产品责任险应对产品伤害索赔；明确保险条款与免赔额，建立出险报案与理赔追踪流程。',
'phase_3', '3.4', 5),
('3.4.6', '法律诉讼与争议解决', '跨境诉讼、仲裁与调解',
'应对跨境知识产权诉讼、合同纠纷、产品责任诉讼；选择国际仲裁或平台仲裁解决争议；建立目标市场本地律师网络。',
'phase_3', '3.4', 6);

-- 3.5 定价与利润管理
INSERT INTO requirements (id, name, description, detail_description, phase, category, sort_order) VALUES
('3.5.1', '多币种定价', '税费/运费/平台费联动定价',
'制定各市场本地货币价格，考虑汇率波动；将税费、运费、平台佣金纳入定价模型，确保目标毛利率。',
'phase_3', '3.5', 1),
('3.5.2', '毛利/净利核算模型', '促销、清仓、生命周期定价',
'建立毛利与净利核算模型，精准计算各SKU利润；制定差异化价格策略：日常定价、促销定价、清仓定价、生命周期定价（新品高价→成熟稳价→衰退降价）。',
'phase_3', '3.5', 2);

-- 3.6 外部服务商管理
INSERT INTO requirements (id, name, description, detail_description, phase, category, sort_order) VALUES
('3.6.1', '服务商类型', '物流商、代运营、翻译、摄影、法务、财税',
'识别并分类管理各类外部服务商：物流服务商、代运营服务商、翻译公司、摄影与设计团队、法律顾问、财税服务商。',
'phase_3', '3.6', 1),
('3.6.2', '供应商评估', '准入标准、绩效考核、淘汰机制',
'制定服务商准入标准（资质、案例、报价），定期进行绩效考核（服务质量、响应速度、成本），建立末位淘汰机制。',
'phase_3', '3.6', 2),
('3.6.3', '合同与结算', '服务协议、SLA、账期管理',
'签订服务协议明确服务范围与责任，约定SLA（服务水平协议）指标，管理账期与付款节奏。',
'phase_3', '3.6', 3);

-- 3.7 代运营
INSERT INTO requirements (id, name, description, detail_description, phase, category, sort_order) VALUES
('3.7.1', '代运营独立站', 'Shopify、Magento、BigCommerce等',
'委托专业服务商运营品牌独立站，涵盖建站搭建、主题设计、SEO优化、广告投放、转化率优化、日常维护与数据分析。',
'phase_3', '3.7', 1),
('3.7.2', '代运营亚马逊（Amazon）', 'Amazon店铺全托管',
'委托服务商管理亚马逊店铺，包括Listing优化、FBA/FBM策略、广告投放与竞价、品牌旗舰店搭建、A+页面制作、Review管理、库存与补货建议。',
'phase_3', '3.7', 2),
('3.7.3', '代运营TikTok Shop', 'TikTok电商运营',
'委托服务商运营TikTok Shop店铺，涵盖短视频内容制作与投放、直播运营、达人合作对接、商品上架与优化、店铺数据分析与增长策略。',
'phase_3', '3.7', 3),
('3.7.4', '代运营速卖通（AliExpress）', 'AliExpress店铺运营',
'委托服务商管理速卖通店铺，包括商品上架与多语言优化、站内活动报名、直通车广告投放、客服响应与纠纷处理、数据监控与运营策略调整。',
'phase_3', '3.7', 4),
('3.7.5', '代运营eBay', 'eBay店铺运营',
'委托服务商运营eBay店铺，涵盖商品刊登与SEO优化、Promoted Listings广告、Best Offer策略、卖家绩效管理、退货政策优化。',
'phase_3', '3.7', 5),
('3.7.6', '代运营Shopee', 'Shopee东南亚/拉美市场运营',
'委托服务商管理Shopee店铺（东南亚/拉美市场），包括商品上架与本地化、Shopee Ads投放、平台活动报名、聊聊客服管理、物流与履约协调。',
'phase_3', '3.7', 6),
('3.7.7', '代运营Lazada', 'Lazada东南亚市场运营',
'委托服务商运营Lazada店铺（东南亚市场），涵盖商品内容优化、Sponsored Solutions广告、大促活动参与、售后与评价管理。',
'phase_3', '3.7', 7),
('3.7.8', '代运营Temu', 'Temu店铺运营',
'委托服务商管理Temu店铺，包括选品与定价策略、商品素材制作、平台合规要求适配、订单履约与物流对接、销售数据分析与优化。',
'phase_3', '3.7', 8),
('3.7.9', '代运营SHEIN', 'SHEIN平台运营',
'委托服务商运营SHEIN平台（含SHEIN Marketplace），涵盖产品开发建议、图片与详情页制作、平台规则合规、库存与发货管理、销售表现跟踪。',
'phase_3', '3.7', 9),
('3.7.10', '代运营Walmart', 'Walmart Marketplace运营',
'委托服务商管理Walmart Marketplace店铺，包括商品上架与内容优化、Walmart Connect广告投放、WFS管理、价格竞争力维护、绩效指标达标。',
'phase_3', '3.7', 10),
('3.7.11', '代运营Mercado Libre', 'Mercado Libre拉美市场运营',
'委托服务商运营Mercado Libre店铺（拉美市场），涵盖西/葡语商品本地化、Product Ads广告、Mercado Envíos物流对接、售后与退换货管理、市场趋势分析。',
'phase_3', '3.7', 11),
('3.7.12', '代运营Ozon', 'Ozon俄罗斯及独联体市场运营',
'委托服务商管理Ozon店铺（俄罗斯及独联体市场），包括俄语商品内容制作、平台广告投放、FBO/FBS物流策略、合规与清关协调、销售与库存管理。',
'phase_3', '3.7', 12),
('3.7.13', '代运营阿里国际站（Alibaba.com）', 'Alibaba.com B2B店铺运营',
'委托服务商运营阿里国际站B2B店铺，涵盖产品发布与关键词优化、P4P直通车广告、RFQ报价管理、询盘跟进与转化、信保订单管理与数据分析。',
'phase_3', '3.7', 13);


-- ============================================================
-- 第四阶段：成熟期 — 品牌深耕与持续优化
-- ============================================================

-- 4.1 履约升级与交付体验
INSERT INTO requirements (id, name, description, detail_description, phase, category, sort_order) VALUES
('4.1.1', '报关/清关异常处理', '清关问题处理与应急机制',
'处理报关单证问题、海关查验、清关延误、税费争议等异常情况，建立异常处理SOP与应急联系机制，减少清关失败与退运。',
'phase_4', '4.1', 1),
('4.1.2', '集运（门到门）', '全程物流服务',
'提供从国内仓库到海外消费者门口的全程物流服务，整合头程运输、报关清关、尾程派送，优化成本与时效。',
'phase_4', '4.1', 2),
('4.1.3', '海外仓', '布局、入仓、履约',
'选择海外仓布局位置（如美西/美东/欧洲），管理入仓计划与库存，实现本地发货提升时效与客户体验。',
'phase_4', '4.1', 3),
('4.1.4', '一件代发', '无库存模式',
'支持小批量或无库存模式，接到订单后由供应商或第三方直接发货给消费者，降低库存风险但需管理供应商时效与质量。',
'phase_4', '4.1', 4),
('4.1.5', '小额采购（拼团）', '拼团降低采购成本',
'支持小额采购需求，通过拼团模式降低采购成本，适用于测品阶段或长尾SKU补货。',
'phase_4', '4.1', 5),
('4.1.6', '物流履约优化', '时效与成本、丢损/破损',
'持续优化物流时效与成本结构，分析丢损与破损原因并改进包装与承运商选择，提升妥投率与客户满意度。',
'phase_4', '4.1', 6);

-- 4.2 私域与会员运营
INSERT INTO requirements (id, name, description, detail_description, phase, category, sort_order) VALUES
('4.2.1', '合伙人转介、交叉销售、复购、防流失、会员体验', '会员全生命周期运营',
'发展用户成为品牌合伙人进行转介绍获客；通过关联推荐实现交叉销售；设计复购激励（积分、优惠券）；识别流失风险用户并主动挽回；提升会员专属体验（生日礼、专属客服）。',
'phase_4', '4.2', 1),
('4.2.2', '客户画像、自动化营销、社媒矩阵触达', '精准营销与用户触达',
'建立360度客户画像（购买行为、偏好、价值分层）；基于画像触发自动化营销（邮件、短信、推送）；通过社媒矩阵（Facebook群组、Instagram、TikTok）实现用户触达。',
'phase_4', '4.2', 2);

-- 4.3 产品与品牌迭代
INSERT INTO requirements (id, name, description, detail_description, phase, category, sort_order) VALUES
('4.3.1', '产品迭代机制', '评价/退货/售后驱动',
'建立从用户评价、退货原因、售后反馈到产品改进的闭环机制，定期分析问题并推动产品升级。',
'phase_4', '4.3', 1),
('4.3.2', '品牌推广与IP策略', 'IP授权、IP合作、IP销售',
'通过品牌广告、内容营销、公关活动提升品牌知名度；探索IP授权（授权他人使用品牌IP）、IP合作（与知名IP联名）、IP销售（自有IP衍生品）拓展收入。',
'phase_4', '4.3', 2),
('4.3.3', '竞争情报与平台政策跟踪', '竞品监控与政策跟踪',
'持续监控竞品动态（新品、定价、促销、评价），跟踪平台政策与算法变化，及时调整运营策略应对市场变化。',
'phase_4', '4.3', 3),
('4.3.4', '产品生命周期管理', '导入期/成长期/成熟期/衰退期',
'识别产品所处生命周期阶段，制定差异化策略：导入期（大力推广）、成长期（放量备货）、成熟期（稳定运营）、衰退期（清仓退出）；定期精简长尾SKU优化资源配置。',
'phase_4', '4.3', 4);

-- 4.4 新品规划
INSERT INTO requirements (id, name, description, detail_description, phase, category, sort_order) VALUES
('4.4.1', '商品洞察', '市场机会、用户需求、趋势捕捉',
'通过市场调研、竞品分析、用户反馈、趋势报告等方式发现新品机会，识别未被满足的用户需求与市场空白。',
'phase_4', '4.4', 1),
('4.4.2', '产品定义', '功能规格、卖点提炼、差异化设计',
'明确新品的功能规格与性能参数，提炼核心卖点与差异化优势，形成产品定义文档指导后续开发。',
'phase_4', '4.4', 2),
('4.4.3', '工业设计', '外观、结构、模具',
'进行产品外观设计（造型、配色、材质）、结构设计（内部布局、组装方式）、模具开发，平衡美观性与可制造性。',
'phase_4', '4.4', 3),
('4.4.4', '仿真验品', '3D渲染、样品评审、小批量试产',
'通过3D建模与渲染展示产品效果，制作样品进行内部评审与用户测试，小批量试产验证量产可行性与质量稳定性。',
'phase_4', '4.4', 4);

-- 4.5 规模化与降本增效
INSERT INTO requirements (id, name, description, detail_description, phase, category, sort_order) VALUES
('4.5.1', '履约与供应链降本', '运费结构、仓配策略、包材优化',
'优化运费结构（谈判运价、组合物流方式），改进仓储与配送策略，选用高性价比包材，提升妥投率降低二次派送成本。',
'phase_4', '4.5', 1);

-- 4.6 ESG与可持续
INSERT INTO requirements (id, name, description, detail_description, phase, category, sort_order) VALUES
('4.6.1', 'ESG合规、绿色供应链、社会责任', 'ESG与可持续发展',
'遵循ESG（环境、社会、治理）合规要求，如碳排放披露、劳工标准；建设绿色供应链（环保材料、低碳物流）；履行社会责任（公益捐赠、供应商审计），提升品牌可持续发展形象。',
'phase_4', '4.6', 1);

-- ============================================================
-- 常州跨境电商三中心 - 企业信息管理系统
-- 用户初始化数据
-- ============================================================

-- 初始化管理员用户
-- 密码: admin123 (BCrypt加密)
-- 注意: 如需修改密码，请使用BCrypt加密后替换

INSERT INTO users (username, password, name, role, phone, email, status) VALUES
('admin', '$2b$10$.zvpTySBuyu2opr2T8PdGe2QCZNibqsMv75oT8eIXS4Cl365Ew.dK', '系统管理员', 'admin', '13800000000', 'admin@tricenter.com', 1),
('manager', '$2b$10$.zvpTySBuyu2opr2T8PdGe2QCZNibqsMv75oT8eIXS4Cl365Ew.dK', '业务主管', 'manager', '13800000001', 'manager@tricenter.com', 1),
('user', '$2b$10$.zvpTySBuyu2opr2T8PdGe2QCZNibqsMv75oT8eIXS4Cl365Ew.dK', '普通用户', 'user', '13800000002', 'user@tricenter.com', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ============================================================
-- 默认账号信息:
-- | 用户名   | 密码      | 角色     | 说明       |
-- |---------|----------|---------|-----------|
-- | admin   | admin123 | admin   | 系统管理员 |
-- | manager | admin123 | manager | 业务主管   |
-- | user    | admin123 | user    | 普通用户   |
-- ============================================================

-- ============================================================
-- 生产环境升级：新增 import_export_code 字段
-- ALTER TABLE enterprises ADD COLUMN import_export_code VARCHAR(20) COMMENT '进出口收发货人代码' AFTER has_import_export_license;
-- ============================================================
