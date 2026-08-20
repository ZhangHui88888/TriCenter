import ReactEChartsCore from 'echarts-for-react/lib/core';
import { echarts } from '@/charts/echarts';

type CoreChartProps = Omit<React.ComponentProps<typeof ReactEChartsCore>, 'echarts'>;

export default function CoreChart(props: CoreChartProps) {
  return <ReactEChartsCore echarts={echarts} {...props} />;
}
