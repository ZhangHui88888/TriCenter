// 数据字典Mock数据 - 基于system_options表结构
export interface DictionaryItem {
  id: number;
  category: string;
  value: string;
  label: string;
  color?: string;
  sort_order: number;
  is_enabled: boolean;
  created_at: string;
}

export interface DictionaryCategory {
  key: string;
  name: string;
  description: string;
}

// 数据字典分类
export const dictionaryCategories: DictionaryCategory[] = [
  { key: 'stage', name: '漏斗阶段', description: '企业主表.stage' },
  { key: 'district', name: '区域', description: '企业主表.district' },
  { key: 'staff_size', name: '人员规模', description: '企业主表.staff_size_id' },
  { key: 'revenue', name: '营收规模', description: '企业主表.domestic_revenue_id, cross_border_revenue_id' },
  { key: 'source', name: '企业来源', description: '企业主表.source_id' },
  { key: 'enterprise_type', name: '企业类型', description: '企业主表.enterprise_type' },
  { key: 'trade_mode', name: '外贸模式', description: '企业主表.trade_mode_id' },
  { key: 'trade_team_mode', name: '外贸业务团队模式', description: '企业主表.trade_team_mode_id' },
  { key: 'trade_business_mode', name: '外贸业务模式', description: '企业主表.mode_changes' },
  { key: 'growth_reason', name: '增长原因', description: '企业主表.growth_reasons' },
  { key: 'decline_reason', name: '下降原因', description: '企业主表.decline_reasons' },
  { key: 'cross_border_platform', name: '跨境平台', description: '企业主表.cross_border_platforms' },
  { key: 'cross_border_logistics', name: '跨境物流模式', description: '企业主表.cross_border_logistics' },
  { key: 'payment_settlement', name: '支付结算方式', description: '企业主表.payment_settlement' },
  { key: 'region', name: '销售区域', description: '企业产品.target_region_ids' },
  { key: 'country', name: '销售目标国', description: '企业主表.target_country_ids' },
  { key: 'certification', name: '产品认证', description: '企业产品.certification_ids' },
  { key: 'automation_level', name: '自动化程度', description: '企业产品.automation_level_id' },
  { key: 'logistics', name: '物流合作方', description: '企业产品.logistics_partner_ids' },
  { key: 'follow_type', name: '跟进类型', description: '跟进记录.follow_type' },
];

// 数据字典数据
export const dictionaryData: DictionaryItem[] = [
  // 漏斗阶段
  { id: 1, category: 'stage', value: 'POTENTIAL', label: '潜在企业', color: '#94a3b8', sort_order: 1, is_enabled: true, created_at: '2025-01-01' },
  { id: 2, category: 'stage', value: 'NO_DEMAND', label: '无明确需求', color: '#fbbf24', sort_order: 2, is_enabled: true, created_at: '2025-01-01' },
  { id: 3, category: 'stage', value: 'NO_INTENTION', label: '没有合作意向', color: '#ef4444', sort_order: 3, is_enabled: true, created_at: '2025-01-01' },
  { id: 4, category: 'stage', value: 'HAS_DEMAND', label: '有明确需求', color: '#3b82f6', sort_order: 4, is_enabled: true, created_at: '2025-01-01' },
  { id: 5, category: 'stage', value: 'SIGNED', label: '已签约', color: '#8b5cf6', sort_order: 5, is_enabled: true, created_at: '2025-01-01' },
  { id: 6, category: 'stage', value: 'SETTLED', label: '已入驻', color: '#10b981', sort_order: 6, is_enabled: true, created_at: '2025-01-01' },
  { id: 7, category: 'stage', value: 'INCUBATING', label: '重点孵化', color: '#f97316', sort_order: 7, is_enabled: true, created_at: '2025-01-01' },
  
  // 区域
  { id: 10, category: 'district', value: 'wujin', label: '武进区', sort_order: 1, is_enabled: true, created_at: '2025-01-01' },
  { id: 11, category: 'district', value: 'xinbei', label: '新北区', sort_order: 2, is_enabled: true, created_at: '2025-01-01' },
  { id: 12, category: 'district', value: 'tianning', label: '天宁区', sort_order: 3, is_enabled: true, created_at: '2025-01-01' },
  { id: 13, category: 'district', value: 'zhonglou', label: '钟楼区', sort_order: 4, is_enabled: true, created_at: '2025-01-01' },
  { id: 14, category: 'district', value: 'jingkai', label: '经开区', sort_order: 5, is_enabled: true, created_at: '2025-01-01' },
  { id: 15, category: 'district', value: 'jintan', label: '金坛区', sort_order: 6, is_enabled: true, created_at: '2025-01-01' },
  { id: 16, category: 'district', value: 'liyang', label: '溧阳市', sort_order: 7, is_enabled: true, created_at: '2025-01-01' },

  // 人员规模
  { id: 20, category: 'staff_size', value: 'lt10', label: '10人以下', sort_order: 1, is_enabled: true, created_at: '2025-01-01' },
  { id: 21, category: 'staff_size', value: '10-50', label: '10-50人', sort_order: 2, is_enabled: true, created_at: '2025-01-01' },
  { id: 22, category: 'staff_size', value: '50-200', label: '50-200人', sort_order: 3, is_enabled: true, created_at: '2025-01-01' },
  { id: 23, category: 'staff_size', value: '200-500', label: '200-500人', sort_order: 4, is_enabled: true, created_at: '2025-01-01' },
  { id: 24, category: 'staff_size', value: '500-1000', label: '500-1000人', sort_order: 5, is_enabled: true, created_at: '2025-01-01' },
  { id: 25, category: 'staff_size', value: 'gt1000', label: '1000人以上', sort_order: 6, is_enabled: true, created_at: '2025-01-01' },

  // 营收规模
  { id: 30, category: 'revenue', value: 'lt200', label: '200万以下', sort_order: 1, is_enabled: true, created_at: '2025-01-01' },
  { id: 31, category: 'revenue', value: '200-500', label: '200-500万', sort_order: 2, is_enabled: true, created_at: '2025-01-01' },
  { id: 32, category: 'revenue', value: '500-1000', label: '500-1000万', sort_order: 3, is_enabled: true, created_at: '2025-01-01' },
  { id: 33, category: 'revenue', value: '1000-5000', label: '1000-5000万', sort_order: 4, is_enabled: true, created_at: '2025-01-01' },
  { id: 34, category: 'revenue', value: 'gt5000', label: '5000万以上', sort_order: 5, is_enabled: true, created_at: '2025-01-01' },

  // 企业来源
  { id: 40, category: 'source', value: 'survey', label: '调研', sort_order: 1, is_enabled: true, created_at: '2025-01-01' },
  { id: 41, category: 'source', value: 'referral', label: '转介绍', sort_order: 2, is_enabled: true, created_at: '2025-01-01' },
  { id: 42, category: 'source', value: 'inquiry', label: '主动咨询', sort_order: 3, is_enabled: true, created_at: '2025-01-01' },
  { id: 43, category: 'source', value: 'activity', label: '活动', sort_order: 4, is_enabled: true, created_at: '2025-01-01' },

  // 企业类型
  { id: 50, category: 'enterprise_type', value: 'production', label: '生产型', sort_order: 1, is_enabled: true, created_at: '2025-01-01' },
  { id: 51, category: 'enterprise_type', value: 'trading', label: '贸易型', sort_order: 2, is_enabled: true, created_at: '2025-01-01' },
  { id: 52, category: 'enterprise_type', value: 'both', label: '工贸一体', sort_order: 3, is_enabled: true, created_at: '2025-01-01' },

  // 外贸模式
  { id: 60, category: 'trade_mode', value: 'direct_export', label: '直接出口', sort_order: 1, is_enabled: true, created_at: '2025-01-01' },
  { id: 61, category: 'trade_mode', value: 'agent_export', label: '代理出口', sort_order: 2, is_enabled: true, created_at: '2025-01-01' },
  { id: 62, category: 'trade_mode', value: 'cross_border', label: '跨境电商', sort_order: 3, is_enabled: true, created_at: '2025-01-01' },
  { id: 63, category: 'trade_mode', value: 'oem', label: 'OEM/ODM', sort_order: 4, is_enabled: true, created_at: '2025-01-01' },
  { id: 64, category: 'trade_mode', value: 'mixed', label: '混合模式', sort_order: 5, is_enabled: true, created_at: '2025-01-01' },

  // 跨境平台
  { id: 70, category: 'cross_border_platform', value: 'amazon', label: '亚马逊 (Amazon)', sort_order: 1, is_enabled: true, created_at: '2025-01-01' },
  { id: 71, category: 'cross_border_platform', value: 'alibaba', label: '阿里国际站 (Alibaba.com)', sort_order: 2, is_enabled: true, created_at: '2025-01-01' },
  { id: 72, category: 'cross_border_platform', value: 'tiktok', label: 'TikTok Shop', sort_order: 3, is_enabled: true, created_at: '2025-01-01' },
  { id: 73, category: 'cross_border_platform', value: 'aliexpress', label: '速卖通 (AliExpress)', sort_order: 4, is_enabled: true, created_at: '2025-01-01' },
  { id: 74, category: 'cross_border_platform', value: 'ebay', label: 'eBay', sort_order: 5, is_enabled: true, created_at: '2025-01-01' },
  { id: 75, category: 'cross_border_platform', value: 'shopify', label: '独立站 (Shopify)', sort_order: 6, is_enabled: true, created_at: '2025-01-01' },
  { id: 76, category: 'cross_border_platform', value: 'temu', label: 'Temu', sort_order: 7, is_enabled: true, created_at: '2025-01-01' },
  { id: 77, category: 'cross_border_platform', value: 'shein', label: 'SHEIN', sort_order: 8, is_enabled: true, created_at: '2025-01-01' },

  // 销售区域
  { id: 80, category: 'region', value: 'north_america', label: '北美', sort_order: 1, is_enabled: true, created_at: '2025-01-01' },
  { id: 81, category: 'region', value: 'europe', label: '欧洲', sort_order: 2, is_enabled: true, created_at: '2025-01-01' },
  { id: 82, category: 'region', value: 'southeast_asia', label: '东南亚', sort_order: 3, is_enabled: true, created_at: '2025-01-01' },
  { id: 83, category: 'region', value: 'east_asia', label: '东亚', sort_order: 4, is_enabled: true, created_at: '2025-01-01' },
  { id: 84, category: 'region', value: 'middle_east', label: '中东', sort_order: 5, is_enabled: true, created_at: '2025-01-01' },

  // 产品认证
  { id: 90, category: 'certification', value: 'CE', label: 'CE认证', sort_order: 1, is_enabled: true, created_at: '2025-01-01' },
  { id: 91, category: 'certification', value: 'SGS', label: 'SGS认证', sort_order: 2, is_enabled: true, created_at: '2025-01-01' },
  { id: 92, category: 'certification', value: 'UL', label: 'UL认证', sort_order: 3, is_enabled: true, created_at: '2025-01-01' },
  { id: 93, category: 'certification', value: 'FCC', label: 'FCC认证', sort_order: 4, is_enabled: true, created_at: '2025-01-01' },
  { id: 94, category: 'certification', value: 'ISO9001', label: 'ISO9001', sort_order: 5, is_enabled: true, created_at: '2025-01-01' },

  // 跟进类型
  { id: 100, category: 'follow_type', value: 'phone', label: '电话', sort_order: 1, is_enabled: true, created_at: '2025-01-01' },
  { id: 101, category: 'follow_type', value: 'video', label: '视频', sort_order: 2, is_enabled: true, created_at: '2025-01-01' },
  { id: 102, category: 'follow_type', value: 'visit', label: '拜访', sort_order: 3, is_enabled: true, created_at: '2025-01-01' },
  { id: 103, category: 'follow_type', value: 'meeting', label: '会议', sort_order: 4, is_enabled: true, created_at: '2025-01-01' },
];
