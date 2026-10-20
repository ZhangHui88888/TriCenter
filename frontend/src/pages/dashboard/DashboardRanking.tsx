import { Empty } from 'antd';
import type { DistributionItem } from '../DashboardDistributions';
import { isUnclassified } from '../data-analysis/types';

type Props = {
  title: string; subtitle: string; data: DistributionItem[]; total: number;
  preserveOrder?: boolean; separateUnknown?: boolean;
};

export default function DashboardRanking({ title, subtitle, data, total, preserveOrder, separateUnknown }: Props) {
  const missing = separateUnknown ? data.filter(item => isUnclassified(item.name)).reduce((sum, item) => sum + item.count, 0) : 0;
  const rows = data.filter(item => !separateUnknown || !isUnclassified(item.name));
  if (!preserveOrder) rows.sort((a, b) => b.count - a.count);
  const max = Math.max(...rows.map(item => item.count), 1);
  return <section className="dashboard-panel dashboard-ranking-panel">
    <div className="dashboard-panel-heading"><h2>{title}</h2><span>企业数 / 占比</span></div>
    <p className="dashboard-panel-description">{subtitle}</p>
    {missing > 0 && <div className="dashboard-missing">未分类 <strong>{missing.toLocaleString('zh-CN')} 家</strong><span>{total > 0 ? (missing / total * 100).toFixed(1) : '0.0'}%</span></div>}
    <div className="dashboard-ranking-scroll" tabIndex={0} role="region" aria-label={title + '，可滚动查看全部数据'}>
      {rows.length ? <ol className="dashboard-ranking">{rows.map(item => <li key={item.name}>
        <span className="dashboard-ranking-name" title={item.name}>{item.name}</span>
        <span className="dashboard-ranking-track" aria-hidden><i style={{ width: (item.count / max * 100) + '%' }} /></span>
        <strong>{item.count.toLocaleString('zh-CN')}</strong>
        <span className="dashboard-ranking-percent">{total > 0 ? (item.count / total * 100).toFixed(1) : '0.0'}%</span>
      </li>)}</ol> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={missing ? '暂无已分类数据' : '暂无数据'} />}
    </div>
    <p className="dashboard-ranking-note">统计企业 {total.toLocaleString('zh-CN')} 家{rows.length > 7 ? ' · 滚动查看全部' : ''}</p>
  </section>;
}
