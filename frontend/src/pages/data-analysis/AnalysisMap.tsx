import { ConfigProvider, Empty, Segmented, Tooltip, theme } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import WorldMap from '@/components/WorldMap';
import type { AnalysisStats } from './types';

interface Props {
  stats: AnalysisStats | null;
  mode: 'region' | 'country';
  onModeChange: (mode: 'region' | 'country') => void;
}

export default function AnalysisMap({ stats, mode, onModeChange }: Props) {
  const data = (mode === 'region' ? stats?.salesRegionStats : stats?.salesCountryStats) ?? [];
  const ranked = data.filter(item => item.count > 0).slice().sort((a, b) => b.count - a.count);
  const total = stats?.totalCount ?? 0;
  return (
    <section className="analysis-map" aria-labelledby="analysis-map-title">
      <div className="analysis-map-header">
        <div>
          <h2 id="analysis-map-title">全球销售分布 <Tooltip title="按企业填报的销售区域或国家统计，同一家企业在每个目的地计一次；光点大小表示企业数量。"><InfoCircleOutlined tabIndex={0} aria-label="地图统计口径" className="analysis-info" /></Tooltip></h2>
          <p>当前筛选 {total.toLocaleString('zh-CN')} 家企业 · 已填报 {ranked.length} 个销售{mode === 'region' ? '区域' : '国家'}</p>
        </div>
        <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorBgContainer: '#172437', colorBgElevated: '#21334a', colorText: '#e6edf7', colorPrimary: '#76a9e8' } }}>
          <Segmented aria-label="地图统计维度" value={mode} onChange={value => onModeChange(value as 'region' | 'country')} options={[{ label: '销售区域', value: 'region' }, { label: '销售国家', value: 'country' }]} />
        </ConfigProvider>
      </div>
      <div className="analysis-map-body">
        <div className="analysis-map-visual">
          <WorldMap data={data} style={{ height: 'clamp(200px, 22vw, 280px)' }} />
          {ranked.length === 0 && <div className="analysis-map-empty"><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无销售分布数据" /></div>}
        </div>
        <aside className="analysis-map-ranking" aria-label="主要销售目的地排行">
          <div className="analysis-map-ranking-title"><h3>主要销售{mode === 'region' ? '区域' : '国家'}</h3><span>TOP 5</span></div>
          {ranked.length > 0 ? <ol>
            {ranked.slice(0, 5).map((item, index) => <li key={item.name}>
              <span className="analysis-map-ranking-index">{index + 1}</span>
              <span className="analysis-map-ranking-name" title={item.name}>{item.name}</span>
              <strong>{item.count.toLocaleString('zh-CN')}<small> 家</small></strong>
              <span className="analysis-map-ranking-share">{total > 0 ? (item.count / total * 100).toFixed(1) : '0.0'}%</span>
            </li>)}
          </ol> : <p className="analysis-map-ranking-empty">暂无已填报的销售目的地</p>}
          <p className="analysis-map-ranking-note">占比以筛选企业数为基数，企业可覆盖多个目的地</p>
        </aside>
      </div>
      <div className="analysis-map-footer">
        <div className="analysis-map-legend"><span><i className="analysis-origin" />常州</span><span><i className="analysis-destination" />{mode === 'region' ? '销售区域' : '销售国家'}</span></div>
        <span>滚轮缩放 · 拖动查看 · 悬停了解详情</span>
      </div>
    </section>
  );
}
