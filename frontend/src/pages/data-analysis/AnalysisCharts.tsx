import DistributionCard from './DistributionCard';
import AnalysisTrend from './AnalysisTrend';
import type { AnalysisStats, MonthlyTrend } from './types';

export default function AnalysisCharts({ stats, trend }: { stats: AnalysisStats | null; trend: MonthlyTrend[] }) {
  const total = stats?.totalCount ?? 0;
  return (
    <div data-tour="data-analysis-charts">
      <div className="analysis-section-heading"><h2>企业数据洞察</h2><span>从业务进展到企业画像</span></div>
      <div className="analysis-charts-grid">
        <DistributionCard title="漏斗阶段分布" subtitle="当前筛选企业的业务进展" data={stats?.funnelStats ?? []} total={total} preserveOrder />
        <AnalysisTrend data={trend} />
        <DistributionCard title="行业分布" subtitle="一级行业 · 按企业数量排序" data={stats?.industryStats ?? []} total={total} separateUnknown />
        <DistributionCard title="区域分布" subtitle="区县分布 · 按企业数量排序" data={stats?.districtStats ?? []} total={total} separateUnknown />
        <DistributionCard title="跨境平台分布" subtitle="平台覆盖企业数 · 企业可多选" data={stats?.platformStats ?? []} total={total} multiSelect />
        <DistributionCard title="企业类型分布" subtitle="企业类型 · 按企业数量排序" data={stats?.typeStats ?? []} total={total} separateUnknown />
      </div>
    </div>
  );
}
