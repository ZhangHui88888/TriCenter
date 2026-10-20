import type { MonthlyTrend } from './dashboard/DashboardTrend';

export function getDashboardTrendOption(data: MonthlyTrend[], metric: 'totalNew' | 'signedNew', dark: boolean) {
  const muted = dark ? '#a9b8cc' : '#728096';
  const line = dark ? '#344256' : '#edf1f6';
  const color = metric === 'totalNew' ? '#5c82c6' : '#49958b';
  return {
    tooltip: { trigger: 'axis', confine: true, backgroundColor: dark ? '#233044' : '#fff', borderColor: line, textStyle: { color: dark ? '#edf2fa' : '#26364b' } },
    grid: { left: 4, right: 14, top: 18, bottom: 4, containLabel: true },
    xAxis: { type: 'category', data: data.map(item => item.month), boundaryGap: false, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: muted, fontSize: 12, hideOverlap: true } },
    yAxis: { type: 'value', minInterval: 1, axisLabel: { color: muted, fontSize: 11 }, splitLine: { lineStyle: { color: line, type: 'dashed' } } },
    series: [{ name: metric === 'totalNew' ? '新增企业' : '新增签约', type: 'line', smooth: false, symbol: 'circle', symbolSize: 5,
      itemStyle: { color }, lineStyle: { width: 2.5, color }, areaStyle: { color, opacity: 0.06 }, data: data.map(item => item[metric]) }],
  };
}
