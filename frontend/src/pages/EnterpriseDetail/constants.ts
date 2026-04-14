export const FUNNEL_STAGES = [
  { code: 'POTENTIAL', name: '潜在企业', color: '#94a3b8' },
  { code: 'NO_DEMAND', name: '无明确需求', color: '#fbbf24' },
  { code: 'NO_INTENTION', name: '没有合作意向', color: '#ef4444' },
  { code: 'HAS_DEMAND', name: '有明确需求', color: '#3b82f6' },
  { code: 'SIGNED', name: '已签约', color: '#8b5cf6' },
  { code: 'SETTLED', name: '已入驻', color: '#10b981' },
  { code: 'INCUBATING', name: '重点孵化', color: '#f97316' },
];

export const ENJOYED_POLICY_OPTIONS = [
  { label: '跨境电商扶持资金', value: 'cross_border_fund' },
  { label: '外贸稳增长补贴', value: 'trade_growth_subsidy' },
  { label: '品牌出海补贴', value: 'brand_overseas_subsidy' },
  { label: '人才引进补贴', value: 'talent_subsidy' },
  { label: '跨境电商出口退税', value: 'export_tax_rebate' },
  { label: '海外仓补贴', value: 'overseas_warehouse_subsidy' },
  { label: '产品认证补贴', value: 'certification_subsidy' },
  { label: '展会补贴', value: 'exhibition_subsidy' },
  { label: '物流补贴', value: 'logistics_subsidy' },
  { label: '培训补贴', value: 'training_subsidy' },
  { label: '创新研发资金', value: 'innovation_fund' },
  { label: '中小企业扶持', value: 'sme_support' },
  { label: '其他', value: 'other' },
];

export const stageOrder: Record<string, number> = {
  '潜在企业': 1,
  '有明确需求': 2,
  '已对接': 3,
  '已签约': 4,
  '已落地': 5,
};

export const COOPERATION_PROJECTS = [
  { label: '跨境电商运营培训', value: 'ecommerce_training', icon: '📚', color: '#1890ff' },
  { label: '平台资源对接', value: 'platform_resource', icon: '🔗', color: '#52c41a' },
  { label: '品牌孵化服务', value: 'brand_incubation', icon: '🚀', color: '#722ed1' },
  { label: '代运营服务', value: 'agency_operation', icon: '⚙️', color: '#fa8c16' },
  { label: '人才招聘', value: 'talent_recruitment', icon: '👥', color: '#eb2f96' },
  { label: '政策申报', value: 'policy_application', icon: '📋', color: '#13c2c2' },
  { label: '海外仓服务', value: 'overseas_warehouse', icon: '🏭', color: '#2f54eb' },
  { label: '物流解决方案', value: 'logistics_solution', icon: '🚚', color: '#faad14' },
  { label: '营销推广服务', value: 'marketing_promotion', icon: '📢', color: '#f5222d' },
  { label: '共享办公工位', value: 'shared_office', icon: '🏢', color: '#a0d911' },
  { label: '法务咨询服务', value: 'legal_consulting', icon: '⚖️', color: '#597ef7' },
  { label: '金融服务对接', value: 'financial_service', icon: '💰', color: '#ffc53d' },
  { label: '其他', value: 'other', icon: '📦', color: '#8c8c8c' },
];

export const PROJECT_ICON_MAP: Record<string, { icon: string; color: string }> = Object.fromEntries(
  COOPERATION_PROJECTS.map((p) => [p.value, { icon: p.icon, color: p.color }])
);

export const CONCERN_OPTIONS = [
  { label: '暂无合作意向', value: 'no_intention' },
  { label: '企业自有团队较完善', value: 'own_team' },
  { label: '服务费用顾虑', value: 'cost_concern' },
  { label: '对服务效果存疑', value: 'effect_doubt' },
  { label: '时机不成熟', value: 'timing_not_right' },
  { label: '已有其他合作方', value: 'other_partner' },
  { label: '内部决策流程未通过', value: 'internal_decision' },
  { label: '企业资源有限', value: 'resource_limited' },
  { label: '战略方向不匹配', value: 'strategy_mismatch' },
  { label: '其他', value: 'other' },
];

export const SERVICE_TYPE_MAP: Record<string, { label: string; color: string }> = {
  training: { label: '培训与赋能', color: '#396AFF' },
  policy: { label: '政策对接', color: '#16DBCC' },
  incubation: { label: '孵化与辅导', color: '#FFBB38' },
  platform: { label: '平台资源', color: '#396AFF' },
  settlement: { label: '招商入驻', color: '#7B61FF' },
  activity: { label: '活动展会', color: '#FE5C73' },
  finance: { label: '金融资金', color: '#FFBB38' },
  other: { label: '其他', color: '#718EBF' },
};

export const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待启动', color: '#FFBB38' },
  in_progress: { label: '进行中', color: '#396AFF' },
  completed: { label: '已完成', color: '#16DBCC' },
  terminated: { label: '已终止', color: '#FE5C73' },
};

export const LEVEL_MAP: Record<string, { label: string; color: string }> = {
  S: { label: 'S-重点孵化', color: '#7B61FF' },
  A: { label: 'A-商业化', color: '#396AFF' },
  B: { label: 'B-普惠', color: '#16DBCC' },
  C: { label: 'C-培育', color: '#718EBF' },
};

export const RATING_ITEMS = [
  { label: '企业规模与基础', desc: '营收规模、人员规模、外贸基础', field: 'service_cooperation_rating', apiField: 'serviceCooperationRating', color: '#667eea' },
  { label: '合作意愿', desc: '决策层支持度、投入意愿、紧迫性', field: 'investment_cooperation_rating', apiField: 'investmentCooperationRating', color: '#43e97b' },
  { label: '企业配合度', desc: '响应速度、资料完整度、对接人稳定性', field: 'incubation_cooperation_rating', apiField: 'incubationCooperationRating', color: '#f97316' },
  { label: '产品市场匹配度', desc: '海外需求、认证合规、竞争优势', field: 'brand_cooperation_rating', apiField: 'brandCooperationRating', color: '#ec4899' },
  { label: '资源匹配度', desc: '三中心服务能力、服务商资源、政策支持', field: 'training_cooperation_rating', apiField: 'trainingCooperationRating', color: '#8b5cf6' },
  { label: '风险可控度', desc: '知识产权、供应链、合规风险', field: 'overall_cooperation_rating', apiField: 'overallCooperationRating', color: '#06b6d4' },
];

/** 企业级可行性评估下拉选项（与原先 1～5 星同刻度） */
export const FEASIBILITY_RATING_SELECT_OPTIONS = [
  { label: '1 分（很低）', value: 1 },
  { label: '2 分（较低）', value: 2 },
  { label: '3 分（一般）', value: 3 },
  { label: '4 分（较高）', value: 4 },
  { label: '5 分（很高）', value: 5 },
];

export const ASSESSMENT_DIMENSIONS = [
  { key: 'scale', label: '企业规模与基础', weight: 0.15, desc: '营收规模、人员规模、外贸基础' },
  { key: 'willingness', label: '合作意愿', weight: 0.2, desc: '决策层支持度、投入意愿、紧迫性' },
  { key: 'cooperation', label: '企业配合度', weight: 0.15, desc: '响应速度、资料完整度、对接人稳定性' },
  { key: 'marketFit', label: '产品市场匹配度', weight: 0.25, desc: '海外需求、认证合规、竞争优势' },
  { key: 'resourceFit', label: '资源匹配度', weight: 0.15, desc: '三中心服务能力、服务商资源、政策支持' },
  { key: 'riskControl', label: '风险可控度', weight: 0.1, desc: '知识产权、供应链、合规风险' },
];

export const SERVICE_TYPES_DATA = [
  { value: 'training', label: '培训与赋能', color: '#396AFF' },
  { value: 'policy', label: '政策对接', color: '#16DBCC' },
  { value: 'incubation', label: '孵化与辅导', color: '#FFBB38' },
  { value: 'platform', label: '平台资源对接', color: '#396AFF' },
  { value: 'settlement', label: '招商入驻', color: '#7B61FF' },
  { value: 'activity', label: '活动与展会', color: '#FE5C73' },
  { value: 'finance', label: '金融与资金', color: '#FFBB38' },
  { value: 'other', label: '其他服务', color: '#718EBF' },
];

export const SERVICE_STATUSES_DATA = [
  { value: 'pending', label: '待启动', color: '#FFBB38' },
  { value: 'in_progress', label: '进行中', color: '#396AFF' },
  { value: 'completed', label: '已完成', color: '#16DBCC' },
  { value: 'terminated', label: '已终止', color: '#FE5C73' },
];

export const ENTERPRISE_DETAIL_TAB_KEYS = new Set([
  'basic',
  'product',
  'trade',
  'crossborder',
  'requirements',
  'policy',
  'cooperation',
  'competition',
  'followup',
]);

export function calcFeasibilityScore(data: Record<string, number>): number {
  let total = 0;
  for (const dim of ASSESSMENT_DIMENSIONS) {
    total += (data[dim.key] || 0) * dim.weight;
  }
  return Math.round(total * 10) / 10;
}

export function calcProjectLevel(score: number): string {
  if (score >= 4) return 'S';
  if (score >= 3) return 'A';
  if (score >= 2) return 'B';
  return 'C';
}
