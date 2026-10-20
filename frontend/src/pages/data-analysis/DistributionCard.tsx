import { Empty, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { isUnclassified, type Distribution } from './types';

interface Props {
  title: string;
  subtitle: string;
  data: Distribution[];
  total: number;
  separateUnknown?: boolean;
  preserveOrder?: boolean;
  multiSelect?: boolean;
}

export default function DistributionCard({ title, subtitle, data, total, separateUnknown, preserveOrder, multiSelect }: Props) {
  const missing = separateUnknown ? data.filter(item => isUnclassified(item.name)).reduce((sum, item) => sum + item.count, 0) : 0;
  const rows = data.filter(item => (!separateUnknown || !isUnclassified(item.name)) && (preserveOrder || item.count > 0));
  if (!preserveOrder) rows.sort((a, b) => b.count - a.count);
  const max = Math.max(...rows.map(item => item.count), 1);
  return (
    <section className="analysis-panel">
      <div className="analysis-panel-heading">
        <h3>{title}</h3>
        <span>{rows.length} {title === '漏斗阶段分布' ? '个阶段' : '项'}</span>
      </div>
      <p className="analysis-panel-subtitle">{subtitle}{multiSelect && <Tooltip title="占比为使用该平台的企业数 ÷ 当前筛选企业数。一家企业可使用多个平台，各项占比相加可能超过 100%。"><InfoCircleOutlined tabIndex={0} aria-label="平台占比计算方式" className="analysis-info" /></Tooltip>}</p>
      {missing > 0 && <div className="analysis-completeness">未分类 <strong>{missing.toLocaleString('zh-CN')}</strong> 家<span>占 {total > 0 ? (missing / total * 100).toFixed(1) : '0'}% · 下方展示已分类数据</span></div>}
      <div className="analysis-distribution" tabIndex={0} role="region" aria-label={`${title}，可滚动查看全部数据`}>
        {rows.length > 0 ? <ol className="analysis-ranking">
          {rows.map((item, index) => (
            <li key={item.name}>
              <span className="analysis-rank-index">{String(index + 1).padStart(2, '0')}</span>
              <div className="analysis-rank-content">
                <div className="analysis-rank-label"><span title={item.name}>{item.name}</span><span><strong>{item.count.toLocaleString('zh-CN')}</strong><small>家</small><em>{total > 0 ? (item.count / total * 100).toFixed(1) : '0.0'}%</em></span></div>
                <div className="analysis-rank-track" aria-hidden><div style={{ width: `${item.count / max * 100}%` }} /></div>
              </div>
            </li>
          ))}
        </ol> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={missing > 0 ? '暂无已分类数据' : '暂无数据'} />}
      </div>
      <div className="analysis-panel-footnote">占比以当前筛选的 {total.toLocaleString('zh-CN')} 家企业为基数{rows.length > 5 ? ' · 滚动查看全部' : ''}</div>
    </section>
  );
}
