import { AppstoreOutlined, CheckCircleOutlined, GlobalOutlined, ShopOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { formatRevenue, isUnclassified, type AnalysisStats } from './types';

export default function AnalysisSummary({ stats }: { stats: AnalysisStats | null }) {
  const revenue = stats?.totalExportRevenueWan ?? 0;
  const metrics = [
    { label: '筛选企业', value: (stats?.totalCount ?? 0).toLocaleString('zh-CN'), unit: '家', icon: <ShopOutlined /> },
    { label: '已签约企业', value: (stats?.funnelStats?.find(s => s.code === 'SIGNED')?.count ?? 0).toLocaleString('zh-CN'), unit: '家', icon: <CheckCircleOutlined /> },
    { label: '已分类行业', value: (stats?.industryStats ?? []).filter(s => s.count > 0 && !isUnclassified(s.name)).length, unit: '个', icon: <AppstoreOutlined /> },
    { label: '出口总贸易额', ...formatRevenue(revenue), icon: <GlobalOutlined />, detail: `${revenue.toLocaleString('zh-CN', { maximumFractionDigits: 2 })} 万元 · 当前筛选企业填报金额汇总` },
  ];
  return (
    <div className="analysis-metrics">
      {metrics.map(metric => (
        <div className="analysis-metric" key={metric.label}>
          <div className="analysis-metric-heading"><span>{metric.label}</span><span className="analysis-metric-icon" aria-hidden>{metric.icon}</span></div>
          <Tooltip title={'detail' in metric ? metric.detail : undefined}>
            <div className="analysis-metric-value">{metric.value}<span>{metric.unit}</span></div>
          </Tooltip>
        </div>
      ))}
    </div>
  );
}
