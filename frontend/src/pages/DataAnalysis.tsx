import { useState } from 'react';
import { Badge, Button, Select, Skeleton, Tooltip } from 'antd';
import { FilterOutlined, ReloadOutlined, SearchOutlined, UndoOutlined } from '@ant-design/icons';
import EnterpriseSearch from '@/components/EnterpriseSearch';
import AnalysisSummary from './data-analysis/AnalysisSummary';
import AnalysisMap from './data-analysis/AnalysisMap';
import AnalysisCharts from './data-analysis/AnalysisCharts';
import AnalysisFiltersModal from './data-analysis/AnalysisFiltersModal';
import { useDataAnalysis } from './data-analysis/useDataAnalysis';
import { FUNNEL_STAGES } from './data-analysis/types';
import './data-analysis/data-analysis.css';

export default function DataAnalysis() {
  const [mapMode, setMapMode] = useState<'region' | 'country'>('region');
  const state = useDataAnalysis();
  const { keyword, setKeyword, stageFilter, setStageFilter, districtFilter, setDistrictFilter,
    industryId, setIndustryId, districts, industryOptions, handleSearch, activeFilterCount,
    setIsFilterModalOpen, clearingCache, handleClearCache, handleReset, loading, analysisStats, monthlyTrend } = state;
  return (
    <div className="data-analysis">
      <section className="analysis-toolbar" data-tour="data-analysis-filters" aria-label="企业数据筛选">
        <div className="analysis-filter-fields">
          <EnterpriseSearch value={keyword} onChange={setKeyword} onSearch={handleSearch} style={{ width: '100%' }} />
          <Select aria-label="漏斗阶段" placeholder="漏斗阶段" value={stageFilter} onChange={setStageFilter} allowClear options={FUNNEL_STAGES.map(s => ({ label: s.name, value: s.code }))} />
          <Select aria-label="所属区域" placeholder="所属区域" value={districtFilter} onChange={setDistrictFilter} allowClear options={districts.map(d => ({ label: d, value: d }))} />
          <Select aria-label="所属行业" placeholder="所属行业" value={industryId} onChange={setIndustryId} allowClear options={industryOptions.map((o: { name: string; id: number }) => ({ label: o.name, value: o.id }))} />
        </div>
        <div className="analysis-filter-actions">
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询分析</Button>
          <Badge count={activeFilterCount} size="small" offset={[-4, 0]}><Button icon={<FilterOutlined />} onClick={() => setIsFilterModalOpen(true)}>高级筛选</Button></Badge>
          <Tooltip title="重置筛选"><Button type="text" aria-label="重置筛选" icon={<UndoOutlined />} onClick={handleReset}><span className="analysis-reset-label">重置</span></Button></Tooltip>
          <Tooltip title="刷新统计数据"><Button type="text" aria-label="刷新统计数据" icon={<ReloadOutlined />} loading={clearingCache} onClick={handleClearCache} /></Tooltip>
        </div>
      </section>
      {loading ? <div className="analysis-loading" role="status" aria-label="正在加载数据分析"><Skeleton active paragraph={{ rows: 3 }} /><Skeleton active paragraph={{ rows: 8 }} /></div> : <>
        <div data-tour="data-analysis-summary"><AnalysisSummary stats={analysisStats} /><AnalysisMap stats={analysisStats} mode={mapMode} onModeChange={setMapMode} /></div>
        <AnalysisCharts stats={analysisStats} trend={monthlyTrend} />
      </>}
      <AnalysisFiltersModal state={state} />
    </div>
  );
}
