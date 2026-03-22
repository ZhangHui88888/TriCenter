import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  InputNumber,
  Space,
  Modal,
  Form,
  Row,
  Col,
  Typography,
  message,
  Spin,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
  InboxOutlined,
  FilterOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  FileExcelOutlined,
  DeleteOutlined,
  SwapOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Upload, Tabs, Badge, Radio } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { requirements } from '@/data/requirementsData';
import {
  ENTERPRISE_TYPE_OPTIONS,
  ENTERPRISE_SOURCES,
  EMPLOYEE_SCALES,
  REVENUE_SCALES,
  CROSSBORDER_PLATFORMS,
  TRANSFORMATION_WILLINGNESS,
} from '@/utils/constants';
import ReactECharts from 'echarts-for-react';
import { enterpriseApi, optionsApi, surveyExcelApi, dashboardApi } from '@/services/api';
import EnterpriseSearch from '@/components/EnterpriseSearch';
import { exportEnterpriseListExcel } from '@/utils/exportEnterpriseListExcel';
import type { Enterprise } from '@/types';

const { Text } = Typography;

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
  crossBorderRevenueMinWan?: number;
  crossBorderRevenueMaxWan?: number;
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
  hasForeignTrade?: number;
  tradeModeId?: number;
  hasExportQualification?: number;
  tradeTeamModeId?: number;
  tradeTeamSize?: string;
  crossBorderTeamSize?: string;
  logisticsMode?: string;
  paymentMethod?: string;
};

// 漏斗阶段配置
const FUNNEL_STAGES = [
  { code: 'POTENTIAL', name: '潜在企业', color: '#718EBF' },
  { code: 'NO_DEMAND', name: '无明确需求', color: '#FFBB38' },
  { code: 'NO_INTENTION', name: '没有合作意向', color: '#FE5C73' },
  { code: 'HAS_DEMAND', name: '有明确需求', color: '#396AFF' },
  { code: 'SIGNED', name: '已签约', color: '#7B61FF' },
  { code: 'SETTLED', name: '已入驻', color: '#16DBCC' },
  { code: 'INCUBATING', name: '重点孵化', color: '#FF6B35' },
];

/** 与批量操作条同高（含底边），未选中时占位，避免布局跳动 */
const SELECTION_ACTION_BAR_SLOT_MIN_PX = 60;

/** 企业列表每页条数（与表格分页器联动） */
const ENTERPRISE_PAGE_SIZE_OPTIONS = Array.from({ length: 26 }, (_, i) => {
  const n = 5 + i;
  return { label: `${n} 条/页`, value: n };
});

/** 列表「主联系人」副行：后端已按 is_primary 优先排序，此处再兜底排序后只取第一位；电话为空时用邮箱 */
type ListContactRaw = {
  phone?: string | null;
  email?: string | null;
  isPrimary?: boolean | null;
  is_primary?: boolean | null;
};

function sortListContactsByPrimary(contacts: ListContactRaw[]): ListContactRaw[] {
  return [...contacts].sort((a, b) => {
    const pa = a.isPrimary === true || a.is_primary === true ? 1 : 0;
    const pb = b.isPrimary === true || b.is_primary === true ? 1 : 0;
    return pb - pa;
  });
}

function getEnterpriseListContactSubline(contacts: ListContactRaw[] | undefined | null): string {
  if (!contacts?.length) return '';
  const [first] = sortListContactsByPrimary(contacts);
  const phone = String(first?.phone ?? '').trim();
  const email = String(first?.email ?? '').trim();
  return phone || email || '';
}

type EnterpriseOverviewStats = {
  totalCount: number;
  hasDemandCount: number;
  signedCount: number;
  totalExportRevenueWan: number;
  offlineExportRevenueWan: number;
  onlineCrossBorderExportRevenueWan: number;
};

type FunnelStatItem = { code: string; name: string; count: number };

function formatOverviewCount(value: number | undefined, loading: boolean): string {
  if (loading) return '—';
  const n = value ?? 0;
  return n.toLocaleString('zh-CN');
}

function formatOverviewWan(value: number | undefined, loading: boolean): string {
  if (loading) return '—';
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return '0';
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function OverviewEnterpriseCountCard({
  totalCount,
  hasDemandCount,
  signedCount,
  loading,
}: {
  totalCount: number;
  hasDemandCount: number;
  signedCount: number;
  loading: boolean;
}) {
  return (
    <div className="enterprise-bank-card">
      <div className="enterprise-bank-card__top">
        <div className="enterprise-bank-card__stat">
          <div className="enterprise-bank-card__label enterprise-bank-card__label--on-dark">企业总数</div>
          <div className="enterprise-bank-card__value enterprise-bank-card__value--on-dark">
            {formatOverviewCount(totalCount, loading)}
          </div>
        </div>
        <div className="enterprise-bank-card__chip" aria-hidden />
      </div>

      <div className="enterprise-bank-card__meta-row">
        <div className="enterprise-bank-card__meta-block">
          <div className="enterprise-bank-card__label enterprise-bank-card__label--on-dark">有明确需求企业数</div>
          <div className="enterprise-bank-card__value enterprise-bank-card__value--on-dark">
            {formatOverviewCount(hasDemandCount, loading)}
          </div>
        </div>
        <div className="enterprise-bank-card__meta-block enterprise-bank-card__meta-block--trailing">
          <div className="enterprise-bank-card__label enterprise-bank-card__label--on-dark">已签约企业数</div>
          <div className="enterprise-bank-card__value enterprise-bank-card__value--on-dark">
            {formatOverviewCount(signedCount, loading)}
          </div>
        </div>
      </div>

      <div className="enterprise-bank-card__bottom-glow" />

      <div className="enterprise-bank-card__bottom">
        <span className="enterprise-bank-card__footer-label enterprise-bank-card__footer-label--on-dark">
          企业数量统计
        </span>
        <div className="enterprise-bank-card__logo" aria-hidden>
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

function OverviewExportRevenueCard({
  totalWan,
  offlineWan,
  onlineWan,
  loading,
}: {
  totalWan: number;
  offlineWan: number;
  onlineWan: number;
  loading: boolean;
}) {
  return (
    <div className="enterprise-bank-card enterprise-bank-card--light">
      <div className="enterprise-bank-card__top">
        <div className="enterprise-bank-card__stat">
          <div className="enterprise-bank-card__label enterprise-bank-card__label--on-light">出口总贸易额（万元）</div>
          <div className="enterprise-bank-card__value enterprise-bank-card__value--on-light">
            {formatOverviewWan(totalWan, loading)}
          </div>
        </div>
        <div className="enterprise-bank-card__chip" aria-hidden />
      </div>

      <div className="enterprise-bank-card__meta-row">
        <div className="enterprise-bank-card__meta-block">
          <div className="enterprise-bank-card__label enterprise-bank-card__label--on-light">线下出口贸易额（万元）</div>
          <div className="enterprise-bank-card__value enterprise-bank-card__value--on-light">
            {formatOverviewWan(offlineWan, loading)}
          </div>
        </div>
        <div className="enterprise-bank-card__meta-block enterprise-bank-card__meta-block--trailing">
          <div className="enterprise-bank-card__label enterprise-bank-card__label--on-light">线上跨境电商出口贸易额（万元）</div>
          <div className="enterprise-bank-card__value enterprise-bank-card__value--on-light">
            {formatOverviewWan(onlineWan, loading)}
          </div>
        </div>
      </div>

      <div className="enterprise-bank-card__bottom-glow" />

      <div className="enterprise-bank-card__bottom">
        <span className="enterprise-bank-card__footer-label enterprise-bank-card__footer-label--on-light">
          出口贸易额统计
        </span>
        <div className="enterprise-bank-card__logo" aria-hidden>
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

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
  const [pageSize, setPageSize] = useState(5);
  const [districts, setDistricts] = useState<string[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);
  const [staffSizeOptions, setStaffSizeOptions] = useState<SelectOption[]>([]);
  const [domesticRevenueOptions, setDomesticRevenueOptions] = useState<SelectOption[]>([]);
  const [sourceOptions, setSourceOptions] = useState<SelectOption[]>([]);
  const [automationLevelOptions, setAutomationLevelOptions] = useState<SelectOption[]>([]);
  const [logisticsOptions, setLogisticsOptions] = useState<SelectOption[]>([]);
  const [tradeModeOptions, setTradeModeOptions] = useState<SelectOption[]>([]);
  const [tradeTeamModeOptions, setTradeTeamModeOptions] = useState<SelectOption[]>([]);

  const [overviewStats, setOverviewStats] = useState<EnterpriseOverviewStats>({
    totalCount: 0,
    hasDemandCount: 0,
    signedCount: 0,
    totalExportRevenueWan: 0,
    offlineExportRevenueWan: 0,
    onlineCrossBorderExportRevenueWan: 0,
  });
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [funnelStats, setFunnelStats] = useState<FunnelStatItem[]>([]);

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
    crossBorderRevenueMinWan: filters.crossborder_revenue_min_wan != null ? Number(filters.crossborder_revenue_min_wan) : undefined,
    crossBorderRevenueMaxWan: filters.crossborder_revenue_max_wan != null ? Number(filters.crossborder_revenue_max_wan) : undefined,
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
    hasForeignTrade: typeof filters.has_foreign_trade === 'boolean'
      ? (filters.has_foreign_trade ? 1 : 0)
      : undefined,
    tradeModeId: filters.trade_mode || undefined,
    hasExportQualification: typeof filters.export_qualification === 'boolean'
      ? (filters.export_qualification ? 1 : 0)
      : undefined,
    tradeTeamModeId: filters.trade_team_mode || undefined,
    tradeTeamSize: filters.trade_team_size || undefined,
    crossBorderTeamSize: filters.crossborder_team_size || undefined,
    logisticsMode: Array.isArray(filters.logistics_mode) && filters.logistics_mode.length > 0
      ? filters.logistics_mode.join(',')
      : undefined,
    paymentMethod: Array.isArray(filters.payment_method) && filters.payment_method.length > 0
      ? filters.payment_method.join(',')
      : undefined,
    });
  };

  const buildOverviewQueryParams = (filters = advancedFilters) => {
    const full = buildListParams(1, pageSize, filters);
    const { page: _p, pageSize: _ps, ...rest } = full;
    return rest;
  };

  const normalizeOverviewPayload = (raw: any): EnterpriseOverviewStats => ({
    totalCount: Number(raw?.totalCount ?? 0),
    hasDemandCount: Number(raw?.hasDemandCount ?? 0),
    signedCount: Number(raw?.signedCount ?? 0),
    totalExportRevenueWan: Number(raw?.totalExportRevenueWan ?? 0),
    offlineExportRevenueWan: Number(raw?.offlineExportRevenueWan ?? 0),
    onlineCrossBorderExportRevenueWan: Number(raw?.onlineCrossBorderExportRevenueWan ?? 0),
  });

  const fetchOverviewStats = async (filters = advancedFilters) => {
    setOverviewLoading(true);
    const params = buildOverviewQueryParams(filters) as Record<string, unknown>;
    try {
      const [overviewResult, analysisResult] = await Promise.allSettled([
        enterpriseApi.getOverviewStats(params as any),
        dashboardApi.getAnalysisStats(params as any),
      ]);

      if (overviewResult.status === 'fulfilled') {
        const res: any = overviewResult.value;
        const payload = res?.data ?? res;
        if (payload != null && typeof payload === 'object') {
          setOverviewStats(normalizeOverviewPayload(payload));
        }
      } else {
        console.error('Failed to fetch overview stats:', overviewResult.reason);
      }

      if (analysisResult.status === 'fulfilled') {
        const res: any = analysisResult.value;
        const payload = res?.data ?? res;
        const list = Array.isArray(payload?.funnelStats) ? payload.funnelStats : [];
        setFunnelStats(
          list.map((it: any) => ({
            code: String(it.code ?? ''),
            name: String(it.name ?? ''),
            count: Number(it.count ?? 0),
          }))
        );
      } else {
        console.error('Failed to fetch funnel stats:', analysisResult.reason);
      }
    } catch (error) {
      console.error('Failed to fetch overview / funnel stats:', error);
    } finally {
      setOverviewLoading(false);
    }
  };

  /** BankDash「My Expense」式阶段柱图：浅灰柱 + 圆顶 + 当前最高阶段青色高亮 */
  const stageExpenseBarChart = useMemo(() => {
    const shortAxis: Record<string, string> = {
      POTENTIAL: '潜在',
      NO_DEMAND: '无需求',
      NO_INTENTION: '无意向',
      HAS_DEMAND: '有需求',
      SIGNED: '签约',
      SETTLED: '入驻',
      INCUBATING: '孵化',
    };
    const barMuted = '#EDF1F7';
    const barAccent = '#16DBCC';
    const byCode = new Map(funnelStats.map((s) => [s.code, s]));
    const ordered = FUNNEL_STAGES.map((stage) => {
      const item = byCode.get(stage.code);
      const value = item?.count ?? 0;
      return {
        code: stage.code,
        fullName: item?.name ?? stage.name,
        short: shortAxis[stage.code] ?? stage.name.slice(0, 2),
        value,
      };
    });
    let maxIdx = 0;
    let maxVal = 0;
    ordered.forEach((d, i) => {
      if (d.value > maxVal) {
        maxVal = d.value;
        maxIdx = i;
      }
    });
    const yMax = maxVal > 0 ? Math.ceil(maxVal * 1.12) : 1;
    const data = ordered.map((d, i) => ({
      value: d.value,
      itemStyle: {
        color: maxVal > 0 && i === maxIdx ? barAccent : barMuted,
        borderRadius: [12, 12, 0, 0],
        shadowBlur: maxVal > 0 && i === maxIdx ? 14 : 0,
        shadowColor: maxVal > 0 && i === maxIdx ? 'rgba(22, 219, 204, 0.28)' : 'transparent',
        shadowOffsetY: maxVal > 0 && i === maxIdx ? 6 : 0,
      },
    }));
    return {
      headlineCount: maxVal,
      option: {
        tooltip: {
          trigger: 'axis' as const,
          axisPointer: { type: 'none' as const },
          formatter: (items: { dataIndex: number; value: number }[]) => {
            const p = items[0];
            if (!p) return '';
            const row = ordered[p.dataIndex];
            return `${row.fullName}<br/>企业数：${p.value}`;
          },
        },
        grid: { left: 6, right: 6, top: 8, bottom: 4, containLabel: true },
        xAxis: {
          type: 'category' as const,
          data: ordered.map((d) => d.short),
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#8899B0', fontSize: 11, interval: 0, margin: 10 },
        },
        yAxis: {
          type: 'value' as const,
          max: yMax,
          show: false,
        },
        series: [
          {
            type: 'bar' as const,
            data,
            barMaxWidth: 22,
            barCategoryGap: '42%',
            emphasis: {
              focus: 'self' as const,
              itemStyle: {
                shadowBlur: 18,
                shadowColor: 'rgba(22, 219, 204, 0.35)',
              },
            },
          },
        ],
      },
    };
  }, [funnelStats]);

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
      const [districtRes, industryRes, staffSizeRes, domesticRevenueRes, sourceRes, automationLevelRes, logisticsRes, tradeModeRes, tradeTeamModeRes] = await Promise.all([
        optionsApi.getOptions('district'),
        optionsApi.getIndustries(),
        optionsApi.getOptions('staff_size'),
        optionsApi.getOptions('domestic_revenue'),
        optionsApi.getOptions('source'),
        optionsApi.getOptions('automation_level'),
        optionsApi.getOptions('logistics'),
        optionsApi.getOptions('trade_mode'),
        optionsApi.getOptions('trade_team_mode'),
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

      if (sourceRes.data) {
        setSourceOptions(sourceRes.data.map((item: any) => ({ label: item.label, value: item.id })));
      }

      if (automationLevelRes.data) {
        setAutomationLevelOptions(automationLevelRes.data.map((item: any) => ({ label: item.label, value: item.id })));
      }

      if (logisticsRes.data) {
        setLogisticsOptions(logisticsRes.data.map((item: any) => ({ label: item.label, value: item.id })));
      }

      if (tradeModeRes.data) {
        setTradeModeOptions(tradeModeRes.data.map((item: any) => ({ label: item.label, value: item.id })));
      }

      if (tradeTeamModeRes.data) {
        setTradeTeamModeOptions(tradeTeamModeRes.data.map((item: any) => ({ label: item.label, value: item.id })));
      }
    } catch (error) {
      console.error('Failed to fetch options:', error);
    }
  };
  
  useEffect(() => {
    fetchOptions();
    fetchEnterprises(1, pageSize, {});
    fetchOverviewStats({});
  }, []);
  
  // 搜索
  const handleSearch = () => {
    setPage(1);
    void fetchEnterprises(1, pageSize);
    void fetchOverviewStats();
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
          void fetchEnterprises();
          void fetchOverviewStats();
        } catch {
          message.error('批量删除失败');
        }
      },
    });
  };

  const handleDeleteEnterprise = (record: Enterprise) => {
    Modal.confirm({
      title: '删除确认',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除企业「${record.enterprise_name}」吗？此操作不可恢复。`,
      okText: '确定删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await enterpriseApi.delete(record.id);
          message.success('删除成功');
          setSelectedRowKeys((keys) => keys.filter((k) => k !== record.id));
          void fetchEnterprises();
          void fetchOverviewStats();
        } catch {
          message.error('删除失败');
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
      void fetchEnterprises();
      void fetchOverviewStats();
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
    'crossborder_revenue_min_wan',
    'crossborder_revenue_max_wan',
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
    'has_foreign_trade',
    'trade_mode',
    'export_qualification',
    'trade_team_mode',
    'trade_team_size',
    'crossborder_team_size',
    'logistics_mode',
    'payment_method',
  ]);

  const advancedFilterLabels: Record<string, string> = {
    province: '省份',
    city: '城市',
    district: '区县',
    enterprise_type: '企业类型',
    employee_scale: '人员规模',
    domestic_revenue: '国内营收',
    crossborder_revenue_min_wan: '跨境营收≥(万元)',
    crossborder_revenue_max_wan: '跨境营收≤(万元)',
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
    export_qualification: '是否有进出口资质',
    trade_team_mode: '外贸业务团队模式',
    trade_team_size: '外贸团队人数',
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
    if (!stage) return { name: code, color: '#718EBF', gradient: '#718EBF' };
    
    return { ...stage, gradient: stage.color };
  };

  // 使用API返回的数据
  const filteredEnterprises = enterprises;

  const renderAttributePill = (raw: string | undefined | null) => {
    const text = raw?.trim() ? String(raw) : '—';
    return (
      <span className="enterprise-list-cell-pill enterprise-list-cell-pill--default" title={text}>
        {text}
      </span>
    );
  };

  const renderStagePill = (stage: string) => {
    const info = getStageInfo(stage);
    return (
      <span className="enterprise-list-cell-pill enterprise-list-cell-pill--default" title={info.name}>
        {info.name}
      </span>
    );
  };

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
    void fetchEnterprises(1, pageSize, supported);
    void fetchOverviewStats(supported);
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
    void fetchEnterprises(1, pageSize, {});
    void fetchOverviewStats({});
    message.success('筛选条件已重置');
  };

  const columns: ColumnsType<Enterprise> = [
    {
      title: '企业名称',
      dataIndex: 'enterprise_name',
      key: 'enterprise_name',
      width: '28%',
      ellipsis: true,
      render: (text, record) => {
        const contactLine = getEnterpriseListContactSubline(record.contacts as ListContactRaw[]);
        const sublineText = contactLine || '暂无联系方式';
        return (
          <div
            style={{
              minHeight: 48,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <div
              className="enterprise-list-name-link"
              role="link"
              tabIndex={0}
              onClick={() => navigate(`/enterprise/${record.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/enterprise/${record.id}`);
                }
              }}
              title={typeof text === 'string' ? text : undefined}
            >
              {text}
            </div>
            <div
              style={{
                fontSize: 12,
                lineHeight: '22px',
                minHeight: 22,
                color: '#8c8c8c',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                minWidth: 0,
              }}
              title={sublineText}
            >
              <span
                style={{
                  display: 'inline-block',
                  flexShrink: 0,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#16DBCC',
                }}
                aria-hidden
              />
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                  flex: 1,
                }}
              >
                {sublineText}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: '区域',
      dataIndex: 'district',
      key: 'district',
      width: '15%',
      align: 'center',
      render: (text) => renderAttributePill(text as string | undefined),
    },
    {
      title: '行业',
      dataIndex: 'industry',
      key: 'industry',
      width: '15%',
      align: 'center',
      render: (text) => renderAttributePill(text as string | undefined),
    },
    {
      title: '类型',
      dataIndex: 'enterprise_type',
      key: 'enterprise_type',
      width: '15%',
      align: 'center',
      render: (text) => renderAttributePill(text as string | undefined),
    },
    {
      title: '漏斗阶段',
      dataIndex: 'funnel_stage',
      key: 'funnel_stage',
      width: '15%',
      align: 'center',
      render: (stage: string) => renderStagePill(stage),
    },
    {
      title: '操作',
      key: 'action',
      width: 88,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteEnterprise(record)}
          style={{
            borderRadius: 8,
            width: 32,
            height: 32,
          }}
          title="删除"
        />
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
      <div className="enterprise-bankdash-overview">
        <div className="enterprise-bankdash-overview__left">
          <div className="enterprise-bankdash-section-head">
            <span className="enterprise-bankdash-section-head__title">企业卡片</span>
          </div>
          <div className="enterprise-bankdash-cards">
            <OverviewEnterpriseCountCard
              totalCount={overviewStats.totalCount}
              hasDemandCount={overviewStats.hasDemandCount}
              signedCount={overviewStats.signedCount}
              loading={overviewLoading}
            />
            <OverviewExportRevenueCard
              totalWan={overviewStats.totalExportRevenueWan}
              offlineWan={overviewStats.offlineExportRevenueWan}
              onlineWan={overviewStats.onlineCrossBorderExportRevenueWan}
              loading={overviewLoading}
            />
          </div>
        </div>

        <div className="enterprise-expense-card">
          <div className="enterprise-bankdash-section-head enterprise-bankdash-section-head--compact">
            <span className="enterprise-bankdash-section-head__title">阶段分布</span>
            <span className="enterprise-bankdash-section-head__headline-value">
              {overviewLoading ? '—' : stageExpenseBarChart.headlineCount.toLocaleString('zh-CN')}
            </span>
          </div>

          <div className="enterprise-expense-chart-panel">
            {overviewLoading ? (
              <div className="enterprise-expense-chart-panel__loading">
                <Spin />
              </div>
            ) : (
              <ReactECharts
                option={stageExpenseBarChart.option}
                style={{ height: 200, width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            )}
          </div>
        </div>
      </div>

      <Card 
        style={{ 
          marginBottom: 16, 
          borderRadius: 25, 
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
        }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 16,
            justifyContent: 'space-between',
          }}
        >
          <Space wrap size={16} style={{ flex: '1 1 auto', minWidth: 0 }}>
            <EnterpriseSearch
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={handleSearch}
              placeholder="搜索企业名称..."
              style={{ width: 280 }}
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
                borderRadius: 12,
                height: 40,
                fontWeight: 500,
                background: '#396AFF',
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
                  borderRadius: 12,
                  height: 40,
                  fontWeight: 500,
                  borderColor: activeFilterCount > 0 ? '#396AFF' : undefined,
                  color: activeFilterCount > 0 ? '#396AFF' : undefined,
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
          <Space size={12} wrap style={{ flexShrink: 0, marginLeft: 'auto' }}>
            <Select
              value={pageSize}
              options={ENTERPRISE_PAGE_SIZE_OPTIONS}
              onChange={(size) => {
                setPage(1);
                setPageSize(size);
                void fetchEnterprises(1, size);
              }}
              style={{ width: 118, height: 40 }}
              styles={{ popup: { root: { minWidth: 112 } } }}
            />
            <Button
              icon={<UploadOutlined />}
              onClick={() => setIsImportModalOpen(true)}
              style={{
                borderRadius: 12,
                height: 40,
                fontWeight: 500,
              }}
            >
              导入
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => setIsExportModalOpen(true)}
              style={{
                borderRadius: 12,
                height: 40,
                fontWeight: 500,
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
                borderRadius: 12,
                height: 40,
                fontWeight: 500,
                background: '#396AFF',
                border: 'none',
                boxShadow: '0 4px 12px rgba(57, 106, 255, 0.4)',
              }}
            >
              新增企业
            </Button>
          </Space>
        </div>
      </Card>

      <Card
        style={{ 
          borderRadius: 25, 
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
        }}
        styles={{ body: { padding: '8px 0' } }}
      >
        <div
          style={{
            minHeight: SELECTION_ACTION_BAR_SLOT_MIN_PX,
            boxSizing: 'border-box',
          }}
        >
          {selectedRowKeys.length > 0 ? (
            <div
              className="enterprise-list-batch-bar"
              style={{
                padding: '12px 24px',
                background: 'rgba(57, 106, 255, 0.04)',
                borderBottom: '1px solid rgba(57, 106, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text>
                已选择 <Text strong style={{ color: '#396AFF' }}>{selectedRowKeys.length}</Text> 家企业
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
          ) : null}
        </div>
        <Table
          columns={columns}
          dataSource={filteredEnterprises}
          rowKey="id"
          loading={loading}
          rowSelection={{
            columnWidth: 48,
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          pagination={{
            current: page,
            total: _total,
            pageSize: pageSize,
            onChange: (current) => {
              setPage(current);
              void fetchEnterprises(current, pageSize);
            },
            showTotal: (total) => (
              <span style={{ color: '#666' }}>
                共 <span style={{ color: '#396AFF', fontWeight: 600 }}>{total}</span> 条记录
              </span>
            ),
            showSizeChanger: false,
            style: { padding: '16px 24px' }
          }}
          className="enterprise-list-table"
          style={{
            borderRadius: 12,
          }}
          rowClassName={() => 'custom-table-row'}
        />
      </Card>

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
                <Select placeholder="请选择" options={ENTERPRISE_TYPE_OPTIONS} />
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
              <Form.Item name="crossborder_revenue_wan" label="跨境营收(万元)">
                <InputNumber min={0} placeholder="请输入数字" style={{ width: '100%' }} />
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
            void fetchEnterprises();
            void fetchOverviewStats();
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
            <FileExcelOutlined style={{ color: '#16DBCC', fontSize: 18 }} />
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
            <FilterOutlined style={{ color: '#396AFF' }} />
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
                  background: '#396AFF',
                  border: 'none',
                  borderRadius: 12,
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
                          options={ENTERPRISE_TYPE_OPTIONS} 
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
                      <Form.Item name="crossborder_revenue_min_wan" label="跨境营收≥(万元)">
                        <InputNumber min={0} placeholder="最小" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="crossborder_revenue_max_wan" label="跨境营收≤(万元)">
                        <InputNumber min={0} placeholder="最大" style={{ width: '100%' }} />
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
                          placeholder="请选择" 
                          allowClear 
                          options={tradeModeOptions} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="export_qualification" label="是否有进出口资质">
                        <Select 
                          placeholder="请选择" 
                          allowClear 
                          options={[
                            { label: '有', value: true },
                            { label: '无', value: false },
                          ]} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="trade_team_mode" label="外贸业务团队模式">
                        <Select 
                          placeholder="请选择" 
                          allowClear 
                          options={tradeTeamModeOptions} 
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
                            background: phase === '战略规划与资源准备' ? 'rgba(57,106,255,0.1)' :
                                       phase === '渠道搭建与商品上线' ? 'rgba(22,219,204,0.1)' :
                                       phase === '营销推广与规模增长' ? 'rgba(255,107,53,0.1)' :
                                       'rgba(123,97,255,0.1)',
                            color: phase === '战略规划与资源准备' ? '#396AFF' :
                                   phase === '渠道搭建与商品上线' ? '#16DBCC' :
                                   phase === '营销推广与规模增长' ? '#FF6B35' :
                                   '#7B61FF',
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
            将选中的 <Text strong style={{ color: '#396AFF' }}>{selectedRowKeys.length}</Text> 家企业变更至：
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
