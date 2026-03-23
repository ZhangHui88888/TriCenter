-- ============================================================
-- 常州跨境电商三中心 - 企业信息管理系统
-- 系统选项配置初始化数据 (system_options)
-- ============================================================
--
-- 部署顺序建议：先执行 tricenter_schema.sql（建表），再执行本文件（字典与种子数据）。
-- 老库未 DROP 重建、仅缺列时：与 tricenter_schema 中 enterprises 定义对齐，可执行文末「结构补丁」
-- （含 cross_border_revenue_wan、domestic_revenue_wan；列已存在则勿执行，避免 Duplicate column）。

-- 开发阶段：允许重复执行，先清空旧数据
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE system_options;
TRUNCATE TABLE industry_categories;
TRUNCATE TABLE product_categories;
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
('source', 'activity', '活动', 4);

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
-- 第四阶段分类
('requirement_category', '4.1', '履约升级与交付体验', 401),
('requirement_category', '4.2', '私域与会员运营', 402),
('requirement_category', '4.3', '产品与品牌迭代', 403),
('requirement_category', '4.4', '新品规划', 404),
('requirement_category', '4.5', '规模化与降本增效', 405),
('requirement_category', '4.6', 'ESG与可持续', 406);
-- ============================================================
-- 常州跨境电商三中心 - 企业信息管理系统
-- 行业分类初始化数据 (industry_categories)
-- ============================================================

-- ==================== 一级分类 ====================
INSERT INTO industry_categories (id, parent_id, name, level, path, sort_order) VALUES
(1, 0, '制造业', 1, '1', 1),
(2, 0, '贸易/零售', 1, '2', 2),
(3, 0, '服务业', 1, '3', 3),
(4, 0, '农林牧渔', 1, '4', 4);

-- ==================== 制造业（二级分类） ====================
INSERT INTO industry_categories (id, parent_id, name, level, path, sort_order) VALUES
-- 轻工制造
(101, 1, '园艺制品', 2, '1/101', 1),
(102, 1, '家居用品', 2, '1/102', 2),
(103, 1, '纺织服装', 2, '1/103', 3),
(104, 1, '箱包皮具', 2, '1/104', 4),
(105, 1, '鞋类制品', 2, '1/105', 5),
(106, 1, '玩具礼品', 2, '1/106', 6),
(107, 1, '文体用品', 2, '1/107', 7),
(108, 1, '美容个护', 2, '1/108', 8),
(109, 1, '食品加工', 2, '1/109', 9),
-- 重工制造
(110, 1, '电子产品', 2, '1/110', 10),
(111, 1, '电动工具', 2, '1/111', 11),
(112, 1, '机械设备', 2, '1/112', 12),
(113, 1, '汽车零部件', 2, '1/113', 13),
(114, 1, '五金建材', 2, '1/114', 14),
(115, 1, '照明灯具', 2, '1/115', 15),
(116, 1, '安防器材', 2, '1/116', 16),
(117, 1, '医疗器械', 2, '1/117', 17),
(118, 1, '新能源', 2, '1/118', 18),
(119, 1, '化工材料', 2, '1/119', 19),
(199, 1, '其他制造', 2, '1/199', 99);

-- ==================== 园艺制品（三级分类） ====================
INSERT INTO industry_categories (id, parent_id, name, level, path, sort_order) VALUES
(10101, 101, '园艺工具', 3, '1/101/10101', 1),
(10102, 101, '园艺装饰', 3, '1/101/10102', 2),
(10103, 101, '花盆花器', 3, '1/101/10103', 3),
(10104, 101, '灌溉设备', 3, '1/101/10104', 4),
(10105, 101, '草坪设备', 3, '1/101/10105', 5),
(10106, 101, '温室大棚', 3, '1/101/10106', 6);

-- ==================== 家居用品（三级分类） ====================
INSERT INTO industry_categories (id, parent_id, name, level, path, sort_order) VALUES
(10201, 102, '厨房用品', 3, '1/102/10201', 1),
(10202, 102, '卫浴用品', 3, '1/102/10202', 2),
(10203, 102, '家纺布艺', 3, '1/102/10203', 3),
(10204, 102, '收纳整理', 3, '1/102/10204', 4),
(10205, 102, '家居装饰', 3, '1/102/10205', 5),
(10206, 102, '清洁用品', 3, '1/102/10206', 6),
(10207, 102, '家具制造', 3, '1/102/10207', 7),
(10208, 102, '宠物用品', 3, '1/102/10208', 8);

-- ==================== 纺织服装（三级分类） ====================
INSERT INTO industry_categories (id, parent_id, name, level, path, sort_order) VALUES
(10301, 103, '男装', 3, '1/103/10301', 1),
(10302, 103, '女装', 3, '1/103/10302', 2),
(10303, 103, '童装', 3, '1/103/10303', 3),
(10304, 103, '运动服饰', 3, '1/103/10304', 4),
(10305, 103, '内衣家居服', 3, '1/103/10305', 5),
(10306, 103, '服装辅料', 3, '1/103/10306', 6),
(10307, 103, '面料纺织', 3, '1/103/10307', 7);

-- ==================== 箱包皮具（三级分类） ====================
INSERT INTO industry_categories (id, parent_id, name, level, path, sort_order) VALUES
(10401, 104, '旅行箱包', 3, '1/104/10401', 1),
(10402, 104, '女包', 3, '1/104/10402', 2),
(10403, 104, '男包', 3, '1/104/10403', 3),
(10404, 104, '钱包卡包', 3, '1/104/10404', 4),
(10405, 104, '功能箱包', 3, '1/104/10405', 5);

-- ==================== 鞋类制品（三级分类） ====================
INSERT INTO industry_categories (id, parent_id, name, level, path, sort_order) VALUES
(10501, 105, '运动鞋', 3, '1/105/10501', 1),
(10502, 105, '休闲鞋', 3, '1/105/10502', 2),
(10503, 105, '皮鞋', 3, '1/105/10503', 3),
(10504, 105, '凉鞋拖鞋', 3, '1/105/10504', 4),
(10505, 105, '童鞋', 3, '1/105/10505', 5),
(10506, 105, '功能鞋', 3, '1/105/10506', 6);

-- ==================== 玩具礼品（三级分类） ====================
INSERT INTO industry_categories (id, parent_id, name, level, path, sort_order) VALUES
(10601, 106, '益智玩具', 3, '1/106/10601', 1),
(10602, 106, '电动玩具', 3, '1/106/10602', 2),
(10603, 106, '毛绒玩具', 3, '1/106/10603', 3),
(10604, 106, '模型玩具', 3, '1/106/10604', 4),
(10605, 106, '户外玩具', 3, '1/106/10605', 5),
(10606, 106, '节日礼品', 3, '1/106/10606', 6),
(10607, 106, '工艺品', 3, '1/106/10607', 7);

-- ==================== 文体用品（三级分类） ====================
INSERT INTO industry_categories (id, parent_id, name, level, path, sort_order) VALUES
(10701, 107, '办公文具', 3, '1/107/10701', 1),
(10702, 107, '体育器材', 3, '1/107/10702', 2),
(10703, 107, '户外装备', 3, '1/107/10703', 3),
(10704, 107, '健身器材', 3, '1/107/10704', 4),
(10705, 107, '乐器', 3, '1/107/10705', 5);

-- ==================== 美容个护（三级分类） ====================
INSERT INTO industry_categories (id, parent_id, name, level, path, sort_order) VALUES
(10801, 108, '护肤品', 3, '1/108/10801', 1),
(10802, 108, '彩妆', 3, '1/108/10802', 2),
(10803, 108, '美发护发', 3, '1/108/10803', 3),
(10804, 108, '美甲美睫', 3, '1/108/10804', 4),
(10805, 108, '个人护理', 3, '1/108/10805', 5),
(10806, 108, '香水香氛', 3, '1/108/10806', 6);

-- ==================== 食品加工（三级分类） ====================
INSERT INTO industry_categories (id, parent_id, name, level, path, sort_order) VALUES
(10901, 109, '休闲食品', 3, '1/109/10901', 1),
(10902, 109, '饮料冲调', 3, '1/109/10902', 2),
(10903, 109, '粮油调味', 3, '1/109/10903', 3),
(10904, 109, '保健食品', 3, '1/109/10904', 4),
(10905, 109, '茶叶', 3, '1/109/10905', 5);

-- ==================== 电子产品（三级分类） ====================
INSERT INTO industry_categories (id, parent_id, name, level, path, sort_order) VALUES
(11001, 110, '消费电子', 3, '1/110/11001', 1),
(11002, 110, '智能硬件', 3, '1/110/11002', 2),
(11003, 110, '电脑配件', 3, '1/110/11003', 3),
(11004, 110, '手机配件', 3, '1/110/11004', 4),
(11005, 110, '数码影音', 3, '1/110/11005', 5),
(11006, 110, '电子元器件', 3, '1/110/11006', 6),
(11007, 110, '工业电子', 3, '1/110/11007', 7);

-- ==================== 电动工具（三级分类） ====================
INSERT INTO industry_categories (id, parent_id, name, level, path, sort_order) VALUES
(11101, 111, '电钻', 3, '1/111/11101', 1),
(11102, 111, '电锯', 3, '1/111/11102', 2),
(11103, 111, '角磨机', 3, '1/111/11103', 3),
(11104, 111, '电动扳手', 3, '1/111/11104', 4),
(11105, 111, '抛光机', 3, '1/111/11105', 5),
(11106, 111, '电动螺丝刀', 3, '1/111/11106', 6),
(11107, 111, '电刨', 3, '1/111/11107', 7);

-- ==================== 机械设备（三级分类） ====================
INSERT INTO industry_categories (id, parent_id, name, level, path, sort_order) VALUES
(11201, 112, '通用机械', 3, '1/112/11201', 1),
(11202, 112, '农业机械', 3, '1/112/11202', 2),
(11203, 112, '工程机械', 3, '1/112/11203', 3),
(11204, 112, '包装机械', 3, '1/112/11204', 4),
(11205, 112, '食品机械', 3, '1/112/11205', 5),
(11206, 112, '纺织机械', 3, '1/112/11206', 6),
(11207, 112, '印刷机械', 3, '1/112/11207', 7);

-- ==================== 汽车零部件（三级分类） ====================
INSERT INTO industry_categories (id, parent_id, name, level, path, sort_order) VALUES
(11301, 113, '汽车电子', 3, '1/113/11301', 1),
(11302, 113, '汽车内饰', 3, '1/113/11302', 2),
(11303, 113, '汽车外饰', 3, '1/113/11303', 3),
(11304, 113, '发动机配件', 3, '1/113/11304', 4),
(11305, 113, '底盘配件', 3, '1/113/11305', 5),
(11306, 113, '汽车养护', 3, '1/113/11306', 6),
(11307, 113, '摩托车配件', 3, '1/113/11307', 7);

-- ==================== 五金建材（三级分类） ====================
INSERT INTO industry_categories (id, parent_id, name, level, path, sort_order) VALUES
(11401, 114, '门窗五金', 3, '1/114/11401', 1),
(11402, 114, '水暖管件', 3, '1/114/11402', 2),
(11403, 114, '紧固件', 3, '1/114/11403', 3),
(11404, 114, '手动工具', 3, '1/114/11404', 4),
(11405, 114, '建筑材料', 3, '1/114/11405', 5),
(11406, 114, '装饰材料', 3, '1/114/11406', 6);

-- ==================== 照明灯具（三级分类） ====================
INSERT INTO industry_categories (id, parent_id, name, level, path, sort_order) VALUES
(11501, 115, '室内照明', 3, '1/115/11501', 1),
(11502, 115, '户外照明', 3, '1/115/11502', 2),
(11503, 115, '商业照明', 3, '1/115/11503', 3),
(11504, 115, 'LED光源', 3, '1/115/11504', 4),
(11505, 115, '灯具配件', 3, '1/115/11505', 5);

-- ==================== 安防器材（三级分类） ====================
INSERT INTO industry_categories (id, parent_id, name, level, path, sort_order) VALUES
(11601, 116, '监控设备', 3, '1/116/11601', 1),
(11602, 116, '门禁系统', 3, '1/116/11602', 2),
(11603, 116, '报警器材', 3, '1/116/11603', 3),
(11604, 116, '消防器材', 3, '1/116/11604', 4),
(11605, 116, '防护用品', 3, '1/116/11605', 5);

-- ==================== 医疗器械（三级分类） ====================
INSERT INTO industry_categories (id, parent_id, name, level, path, sort_order) VALUES
(11701, 117, '医疗设备', 3, '1/117/11701', 1),
(11702, 117, '医疗耗材', 3, '1/117/11702', 2),
(11703, 117, '康复器械', 3, '1/117/11703', 3),
(11704, 117, '家用医疗', 3, '1/117/11704', 4),
(11705, 117, '实验室设备', 3, '1/117/11705', 5);

-- ==================== 新能源（三级分类） ====================
INSERT INTO industry_categories (id, parent_id, name, level, path, sort_order) VALUES
(11801, 118, '太阳能', 3, '1/118/11801', 1),
(11802, 118, '储能电池', 3, '1/118/11802', 2),
(11803, 118, '电动车', 3, '1/118/11803', 3),
(11804, 118, '充电设备', 3, '1/118/11804', 4);

-- ==================== 化工材料（三级分类） ====================
INSERT INTO industry_categories (id, parent_id, name, level, path, sort_order) VALUES
(11901, 119, '塑料制品', 3, '1/119/11901', 1),
(11902, 119, '橡胶制品', 3, '1/119/11902', 2),
(11903, 119, '涂料油漆', 3, '1/119/11903', 3),
(11904, 119, '胶黏剂', 3, '1/119/11904', 4),
(11905, 119, '化工原料', 3, '1/119/11905', 5);

-- ==================== 贸易/零售（二级分类） ====================
INSERT INTO industry_categories (id, parent_id, name, level, path, sort_order) VALUES
(201, 2, '综合贸易', 2, '2/201', 1),
(202, 2, '进出口代理', 2, '2/202', 2),
(203, 2, '批发零售', 2, '2/203', 3),
(204, 2, '电商运营', 2, '2/204', 4),
(205, 2, '供应链管理', 2, '2/205', 5);

-- ==================== 服务业（二级分类） ====================
INSERT INTO industry_categories (id, parent_id, name, level, path, sort_order) VALUES
(301, 3, '物流仓储', 2, '3/301', 1),
(302, 3, '金融服务', 2, '3/302', 2),
(303, 3, '信息技术', 2, '3/303', 3),
(304, 3, '咨询服务', 2, '3/304', 4),
(305, 3, '营销推广', 2, '3/305', 5),
(306, 3, '人力资源', 2, '3/306', 6),
(307, 3, '检测认证', 2, '3/307', 7);

-- ==================== 农林牧渔（二级分类） ====================
INSERT INTO industry_categories (id, parent_id, name, level, path, sort_order) VALUES
(401, 4, '种植业', 2, '4/401', 1),
(402, 4, '畜牧业', 2, '4/402', 2),
(403, 4, '渔业', 2, '4/403', 3),
(404, 4, '林业', 2, '4/404', 4),
(405, 4, '农产品加工', 2, '4/405', 5);
-- ============================================================
-- 常州跨境电商三中心 - 企业信息管理系统
-- 产品品类初始化数据 (product_categories)
-- ============================================================

-- ==================== 一级品类 ====================
INSERT INTO product_categories (id, parent_id, name, level, path, sort_order) VALUES
(1, 0, '园艺工具', 1, '1', 1),
(2, 0, '电动工具', 1, '2', 2),
(3, 0, '家居用品', 1, '3', 3),
(4, 0, '户外运动', 1, '4', 4),
(5, 0, '汽车配件', 1, '5', 5),
(6, 0, '电子产品', 1, '6', 6),
(7, 0, '纺织服装', 1, '7', 7),
(8, 0, '建材五金', 1, '8', 8),
(9, 0, '机械设备', 1, '9', 9),
(10, 0, '美容个护', 1, '10', 10),
(11, 0, '玩具礼品', 1, '11', 11),
(12, 0, '箱包皮具', 1, '12', 12),
(13, 0, '鞋类', 1, '13', 13),
(14, 0, '食品饮料', 1, '14', 14),
(15, 0, '医疗健康', 1, '15', 15),
(16, 0, '宠物用品', 1, '16', 16),
(17, 0, '照明灯具', 1, '17', 17),
(18, 0, '安防器材', 1, '18', 18),
(19, 0, '新能源', 1, '19', 19),
(99, 0, '其他', 1, '99', 99);

-- ==================== 园艺工具（二级品类） ====================
INSERT INTO product_categories (id, parent_id, name, level, path, sort_order) VALUES
(101, 1, '园艺手工具', 2, '1/101', 1),
(102, 1, '园艺电动工具', 2, '1/102', 2),
(103, 1, '园艺装饰品', 2, '1/103', 3),
(104, 1, '花盆花器', 2, '1/104', 4),
(105, 1, '灌溉设备', 2, '1/105', 5),
(106, 1, '草坪设备', 2, '1/106', 6);

-- 园艺手工具（三级品类）
INSERT INTO product_categories (id, parent_id, name, level, path, sort_order) VALUES
(10101, 101, '铲子', 3, '1/101/10101', 1),
(10102, 101, '剪刀', 3, '1/101/10102', 2),
(10103, 101, '耙子', 3, '1/101/10103', 3),
(10104, 101, '锄头', 3, '1/101/10104', 4),
(10105, 101, '园艺刀', 3, '1/101/10105', 5);

-- ==================== 电动工具（二级品类） ====================
INSERT INTO product_categories (id, parent_id, name, level, path, sort_order) VALUES
(201, 2, '电钻', 2, '2/201', 1),
(202, 2, '电锯', 2, '2/202', 2),
(203, 2, '角磨机', 2, '2/203', 3),
(204, 2, '电动扳手', 2, '2/204', 4),
(205, 2, '抛光机', 2, '2/205', 5),
(206, 2, '电动螺丝刀', 2, '2/206', 6),
(207, 2, '电刨', 2, '2/207', 7),
(208, 2, '热风枪', 2, '2/208', 8);

-- ==================== 家居用品（二级品类） ====================
INSERT INTO product_categories (id, parent_id, name, level, path, sort_order) VALUES
(301, 3, '厨房用品', 2, '3/301', 1),
(302, 3, '卫浴用品', 2, '3/302', 2),
(303, 3, '收纳整理', 2, '3/303', 3),
(304, 3, '家居装饰', 2, '3/304', 4),
(305, 3, '清洁用品', 2, '3/305', 5),
(306, 3, '家纺布艺', 2, '3/306', 6),
(307, 3, '家具', 2, '3/307', 7);

-- 厨房用品（三级品类）
INSERT INTO product_categories (id, parent_id, name, level, path, sort_order) VALUES
(30101, 301, '锅具', 3, '3/301/30101', 1),
(30102, 301, '刀具', 3, '3/301/30102', 2),
(30103, 301, '餐具', 3, '3/301/30103', 3),
(30104, 301, '厨房小家电', 3, '3/301/30104', 4),
(30105, 301, '烘焙工具', 3, '3/301/30105', 5);

-- ==================== 户外运动（二级品类） ====================
INSERT INTO product_categories (id, parent_id, name, level, path, sort_order) VALUES
(401, 4, '露营装备', 2, '4/401', 1),
(402, 4, '运动器材', 2, '4/402', 2),
(403, 4, '户外服装', 2, '4/403', 3),
(404, 4, '登山装备', 2, '4/404', 4),
(405, 4, '骑行装备', 2, '4/405', 5),
(406, 4, '水上运动', 2, '4/406', 6),
(407, 4, '健身器材', 2, '4/407', 7);

-- ==================== 汽车配件（二级品类） ====================
INSERT INTO product_categories (id, parent_id, name, level, path, sort_order) VALUES
(501, 5, '汽车电子', 2, '5/501', 1),
(502, 5, '汽车内饰', 2, '5/502', 2),
(503, 5, '汽车外饰', 2, '5/503', 3),
(504, 5, '维修保养', 2, '5/504', 4),
(505, 5, '汽车改装', 2, '5/505', 5),
(506, 5, '摩托车配件', 2, '5/506', 6);

-- ==================== 电子产品（二级品类） ====================
INSERT INTO product_categories (id, parent_id, name, level, path, sort_order) VALUES
(601, 6, '消费电子', 2, '6/601', 1),
(602, 6, '智能硬件', 2, '6/602', 2),
(603, 6, '电脑配件', 2, '6/603', 3),
(604, 6, '手机配件', 2, '6/604', 4),
(605, 6, '数码影音', 2, '6/605', 5),
(606, 6, '游戏设备', 2, '6/606', 6);

-- 消费电子（三级品类）
INSERT INTO product_categories (id, parent_id, name, level, path, sort_order) VALUES
(60101, 601, '蓝牙耳机', 3, '6/601/60101', 1),
(60102, 601, '智能手表', 3, '6/601/60102', 2),
(60103, 601, '充电宝', 3, '6/601/60103', 3),
(60104, 601, '音箱', 3, '6/601/60104', 4),
(60105, 601, '摄像头', 3, '6/601/60105', 5);

-- ==================== 纺织服装（二级品类） ====================
INSERT INTO product_categories (id, parent_id, name, level, path, sort_order) VALUES
(701, 7, '男装', 2, '7/701', 1),
(702, 7, '女装', 2, '7/702', 2),
(703, 7, '童装', 2, '7/703', 3),
(704, 7, '运动服饰', 2, '7/704', 4),
(705, 7, '内衣家居服', 2, '7/705', 5),
(706, 7, '配饰', 2, '7/706', 6);

-- ==================== 建材五金（二级品类） ====================
INSERT INTO product_categories (id, parent_id, name, level, path, sort_order) VALUES
(801, 8, '门窗五金', 2, '8/801', 1),
(802, 8, '水暖管件', 2, '8/802', 2),
(803, 8, '紧固件', 2, '8/803', 3),
(804, 8, '手动工具', 2, '8/804', 4),
(805, 8, '建筑材料', 2, '8/805', 5),
(806, 8, '装饰材料', 2, '8/806', 6);

-- ==================== 机械设备（二级品类） ====================
INSERT INTO product_categories (id, parent_id, name, level, path, sort_order) VALUES
(901, 9, '通用机械', 2, '9/901', 1),
(902, 9, '农业机械', 2, '9/902', 2),
(903, 9, '工程机械', 2, '9/903', 3),
(904, 9, '包装机械', 2, '9/904', 4),
(905, 9, '食品机械', 2, '9/905', 5);

-- ==================== 美容个护（二级品类） ====================
INSERT INTO product_categories (id, parent_id, name, level, path, sort_order) VALUES
(1001, 10, '护肤品', 2, '10/1001', 1),
(1002, 10, '彩妆', 2, '10/1002', 2),
(1003, 10, '美发护发', 2, '10/1003', 3),
(1004, 10, '美甲美睫', 2, '10/1004', 4),
(1005, 10, '个人护理', 2, '10/1005', 5),
(1006, 10, '香水香氛', 2, '10/1006', 6);

-- ==================== 玩具礼品（二级品类） ====================
INSERT INTO product_categories (id, parent_id, name, level, path, sort_order) VALUES
(1101, 11, '益智玩具', 2, '11/1101', 1),
(1102, 11, '电动玩具', 2, '11/1102', 2),
(1103, 11, '毛绒玩具', 2, '11/1103', 3),
(1104, 11, '模型玩具', 2, '11/1104', 4),
(1105, 11, '户外玩具', 2, '11/1105', 5),
(1106, 11, '节日礼品', 2, '11/1106', 6),
(1107, 11, '工艺品', 2, '11/1107', 7);

-- ==================== 箱包皮具（二级品类） ====================
INSERT INTO product_categories (id, parent_id, name, level, path, sort_order) VALUES
(1201, 12, '旅行箱包', 2, '12/1201', 1),
(1202, 12, '女包', 2, '12/1202', 2),
(1203, 12, '男包', 2, '12/1203', 3),
(1204, 12, '钱包卡包', 2, '12/1204', 4),
(1205, 12, '功能箱包', 2, '12/1205', 5);

-- ==================== 鞋类（二级品类） ====================
INSERT INTO product_categories (id, parent_id, name, level, path, sort_order) VALUES
(1301, 13, '运动鞋', 2, '13/1301', 1),
(1302, 13, '休闲鞋', 2, '13/1302', 2),
(1303, 13, '皮鞋', 2, '13/1303', 3),
(1304, 13, '凉鞋拖鞋', 2, '13/1304', 4),
(1305, 13, '童鞋', 2, '13/1305', 5),
(1306, 13, '功能鞋', 2, '13/1306', 6);

-- ==================== 食品饮料（二级品类） ====================
INSERT INTO product_categories (id, parent_id, name, level, path, sort_order) VALUES
(1401, 14, '休闲食品', 2, '14/1401', 1),
(1402, 14, '饮料冲调', 2, '14/1402', 2),
(1403, 14, '粮油调味', 2, '14/1403', 3),
(1404, 14, '保健食品', 2, '14/1404', 4),
(1405, 14, '茶叶', 2, '14/1405', 5);

-- ==================== 医疗健康（二级品类） ====================
INSERT INTO product_categories (id, parent_id, name, level, path, sort_order) VALUES
(1501, 15, '医疗设备', 2, '15/1501', 1),
(1502, 15, '医疗耗材', 2, '15/1502', 2),
(1503, 15, '康复器械', 2, '15/1503', 3),
(1504, 15, '家用医疗', 2, '15/1504', 4);

-- ==================== 宠物用品（二级品类） ====================
INSERT INTO product_categories (id, parent_id, name, level, path, sort_order) VALUES
(1601, 16, '宠物食品', 2, '16/1601', 1),
(1602, 16, '宠物玩具', 2, '16/1602', 2),
(1603, 16, '宠物服饰', 2, '16/1603', 3),
(1604, 16, '宠物清洁', 2, '16/1604', 4),
(1605, 16, '宠物窝笼', 2, '16/1605', 5);

-- ==================== 照明灯具（二级品类） ====================
INSERT INTO product_categories (id, parent_id, name, level, path, sort_order) VALUES
(1701, 17, '室内照明', 2, '17/1701', 1),
(1702, 17, '户外照明', 2, '17/1702', 2),
(1703, 17, '商业照明', 2, '17/1703', 3),
(1704, 17, 'LED光源', 2, '17/1704', 4),
(1705, 17, '灯具配件', 2, '17/1705', 5);

-- ==================== 安防器材（二级品类） ====================
INSERT INTO product_categories (id, parent_id, name, level, path, sort_order) VALUES
(1801, 18, '监控设备', 2, '18/1801', 1),
(1802, 18, '门禁系统', 2, '18/1802', 2),
(1803, 18, '报警器材', 2, '18/1803', 3),
(1804, 18, '消防器材', 2, '18/1804', 4),
(1805, 18, '防护用品', 2, '18/1805', 5);

-- ==================== 新能源（二级品类） ====================
INSERT INTO product_categories (id, parent_id, name, level, path, sort_order) VALUES
(1901, 19, '太阳能产品', 2, '19/1901', 1),
(1902, 19, '储能电池', 2, '19/1902', 2),
(1903, 19, '电动车配件', 2, '19/1903', 3),
(1904, 19, '充电设备', 2, '19/1904', 4);
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
('1.8.2', '人才招聘与培养', '专业技能、语言能力',
'招聘具备平台运营、海外营销、跨境物流等专业技能的人才，重视外语能力与跨文化沟通能力，建立培训体系，以及人才考证的需求。',
'phase_1', '1.8', 2),
('1.8.3', '自建团队/代运营选择', '团队模式选择',
'根据企业资源与战略重要性，选择自建团队（掌控力强但成本高）或代运营（快速启动但依赖外部），或采用混合模式。',
'phase_1', '1.8', 3),
('1.8.4', '跨时区与远程协作', '会议安排、异步协作、文化融合',
'若有海外团队或合作伙伴，制定跨时区会议规范，使用异步协作工具（如Loom、Notion），尊重文化差异建立信任。',
'phase_1', '1.8', 4),
('1.8.5', '办公场地与工位', '自有办公室、共享工位、产业园入驻',
'根据团队规模与成本考量，选择自有办公室、联合办公空间或入驻跨境电商产业园/孵化器，享受政策扶持、资源对接与行业氛围。',
'phase_1', '1.8', 5);

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
-- 常州跨境电商三中心 - 企业信息管理系统
-- 企业测试数据（含联系人、产品、跟进记录、阶段变更日志）
-- ============================================================

-- ==================== 企业主表 ====================
INSERT INTO enterprises (id, name, credit_code, province, city, district, address, industry_id, enterprise_type, staff_size_id, website, source_id, stage, has_own_brand, brand_names, has_cross_border, has_import_export_license, created_at) VALUES
(1, '常州绿源园艺工具有限公司', '91320400MA1XXXXX01', '江苏省', '常州市', '武进区', '武进区湖塘镇工业园88号', 101, '生产型', 
 (SELECT id FROM system_options WHERE category='staff_size' AND value='50-200' LIMIT 1),
 'https://www.greensource-tools.com',
 (SELECT id FROM system_options WHERE category='source' AND value='survey' LIMIT 1),
 'SIGNED', 1, '绿源GreenSource', 1, 1, '2025-06-15 10:00:00'),

(2, '常州博远电子科技有限公司', '91320400MA1XXXXX02', '江苏省', '常州市', '新北区', '新北区薛家镇科技路66号', 110, '生产型',
 (SELECT id FROM system_options WHERE category='staff_size' AND value='200-500' LIMIT 1),
 'https://www.boyuan-tech.com',
 (SELECT id FROM system_options WHERE category='source' AND value='referral' LIMIT 1),
 'SETTLED', 1, 'BoyuanTech', 1, 1, '2025-05-20 09:00:00'),

(3, '常州锦程纺织有限公司', '91320400MA1XXXXX03', '江苏省', '常州市', '天宁区', '天宁区青龙街道纺织路12号', 103, '工贸一体',
 (SELECT id FROM system_options WHERE category='staff_size' AND value='50-200' LIMIT 1),
 NULL,
 (SELECT id FROM system_options WHERE category='source' AND value='activity' LIMIT 1),
 'HAS_DEMAND', 0, NULL, 0, 1, '2025-07-10 14:00:00'),

(4, '常州鼎盛机械制造有限公司', '91320400MA1XXXXX04', '江苏省', '常州市', '钟楼区', '钟楼区邹区镇机械产业园5号', 112, '生产型',
 (SELECT id FROM system_options WHERE category='staff_size' AND value='500-1000' LIMIT 1),
 'https://www.dingsheng-machinery.com',
 (SELECT id FROM system_options WHERE category='source' AND value='survey' LIMIT 1),
 'INCUBATING', 1, '鼎盛DS', 1, 1, '2025-04-01 08:30:00'),

(5, '常州优品家居用品有限公司', '91320400MA1XXXXX05', '江苏省', '常州市', '经开区', '经开区横山桥镇创业路99号', 102, '生产型',
 (SELECT id FROM system_options WHERE category='staff_size' AND value='10-50' LIMIT 1),
 NULL,
 (SELECT id FROM system_options WHERE category='source' AND value='inquiry' LIMIT 1),
 'POTENTIAL', 0, NULL, 0, 0, '2025-08-20 11:00:00'),

(6, '金坛华通进出口贸易有限公司', '91320400MA1XXXXX06', '江苏省', '常州市', '金坛区', '金坛区经济开发区商贸城A栋', 201, '贸易型',
 (SELECT id FROM system_options WHERE category='staff_size' AND value='10-50' LIMIT 1),
 NULL,
 (SELECT id FROM system_options WHERE category='source' AND value='referral' LIMIT 1),
 'NO_DEMAND', 0, NULL, 1, 1, '2025-09-05 15:00:00'),

(7, '溧阳天力新能源科技有限公司', '91320400MA1XXXXX07', '江苏省', '常州市', '溧阳市', '溧阳市昆仑街道新能源产业园18号', 118, '生产型',
 (SELECT id FROM system_options WHERE category='staff_size' AND value='200-500' LIMIT 1),
 'https://www.tianli-energy.com',
 (SELECT id FROM system_options WHERE category='source' AND value='survey' LIMIT 1),
 'SIGNED', 1, 'TianliPower', 1, 1, '2025-03-15 09:30:00'),

(8, '常州美尚化妆品有限公司', '91320400MA1XXXXX08', '江苏省', '常州市', '武进区', '武进区西太湖科技产业园创新路28号', 108, '工贸一体',
 (SELECT id FROM system_options WHERE category='staff_size' AND value='50-200' LIMIT 1),
 'https://www.meishang-beauty.com',
 (SELECT id FROM system_options WHERE category='source' AND value='activity' LIMIT 1),
 'HAS_DEMAND', 1, 'MeiShang美尚', 0, 0, '2025-10-01 10:00:00'),

(9, '常州安盾安防设备有限公司', '91320400MA1XXXXX09', '江苏省', '常州市', '新北区', '新北区春江镇安防科技园7号', 116, '生产型',
 (SELECT id FROM system_options WHERE category='staff_size' AND value='50-200' LIMIT 1),
 'https://www.andun-security.com',
 (SELECT id FROM system_options WHERE category='source' AND value='inquiry' LIMIT 1),
 'NO_INTENTION', 0, NULL, 0, 1, '2025-11-10 16:00:00'),

(10, '常州乐童玩具有限公司', '91320400MA1XXXXX10', '江苏省', '常州市', '天宁区', '天宁区郑陆镇玩具产业基地3号', 106, '生产型',
 (SELECT id FROM system_options WHERE category='staff_size' AND value='10-50' LIMIT 1),
 NULL,
 (SELECT id FROM system_options WHERE category='source' AND value='survey' LIMIT 1),
 'POTENTIAL', 1, 'FunKids乐童', 0, 0, '2025-12-01 09:00:00');


-- ==================== 企业联系人 ====================
INSERT INTO enterprise_contacts (enterprise_id, name, phone, position, is_primary, email, wechat) VALUES
-- 绿源园艺
(1, '张建国', '13912345001', '总经理', 1, 'zjg@greensource.com', 'zjg_greensource'),
(1, '李芳', '13912345002', '外贸经理', 0, 'lf@greensource.com', 'lifang_gs'),
-- 博远电子
(2, '王志强', '13912345003', '董事长', 1, 'wzq@boyuan-tech.com', 'wzq_boyuan'),
(2, '陈晓燕', '13912345004', '跨境电商总监', 0, 'cxy@boyuan-tech.com', 'chenxy_by'),
-- 锦程纺织
(3, '刘伟', '13912345005', '总经理', 1, 'lw@jincheng-textile.com', 'liuwei_jc'),
-- 鼎盛机械
(4, '赵明', '13912345006', '副总经理', 1, 'zm@dingsheng.com', 'zhaoming_ds'),
(4, '孙丽华', '13912345007', '国际业务部经理', 0, 'slh@dingsheng.com', 'sunlh_ds'),
-- 优品家居
(5, '周小红', '13912345008', '负责人', 1, 'zxh@youpin-home.com', 'zhouxh_yp'),
-- 华通贸易
(6, '吴强', '13912345009', '总经理', 1, 'wq@huatong-trade.com', 'wuqiang_ht'),
-- 天力新能源
(7, '郑海涛', '13912345010', '总经理', 1, 'zht@tianli-energy.com', 'zhenght_tl'),
(7, '马晓丽', '13912345011', '海外市场总监', 0, 'mxl@tianli-energy.com', 'maxl_tl'),
-- 美尚化妆品
(8, '林雅琴', '13912345012', '创始人', 1, 'lyq@meishang.com', 'linyq_ms'),
-- 安盾安防
(9, '黄建军', '13912345013', '总经理', 1, 'hjj@andun-security.com', 'huangjj_ad'),
-- 乐童玩具
(10, '杨秀英', '13912345014', '总经理', 1, 'yxy@letong-toys.com', 'yangxy_lt');


-- ==================== 企业产品 ====================
INSERT INTO enterprise_products (enterprise_id, name, category_id, annual_sales) VALUES
-- 绿源园艺
(1, '不锈钢园艺铲套装', 101, '500-1000万'),
(1, '电动修枝剪', 102, '200-500万'),
(1, '太阳能花园灯', 103, '200-500万'),
-- 博远电子
(2, '智能蓝牙耳机', 601, '1000-5000万'),
(2, '无线充电器', 604, '500-1000万'),
(2, '智能手环', 602, '500-1000万'),
-- 锦程纺织
(3, '运动速干T恤', 704, '200-500万'),
(3, '瑜伽裤', 702, '200-500万'),
-- 鼎盛机械
(4, '数控车床', 901, '5000万以上'),
(4, '自动包装机', 904, '1000-5000万'),
-- 优品家居
(5, '竹制厨房收纳架', 303, '200万以下'),
(5, '硅胶厨具套装', 301, '200万以下'),
-- 华通贸易（贸易型，代理多品类）
(6, '五金工具套装', 804, '200-500万'),
(6, 'LED灯泡', 1704, '200-500万'),
-- 天力新能源
(7, '便携式储能电源', 1902, '1000-5000万'),
(7, '太阳能板', 1901, '500-1000万'),
(7, '电动车充电桩', 1904, '500-1000万'),
-- 美尚化妆品
(8, '玻尿酸精华液', 1001, '200-500万'),
(8, '气垫BB霜', 1002, '200万以下'),
-- 安盾安防
(9, '智能监控摄像头', 1801, '500-1000万'),
(9, '无线门铃', 1802, '200-500万'),
-- 乐童玩具
(10, '磁力积木套装', 1101, '200万以下'),
(10, '遥控赛车', 1102, '200万以下');


-- ==================== 跟进记录 ====================
INSERT INTO follow_up_records (enterprise_id, follow_type, follow_date, content, status, next_plan, stage_from, stage_to, follower_id, created_at) VALUES
-- 绿源园艺（已签约，有完整跟进链路）
(1, '拜访', '2025-06-20', '首次拜访企业，了解基本情况。企业主营园艺工具出口，年产值约3000万，主要通过传统B2B出口北美和欧洲。', '初步接触', '安排二次拜访，深入了解跨境需求', 'POTENTIAL', 'POTENTIAL', 1, '2025-06-20 14:00:00'),
(1, '电话', '2025-07-05', '电话沟通跨境电商转型意向，企业表示有兴趣尝试亚马逊平台，但缺乏运营经验。', '需求明确', '准备跨境电商方案', 'POTENTIAL', 'HAS_DEMAND', 1, '2025-07-05 10:30:00'),
(1, '会议', '2025-07-20', '在三中心会议室进行方案讨论，介绍亚马逊开店流程和运营支持服务，企业决定签约合作。', '签约合作', '启动开店流程', 'HAS_DEMAND', 'SIGNED', 1, '2025-07-20 15:00:00'),

-- 博远电子（已入驻，跟进较多）
(2, '拜访', '2025-05-25', '拜访企业，博远电子已有亚马逊店铺运营经验，年跨境销售额约2000万，希望入驻产业园获取更多资源支持。', '深度合作', '安排产业园参观', 'POTENTIAL', 'HAS_DEMAND', 1, '2025-05-25 09:30:00'),
(2, '拜访', '2025-06-10', '带企业参观产业园，介绍入驻政策和配套服务，企业对办公环境和政策支持非常满意。', '入驻意向强', '准备入驻协议', 'HAS_DEMAND', 'SIGNED', 1, '2025-06-10 14:00:00'),
(2, '会议', '2025-06-25', '签署入驻协议，企业将跨境电商团队整体搬入产业园。', '已入驻', '跟进入驻后运营情况', 'SIGNED', 'SETTLED', 1, '2025-06-25 10:00:00'),

-- 鼎盛机械（重点孵化）
(4, '拜访', '2025-04-10', '首次拜访，鼎盛机械是常州知名机械制造企业，年产值过亿，但跨境电商业务刚起步。', '初步接触', '评估孵化可行性', 'POTENTIAL', 'HAS_DEMAND', 2, '2025-04-10 10:00:00'),
(4, '视频', '2025-04-25', '视频会议讨论跨境电商孵化方案，企业愿意投入专项资金和团队。', '孵化评估', '制定孵化计划', 'HAS_DEMAND', 'SIGNED', 2, '2025-04-25 14:30:00'),
(4, '会议', '2025-05-15', '签署孵化协议，启动重点孵化项目，三中心提供全方位运营指导。', '重点孵化', '每周跟进孵化进度', 'SIGNED', 'INCUBATING', 2, '2025-05-15 09:00:00'),
(4, '电话', '2025-06-01', '月度回顾，亚马逊店铺已上线首批产品，广告投放效果初步显现。', '孵化进行中', '优化广告策略', 'INCUBATING', 'INCUBATING', 2, '2025-06-01 11:00:00'),

-- 锦程纺织（有需求）
(3, '电话', '2025-07-15', '电话了解企业情况，锦程纺织主营运动服饰，有意拓展跨境电商渠道。', '初步接触', '安排拜访', 'POTENTIAL', 'HAS_DEMAND', 1, '2025-07-15 10:00:00'),

-- 天力新能源（已签约）
(7, '拜访', '2025-03-20', '拜访天力新能源，企业在储能领域有技术优势，产品已通过CE和UL认证。', '初步接触', '评估跨境潜力', 'POTENTIAL', 'HAS_DEMAND', 2, '2025-03-20 09:00:00'),
(7, '会议', '2025-04-15', '方案讨论会，企业决定与三中心合作开拓欧美储能市场。', '签约合作', '启动市场调研', 'HAS_DEMAND', 'SIGNED', 2, '2025-04-15 14:00:00'),

-- 美尚化妆品（有需求）
(8, '拜访', '2025-10-10', '拜访美尚化妆品，企业有自主品牌，国内电商做得不错，想尝试出海东南亚市场。', '初步接触', '了解东南亚市场准入要求', 'POTENTIAL', 'HAS_DEMAND', 1, '2025-10-10 15:00:00'),

-- 安盾安防（无意向）
(9, '电话', '2025-11-15', '电话沟通，企业表示目前国内市场订单充足，暂不考虑跨境业务。', '无意向', '半年后再跟进', 'POTENTIAL', 'NO_INTENTION', 2, '2025-11-15 10:00:00');


-- ==================== 阶段变更日志 ====================
INSERT INTO stage_change_logs (enterprise_id, stage_from, stage_to, reason, operator_id, created_at) VALUES
-- 绿源园艺
(1, 'POTENTIAL', 'HAS_DEMAND', '企业明确表达跨境电商转型意向', 1, '2025-07-05 10:30:00'),
(1, 'HAS_DEMAND', 'SIGNED', '签署跨境电商服务合作协议', 1, '2025-07-20 15:00:00'),
-- 博远电子
(2, 'POTENTIAL', 'HAS_DEMAND', '企业有明确入驻需求', 1, '2025-05-25 09:30:00'),
(2, 'HAS_DEMAND', 'SIGNED', '签署产业园入驻协议', 1, '2025-06-10 14:00:00'),
(2, 'SIGNED', 'SETTLED', '企业团队正式入驻产业园', 1, '2025-06-25 10:00:00'),
-- 锦程纺织
(3, 'POTENTIAL', 'HAS_DEMAND', '企业有跨境电商拓展需求', 1, '2025-07-15 10:00:00'),
-- 鼎盛机械
(4, 'POTENTIAL', 'HAS_DEMAND', '企业有跨境电商孵化需求', 2, '2025-04-10 10:00:00'),
(4, 'HAS_DEMAND', 'SIGNED', '签署孵化合作协议', 2, '2025-04-25 14:30:00'),
(4, 'SIGNED', 'INCUBATING', '启动重点孵化项目', 2, '2025-05-15 09:00:00'),
-- 华通贸易
(6, 'POTENTIAL', 'NO_DEMAND', '企业暂无明确跨境需求', 1, '2025-09-10 10:00:00'),
-- 天力新能源
(7, 'POTENTIAL', 'HAS_DEMAND', '企业有跨境市场拓展需求', 2, '2025-03-20 09:00:00'),
(7, 'HAS_DEMAND', 'SIGNED', '签署跨境电商合作协议', 2, '2025-04-15 14:00:00'),
-- 美尚化妆品
(8, 'POTENTIAL', 'HAS_DEMAND', '企业有出海东南亚市场需求', 1, '2025-10-10 15:00:00'),
-- 安盾安防
(9, 'POTENTIAL', 'NO_INTENTION', '企业暂不考虑跨境业务', 2, '2025-11-15 10:00:00');

-- ============================================================
-- 企业测试数据初始化完成
-- 共10家企业，覆盖7个区域、多个行业、所有漏斗阶段
-- ============================================================

-- ============================================================
-- 结构补丁：enterprises.cross_border_revenue_wan（与 tricenter_schema.enterprises 一致）
-- 适用：已有库、表为旧结构且无本列时。全新库已执行最新 schema 则不要取消注释执行。
-- ============================================================
-- ALTER TABLE enterprises
--     ADD COLUMN cross_border_revenue_wan DECIMAL(18,4) NULL COMMENT '跨境营收(万元)，精确数值' AFTER cross_border_revenue_id;

-- ============================================================
-- 结构补丁：enterprises.domestic_revenue_wan（与 tricenter_schema.enterprises 一致）
-- 适用：已有库、表为旧结构且无本列时。全新库已执行最新 schema 则不要取消注释执行。
-- ============================================================
-- ALTER TABLE enterprises
--     ADD COLUMN domestic_revenue_wan DECIMAL(18,4) NULL COMMENT '国内营收(万元)，精确数值' AFTER domestic_revenue_id;
