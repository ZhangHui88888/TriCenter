-- Flyway baseline: current schema only
-- Generated from docs/sql/tricenter_schema.sql; no database creation, destructive DDL, or seed users.

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

-- ============================================================
-- 表2: users (用户表)
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
-- 表3: user_cities (用户城市授权表)
-- ============================================================
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

-- ============================================================
-- 表4: categories (统一分类表，合并原 industry_categories + product_categories)
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
    city_id                 INT NOT NULL COMMENT '业务归属城市ID',
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
    INDEX idx_enterprises_city_deleted (city_id, is_deleted),
    INDEX idx_enterprises_city_stage (city_id, stage),
    INDEX idx_district (district),
    INDEX idx_industry (industry_id),
    INDEX idx_stage (stage),
    INDEX idx_source (source_id),
    INDEX idx_created (created_at),
    INDEX idx_booking_user (booking_user_id),
    FOREIGN KEY (city_id) REFERENCES cities(id),
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
    city_id         INT COMMENT '操作发生城市；全局管理操作为空',
    username        VARCHAR(50) COMMENT '操作人用户名',
    operation       VARCHAR(20) NOT NULL COMMENT '操作类型: CREATE/UPDATE/DELETE/IMPORT/EXPORT/STAGE_CHANGE',
    target_type     VARCHAR(30) NOT NULL COMMENT '操作对象类型: ENTERPRISE/CONTACT/PRODUCT/FOLLOW_UP',
    target_id       VARCHAR(50) COMMENT '操作对象ID',
    target_name     VARCHAR(200) COMMENT '操作对象名称',
    detail          VARCHAR(1000) COMMENT '操作详情',
    ip_address      VARCHAR(50) COMMENT 'IP地址',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user (user_id),
    INDEX idx_operation_logs_city_created (city_id, created_at),
    INDEX idx_target (target_type, target_id),
    INDEX idx_created (created_at),
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL
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

