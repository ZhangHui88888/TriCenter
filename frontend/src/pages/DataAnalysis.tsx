import { useState, useEffect, useRef } from 'react';
import { Select, Row, Col, Button, Space, Modal, Form, Tabs, Badge, message, Tooltip, InputNumber, DatePicker } from 'antd';
import NeonLoader from '@/components/NeonLoader';
import { ReloadOutlined, FilterOutlined, SearchOutlined, ClearOutlined } from '@ant-design/icons';
import EnterpriseSearch from '@/components/EnterpriseSearch';
import WorldMap, { worldMapDataKey } from '@/components/WorldMap';
import ReactECharts from 'echarts-for-react';
import { optionsApi, dashboardApi } from '@/services/api';
import { requirements } from '@/data/requirementsData';
import dayjs, { type Dayjs } from 'dayjs';
import {
  CROSSBORDER_PLATFORMS,
  ENTERPRISE_TYPE_OPTIONS,
  TRANSFORMATION_WILLINGNESS,
} from '@/utils/constants';

const D = {
  bg: '#0B0E13',
  card: '#0A0D10',
  cardBorder: '#1A1F27',
  grid: '#324B55',
  inactive: '#151A20',
  white: '#FFFFFF',
  sub: '#CED8E1',
  muted: '#6B7A8D',
  pink: '#F72585',
  purple: '#7209B7',
  teal: '#0A9396',
  cyan: '#00FAFF',
  blue: '#4361EE',
  orange: '#FF6D00',
  yellow: '#FFBE0B',
};

const chartColors = [D.pink, D.purple, D.teal, D.cyan, D.blue, D.orange, D.yellow, '#4CC9F0', '#7B2CBF'];

const cardStyle: React.CSSProperties = {
  background: D.card,
  borderRadius: 20,
  border: `1px solid ${D.cardBorder}`,
  padding: 25,
};

const titleStyle: React.CSSProperties = {
  fontSize: 18, fontWeight: 700, color: D.white, marginBottom: 4,
};

const subStyle: React.CSSProperties = {
  fontSize: 13, color: D.sub,
};

type SelectOption = { label: string; value: any };
type EntryDateRange = [Dayjs, Dayjs];

/** 全球地图：仅「区域 / 国家」，已移除「目标市场及占比」 */
type MapDisplayMode = 'region' | 'country';

const FUNNEL_STAGES = [
  { code: 'POTENTIAL', name: '潜在企业', color: D.blue },
  { code: 'NO_DEMAND', name: '无明确需求', color: D.yellow },
  { code: 'NO_INTENTION', name: '没有合作意向', color: D.pink },
  { code: 'HAS_DEMAND', name: '有明确需求', color: D.cyan },
  { code: 'SIGNED', name: '已签约', color: D.purple },
  { code: 'SETTLED', name: '已入驻', color: D.teal },
  { code: 'INCUBATING', name: '重点孵化', color: D.orange },
];

function toEntryDateRange(value: unknown): EntryDateRange | undefined {
  if (!Array.isArray(value) || value.length !== 2) {
    return undefined;
  }
  const [start, end] = value;
  if (typeof start !== 'string' || typeof end !== 'string') {
    return undefined;
  }
  const startDate = dayjs(start);
  const endDate = dayjs(end);
  if (!startDate.isValid() || !endDate.isValid()) {
    return undefined;
  }
  return [startDate, endDate];
}

function normalizeEntryDateRange(value: unknown): [string, string] | undefined {
  if (!Array.isArray(value) || value.length !== 2) {
    return undefined;
  }
  const [start, end] = value;
  if (!dayjs.isDayjs(start) || !dayjs.isDayjs(end)) {
    return undefined;
  }
  return [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')];
}

function DataAnalysis() {
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [stageFilter, setStageFilter] = useState<string | undefined>();
  const [districtFilter, setDistrictFilter] = useState<string | undefined>();
  const [industryId, setIndustryId] = useState<number | undefined>();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});
  const [filterForm] = Form.useForm();

  const [districts, setDistricts] = useState<string[]>([]);
  const [industryOptions, setIndustryOptions] = useState<any[]>([]);
  const [staffSizeOptions, setStaffSizeOptions] = useState<SelectOption[]>([]);
  const [domesticRevenueOptions, setDomesticRevenueOptions] = useState<SelectOption[]>([]);
  const [sourceOptions, setSourceOptions] = useState<SelectOption[]>([]);
  const [automationLevelOptions, setAutomationLevelOptions] = useState<SelectOption[]>([]);
  const [logisticsOptions, setLogisticsOptions] = useState<SelectOption[]>([]);

  const [analysisStats, setAnalysisStats] = useState<any>(null);
  const [mapDisplayMode, setMapDisplayMode] = useState<MapDisplayMode>('region');
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [clearingCache, setClearingCache] = useState(false);

  useEffect(() => {
    Promise.all([
      optionsApi.getOptions('district'),
      optionsApi.getIndustries(),
      optionsApi.getOptions('staff_size'),
      optionsApi.getOptions('domestic_revenue'),
      optionsApi.getOptions('source'),
      optionsApi.getOptions('automation_level'),
      optionsApi.getOptions('logistics'),
    ]).then(([districtRes, industryRes, staffRes, domRevRes, srcRes, autoRes, logRes]) => {
      if (districtRes.data) setDistricts(districtRes.data.map((d: any) => d.label));
      if (industryRes.data) {
        const flat: any[] = [];
        const flatten = (items: any[]) => items.forEach(i => { flat.push({ id: i.id, name: i.name }); if (i.children) flatten(i.children); });
        flatten(industryRes.data);
        setIndustryOptions(flat);
      }
      if (staffRes.data) setStaffSizeOptions(staffRes.data.map((i: any) => ({ label: i.label, value: i.id })));
      if (domRevRes.data) setDomesticRevenueOptions(domRevRes.data.map((i: any) => ({ label: i.label, value: i.id })));
      if (srcRes.data) setSourceOptions(srcRes.data.map((i: any) => ({ label: i.label, value: i.id })));
      if (autoRes.data) setAutomationLevelOptions(autoRes.data.map((i: any) => ({ label: i.label, value: i.id })));
      if (logRes.data) setLogisticsOptions(logRes.data.map((i: any) => ({ label: i.label, value: i.id })));
    });
    fetchData({});
  }, []);

  useEffect(() => {
    if (!isFilterModalOpen) {
      return;
    }
    filterForm.setFieldsValue({
      ...advancedFilters,
      entry_date_range: toEntryDateRange(advancedFilters.entry_date_range),
    });
  }, [isFilterModalOpen, advancedFilters, filterForm]);

  const buildParams = (filters: Record<string, any> = advancedFilters) => {
    const reqIds = filters.requirements && typeof filters.requirements === 'object'
      ? Array.from(new Set(Object.values(filters.requirements).flatMap((v) => Array.isArray(v) ? v : [])))
      : [];
    const positiveId = (v: unknown) => (typeof v === 'number' && v > 0 ? v : undefined);
    const entryDateRange = normalizeEntryDateRange(filters.entry_date_range);
    return {
      keyword: keyword || undefined,
      stage: filters.funnel_stage || stageFilter || undefined,
      district: filters.district || districtFilter || undefined,
      industryId: positiveId(industryId),
      enterpriseType: filters.enterprise_type || undefined,
      staffSizeId: positiveId(filters.employee_scale),
      domesticRevenueId: positiveId(filters.domestic_revenue),
      crossBorderRevenueMinWan: filters.crossborder_revenue_min_wan != null ? Number(filters.crossborder_revenue_min_wan) : undefined,
      crossBorderRevenueMaxWan: filters.crossborder_revenue_max_wan != null ? Number(filters.crossborder_revenue_max_wan) : undefined,
      sourceId: positiveId(filters.source),
      hasCrossBorder: typeof filters.has_crossborder === 'boolean' ? (filters.has_crossborder ? 1 : 0) : undefined,
      transformationWillingness: filters.transformation_willingness || undefined,
      usingErp: typeof filters.has_erp === 'boolean' ? (filters.has_erp ? 1 : 0) : undefined,
      automationLevelId: positiveId(filters.automation_level),
      localProcurementRatio: filters.local_procurement_ratio || undefined,
      logisticsPartnerIds: Array.isArray(filters.logistics_partners) && filters.logistics_partners.length > 0
        ? filters.logistics_partners.join(',')
        : undefined,
      mainPlatforms: Array.isArray(filters.main_platforms) && filters.main_platforms.length > 0 ? filters.main_platforms.join(',') : undefined,
      lastFollowupDays: typeof filters.last_followup_days === 'number' ? filters.last_followup_days : undefined,
      requirementIds: reqIds.length > 0 ? reqIds.join(',') : undefined,
      createdDateStart: entryDateRange?.[0],
      createdDateEnd: entryDateRange?.[1],
    };
  };

  const fetchData = async (filters?: Record<string, any>) => {
    setLoading(true);
    try {
      const params = buildParams(filters ?? advancedFilters);
      const [statsRes, trendRes] = await Promise.all([
        dashboardApi.getAnalysisStats(params),
        dashboardApi.getMonthlyTrend(),
      ]);
      const unwrap = (res: any) => {
        if (res == null || typeof res !== 'object') return null;
        return 'data' in res && res.data !== undefined ? res.data : res;
      };
      const statsPayload = unwrap(statsRes);
      setAnalysisStats(statsPayload != null && typeof statsPayload === 'object' ? statsPayload : null);
      const trendPayload = unwrap(trendRes);
      setMonthlyTrend(Array.isArray(trendPayload) ? trendPayload : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /** 顶部漏斗/区域/行业变更后自动刷新，避免仍显示旧图而被误认为「全库统计」 */
  const skipTopFilterAutoFetch = useRef(true);
  useEffect(() => {
    if (skipTopFilterAutoFetch.current) {
      skipTopFilterAutoFetch.current = false;
      return;
    }
    fetchData();
    // 仅响应顶部三项；关键词仍用「查询分析」
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageFilter, districtFilter, industryId]);

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      await dashboardApi.clearCache();
      message.success('缓存已清除，正在刷新数据...');
      await fetchData();
    } catch (e) {
      message.error('清除缓存失败');
    } finally {
      setClearingCache(false);
    }
  };

  const hasActiveValue = (v: any): boolean => {
    if (v === undefined || v === null || v === '') return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'object') return Object.values(v).some(hasActiveValue);
    return true;
  };

  const activeFilterCount = Object.values(advancedFilters).filter(hasActiveValue).length;

  const handleSearch = () => fetchData();
  const handleReset = () => {
    setKeyword('');
    setStageFilter(undefined);
    setDistrictFilter(undefined);
    setIndustryId(undefined);
    setAdvancedFilters({});
    filterForm.resetFields();
    fetchData({});
  };
  const handleApplyFilters = () => {
    const values = filterForm.getFieldsValue();
    const normalizedValues = {
      ...values,
      entry_date_range: normalizeEntryDateRange(values.entry_date_range),
    };
    const supported: Record<string, any> = {};
    Object.entries(normalizedValues).forEach(([k, v]) => { if (hasActiveValue(v)) supported[k] = v; });
    setAdvancedFilters(supported);
    setIsFilterModalOpen(false);
    fetchData(supported);
    message.success('筛选条件已应用');
  };
  const handleResetFilters = () => {
    filterForm.resetFields();
    setAdvancedFilters({});
    fetchData({});
    message.success('筛选条件已重置');
  };

  const totalCount = analysisStats?.totalCount ?? 0;
  const districtStats: { name: string; count: number }[] = analysisStats?.districtStats ?? [];
  const typeStats: { name: string; count: number }[] = analysisStats?.typeStats ?? [];
  const platformStats: { name: string; count: number }[] = analysisStats?.platformStats ?? [];
  const salesCountryMapStats: { name: string; count: number }[] = analysisStats?.salesCountryStats ?? [];
  const salesRegionStats: { name: string; count: number }[] = analysisStats?.salesRegionStats ?? [];
  const worldMapData = mapDisplayMode === 'country' ? salesCountryMapStats : salesRegionStats;
  const industryStats: { name: string; count: number }[] = analysisStats?.industryStats ?? [];
  const funnelStats: { code: string; name: string; count: number }[] = analysisStats?.funnelStats ?? [];
  const funnelMaxCount = funnelStats.length ? Math.max(...funnelStats.map(s => Number(s.count) || 0), 0) : 0;
  const funnelYAxisMax = Math.max(5, funnelMaxCount);

  /* ── 图表配置 ── */

  /** 漏斗阶段：与「行业分布」同款的纵向柱状图（改饼图之前的展示方式） */
  const funnelBarOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: '#1A1F27', borderColor: D.cardBorder, textStyle: { color: D.white } },
    grid: { left: '3%', right: '5%', bottom: '12%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: funnelStats.map(s => s.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: D.muted, fontSize: 11, rotate: funnelStats.length > 6 ? 30 : 0 },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: funnelYAxisMax,
      minInterval: 1,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: D.grid, type: 'dashed' } },
      axisLabel: { color: D.muted, fontSize: 11 },
    },
    series: [{
      name: '企业数',
      type: 'bar',
      barWidth: 16,
      barMaxWidth: 24,
      data: funnelStats.map((s, i) => ({
        value: s.count,
        itemStyle: { color: chartColors[i % chartColors.length], borderRadius: [4, 4, 0, 0] },
      })),
      label: { show: true, position: 'top', color: D.sub, fontSize: 11, fontWeight: 600 },
    }],
  };

  const industryBarOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: '#1A1F27', borderColor: D.cardBorder, textStyle: { color: D.white } },
    grid: { left: '3%', right: '5%', bottom: '12%', top: '8%', containLabel: true },
    xAxis: { type: 'category', data: industryStats.map(s => s.name), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: D.muted, fontSize: 11, rotate: industryStats.length > 6 ? 30 : 0 } },
    yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: D.grid, type: 'dashed' } }, axisLabel: { color: D.muted, fontSize: 11 } },
    series: [{ type: 'bar', barWidth: 16, barMaxWidth: 24, data: industryStats.map((s, i) => ({ value: s.count, itemStyle: { color: chartColors[i % chartColors.length], borderRadius: [4, 4, 0, 0] } })), label: { show: true, position: 'top', color: D.sub, fontSize: 11, fontWeight: 600 } }],
  };

  const trendOption = {
    tooltip: { trigger: 'axis', backgroundColor: '#1A1F27', borderColor: D.cardBorder, textStyle: { color: D.white } },
    legend: { data: ['新增企业', '新增签约'], top: 0, right: 10, textStyle: { color: D.sub, fontSize: 12 }, itemWidth: 12, itemHeight: 12 },
    grid: { left: '3%', right: '4%', bottom: '8%', top: '16%', containLabel: true },
    xAxis: { type: 'category', data: monthlyTrend.map(m => m.month), boundaryGap: false, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: D.muted, fontSize: 12 } },
    yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: D.grid, type: 'dashed' } }, axisLabel: { color: D.muted, fontSize: 11 } },
    series: [
      { name: '新增企业', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6, lineStyle: { width: 3, color: D.cyan }, itemStyle: { color: D.cyan }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(0,250,255,0.25)' }, { offset: 1, color: 'rgba(0,250,255,0)' }] } }, data: monthlyTrend.map(m => m.totalNew) },
      { name: '新增签约', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6, lineStyle: { width: 3, color: D.pink }, itemStyle: { color: D.pink }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(247,37,133,0.2)' }, { offset: 1, color: 'rgba(247,37,133,0)' }] } }, data: monthlyTrend.map(m => m.signedNew) },
    ],
  };

  const platformPieOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c}家 ({d}%)', backgroundColor: '#1A1F27', borderColor: D.cardBorder, textStyle: { color: D.white } },
    series: [{
      type: 'pie', radius: '75%', center: ['50%', '50%'],
      padAngle: 2, itemStyle: { borderColor: D.card, borderWidth: 3 },
      label: { show: true, position: 'inside', formatter: (p: any) => p.percent >= 10 ? `${p.percent}%` : '', fontSize: 12, fontWeight: 600, color: D.white },
      emphasis: { scaleSize: 6, label: { show: true, formatter: '{d}%\n{b}', fontSize: 13 }, itemStyle: { shadowBlur: 16, shadowColor: 'rgba(0,0,0,0.4)' } },
      data: platformStats.map((s, i) => ({ value: s.count, name: s.name, itemStyle: { color: chartColors[i % chartColors.length] } })),
    }],
  };

  const districtBarOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: '#1A1F27', borderColor: D.cardBorder, textStyle: { color: D.white } },
    grid: { left: '3%', right: '8%', bottom: '3%', top: '5%', containLabel: true },
    xAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false } },
    yAxis: { type: 'category', data: districtStats.map(d => d.name), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: D.sub, fontSize: 13 } },
    series: [{ type: 'bar', barWidth: 14, data: districtStats.map((d, i) => ({ value: d.count, itemStyle: { color: chartColors[i % chartColors.length], borderRadius: [0, 6, 6, 0] } })), label: { show: true, position: 'right', color: D.sub, fontSize: 12, fontWeight: 600 } }],
  };

  const typeDonutOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c}家 ({d}%)', backgroundColor: '#1A1F27', borderColor: D.cardBorder, textStyle: { color: D.white } },
    series: [{
      type: 'pie', radius: ['55%', '80%'], center: ['50%', '50%'],
      padAngle: 3, itemStyle: { borderColor: D.card, borderWidth: 3 },
      label: { show: true, position: 'outside', formatter: '{b}\n{d}%', fontSize: 12, color: D.sub, lineHeight: 16 },
      labelLine: { lineStyle: { color: D.muted } },
      emphasis: { scaleSize: 6, itemStyle: { shadowBlur: 16, shadowColor: 'rgba(0,0,0,0.4)' } },
      data: typeStats.map((s, i) => ({ value: s.count, name: s.name, itemStyle: { color: chartColors[i % chartColors.length] } })),
    }],
  };

  return (
    <div className="dark-analysis" style={{ background: D.bg, minHeight: '100vh', margin: '-28px -40px', padding: '28px 40px' }}>
      {/* ── 筛选区 ── */}
      <div style={{ ...cardStyle, marginBottom: 24 }} data-tour="data-analysis-filters">
        <div style={{ fontSize: 18, fontWeight: 600, color: D.white, marginBottom: 14 }}>基于筛选条件生成企业数据统计</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <EnterpriseSearch value={keyword} onChange={setKeyword} onSearch={handleSearch} style={{ width: 220 }} />
          <Select placeholder="漏斗阶段" value={stageFilter} onChange={v => { setStageFilter(v); }} allowClear style={{ width: 140 }} options={FUNNEL_STAGES.map(s => ({ label: s.name, value: s.code }))} />
          <Select placeholder="所属区域" value={districtFilter} onChange={v => { setDistrictFilter(v); }} allowClear style={{ width: 140 }} options={districts.map(d => ({ label: d, value: d }))} />
          <Select placeholder="所属行业" value={industryId} onChange={v => { setIndustryId(v); }} allowClear style={{ width: 160 }} options={industryOptions.map((o: any) => ({ label: o.name, value: o.id }))} />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} style={{ height: 36, borderRadius: 10, background: D.blue, border: 'none', padding: '0 20px' }}>查询分析</Button>
          <Badge count={activeFilterCount} size="small" offset={[-4, 0]}>
            <Button icon={<FilterOutlined />} onClick={() => setIsFilterModalOpen(true)} style={{ height: 36, borderRadius: 10, background: activeFilterCount > 0 ? D.blue : D.inactive, border: `1px solid ${activeFilterCount > 0 ? D.blue : '#3A4560'}`, color: activeFilterCount > 0 ? D.white : D.sub, padding: '0 20px' }}>
              高级筛选
            </Button>
          </Badge>
          <div style={{ flex: 1 }} />
          <Tooltip title="清除Redis缓存并刷新">
            <Button icon={<ClearOutlined />} loading={clearingCache} onClick={handleClearCache} style={{ height: 36, borderRadius: 10, background: D.inactive, border: '1px solid #3A4560', color: D.sub, padding: '0 20px' }}>清除缓存</Button>
          </Tooltip>
          <Button icon={<ReloadOutlined />} onClick={handleReset} style={{ height: 36, borderRadius: 10, background: D.inactive, border: '1px solid #3A4560', color: D.sub, padding: '0 20px' }}>重置</Button>

        </div>
      </div>

      {loading ? (
        <NeonLoader
          text="正在加载数据分析"
          subText="正在汇总当前筛选条件下的统计指标与图表数据..."
        />
      ) : (
        <>
          <div data-tour="data-analysis-summary">
            {/* ── 顶部指标卡 ── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
              {[
                { label: '筛选企业数', value: totalCount, unit: '家', color: D.cyan },
                { label: '已签约企业', value: funnelStats.find(s => s.code === 'SIGNED')?.count || 0, unit: '家', color: D.pink },
                { label: '覆盖行业', value: industryStats.filter(s => s.count > 0).length, unit: '个', color: D.purple },
                { label: '跨境平台', value: platformStats.length, unit: '个', color: D.teal },
              ].map(m => (
                <Col xs={12} lg={6} key={m.label}>
                  <div style={{ ...cardStyle, textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: D.sub, marginBottom: 8, letterSpacing: 1 }}>{m.label}</div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: m.color }}>{m.value}<span style={{ fontSize: 14, fontWeight: 400, color: D.sub, marginLeft: 4 }}>{m.unit}</span></div>
                  </div>
                </Col>
              ))}
            </Row>

            {/* ── 全球客户分布地图 ── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col span={24}>
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ flex: '1 1 200px' }}>
                      <div style={titleStyle}>全球客户分布</div>
                      <div style={subStyle}>
                        {mapDisplayMode === 'region'
                          ? '按企业主表「主要销售区域」汇总（字典大区，每家企业在同一区域计 1 次）· 飞线源点：常州'
                          : '按企业主表「主要销售国家」汇总（每家企业在同一国家计 1 次）· 飞线源点：常州'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      <Select<MapDisplayMode>
                        value={mapDisplayMode}
                        onSelect={(v) => setMapDisplayMode(v)}
                        style={{ minWidth: 180 }}
                        options={[
                          { label: '主要销售区域', value: 'region' },
                          { label: '主要销售国家', value: 'country' },
                        ]}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: D.sub }}>
                        <span style={{ width: 10, height: 10, borderRadius: 5, background: '#F72585', boxShadow: '0 0 6px rgba(247,37,133,0.6)' }} />常州（起点）
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: D.sub }}>
                        <span style={{ width: 10, height: 10, borderRadius: 5, background: '#00FAFF', boxShadow: '0 0 6px rgba(0,250,255,0.5)' }} />
                        {mapDisplayMode === 'region' ? '销售区域' : '销售国家'}
                      </div>
                    </div>
                  </div>
                  <WorldMap
                    key={`${mapDisplayMode}-${worldMapDataKey(worldMapData)}`}
                    data={worldMapData}
                  />
                </div>
              </Col>
            </Row>
          </div>

          <div data-tour="data-analysis-charts">
            {/* ── 漏斗阶段柱状图 + 月度趋势 ── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} lg={9}>
                <div style={cardStyle}>
                  <div style={titleStyle}>漏斗阶段分布</div>
                  <div style={subStyle}>当前筛选条件下各阶段企业数（与「筛选企业数」同源）</div>
                  <ReactECharts option={funnelBarOption} style={{ height: 320 }} />
                </div>
              </Col>
              <Col xs={24} lg={15}>
                <div style={cardStyle}>
                  <div style={titleStyle}>月度新增趋势</div>
                  <div style={subStyle}>最近12个月新增企业与签约数</div>
                  <ReactECharts option={trendOption} style={{ height: 320 }} />
                </div>
              </Col>
            </Row>

            {/* ── 第二行：行业分布 + 区域分布 ── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} lg={15}>
                <div style={cardStyle}>
                  <div style={titleStyle}>行业分布</div>
                  <div style={subStyle}>当前筛选结果内的一级行业企业数</div>
                  <ReactECharts option={industryBarOption} style={{ height: 300 }} />
                </div>
              </Col>
              <Col xs={24} lg={9}>
                <div style={cardStyle}>
                  <div style={titleStyle}>区域分布</div>
                  <div style={subStyle}>当前筛选结果内的区县企业数</div>
                  <ReactECharts option={districtBarOption} style={{ height: 300 }} />
                </div>
              </Col>
            </Row>

            {/* ── 平台分布 + 企业类型 ── */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <div style={cardStyle}>
                  <div style={titleStyle}>跨境平台分布</div>
                  <div style={subStyle}>当前筛选结果内企业填报的主要平台（多选字段拆分统计）</div>
                  {platformStats.length > 0 ? (
                    <>
                      <ReactECharts option={platformPieOption} style={{ height: 280 }} />
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
                        {platformStats.map((s, i) => (
                          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: D.sub }}>
                            <span style={{ width: 8, height: 8, borderRadius: 4, background: chartColors[i % chartColors.length], flexShrink: 0 }} />
                            {s.name}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: 60, color: D.muted }}>暂无跨境平台数据</div>
                  )}
                </div>
              </Col>
              <Col xs={24} lg={12}>
                <div style={cardStyle}>
                  <div style={titleStyle}>企业类型分布</div>
                  <div style={subStyle}>
                    {totalCount > 0
                      ? `当前筛选结果内共 ${totalCount.toLocaleString('zh-CN')} 家 · 饼图为该集合中的类型结构（非独立全库统计）`
                      : '调整筛选条件或点击「查询分析」后展示；无匹配企业时不显示占比'}
                  </div>
                  <ReactECharts option={typeDonutOption} style={{ height: 320 }} />
                </div>
              </Col>
            </Row>
          </div>
        </>
      )}
      {/* ── 高级筛选弹窗 ── */}
      <Modal
        maskClosable={false}
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FilterOutlined style={{ color: D.cyan }} /><span>高级筛选条件</span></div>}
        open={isFilterModalOpen}
        onCancel={() => setIsFilterModalOpen(false)}
        width={800}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={handleResetFilters}>重置全部</Button>
            <Space>
              <Button onClick={() => setIsFilterModalOpen(false)}>取消</Button>
              <Button type="primary" onClick={handleApplyFilters} style={{ background: D.blue, border: 'none', borderRadius: 12 }}>应用筛选</Button>
            </Space>
          </div>
        }
      >
        <Form form={filterForm} layout="vertical" style={{ marginTop: 16 }}>
          <Tabs items={[
            { key: 'basic', label: '基本信息', children: (
              <Row gutter={16}>
                <Col span={8}><Form.Item name="entry_date_range" label="录入时间"><DatePicker.RangePicker allowClear style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} /></Form.Item></Col>
                <Col span={8}><Form.Item name="enterprise_type" label="企业类型"><Select placeholder="请选择" allowClear options={ENTERPRISE_TYPE_OPTIONS} /></Form.Item></Col>
                <Col span={8}><Form.Item name="employee_scale" label="人员规模"><Select placeholder="请选择" allowClear options={staffSizeOptions} /></Form.Item></Col>
                <Col span={8}><Form.Item name="domestic_revenue" label="国内营收(万元)"><Select placeholder="请选择" allowClear options={domesticRevenueOptions} /></Form.Item></Col>
                <Col span={8}><Form.Item name="crossborder_revenue_min_wan" label="跨境营收≥(万元)"><InputNumber min={0} placeholder="最小" style={{ width: '100%' }} /></Form.Item></Col>
                <Col span={8}><Form.Item name="crossborder_revenue_max_wan" label="跨境营收≤(万元)"><InputNumber min={0} placeholder="最大" style={{ width: '100%' }} /></Form.Item></Col>
                <Col span={8}><Form.Item name="source" label="企业来源"><Select placeholder="请选择" allowClear options={sourceOptions} /></Form.Item></Col>
                <Col span={8}><Form.Item name="district" label="区县"><Select placeholder="请选择" allowClear options={districts.map(d => ({ label: d, value: d }))} /></Form.Item></Col>
              </Row>
            )},
            { key: 'product', label: '产品信息', children: (
              <Row gutter={16}>
                <Col span={8}><Form.Item name="automation_level" label="设备自动化程度"><Select placeholder="请选择" allowClear options={automationLevelOptions} /></Form.Item></Col>
                <Col span={8}><Form.Item name="logistics_partners" label="物流合作方"><Select mode="multiple" placeholder="请选择" allowClear options={logisticsOptions} /></Form.Item></Col>
                <Col span={8}><Form.Item name="local_procurement_ratio" label="本地采购比例"><Select placeholder="请选择" allowClear options={['90%以上', '70%-90%', '50%-70%', '30%-50%', '30%以下'].map(v => ({ label: v, value: v }))} /></Form.Item></Col>
              </Row>
            )},
            { key: 'crossborder', label: '跨境电商', children: (
              <Row gutter={16}>
                <Col span={8}><Form.Item name="has_crossborder" label="是否开展跨境电商"><Select placeholder="请选择" allowClear options={[{ label: '是', value: true }, { label: '否', value: false }]} /></Form.Item></Col>
                <Col span={8}><Form.Item name="main_platforms" label="主要跨境平台"><Select mode="multiple" placeholder="请选择" allowClear options={CROSSBORDER_PLATFORMS.map(p => ({ label: p, value: p }))} /></Form.Item></Col>
                <Col span={8}><Form.Item name="transformation_willingness" label="跨境转型意愿"><Select placeholder="请选择" allowClear options={TRANSFORMATION_WILLINGNESS.map(w => ({ label: w, value: w }))} /></Form.Item></Col>
                <Col span={8}><Form.Item name="has_erp" label="是否在用ERP"><Select placeholder="请选择" allowClear options={[{ label: '是', value: true }, { label: '否', value: false }]} /></Form.Item></Col>
              </Row>
            )},
            { key: 'followup', label: '跟进记录', children: (
              <Row gutter={16}>
                <Col span={8}><Form.Item name="funnel_stage" label="漏斗阶段"><Select placeholder="请选择" allowClear options={FUNNEL_STAGES.map(s => ({ label: s.name, value: s.code }))} /></Form.Item></Col>
                <Col span={8}><Form.Item name="last_followup_days" label="最近跟进时间"><Select placeholder="请选择" allowClear options={[{ label: '7天内', value: 7 }, { label: '15天内', value: 15 }, { label: '30天内', value: 30 }, { label: '超过30天', value: -30 }]} /></Form.Item></Col>
              </Row>
            )},
            { key: 'requirements', label: '需求分析', children: (
              <div>
                <div style={{ marginBottom: 12, color: '#666', fontSize: 13 }}>选择需求项，筛选具有相关需求的企业</div>
                {['战略规划与资源准备', '渠道搭建与商品上线', '营销推广与规模增长', '品牌深耕与持续优化'].map(phase => {
                  const phaseReqs = requirements.filter(r => r.phase === phase);
                  const cats = [...new Set(phaseReqs.map(r => r.category))];
                  return (
                    <div key={phase} style={{ marginBottom: 16 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, padding: '4px 10px', background: 'rgba(67,97,238,0.1)', color: D.blue, borderRadius: 6, display: 'inline-block' }}>{phase}</div>
                      <Row gutter={[12, 8]}>
                        {cats.map(cat => (
                          <Col span={12} key={cat}>
                            <Form.Item name={['requirements', `${phase}_${cat}`]} label={<span style={{ fontSize: 12, color: '#888' }}>{cat}</span>} style={{ marginBottom: 8 }}>
                              <Select mode="multiple" placeholder="选择需求" allowClear maxTagCount={2} options={phaseReqs.filter(r => r.category === cat).map(r => ({ label: `${r.id} ${r.name}`, value: r.id }))} />
                            </Form.Item>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  );
                })}
              </div>
            )},
          ]} />
        </Form>
      </Modal>
    </div>
  );
}

export default DataAnalysis;
