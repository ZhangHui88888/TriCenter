export type Distribution = { name: string; count: number };
export type MonthlyTrend = { month: string; totalNew: number; signedNew: number };
export type AnalysisStats = {
  totalCount?: number;
  totalExportRevenueWan?: number;
  districtStats?: Distribution[];
  typeStats?: Distribution[];
  platformStats?: Distribution[];
  salesCountryStats?: Distribution[];
  salesRegionStats?: Distribution[];
  industryStats?: Distribution[];
  funnelStats?: (Distribution & { code: string })[];
};

export const FUNNEL_STAGES = [
  { code: 'POTENTIAL', name: '潜在企业' },
  { code: 'NO_DEMAND', name: '无明确需求' },
  { code: 'NO_INTENTION', name: '没有合作意向' },
  { code: 'HAS_DEMAND', name: '有明确需求' },
  { code: 'SIGNED', name: '已签约' },
  { code: 'SETTLED', name: '已入驻' },
  { code: 'INCUBATING', name: '重点孵化' },
];

export const isUnclassified = (name: string) => ['未分类', '未定义', '待填写', '未知', '未填写'].includes(name);

export function formatRevenue(value: number) {
  const inYi = Math.abs(value) >= 10000;
  return {
    value: (inYi ? value / 10000 : value).toLocaleString('zh-CN', { maximumFractionDigits: 2 }),
    unit: inYi ? '亿元' : '万元',
  };
}
