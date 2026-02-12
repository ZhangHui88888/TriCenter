-- ============================================================
-- 常州跨境电商三中心 - 企业信息管理系统
-- 系统选项配置初始化数据 (system_options)
-- ============================================================

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
('enterprise_type', 'both', '工贸一体', 3);

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
('trade_mode', 'direct_export', '直接出口', 1),
('trade_mode', 'agent_export', '代理出口', 2),
('trade_mode', 'cross_border', '跨境电商', 3),
('trade_mode', 'oem', 'OEM/ODM', 4),
('trade_mode', 'mixed', '混合模式', 5);

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
('cross_border_platform', 'amazon', '亚马逊 (Amazon)', 1),
('cross_border_platform', 'alibaba', '阿里国际站 (Alibaba.com)', 2),
('cross_border_platform', 'tiktok', 'TikTok Shop', 3),
('cross_border_platform', 'aliexpress', '速卖通 (AliExpress)', 4),
('cross_border_platform', 'ebay', 'eBay', 5),
('cross_border_platform', 'shopify', '独立站 (Shopify)', 6),
('cross_border_platform', 'temu', 'Temu', 7),
('cross_border_platform', 'shein', 'SHEIN', 8),
('cross_border_platform', 'walmart', '沃尔玛 (Walmart)', 9),
('cross_border_platform', 'lazada', 'Lazada', 10),
('cross_border_platform', 'shopee', 'Shopee', 11),
('cross_border_platform', 'wish', 'Wish', 12),
('cross_border_platform', 'etsy', 'Etsy', 13),
('cross_border_platform', 'wayfair', 'Wayfair', 14),
('cross_border_platform', 'mercado', 'Mercado Libre', 15),
('cross_border_platform', 'rakuten', '乐天 (Rakuten)', 16),
('cross_border_platform', 'jd_global', '京东国际 (JD Global)', 17),
('cross_border_platform', 'other', '其他', 99);

-- ==================== 跨境物流模式 (cross_border_logistics) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
('cross_border_logistics', 'sea_shipping', '海运', 1),
('cross_border_logistics', 'air_shipping', '空运', 2),
('cross_border_logistics', 'express', '国际快递', 3),
('cross_border_logistics', 'fba', 'FBA (亚马逊物流)', 4),
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
('requirement_phase', 'phase_1', '第一阶段：筹备期 — 战略规划与资源准备', 1),
('requirement_phase', 'phase_2', '第二阶段：启动期 — 渠道搭建与商品上线', 2),
('requirement_phase', 'phase_3', '第三阶段：成长期 — 营销推广与规模增长', 3),
('requirement_phase', 'phase_4', '第四阶段：成熟期 — 品牌深耕与持续优化', 4);

-- ==================== 需求分类 (requirement_category) ====================
INSERT INTO system_options (category, value, label, sort_order) VALUES
-- 第一阶段分类
('requirement_category', '1.1', '品牌规划', 101),
('requirement_category', '1.2', '市场洞察', 102),
('requirement_category', '1.3', '搭建营销体系', 103),
('requirement_category', '1.4', '测品选品与前置认证评估', 104),
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
('requirement_category', '3.2', '订单、财务与收款', 302),
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
