import { Empty } from 'antd';
import CoreChart from '@/components/CoreChart';
import { useThemeStore } from '@/stores/themeStore';
import type { MonthlyTrend } from './types';

export default function AnalysisTrend({ data }: { data: MonthlyTrend[] }) {
  const dark = useThemeStore(state => state.mode === 'dark');
  const muted = dark ? '#a9b8cc' : '#69798f';
  const grid = dark ? '#344256' : '#edf1f6';
  const chart = (key: 'totalNew' | 'signedNew', name: string, color: string) => ({
    tooltip: { trigger: 'axis', confine: true, backgroundColor: dark ? '#233044' : '#fff', borderColor: grid, textStyle: { color: dark ? '#edf2fa' : '#24364b' } },
    grid: { left: 10, right: 16, top: 12, bottom: 8, containLabel: true },
    xAxis: { type: 'category', data: data.map(item => item.month), boundaryGap: false, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: muted, fontSize: 12, hideOverlap: true } },
    yAxis: { type: 'value', minInterval: 1, axisLabel: { color: muted, fontSize: 11 }, splitLine: { lineStyle: { color: grid, type: 'dashed' } } },
    series: [{ name, type: 'line', smooth: false, symbol: 'circle', symbolSize: 5, lineStyle: { width: 2.5, color }, itemStyle: { color }, areaStyle: { color, opacity: 0.07 }, data: data.map(item => item[key]) }],
  });
  return (
    <section className="analysis-panel analysis-trend">
      <div className="analysis-panel-heading"><h3>月度新增趋势</h3><span>最近 12 个月</span></div>
      <p className="analysis-panel-subtitle">全市新增企业与签约 · 不随当前筛选变化</p>
      {data.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无趋势数据" /> : <div className="analysis-trend-charts">
        <div className="analysis-trend-label"><i />新增企业<span>家</span></div>
        <CoreChart option={chart('totalNew', '新增企业', '#688dc6')} style={{ height: 142 }} notMerge />
        <div className="analysis-trend-label analysis-trend-signed"><i />新增签约<span>家</span></div>
        <CoreChart option={chart('signedNew', '新增签约', '#72a79d')} style={{ height: 108 }} notMerge />
      </div>}
    </section>
  );
}
