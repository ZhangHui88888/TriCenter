import type { FunnelStage } from '@/types';

export const FUNNEL_STAGES: Record<FunnelStage, { name: string; color: string }> = {
  POTENTIAL: { name: '潜在企业', color: '#94a3b8' },
  NO_DEMAND: { name: '无明确需求', color: '#fbbf24' },
  NO_INTENTION: { name: '没有合作意向', color: '#ef4444' },
  HAS_DEMAND: { name: '有明确需求', color: '#3b82f6' },
  SIGNED: { name: '已签约', color: '#8b5cf6' },
  SETTLED: { name: '已入驻', color: '#10b981' },
  INCUBATING: { name: '重点孵化', color: '#f97316' },
};

export const DISTRICTS = [
  '武进区',
  '新北区', 
  '天宁区',
  '钟楼区',
  '经开区',
  '金坛区',
  '溧阳市',
];

export const INDUSTRIES = [
  '园艺制品',
  '电动工具',
  '汽车零部件',
  '家居建材',
  '机械设备',
  '纺织服装',
  '电子产品',
  '其他',
];

export const ENTERPRISE_TYPES = [
  '生产型',
  '贸易型',
  '工贸一体',
];

export const ENTERPRISE_SOURCES = [
  '调研',
  '转介绍',
  '主动咨询',
  '活动',
];

export const FOLLOW_UP_TYPES = [
  '电话',
  '视频',
  '拜访',
  '会议',
];

export const EMPLOYEE_SCALES = [
  '10人以下',
  '10-50人',
  '50-200人',
  '200-500人',
  '500-1000人',
  '1000人以上',
];

export const REVENUE_SCALES = [
  '200以下',
  '200-500',
  '500-1000',
  '1000-5000',
  '5000以上',
];

export const TRANSFORMATION_WILLINGNESS = [
  '强烈',
  '有',
  '可以考虑',
  '无',
];

export const CROSSBORDER_PLATFORMS = [
  '亚马逊',
  '阿里国际站',
  'TikTok Shop',
  '独立站',
  'SHEIN',
  'eBay',
  '速卖通',
  'Wish',
  'Lazada',
  'Shopee',
];

export const ASSIGNEES = [
  '张明',
  '李华',
  '王芳',
  '赵强',
  '刘洋',
];

export const getStageInfo = (code: string) => {
  return FUNNEL_STAGES[code as FunnelStage] || { name: code, color: '#94a3b8' };
};
