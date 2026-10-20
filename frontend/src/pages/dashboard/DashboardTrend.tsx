import { useState } from 'react';
import { Empty, Segmented } from 'antd';
import CoreChart from '@/components/CoreChart';
import { useThemeStore } from '@/stores/themeStore';
import { getDashboardTrendOption } from '../dashboardChartOptions';

export type MonthlyTrend = { month: string; totalNew: number; signedNew: number };
export default function DashboardTrend({ data }: { data: MonthlyTrend[] }) {
  const [metric, setMetric] = useState<'totalNew' | 'signedNew'>('totalNew');
  const dark = useThemeStore(state => state.mode === 'dark');
  const latest = data[data.length - 1];
  return <section className="dashboard-panel dashboard-trend">
    <div className="dashboard-panel-heading"><h2>月度新增趋势</h2><span>最近 12 个月</span></div>
    <div className="dashboard-trend-toolbar">
      <p>{latest?.month || '最近一个月'}新增 <strong>{(latest?.[metric] || 0).toLocaleString('zh-CN')}</strong> 家</p>
      <Segmented aria-label="趋势统计维度" value={metric} onChange={value => setMetric(value as typeof metric)} options={[{ label: '新增企业', value: 'totalNew' }, { label: '新增签约', value: 'signedNew' }]} />
    </div>
    {data.length ? <CoreChart option={getDashboardTrendOption(data, metric, dark)} style={{ height: 212 }} notMerge /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无趋势数据" />}
  </section>;
}
