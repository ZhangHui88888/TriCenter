import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Modal,
  Form,
  Row,
  Col,
  Typography,
  message,
  Progress,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  InboxOutlined,
  FilterOutlined,
  CloseCircleOutlined,
  ArrowRightOutlined,
  RiseOutlined,
  LoadingOutlined,
  FileExcelOutlined,
  DeleteOutlined,
  SwapOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Upload, Tabs, Badge, Radio } from 'antd';
import ReactECharts from 'echarts-for-react';
import type { ColumnsType } from 'antd/es/table';
import { requirements } from '@/data/requirementsData';
import {
  ENTERPRISE_TYPES,
  ENTERPRISE_SOURCES,
  EMPLOYEE_SCALES,
  REVENUE_SCALES,
  CROSSBORDER_PLATFORMS,
  TRANSFORMATION_WILLINGNESS,
} from '@/utils/constants';
import { enterpriseApi, optionsApi, dashboardApi, surveyExcelApi } from '@/services/api';
import { exportEnterpriseListExcel } from '@/utils/exportEnterpriseListExcel';
import type { Enterprise } from '@/types';

const { Title, Text } = Typography;

type SelectOption = {
  label: string;
  value: number;
};

type EnterpriseListQueryParams = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  stage?: string;
  district?: string;
  industryId?: number;
  province?: string;
  city?: string;
  enterpriseType?: string;
  staffSizeId?: number;
  domesticRevenueId?: number;
  crossBorderRevenueId?: number;
  sourceId?: number;
  hasCrossBorder?: number;
  transformationWillingness?: string;
  usingErp?: number;
  automationLevelId?: number;
  localProcurementRatio?: string;
  logisticsPartnerIds?: string;
  lastFollowupDays?: number;
  requirementIds?: string;
  mainPlatforms?: string;
  targetMarkets?: string;
};

// 漏斗阶段配置
const FUNNEL_STAGES = [
  { code: 'POTENTIAL', name: '潜在企业', color: '#94a3b8' },
  { code: 'NO_DEMAND', name: '无明确需求', color: '#fbbf24' },
  { code: 'NO_INTENTION', name: '没有合作意向', color: '#ef4444' },
  { code: 'HAS_DEMAND', name: '有明确需求', color: '#3b82f6' },
  { code: 'SIGNED', name: '已签约', color: '#8b5cf6' },
  { code: 'SETTLED', name: '已入驻', color: '#10b981' },
  { code: 'INCUBATING', name: '重点孵化', color: '#f97316' },
];

function EnterpriseList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('');
  const [districtFilter, setDistrictFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [industryFilter, setIndustryFilter] = useState<number | undefined>();
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<'list' | 'survey'>('list');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [batchStageModalOpen, setBatchStageModalOpen] = useState(false);
  const [batchStage, setBatchStage] = useState<string>('');
  const [batchReason, setBatchReason] = useState<string>('');
  
  // API数据状态
  const [loading, setLoading] = useState(true);
  const [enterprises, setEnterprises] = useState<any[]>([]);
  const [_total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [districts, setDistricts] = useState<string[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);
  const [staffSizeOptions, setStaffSizeOptions] = useState<SelectOption[]>([]);
  const [domesticRevenueOptions, setDomesticRevenueOptions] = useState<SelectOption[]>([]);
  const [crossBorderRevenueOptions, setCrossBorderRevenueOptions] = useState<SelectOption[]>([]);
  const [sourceOptions, setSourceOptions] = useState<SelectOption[]>([]);
  const [automationLevelOptions, setAutomationLevelOptions] = useState<SelectOption[]>([]);
  const [logisticsOptions, setLogisticsOptions] = useState<SelectOption[]>([]);
  const [funnelStats, setFunnelStats] = useState<any[]>([]);
  
  const buildListParams = (
    currentPage = page,
    currentPageSize = pageSize,
    filters = advancedFilters
  ): EnterpriseListQueryParams => {
    const requirementIds = filters.requirements && typeof filters.requirements === 'object'
      ? Array.from(new Set(
          Object.values(filters.requirements)
            .flatMap((value) => Array.isArray(value) ? value : [])
        ))
      : [];

    return ({
    page: currentPage,
    pageSize: currentPageSize,
    keyword: searchTerm || undefined,
    stage: filters.funnel_stage || stageFilter || undefined,
    district: filters.district || districtFilter || undefined,
    industryId: industryFilter,
    province: filters.province || undefined,
    city: filters.city || undefined,
    enterpriseType: filters.enterprise_type || undefined,
    staffSizeId: filters.employee_scale || undefined,
    domesticRevenueId: filters.domestic_revenue || undefined,
    crossBorderRevenueId: filters.crossborder_revenue || undefined,
    sourceId: filters.source || undefined,
    hasCrossBorder: typeof filters.has_crossborder === 'boolean'
      ? (filters.has_crossborder ? 1 : 0)
      : undefined,
    transformationWillingness: filters.transformation_willingness || undefined,
    usingErp: typeof filters.has_erp === 'boolean'
      ? (filters.has_erp ? 1 : 0)
      : undefined,
    automationLevelId: filters.automation_level || undefined,
    localProcurementRatio: filters.local_procurement_ratio || undefined,
    logisticsPartnerIds: Array.isArray(filters.logistics_partners) && filters.logistics_partners.length > 0
      ? filters.logistics_partners.join(',')
      : undefined,
    lastFollowupDays: filters.last_followup_days || undefined,
    requirementIds: requirementIds.length > 0
      ? requirementIds.join(',')
      : undefined,
    mainPlatforms: Array.isArray(filters.main_platforms) && filters.main_platforms.length > 0
      ? filters.main_platforms.join(',')
      : undefined,
    targetMarkets: Array.isArray(filters.target_markets) && filters.target_markets.length > 0
      ? filters.target_markets.join(',')
      : undefined,
    });
  };

  const normalizeListField = (value: any) => {
    if (Array.isArray(value)) {
      return value
        .map((item: any) => {
          if (typeof item === 'string') return item;
          if (item?.market) return item.market;
          if (item?.name) return item.name;
          return '';
        })
        .filter(Boolean)
        .join(',');
    }
    return value;
  };

  // 加载企业列表
  const fetchEnterprises = async (
    currentPage = page,
    currentPageSize = pageSize,
    filters = advancedFilters
  ) => {
    setLoading(true);
    try {
      const response = await enterpriseApi.getList(buildListParams(currentPage, currentPageSize, filters));
      if (response.data) {
        // 转换字段名
        const list = (response.data.list || []).map((item: any) => ({
          id: item.id,
          enterprise_name: item.name,
          district: item.district,
          industry: item.industryName,
          enterprise_type: item.enterpriseType,
          funnel_stage: item.stage,
          contacts: item.contacts || [],
          has_crossborder: item.hasCrossBorder,
          main_platforms: normalizeListField(item.crossBorderPlatforms),
          target_markets: normalizeListField(item.targetMarkets),
          created_at: item.createdAt,
        }));
        setEnterprises(list);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch enterprises:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 加载选项数据
  const fetchOptions = async () => {
    try {
      const [districtRes, industryRes, funnelRes, staffSizeRes, domesticRevenueRes, crossBorderRevenueRes, sourceRes, automationLevelRes, logisticsRes] = await Promise.all([
        optionsApi.getOptions('district'),
        optionsApi.getIndustries(),
        dashboardApi.getFunnelStats(),
        optionsApi.getOptions('staff_size'),
        optionsApi.getOptions('domestic_revenue'),
        optionsApi.getOptions('cross_border_revenue'),
        optionsApi.getOptions('source'),
        optionsApi.getOptions('automation_level'),
        optionsApi.getOptions('logistics'),
      ]);
      
      // 区域选项
      if (districtRes.data) {
        setDistricts(districtRes.data.map((d: any) => d.label));
      }
      
      // 行业选项（扁平化处理）
      if (industryRes.data) {
        const flatIndustries: any[] = [];
        const flatten = (items: any[]) => {
          items.forEach(item => {
            flatIndustries.push({ id: item.id, name: item.name });
            if (item.children) flatten(item.children);
          });
        };
        flatten(industryRes.data);
        setIndustries(flatIndustries);
      }

      if (staffSizeRes.data) {
        setStaffSizeOptions(staffSizeRes.data.map((item: any) => ({ label: item.label, value: item.id })));
      }

      if (domesticRevenueRes.data) {
        setDomesticRevenueOptions(domesticRevenueRes.data.map((item: any) => ({ label: item.label, value: item.id })));
      }

      if (crossBorderRevenueRes.data) {
        setCrossBorderRevenueOptions(crossBorderRevenueRes.data.map((item: any) => ({ label: item.label, value: item.id })));
      }

      if (sourceRes.data) {
        setSourceOptions(sourceRes.data.map((item: any) => ({ label: item.label, value: item.id })));
      }

      if (automationLevelRes.data) {
        setAutomationLevelOptions(automationLevelRes.data.map((item: any) => ({ label: item.label, value: item.id })));
      }

      if (logisticsRes.data) {
        setLogisticsOptions(logisticsRes.data.map((item: any) => ({ label: item.label, value: item.id })));
      }
      
      // 漏斗统计
      if (funnelRes.data) {
        setFunnelStats(funnelRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch options:', error);
    }
  };
  
  useEffect(() => {
    fetchOptions();
    fetchEnterprises(1, pageSize, {});
  }, []);
  
  // 搜索
  const handleSearch = () => {
    setPage(1);
    fetchEnterprises(1, pageSize);
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的企业');
      return;
    }
    Modal.confirm({
      title: '批量删除确认',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除选中的 ${selectedRowKeys.length} 家企业吗？此操作不可恢复。`,
      okText: '确定删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await enterpriseApi.batchDelete(selectedRowKeys as number[]);
          message.success(`成功删除 ${res.data} 家企业`);
          setSelectedRowKeys([]);
          fetchEnterprises();
          dashboardApi.getFunnelStats().then(r => r.data && setFunnelStats(r.data));
        } catch {
          message.error('批量删除失败');
        }
      },
    });
  };

  // 批量变更阶段
  const handleBatchStageChange = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要变更阶段的企业');
      return;
    }
    setBatchStage('');
    setBatchReason('');
    setBatchStageModalOpen(true);
  };

  const handleBatchStageOk = async () => {
    if (!batchStage) {
      message.warning('请选择目标阶段');
      return;
    }
    try {
      const res = await enterpriseApi.batchChangeStage(
        selectedRowKeys as number[], batchStage, batchReason || undefined
      );
      message.success(`成功变更 ${res.data} 家企业阶段`);
      setSelectedRowKeys([]);
      setBatchStageModalOpen(false);
      fetchEnterprises();
      dashboardApi.getFunnelStats().then(r => r.data && setFunnelStats(r.data));
    } catch {
      message.error('批量变更阶段失败');
    }
  };

  const supportedAdvancedFilterKeys = new Set([
    'province',
    'city',
    'district',
    'enterprise_type',
    'employee_scale',
    'domestic_revenue',
    'crossborder_revenue',
    'source',
    'automation_level',
    'local_procurement_ratio',
    'logistics_partners',
    'has_crossborder',
    'transformation_willingness',
    'main_platforms',
    'target_markets',
    'funnel_stage',
    'last_followup_days',
    'requirements',
    'has_erp',
  ]);

  const advancedFilterLabels: Record<string, string> = {
    province: '省份',
    city: '城市',
    district: '区县',
    enterprise_type: '企业类型',
    employee_scale: '人员规模',
    domestic_revenue: '国内营收',
    crossborder_revenue: '跨境营收',
    source: '企业来源',
    automation_level: '设备自动化程度',
    local_procurement_ratio: '原材料本地采购比例',
    logistics_partners: '物流合作方',
    has_crossborder: '是否开展跨境电商',
    transformation_willingness: '跨境转型意愿',
    main_platforms: '主要跨境平台',
    target_markets: '目标市场',
    funnel_stage: '漏斗阶段',
    has_erp: '是否在用ERP',
    has_foreign_trade: '是否开展外贸',
    trade_mode: '外贸模式',
    export_qualification: '进出口资质',
    export_markets: '主要出口市场',
    trade_team_mode: '外贸业务团队模式',
    trade_team_size: '外贸团队人数',
    annual_export_volume: '年出口额',
    trade_experience_years: '外贸经验年限',
    crossborder_team_size: '跨境团队规模',
    logistics_mode: '跨境物流模式',
    payment_method: '支付结算方式',
    last_followup_days: '最近跟进时间',
    requirements: '需求分析',
  };

  const hasActiveFilterValue = (value: any): boolean => {
    if (value === undefined || value === null || value === '') {
      return false;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (typeof value === 'object') {
      return Object.values(value).some(hasActiveFilterValue);
    }
    return true;
  };

  const splitAdvancedFilters = (values: Record<string, any>) => {
    const supported: Record<string, any> = {};
    const ignoredKeys: string[] = [];

    Object.entries(values).forEach(([key, value]) => {
      if (!hasActiveFilterValue(value)) {
        return;
      }

      if (supportedAdvancedFilterKeys.has(key)) {
        supported[key] = value;
      } else {
        ignoredKeys.push(key);
      }
    });

    return { supported, ignoredKeys };
  };

  // 计算已应用的筛选条件数量
  const activeFilterCount = Object.values(advancedFilters).filter(hasActiveFilterValue).length;

  const getStageInfo = (code: string) => {
    const stage = FUNNEL_STAGES.find(s => s.code === code);
    if (!stage) return { name: code, color: '#94a3b8', gradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' };
    
    const gradientMap: Record<string, string> = {
      'INITIAL': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'POTENTIAL': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'NO_DEMAND': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      'NO_INTENTION': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      'HAS_DEMAND': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'NEGOTIATING': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'SIGNED': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'SETTLED': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'INCUBATING': 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
      'CHURNED': 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    };
    
    return { ...stage, gradient: gradientMap[code] || stage.color };
  };

  // 使用API返回的数据
  const filteredEnterprises = enterprises;
  
  // 应用高级筛选
  const handleApplyFilters = () => {
    const values = filterForm.getFieldsValue();
    const { supported, ignoredKeys } = splitAdvancedFilters(values);
    if (ignoredKeys.length > 0) {
      const sanitizedValues = { ...values };
      ignoredKeys.forEach((key) => {
        sanitizedValues[key] = undefined;
      });
      filterForm.setFieldsValue(sanitizedValues);
    }
    setAdvancedFilters(supported);
    setIsFilterModalOpen(false);
    setPage(1);
    fetchEnterprises(1, pageSize, supported);
    if (ignoredKeys.length > 0) {
      message.warning(`已应用可用筛选；以下条件当前列表暂不支持：${ignoredKeys.map((key) => advancedFilterLabels[key] || key).join('、')}`);
      return;
    }
    message.success('筛选条件已应用');
  };
  
  // 重置高级筛选
  const handleResetFilters = () => {
    filterForm.resetFields();
    setAdvancedFilters({});
    setPage(1);
    fetchEnterprises(1, pageSize, {});
    message.success('筛选条件已重置');
  };

  // 数据分析 - 使用API返回的漏斗统计数据
  const filteredStageStats = funnelStats.length > 0 ? funnelStats : FUNNEL_STAGES.map(stage => ({
    ...stage,
    count: filteredEnterprises.filter(e => e.funnel_stage === stage.code).length,
  }));
  
  const totalFilteredEnterprises = filteredEnterprises.length;
  const filteredSignedCount = filteredEnterprises.filter(e => e.funnel_stage === 'SIGNED').length;
  const filteredSettledCount = filteredEnterprises.filter(e => e.funnel_stage === 'SETTLED').length;
  const filteredIncubatingCount = filteredEnterprises.filter(e => e.funnel_stage === 'INCUBATING').length;
  
  const overallConversionRate = totalFilteredEnterprises > 0 
    ? ((filteredSignedCount + filteredSettledCount + filteredIncubatingCount) / totalFilteredEnterprises * 100).toFixed(1) 
    : '0.0';
  const settlementRate = filteredSignedCount > 0 
    ? (filteredSettledCount / filteredSignedCount * 100).toFixed(1) 
    : '0.0';

  // 平台分布统计 - 基于筛选后的企业数据
  const platformColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  const platformStats = (() => {
    const platformMap = new Map<string, number>();
    filteredEnterprises.forEach(e => {
      if (e.main_platforms) {
        e.main_platforms.split(',').forEach((platform: string) => {
          const p = platform.trim();
          if (p) platformMap.set(p, (platformMap.get(p) || 0) + 1);
        });
      }
    });
    return Array.from(platformMap.entries())
      .map(([name, value], index) => ({ name, value, itemStyle: { color: platformColors[index % platformColors.length] } }))
      .sort((a, b) => b.value - a.value);
  })();

  // 市场分布统计 - 基于筛选后的企业目标地区
  const marketColors = ['#6366f1', '#22c55e', '#eab308', '#f97316', '#ec4899', '#14b8a6', '#a855f7', '#f43f5e'];
  const targetMarketStats = (() => {
    const marketMap = new Map<string, number>();
    filteredEnterprises.forEach(e => {
      if (e.target_markets) {
        e.target_markets.split(',').forEach((market: string) => {
          const m = market.trim();
          if (m) marketMap.set(m, (marketMap.get(m) || 0) + 1);
        });
      }
    });
    return Array.from(marketMap.entries())
      .map(([name, value], index) => ({ name, value, itemStyle: { color: marketColors[index % marketColors.length] } }))
      .sort((a, b) => b.value - a.value);
  })();

  // 调整颜色亮度的辅助函数
  function adjustColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.slice(0, 2), 16) + amount);
    const g = Math.min(255, parseInt(hex.slice(2, 4), 16) + amount);
    const b = Math.min(255, parseInt(hex.slice(4, 6), 16) + amount);
    return `rgb(${r}, ${g}, ${b})`;
  }

  // 漏斗柱状图配置 - 使用筛选后的数据
  const funnelOption = {
    tooltip: { 
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: Array<{ name: string; value: number; color: string }>) => {
        const item = params[0];
        return `<div style="font-weight:500">${item.name}</div><div style="color:${item.color};font-size:16px;font-weight:600">${item.value}家</div>`;
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
    },
    grid: { left: '3%', right: '8%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: filteredStageStats.map(s => s.name),
      axisLabel: { interval: 0, fontSize: 11, color: '#666' },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#999', fontSize: 11 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
    },
    series: [{
      type: 'bar',
      barWidth: '50%',
      data: filteredStageStats.map(stage => ({
        value: stage.count,
        itemStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: stage.color }, { offset: 1, color: adjustColor(stage.color, 30) }] },
          borderRadius: [6, 6, 0, 0],
        },
      })),
      label: { show: true, position: 'top', formatter: '{c}家', fontSize: 12, fontWeight: 600, color: '#333' },
    }],
  };

  // 平台分布饼状图配置
  const platformPieOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}家 ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
    },
    legend: { show: false },
    series: [{
      type: 'pie',
      radius: ['35%', '65%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { 
        show: true, 
        formatter: '{b}\n{c}家',
        fontSize: 11,
        color: '#333',
        lineHeight: 16,
      },
      labelLine: { show: true, length: 10, length2: 8 },
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.2)' },
      },
      data: platformStats.length > 0 ? platformStats : [{ name: '暂无数据', value: 1, itemStyle: { color: '#e5e7eb' } }],
    }],
  };

  // 市场分布饼状图配置
  const targetMarketPieOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}家 ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
    },
    legend: { show: false },
    series: [{
      type: 'pie',
      radius: ['35%', '65%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { 
        show: true, 
        formatter: '{b}\n{c}家',
        fontSize: 11,
        color: '#333',
        lineHeight: 16,
      },
      labelLine: { show: true, length: 10, length2: 8 },
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.2)' },
      },
      data: targetMarketStats.length > 0 ? targetMarketStats : [{ name: '暂无数据', value: 1, itemStyle: { color: '#e5e7eb' } }],
    }],
  };

  const columns: ColumnsType<Enterprise> = [
    {
      title: '企业名称',
      dataIndex: 'enterprise_name',
      key: 'enterprise_name',
      render: (text, record) => (
        <div style={{ padding: '4px 0' }}>
          <div style={{ 
            fontWeight: 600, 
            fontSize: 14,
            color: '#1a1a2e',
            marginBottom: 4
          }}>
            {text}
          </div>
          <div style={{ 
            fontSize: 12, 
            color: '#8c8c8c',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <span style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
            }} />
            {record.contacts[0]?.phone}
          </div>
        </div>
      ),
    },
    {
      title: '区域',
      dataIndex: 'district',
      key: 'district',
      width: 100,
      render: (text) => (
        <span style={{ 
          color: '#555',
          fontSize: 13
        }}>
          {text}
        </span>
      ),
    },
    {
      title: '行业',
      dataIndex: 'industry',
      key: 'industry',
      width: 100,
      render: (text) => (
        <span style={{ 
          color: '#555',
          fontSize: 13
        }}>
          {text}
        </span>
      ),
    },
    {
      title: '类型',
      dataIndex: 'enterprise_type',
      key: 'enterprise_type',
      width: 100,
      render: (text) => (
        <span style={{
          padding: '4px 10px',
          borderRadius: 6,
          background: 'rgba(102, 126, 234, 0.08)',
          color: '#667eea',
          fontSize: 12,
          fontWeight: 500
        }}>
          {text}
        </span>
      ),
    },
    {
      title: '漏斗阶段',
      dataIndex: 'funnel_stage',
      key: 'funnel_stage',
      width: 130,
      render: (stage: string) => {
        const info = getStageInfo(stage);
        return (
          <span style={{
            display: 'inline-block',
            padding: '5px 12px',
            borderRadius: 20,
            background: info.gradient,
            color: '#fff',
            fontSize: 12,
            fontWeight: 500,
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}>
            {info.name}
          </span>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="text"
            icon={<EyeOutlined style={{ color: '#667eea' }} />}
            onClick={() => navigate(`/enterprise/${record.id}`)}
            style={{ 
              borderRadius: 8,
              width: 32,
              height: 32
            }}
          />
          <Button 
            type="text" 
            icon={<EditOutlined style={{ color: '#43e97b' }} />}
            style={{ 
              borderRadius: 8,
              width: 32,
              height: 32
            }}
          />
        </Space>
      ),
    },
  ];

  const handleAddEnterprise = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    try {
      // 调用API创建空白企业
      const response = await enterpriseApi.create({});
      // request拦截器已经解包，response就是 { code, message, data }
      const newEnterpriseId = response.data?.id;
      
      if (newEnterpriseId) {
        message.success('企业创建成功，正在跳转...');
        // 跳转到企业详情页
        navigate(`/enterprise/${newEnterpriseId}`);
      } else {
        message.error('创建企业失败');
      }
    } catch (error: any) {
      message.error(error.message || '创建企业失败');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24,
        padding: '0 4px'
      }}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 700 }}>企业管理</Title>
          <Text type="secondary">管理和查看所有企业信息</Text>
        </div>
        <Space size={12}>
          <Button 
            icon={<UploadOutlined />} 
            onClick={() => setIsImportModalOpen(true)}
            style={{ 
              borderRadius: 10,
              height: 40,
              fontWeight: 500
            }}
          >
            导入
          </Button>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={() => setIsExportModalOpen(true)}
            style={{ 
              borderRadius: 10,
              height: 40,
              fontWeight: 500
            }}
          >
            导出
          </Button>
          <Button 
            type="primary" 
            icon={isCreating ? <LoadingOutlined /> : <PlusOutlined />} 
            onClick={handleAddEnterprise}
            loading={isCreating}
            style={{ 
              borderRadius: 10,
              height: 40,
              fontWeight: 500,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
          >
            新增企业
          </Button>
        </Space>
      </div>

      <Card 
        style={{ 
          marginBottom: 16, 
          borderRadius: 16, 
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
        }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <Space wrap size={16}>
          <Input
            placeholder="搜索企业名称..."
            prefix={<SearchOutlined style={{ color: '#999' }} />}
            style={{ 
              width: 280,
              borderRadius: 10,
              height: 40
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
          <Select
            placeholder="所属阶段"
            style={{ width: 140, height: 40 }}
            allowClear
            value={stageFilter || undefined}
            onChange={(value) => setStageFilter(value || '')}
            options={FUNNEL_STAGES.map(s => ({ label: s.name, value: s.code }))}
          />
          <Select
            placeholder="所属区域"
            style={{ width: 130, height: 40 }}
            allowClear
            value={districtFilter || undefined}
            onChange={(value) => setDistrictFilter(value || '')}
            options={districts.map(d => ({ label: d, value: d }))}
          />
          <Select
            placeholder="所属行业"
            style={{ width: 130, height: 40 }}
            allowClear
            value={industryFilter}
            onChange={(value) => setIndustryFilter(value)}
            options={industries.map(i => ({ label: i.name, value: i.id }))}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            style={{
              borderRadius: 10,
              height: 40,
              fontWeight: 500,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
            }}
          >
            搜索
          </Button>
          <Badge count={activeFilterCount} size="small" offset={[-5, 5]}>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setIsFilterModalOpen(true)}
              style={{
                borderRadius: 10,
                height: 40,
                fontWeight: 500,
                borderColor: activeFilterCount > 0 ? '#667eea' : undefined,
                color: activeFilterCount > 0 ? '#667eea' : undefined,
              }}
            >
              高级筛选
            </Button>
          </Badge>
          {activeFilterCount > 0 && (
            <Button
              type="text"
              icon={<CloseCircleOutlined />}
              onClick={handleResetFilters}
              style={{ color: '#999', height: 40 }}
            >
              清除筛选
            </Button>
          )}
        </Space>
      </Card>

      <Card
        style={{ 
          borderRadius: 16, 
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
        }}
        styles={{ body: { padding: '8px 0' } }}
      >
        {selectedRowKeys.length > 0 && (
          <div style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%)',
            borderBottom: '1px solid #d6e4ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Text>
              已选择 <Text strong style={{ color: '#667eea' }}>{selectedRowKeys.length}</Text> 家企业
            </Text>
            <Space>
              <Button
                icon={<SwapOutlined />}
                onClick={handleBatchStageChange}
                style={{ borderRadius: 8 }}
              >
                批量变更阶段
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleBatchDelete}
                style={{ borderRadius: 8 }}
              >
                批量删除
              </Button>
              <Button
                type="text"
                onClick={() => setSelectedRowKeys([])}
                style={{ color: '#999' }}
              >
                取消选择
              </Button>
            </Space>
          </div>
        )}
        <Table
          columns={columns}
          dataSource={filteredEnterprises}
          rowKey="id"
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          pagination={{
            current: page,
            total: _total,
            pageSize: pageSize,
            onChange: (current, size) => {
              const nextPageSize = size || pageSize;
              const nextPage = nextPageSize !== pageSize ? 1 : current;
              setPage(nextPage);
              setPageSize(nextPageSize);
              fetchEnterprises(nextPage, nextPageSize);
            },
            onShowSizeChange: (_, size) => {
              setPage(1);
              setPageSize(size);
              fetchEnterprises(1, size);
            },
            showTotal: (total) => (
              <span style={{ color: '#666' }}>
                共 <span style={{ color: '#667eea', fontWeight: 600 }}>{total}</span> 条记录
              </span>
            ),
            showSizeChanger: true,
            style: { padding: '16px 24px' }
          }}
          style={{ 
            borderRadius: 12
          }}
          rowClassName={() => 'custom-table-row'}
        />
      </Card>

      {/* 数据分析区域 */}
      <div style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <Title level={5} style={{ margin: 0, fontWeight: 600 }}>数据分析</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>基于当前筛选条件的企业数据统计分析</Text>
        </div>
        <Row gutter={[16, 16]}>
          {/* 第一行：阶段分布 + 关键指标 */}
          <Col xs={24} lg={14}>
            <Card 
              title="阶段分布" 
              style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', height: '100%' }}
            >
              <ReactECharts option={funnelOption} style={{ height: 240 }} />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card 
              title="关键指标" 
              style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', height: '100%' }}
              styles={{ body: { display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 'calc(100% - 57px)' } }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ textAlign: 'center', padding: '20px 0', background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)', borderRadius: 12 }}>
                  <div style={{ fontSize: 13, color: '#1890ff', marginBottom: 8, fontWeight: 500 }}>筛选企业数</div>
                  <div style={{ fontSize: 36, fontWeight: 700, color: '#1890ff' }}>{totalFilteredEnterprises}<span style={{ fontSize: 16, fontWeight: 500 }}>家</span></div>
                </div>
                <Row gutter={12}>
                  <Col span={12}>
                    <div style={{ textAlign: 'center', padding: '16px 0', background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)', borderRadius: 12 }}>
                      <div style={{ fontSize: 12, color: '#52c41a', marginBottom: 6, fontWeight: 500 }}><RiseOutlined /> 整体转化</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a' }}>{overallConversionRate}%</div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ textAlign: 'center', padding: '16px 0', background: 'linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)', borderRadius: 12 }}>
                      <div style={{ fontSize: 12, color: '#722ed1', marginBottom: 6, fontWeight: 500 }}>入驻转化</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#722ed1' }}>{settlementRate}%</div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
          {/* 第二行：平台分布 + 市场分布 */}
          <Col xs={24} lg={12}>
            <Card 
              title="平台分布" 
              style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            >
              <ReactECharts option={platformPieOption} style={{ height: 260 }} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card 
              title="市场分布" 
              style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            >
              <ReactECharts option={targetMarketPieOption} style={{ height: 260 }} />
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card 
              title="阶段转化率" 
              style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {(() => {
                  const conversionPaths = [
                    { from: 'POTENTIAL', to: 'NO_DEMAND' },
                    { from: 'POTENTIAL', to: 'HAS_DEMAND' },
                    { from: 'NO_DEMAND', to: 'NO_INTENTION', isNegative: true },
                    { from: 'NO_DEMAND', to: 'HAS_DEMAND' },
                    { from: 'HAS_DEMAND', to: 'SIGNED' },
                    { from: 'SIGNED', to: 'SETTLED' },
                    { from: 'SETTLED', to: 'INCUBATING' },
                  ];
                  return conversionPaths.map((path) => {
                    const fromStage = filteredStageStats.find(s => s.code === path.from);
                    const toStage = filteredStageStats.find(s => s.code === path.to);
                    if (!fromStage || !toStage) return null;
                    const rate = fromStage.count > 0 ? (toStage.count / fromStage.count) * 100 : 0;
                    return (
                      <div key={`${path.from}-${path.to}`} style={{ 
                        flex: '1 1 calc(50% - 6px)', minWidth: 280,
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px', borderRadius: 8,
                        background: path.isNegative 
                          ? 'linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(0,0,0,0) 100%)'
                          : 'linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 100%)',
                      }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: fromStage.color }} />
                        <span style={{ width: 70, fontSize: 12, fontWeight: 500 }}>{fromStage.name}</span>
                        <ArrowRightOutlined style={{ color: path.isNegative ? '#ef4444' : '#bbb', fontSize: 10 }} />
                        <span style={{ width: 80, fontSize: 12, color: path.isNegative ? '#ef4444' : '#666' }}>{toStage.name}</span>
                        <div style={{ flex: 1, minWidth: 60 }}>
                          <Progress percent={Math.min(Number(rate.toFixed(1)), 100)} size="small" 
                            strokeColor={path.isNegative ? '#ef4444' : { '0%': fromStage.color, '100%': toStage.color }}
                            trailColor="#f0f0f0" style={{ margin: 0 }} />
                        </div>
                        <span style={{ width: 50, textAlign: 'right', fontWeight: 600, color: path.isNegative ? '#ef4444' : '#333', fontSize: 12 }}>{rate.toFixed(1)}%</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <Modal
        title="新增企业"
        open={isModalOpen}
        onOk={handleAddEnterprise}
        onCancel={() => setIsModalOpen(false)}
        width={900}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="enterprise_name" label="企业名称" rules={[{ required: true, message: '请输入企业名称' }]}>
                <Input placeholder="请输入企业名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="unified_credit_code" label="统一社会信用代码">
                <Input placeholder="18位信用代码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="enterprise_type" label="企业类型" rules={[{ required: true, message: '请选择企业类型' }]}>
                <Select placeholder="请选择" options={ENTERPRISE_TYPES.map(t => ({ label: t, value: t }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="industry" label="所属行业" rules={[{ required: true, message: '请选择所属行业' }]}>
                <Select placeholder="请选择" options={industries.map(i => ({ label: i, value: i }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="employee_scale" label="人员规模">
                <Select placeholder="请选择" options={EMPLOYEE_SCALES.map(s => ({ label: s, value: s }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="domestic_revenue" label="国内营收(万元)">
                <Select placeholder="请选择" options={REVENUE_SCALES.map(r => ({ label: r, value: r }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="province" label="省">
                <Select 
                  placeholder="请选择省份"
                  options={[
                    { label: '江苏省', value: '江苏省' },
                  ]} 
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="city" label="市">
                <Select 
                  placeholder="请选择城市"
                  options={[
                    { label: '常州市', value: '常州市' },
                  ]} 
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="district" label="区/县" rules={[{ required: true, message: '请选择所属区域' }]}>
                <Select placeholder="请选择" options={districts.map(d => ({ label: d, value: d }))} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="detailed_address" label="详细地址">
                <Input placeholder="请输入街道、门牌号等详细地址" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <div style={{ borderTop: '1px solid #f0f0f0', margin: '8px 0 16px', paddingTop: 16 }}>
                <Text strong>联系人信息</Text>
              </div>
            </Col>
            <Col span={8}>
              <Form.Item name="contact_name" label="联系人姓名" rules={[{ required: true, message: '请输入联系人姓名' }]}>
                <Input placeholder="请输入联系人姓名" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="contact_phone" label="联系电话" rules={[{ required: true, message: '请输入联系电话' }]}>
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="contact_position" label="职位">
                <Input placeholder="请输入职位" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <div style={{ borderTop: '1px solid #f0f0f0', margin: '8px 0 16px', paddingTop: 16 }}>
                <Text strong>跨境电商信息</Text>
              </div>
            </Col>
            <Col span={8}>
              <Form.Item name="has_crossborder" label="是否开展跨境业务">
                <Select placeholder="请选择" options={[{ label: '是', value: true }, { label: '否', value: false }]} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="transformation_willingness" label="转型意愿">
                <Select placeholder="请选择" options={TRANSFORMATION_WILLINGNESS.map(w => ({ label: w, value: w }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="crossborder_revenue" label="跨境营收(万元)">
                <Select placeholder="请选择" options={REVENUE_SCALES.map(r => ({ label: r, value: r }))} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="main_platforms" label="主要平台">
                <Select mode="multiple" placeholder="请选择" options={CROSSBORDER_PLATFORMS.map(p => ({ label: p, value: p }))} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <div style={{ borderTop: '1px solid #f0f0f0', margin: '8px 0 16px', paddingTop: 16 }}>
                <Text strong>其他信息</Text>
              </div>
            </Col>
            <Col span={12}>
              <Form.Item name="source" label="企业来源">
                <Select placeholder="请选择" options={ENTERPRISE_SOURCES.map(s => ({ label: s, value: s }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="website" label="官网">
                <Input placeholder="请输入官网地址" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="online_platform" label="线上平台">
                <Input placeholder="请输入线上平台" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="remark" label="备注">
                <Input.TextArea rows={2} placeholder="请输入备注" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="导入调研数据"
        open={isImportModalOpen}
        onOk={async () => {
          if (!importFile) {
            message.warning('请先选择文件');
            return;
          }
          setImporting(true);
          try {
            const result = await surveyExcelApi.import(importFile);
            const data = result.data;
            if (data.failed > 0) {
              message.warning(`导入完成：成功 ${data.success} 条，失败 ${data.failed} 条`);
            } else {
              message.success(`导入成功：共 ${data.success} 条数据`);
            }
            setIsImportModalOpen(false);
            setImportFile(null);
            fetchEnterprises();
          } catch (error: any) {
            message.error(error.message || '导入失败');
          } finally {
            setImporting(false);
          }
        }}
        onCancel={() => { setIsImportModalOpen(false); setImportFile(null); }}
        okText="开始导入"
        cancelText="取消"
        confirmLoading={importing}
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">上传线下收集完成的调研Excel文件，系统将根据企业ID自动匹配并更新数据</Text>
        </div>
        <div style={{
          marginBottom: 16,
          padding: '12px 16px',
          background: '#f0f5ff',
          borderRadius: 8,
          border: '1px dashed #adc6ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileExcelOutlined style={{ color: '#52c41a', fontSize: 18 }} />
            <Text type="secondary">首次导入？请先下载标准模板，按格式填写后上传</Text>
          </div>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            style={{ padding: 0, fontWeight: 500 }}
            onClick={async () => {
              try {
                const response = await surveyExcelApi.downloadTemplate();
                const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = '调研导入模板.xlsx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                message.success('模板下载成功');
              } catch (error: any) {
                message.error(error.message || '模板下载失败');
              }
            }}
          >
            下载导入模板
          </Button>
        </div>
        <Upload.Dragger
          name="file"
          multiple={false}
          accept=".xlsx,.xls"
          fileList={importFile ? [{ uid: '-1', name: importFile.name, status: 'done' } as any] : []}
          beforeUpload={(file) => {
            setImportFile(file);
            return false;
          }}
          onRemove={() => setImportFile(null)}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽调研Excel文件到此区域</p>
          <p className="ant-upload-hint">支持 .xlsx, .xls 格式，文件中需包含企业ID列</p>
        </Upload.Dragger>
      </Modal>

      <Modal
        title="导出企业数据"
        open={isExportModalOpen}
        onOk={async () => {
          setExporting(true);
          try {
            if (exportType === 'list') {
              // 列表导出：获取所有匹配企业数据
              const response = await enterpriseApi.getList(buildListParams(1, 99999));
              const list = (response.data?.list || []).map((item: any) => ({
                id: item.id,
                enterprise_name: item.name,
                district: item.district,
                industry: item.industryName,
                enterprise_type: item.enterpriseType,
                funnel_stage: item.stage,
                contacts: item.contacts || [],
                has_crossborder: item.hasCrossBorder,
                main_platforms: normalizeListField(item.crossBorderPlatforms),
                target_markets: normalizeListField(item.targetMarkets),
                created_at: item.createdAt,
              }));
              if (list.length === 0) {
                message.warning('没有可导出的企业');
                return;
              }
              await exportEnterpriseListExcel(list);
              message.success(`导出成功，共 ${list.length} 家企业`);
            } else {
              // 调研表导出
              const ids = selectedRowKeys.length > 0
                ? selectedRowKeys
                : filteredEnterprises.map((e: any) => e.id);
              if (ids.length === 0) {
                message.warning('没有可导出的企业');
                return;
              }
              const response = await surveyExcelApi.exportBatch(ids);
              const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `企业调研表_批量_${new Date().toISOString().slice(0, 10)}.xlsx`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              message.success('导出成功，文件已下载');
            }
            setIsExportModalOpen(false);
          } catch (error: any) {
            message.error(error.message || '导出失败');
          } finally {
            setExporting(false);
          }
        }}
        onCancel={() => setIsExportModalOpen(false)}
        okText="确认导出"
        cancelText="取消"
        confirmLoading={exporting}
      >
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ marginRight: 12 }}>导出类型：</Text>
            <Radio.Group value={exportType} onChange={(e) => setExportType(e.target.value)}>
              <Radio.Button value="list">企业列表</Radio.Button>
              <Radio.Button value="survey">调研表</Radio.Button>
            </Radio.Group>
          </div>
          {exportType === 'list' ? (
            <>
              <Text>将导出当前筛选条件下的所有企业为列表 Excel</Text>
              <div style={{ marginTop: 12 }}>
                <Text type="secondary">导出格式：Excel (.xlsx)，单 Sheet 表格</Text>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">包含字段：企业名称、区域、行业、类型、漏斗阶段、联系人、联系电话、是否跨境、主要平台、录入时间</Text>
              </div>
            </>
          ) : (
            <>
              <Text>
                {selectedRowKeys.length > 0
                  ? <>将导出选中的 <Text strong>{selectedRowKeys.length}</Text> 家企业的调研表</>
                  : <>将导出当前列表中 <Text strong>{filteredEnterprises.length}</Text> 家企业的调研表</>
                }
              </Text>
              <div style={{ marginTop: 12 }}>
                <Text type="secondary">导出格式：Excel (.xlsx)，包含6个Sheet</Text>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Sheet内容：企业基本信息、联系人、产品信息、外贸信息、跨境电商、合作与政策</Text>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">已有数据将预填到表格中，线下人员可直接补充修改</Text>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* 高级筛选弹窗 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FilterOutlined style={{ color: '#667eea' }} />
            <span>高级筛选条件</span>
          </div>
        }
        open={isFilterModalOpen}
        onCancel={() => setIsFilterModalOpen(false)}
        width={800}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={handleResetFilters}>重置全部</Button>
            <Space>
              <Button onClick={() => setIsFilterModalOpen(false)}>取消</Button>
              <Button 
                type="primary" 
                onClick={handleApplyFilters}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                应用筛选
              </Button>
            </Space>
          </div>
        }
      >
        <Form form={filterForm} layout="vertical" style={{ marginTop: 16 }}>
          <Tabs
            items={[
              {
                key: 'basic',
                label: '基本信息',
                children: (
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="province" label="省份">
                        <Select 
                          placeholder="请选择" 
                          allowClear
                          options={[
                            { label: '江苏省', value: '江苏省' },
                            { label: '浙江省', value: '浙江省' },
                            { label: '广东省', value: '广东省' },
                            { label: '上海市', value: '上海市' },
                            { label: '北京市', value: '北京市' },
                          ]} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="city" label="城市">
                        <Select 
                          placeholder="请选择" 
                          allowClear
                          options={[
                            { label: '常州市', value: '常州市' },
                            { label: '苏州市', value: '苏州市' },
                            { label: '无锡市', value: '无锡市' },
                            { label: '南京市', value: '南京市' },
                          ]} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="district" label="区县">
                        <Select placeholder="请选择" allowClear options={districts.map(d => ({ label: d, value: d }))} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="enterprise_type" label="企业类型">
                        <Select 
                          placeholder="请选择" 
                          allowClear
                          options={[
                            { label: '工厂型', value: '工厂型' },
                            { label: '贸易型', value: '贸易型' },
                            { label: '工贸一体', value: '工贸一体' },
                            { label: '初创/SOHO', value: '初创/SOHO' },
                          ]} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="employee_scale" label="人员规模">
                        <Select placeholder="请选择" allowClear options={staffSizeOptions} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="domestic_revenue" label="国内营收(万元)">
                        <Select placeholder="请选择" allowClear options={domesticRevenueOptions} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="crossborder_revenue" label="跨境营收(万元)">
                        <Select placeholder="请选择" allowClear options={crossBorderRevenueOptions} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="source" label="企业来源">
                        <Select placeholder="请选择" allowClear options={sourceOptions} />
                      </Form.Item>
                    </Col>
                  </Row>
                ),
              },
              {
                key: 'product',
                label: '产品信息',
                children: (
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="automation_level" label="设备自动化程度">
                        <Select 
                          placeholder="请选择" 
                          allowClear
                          options={automationLevelOptions} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="logistics_partners" label="物流合作方">
                        <Select 
                          mode="multiple"
                          placeholder="请选择" 
                          allowClear
                          options={logisticsOptions} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="local_procurement_ratio" label="原材料本地采购比例">
                        <Select 
                          placeholder="请选择" 
                          allowClear
                          options={[
                            { label: '90%以上', value: '90%以上' },
                            { label: '70%-90%', value: '70%-90%' },
                            { label: '50%-70%', value: '50%-70%' },
                            { label: '30%-50%', value: '30%-50%' },
                            { label: '30%以下', value: '30%以下' },
                          ]} 
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                ),
              },
              {
                key: 'trade',
                label: '外贸信息',
                children: (
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="has_foreign_trade" label="是否开展外贸">
                        <Select placeholder="请选择" allowClear options={[
                          { label: '是', value: true },
                          { label: '否', value: false },
                        ]} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="trade_mode" label="外贸模式">
                        <Select 
                          mode="multiple"
                          placeholder="请选择" 
                          allowClear 
                          options={[
                            { label: '0110', value: '0110' },
                            { label: '1039', value: '1039' },
                            { label: '9610', value: '9610' },
                            { label: '9710', value: '9710' },
                            { label: '9810', value: '9810' },
                            { label: '1210', value: '1210' },
                            { label: '0139', value: '0139' },
                            { label: '8000', value: '8000' },
                          ]} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="export_qualification" label="进出口资质">
                        <Select 
                          mode="multiple"
                          placeholder="请选择" 
                          allowClear 
                          options={[
                            { label: '进出口经营权', value: '进出口经营权' },
                            { label: '海关注册', value: '海关注册' },
                            { label: 'AEO认证', value: 'AEO认证' },
                            { label: '出口退税资质', value: '出口退税资质' },
                            { label: '无资质(代理出口)', value: '无资质' },
                          ]} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="export_markets" label="主要出口市场">
                        <Select 
                          mode="multiple" 
                          placeholder="请选择" 
                          allowClear 
                          options={[
                            { label: '北美', value: '北美' },
                            { label: '欧洲', value: '欧洲' },
                            { label: '东南亚', value: '东南亚' },
                            { label: '中东', value: '中东' },
                            { label: '南美', value: '南美' },
                            { label: '非洲', value: '非洲' },
                            { label: '大洋洲', value: '大洋洲' },
                          ]} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="trade_team_mode" label="外贸业务团队模式">
                        <Select 
                          placeholder="请选择" 
                          allowClear 
                          options={[
                            { label: '自建团队', value: '自建团队' },
                            { label: '外包/代运营', value: '外包/代运营' },
                            { label: '混合模式', value: '混合模式' },
                            { label: '无专职团队', value: '无专职团队' },
                          ]} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="trade_team_size" label="外贸团队人数">
                        <Select 
                          placeholder="请选择" 
                          allowClear 
                          options={[
                            { label: '无团队', value: '无团队' },
                            { label: '1-3人', value: '1-3人' },
                            { label: '4-10人', value: '4-10人' },
                            { label: '11-30人', value: '11-30人' },
                            { label: '30人以上', value: '30人以上' },
                          ]} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="annual_export_volume" label="年出口额">
                        <Select 
                          placeholder="请选择" 
                          allowClear 
                          options={[
                            { label: '100万美元以下', value: '100万美元以下' },
                            { label: '100-500万美元', value: '100-500万美元' },
                            { label: '500-1000万美元', value: '500-1000万美元' },
                            { label: '1000-5000万美元', value: '1000-5000万美元' },
                            { label: '5000万美元以上', value: '5000万美元以上' },
                          ]} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="trade_experience_years" label="外贸经验年限">
                        <Select 
                          placeholder="请选择" 
                          allowClear 
                          options={[
                            { label: '无经验', value: '无经验' },
                            { label: '1-3年', value: '1-3年' },
                            { label: '3-5年', value: '3-5年' },
                            { label: '5-10年', value: '5-10年' },
                            { label: '10年以上', value: '10年以上' },
                          ]} 
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                ),
              },
              {
                key: 'crossborder',
                label: '跨境电商',
                children: (
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="has_crossborder" label="是否开展跨境电商">
                        <Select placeholder="请选择" allowClear options={[
                          { label: '是', value: true },
                          { label: '否', value: false },
                        ]} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="main_platforms" label="主要跨境平台">
                        <Select 
                          mode="multiple" 
                          placeholder="请选择" 
                          allowClear 
                          options={CROSSBORDER_PLATFORMS.map(p => ({ label: p, value: p }))} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="transformation_willingness" label="跨境转型意愿">
                        <Select placeholder="请选择" allowClear options={TRANSFORMATION_WILLINGNESS.map(w => ({ label: w, value: w }))} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="crossborder_team_size" label="跨境团队规模">
                        <Select placeholder="请选择" allowClear options={[
                          { label: '无团队', value: '无团队' },
                          { label: '1-3人', value: '1-3人' },
                          { label: '4-10人', value: '4-10人' },
                          { label: '10人以上', value: '10人以上' },
                        ]} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="logistics_mode" label="跨境物流模式">
                        <Select 
                          mode="multiple" 
                          placeholder="请选择" 
                          allowClear 
                          options={[
                            { label: '海运', value: '海运' },
                            { label: '空运', value: '空运' },
                            { label: 'FBA', value: 'FBA' },
                            { label: '海外仓', value: '海外仓' },
                            { label: '小包直发', value: '小包直发' },
                          ]} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="payment_method" label="支付结算方式">
                        <Select 
                          mode="multiple"
                          placeholder="请选择" 
                          allowClear 
                          options={[
                            { label: 'T/T电汇', value: 'T/T电汇' },
                            { label: 'L/C信用证', value: 'L/C信用证' },
                            { label: 'D/P付款交单', value: 'D/P付款交单' },
                            { label: 'D/A承兑交单', value: 'D/A承兑交单' },
                            { label: 'PayPal', value: 'PayPal' },
                            { label: '第三方支付', value: '第三方支付' },
                            { label: 'FOB', value: 'FOB' },
                            { label: 'CIF', value: 'CIF' },
                          ]} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="has_erp" label="是否在用ERP">
                        <Select 
                          placeholder="请选择" 
                          allowClear 
                          options={[
                            { label: '是', value: true },
                            { label: '否', value: false },
                          ]} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="target_markets" label="目标市场">
                        <Select 
                          mode="multiple"
                          placeholder="请选择" 
                          allowClear 
                          options={[
                            { label: '北美', value: '北美' },
                            { label: '欧洲', value: '欧洲' },
                            { label: '东南亚', value: '东南亚' },
                            { label: '中东', value: '中东' },
                            { label: '南美', value: '南美' },
                            { label: '日韩', value: '日韩' },
                            { label: '澳新', value: '澳新' },
                            { label: '非洲', value: '非洲' },
                          ]} 
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                ),
              },
              {
                key: 'followup',
                label: '跟进记录',
                children: (
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="funnel_stage" label="漏斗阶段">
                        <Select 
                          placeholder="请选择" 
                          allowClear 
                          options={FUNNEL_STAGES.map(s => ({ label: s.name, value: s.code }))} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="last_followup_days" label="最近跟进时间">
                        <Select placeholder="请选择" allowClear options={[
                          { label: '7天内', value: 7 },
                          { label: '15天内', value: 15 },
                          { label: '30天内', value: 30 },
                          { label: '超过30天', value: -30 },
                        ]} />
                      </Form.Item>
                    </Col>
                  </Row>
                ),
              },
              {
                key: 'requirements',
                label: '需求分析',
                children: (
                  <div>
                    <div style={{ marginBottom: 12, color: '#666', fontSize: 13 }}>
                      选择需求项，筛选具有相关需求的企业
                    </div>
                    {['战略规划与资源准备', '渠道搭建与商品上线', '营销推广与规模增长', '品牌深耕与持续优化'].map(phase => {
                      const phaseRequirements = requirements.filter(r => r.phase === phase);
                      const categories = [...new Set(phaseRequirements.map(r => r.category))];
                      return (
                        <div key={phase} style={{ marginBottom: 16 }}>
                          <div style={{ 
                            fontWeight: 600, 
                            fontSize: 13, 
                            marginBottom: 8,
                            padding: '4px 10px',
                            background: phase === '战略规划与资源准备' ? 'rgba(102,126,234,0.1)' :
                                       phase === '渠道搭建与商品上线' ? 'rgba(67,233,123,0.1)' :
                                       phase === '营销推广与规模增长' ? 'rgba(249,115,22,0.1)' :
                                       'rgba(139,92,246,0.1)',
                            color: phase === '战略规划与资源准备' ? '#667eea' :
                                   phase === '渠道搭建与商品上线' ? '#22c55e' :
                                   phase === '营销推广与规模增长' ? '#f97316' :
                                   '#8b5cf6',
                            borderRadius: 6,
                            display: 'inline-block'
                          }}>
                            {phase}
                          </div>
                          <Row gutter={[12, 8]}>
                            {categories.map(category => (
                              <Col span={12} key={category}>
                                <Form.Item 
                                  name={['requirements', `${phase}_${category}`]} 
                                  label={<span style={{ fontSize: 12, color: '#888' }}>{category}</span>}
                                  style={{ marginBottom: 8 }}
                                >
                                  <Select
                                    mode="multiple"
                                    placeholder="选择需求"
                                    allowClear
                                    maxTagCount={2}
                                    style={{ width: '100%' }}
                                    options={phaseRequirements
                                      .filter(r => r.category === category)
                                      .map(r => ({ 
                                        label: `${r.id} ${r.name}`, 
                                        value: r.id 
                                      }))}
                                  />
                                </Form.Item>
                              </Col>
                            ))}
                          </Row>
                        </div>
                      );
                    })}
                  </div>
                ),
              },
            ]}
          />
        </Form>
      </Modal>

      {/* 批量变更阶段模态框 */}
      <Modal
        title="批量变更漏斗阶段"
        open={batchStageModalOpen}
        onOk={handleBatchStageOk}
        onCancel={() => setBatchStageModalOpen(false)}
        okText="确定变更"
        cancelText="取消"
        width={480}
      >
        <div style={{ marginTop: 16 }}>
          <Text style={{ marginBottom: 16, display: 'block' }}>
            将选中的 <Text strong style={{ color: '#667eea' }}>{selectedRowKeys.length}</Text> 家企业变更至：
          </Text>
          <Form layout="vertical">
            <Form.Item label="目标阶段" required>
              <Select
                placeholder="请选择目标阶段"
                value={batchStage || undefined}
                onChange={(v) => setBatchStage(v)}
                options={FUNNEL_STAGES.map(s => ({ label: s.name, value: s.code }))}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item label="变更原因">
              <Input.TextArea
                placeholder="请输入变更原因（可选）"
                rows={3}
                value={batchReason}
                onChange={(e) => setBatchReason(e.target.value)}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
}

export default EnterpriseList;
