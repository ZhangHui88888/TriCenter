-- ============================================================
-- 常州跨境电商三中心 - 企业信息管理系统
-- 数据库建表脚本
-- ============================================================

-- 数据库配置
-- 推荐: MySQL 8.0+ 或 PostgreSQL 14+
-- 字符集: UTF-8 (utf8mb4)
-- 排序规则: utf8mb4_unicode_ci

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
-- 表2: industry_categories (行业分类表)
-- ============================================================
CREATE TABLE industry_categories (
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
) COMMENT='行业分类表';

-- ============================================================
-- 表3: product_categories (产品品类分类表)
-- ============================================================
CREATE TABLE product_categories (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    parent_id   INT DEFAULT 0 COMMENT '父级ID，0为顶级',
    name        VARCHAR(50) NOT NULL COMMENT '品类名称',
    level       TINYINT NOT NULL COMMENT '层级：1/2/3',
    path        VARCHAR(100) COMMENT '完整路径，如：1/5/12',
    sort_order  INT DEFAULT 0 COMMENT '排序',
    is_enabled  TINYINT DEFAULT 1 COMMENT '是否启用',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_parent (parent_id),
    INDEX idx_path (path),
    INDEX idx_level (level)
) COMMENT='产品品类分类表';

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
    province                VARCHAR(20) DEFAULT '江苏省' COMMENT '省',
    city                    VARCHAR(20) DEFAULT '常州市' COMMENT '市',
    district                VARCHAR(20) NOT NULL COMMENT '区(所属区域)',
    address                 VARCHAR(500) COMMENT '详细地址',
    industry_id             INT COMMENT '行业分类ID(关联industry_categories表)',
    enterprise_type         VARCHAR(20) NOT NULL COMMENT '企业类型: 生产型/贸易型/工贸一体',
    staff_size_id           INT COMMENT '人员规模ID(关联system_options表,category=staff_size)',
    website                 VARCHAR(200) COMMENT '官网',
    domestic_revenue_id     INT COMMENT '国内营收ID(关联system_options表,category=revenue)',
    cross_border_revenue_id INT COMMENT '跨境营收ID(关联system_options表,category=revenue)',
    source_id               INT COMMENT '企业来源ID(关联system_options表,category=source)',
    
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
    desired_support         JSON COMMENT '希望获得的支持',
    cooperation_demands     JSON COMMENT '合作需求',
    
    -- 竞争力信息
    competition_position    VARCHAR(50) COMMENT '行业竞争地位',
    competition_description TEXT COMMENT '竞争地位描述',
    pain_points             TEXT COMMENT '跨境业务痛点',
    
    -- 三中心合作
    tricenter_demands       JSON COMMENT '与三中心合作主要需求',
    tricenter_concerns      TEXT COMMENT '不考虑合作主要顾虑',
    
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
    FOREIGN KEY (industry_id) REFERENCES industry_categories(id),
    FOREIGN KEY (source_id) REFERENCES system_options(id)
) COMMENT='企业主表';

-- ============================================================
-- 表6: enterprise_contacts (企业联系人)
-- ============================================================
CREATE TABLE enterprise_contacts (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    enterprise_id   INT NOT NULL COMMENT '企业ID',
    name            VARCHAR(50) NOT NULL COMMENT '联系人姓名',
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
    category_id         INT COMMENT '产品品类ID(关联product_categories表)',
    certification_ids   JSON COMMENT '认证标签ID数组',
    target_region_ids   JSON COMMENT '主要销售区域ID数组',
    target_country_ids  JSON COMMENT '主要销售国家代码数组(ISO 3166-1 alpha-2)',
    annual_sales        VARCHAR(50) COMMENT '年销售额',
    
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
    FOREIGN KEY (category_id) REFERENCES product_categories(id)
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
