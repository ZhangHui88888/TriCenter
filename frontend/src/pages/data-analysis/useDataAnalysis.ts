import { useState, useEffect, useRef } from 'react';
import { App, Form } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { optionsApi, dashboardApi } from '@/services/api';
import { serializeFilterValues } from '@/utils/multiSelectFilters';
import type { AnalysisStats, MonthlyTrend } from './types';

type SelectOption = { label: string; value: any };
type EntryDateRange = [Dayjs, Dayjs];

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
  const dates = typeof start === 'string' && typeof end === 'string'
    ? toEntryDateRange(value) : value;
  if (!dates || !dayjs.isDayjs(dates[0]) || !dayjs.isDayjs(dates[1])) {
    return undefined;
  }
  return [dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')];
}

export function useDataAnalysis() {
  const { message } = App.useApp();
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

  const [analysisStats, setAnalysisStats] = useState<AnalysisStats | null>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
  const [clearingCache, setClearingCache] = useState(false);
  const latestRequest = useRef(0);

  useEffect(() => {
    Promise.all([
      optionsApi.getOptions('district'),
      optionsApi.getCategories(),
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
    }).catch(() => message.error('筛选选项加载失败，请刷新页面重试'));
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
      stage: serializeFilterValues(filters.funnel_stage) || stageFilter || undefined,
      district: filters.district || districtFilter || undefined,
      industryId: positiveId(industryId),
      enterpriseType: filters.enterprise_type || undefined,
      staffSizeId: positiveId(filters.employee_scale),
      domesticRevenueId: positiveId(filters.domestic_revenue),
      crossBorderRevenueMinWan: filters.crossborder_revenue_min_wan != null ? Number(filters.crossborder_revenue_min_wan) : undefined,
      crossBorderRevenueMaxWan: filters.crossborder_revenue_max_wan != null ? Number(filters.crossborder_revenue_max_wan) : undefined,
      sourceIds: serializeFilterValues(filters.source),
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

  const fetchData = async (filters?: Record<string, any>, resetTopFilters = false) => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    try {
      const params = resetTopFilters ? {} : buildParams(filters ?? advancedFilters);
      const [statsRes, trendRes] = await Promise.all([
        dashboardApi.getAnalysisStats(params),
        dashboardApi.getMonthlyTrend(),
      ]);
      if (requestId !== latestRequest.current) return;
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
      if (requestId === latestRequest.current) setLoading(false);
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
    if (stageFilter !== undefined || districtFilter !== undefined || industryId !== undefined) {
      skipTopFilterAutoFetch.current = true;
    }
    setKeyword('');
    setStageFilter(undefined);
    setDistrictFilter(undefined);
    setIndustryId(undefined);
    setAdvancedFilters({});
    filterForm.resetFields();
    fetchData({}, true);
  };
  const handleApplyFilters = () => {
    const values = filterForm.getFieldsValue(true);
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

  return {
    loading, keyword, setKeyword, stageFilter, setStageFilter, districtFilter, setDistrictFilter,
    industryId, setIndustryId, isFilterModalOpen, setIsFilterModalOpen, filterForm, activeFilterCount,
    districts, industryOptions, staffSizeOptions, domesticRevenueOptions, sourceOptions,
    automationLevelOptions, logisticsOptions, analysisStats, monthlyTrend, clearingCache,
    handleSearch, handleReset, handleClearCache, handleApplyFilters, handleResetFilters,
  };
}
