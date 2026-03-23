// @ts-nocheck
import { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { useParams, useNavigate } from 'react-router-dom';
import { ENTERPRISE_TYPE_OPTIONS } from '@/utils/constants';
import {
  Card,
  Tabs,
  Descriptions,
  Tag,
  Button,
  Space,
  Table,
  Modal,
  Select,
  Typography,
  Row,
  Col,
  Badge,
  message,
  Collapse,
  Cascader,
  Spin,
  AutoComplete,
  Alert,
  Popconfirm,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  StarFilled,
  PlusOutlined,
  ShopOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  WarningOutlined,
  AlertOutlined,
  DeleteOutlined,
  CloseOutlined,
  DownOutlined,
  RightOutlined,
  ArrowRightOutlined,
  RiseOutlined,
  FallOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { Rate, Switch, Slider } from 'antd';
import { Form, Input, DatePicker, InputNumber } from 'antd';
import { FOLLOW_UP_TYPES } from '@/utils/constants';
import { dimensions, groupRequirementsByPhase, type RequirementItem } from '@/data/requirementsData';
import { enterpriseApi, contactApi, optionsApi, dictionaryApi, surveyExcelApi, serviceRecordApi, followUpApi, productApi, patentApi } from '@/services/api';
import type { RequirementConfigData } from '@/services/api';

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

/** 已享受政策选项（与编辑弹窗、后端存 value 一致） */
const ENJOYED_POLICY_OPTIONS = [
  { label: '跨境电商扶持资金', value: 'cross_border_fund' },
  { label: '外贸稳增长补贴', value: 'trade_growth_subsidy' },
  { label: '品牌出海补贴', value: 'brand_overseas_subsidy' },
  { label: '人才引进补贴', value: 'talent_subsidy' },
  { label: '跨境电商出口退税', value: 'export_tax_rebate' },
  { label: '海外仓补贴', value: 'overseas_warehouse_subsidy' },
  { label: '产品认证补贴', value: 'certification_subsidy' },
  { label: '展会补贴', value: 'exhibition_subsidy' },
  { label: '物流补贴', value: 'logistics_subsidy' },
  { label: '培训补贴', value: 'training_subsidy' },
  { label: '创新研发资金', value: 'innovation_fund' },
  { label: '中小企业扶持', value: 'sme_support' },
  { label: '其他', value: 'other' },
];

function labelForEnjoyedPolicyValue(v: string) {
  const o = ENJOYED_POLICY_OPTIONS.find((x) => x.value === v);
  return o?.label ?? v;
}

function mapProductCategoriesToCascader(nodes) {
  if (!nodes?.length) return [];
  return nodes.map((n) => ({
    value: n.id,
    label: n.name,
    children: n.children?.length ? mapProductCategoriesToCascader(n.children) : undefined,
  }));
}

function findProductCategoryPath(nodes, targetId, path = []) {
  for (const n of nodes || []) {
    const next = [...path, n.id];
    if (n.id === targetId) return next;
    if (n.children?.length) {
      const sub = findProductCategoryPath(n.children, targetId, next);
      if (sub) return sub;
    }
  }
  return null;
}

/** 行业 Cascader：根据叶子 id 解析从根到叶的 value 路径 */
function findIndustryCascaderPath(nodes: any[], targetId: unknown, path: number[] = []): number[] | null {
  if (targetId == null || targetId === '') return null;
  const tid = Number(targetId);
  if (Number.isNaN(tid)) return null;
  for (const n of nodes || []) {
    const val = n.value as number;
    const next = [...path, val];
    if (val === tid) return next;
    if (n.children?.length) {
      const sub = findIndustryCascaderPath(n.children, targetId, next);
      if (sub) return sub;
    }
  }
  return null;
}

const { Title, Text } = Typography;

// 阶段顺序映射，用于判断升级/降级
const stageOrder: Record<string, number> = {
  '潜在企业': 1,
  '有明确需求': 2,
  '已对接': 3,
  '已签约': 4,
  '已落地': 5,
};

/** 新增字典项时生成唯一 value（后端按 category+value 唯一） */
function makeCustomDictionaryValue(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/** 编辑产品表单：去掉末尾 %，与 Input suffix 组合显示，避免视觉上出现 %% */
function stripTrailingPercentForInput(v: unknown): string | undefined {
  if (v == null) return undefined;
  const t = String(v).trim();
  if (!t) return undefined;
  const s = t.replace(/\s*%+\s*$/g, '').trim();
  return s || undefined;
}

/** 保存产品占比字段：用户只填数字或范围时自动补 % */
function ensurePercentSuffix(v: unknown): string | undefined {
  if (v == null) return undefined;
  const t = String(v).trim();
  if (!t) return undefined;
  return /%\s*$/.test(t) ? t : `${t}%`;
}

function EnterpriseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [dimensionSelections, setDimensionSelections] = useState<Record<string, string[]>>({});
  const [reqConfig, setReqConfig] = useState<RequirementConfigData | null>(null);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isEditEnterpriseOpen, setIsEditEnterpriseOpen] = useState(false);
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [editingContacts, setEditingContacts] = useState<Array<{
    id?: number;
    name: string;
    phone: string;
    position?: string;
    isPrimary?: boolean;
    email?: string;
    wechat?: string;
    remark?: string;
  }>>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isPatentModalOpen, setIsPatentModalOpen] = useState(false);
  const [editingPatent, setEditingPatent] = useState<any>(null);
  const [isProductOverviewModalOpen, setIsProductOverviewModalOpen] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isCrossborderPlatformModalOpen, setIsCrossborderPlatformModalOpen] = useState(false);
  const [isCrossborderBasicModalOpen, setIsCrossborderBasicModalOpen] = useState(false);
  const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);
  // 目标市场数据状态
  const [targetMarkets, setTargetMarkets] = useState<{ market: string; percentage: number }[]>([]);
  const [marketForm] = Form.useForm();
  const [isCrossborderNeedsModalOpen, setIsCrossborderNeedsModalOpen] = useState(false);
  const [isTriCenterCoopModalOpen, setIsTriCenterCoopModalOpen] = useState(false);
  const [isCrossborderPainModalOpen, setIsCrossborderPainModalOpen] = useState(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [isPreliminaryModalOpen, setIsPreliminaryModalOpen] = useState(false);
  const [isSupplementModalOpen, setIsSupplementModalOpen] = useState(false);
  const [isPolicySupportModalOpen, setIsPolicySupportModalOpen] = useState(false);
  const [isCompetitionModalOpen, setIsCompetitionModalOpen] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [competitionPosition, setCompetitionPosition] = useState('medium'); // 行业竞争地位: leader/medium/startup
  const [competitionDesc, setCompetitionDesc] = useState('');
  const [editingFollowUp, setEditingFollowUp] = useState<any>(null);
  const [isCooperating, setIsCooperating] = useState(true);
  const [serviceSummary, setServiceSummary] = useState<{ total: number; completed: number; inProgress: number; lastDate: string | null }>({ total: 0, completed: 0, inProgress: 0, lastDate: null });
  const [hasForeignTrade, setHasForeignTrade] = useState(false);
  const [hasCrossborderEcommerce, setHasCrossborderEcommerce] = useState(false);
  const [isSurveyed, setIsSurveyed] = useState(false);
  const [selectedCrossborderPlatforms, setSelectedCrossborderPlatforms] = useState<string[]>([]);
  const [selectedStage, setSelectedStage] = useState('');
  const [removedRequirements, setRemovedRequirements] = useState<string[]>([]);
  const [customRequirements, setCustomRequirements] = useState<{id: string; name: string; description: string; phase: string; category: string}[]>([]);
  const [isCustomRequirementModalOpen, setIsCustomRequirementModalOpen] = useState(false);
  const [isRestoreRequirementModalOpen, setIsRestoreRequirementModalOpen] = useState(false);
  const [restoreCategory, setRestoreCategory] = useState<{phase: string; category: string} | null>(null);
  const [isTradeChangeModalOpen, setIsTradeChangeModalOpen] = useState(false);
  const [tradeChangeSaving, setTradeChangeSaving] = useState(false);
  const [tradeChangeType, setTradeChangeType] = useState<'market' | 'mode' | 'category'>('market');
  const [tradeChangeDirection, setTradeChangeDirection] = useState<'up' | 'down'>('up');
  const [editingTradeChange, setEditingTradeChange] = useState<{name: string; rate: string} | null>(null);
  const [tradeChangeForm] = Form.useForm();
  /** 变化率输入框右侧固定显示 %，编辑已保存数据时去掉末尾 % 避免显示成「25%%」 */
  const stripTradeRatePercentForInput = (rate: unknown) => {
    if (rate == null || rate === '') return rate;
    const s = String(rate).trim();
    return s.endsWith('%') ? s.slice(0, -1).trim() : s;
  };
  const [isTradePerformanceModalOpen, setIsTradePerformanceModalOpen] = useState(false);
  const [tradePerformanceSaving, setTradePerformanceSaving] = useState(false);
  const [tradePerformanceForm] = Form.useForm();
  
  // 外贸业绩变化数据 - 从 API 加载后由 useEffect 赋值
  const [marketChanges, setMarketChanges] = useState<{up: any[]; down: any[]}>({ up: [], down: [] });
  const [modeChanges, setModeChanges] = useState<{up: any[]; down: any[]}>({ up: [], down: [] });
  const [categoryChanges, setCategoryChanges] = useState<{up: any[]; down: any[]}>({ up: [], down: [] });
  const [growthReasons, setGrowthReasons] = useState<string[]>([]);
  const [declineReasons, setDeclineReasons] = useState<string[]>([]);
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [reasonType, setReasonType] = useState<'growth' | 'decline'>('growth');
  const [editingReason, setEditingReason] = useState<{index: number; value: string} | null>(null);
  const [reasonForm] = Form.useForm();
  const [growthReasonSuggest, setGrowthReasonSuggest] = useState<{ value: string; label: string }[]>([]);
  const [declineReasonSuggest, setDeclineReasonSuggest] = useState<{ value: string; label: string }[]>([]);
  const [reasonModalSaving, setReasonModalSaving] = useState(false);

  const loadTradeReasonOptions = useCallback(async () => {
    try {
      const [g, d] = await Promise.all([
        optionsApi.getOptions('growth_reason'),
        optionsApi.getOptions('decline_reason'),
      ]);
      const mapList = (res: any) => {
        const list = res?.data ?? [];
        return Array.isArray(list)
          ? list.map((o: any) => ({ value: o.label, label: o.label }))
          : [];
      };
      setGrowthReasonSuggest(mapList(g));
      setDeclineReasonSuggest(mapList(d));
    } catch (e) {
      console.error('加载外贸原因字典失败', e);
    }
  }, []);

  useEffect(() => {
    loadTradeReasonOptions();
  }, [loadTradeReasonOptions]);

  const [customRequirementForm] = Form.useForm();
  const [followUpForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [productForm] = Form.useForm();
  const [brandForm] = Form.useForm();
  const [patentForm] = Form.useForm();
  const [productOverviewForm] = Form.useForm();
  const [tradeForm] = Form.useForm();
  const [crossborderForm] = Form.useForm();
  const [needsForm] = Form.useForm();
  const [coopForm] = Form.useForm();
  const [painForm] = Form.useForm();
  const [evalForm] = Form.useForm();
  const [prelimForm] = Form.useForm();
  const [supplementForm] = Form.useForm();
  const [policyForm] = Form.useForm();
  const [competitionForm] = Form.useForm();
  const [riskForm] = Form.useForm();

  // 企业数据状态
  const [enterprise, setEnterprise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enterpriseRecords, setEnterpriseRecords] = useState<any[]>([]);
  const [productCategoryTree, setProductCategoryTree] = useState<any[]>([]);

  const productCascaderOptions = useMemo(
    () => mapProductCategoriesToCascader(productCategoryTree),
    [productCategoryTree]
  );

  const loadEnterpriseFollowUps = useCallback(async (enterpriseId) => {
    if (!enterpriseId) return;
    try {
      const res = await followUpApi.getByEnterprise(enterpriseId);
      const list = (res.data || []).map((item) => ({
        id: item.id,
        enterprise_id: item.enterpriseId,
        enterprise_name: item.enterpriseName,
        follow_up_date: item.followDate,
        follow_up_person: item.followerName,
        follow_up_type: item.followType,
        content: item.content,
        overall_status: item.status,
        next_step: item.nextPlan,
        stage_before: item.stageFrom,
        stage_after: item.stageTo,
      }));
      setEnterpriseRecords(list);
    } catch (e) {
      console.error(e);
      setEnterpriseRecords([]);
    }
  }, []);
  const [industryCategories, setIndustryCategories] = useState<any[]>([]);
  
  // 选项数据状态
  const [staffSizeOptions, setStaffSizeOptions] = useState<any[]>([]);
  const [sourceOptions, setSourceOptions] = useState<any[]>([]);
  const [regionOptions, setRegionOptions] = useState<any[]>([]);
  const [tradeModeOptions, setTradeModeOptions] = useState<any[]>([]);
  const [tradeTeamModeOptions, setTradeTeamModeOptions] = useState<any[]>([]);
  const [certificationOptions, setCertificationOptions] = useState<any[]>([]);
  const [automationLevelOptionsProduct, setAutomationLevelOptionsProduct] = useState<any[]>([]);
  const [logisticsOptionsProduct, setLogisticsOptionsProduct] = useState<any[]>([]);

  // 加载行业分类
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await optionsApi.getIndustries();
        if (response.data) {
          // 转换为Cascader需要的格式
          const convertToOptions = (items: any[]): any[] => {
            return items.map(item => ({
              value: item.id,
              label: item.name,
              children: item.children ? convertToOptions(item.children) : undefined,
            }));
          };
          setIndustryCategories(convertToOptions(response.data));
        }
      } catch (error) {
        console.error('Failed to fetch industries:', error);
      }
    };
    fetchIndustries();
  }, []);

  // 加载选项数据
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [staffSize, source, region, tradeMode, tradeTeamMode, certification, automationLevel, logistics] =
          await Promise.all([
            optionsApi.getOptions('staff_size'),
            optionsApi.getOptions('source'),
            optionsApi.getOptions('region'),
            optionsApi.getOptions('trade_mode'),
            optionsApi.getOptions('trade_team_mode'),
            optionsApi.getOptions('certification'),
            optionsApi.getOptions('automation_level'),
            optionsApi.getOptions('logistics'),
          ]);
        if (staffSize.data) setStaffSizeOptions(staffSize.data.map((o: any) => ({ label: o.label, value: o.id })));
        if (source.data) setSourceOptions(source.data.map((o: any) => ({ label: o.label, value: o.id })));
        if (region.data) setRegionOptions(region.data.map((o: any) => ({ label: o.label, value: o.id })));
        if (tradeMode.data) setTradeModeOptions(tradeMode.data.map((o: any) => ({ label: o.label, value: o.id })));
        if (tradeTeamMode.data) setTradeTeamModeOptions(tradeTeamMode.data.map((o: any) => ({ label: o.label, value: o.id })));
        if (certification.data) {
          setCertificationOptions(certification.data.map((o: any) => ({ label: o.label, value: o.id })));
        }
        if (automationLevel.data) {
          setAutomationLevelOptionsProduct(automationLevel.data.map((o: any) => ({ label: o.label, value: o.id })));
        }
        if (logistics.data) {
          setLogisticsOptionsProduct(logistics.data.map((o: any) => ({ label: o.label, value: o.id })));
        }
      } catch (error) {
        console.error('Failed to fetch options:', error);
      }
    };
    fetchOptions();
  }, []);

  // 从API获取企业详情
  useEffect(() => {
    const fetchEnterprise = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await enterpriseApi.getDetail(Number(id));
        if (response.data) {
          // 转换API响应字段名为前端使用的字段名
          const data = response.data;
          setEnterprise({
            id: data.id,
            enterprise_name: data.name,
            unified_credit_code: data.creditCode,
            established_date: data.establishedDate,
            registered_capital: data.registeredCapital,
            province: data.province,
            city: data.city,
            district: data.district,
            detailed_address: data.address,
            industry: data.industryName,
            industry_id: data.industryId,
            enterprise_type: data.enterpriseType,
            employee_scale: data.staffSizeLabel,
            staff_size_id: data.staffSizeId,
            website: data.website,
            domestic_revenue: data.domesticRevenueLabel,
            domestic_revenue_id: data.domesticRevenueId,
            domestic_revenue_wan: data.domesticRevenueWan != null ? Number(data.domesticRevenueWan) : undefined,
            crossborder_revenue: data.crossBorderRevenueLabel,
            crossborder_revenue_wan: data.crossBorderRevenueWan != null ? Number(data.crossBorderRevenueWan) : undefined,
            crossborder_revenue_id: data.crossBorderRevenueId,
            source: data.sourceLabel,
            source_id: data.sourceId,
            funnel_stage: data.stage,
            stage_name: data.stageName,
            stage_color: data.stageColor,
            contacts: data.contacts || [],
            has_own_brand: data.hasOwnBrand,
            brand_names: data.brandNames,
            target_region_ids: data.targetRegionIds,
            target_country_ids: data.targetCountryIds,
            trade_mode_id: data.tradeModeId,
            trade_mode: data.tradeModeLabel,
            has_import_export_license: data.hasImportExportLicense,
            iso_certifications: data.isoCertifications,
            aeo_certification: data.aeoCertification,
            other_certifications: data.otherCertifications,
            customs_declaration_mode: data.customsDeclarationMode,
            trade_team_mode_id: data.tradeTeamModeId,
            trade_team_mode: data.tradeTeamModeLabel,
            trade_team_size: data.tradeTeamSize,
            has_domestic_ecommerce: data.hasDomesticEcommerce,
            last_year_revenue: data.lastYearRevenue,
            year_before_last_revenue: data.yearBeforeLastRevenue,
            market_changes: data.marketChanges,
            mode_changes: data.modeChanges,
            category_changes: data.categoryChanges,
            growth_reasons: data.growthReasons,
            decline_reasons: data.declineReasons,
            has_cross_border: data.hasCrossBorder,
            cross_border_ratio: data.crossBorderRatio,
            cross_border_logistics: data.crossBorderLogistics,
            payment_settlement: data.paymentSettlement,
            cross_border_team_size: data.crossBorderTeamSize,
            using_erp: data.usingErp,
            has_overseas_distributors:
              data.hasOverseasDistributors === true || data.hasOverseasDistributors === 1,
            transformation_willingness: data.transformationWillingness,
            investment_willingness: data.investmentWillingness,
            cross_border_platforms: data.crossBorderPlatforms,
            target_markets: data.targetMarkets,
            service_cooperation_rating: data.serviceCooperationRating,
            investment_cooperation_rating: data.investmentCooperationRating,
            incubation_cooperation_rating: data.incubationCooperationRating,
            brand_cooperation_rating: data.brandCooperationRating,
            training_cooperation_rating: data.trainingCooperationRating,
            overall_cooperation_rating: data.overallCooperationRating,
            benchmark_possibility: data.benchmarkPossibility,
            additional_notes: data.additionalNotes,
            has_policy_support: data.hasPolicySupport === true || data.hasPolicySupport === 1 ? 1 : 0,
            enjoyed_policies: data.enjoyedPolicies ?? [],
            competition_position: data.competitionPosition,
            competition_description: data.competitionDescription,
            pain_points: data.painPoints,
            current_risk_tags: data.currentRiskTags ?? [],
            risk_description: data.riskDescription,
            tricenter_demands: data.tricenterDemands,
            tricenter_concerns: data.tricenterConcerns,
            dimension_selections: data.dimensionSelections,
            removed_requirements: data.removedRequirements,
            custom_requirements: data.customRequirements,
            products: data.products || [],
            patents: data.patents || [],
            created_at: data.createdAt,
            updated_at: data.updatedAt,
          });
        }
      } catch (error: any) {
        console.error('Failed to fetch enterprise:', error);
        message.error('获取企业详情失败');
      } finally {
        setLoading(false);
      }
    };
    fetchEnterprise();
  }, [id]);

  useEffect(() => {
    optionsApi
      .getProductCategories()
      .then((res) => {
        if (res.data) setProductCategoryTree(res.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (enterprise?.id) loadEnterpriseFollowUps(enterprise.id);
  }, [enterprise?.id, loadEnterpriseFollowUps]);

  // 合作服务接口暂未实现，跳过请求
  // useEffect(() => {
  //   if (!id) return;
  //   serviceRecordApi.getList(Number(id)).then(res => { ... }).catch(() => {});
  // }, [id]);

  // 从API数据初始化本地状态
  useEffect(() => {
    if (!enterprise) return;

    // 外贸开关 - 有外贸相关数据时为 true
    const hasTrade = !!(enterprise.trade_mode_id || enterprise.has_import_export_license ||
      (enterprise.target_region_ids && enterprise.target_region_ids.length > 0) ||
      enterprise.last_year_revenue || enterprise.year_before_last_revenue);
    setHasForeignTrade(hasTrade);

    // 跨境电商开关
    setHasCrossborderEcommerce(!!enterprise.has_cross_border);

    // 合作开关 - 有评估评分或合作需求时为 true
    const hasCoop = !!(enterprise.service_cooperation_rating ||
      (enterprise.tricenter_demands && enterprise.tricenter_demands.length > 0));
    setIsCooperating(hasCoop);

    // 竞争力调研开关
    setIsSurveyed(!!enterprise.competition_position);
    if (enterprise.competition_position) setCompetitionPosition(enterprise.competition_position);
    setCompetitionDesc(enterprise.competition_description || '');

    // 外贸业绩变化数据（无数据时清空，避免沿用上一企业或初始假数据）
    if (enterprise.market_changes && typeof enterprise.market_changes === 'object') {
      setMarketChanges(enterprise.market_changes);
    } else {
      setMarketChanges({ up: [], down: [] });
    }
    if (enterprise.mode_changes && typeof enterprise.mode_changes === 'object') {
      setModeChanges(enterprise.mode_changes);
    } else {
      setModeChanges({ up: [], down: [] });
    }
    if (enterprise.category_changes && typeof enterprise.category_changes === 'object') {
      setCategoryChanges(enterprise.category_changes);
    } else {
      setCategoryChanges({ up: [], down: [] });
    }
    setGrowthReasons(
      Array.isArray(enterprise.growth_reasons) ? enterprise.growth_reasons : []
    );
    setDeclineReasons(
      Array.isArray(enterprise.decline_reasons) ? enterprise.decline_reasons : []
    );

    // 跨境平台
    if (enterprise.cross_border_platforms && Array.isArray(enterprise.cross_border_platforms) && enterprise.cross_border_platforms.length > 0) {
      setSelectedCrossborderPlatforms(enterprise.cross_border_platforms.map((p: any) => String(p)));
    } else {
      setSelectedCrossborderPlatforms([]);
    }

    // 目标市场
    if (enterprise.target_markets && Array.isArray(enterprise.target_markets) && enterprise.target_markets.length > 0) {
      setTargetMarkets(enterprise.target_markets);
    } else {
      setTargetMarkets([]);
    }

    // 需求分析
    if (enterprise.dimension_selections && typeof enterprise.dimension_selections === 'object') {
      setDimensionSelections(enterprise.dimension_selections);
    }
    if (enterprise.removed_requirements && Array.isArray(enterprise.removed_requirements)) {
      setRemovedRequirements(enterprise.removed_requirements);
    }
    if (enterprise.custom_requirements && Array.isArray(enterprise.custom_requirements)) {
      setCustomRequirements(enterprise.custom_requirements);
    }
  }, [enterprise?.id]);

  // 从数据库加载需求配置（需求列表 + 通用/增强标记 + 维度映射）
  useEffect(() => {
    (async () => {
      try {
        const res = await optionsApi.getRequirementConfig();
        setReqConfig((res as any).data || res);
      } catch {
        console.error('加载需求配置失败');
      }
    })();
  }, []);

  // 加载中状态
  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>加载中...</div>
        </div>
      </Card>
    );
  }

  if (!enterprise) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Title level={4}>企业不存在</Title>
          <Button type="primary" onClick={() => navigate('/enterprise')}>
            返回列表
          </Button>
        </div>
      </Card>
    );
  }

  const getStageInfo = (code: string) => {
    return FUNNEL_STAGES.find(s => s.code === code) || { name: code, color: '#94a3b8' };
  };

  const stageInfo = getStageInfo(enterprise.funnel_stage);

  // 通用字段保存辅助函数
  const saveEnterpriseFields = async (fields: Record<string, any>, successMsg: string) => {
    try {
      await enterpriseApi.update(enterprise.id, fields);
      setEnterprise((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...fields };
        // 与详情页初始映射一致：PUT 常用 camelCase，界面状态多为 snake_case，避免保存后弹窗/概览读错字段
        if (Object.prototype.hasOwnProperty.call(fields, 'targetRegionIds')) {
          next.target_region_ids = fields.targetRegionIds;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'targetCountryIds')) {
          next.target_country_ids = fields.targetCountryIds;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'hasImportExportLicense')) {
          next.has_import_export_license =
            fields.hasImportExportLicense === 1 || fields.hasImportExportLicense === true;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'lastYearRevenue')) {
          next.last_year_revenue = fields.lastYearRevenue;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'yearBeforeLastRevenue')) {
          next.year_before_last_revenue = fields.yearBeforeLastRevenue;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'currentRiskTags')) {
          next.current_risk_tags = fields.currentRiskTags;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'riskDescription')) {
          next.risk_description = fields.riskDescription;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'marketChanges')) {
          next.market_changes = fields.marketChanges;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'modeChanges')) {
          next.mode_changes = fields.modeChanges;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'categoryChanges')) {
          next.category_changes = fields.categoryChanges;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'growthReasons')) {
          next.growth_reasons = fields.growthReasons;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'declineReasons')) {
          next.decline_reasons = fields.declineReasons;
        }
        // 外贸信息：PUT 为 camelCase，详情展示为 snake_case + 选项标签
        if (Object.prototype.hasOwnProperty.call(fields, 'tradeModeId')) {
          next.trade_mode_id = fields.tradeModeId;
          if (fields.tradeModeId != null) {
            const opt = tradeModeOptions.find((o: any) => o.value === fields.tradeModeId);
            next.trade_mode = opt?.label ?? next.trade_mode;
          } else {
            next.trade_mode = undefined;
          }
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'customsDeclarationMode')) {
          next.customs_declaration_mode = fields.customsDeclarationMode;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'tradeTeamModeId')) {
          next.trade_team_mode_id = fields.tradeTeamModeId;
          if (fields.tradeTeamModeId != null) {
            const opt = tradeTeamModeOptions.find((o: any) => o.value === fields.tradeTeamModeId);
            next.trade_team_mode = opt?.label ?? next.trade_team_mode;
          } else {
            next.trade_team_mode = undefined;
          }
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'tradeTeamSize')) {
          next.trade_team_size = fields.tradeTeamSize;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'hasDomesticEcommerce')) {
          next.has_domestic_ecommerce = fields.hasDomesticEcommerce;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'hasOverseasDistributors')) {
          next.has_overseas_distributors =
            fields.hasOverseasDistributors === true || fields.hasOverseasDistributors === 1;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'hasCrossBorder')) {
          next.has_cross_border = fields.hasCrossBorder;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'crossBorderRatio')) {
          next.cross_border_ratio =
            fields.crossBorderRatio != null && fields.crossBorderRatio !== ''
              ? String(fields.crossBorderRatio)
              : undefined;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'crossBorderLogistics')) {
          next.cross_border_logistics = fields.crossBorderLogistics;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'paymentSettlement')) {
          next.payment_settlement = fields.paymentSettlement;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'crossBorderTeamSize')) {
          next.cross_border_team_size = fields.crossBorderTeamSize;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'usingErp')) {
          next.using_erp = fields.usingErp === 1 || fields.usingErp === true;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'transformationWillingness')) {
          next.transformation_willingness = fields.transformationWillingness;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'investmentWillingness')) {
          next.investment_willingness = fields.investmentWillingness;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'targetMarkets')) {
          next.target_markets = fields.targetMarkets;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'hasPolicySupport')) {
          next.has_policy_support =
            fields.hasPolicySupport === 1 || fields.hasPolicySupport === true ? 1 : 0;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'enjoyedPolicies')) {
          next.enjoyed_policies = fields.enjoyedPolicies ?? [];
        }
        return next;
      });
      message.success(successMsg);
      return true;
    } catch (error: any) {
      if (!error?.response) {
        message.error(error?.message || '保存失败');
      }
      return false;
    }
  };

  /** 市场/模式/品类变化 JSON 立即 PUT，并同步本地 state（用于子弹窗与 Tag 删除） */
  const persistTradePerformanceJson = async (
    nextMarket: { up: any[]; down: any[] },
    nextMode: { up: any[]; down: any[] },
    nextCategory: { up: any[]; down: any[] },
    successMsg = '外贸业绩变化已保存',
  ) => {
    const ok = await saveEnterpriseFields(
      {
        marketChanges: nextMarket,
        modeChanges: nextMode,
        categoryChanges: nextCategory,
      },
      successMsg,
    );
    if (ok) {
      setMarketChanges(nextMarket);
      setModeChanges(nextMode);
      setCategoryChanges(nextCategory);
    }
    return ok;
  };

  const handleStageChange = () => {
    message.success('阶段变更成功');
    setIsStageModalOpen(false);
  };

  const handleAddFollowUp = async () => {
    try {
      const values = await followUpForm.validateFields();
      if (editingFollowUp) {
        await followUpApi.update(editingFollowUp.id, {
          followType: values.follow_up_type,
          followDate: values.follow_up_date?.format('YYYY-MM-DD'),
          content: values.content,
          status: values.overall_status,
          nextPlan: values.next_step,
        });
        message.success('跟进记录更新成功');
      } else {
        await followUpApi.create({
          enterpriseId: enterprise.id,
          followType: values.follow_up_type,
          followDate: values.follow_up_date?.format('YYYY-MM-DD'),
          content: values.content,
          status: values.overall_status,
          nextPlan: values.next_step,
          stageAfter: values.stage_after,
        });
        message.success('跟进记录添加成功');
        if (values.stage_after) {
          const d = await enterpriseApi.getDetail(enterprise.id);
          if (d.data?.stage) {
            setEnterprise((prev) =>
              prev
                ? {
                    ...prev,
                    funnel_stage: d.data.stage,
                    stage_name: d.data.stageName,
                    stage_color: d.data.stageColor,
                  }
                : prev
            );
          }
        }
      }
      setIsFollowUpModalOpen(false);
      setEditingFollowUp(null);
      followUpForm.resetFields();
      await loadEnterpriseFollowUps(enterprise.id);
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e?.message || '操作失败');
    }
  };

  const handleEditFollowUp = (record: any) => {
    setEditingFollowUp(record);
    followUpForm.setFieldsValue({
      follow_up_type: record.follow_up_type,
      follow_up_date: record.follow_up_date ? dayjs(record.follow_up_date) : null,
      content: record.content,
      overall_status: record.overall_status,
      next_step: record.next_step,
      stage_after: record.stage_after,
    });
    setIsFollowUpModalOpen(true);
  };

  const handleDeleteFollowUp = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除该条跟进记录吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await followUpApi.delete(record.id);
          message.success('跟进记录删除成功');
          await loadEnterpriseFollowUps(enterprise.id);
        } catch (e) {
          message.error(e?.message || '删除失败');
        }
      },
    });
  };

  const handleEditEnterprise = async () => {
    try {
      const values = await editForm.validateFields();
      // 处理行业ID（Cascader返回数组，取最后一个值）
      const industryId = Array.isArray(values.industry_id) 
        ? values.industry_id[values.industry_id.length - 1] 
        : values.industry_id;
      const parseWan = (raw: unknown): number | null => {
        if (raw == null || raw === '') return null;
        const n = typeof raw === 'number' ? raw : Number(raw);
        return Number.isFinite(n) ? n : null;
      };
      // 构建更新数据
      const updateData = {
        name: values.enterprise_name,
        creditCode: values.unified_credit_code,
        establishedDate: values.established_date ? dayjs(values.established_date).format('YYYY-MM-DD') : undefined,
        registeredCapital: values.registered_capital != null ? `${values.registered_capital}万元` : undefined,
        province: values.province,
        city: values.city,
        district: values.district,
        address: values.detailed_address,
        industryId: industryId,
        enterpriseType: values.enterprise_type,
        staffSizeId: values.staff_size_id,
        website: values.website,
        domesticRevenueWanTouched: true,
        domesticRevenueWan: parseWan(values.domestic_revenue_wan),
        crossBorderRevenueWanTouched: true,
        crossBorderRevenueWan: parseWan(values.crossborder_revenue_wan),
        sourceId: values.source_id,
        hasImportExportLicense:
          values.hasImportExportLicense === true || values.hasImportExportLicense === 1 ? 1 : 0,
        isoCertifications: (values.iso_certifications ?? '').trim(),
        aeoCertification: (values.aeo_certification ?? '').trim(),
        otherCertifications: (values.other_certifications ?? '').trim(),
      };
      await enterpriseApi.update(enterprise.id, updateData);
      // 重新获取企业详情以更新显示
      const response = await enterpriseApi.getDetail(enterprise.id);
      if (response.data) {
        const data = response.data;
        setEnterprise({
          ...enterprise,
          enterprise_name: data.name,
          unified_credit_code: data.creditCode,
          established_date: data.establishedDate,
          registered_capital: data.registeredCapital,
          province: data.province,
          city: data.city,
          district: data.district,
          detailed_address: data.address,
          industry: data.industryName,
          industry_id: data.industryId,
          enterprise_type: data.enterpriseType,
          employee_scale: data.staffSizeLabel,
          staff_size_id: data.staffSizeId,
          website: data.website,
          domestic_revenue: data.domesticRevenueLabel,
          domestic_revenue_id: data.domesticRevenueId,
          domestic_revenue_wan: data.domesticRevenueWan != null ? Number(data.domesticRevenueWan) : undefined,
          crossborder_revenue: data.crossBorderRevenueLabel,
          crossborder_revenue_wan: data.crossBorderRevenueWan != null ? Number(data.crossBorderRevenueWan) : undefined,
          crossborder_revenue_id: data.crossBorderRevenueId,
          source: data.sourceLabel,
          source_id: data.sourceId,
          iso_certifications: data.isoCertifications,
          aeo_certification: data.aeoCertification,
          other_certifications: data.otherCertifications,
          has_import_export_license: data.hasImportExportLicense,
        });
      }
      message.success('企业信息更新成功');
      setIsEditEnterpriseOpen(false);
      editForm.resetFields();
    } catch (error: any) {
      if (error.errorFields) return; // 表单验证错误
      message.error(error.message || '更新失败');
    }
  };

  const handleEditContact = async () => {
    // 校验必填字段
    const invalid = editingContacts.some(c => !c.name?.trim() || !c.phone?.trim());
    if (invalid) {
      message.warning('请填写所有联系人的姓名和电话');
      return;
    }
    try {
      await contactApi.update(enterprise.id, editingContacts);
      // 更新本地状态
      setEnterprise({
        ...enterprise,
        contacts: editingContacts.map(c => ({
          ...c,
          is_primary: c.isPrimary,
        })),
      });
      message.success('联系人信息更新成功');
      setIsEditContactOpen(false);
    } catch (error: any) {
      message.error(error.message || '更新失败');
    }
  };

  const handleAddContact = () => {
    setEditingContacts(prev => [...prev, {
      name: '',
      phone: '',
      position: '',
      isPrimary: false,
      email: '',
      wechat: '',
      remark: '',
    }]);
  };

  const handleRemoveContact = (index: number) => {
    setEditingContacts(prev => prev.filter((_, i) => i !== index));
  };

  const handleContactFieldChange = (index: number, field: string, value: any) => {
    setEditingContacts(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    productForm.resetFields();
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    const catPath =
      product.categoryId != null ? findProductCategoryPath(productCategoryTree, product.categoryId) : null;
    const localPct =
      product.localProcurementRatio != null
        ? parseFloat(String(product.localProcurementRatio).replace(/[^\d.]/g, '')) || undefined
        : undefined;
    productForm.setFieldsValue({
      name: product.name,
      category: catPath || undefined,
      certification_ids: product.certificationIds || [],
      target_region_ids: product.targetRegionIds || [],
      target_country_ids: product.targetCountryIds || [],
      annual_sales: product.annualSales,
      export_ratio: stripTrailingPercentForInput(product.exportRatio),
      profit_margin: stripTrailingPercentForInput(product.profitMargin),
      local_procurement: localPct,
      automation_level_id: product.automationLevelId,
      annual_capacity: product.annualCapacity,
      logistics_partner_ids: product.logisticsPartnerIds || [],
    });
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (product: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除产品「${product.name}」吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          await productApi.delete(enterprise.id, product.id);
          message.success('产品已删除');
          const detail = await enterpriseApi.getDetail(enterprise.id);
          if (detail.data) {
            setEnterprise((prev) => (prev ? { ...prev, products: detail.data.products || [] } : prev));
          }
        } catch (e) {
          message.error(e?.message || '删除失败');
        }
      },
    });
  };

  const handleSaveProduct = async () => {
    try {
      const values = await productForm.validateFields();
      const categoryId =
        Array.isArray(values.category) && values.category.length
          ? values.category[values.category.length - 1]
          : values.category;
      const payload = {
        name: values.name,
        categoryId: categoryId ?? undefined,
        certificationIds:
          Array.isArray(values.certification_ids) && values.certification_ids.length
            ? values.certification_ids
            : undefined,
        targetRegionIds:
          Array.isArray(values.target_region_ids) && values.target_region_ids.length
            ? values.target_region_ids
            : undefined,
        targetCountryIds:
          Array.isArray(values.target_country_ids) && values.target_country_ids.length
            ? values.target_country_ids
            : undefined,
        annualSales:
          values.annual_sales != null && values.annual_sales !== ''
            ? String(values.annual_sales)
            : undefined,
        exportRatio: ensurePercentSuffix(values.export_ratio),
        profitMargin: ensurePercentSuffix(values.profit_margin),
        localProcurementRatio:
          values.local_procurement != null && values.local_procurement !== ''
            ? `${values.local_procurement}%`
            : undefined,
        automationLevelId: values.automation_level_id ?? undefined,
        annualCapacity: values.annual_capacity || undefined,
        logisticsPartnerIds:
          Array.isArray(values.logistics_partner_ids) && values.logistics_partner_ids.length
            ? values.logistics_partner_ids
            : undefined,
      };
      if (editingProduct?.id) {
        await productApi.update(enterprise.id, editingProduct.id, payload);
        message.success('产品信息更新成功');
      } else {
        await productApi.create(enterprise.id, payload);
        message.success('产品添加成功');
      }
      const detail = await enterpriseApi.getDetail(enterprise.id);
      if (detail.data) {
        setEnterprise((prev) => (prev ? { ...prev, products: detail.data.products || [] } : prev));
      }
      setIsProductModalOpen(false);
      productForm.resetFields();
      setEditingProduct(null);
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e?.message || '保存失败');
    }
  };

  const handleSaveBrand = async () => {
    try {
      const values = await brandForm.validateFields();
      const hasOwn = values.has_brand === true ? 1 : 0;
      const names = Array.isArray(values.brand_names) ? values.brand_names.filter(Boolean) : [];
      await enterpriseApi.update(enterprise.id, {
        hasOwnBrand: hasOwn,
        brandNames: names.length ? names.join(',') : '',
      });
      setEnterprise((prev: any) =>
        prev
          ? {
              ...prev,
              has_own_brand: hasOwn === 1,
              brand_names: names,
            }
          : prev
      );
      message.success('品牌信息更新成功');
      setIsBrandModalOpen(false);
      brandForm.resetFields();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || '保存失败');
    }
  };

  const handleAddPatent = () => {
    setEditingPatent(null);
    patentForm.resetFields();
    setIsPatentModalOpen(true);
  };

  const handleEditPatent = (patent: any) => {
    setEditingPatent(patent);
    patentForm.setFieldsValue({
      name: patent.name,
      patent_no: patent.patentNo,
    });
    setIsPatentModalOpen(true);
  };

  const handleDeletePatent = (patent: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除专利「${patent.name}」吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          await patentApi.delete(enterprise.id, patent.id);
          message.success('专利已删除');
          const detail = await enterpriseApi.getDetail(enterprise.id);
          if (detail.data) {
            setEnterprise((prev) => (prev ? { ...prev, patents: detail.data.patents || [] } : prev));
          }
        } catch (e) {
          message.error(e?.message || '删除失败');
        }
      },
    });
  };

  const handleSavePatent = async () => {
    try {
      const values = await patentForm.validateFields();
      const body = { name: values.name, patentNo: values.patent_no };
      if (editingPatent?.id) {
        await patentApi.update(enterprise.id, editingPatent.id, body);
        message.success('专利信息更新成功');
      } else {
        await patentApi.create(enterprise.id, body);
        message.success('专利添加成功');
      }
      const detail = await enterpriseApi.getDetail(enterprise.id);
      if (detail.data) {
        setEnterprise((prev) => (prev ? { ...prev, patents: detail.data.patents || [] } : prev));
      }
      setIsPatentModalOpen(false);
      patentForm.resetFields();
      setEditingPatent(null);
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e?.message || '保存失败');
    }
  };

  const openEditModal = (section: 'enterprise' | 'contact') => {
    if (section === 'enterprise') {
      editForm.setFieldsValue({
        enterprise_name: enterprise.enterprise_name,
        unified_credit_code: enterprise.unified_credit_code,
        established_date: enterprise.established_date ? dayjs(enterprise.established_date) : undefined,
        registered_capital: enterprise.registered_capital ? parseFloat(String(enterprise.registered_capital).replace(/[^\d.]/g, '')) || undefined : undefined,
        province: enterprise.province,
        city: enterprise.city,
        district: enterprise.district,
        industry_id:
          findIndustryCascaderPath(industryCategories, enterprise.industry_id) ??
          (enterprise.industry_id != null ? [enterprise.industry_id] : undefined),
        enterprise_type: enterprise.enterprise_type,
        staff_size_id: enterprise.staff_size_id,
        detailed_address: enterprise.detailed_address,
        domestic_revenue_wan: enterprise.domestic_revenue_wan ?? undefined,
        crossborder_revenue_wan: enterprise.crossborder_revenue_wan ?? undefined,
        source_id: enterprise.source_id,
        website: enterprise.website,
        iso_certifications: enterprise.iso_certifications ?? '',
        aeo_certification: enterprise.aeo_certification ?? '',
        other_certifications: enterprise.other_certifications ?? '',
        hasImportExportLicense:
          enterprise.has_import_export_license === true ||
          enterprise.has_import_export_license === 1 ||
          enterprise.has_import_export_license === '1',
      });
      setIsEditEnterpriseOpen(true);
    } else if (section === 'contact') {
      // 将现有联系人数据复制到编辑状态
      const contacts = (enterprise.contacts || []).map((c: any) => ({
        id: c.id,
        name: c.name || '',
        phone: c.phone || '',
        position: c.position || '',
        isPrimary: c.is_primary || c.isPrimary || false,
        email: c.email || '',
        wechat: c.wechat || '',
        remark: c.remark || '',
      }));
      setEditingContacts(contacts);
      setIsEditContactOpen(true);
    }
  };

  const recordColumns = [
    { title: '日期', dataIndex: 'follow_up_date', key: 'date', width: 120 },
    { title: '类型', dataIndex: 'follow_up_type', key: 'type', width: 80 },
    { title: '跟进内容', dataIndex: 'content', key: 'content' },
    { title: '跟进人', dataIndex: 'follow_up_person', key: 'person', width: 80 },
    {
      title: '阶段变化',
      key: 'stage_change',
      width: 320,
      render: (_: unknown, record: { stage_before?: string; stage_after?: string }) => {
        if (record.stage_before && record.stage_after && record.stage_before !== record.stage_after) {
          const stageBefore = getStageInfo(record.stage_before);
          const stageAfter = getStageInfo(record.stage_after);
          const beforeOrder = stageOrder[stageBefore.name] || 0;
          const afterOrder = stageOrder[stageAfter.name] || 0;
          const isUpgrade = afterOrder > beforeOrder;
          const themeColor = isUpgrade ? '#52c41a' : '#faad14';

          return (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                borderRadius: 20,
                background: isUpgrade 
                  ? 'linear-gradient(135deg, rgba(82,196,26,0.08) 0%, rgba(255,255,255,0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(250,173,20,0.08) 0%, rgba(255,255,255,0.95) 100%)',
                border: `1px solid ${isUpgrade ? 'rgba(82,196,26,0.2)' : 'rgba(250,173,20,0.2)'}`,
              }}
            >
              {/* 起始阶段 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 10px',
                  borderRadius: 12,
                  background: `${stageBefore.color}12`,
                  border: `1px solid ${stageBefore.color}30`,
                  fontSize: 12,
                  fontWeight: 500,
                  color: stageBefore.color,
                  whiteSpace: 'nowrap',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: stageBefore.color,
                    opacity: 0.6,
                  }}
                />
                {stageBefore.name}
              </div>

              {/* 箭头指示器 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  padding: '4px 8px',
                  borderRadius: 10,
                  background: `${themeColor}15`,
                }}
              >
                {isUpgrade ? (
                  <RiseOutlined style={{ fontSize: 14, color: themeColor }} />
                ) : (
                  <FallOutlined style={{ fontSize: 14, color: themeColor }} />
                )}
                <ArrowRightOutlined style={{ fontSize: 12, color: themeColor }} />
              </div>

              {/* 目标阶段 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 10px',
                  borderRadius: 12,
                  background: `${stageAfter.color}20`,
                  border: `1px solid ${stageAfter.color}50`,
                  fontSize: 12,
                  fontWeight: 600,
                  color: stageAfter.color,
                  whiteSpace: 'nowrap',
                  boxShadow: `0 2px 8px ${stageAfter.color}20`,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: stageAfter.color,
                  }}
                />
                {stageAfter.name}
              </div>
            </div>
          );
        }
        return <span style={{ color: '#bfbfbf', fontSize: 13 }}>—</span>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: any) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditFollowUp(record)}>编辑</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteFollowUp(record)}>删除</Button>
        </Space>
      ),
    },
  ];

  const handleExportExcel = async () => {
    if (!id) return;
    setExporting(true);
    try {
      const response = await surveyExcelApi.exportSingle(Number(id));
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `${enterprise?.enterprise_name || '企业'}_调研表_${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('导出成功，文件已下载');
    } catch (error) {
      console.error('Export failed:', error);
      message.error('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  const tabItems = [
    {
      key: 'basic',
      label: '基本信息',
      children: (
        <div style={{ padding: 16 }}>
          <Card 
            title={<span style={{ fontWeight: 600, fontSize: 15 }}>企业信息</span>}
            size="small" 
            style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} 
            headStyle={{ borderBottom: '1px solid #f0f0f0' }}
            extra={<Button type="link" icon={<EditOutlined />} onClick={() => openEditModal('enterprise')} style={{ fontWeight: 500 }}>编辑</Button>}
          >
            <Descriptions
              column={2}
              labelStyle={{ color: '#888', fontWeight: 500 }}
              contentStyle={{ color: '#333', fontWeight: 400, fontSize: 14 }}
            >
              <Descriptions.Item label="企业名称">{enterprise.enterprise_name}</Descriptions.Item>
              <Descriptions.Item label="统一社会信用代码">
                <span style={{ fontFamily: 'monospace' }}>{enterprise.unified_credit_code || '-'}</span>
              </Descriptions.Item>
              <Descriptions.Item label="成立日期">{enterprise.established_date || '-'}</Descriptions.Item>
              <Descriptions.Item label="注册资本">{enterprise.registered_capital || '-'}</Descriptions.Item>
              <Descriptions.Item label="所属行业">{enterprise.industry || '-'}</Descriptions.Item>
              <Descriptions.Item label="企业类型">{enterprise.enterprise_type}</Descriptions.Item>
              <Descriptions.Item label="人员规模">{enterprise.employee_scale || '-'}</Descriptions.Item>
              <Descriptions.Item label="省/市/区">
                {[enterprise.province, enterprise.city, enterprise.district].filter(Boolean).join(' / ') || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="详细地址">
                <Space>
                  <EnvironmentOutlined style={{ color: '#8c8c8c' }} />
                  {enterprise.detailed_address || '-'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="国内营收(万元)">
                {enterprise.domestic_revenue_wan != null && enterprise.domestic_revenue_wan !== ''
                  ? enterprise.domestic_revenue_wan
                  : enterprise.domestic_revenue || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="跨境营收(万元)">
                {enterprise.crossborder_revenue_wan != null && enterprise.crossborder_revenue_wan !== ''
                  ? enterprise.crossborder_revenue_wan
                  : enterprise.crossborder_revenue || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="企业来源">{enterprise.source || '-'}</Descriptions.Item>
              <Descriptions.Item label="官网">
                {enterprise.website ? (
                  <a
                    href={enterprise.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#333', fontWeight: 400, fontSize: 14, textDecoration: 'underline' }}
                  >
                    <GlobalOutlined style={{ marginRight: 4, color: '#8c8c8c' }} /> {enterprise.website}
                  </a>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="进出口经营权">
                {enterprise.has_import_export_license ? '有' : '无'}
              </Descriptions.Item>
              <Descriptions.Item label="ISO认证">{enterprise.iso_certifications || '-'}</Descriptions.Item>
              <Descriptions.Item label="AEO认证等级">{enterprise.aeo_certification || '-'}</Descriptions.Item>
              <Descriptions.Item label="其他资质证书">{enterprise.other_certifications || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
          <Card 
            title={<span style={{ fontWeight: 600, fontSize: 15 }}>联系人信息</span>}
            size="small" 
            style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} 
            headStyle={{ borderBottom: '1px solid #f0f0f0' }}
            extra={<Button type="link" icon={<EditOutlined />} onClick={() => openEditModal('contact')} style={{ fontWeight: 500 }}>编辑</Button>}
          >
            <Row gutter={16}>
              {enterprise.contacts.map((contact, index) => (
                <Col span={12} key={index}>
                  <Card
                    size="small"
                    style={{
                      background: contact.is_primary 
                        ? 'linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.05) 100%)' 
                        : '#fafafa',
                      border: contact.is_primary ? '1px solid rgba(102,126,234,0.2)' : '1px solid #f0f0f0',
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: contact.is_primary 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : '#e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 14
                      }}>
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{contact.name}</span>
                        {contact.is_primary && (
                          <span style={{
                            marginLeft: 8,
                            padding: '2px 8px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff',
                            borderRadius: 10,
                            fontSize: 11,
                            fontWeight: 500
                          }}>
                            <StarFilled style={{ marginRight: 3, fontSize: 10 }} />主要联系人
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: '#666', paddingLeft: 46 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <PhoneOutlined style={{ color: '#43e97b' }} /> 
                        <span style={{ fontFamily: 'monospace' }}>{contact.phone}</span>
                      </div>
                      {contact.position && (
                        <div style={{ marginTop: 6, color: '#888' }}>
                          职位: <span style={{ color: '#555' }}>{contact.position}</span>
                        </div>
                      )}
                      {contact.email && (
                        <div style={{ marginTop: 6, color: '#888' }}>
                          邮箱: <span style={{ color: '#555' }}>{contact.email}</span>
                        </div>
                      )}
                      {contact.wechat && (
                        <div style={{ marginTop: 6, color: '#888' }}>
                          微信: <span style={{ color: '#555' }}>{contact.wechat}</span>
                        </div>
                      )}
                      {contact.remark && (
                        <div style={{ marginTop: 6, color: '#888' }}>
                          备注: <span style={{ color: '#555' }}>{contact.remark}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </div>
      ),
    },
    {
      key: 'product',
      label: '产品信息',
      children: (
        <div style={{ padding: 16 }}>
          {/* 产品总体信息 */}
          {(() => {
            const products = (enterprise.products || []) as any[];
            const allCategories = [...new Set(products.map((p: any) => p.categoryName).filter(Boolean))];
            const allCerts = [...new Set(products.flatMap((p: any) => p.certificationNames || []))];
            const allLogistics = [...new Set(products.flatMap((p: any) => p.logisticsPartnerNames || []))];
            const totalSales = products.reduce((s: number, p: any) => {
              const v = parseFloat(String(p.annualSales || '0').replace(/[^\d.]/g, ''));
              return s + (isNaN(v) ? 0 : v);
            }, 0);
            // 企业级字段：用 regionOptions 解析 ID 为名称
            const regionIds: number[] = enterprise.target_region_ids || (enterprise as any).targetRegionIds || [];
            const regionNames = regionIds.map((id: number) => regionOptions.find((o: any) => o.value === id)?.label).filter(Boolean);
            const countryNames: string[] = enterprise.target_country_ids || (enterprise as any).targetCountryIds || [];
            // 与「编辑产品信息」弹窗 hasImportExportLicense 的判定一致，避免页面显示「-」而弹窗显示「否」
            const licRaw = enterprise.has_import_export_license ?? (enterprise as any).hasImportExportLicense;
            const hasImportExportLicenseYes =
              licRaw === true || licRaw === 1 || licRaw === '1';
            return (
              <Card
                size="small"
                title={<span style={{ fontWeight: 600, fontSize: 15 }}>产品总体概览</span>}
                style={{ marginBottom: 16, borderRadius: 8, border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                headStyle={{ borderBottom: '1px solid #f0f0f0' }}
                extra={<Button type="link" size="small" icon={<EditOutlined />} style={{ fontWeight: 500 }} onClick={() => setIsProductOverviewModalOpen(true)}>编辑</Button>}
              >
                <Row gutter={[20, 20]}>
                  <Col span={6}>
                    <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>主要销售区域</Text>
                      <div style={{ fontWeight: 500, color: '#333' }}>{regionNames.length > 0 ? regionNames.join('、') : '-'}</div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>主要销售国家</Text>
                      <div style={{ fontWeight: 500, color: '#333' }}>{countryNames.length > 0 ? countryNames.join('、') : '-'}</div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>是否有进出口资质</Text>
                      <div style={{ fontWeight: 500, color: '#333' }}>{hasImportExportLicenseYes ? '是' : '否'}</div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>产品数量</Text>
                      <div style={{ fontWeight: 600, color: '#333' }}>{products.length} <span style={{ fontSize: 13, fontWeight: 400, color: '#888' }}>个</span></div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>产品品类</Text>
                      <div style={{ fontWeight: 500, color: '#333' }}>{allCategories.length > 0 ? allCategories.join('、') : '-'}</div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>年销售额合计</Text>
                      <div style={{ fontWeight: 700, color: '#667eea', fontSize: 16 }}>{totalSales > 0 ? `${totalSales}万元` : '-'}</div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>产品认证</Text>
                      <div style={{ fontWeight: 500, color: '#333' }}>{allCerts.length > 0 ? allCerts.join('、') : '-'}</div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>物流合作方</Text>
                      <div style={{ fontWeight: 500, color: '#333' }}>{allLogistics.length > 0 ? allLogistics.join('、') : '-'}</div>
                    </div>
                  </Col>
                </Row>
              </Card>
            );
          })()}

          {/* 产品列表 */}
          <Card
            title={<span style={{ fontWeight: 600, fontSize: 15 }}>产品列表</span>}
            size="small"
            style={{ 
              marginBottom: 16, 
              borderRadius: 8, 
              border: 'none',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}
            headStyle={{ borderBottom: '1px solid #f0f0f0' }}
            extra={
              <Button 
                type="primary" 
                size="small" 
                icon={<PlusOutlined />}
                onClick={handleAddProduct}
                style={{
                  borderRadius: 6
                }}
              >
                添加产品
              </Button>
            }
          >
          {enterprise.products && enterprise.products.length > 0 ? (
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              {enterprise.products.map((product: any) => (
                <div key={product.id} style={{
                  padding: '16px 20px', borderRadius: 8, background: '#fafbfc',
                  border: '1px solid #f0f0f0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Text strong style={{ fontSize: 15 }}>{product.name}</Text>
                      {product.categoryName && (
                        <span style={{ padding: '3px 10px', background: 'rgba(102,126,234,0.08)', borderRadius: 4, color: '#667eea', fontSize: 13 }}>{product.categoryName}</span>
                      )}
                      {product.certificationNames?.map((cert: string, idx: number) => (
                        <span key={idx} style={{ padding: '3px 10px', background: 'rgba(67,233,123,0.08)', borderRadius: 4, color: '#389e0d', fontSize: 13 }}>{cert}</span>
                      ))}
                    </div>
                    <Space size={8}>
                      <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditProduct(product)}>编辑</Button>
                      <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteProduct(product)}>删除</Button>
                    </Space>
                  </div>
                  {(product.exportRatio || product.profitMargin) && (
                    <div style={{ fontSize: 13, color: '#666' }}>
                      {[product.exportRatio ? `出口占比 ${product.exportRatio}` : null, product.profitMargin ? `利润率 ${product.profitMargin}` : null]
                        .filter(Boolean)
                        .join('  ·  ')}
                    </div>
                  )}
                </div>
              ))}
            </Space>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>暂无产品信息，点击"添加产品"按钮添加</div>
          )}
          </Card>

          {/* 自主品牌 */}
          <Card
            size="small"
            title={<span style={{ fontWeight: 600, fontSize: 15 }}>自主品牌</span>}
            style={{ marginBottom: 16, borderRadius: 8, border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            headStyle={{ borderBottom: '1px solid #f0f0f0' }}
            extra={
              <Button type="link" size="small" icon={<EditOutlined />} style={{ fontWeight: 500 }}
                onClick={() => {
                  brandForm.setFieldsValue({
                    has_brand: !!(enterprise.has_own_brand === true || enterprise.has_own_brand === 1),
                    brand_names: enterprise.brand_names || [],
                  });
                  setIsBrandModalOpen(true);
                }}>编辑</Button>
            }
          >
            <Row gutter={[20, 20]}>
              <Col span={6}>
                <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>是否有自主品牌</Text>
                  <div style={{ fontWeight: 500, color: enterprise.has_own_brand ? '#333' : '#999' }}>
                    {enterprise.has_own_brand ? '是' : '否'}
                  </div>
                </div>
              </Col>
              <Col span={18}>
                <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>品牌名称</Text>
                  {enterprise.brand_names && enterprise.brand_names.length > 0 ? (
                    <Space size={12} wrap>
                      {enterprise.brand_names.map((brand: string, idx: number) => (
                        <span key={idx} style={{
                          padding: '6px 20px',
                          background: '#fff',
                          border: '1px solid #e8e8e8',
                          borderRadius: 6,
                          color: '#333',
                          fontSize: 14,
                          fontWeight: 600,
                          letterSpacing: 1,
                        }}>{brand}</span>
                      ))}
                    </Space>
                  ) : <span style={{ color: '#999' }}>-</span>}
                </div>
              </Col>
            </Row>
          </Card>

          {/* 核心技术/专利 */}
          <Card
            size="small"
            title={<span style={{ fontWeight: 600, fontSize: 15 }}>核心技术/专利</span>}
            style={{ borderRadius: 8, border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            headStyle={{ borderBottom: '1px solid #f0f0f0' }}
            extra={
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAddPatent}
                style={{ borderRadius: 6 }}>添加专利</Button>
            }
          >
            {enterprise.patents && enterprise.patents.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }} size={8}>
                {enterprise.patents.map((patent: any) => (
                  <div key={patent.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 8, background: '#fafbfc',
                    border: '1px solid #f0f0f0',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(102,126,234,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SafetyCertificateOutlined style={{ color: '#667eea', fontSize: 16 }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Text strong style={{ fontSize: 14 }}>{patent.name}</Text>
                        <span style={{ fontSize: 12, color: '#888' }}>
                          专利号: <span style={{ fontFamily: 'monospace' }}>{patent.patentNo || '-'}</span>
                        </span>
                      </div>
                    </div>
                    <Space size={4}>
                      <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditPatent(patent)}>编辑</Button>
                      <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeletePatent(patent)}>删除</Button>
                    </Space>
                  </div>
                ))}
              </Space>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>暂无专利信息，点击"添加专利"按钮添加</div>
            )}
          </Card>
        </div>
      ),
    },
    {
      key: 'trade',
      label: '外贸信息',
      children: (
        <div>
          {/* 是否开展外贸 */}
          <Card 
            size="small" 
            style={{ 
              marginBottom: 16, 
              borderRadius: 12, 
              border: hasForeignTrade ? '1px solid rgba(67,233,123,0.3)' : 'none', 
              boxShadow: hasForeignTrade ? '0 4px 12px rgba(67,233,123,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
              background: hasForeignTrade ? 'rgba(67,233,123,0.05)' : '#fff',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: hasForeignTrade ? '#43e97b' : '#d9d9d9',
                  transition: 'all 0.3s ease',
                  boxShadow: hasForeignTrade ? '0 0 8px rgba(67,233,123,0.5)' : 'none'
                }} />
                <Text strong style={{ fontSize: 15 }}>是否开展外贸业务</Text>
              </div>
              <Switch 
                checked={hasForeignTrade} 
                onChange={setHasForeignTrade}
                checkedChildren="是" 
                unCheckedChildren="否"
              />
            </div>
          </Card>

          {/* 是否有海外分销商：仅在下方面板只读展示，通过「编辑」弹窗与主表 PUT 一并保存 */}
          {/* 外贸详细信息 - 仅在开展外贸时显示 */}
          <div style={{
            maxHeight: hasForeignTrade ? 3000 : 0,
            overflow: 'hidden',
            opacity: hasForeignTrade ? 1 : 0,
            transition: 'all 0.4s ease-in-out'
          }}>
            <Card 
              size="small" 
              style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              extra={<Button type="link" icon={<EditOutlined />} style={{ fontWeight: 500 }} onClick={() => setIsTradeModalOpen(true)}>编辑</Button>}
            >
              <Row gutter={[20, 20]}>
                <Col span={8}>
                  <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>外贸模式</Text>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#333', lineHeight: 1.5 }}>{enterprise.trade_mode || '-'}</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>报关申报主体模式</Text>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#333', lineHeight: 1.5 }}>{enterprise.customs_declaration_mode || '-'}</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>外贸业务团队模式</Text>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#333', lineHeight: 1.5 }}>{enterprise.trade_team_mode || '-'}</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>外贸团队人数</Text>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#333', lineHeight: 1.5 }}>
                      {enterprise.trade_team_size != null && enterprise.trade_team_size !== '' ? (
                        <>
                          {enterprise.trade_team_size}
                          <span style={{ fontSize: 14, fontWeight: 500, color: '#666' }}> 人</span>
                        </>
                      ) : (
                        '-'
                      )}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>是否有国内电商经验</Text>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#333', lineHeight: 1.5 }}>{enterprise.has_domestic_ecommerce ? '是' : '否'}</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>是否有海外分销商</Text>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#333', lineHeight: 1.5 }}>{enterprise.has_overseas_distributors ? '是' : '否'}</div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* 外贸业绩分析 */}
            <Card 
              size="small" 
              title={<span style={{ fontWeight: 600, fontSize: 15 }}>外贸业绩分析</span>}
              style={{ marginTop: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              headStyle={{ borderBottom: '1px solid #f0f0f0' }}
              extra={(
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  style={{ fontWeight: 500 }}
                  onClick={() => {
                    tradePerformanceForm.setFieldsValue({
                      yearBeforeLastRevenue: enterprise.year_before_last_revenue ?? undefined,
                      lastYearRevenue: enterprise.last_year_revenue ?? undefined,
                    });
                    setIsTradePerformanceModalOpen(true);
                  }}
                >
                  编辑
                </Button>
              )}
            >
              {/* 核心指标 - 年份动态计算（无后端数据时显示占位，不使用演示数字） */}
              {(() => {
                const currentYear = new Date().getFullYear();
                const lastYear = currentYear - 1;
                const yearBeforeLast = currentYear - 2;
                const parseWan = (v: unknown): number | null => {
                  if (v === null || v === undefined || v === '') return null;
                  const n = Number(v);
                  return Number.isFinite(n) ? n : null;
                };
                const lastYearRevenue = parseWan(enterprise.last_year_revenue);
                const yearBeforeLastRevenue = parseWan(enterprise.year_before_last_revenue);
                const canComputeGrowth =
                  lastYearRevenue != null &&
                  yearBeforeLastRevenue != null &&
                  yearBeforeLastRevenue > 0;
                const growthRate = canComputeGrowth
                  ? ((lastYearRevenue - yearBeforeLastRevenue) / yearBeforeLastRevenue * 100).toFixed(1)
                  : null;
                const isPositive = growthRate != null && Number(growthRate) >= 0;
                const wanCell = (v: number | null) =>
                  v != null ? (
                    <>
                      {v}
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#888' }}> 万元</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 22, fontWeight: 600, color: '#bfbfbf' }}>—</span>
                  );

                return (
                  <Row gutter={16} style={{ marginBottom: 20 }}>
                    <Col span={8}>
                      <div style={{ 
                        padding: '20px', 
                        background: 'rgba(102,126,234,0.05)', 
                        borderRadius: 12,
                        border: '1px solid rgba(102,126,234,0.2)',
                        textAlign: 'center'
                      }}>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>{yearBeforeLast}年外贸营业额</Text>
                        <div style={{ fontWeight: 700, color: '#667eea', fontSize: 28 }}>{wanCell(yearBeforeLastRevenue)}</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ 
                        padding: '20px', 
                        background: 'rgba(250,173,20,0.05)', 
                        borderRadius: 12,
                        border: '1px solid rgba(250,173,20,0.2)',
                        textAlign: 'center'
                      }}>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>{lastYear}年外贸营业额</Text>
                        <div style={{ fontWeight: 700, color: '#faad14', fontSize: 28 }}>{wanCell(lastYearRevenue)}</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ 
                        padding: '20px', 
                        background: growthRate != null && isPositive ? 'rgba(67,233,123,0.05)' : 'rgba(239,68,68,0.05)', 
                        borderRadius: 12,
                        border: growthRate != null && isPositive ? '1px solid rgba(67,233,123,0.2)' : '1px solid rgba(239,68,68,0.2)',
                        textAlign: 'center'
                      }}>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>同比增长率</Text>
                        <div style={{ fontWeight: 700, color: growthRate == null ? '#bfbfbf' : isPositive ? '#43e97b' : '#ef4444', fontSize: 28 }}>
                          {growthRate != null ? (
                            <>
                              {isPositive ? '+' : ''}
                              {growthRate}
                              <span style={{ fontSize: 14, fontWeight: 500 }}>%</span>
                            </>
                          ) : (
                            <span style={{ fontSize: 22, fontWeight: 600 }}>—</span>
                          )}
                        </div>
                      </div>
                    </Col>
                  </Row>
                );
              })()}

              {/* 市场变化 */}
              <div style={{ marginBottom: 20 }}>
                <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 12, color: '#333' }}>市场变化</Text>
                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ 
                      padding: '14px 16px', 
                      background: 'rgba(67,233,123,0.05)', 
                      borderRadius: 10,
                      border: '1px solid rgba(67,233,123,0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#43e97b' }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>增长市场</Text>
                        </div>
                        <Button type="link" size="small" icon={<PlusOutlined />} style={{ padding: 0, height: 'auto', fontSize: 12 }}
                          onClick={() => { setTradeChangeType('market'); setTradeChangeDirection('up'); setEditingTradeChange(null); tradeChangeForm.resetFields(); setIsTradeChangeModalOpen(true); }}>
                          添加
                        </Button>
                      </div>
                      <Space size={8} wrap>
                        {marketChanges.up.map((item, idx) => (
                          <Tag key={idx} color="green" closable style={{ borderRadius: 4, fontWeight: 500 }}
                            onClose={() => setMarketChanges(prev => ({ ...prev, up: prev.up.filter((_, i) => i !== idx) }))}>
                            <span style={{ cursor: 'pointer' }} onClick={() => { setTradeChangeType('market'); setTradeChangeDirection('up'); setEditingTradeChange(item); tradeChangeForm.setFieldsValue({ ...item, rate: stripTradeRatePercentForInput(item.rate) }); setIsTradeChangeModalOpen(true); }}>
                              {item.name} {item.rate}
                            </span>
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ 
                      padding: '14px 16px', 
                      background: 'rgba(255,77,79,0.05)', 
                      borderRadius: 10,
                      border: '1px solid rgba(255,77,79,0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4d4f' }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>下降市场</Text>
                        </div>
                        <Button type="link" size="small" icon={<PlusOutlined />} style={{ padding: 0, height: 'auto', fontSize: 12 }}
                          onClick={() => { setTradeChangeType('market'); setTradeChangeDirection('down'); setEditingTradeChange(null); tradeChangeForm.resetFields(); setIsTradeChangeModalOpen(true); }}>
                          添加
                        </Button>
                      </div>
                      <Space size={8} wrap>
                        {marketChanges.down.map((item, idx) => (
                          <Tag key={idx} color="red" closable style={{ borderRadius: 4, fontWeight: 500 }}
                            onClose={() => {
                              const next = { ...marketChanges, down: marketChanges.down.filter((_, i) => i !== idx) };
                              void persistTradePerformanceJson(next, modeChanges, categoryChanges);
                            }}>
                            <span style={{ cursor: 'pointer' }} onClick={() => { setTradeChangeType('market'); setTradeChangeDirection('down'); setEditingTradeChange(item); tradeChangeForm.setFieldsValue({ ...item, rate: stripTradeRatePercentForInput(item.rate) }); setIsTradeChangeModalOpen(true); }}>
                              {item.name} {item.rate}
                            </span>
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* 模式变化 */}
              <div style={{ marginBottom: 20 }}>
                <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 12, color: '#333' }}>模式变化</Text>
                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ 
                      padding: '14px 16px', 
                      background: 'rgba(67,233,123,0.05)', 
                      borderRadius: 10,
                      border: '1px solid rgba(67,233,123,0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#43e97b' }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>增长模式</Text>
                        </div>
                        <Button type="link" size="small" icon={<PlusOutlined />} style={{ padding: 0, height: 'auto', fontSize: 12 }}
                          onClick={() => { setTradeChangeType('mode'); setTradeChangeDirection('up'); setEditingTradeChange(null); tradeChangeForm.resetFields(); setIsTradeChangeModalOpen(true); }}>
                          添加
                        </Button>
                      </div>
                      <Space size={8} wrap>
                        {modeChanges.up.map((item, idx) => (
                          <Tag key={idx} color="green" closable style={{ borderRadius: 4, fontWeight: 500 }}
                            onClose={() => {
                              const next = { ...modeChanges, up: modeChanges.up.filter((_, i) => i !== idx) };
                              void persistTradePerformanceJson(marketChanges, next, categoryChanges);
                            }}>
                            <span style={{ cursor: 'pointer' }} onClick={() => { setTradeChangeType('mode'); setTradeChangeDirection('up'); setEditingTradeChange(item); tradeChangeForm.setFieldsValue({ ...item, rate: stripTradeRatePercentForInput(item.rate) }); setIsTradeChangeModalOpen(true); }}>
                              {item.name} {item.rate}
                            </span>
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ 
                      padding: '14px 16px', 
                      background: 'rgba(255,77,79,0.05)', 
                      borderRadius: 10,
                      border: '1px solid rgba(255,77,79,0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4d4f' }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>下降模式</Text>
                        </div>
                        <Button type="link" size="small" icon={<PlusOutlined />} style={{ padding: 0, height: 'auto', fontSize: 12 }}
                          onClick={() => { setTradeChangeType('mode'); setTradeChangeDirection('down'); setEditingTradeChange(null); tradeChangeForm.resetFields(); setIsTradeChangeModalOpen(true); }}>
                          添加
                        </Button>
                      </div>
                      <Space size={8} wrap>
                        {modeChanges.down.map((item, idx) => (
                          <Tag key={idx} color="red" closable style={{ borderRadius: 4, fontWeight: 500 }}
                            onClose={() => {
                              const next = { ...modeChanges, down: modeChanges.down.filter((_, i) => i !== idx) };
                              void persistTradePerformanceJson(marketChanges, next, categoryChanges);
                            }}>
                            <span style={{ cursor: 'pointer' }} onClick={() => { setTradeChangeType('mode'); setTradeChangeDirection('down'); setEditingTradeChange(item); tradeChangeForm.setFieldsValue({ ...item, rate: stripTradeRatePercentForInput(item.rate) }); setIsTradeChangeModalOpen(true); }}>
                              {item.name} {item.rate}
                            </span>
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* 品类变化 */}
              <div style={{ marginBottom: 20 }}>
                <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 12, color: '#333' }}>品类变化</Text>
                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ 
                      padding: '14px 16px', 
                      background: 'rgba(67,233,123,0.05)', 
                      borderRadius: 10,
                      border: '1px solid rgba(67,233,123,0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#43e97b' }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>增长品类</Text>
                        </div>
                        <Button type="link" size="small" icon={<PlusOutlined />} style={{ padding: 0, height: 'auto', fontSize: 12 }}
                          onClick={() => { setTradeChangeType('category'); setTradeChangeDirection('up'); setEditingTradeChange(null); tradeChangeForm.resetFields(); setIsTradeChangeModalOpen(true); }}>
                          添加
                        </Button>
                      </div>
                      <Space size={8} wrap>
                        {categoryChanges.up.map((item, idx) => (
                          <Tag key={idx} color="green" closable style={{ borderRadius: 4, fontWeight: 500 }}
                            onClose={() => {
                              const next = { ...categoryChanges, up: categoryChanges.up.filter((_, i) => i !== idx) };
                              void persistTradePerformanceJson(marketChanges, modeChanges, next);
                            }}>
                            <span style={{ cursor: 'pointer' }} onClick={() => { setTradeChangeType('category'); setTradeChangeDirection('up'); setEditingTradeChange(item); tradeChangeForm.setFieldsValue({ ...item, rate: stripTradeRatePercentForInput(item.rate) }); setIsTradeChangeModalOpen(true); }}>
                              {item.name} {item.rate}
                            </span>
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ 
                      padding: '14px 16px', 
                      background: 'rgba(255,77,79,0.05)', 
                      borderRadius: 10,
                      border: '1px solid rgba(255,77,79,0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4d4f' }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>下降品类</Text>
                        </div>
                        <Button type="link" size="small" icon={<PlusOutlined />} style={{ padding: 0, height: 'auto', fontSize: 12 }}
                          onClick={() => { setTradeChangeType('category'); setTradeChangeDirection('down'); setEditingTradeChange(null); tradeChangeForm.resetFields(); setIsTradeChangeModalOpen(true); }}>
                          添加
                        </Button>
                      </div>
                      <Space size={8} wrap>
                        {categoryChanges.down.map((item, idx) => (
                          <Tag key={idx} color="red" closable style={{ borderRadius: 4, fontWeight: 500 }}
                            onClose={() => {
                              const next = { ...categoryChanges, down: categoryChanges.down.filter((_, i) => i !== idx) };
                              void persistTradePerformanceJson(marketChanges, modeChanges, next);
                            }}>
                            <span style={{ cursor: 'pointer' }} onClick={() => { setTradeChangeType('category'); setTradeChangeDirection('down'); setEditingTradeChange(item); tradeChangeForm.setFieldsValue({ ...item, rate: stripTradeRatePercentForInput(item.rate) }); setIsTradeChangeModalOpen(true); }}>
                              {item.name} {item.rate}
                            </span>
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* 原因分析 */}
              <div>
                <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 12, color: '#333' }}>原因分析</Text>
                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ 
                      padding: '14px 16px', 
                      background: 'rgba(67,233,123,0.05)', 
                      borderRadius: 10,
                      border: '1px solid rgba(67,233,123,0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#43e97b' }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>增长原因</Text>
                        </div>
                        <Button type="link" size="small" icon={<PlusOutlined />} style={{ padding: 0, height: 'auto', fontSize: 12 }}
                          onClick={() => { setReasonType('growth'); setEditingReason(null); reasonForm.resetFields(); setIsReasonModalOpen(true); }}>
                          添加
                        </Button>
                      </div>
                      <Space direction="vertical" size={8} style={{ width: '100%' }}>
                        {growthReasons.map((reason, idx) => (
                          <div key={idx} style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '8px 12px', background: 'rgba(255,255,255,0.8)', borderRadius: 6
                          }}>
                            <span style={{ fontSize: 13, color: '#333', cursor: 'pointer' }}
                              onClick={() => { setReasonType('growth'); setEditingReason({ index: idx, value: reason }); reasonForm.setFieldsValue({ reason }); setIsReasonModalOpen(true); }}>
                              {reason}
                            </span>
                            <CloseOutlined style={{ fontSize: 10, color: '#999', cursor: 'pointer' }}
                              onClick={() => setGrowthReasons(prev => prev.filter((_, i) => i !== idx))} />
                          </div>
                        ))}
                      </Space>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ 
                      padding: '14px 16px', 
                      background: 'rgba(255,77,79,0.05)', 
                      borderRadius: 10,
                      border: '1px solid rgba(255,77,79,0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4d4f' }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>下降原因</Text>
                        </div>
                        <Button type="link" size="small" icon={<PlusOutlined />} style={{ padding: 0, height: 'auto', fontSize: 12 }}
                          onClick={() => { setReasonType('decline'); setEditingReason(null); reasonForm.resetFields(); setIsReasonModalOpen(true); }}>
                          添加
                        </Button>
                      </div>
                      <Space direction="vertical" size={8} style={{ width: '100%' }}>
                        {declineReasons.map((reason, idx) => (
                          <div key={idx} style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '8px 12px', background: 'rgba(255,255,255,0.8)', borderRadius: 6
                          }}>
                            <span style={{ fontSize: 13, color: '#333', cursor: 'pointer' }}
                              onClick={() => { setReasonType('decline'); setEditingReason({ index: idx, value: reason }); reasonForm.setFieldsValue({ reason }); setIsReasonModalOpen(true); }}>
                              {reason}
                            </span>
                            <CloseOutlined style={{ fontSize: 10, color: '#999', cursor: 'pointer' }}
                              onClick={() => setDeclineReasons(prev => prev.filter((_, i) => i !== idx))} />
                          </div>
                        ))}
                      </Space>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </div>
        </div>
      ),
    },
    {
      key: 'crossborder',
      label: '线上跨境电商',
      children: (
        <div style={{ padding: 16 }}>
          {/* 是否开展跨境电商 */}
          <Card 
            size="small" 
            style={{ 
              marginBottom: 16, 
              borderRadius: 12, 
              border: hasCrossborderEcommerce ? '1px solid rgba(102,126,234,0.3)' : 'none', 
              boxShadow: hasCrossborderEcommerce ? '0 4px 12px rgba(102,126,234,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
              background: hasCrossborderEcommerce ? 'rgba(102,126,234,0.05)' : '#fff',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: hasCrossborderEcommerce ? '#667eea' : '#d9d9d9',
                  transition: 'all 0.3s ease',
                  boxShadow: hasCrossborderEcommerce ? '0 0 8px rgba(102,126,234,0.5)' : 'none'
                }} />
                <Text strong style={{ fontSize: 15 }}>是否开展跨境电商业务</Text>
              </div>
              <Switch 
                checked={hasCrossborderEcommerce} 
                onChange={setHasCrossborderEcommerce}
                checkedChildren="是" 
                unCheckedChildren="否"
              />
            </div>
          </Card>

          {/* 跨境电商详细信息 - 仅在开展跨境电商时显示 */}
          <div style={{
            maxHeight: hasCrossborderEcommerce ? 2000 : 0,
            overflow: 'hidden',
            opacity: hasCrossborderEcommerce ? 1 : 0,
            transition: 'all 0.4s ease-in-out'
          }}>
          
          {/* 主要跨境平台 */}
          <Card 
            title={<span style={{ fontWeight: 600, fontSize: 15 }}>主要跨境平台</span>}
            size="small" 
            style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} 
            headStyle={{ borderBottom: '1px solid #f5f5f5' }}
            extra={<Button type="link" size="small" icon={<EditOutlined />} style={{ fontWeight: 500 }} onClick={() => setIsCrossborderPlatformModalOpen(true)}>编辑</Button>}
          >
            <Space size={16} wrap>
              {(() => {
                const platformConfigs: Record<string, { name: string; subName: string; letter: string; gradient: string; border: string; shadow: string }> = {
                  '亚马逊 (Amazon)': { name: '亚马逊', subName: 'Amazon', letter: 'A', gradient: 'rgba(250,140,22,0.05)', border: '1px solid rgba(250,140,22,0.2)', shadow: 'none' },
                  '阿里国际站 (Alibaba.com)': { name: '阿里国际站', subName: 'Alibaba.com', letter: '阿', gradient: 'rgba(212,56,13,0.05)', border: '1px solid rgba(212,56,13,0.2)', shadow: 'none' },
                  'TikTok Shop': { name: 'TikTok Shop', subName: 'TikTok', letter: 'T', gradient: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.2)', shadow: 'none' },
                  '速卖通 (AliExpress)': { name: '速卖通', subName: 'AliExpress', letter: 'A', gradient: 'rgba(255,77,79,0.05)', border: '1px solid rgba(255,77,79,0.2)', shadow: 'none' },
                  'eBay': { name: 'eBay', subName: 'eBay.com', letter: 'E', gradient: 'rgba(102,126,234,0.05)', border: '1px solid rgba(102,126,234,0.2)', shadow: 'none' },
                  '独立站 (Shopify)': { name: '独立站', subName: 'Shopify', letter: '独', gradient: 'rgba(67,233,123,0.05)', border: '1px solid rgba(67,233,123,0.2)', shadow: 'none' },
                  'Temu': { name: 'Temu', subName: 'Temu.com', letter: 'T', gradient: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.2)', shadow: 'none' },
                  'SHEIN': { name: 'SHEIN', subName: 'SHEIN.com', letter: 'S', gradient: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.2)', shadow: 'none' },
                  '沃尔玛 (Walmart)': { name: '沃尔玛', subName: 'Walmart', letter: 'W', gradient: 'rgba(0,113,220,0.05)', border: '1px solid rgba(0,113,220,0.2)', shadow: 'none' },
                  'Lazada': { name: 'Lazada', subName: 'Lazada.com', letter: 'L', gradient: 'rgba(15,76,129,0.05)', border: '1px solid rgba(15,76,129,0.2)', shadow: 'none' },
                  'Shopee': { name: 'Shopee', subName: 'Shopee.com', letter: 'S', gradient: 'rgba(238,77,45,0.05)', border: '1px solid rgba(238,77,45,0.2)', shadow: 'none' },
                  'Wish': { name: 'Wish', subName: 'Wish.com', letter: 'W', gradient: 'rgba(0,150,199,0.05)', border: '1px solid rgba(0,150,199,0.2)', shadow: 'none' },
                  'Etsy': { name: 'Etsy', subName: 'Etsy.com', letter: 'E', gradient: 'rgba(242,101,34,0.05)', border: '1px solid rgba(242,101,34,0.2)', shadow: 'none' },
                  'Wayfair': { name: 'Wayfair', subName: 'Wayfair.com', letter: 'W', gradient: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.2)', shadow: 'none' },
                  'Mercado Libre': { name: 'Mercado Libre', subName: 'MercadoLibre', letter: 'M', gradient: 'rgba(255,229,0,0.05)', border: '1px solid rgba(255,229,0,0.2)', shadow: 'none' },
                  '乐天 (Rakuten)': { name: '乐天', subName: 'Rakuten', letter: 'R', gradient: 'rgba(191,0,0,0.05)', border: '1px solid rgba(191,0,0,0.2)', shadow: 'none' },
                  '京东国际 (JD Global)': { name: '京东国际', subName: 'JD Global', letter: '京', gradient: 'rgba(225,37,27,0.05)', border: '1px solid rgba(225,37,27,0.2)', shadow: 'none' },
                  '其他': { name: '其他', subName: 'Other', letter: '其', gradient: 'rgba(156,163,175,0.05)', border: '1px solid rgba(156,163,175,0.2)', shadow: 'none' },
                };
                const iconColors: Record<string, string> = {
                  '亚马逊 (Amazon)': '#fa8c16',
                  '阿里国际站 (Alibaba.com)': '#d4380d',
                  'TikTok Shop': '#000000',
                  '速卖通 (AliExpress)': '#ff4d4f',
                  'eBay': '#667eea',
                  '独立站 (Shopify)': '#43e97b',
                  'Temu': '#ff6b35',
                  'SHEIN': '#404040',
                  '沃尔玛 (Walmart)': '#0071dc',
                  'Lazada': '#0f4c81',
                  'Shopee': '#ee4d2d',
                  'Wish': '#0096c7',
                  'Etsy': '#f26522',
                  'Wayfair': '#7c3aed',
                  'Mercado Libre': '#ffeb3b',
                  '乐天 (Rakuten)': '#dc2626',
                  '京东国际 (JD Global)': '#e1251b',
                  '其他': '#9ca3af',
                };
                return selectedCrossborderPlatforms.map((platform) => {
                  const config = platformConfigs[platform] || { name: platform, subName: '', letter: platform.charAt(0), gradient: 'rgba(102,126,234,0.05)', border: '1px solid rgba(102,126,234,0.2)', shadow: 'none' };
                  const iconColor = iconColors[platform] || '#667eea';
                  return (
                    <div key={platform} style={{ 
                      padding: '16px 20px', 
                      background: config.gradient, 
                      borderRadius: 12,
                      border: config.border,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      minWidth: 180
                    }}>
                      <div style={{ 
                        width: 44, 
                        height: 44, 
                        background: iconColor, 
                        borderRadius: 12, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: config.shadow
                      }}>
                        <span style={{ color: '#fff', fontWeight: 'bold', fontSize: config.letter.length > 1 ? 16 : 18 }}>{config.letter}</span>
                      </div>
                      <div>
                        <Text strong style={{ fontSize: 15 }}>{config.name}</Text>
                        <div style={{ fontSize: 12, color: '#999' }}>{config.subName}</div>
                      </div>
                    </div>
                  );
                });
              })()}
            </Space>
          </Card>

          {/* 跨境基本信息 */}
          <Card 
            title={<span style={{ fontWeight: 600, fontSize: 15 }}>跨境基本信息</span>}
            size="small" 
            style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} 
            headStyle={{ borderBottom: '1px solid #f5f5f5' }}
            extra={<Button type="link" size="small" icon={<EditOutlined />} style={{ fontWeight: 500 }} onClick={() => setIsCrossborderBasicModalOpen(true)}>编辑</Button>}
          >
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>跨境业务占比</Text>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#333', lineHeight: 1.5 }}>
                    {enterprise.cross_border_ratio ? (
                      <>
                        {enterprise.cross_border_ratio}
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#666' }}>%</span>
                      </>
                    ) : (
                      '-'
                    )}
                  </div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>跨境物流模式</Text>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#333', lineHeight: 1.5 }}>{enterprise.cross_border_logistics || '-'}</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>支付结算方式</Text>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#333', lineHeight: 1.5 }}>{enterprise.payment_settlement || '-'}</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>跨境电商团队规模</Text>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#333', lineHeight: 1.5 }}>
                    {enterprise.cross_border_team_size != null ? (
                      <>
                        {enterprise.cross_border_team_size}
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#666' }}> 人</span>
                      </>
                    ) : (
                      '-'
                    )}
                  </div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>是否在用ERP</Text>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#333', lineHeight: 1.5 }}>
                    {enterprise.using_erp != null ? (enterprise.using_erp ? '是' : '否') : '-'}
                  </div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>跨境转型意愿</Text>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#333', lineHeight: 1.5 }}>{enterprise.transformation_willingness || '-'}</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>愿意投入转型程度</Text>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#333', lineHeight: 1.5 }}>{enterprise.investment_willingness || '-'}</div>
                </div>
              </Col>
              <Col span={6} />
            </Row>
          </Card>

          {/* 目标市场及占比 */}
          <Card 
            title={<span style={{ fontWeight: 600, fontSize: 15 }}>目标市场及占比</span>}
            size="small" 
            style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} 
            headStyle={{ borderBottom: '1px solid #f5f5f5' }}
            extra={<Button type="link" size="small" icon={<EditOutlined />} style={{ fontWeight: 500 }} onClick={() => setIsMarketModalOpen(true)}>编辑</Button>}
          >
            <Row gutter={16}>
              {targetMarkets.map((item, index) => {
                const colors = [
                  { bg: 'rgba(102,126,234,0.08)', bgEnd: 'rgba(118,75,162,0.05)', bar: '#667eea', barEnd: '#764ba2', text: '#667eea' },
                  { bg: 'rgba(67,233,123,0.08)', bgEnd: 'rgba(56,249,215,0.05)', bar: '#43e97b', barEnd: '#38f9d7', text: '#43e97b' },
                  { bg: 'rgba(250,140,22,0.08)', bgEnd: 'rgba(250,173,20,0.05)', bar: '#fa8c16', barEnd: '#faad14', text: '#fa8c16' },
                  { bg: 'rgba(240,147,251,0.08)', bgEnd: 'rgba(245,87,108,0.05)', bar: '#f093fb', barEnd: '#f5576c', text: '#f093fb' },
                  { bg: 'rgba(24,144,255,0.08)', bgEnd: 'rgba(64,169,255,0.05)', bar: '#1890ff', barEnd: '#40a9ff', text: '#1890ff' },
                  { bg: 'rgba(114,46,209,0.08)', bgEnd: 'rgba(157,78,221,0.05)', bar: '#722ed1', barEnd: '#9d4edd', text: '#722ed1' },
                ];
                const color = colors[index % colors.length];
                const colSpan = targetMarkets.length <= 4 ? 6 : targetMarkets.length <= 6 ? 4 : 3;
                return (
                  <Col span={colSpan} key={index} style={{ marginBottom: 12 }}>
                    <div style={{ padding: '16px', background: `linear-gradient(135deg, ${color.bg} 0%, ${color.bgEnd} 100%)`, borderRadius: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <Text style={{ fontWeight: 500 }}>{item.market || '未设置'}</Text>
                        <Text strong style={{ color: color.text, fontSize: 16 }}>{item.percentage}%</Text>
                      </div>
                      <div style={{ height: 8, background: '#e8e8e8', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${item.percentage}%`, height: '100%', background: `linear-gradient(90deg, ${color.bar} 0%, ${color.barEnd} 100%)`, borderRadius: 4 }} />
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Card>
          </div>

        </div>
      ),
    },
    {
      key: 'requirements',
      label: '需求分析',
      children: (
        <div style={{ padding: 16 }}>
          {/* 维度选择区域 */}
          <Card 
            title={<span style={{ fontWeight: 600, fontSize: 15 }}>企业画像维度选择</span>}
            size="small"
            style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            headStyle={{ borderBottom: '1px solid #f0f0f0' }}
          >
            <Row gutter={[16, 16]}>
              {dimensions.map(dim => (
                <Col span={dim.key === 'ecommerceExp' ? 24 : 12} key={dim.key}>
                  <div style={{ marginBottom: 4 }}>
                    <Text strong style={{ fontSize: 13 }}>{dim.name}</Text>
                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                      {dim.multiple ? '（可多选）' : '（单选）'}
                    </Text>
                  </div>
                  <Select
                    mode={dim.multiple ? 'multiple' : undefined}
                    style={{ width: '100%' }}
                    placeholder={`请选择${dim.name}`}
                    value={dimensionSelections[dim.key] || (dim.multiple ? [] : undefined)}
                    onChange={(value) => {
                      const newSelections = {
                        ...dimensionSelections,
                        [dim.key]: Array.isArray(value) ? value : (value ? [value] : [])
                      };
                      setDimensionSelections(newSelections);
                      saveEnterpriseFields({dimensionSelections: newSelections}, '维度选择已保存');
                    }}
                    allowClear
                    options={dim.options.map(opt => ({
                      label: (
                        <div>
                          <span>{opt.label}</span>
                          {opt.description && (
                            <span style={{ fontSize: 11, color: '#999', marginLeft: 8 }}>
                              {opt.description}
                            </span>
                          )}
                        </div>
                      ),
                      value: opt.value,
                    }))}
                  />
                </Col>
              ))}
            </Row>
          </Card>

          {/* 需求清单展示区域 */}
          {(() => {
            if (!reqConfig) return <Spin style={{ padding: 32, display: 'block', textAlign: 'center' }} />;
            const { requirements: dbRequirements, universalRequiredIds, universalEnhancedIds, dimensionRequirementMapping } = reqConfig;
            const requirementIds = new Set<string>(universalRequiredIds);
            Object.entries(dimensionSelections).forEach(([dimKey, selectedValues]) => {
              if (!selectedValues || selectedValues.length === 0) return;
              const dimMapping = dimensionRequirementMapping[dimKey];
              if (!dimMapping) return;
              selectedValues.forEach(v => { const ids = dimMapping[v]; if (ids) ids.forEach(id => requirementIds.add(id)); });
            });
            const universalSet = new Set(universalRequiredIds);
            const enhancedSet = new Set(universalEnhancedIds);
            const result = {
              universal: dbRequirements.filter(r => universalSet.has(r.id)),
              enhanced: dbRequirements.filter(r => enhancedSet.has(r.id)),
              dimensional: dbRequirements.filter(r => requirementIds.has(r.id) && !universalSet.has(r.id) && !enhancedSet.has(r.id)),
              all: dbRequirements.filter(r => requirementIds.has(r.id)),
            };
            const isNotRemoved = (req: RequirementItem | typeof dbRequirements[0]) => !removedRequirements.includes(req.id);
            const filteredUniversal = result.universal.filter(isNotRemoved);
            const filteredEnhanced = result.enhanced.filter(isNotRemoved);
            const filteredAll = result.all.filter(isNotRemoved);
            const hasSelection = Object.values(dimensionSelections).some(arr => arr && arr.length > 0);
            // 合并通用/增强/维度需求；须对三组都应用 removed，否则「通用必选」「增强版」卡片删不掉
            const allRequirements = [...filteredUniversal, ...filteredEnhanced, ...filteredAll];
            const uniqueRequirements = allRequirements.filter((req, index, self) => 
              self.findIndex(r => r.id === req.id) === index
            );
            const groupedByPhase = groupRequirementsByPhase(uniqueRequirements);
            const phases = ['战略规划与资源准备', '渠道搭建与商品上线', '营销推广与规模增长', '品牌深耕与持续优化'];
            
            // 维度标签映射
            const dimensionLabels: Record<string, Record<string, string>> = {
              enterpriseType: {
                production: '生产型',
                trading: '贸易型',
                factoryTrading: '工贸一体',
                crossBorderSeller: '跨境卖家型',
                brandOperator: '品牌运营型',
                supplyChainService: '供应链服务型',
                technicalService: '技术服务型',
                comprehensiveService: '综合服务型',
                undefined: '未定义',
                factory: '生产型',
                startup: '未定义',
              },
              targetMode: { b2b: 'B2B平台', b2c: 'B2C平台', independent: '独立站', offline: '线下渠道' },
              currentStage: { observation: '观望期', startup: '启动期', growth: '增长期', bottleneck: '瓶颈期', mature: '成熟期' },
              brandStatus: { hasBrand: '有品牌', noBrand: '无品牌' },
              ecommerceExp: { hasExp: '有电商经验', noExp: '无电商经验' },
            };
            
            // 获取需求来源维度
            const getRequirementSources = (reqId: string): string[] => {
              const sources: string[] = [];
              // 检查是否来自通用必选
              if (result.universal.some(r => r.id === reqId)) {
                sources.push('通用必选');
              }
              // 检查是否来自增强项
              if (result.enhanced.some(r => r.id === reqId)) {
                sources.push('增强项');
              }
              // 检查来自哪些维度选项
              Object.entries(dimensionSelections).forEach(([dimKey, selectedValues]) => {
                if (!selectedValues || selectedValues.length === 0) return;
                const dimMapping = dimensionRequirementMapping[dimKey];
                if (!dimMapping) return;
                selectedValues.forEach(value => {
                  if (dimMapping[value] && dimMapping[value].includes(reqId)) {
                    const label = dimensionLabels[dimKey]?.[value] || value;
                    if (!sources.includes(label)) {
                      sources.push(label);
                    }
                  }
                });
              });
              return sources;
            };
            
            const handleRemoveRequirement = (reqId: string) => {
              const newRemoved = [...removedRequirements, reqId];
              setRemovedRequirements(newRemoved);
              saveEnterpriseFields({removedRequirements: newRemoved}, '已移除该需求');
            };
            
            const handleRemoveCustomRequirement = (reqId: string) => {
              const newCustom = customRequirements.filter(r => r.id !== reqId);
              setCustomRequirements(newCustom);
              saveEnterpriseFields({customRequirements: newCustom}, '已删除自定义需求');
            };
            
            const handleAddCustomRequirement = () => {
              customRequirementForm.validateFields().then(values => {
                const newReq = {
                  id: `CUSTOM-${Date.now()}`,
                  name: values.name,
                  description: values.description,
                  phase: values.phase,
                  category: '自定义需求'
                };
                const newCustom = [...customRequirements, newReq];
                setCustomRequirements(newCustom);
                setIsCustomRequirementModalOpen(false);
                customRequirementForm.resetFields();
                saveEnterpriseFields({customRequirements: newCustom}, '已添加自定义需求');
              });
            };
            
            const handleRestoreRequirement = (reqId: string) => {
              const newRemoved = removedRequirements.filter(id => id !== reqId);
              setRemovedRequirements(newRemoved);
              saveEnterpriseFields({removedRequirements: newRemoved}, '已恢复该需求');
            };
            
            const getRemovableRequirementsForCategory = (phase: string, category: string) => {
              return result.all.filter(req => 
                req.phase === phase && 
                req.category === category && 
                removedRequirements.includes(req.id)
              );
            };
            
            return (
              <>
                {/* 统计概览 */}
                <Card
                  size="small"
                  style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  <Row gutter={16}>
                    <Col span={6}>
                      <div style={{
                        padding: '16px',
                        background: 'rgba(102,126,234,0.05)',
                        border: '1px solid rgba(102,126,234,0.2)',
                        borderRadius: 10,
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#667eea' }}>
                          {uniqueRequirements.length + customRequirements.length}
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>匹配需求总数</Text>
                      </div>
                    </Col>
                    <Col span={6}>
                      <div style={{
                        padding: '16px',
                        background: 'rgba(67,233,123,0.05)',
                        border: '1px solid rgba(67,233,123,0.2)',
                        borderRadius: 10,
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#43e97b' }}>
                          {filteredUniversal.length}
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>通用必选需求</Text>
                      </div>
                    </Col>
                    <Col span={6}>
                      <div style={{
                        padding: '16px',
                        background: 'rgba(249,115,22,0.05)',
                        border: '1px solid rgba(249,115,22,0.2)',
                        borderRadius: 10,
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#f97316' }}>
                          {filteredEnhanced.length}
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>增强项需求</Text>
                      </div>
                    </Col>
                    <Col span={6}>
                      <div style={{
                        padding: '16px',
                        background: 'rgba(139,92,246,0.05)',
                        border: '1px solid rgba(139,92,246,0.2)',
                        borderRadius: 10,
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#8b5cf6' }}>
                          {hasSelection ? result.dimensional.filter(isNotRemoved).length : 0}
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>差异化需求</Text>
                      </div>
                    </Col>
                  </Row>
                </Card>

                {/* 按阶段展示所有需求（通用+差异化） */}
                {(() => {
                  const phaseColors: Record<string, { bg: string; text: string; border: string }> = {
                    '战略规划与资源准备': { bg: 'rgba(102,126,234,0.08)', text: '#667eea', border: 'rgba(102,126,234,0.2)' },
                    '渠道搭建与商品上线': { bg: 'rgba(67,233,123,0.08)', text: '#22c55e', border: 'rgba(67,233,123,0.2)' },
                    '营销推广与规模增长': { bg: 'rgba(249,115,22,0.08)', text: '#f97316', border: 'rgba(249,115,22,0.2)' },
                    '品牌深耕与持续优化': { bg: 'rgba(139,92,246,0.08)', text: '#8b5cf6', border: 'rgba(139,92,246,0.2)' },
                  };
                  
                  // 所有匹配的需求（含已移除），用于判断阶段是否应显示
                  const allMatchedByPhase: Record<string, Array<RequirementItem | typeof dbRequirements[0]>> = {};
                  [...new Set([...result.universal, ...result.enhanced, ...result.all])].forEach(req => {
                    if (!allMatchedByPhase[req.phase]) allMatchedByPhase[req.phase] = [];
                    if (!allMatchedByPhase[req.phase].some(r => r.id === req.id)) allMatchedByPhase[req.phase].push(req);
                  });

                  const phaseItems = phases.map(phase => {
                    const phaseRequirements = groupedByPhase[phase] || [];
                    const allPhaseReqs = allMatchedByPhase[phase] || [];
                    const removedInPhase = allPhaseReqs.filter(r => removedRequirements.includes(r.id));
                    if (allPhaseReqs.length === 0) return null;
                    
                    const colors = phaseColors[phase] || phaseColors['战略规划与资源准备'];
                    
                    // 按分类分组（仅显示未移除的）
                    const categories: Record<string, RequirementItem[]> = {};
                    phaseRequirements.forEach((req: RequirementItem) => {
                      if (!categories[req.category]) {
                        categories[req.category] = [];
                      }
                      categories[req.category].push(req);
                    });
                    
                    return {
                      key: phase,
                      label: (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{
                            padding: '4px 12px',
                            background: colors.bg,
                            color: colors.text,
                            borderRadius: 6,
                            fontWeight: 600,
                            fontSize: 13,
                            border: `1px solid ${colors.border}`
                          }}>
                            {phase}
                          </span>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            共 {phaseRequirements.length} 项需求
                          </Text>
                          {removedInPhase.length > 0 && (
                            <Popconfirm
                              title={`恢复「${phase}」下全部 ${removedInPhase.length} 项已移除需求？`}
                              onConfirm={(e) => {
                                e?.stopPropagation();
                                const idsToRestore = new Set(removedInPhase.map(r => r.id));
                                const newRemoved = removedRequirements.filter(id => !idsToRestore.has(id));
                                setRemovedRequirements(newRemoved);
                                saveEnterpriseFields({ removedRequirements: newRemoved }, `已恢复「${phase}」的 ${removedInPhase.length} 项需求`);
                              }}
                              onCancel={(e) => e?.stopPropagation()}
                              okText="确定恢复"
                              cancelText="取消"
                            >
                              <Button
                                size="small"
                                type="link"
                                style={{ color: colors.text, fontSize: 12 }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                恢复已移除 ({removedInPhase.length})
                              </Button>
                            </Popconfirm>
                          )}
                        </div>
                      ),
                      children: (
                        <Collapse 
                          defaultActiveKey={Object.keys(categories)}
                          ghost
                          expandIcon={({ isActive }) => isActive ? <DownOutlined style={{ color: colors.text }} /> : <RightOutlined style={{ color: colors.text }} />}
                            style={{ background: 'transparent' }}
                            items={Object.entries(categories).map(([category, items]) => ({
                              key: category,
                              label: (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                  <Text strong style={{ 
                                    fontSize: 13, 
                                    color: '#555',
                                    paddingLeft: 8,
                                    borderLeft: `3px solid ${colors.text}`
                                  }}>
                                    {category}
                                    <span style={{ 
                                      marginLeft: 8, 
                                      fontSize: 12, 
                                      color: '#999',
                                      fontWeight: 400
                                    }}>
                                      ({items.length}项)
                                    </span>
                                  </Text>
                                  {result.all.filter(req => req.phase === phase && req.category === category && removedRequirements.includes(req.id)).length > 0 && (
                                    <Button
                                      type="link"
                                      size="small"
                                      icon={<PlusOutlined />}
                                      style={{ color: colors.text, padding: '0 4px', height: 'auto' }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setRestoreCategory({ phase, category });
                                        setIsRestoreRequirementModalOpen(true);
                                      }}
                                    >
                                      恢复需求
                                    </Button>
                                  )}
                                </div>
                              ),
                              children: (
                              <Row gutter={[12, 12]} style={{ marginTop: 8 }}>
                                {items.map((req: RequirementItem) => (
                                  <Col span={12} key={req.id}>
                                    <div style={{
                                      padding: '12px 14px',
                                      background: '#fafbfc',
                                      borderRadius: 8,
                                      border: '1px solid #f0f0f0',
                                      transition: 'all 0.2s ease',
                                      position: 'relative'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = colors.bg;
                                      e.currentTarget.style.borderColor = colors.border;
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = '#fafbfc';
                                      e.currentTarget.style.borderColor = '#f0f0f0';
                                    }}
                                    >
                                      <Button
                                        type="text"
                                        size="small"
                                        icon={<CloseOutlined />}
                                        style={{
                                          position: 'absolute',
                                          top: 4,
                                          right: 4,
                                          color: '#999',
                                          padding: '2px 6px',
                                          height: 'auto',
                                          minWidth: 'auto'
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveRequirement(req.id);
                                        }}
                                      />
                                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, paddingRight: 20 }}>
                                        <span style={{
                                          padding: '2px 6px',
                                          background: colors.bg,
                                          color: colors.text,
                                          borderRadius: 4,
                                          fontSize: 11,
                                          fontWeight: 600,
                                          flexShrink: 0
                                        }}>
                                          {req.id}
                                        </span>
                                        <div style={{ flex: 1 }}>
                                          <Text strong style={{ fontSize: 13, display: 'block' }}>
                                            {req.name}
                                          </Text>
                                          <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.4, display: 'block' }}>
                                            {req.description}
                                          </Text>
                                          {/* 来源维度标签 */}
                                          <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {getRequirementSources(req.id).map((source, idx) => (
                                              <span
                                                key={idx}
                                                style={{
                                                  padding: '1px 6px',
                                                  background: source === '通用必选' ? 'rgba(67,233,123,0.1)' : 
                                                             source === '增强项' ? 'rgba(249,115,22,0.1)' : 
                                                             'rgba(139,92,246,0.1)',
                                                  color: source === '通用必选' ? '#22c55e' : 
                                                         source === '增强项' ? '#f97316' : 
                                                         '#8b5cf6',
                                                  borderRadius: 3,
                                                  fontSize: 10,
                                                  fontWeight: 500
                                                }}
                                              >
                                                {source}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </Col>
                                ))}
                              </Row>
                              )
                            }))}
                          />
                      )
                    };
                  }).filter(Boolean);
                  
                  return (
                    <Collapse
                      defaultActiveKey={phases}
                      style={{ 
                        background: 'transparent',
                        marginBottom: 16
                      }}
                      expandIcon={({ isActive }) => isActive ? <DownOutlined /> : <RightOutlined />}
                      items={phaseItems as any}
                    />
                  );
                })()}

                {/* 自定义需求区域 */}
                <Card
                  size="small"
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        padding: '4px 12px',
                        background: 'rgba(250,140,22,0.08)',
                        color: '#fa8c16',
                        borderRadius: 6,
                        fontWeight: 600,
                        fontSize: 13,
                        border: '1px solid rgba(250,140,22,0.2)'
                      }}>
                        自定义需求
                      </span>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        针对该企业的个性化需求
                      </Text>
                    </div>
                  }
                  extra={
                    <Button 
                      type="primary" 
                      size="small" 
                      icon={<PlusOutlined />}
                      onClick={() => setIsCustomRequirementModalOpen(true)}
                      style={{ borderRadius: 6 }}
                    >
                      添加需求
                    </Button>
                  }
                  style={{ 
                    marginTop: 16,
                    borderRadius: 12, 
                    border: 'none', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)' 
                  }}
                  headStyle={{ borderBottom: '1px solid #f0f0f0' }}
                >
                  {customRequirements.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                      <Text type="secondary">暂无自定义需求，点击上方按钮添加</Text>
                    </div>
                  ) : (
                    <Row gutter={[12, 12]}>
                      {customRequirements.map(req => (
                        <Col span={12} key={req.id}>
                          <div style={{
                            padding: '12px 14px',
                            background: 'rgba(250,140,22,0.04)',
                            borderRadius: 8,
                            border: '1px solid rgba(250,140,22,0.15)',
                            position: 'relative'
                          }}>
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              style={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                padding: '2px 6px',
                                height: 'auto',
                                minWidth: 'auto'
                              }}
                              onClick={() => handleRemoveCustomRequirement(req.id)}
                            />
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, paddingRight: 20 }}>
                              <span style={{
                                padding: '2px 6px',
                                background: 'rgba(250,140,22,0.1)',
                                color: '#fa8c16',
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 600,
                                flexShrink: 0
                              }}>
                                {req.phase}
                              </span>
                              <div>
                                <Text strong style={{ fontSize: 13, display: 'block' }}>
                                  {req.name}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.4 }}>
                                  {req.description}
                                </Text>
                              </div>
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  )}
                </Card>

                {/* 恢复需求弹窗 */}
                <Modal
                  title="恢复已删除的需求"
                  open={isRestoreRequirementModalOpen}
                  onCancel={() => {
                    setIsRestoreRequirementModalOpen(false);
                    setRestoreCategory(null);
                  }}
                  footer={null}
                  width={500}
                >
                  {restoreCategory && (
                    <div>
                      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                        选择要恢复到「{restoreCategory.phase} - {restoreCategory.category}」的需求：
                      </Text>
                      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                        {getRemovableRequirementsForCategory(restoreCategory.phase, restoreCategory.category).map(req => (
                          <div
                            key={req.id}
                            style={{
                              padding: '12px 14px',
                              background: '#fafbfc',
                              borderRadius: 8,
                              border: '1px solid #f0f0f0',
                              marginBottom: 8,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flex: 1 }}>
                              <span style={{
                                padding: '2px 6px',
                                background: 'rgba(102,126,234,0.1)',
                                color: '#667eea',
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 600,
                                flexShrink: 0
                              }}>
                                {req.id}
                              </span>
                              <div>
                                <Text strong style={{ fontSize: 13, display: 'block' }}>
                                  {req.name}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                  {req.description}
                                </Text>
                              </div>
                            </div>
                            <Button
                              type="primary"
                              size="small"
                              icon={<PlusOutlined />}
                              style={{ borderRadius: 6, marginLeft: 8 }}
                              onClick={() => {
                                handleRestoreRequirement(req.id);
                                if (getRemovableRequirementsForCategory(restoreCategory.phase, restoreCategory.category).length <= 1) {
                                  setIsRestoreRequirementModalOpen(false);
                                  setRestoreCategory(null);
                                }
                              }}
                            >
                              恢复
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Modal>

                {/* 自定义需求弹窗 */}
                <Modal
                  title="添加自定义需求"
                  open={isCustomRequirementModalOpen}
                  onCancel={() => {
                    setIsCustomRequirementModalOpen(false);
                    customRequirementForm.resetFields();
                  }}
                  onOk={handleAddCustomRequirement}
                  okText="添加"
                  cancelText="取消"
                >
                  <Form form={customRequirementForm} layout="vertical">
                    <Form.Item
                      name="name"
                      label="需求名称"
                      rules={[{ required: true, message: '请输入需求名称' }]}
                    >
                      <Input placeholder="请输入需求名称" />
                    </Form.Item>
                    <Form.Item
                      name="description"
                      label="需求描述"
                      rules={[{ required: true, message: '请输入需求描述' }]}
                    >
                      <Input.TextArea rows={3} placeholder="请输入需求描述" />
                    </Form.Item>
                    <Form.Item
                      name="phase"
                      label="所属阶段"
                      rules={[{ required: true, message: '请选择所属阶段' }]}
                    >
                      <Select placeholder="请选择所属阶段">
                        <Select.Option value="战略规划与资源准备">战略规划与资源准备</Select.Option>
                        <Select.Option value="渠道搭建与商品上线">渠道搭建与商品上线</Select.Option>
                        <Select.Option value="营销推广与规模增长">营销推广与规模增长</Select.Option>
                        <Select.Option value="品牌深耕与持续优化">品牌深耕与持续优化</Select.Option>
                      </Select>
                    </Form.Item>
                  </Form>
                </Modal>
              </>
            );
          })()}
        </div>
      ),
    },
    {
      key: 'policy',
      label: '政策支持',
      children: (
        <div>
          {/* 政策支持情况 */}
          <Card 
            title={<span style={{ fontWeight: 600, fontSize: 15 }}>政策支持情况</span>}
            size="small" 
            style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            headStyle={{ borderBottom: '1px solid #f5f5f5' }}
            extra={<Button type="link" size="small" icon={<EditOutlined />} style={{ fontWeight: 500 }} onClick={() => setIsPolicySupportModalOpen(true)}>编辑</Button>}
          >
            <Row gutter={24}>
              <Col span={8}>
                <div style={{ padding: '14px 16px', background: '#fafbfc', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>是否享受过政策支持</Text>
                  <span style={{ color: '#333', fontWeight: 400, fontSize: 14 }}>
                    {enterprise.has_policy_support === 1 || enterprise.has_policy_support === true ? '是' : '否'}
                  </span>
                </div>
              </Col>
              <Col span={16}>
                <div style={{ padding: '14px 16px', background: '#fafbfc', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>已享受政策</Text>
                  {Array.isArray(enterprise.enjoyed_policies) && enterprise.enjoyed_policies.length > 0 ? (
                    <Space size={8} wrap>
                      {enterprise.enjoyed_policies.map((code: string) => (
                        <Tag key={code} style={{ margin: 0, fontWeight: 400, fontSize: 14 }}>
                          {labelForEnjoyedPolicyValue(String(code))}
                        </Tag>
                      ))}
                    </Space>
                  ) : (
                    <span style={{ color: '#333', fontWeight: 400, fontSize: 14 }}>-</span>
                  )}
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      ),
    },
    {
      key: 'cooperation',
      label: '合作',
      children: (
        <div>
          {/* 三中心合作 */}
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>三中心合作</span>
                <Switch 
                  checked={isCooperating} 
                  onChange={setIsCooperating}
                  checkedChildren="已合作" 
                  unCheckedChildren="未合作"
                  style={{ 
                    background: isCooperating ? '#43e97b' : '#ff6b6b'
                  }}
                />
              </div>
            }
            size="small" 
            style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} 
            headStyle={{ borderBottom: '1px solid #f5f5f5' }}
          >
            {isCooperating ? (
              <div>
                <Text strong style={{ fontSize: 14, marginBottom: 12, display: 'block' }}>合作项目</Text>
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="请选择合作项目"
                  value={enterprise.tricenter_demands || []}
                  onChange={async (value: string[]) => {
                    setEnterprise({...enterprise, tricenter_demands: value});
                    await saveEnterpriseFields({tricenterDemands: value}, '合作项目已更新');
                  }}
                  optionLabelProp="label"
                  options={[
                    { 
                      label: '跨境电商运营培训', 
                      value: 'ecommerce_training',
                      icon: '📚',
                      color: '#1890ff'
                    },
                    { 
                      label: '平台资源对接', 
                      value: 'platform_resource',
                      icon: '🔗',
                      color: '#52c41a'
                    },
                    { 
                      label: '品牌孵化服务', 
                      value: 'brand_incubation',
                      icon: '🚀',
                      color: '#722ed1'
                    },
                    { 
                      label: '代运营服务', 
                      value: 'agency_operation',
                      icon: '⚙️',
                      color: '#fa8c16'
                    },
                    { 
                      label: '人才招聘', 
                      value: 'talent_recruitment',
                      icon: '👥',
                      color: '#eb2f96'
                    },
                    { 
                      label: '政策申报', 
                      value: 'policy_application',
                      icon: '📋',
                      color: '#13c2c2'
                    },
                    { 
                      label: '海外仓服务', 
                      value: 'overseas_warehouse',
                      icon: '🏭',
                      color: '#2f54eb'
                    },
                    { 
                      label: '物流解决方案', 
                      value: 'logistics_solution',
                      icon: '🚚',
                      color: '#faad14'
                    },
                    { 
                      label: '营销推广服务', 
                      value: 'marketing_promotion',
                      icon: '📢',
                      color: '#f5222d'
                    },
                    { 
                      label: '共享办公工位', 
                      value: 'shared_office',
                      icon: '🏢',
                      color: '#a0d911'
                    },
                    { 
                      label: '法务咨询服务', 
                      value: 'legal_consulting',
                      icon: '⚖️',
                      color: '#597ef7'
                    },
                    { 
                      label: '金融服务对接', 
                      value: 'financial_service',
                      icon: '💰',
                      color: '#ffc53d'
                    },
                    { 
                      label: '其他', 
                      value: 'other',
                      icon: '📦',
                      color: '#8c8c8c'
                    },
                  ]}
                  tagRender={(props) => {
                    const { label, value, closable, onClose } = props;
                    const projectOptions: Record<string, { icon: string; color: string }> = {
                      'ecommerce_training': { icon: '📚', color: '#1890ff' },
                      'platform_resource': { icon: '🔗', color: '#52c41a' },
                      'brand_incubation': { icon: '🚀', color: '#722ed1' },
                      'agency_operation': { icon: '⚙️', color: '#fa8c16' },
                      'talent_recruitment': { icon: '👥', color: '#eb2f96' },
                      'policy_application': { icon: '📋', color: '#13c2c2' },
                      'overseas_warehouse': { icon: '🏭', color: '#2f54eb' },
                      'logistics_solution': { icon: '🚚', color: '#faad14' },
                      'marketing_promotion': { icon: '📢', color: '#f5222d' },
                      'shared_office': { icon: '🏢', color: '#a0d911' },
                      'legal_consulting': { icon: '⚖️', color: '#597ef7' },
                      'financial_service': { icon: '💰', color: '#ffc53d' },
                      'other': { icon: '📦', color: '#8c8c8c' },
                    };
                    const option = projectOptions[value as string] || { icon: '📦', color: '#8c8c8c' };
                    return (
                      <Tag
                        closable={closable}
                        onClose={onClose}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 8px',
                          borderRadius: 6,
                          background: `${option.color}10`,
                          border: `1px solid ${option.color}30`,
                          color: option.color,
                          fontWeight: 500,
                          marginRight: 4,
                        }}
                      >
                        <span style={{ fontSize: 14 }}>{option.icon}</span>
                        <span>{label}</span>
                      </Tag>
                    );
                  }}
                  optionRender={(option) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{(option.data as any).icon}</span>
                      <span>{option.label}</span>
                    </div>
                  )}
                />
              </div>
            ) : (
              <div>
                <Text strong style={{ fontSize: 14, marginBottom: 12, display: 'block' }}>不合作主要顾虑</Text>
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="请选择不合作的主要顾虑"
                  value={enterprise.tricenter_concerns || []}
                  onChange={async (value: string[]) => {
                    setEnterprise({...enterprise, tricenter_concerns: value});
                    await saveEnterpriseFields({tricenterConcerns: value}, '顾虑信息已更新');
                  }}
                  options={[
                    { label: '暂无合作意向', value: 'no_intention' },
                    { label: '企业自有团队较完善', value: 'own_team' },
                    { label: '服务费用顾虑', value: 'cost_concern' },
                    { label: '对服务效果存疑', value: 'effect_doubt' },
                    { label: '时机不成熟', value: 'timing_not_right' },
                    { label: '已有其他合作方', value: 'other_partner' },
                    { label: '内部决策流程未通过', value: 'internal_decision' },
                    { label: '企业资源有限', value: 'resource_limited' },
                    { label: '战略方向不匹配', value: 'strategy_mismatch' },
                    { label: '其他', value: 'other' },
                  ]}
                />
              </div>
            )}
          </Card>

          {/* 三中心评估 */}
          <Card 
            title={<span style={{ fontWeight: 600, fontSize: 15 }}>三中心评估</span>}
            size="small" 
            style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} 
            headStyle={{ borderBottom: '1px solid #f5f5f5' }}
          >
            {/* 合作可能性评分 */}
            <div style={{ marginBottom: 20 }}>
              <Text strong style={{ fontSize: 14, marginBottom: 12, display: 'block' }}>合作可能性评分</Text>
              <Row gutter={[16, 16]}>
                {[
                  { label: '企业服务合作', field: 'service_cooperation_rating', apiField: 'serviceCooperationRating', color: '#667eea' },
                  { label: '招商入驻合作', field: 'investment_cooperation_rating', apiField: 'investmentCooperationRating', color: '#43e97b' },
                  { label: '孵化转型合作', field: 'incubation_cooperation_rating', apiField: 'incubationCooperationRating', color: '#f97316' },
                  { label: '品牌营销合作', field: 'brand_cooperation_rating', apiField: 'brandCooperationRating', color: '#ec4899' },
                  { label: '人才培训合作', field: 'training_cooperation_rating', apiField: 'trainingCooperationRating', color: '#8b5cf6' },
                  { label: '跨境整体方案', field: 'overall_cooperation_rating', apiField: 'overallCooperationRating', color: '#06b6d4' },
                ].map((item, idx) => (
                  <Col span={8} key={idx}>
                    <div style={{ 
                      padding: '14px 16px', 
                      background: '#fafbfc', 
                      borderRadius: 10,
                      borderLeft: `3px solid ${item.color}`
                    }}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>{item.label}</Text>
                      <Rate 
                        value={enterprise[item.field] || 0} 
                        style={{ fontSize: 14 }} 
                        onChange={async (val) => {
                          setEnterprise({...enterprise, [item.field]: val});
                          await saveEnterpriseFields({[item.apiField]: val}, `${item.label}评分已更新为${val}星`);
                        }}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
            </div>

            {/* 标杆企业可能性 */}
            <div style={{ marginBottom: 20 }}>
              <Text strong style={{ fontSize: 14, marginBottom: 12, display: 'block' }}>标杆企业可能性</Text>
              <div style={{ 
                padding: '16px', 
                background: 'linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.05) 100%)', 
                borderRadius: 10 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontWeight: 500 }}>成为标杆企业的可能性</Text>
                  <Text strong style={{ fontSize: 18, color: '#667eea' }}>{enterprise.benchmark_possibility || 0}%</Text>
                </div>
                <Slider
                  value={enterprise.benchmark_possibility || 0}
                  min={0}
                  max={100}
                  step={1}
                  tooltip={{ formatter: (value) => `${value}%` }}
                  onChange={(val) => setEnterprise({...enterprise, benchmark_possibility: val})}
                  onChangeComplete={async (val) => {
                    await saveEnterpriseFields({benchmarkPossibility: val}, `标杆企业可能性已更新为${val}%`);
                  }}
                  styles={{
                    track: { background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' },
                    rail: { background: '#e8e8e8' },
                  }}
                />
              </div>
            </div>

            {/* 其它补充说明 */}
            <div>
              <Text strong style={{ fontSize: 14, marginBottom: 12, display: 'block' }}>其它补充说明</Text>
              <Input.TextArea 
                value={enterprise.additional_notes || ''}
                onChange={(e) => setEnterprise({...enterprise, additional_notes: e.target.value})}
                rows={3}
                style={{ borderRadius: 10, marginBottom: 12 }}
              />
              <div style={{ textAlign: 'right' }}>
                <Button 
                  type="primary" 
                  onClick={async () => {
                    await saveEnterpriseFields({additionalNotes: enterprise.additional_notes || ''}, '补充说明已保存');
                  }}
                  style={{ 
                    borderRadius: 6, 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                    border: 'none' 
                  }}
                >
                  保存
                </Button>
              </div>
            </div>
          </Card>

          {/* 合作服务档案概要 + 跳转 */}
          <Card
            size="small"
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              background: 'rgba(102,126,234,0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 20,
                }}>
                  <FileTextOutlined />
                </div>
                <div>
                  <Text strong style={{ fontSize: 15 }}>合作服务档案</Text>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                    共 <span style={{ color: '#667eea', fontWeight: 600 }}>{serviceSummary.total}</span> 条服务记录
                    {serviceSummary.completed > 0 && <span style={{ marginLeft: 8 }}>已完成 <span style={{ color: '#10b981', fontWeight: 600 }}>{serviceSummary.completed}</span></span>}
                    {serviceSummary.inProgress > 0 && <span style={{ marginLeft: 8 }}>进行中 <span style={{ color: '#3b82f6', fontWeight: 600 }}>{serviceSummary.inProgress}</span></span>}
                    {serviceSummary.lastDate && <span style={{ marginLeft: 8 }}>最近服务 {serviceSummary.lastDate}</span>}
                  </div>
                </div>
              </div>
              <Button
                type="primary"
                onClick={() => navigate(`/service-records?enterpriseId=${id}`)}
                style={{
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  fontWeight: 500,
                }}
              >
                查看全部
              </Button>
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: 'competition',
      label: '竞争力与风险',
      children: (
        <div>
          {/* 是否经过调研选择 */}
          <Card 
            size="small" 
            style={{ 
              marginBottom: 16, 
              borderRadius: 12, 
              border: isSurveyed ? '1px solid rgba(102,126,234,0.3)' : 'none', 
              boxShadow: isSurveyed ? '0 4px 12px rgba(102,126,234,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
              background: isSurveyed ? 'rgba(102,126,234,0.05)' : '#fff',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isSurveyed ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#d9d9d9',
                  transition: 'all 0.3s ease',
                  boxShadow: isSurveyed ? '0 0 8px rgba(102,126,234,0.5)' : 'none'
                }} />
                <Text strong style={{ fontSize: 15 }}>该企业是否经过调研</Text>
              </div>
              <Switch 
                checked={isSurveyed} 
                onChange={setIsSurveyed}
                checkedChildren="是" 
                unCheckedChildren="否"
                style={{ 
                  background: isSurveyed ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : undefined
                }}
              />
            </div>
          </Card>

          {/* 竞争力与风险详细信息 - 仅在经过调研时显示 */}
          <div style={{
            maxHeight: isSurveyed ? 2000 : 0,
            overflow: 'hidden',
            opacity: isSurveyed ? 1 : 0,
            transition: 'all 0.4s ease-in-out'
          }}>
          {/* 行业竞争地位 */}
          <Card 
            title={<span style={{ fontWeight: 600, fontSize: 15 }}>行业竞争地位</span>}
            size="small" 
            style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            headStyle={{ borderBottom: '1px solid #f5f5f5' }}
          >
            <Row gutter={16} style={{ textAlign: 'center', marginBottom: 16 }}>
              {[
                { label: '头部企业', value: 'leader' },
                { label: '中型企业', value: 'medium' },
                { label: '初创企业', value: 'startup' },
              ].map((item, idx) => {
                const isSelected = item.value === competitionPosition;
                return (
                  <Col span={8} key={idx}>
                    <div 
                      style={{ 
                        padding: '16px',
                        background: isSelected ? 'rgba(102,126,234,0.1)' : '#fafafa',
                        border: isSelected ? '2px solid #667eea' : '1px solid #f0f0f0',
                        borderRadius: 10,
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onClick={async () => {
                        setCompetitionPosition(item.value);
                        await saveEnterpriseFields({competitionPosition: item.value}, `行业竞争地位已更新为"${item.label}"`);
                      }}
                    >
                      <Text strong={isSelected} type={isSelected ? undefined : 'secondary'} style={{ color: isSelected ? '#667eea' : undefined }}>
                        {item.label} {isSelected && '✓'}
                      </Text>
                    </div>
                  </Col>
                );
              })}
            </Row>
            <Input.TextArea 
              value={competitionDesc}
              onChange={(e) => setCompetitionDesc(e.target.value)}
              rows={2}
              style={{ borderRadius: 10 }}
              onBlur={() => saveEnterpriseFields({ competitionDescription: competitionDesc }, '竞争地位描述已保存')}
            />
          </Card>

          {/* 当前面临风险（库字段 current_risk_tags + risk_description） */}
          <Card 
            title={<span style={{ fontWeight: 600, fontSize: 15 }}>当前面临风险</span>}
            size="small" 
            style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            headStyle={{ borderBottom: '1px solid #f5f5f5' }}
            extra={<Button type="link" size="small" icon={<EditOutlined />} style={{ fontWeight: 500 }} onClick={() => setIsRiskModalOpen(true)}>编辑</Button>}
          >
            {(() => {
              const riskTags = Array.isArray(enterprise.current_risk_tags) ? enterprise.current_risk_tags : [];
              const riskDesc = (enterprise.risk_description && String(enterprise.risk_description).trim()) || '';
              const palette = [
                { icon: <AlertOutlined />, color: '#f5222d', gradient: 'rgba(245,34,45,0.08)' },
                { icon: <WarningOutlined />, color: '#fa8c16', gradient: 'rgba(250,140,22,0.08)' },
                { icon: <WarningOutlined />, color: '#faad14', gradient: 'rgba(250,173,20,0.08)' },
              ];
              if (riskTags.length === 0 && !riskDesc) {
                return (
                  <div style={{ textAlign: 'center', padding: '28px 0', color: '#999', fontSize: 13 }}>
                    暂无记录，点击「编辑」维护当前面临风险
                  </div>
                );
              }
              return (
                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                  {riskTags.map((title: string, idx: number) => {
                    const item = palette[idx % palette.length];
                    return (
                      <div
                        key={`${title}-${idx}`}
                        style={{
                          padding: '16px 20px',
                          background: `linear-gradient(135deg, ${item.gradient} 0%, transparent 100%)`,
                          borderRadius: 12,
                          border: `1px solid ${item.color}20`,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 14,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 18,
                            color: item.color,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                            flexShrink: 0,
                          }}
                        >
                          {item.icon}
                        </div>
                        <div>
                          <Text strong style={{ color: item.color, fontSize: 14 }}>{title}</Text>
                        </div>
                      </div>
                    );
                  })}
                  {riskDesc ? (
                    <div style={{ padding: '14px 18px', background: '#fafafa', borderRadius: 10, border: '1px solid #f0f0f0' }}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>补充说明</Text>
                      <div style={{ fontSize: 13, color: '#444', whiteSpace: 'pre-wrap' }}>{riskDesc}</div>
                    </div>
                  ) : null}
                </Space>
              );
            })()}
          </Card>
          </div>
        </div>
      ),
    },
    {
      key: 'followup',
      label: '跟进记录',
      children: (
        <div style={{ padding: 16 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 20,
            padding: '0 4px'
          }}>
            <Text strong style={{ fontSize: 15 }}>共 <span style={{ color: '#667eea', fontSize: 18 }}>{enterpriseRecords.length}</span> 条跟进记录</Text>
            <Button 
              type="primary" 
              size="small" 
              icon={<PlusOutlined />} 
              onClick={() => setIsFollowUpModalOpen(true)}
              style={{
                borderRadius: 8,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontWeight: 500
              }}
            >
              添加跟进
            </Button>
          </div>
          {enterpriseRecords.length > 0 ? (
            <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <Table
                columns={recordColumns}
                dataSource={enterpriseRecords}
                rowKey="id"
                size="small"
                pagination={false}
              />
            </Card>
          ) : (
            <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ 
                  width: 64, 
                  height: 64, 
                  margin: '0 auto 16px',
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.05) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileTextOutlined style={{ fontSize: 28, color: '#667eea' }} />
                </div>
                <Text type="secondary">暂无跟进记录</Text>
              </div>
            </Card>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/enterprise')}>
          返回列表
        </Button>
        <Button
          icon={<DownloadOutlined />}
          onClick={handleExportExcel}
          loading={exporting}
          style={{
            borderRadius: 8,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            color: '#fff',
            fontWeight: 500,
            boxShadow: '0 2px 8px rgba(102,126,234,0.3)',
          }}
        >
          导出Excel
        </Button>
      </div>

      <Card 
        style={{ 
          marginBottom: 16,
          background: '#fff',
          borderRadius: 16,
          overflow: 'hidden',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        }}
        styles={{ body: { padding: 0 } }}
      >
        {/* 顶部装饰条 */}
        <div style={{ 
          height: 4, 
          background: `linear-gradient(90deg, ${stageInfo.color} 0%, ${stageInfo.color}60 50%, transparent 100%)`,
        }} />
        
        <div style={{ padding: '28px 32px' }}>
          {/* 主信息区 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              {/* 企业头像 */}
              <div style={{
                width: 72,
                height: 72,
                borderRadius: 18,
                background: `linear-gradient(145deg, ${stageInfo.color}15 0%, ${stageInfo.color}30 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                fontWeight: 700,
                color: stageInfo.color,
                border: `2px solid ${stageInfo.color}25`,
                boxShadow: `0 8px 24px ${stageInfo.color}15`,
                position: 'relative',
              }}>
                {enterprise.enterprise_name.charAt(0)}
                {/* 状态指示器 */}
                <div style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: stageInfo.color,
                  border: '3px solid #fff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }} />
              </div>
              
              {/* 企业名称和标签 */}
              <div>
                <Title level={3} style={{ margin: 0, fontWeight: 700, letterSpacing: -0.5, fontSize: 22 }}>
                  {enterprise.enterprise_name}
                </Title>
                <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 14px',
                    background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
                    borderRadius: 20,
                    color: '#00838f',
                    fontWeight: 500,
                    fontSize: 13,
                  }}>
                    <EnvironmentOutlined style={{ fontSize: 12 }} />{enterprise.district}
                  </span>
                  <span style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 14px',
                    background: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
                    borderRadius: 20,
                    color: '#f57c00',
                    fontWeight: 500,
                    fontSize: 13,
                  }}>
                    {enterprise.industry}
                  </span>
                  <span style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 14px',
                    background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                    borderRadius: 20,
                    color: '#8e24aa',
                    fontWeight: 500,
                    fontSize: 13,
                  }}>
                    {enterprise.enterprise_type}
                  </span>
                </div>
              </div>
            </div>
            
            {/* 右侧操作区 */}
            <div style={{ display: 'flex', alignItems: 'stretch', gap: 12 }}>
              {/* 录入时间 */}
              <div style={{ 
                textAlign: 'center',
                padding: '12px 20px',
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                minWidth: 120,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                <Text type="secondary" style={{ fontSize: 11, letterSpacing: 0.5 }}>录入时间</Text>
                <div style={{ fontWeight: 600, color: '#334155', marginTop: 4, fontSize: 14 }}>
                  {enterprise.created_at}
                </div>
              </div>
              
              {/* 漏斗阶段下拉选择器 */}
              <div style={{ 
                padding: '12px 20px',
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                minWidth: 120,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'center',
              }}>
                <Text type="secondary" style={{ fontSize: 11, letterSpacing: 0.5 }}>当前阶段</Text>
                <Select
                  value={enterprise.funnel_stage}
                  onChange={async (value) => {
                    try {
                      // 调用API更新阶段
                      await enterpriseApi.updateStage(enterprise.id, value);
                      // 更新本地状态
                      setEnterprise({ ...enterprise, funnel_stage: value });
                      setSelectedStage(value);
                      message.success('阶段已更新');
                    } catch (error: any) {
                      message.error(error.message || '阶段更新失败');
                    }
                  }}
                  variant="borderless"
                  style={{ 
                    marginTop: 2,
                    marginLeft: -8,
                    marginRight: -8,
                  }}
                  dropdownStyle={{ borderRadius: 8 }}
                  options={FUNNEL_STAGES.map(stage => ({
                    label: (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: stage.color,
                        }} />
                        <span>{stage.name}</span>
                      </div>
                    ),
                    value: stage.code,
                  }))}
                  labelRender={(props) => {
                    const stage = FUNNEL_STAGES.find(s => s.code === props.value);
                    if (!stage) return props.label;
                    return (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: 6,
                        fontWeight: 600,
                        fontSize: 14,
                        color: stage.color,
                      }}>
                        <span style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: stage.color,
                        }} />
                        <span>{stage.name}</span>
                      </div>
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          items={tabItems}
          tabBarStyle={{ 
            marginBottom: 0,
            borderBottom: '1px solid #f0f0f0',
            paddingLeft: 8
          }}
        />
      </Card>

      <Modal
        title="变更漏斗阶段"
        open={isStageModalOpen}
        onOk={handleStageChange}
        onCancel={() => setIsStageModalOpen(false)}
        okText="确认变更"
        cancelText="取消"
      >
        <div style={{ margin: '24px 0' }}>
          <Text style={{ marginBottom: 8, display: 'block' }}>选择新阶段:</Text>
          <Select
            style={{ width: '100%' }}
            value={selectedStage}
            onChange={setSelectedStage}
            options={FUNNEL_STAGES.map(s => ({
              label: (
                <Space>
                  <Badge color={s.color} />
                  {s.name}
                </Space>
              ),
              value: s.code,
            }))}
          />
        </div>
      </Modal>

      <Modal
        title={editingFollowUp ? "编辑跟进记录" : "添加跟进记录"}
        open={isFollowUpModalOpen}
        onOk={handleAddFollowUp}
        onCancel={() => { setIsFollowUpModalOpen(false); setEditingFollowUp(null); followUpForm.resetFields(); }}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={followUpForm} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="follow_up_type" label="跟进类型" rules={[{ required: true, message: '请选择跟进类型' }]}>
                <Select placeholder="请选择" options={FOLLOW_UP_TYPES.map(t => ({ label: t, value: t }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="follow_up_date" label="跟进日期" rules={[{ required: true, message: '请选择跟进日期' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="content" label="跟进内容" rules={[{ required: true, message: '请输入跟进内容' }]}>
                <Input.TextArea rows={4} placeholder="请输入跟进内容..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="overall_status" label="整体状态">
                <Input placeholder="如：积极配合、观望中等" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="stage_after" label="变更阶段">
                <Select 
                  placeholder="如无变化可不选" 
                  allowClear 
                  options={FUNNEL_STAGES.map(s => ({ label: s.name, value: s.code }))} 
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="next_step" label="下一步计划">
                <Input placeholder="请输入下一步计划..." />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 编辑企业信息模态框 */}
      <Modal
        title="编辑企业信息"
        open={isEditEnterpriseOpen}
        onOk={handleEditEnterprise}
        onCancel={() => setIsEditEnterpriseOpen(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="enterprise_name" label="企业名称">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="unified_credit_code" label="统一社会信用代码">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="established_date" label="成立日期">
                <DatePicker style={{ width: '100%' }} placeholder="请选择成立日期" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="registered_capital" label="注册资本">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入注册资本" addonAfter="万元" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="industry_id" label="所属行业">
                <Cascader 
                  options={industryCategories} 
                  placeholder="请选择行业"
                  showSearch={{
                    filter: (inputValue, path) =>
                      path.some(option => 
                        (option.label as string).toLowerCase().includes(inputValue.toLowerCase())
                      ),
                  }}
                  changeOnSelect
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="enterprise_type" label="企业类型">
                <Select options={ENTERPRISE_TYPE_OPTIONS} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="staff_size_id" label="人员规模">
                <Select options={staffSizeOptions} placeholder="请选择" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="企业地址" style={{ marginBottom: 16 }}>
                <Row gutter={8}>
                  <Col span={8}>
                    <Form.Item name="province" noStyle>
                      <Select 
                        placeholder="省份"
                        options={[
                          { label: '江苏省', value: '江苏省' },
                        ]} 
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="city" noStyle>
                      <Select 
                        placeholder="城市"
                        options={[
                          { label: '常州市', value: '常州市' },
                        ]} 
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="district" noStyle>
                      <Select 
                        placeholder="区/县"
                        options={[
                          { label: '武进区', value: '武进区' },
                          { label: '新北区', value: '新北区' },
                          { label: '天宁区', value: '天宁区' },
                          { label: '钟楼区', value: '钟楼区' },
                          { label: '经开区', value: '经开区' },
                          { label: '金坛区', value: '金坛区' },
                          { label: '溧阳市', value: '溧阳市' },
                        ]} 
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="detailed_address" label="详细地址">
                <Input placeholder="请输入街道、门牌号等详细地址" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="domestic_revenue_wan" label="国内营收(万元)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入具体金额（万元）" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="crossborder_revenue_wan" label="跨境营收(万元)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入数字" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hasImportExportLicense" label="进出口经营权">
                <Select
                  allowClear={false}
                  options={[
                    { label: '有', value: true },
                    { label: '无', value: false },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="source_id" label="企业来源">
                <Select placeholder="请选择" options={sourceOptions} allowClear />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="website" label="官网">
                <Input placeholder="请输入官网地址" />
              </Form.Item>
            </Col>
            <Col span={24} style={{ marginTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1a56db', marginBottom: 8, borderBottom: '1px solid #e8eefb', paddingBottom: 4 }}>企业资质认证</div>
            </Col>
            <Col span={12}>
              <Form.Item name="iso_certifications" label="ISO认证">
                <Input placeholder="如 ISO9001:2015, ISO14001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="aeo_certification" label="AEO认证等级">
                <Input placeholder="如：高级认证、一般认证" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="other_certifications" label="其他资质证书">
                <Input placeholder="如 CE、FDA、高新技术企业等" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 编辑联系人信息模态框 */}
      <Modal
        title="编辑联系人信息"
        open={isEditContactOpen}
        onOk={handleEditContact}
        onCancel={() => setIsEditContactOpen(false)}
        okText="保存"
        cancelText="取消"
        width={720}
      >
        <div style={{ marginTop: 16, maxHeight: 500, overflowY: 'auto', paddingRight: 4 }}>
          {editingContacts.map((contact, index) => (
            <Card 
              key={index} 
              size="small" 
              style={{ 
                marginBottom: 12, 
                borderRadius: 10,
                border: contact.isPrimary ? '1px solid rgba(102,126,234,0.3)' : '1px solid #f0f0f0',
                background: contact.isPrimary ? 'linear-gradient(135deg, rgba(102,126,234,0.04) 0%, rgba(118,75,162,0.02) 100%)' : '#fff',
              }} 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{`联系人 ${index + 1}`}</span>
                  {contact.isPrimary && (
                    <span style={{ padding: '2px 8px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', borderRadius: 10, fontSize: 11, fontWeight: 500 }}>
                      <StarFilled style={{ marginRight: 3, fontSize: 10 }} />主要
                    </span>
                  )}
                </div>
              }
              extra={
                <Space size={4}>
                  {!contact.isPrimary && (
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => {
                        setEditingContacts(prev => prev.map((c, i) => ({ ...c, isPrimary: i === index })));
                      }}
                    >
                      设为主要
                    </Button>
                  )}
                  {editingContacts.length > 1 && (
                    <Button 
                      type="text" 
                      danger 
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveContact(index)}
                    >
                      删除
                    </Button>
                  )}
                </Space>
              }
            >
              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ marginBottom: 12 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>姓名 <span style={{ color: '#ff4d4f' }}>*</span></Text>
                    <Input 
                      value={contact.name} 
                      placeholder="请输入姓名"
                      onChange={(e) => handleContactFieldChange(index, 'name', e.target.value)} 
                    />
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ marginBottom: 12 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>电话 <span style={{ color: '#ff4d4f' }}>*</span></Text>
                    <Input 
                      value={contact.phone} 
                      placeholder="请输入电话"
                      onChange={(e) => handleContactFieldChange(index, 'phone', e.target.value)} 
                    />
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ marginBottom: 12 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>职位</Text>
                    <Input 
                      value={contact.position} 
                      placeholder="请输入职位"
                      onChange={(e) => handleContactFieldChange(index, 'position', e.target.value)} 
                    />
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ marginBottom: 12 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>邮箱</Text>
                    <Input 
                      value={contact.email} 
                      placeholder="请输入邮箱"
                      onChange={(e) => handleContactFieldChange(index, 'email', e.target.value)} 
                    />
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ marginBottom: 12 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>微信</Text>
                    <Input 
                      value={contact.wechat} 
                      placeholder="请输入微信号"
                      onChange={(e) => handleContactFieldChange(index, 'wechat', e.target.value)} 
                    />
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ marginBottom: 12 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>备注</Text>
                    <Input 
                      value={contact.remark} 
                      placeholder="请输入备注"
                      onChange={(e) => handleContactFieldChange(index, 'remark', e.target.value)} 
                    />
                  </div>
                </Col>
              </Row>
            </Card>
          ))}
          <Button type="dashed" block icon={<PlusOutlined />} onClick={handleAddContact}>添加联系人</Button>
        </div>
      </Modal>

      {/* 产品信息模态框 */}
      <Modal
        title={editingProduct ? '编辑产品' : '添加产品'}
        open={isProductModalOpen}
        onOk={handleSaveProduct}
        onCancel={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
          productForm.resetFields();
        }}
        okText="保存"
        cancelText="取消"
        width={700}
      >
        <Form form={productForm} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="产品名称" rules={[{ required: true, message: '请输入产品名称' }]}>
                <Input placeholder="请输入产品名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label="产品品类">
                <Cascader
                  placeholder="请选择产品品类"
                  options={productCascaderOptions}
                  showSearch
                  changeOnSelect
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="certification_ids" label="产品认证">
                <Select
                  mode="multiple"
                  placeholder="请选择产品认证（字典 certification，保存为选项 ID）"
                  options={certificationOptions}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="annual_sales" label="年销售额(万元)">
                <Input type="number" placeholder="请输入年销售额" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="export_ratio" label="出口占比">
                <Input placeholder="如 60" suffix="%" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="profit_margin" label="利润率">
                <Input placeholder="如 15 或 15-20" suffix="%" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="target_region_ids" label="主要销售区域">
                <Select
                  mode="multiple"
                  placeholder="请选择销售区域（字典 region）"
                  options={regionOptions}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="target_country_ids" label="主要销售国家">
                <Select
                  mode="tags"
                  placeholder="输入或选择国家/地区名称"
                  allowClear
                  options={[
                    { label: '美国', value: '美国' },
                    { label: '加拿大', value: '加拿大' },
                    { label: '英国', value: '英国' },
                    { label: '德国', value: '德国' },
                    { label: '法国', value: '法国' },
                    { label: '日本', value: '日本' },
                    { label: '韩国', value: '韩国' },
                    { label: '澳大利亚', value: '澳大利亚' },
                    { label: '新加坡', value: '新加坡' },
                    { label: '马来西亚', value: '马来西亚' },
                    { label: '泰国', value: '泰国' },
                    { label: '越南', value: '越南' },
                    { label: '印度', value: '印度' },
                    { label: '阿联酋', value: '阿联酋' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Card size="small" title="供应链与产能" style={{ marginTop: 8 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="local_procurement" label="原材料本地采购比例(%)">
                  <Input type="number" placeholder="如：70" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="automation_level_id" label="设备自动化程度">
                  <Select
                    placeholder="请选择（字典 automation_level）"
                    options={automationLevelOptionsProduct}
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="annual_capacity" label="年产能">
                  <Input placeholder="如：30万件" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="logistics_partner_ids" label="物流合作方">
                  <Select
                    mode="multiple"
                    placeholder="请选择物流合作方（字典 logistics）"
                    options={logisticsOptionsProduct}
                    allowClear
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form>
      </Modal>

      {/* 自主品牌模态框 */}
      <Modal
        title="编辑自主品牌"
        open={isBrandModalOpen}
        onOk={handleSaveBrand}
        onCancel={() => {
          setIsBrandModalOpen(false);
          brandForm.resetFields();
        }}
        okText="保存"
        cancelText="取消"
        width={500}
      >
        <Form form={brandForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="has_brand" label="是否有自主品牌">
            <Select
              options={[
                { label: '是', value: true },
                { label: '否', value: false },
              ]}
            />
          </Form.Item>
          <Form.Item name="brand_names" label="品牌名称">
            <Select
              mode="tags"
              placeholder="输入品牌名称后按回车添加"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 专利信息模态框 */}
      <Modal
        title={editingPatent ? '编辑专利' : '添加专利'}
        open={isPatentModalOpen}
        onOk={handleSavePatent}
        onCancel={() => {
          setIsPatentModalOpen(false);
          setEditingPatent(null);
          patentForm.resetFields();
        }}
        okText="保存"
        cancelText="取消"
        width={500}
      >
        <Form form={patentForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="专利/技术名称" rules={[{ required: true, message: '请输入专利名称' }]}>
            <Input placeholder="请输入专利或核心技术名称" />
          </Form.Item>
          <Form.Item name="patent_no" label="专利号">
            <Input placeholder="如：ZL2023XXXXXXXX.X" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 产品信息编辑模态框（企业级销售区域/国家/进出口资质；品类与认证等见产品列表） */}
      <Modal
        title="编辑产品信息"
        open={isProductOverviewModalOpen}
        afterOpenChange={(open) => {
          if (open && enterprise) {
            const regionIds =
              Array.isArray(enterprise.target_region_ids) && enterprise.target_region_ids.length > 0
                ? enterprise.target_region_ids
                : Array.isArray(enterprise.targetRegionIds)
                  ? enterprise.targetRegionIds
                  : [];
            const countryIds =
              Array.isArray(enterprise.target_country_ids) && enterprise.target_country_ids.length > 0
                ? enterprise.target_country_ids
                : Array.isArray(enterprise.targetCountryIds)
                  ? enterprise.targetCountryIds
                  : [];
            const lic = enterprise.has_import_export_license;
            const hasLicense =
              lic === true || lic === 1 || lic === '1' || enterprise.hasImportExportLicense === true || enterprise.hasImportExportLicense === 1;
            productOverviewForm.setFieldsValue({
              targetRegionIds: regionIds,
              targetCountryIds: countryIds,
              hasImportExportLicense: hasLicense,
            });
          }
          if (!open) {
            productOverviewForm.resetFields();
          }
        }}
        onOk={async () => {
          const values = productOverviewForm.getFieldsValue(true);
          const fallbackRegions = enterprise.target_region_ids || enterprise.targetRegionIds || [];
          const fallbackCountries = enterprise.target_country_ids || enterprise.targetCountryIds || [];
          const targetRegionIds = Array.isArray(values.targetRegionIds)
            ? values.targetRegionIds
            : fallbackRegions;
          const targetCountryIds = Array.isArray(values.targetCountryIds)
            ? values.targetCountryIds
            : fallbackCountries;
          let licVal = values.hasImportExportLicense;
          if (licVal === undefined || licVal === null) {
            const lic = enterprise.has_import_export_license;
            licVal = lic === true || lic === 1 || lic === '1';
          }
          const ok = await saveEnterpriseFields(
            {
              targetRegionIds,
              targetCountryIds,
              hasImportExportLicense: licVal ? 1 : 0,
            },
            '产品信息更新成功'
          );
          if (ok) setIsProductOverviewModalOpen(false);
        }}
        onCancel={() => setIsProductOverviewModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={640}
      >
        <Form form={productOverviewForm} layout="vertical" style={{ marginTop: 16 }}>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message="说明"
            description="本弹窗仅三项，与上方「产品总体概览」第一组字段一一对应：主要销售区域、主要销售国家、是否有进出口资质。产品数量、产品品类、年销售额合计、产品认证、物流合作方由下方「产品列表」自动汇总，请在列表中「添加产品」或「编辑」维护。"
          />
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="targetRegionIds" label="主要销售区域">
                <Select mode="multiple" placeholder="请选择销售区域" options={regionOptions} allowClear />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="targetCountryIds" label="主要销售国家">
                <Select
                  mode="multiple"
                  placeholder="请选择销售国家"
                  allowClear
                  options={[
                    { label: '美国', value: '美国' }, { label: '加拿大', value: '加拿大' },
                    { label: '英国', value: '英国' }, { label: '德国', value: '德国' },
                    { label: '法国', value: '法国' }, { label: '日本', value: '日本' },
                    { label: '韩国', value: '韩国' }, { label: '澳大利亚', value: '澳大利亚' },
                    { label: '新加坡', value: '新加坡' }, { label: '马来西亚', value: '马来西亚' },
                    { label: '泰国', value: '泰国' }, { label: '越南', value: '越南' },
                    { label: '印度', value: '印度' }, { label: '阿联酋', value: '阿联酋' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="hasImportExportLicense" label="是否有进出口资质">
                <Select
                  allowClear={false}
                  options={[{ label: '是', value: true }, { label: '否', value: false }]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 外贸信息编辑模态框 */}
      <Modal
        title="编辑外贸信息"
        open={isTradeModalOpen}
        afterOpenChange={(open) => {
          if (open && enterprise) {
            tradeForm.setFieldsValue({
              tradeModeId: enterprise.trade_mode_id,
              customsDeclarationMode: enterprise.customs_declaration_mode,
              tradeTeamModeId: enterprise.trade_team_mode_id,
              tradeTeamSize: enterprise.trade_team_size,
              hasDomesticEcommerce: enterprise.has_domestic_ecommerce === 1,
              hasOverseasDistributors: !!enterprise.has_overseas_distributors,
            });
          }
        }}
        onOk={async () => {
          const values = tradeForm.getFieldsValue();
          const rawSize = values.tradeTeamSize;
          const tradeTeamSize =
            rawSize === undefined || rawSize === null || rawSize === ''
              ? null
              : Number(rawSize);
          const ok = await saveEnterpriseFields({
            tradeModeId: values.tradeModeId,
            customsDeclarationMode: values.customsDeclarationMode,
            tradeTeamModeId: values.tradeTeamModeId,
            tradeTeamSize: Number.isFinite(tradeTeamSize as number) ? tradeTeamSize : null,
            hasDomesticEcommerce: values.hasDomesticEcommerce ? 1 : 0,
            hasOverseasDistributors: values.hasOverseasDistributors ? 1 : 0,
            marketChanges: marketChanges,
            modeChanges: modeChanges,
            categoryChanges: categoryChanges,
            growthReasons: growthReasons,
            declineReasons: declineReasons,
          }, '外贸信息更新成功');
          if (ok) {
            setIsTradeModalOpen(false);
          }
        }}
        onCancel={() => setIsTradeModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={700}
      >
        <Form form={tradeForm} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="tradeModeId" label="外贸模式">
                <Select placeholder="请选择外贸模式" options={tradeModeOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customsDeclarationMode" label="报关申报主体模式">
                <Select options={[{ label: '自营', value: '自营' }, { label: '代理', value: '代理' }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tradeTeamModeId" label="外贸业务团队模式">
                <Select placeholder="请选择团队模式" options={tradeTeamModeOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tradeTeamSize" label="外贸团队人数">
                <Input type="number" placeholder="请输入团队人数" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hasDomesticEcommerce" label="是否有国内电商经验">
                <Select options={[{ label: '是', value: true }, { label: '否', value: false }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hasOverseasDistributors" label="是否有海外分销商">
                <Select options={[{ label: '是', value: true }, { label: '否', value: false }]} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 原因编辑模态框：可从字典选或手输；新手输文案会写入 system_options（growth_reason / decline_reason） */}
      <Modal
        title={editingReason ? '编辑原因' : '添加原因'}
        open={isReasonModalOpen}
        confirmLoading={reasonModalSaving}
        afterOpenChange={(open) => {
          if (open) loadTradeReasonOptions();
        }}
        onOk={async () => {
          try {
            await reasonForm.validateFields();
          } catch {
            return;
          }
          const raw = reasonForm.getFieldValue('reason');
          const text = String(raw ?? '').trim();
          if (!text) {
            message.warning('请输入原因');
            return;
          }
          if (!editingReason && reasonType === 'growth' && growthReasons.includes(text)) {
            message.warning('该增长原因已在列表中');
            return;
          }
          if (!editingReason && reasonType === 'decline' && declineReasons.includes(text)) {
            message.warning('该下降原因已在列表中');
            return;
          }

          setReasonModalSaving(true);
          try {
            const category = reasonType === 'growth' ? 'growth_reason' : 'decline_reason';
            const suggestList = reasonType === 'growth' ? growthReasonSuggest : declineReasonSuggest;
            const labelSet = new Set(suggestList.map((o) => o.label));
            let addedToDictionary = false;
            if (!labelSet.has(text)) {
              await dictionaryApi.addOption(category, {
                value: makeCustomDictionaryValue(),
                label: text,
                sortOrder: 9000 + suggestList.length,
              });
              addedToDictionary = true;
              await loadTradeReasonOptions();
            }

            let nextGrowth = [...growthReasons];
            let nextDecline = [...declineReasons];
            if (reasonType === 'growth') {
              if (editingReason) {
                nextGrowth = nextGrowth.map((r, i) => (i === editingReason.index ? text : r));
              } else {
                nextGrowth.push(text);
              }
            } else if (editingReason) {
              nextDecline = nextDecline.map((r, i) => (i === editingReason.index ? text : r));
            } else {
              nextDecline.push(text);
            }

            setGrowthReasons(nextGrowth);
            setDeclineReasons(nextDecline);

            const successMsg = editingReason
              ? '原因已更新'
              : addedToDictionary
                ? '原因已保存，并已同步到数据字典'
                : '原因已保存';

            const ok = await saveEnterpriseFields(
              { growthReasons: nextGrowth, declineReasons: nextDecline },
              successMsg,
            );
            if (ok) {
              setIsReasonModalOpen(false);
              reasonForm.resetFields();
            }
          } catch (e: any) {
            message.error(e?.message || '保存失败');
          } finally {
            setReasonModalSaving(false);
          }
        }}
        onCancel={() => { setIsReasonModalOpen(false); reasonForm.resetFields(); }}
        okText="保存"
        cancelText="取消"
        width={440}
      >
        <Form form={reasonForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="reason"
            label={reasonType === 'growth' ? '增长原因' : '下降原因'}
            rules={[{ required: true, message: '请输入或选择原因' }]}
            extra="可从下拉选择字典项，或直接输入新原因；保存时新文案会自动加入数据字典对应分类。"
          >
            <AutoComplete
              options={reasonType === 'growth' ? growthReasonSuggest : declineReasonSuggest}
              placeholder="选择或输入原因"
              allowClear
              style={{ width: '100%' }}
              filterOption={(inputValue, option) =>
                String(option?.label ?? '')
                  .toLowerCase()
                  .includes(String(inputValue).toLowerCase())
              }
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 外贸业绩变化编辑模态框 */}
      <Modal
        title={editingTradeChange ? '编辑' : '添加'}
        open={isTradeChangeModalOpen}
        confirmLoading={tradeChangeSaving}
        onOk={() => {
          tradeChangeForm.validateFields().then(async (values) => {
            let nextM = marketChanges;
            let nextMo = modeChanges;
            let nextC = categoryChanges;
            const dir = tradeChangeDirection;
            const rateRaw = String(values.rate ?? '').trim();
            const rateNormalized = rateRaw.endsWith('%') ? rateRaw : `${rateRaw}%`;

            if (tradeChangeType === 'market') {
              const newItem = { type: values.type || 'region', name: values.name, rate: rateNormalized };
              if (editingTradeChange) {
                nextM = {
                  ...marketChanges,
                  [dir]: marketChanges[dir].map((item) =>
                    item.name === editingTradeChange.name ? newItem : item,
                  ),
                };
              } else {
                nextM = {
                  ...marketChanges,
                  [dir]: [...marketChanges[dir], newItem],
                };
              }
            } else if (tradeChangeType === 'mode') {
              const newItem = { name: values.name, rate: rateNormalized };
              if (editingTradeChange) {
                nextMo = {
                  ...modeChanges,
                  [dir]: modeChanges[dir].map((item) =>
                    item.name === editingTradeChange.name ? newItem : item,
                  ),
                };
              } else {
                nextMo = {
                  ...modeChanges,
                  [dir]: [...modeChanges[dir], newItem],
                };
              }
            } else {
              let categoryName = '';
              if (values.category) {
                const findCategoryPath = (options, targetPath, currentPath = []) => {
                  for (const option of options) {
                    const newPath = [...currentPath, option.label];
                    if (option.value === targetPath[targetPath.length - 1]) {
                      return newPath.join(' > ');
                    }
                    if (option.children) {
                      const result = findCategoryPath(option.children, targetPath, newPath);
                      if (result) return result;
                    }
                  }
                  return null;
                };

                const categoryOptions = [
                  {
                    value: 1,
                    label: '园艺工具',
                    children: [
                      {
                        value: 101,
                        label: '园艺手工具',
                        children: [
                          { value: 10101, label: '铲子' },
                          { value: 10102, label: '剪刀' },
                          { value: 10103, label: '耙子' },
                          { value: 10104, label: '锄头' },
                        ],
                      },
                      { value: 102, label: '园艺电动工具' },
                      { value: 103, label: '园艺装饰品' },
                      { value: 104, label: '花盆花器' },
                      { value: 105, label: '灌溉设备' },
                    ],
                  },
                  {
                    value: 2,
                    label: '电动工具',
                    children: [
                      { value: 201, label: '电钻' },
                      { value: 202, label: '电锯' },
                      { value: 203, label: '角磨机' },
                      { value: 204, label: '电动扳手' },
                      { value: 205, label: '抛光机' },
                    ],
                  },
                  {
                    value: 3,
                    label: '家居用品',
                    children: [
                      { value: 301, label: '厨房用品' },
                      { value: 302, label: '卫浴用品' },
                      { value: 303, label: '收纳整理' },
                      { value: 304, label: '家居装饰' },
                      { value: 305, label: '清洁用品' },
                    ],
                  },
                  {
                    value: 4,
                    label: '户外运动',
                    children: [
                      { value: 401, label: '露营装备' },
                      { value: 402, label: '运动器材' },
                      { value: 403, label: '户外服装' },
                      { value: 404, label: '登山装备' },
                    ],
                  },
                  {
                    value: 6,
                    label: '电子产品',
                    children: [
                      { value: 601, label: '消费电子' },
                      { value: 602, label: '智能硬件' },
                      { value: 603, label: '电子配件' },
                      { value: 604, label: '照明产品' },
                    ],
                  },
                ];

                categoryName = findCategoryPath(categoryOptions, values.category) || '未知品类';
              }

              const newItem = { name: categoryName, rate: rateNormalized };
              if (editingTradeChange) {
                nextC = {
                  ...categoryChanges,
                  [dir]: categoryChanges[dir].map((item) =>
                    item.name === editingTradeChange.name ? newItem : item,
                  ),
                };
              } else {
                nextC = {
                  ...categoryChanges,
                  [dir]: [...categoryChanges[dir], newItem],
                };
              }
            }

            setTradeChangeSaving(true);
            try {
              const ok = await persistTradePerformanceJson(
                nextM,
                nextMo,
                nextC,
                editingTradeChange ? '修改成功' : '添加成功',
              );
              if (ok) {
                setIsTradeChangeModalOpen(false);
                tradeChangeForm.resetFields();
              }
            } finally {
              setTradeChangeSaving(false);
            }
          });
        }}
        onCancel={() => { setIsTradeChangeModalOpen(false); tradeChangeForm.resetFields(); }}
        okText="保存"
        cancelText="取消"
        width={400}
      >
        <Form form={tradeChangeForm} layout="vertical" style={{ marginTop: 16 }}>
          {tradeChangeType === 'market' ? (
            <>
              <Form.Item name="type" label="市场类型" rules={[{ required: true, message: '请选择市场类型' }]} initialValue="region">
                <Select
                  placeholder="请选择市场类型"
                  options={[
                    { label: '区域', value: 'region' },
                    { label: '国家', value: 'country' },
                  ]}
                />
              </Form.Item>
              <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
                {({ getFieldValue }) => (
                  <Form.Item name="name" label={getFieldValue('type') === 'country' ? '国家' : '区域'} rules={[{ required: true, message: '请选择' }]}>
                    <Select
                      placeholder={getFieldValue('type') === 'country' ? '请选择国家' : '请选择区域'}
                      options={getFieldValue('type') === 'country' ? [
                        { label: '美国', value: '美国' },
                        { label: '加拿大', value: '加拿大' },
                        { label: '英国', value: '英国' },
                        { label: '德国', value: '德国' },
                        { label: '法国', value: '法国' },
                        { label: '日本', value: '日本' },
                        { label: '韩国', value: '韩国' },
                        { label: '澳大利亚', value: '澳大利亚' },
                        { label: '新加坡', value: '新加坡' },
                        { label: '马来西亚', value: '马来西亚' },
                        { label: '泰国', value: '泰国' },
                        { label: '越南', value: '越南' },
                        { label: '印度', value: '印度' },
                        { label: '阿联酋', value: '阿联酋' },
                      ] : [
                        { label: '北美', value: '北美' },
                        { label: '欧洲', value: '欧洲' },
                        { label: '东南亚', value: '东南亚' },
                        { label: '东亚', value: '东亚' },
                        { label: '南亚', value: '南亚' },
                        { label: '中东', value: '中东' },
                        { label: '非洲', value: '非洲' },
                        { label: '南美', value: '南美' },
                        { label: '大洋洲', value: '大洋洲' },
                      ]}
                    />
                  </Form.Item>
                )}
              </Form.Item>
            </>
          ) : tradeChangeType === 'category' ? (
            <Form.Item name="category" label="产品品类" rules={[{ required: true, message: '请选择品类' }]}>
              <Cascader 
                placeholder="请选择产品品类"
                options={[
                  {
                    value: 1,
                    label: '园艺工具',
                    children: [
                      {
                        value: 101,
                        label: '园艺手工具',
                        children: [
                          { value: 10101, label: '铲子' },
                          { value: 10102, label: '剪刀' },
                          { value: 10103, label: '耙子' },
                          { value: 10104, label: '锄头' },
                        ]
                      },
                      { value: 102, label: '园艺电动工具' },
                      { value: 103, label: '园艺装饰品' },
                      { value: 104, label: '花盆花器' },
                      { value: 105, label: '灌溉设备' },
                    ]
                  },
                  {
                    value: 2,
                    label: '电动工具',
                    children: [
                      { value: 201, label: '电钻' },
                      { value: 202, label: '电锯' },
                      { value: 203, label: '角磨机' },
                      { value: 204, label: '电动扳手' },
                      { value: 205, label: '抛光机' },
                    ]
                  },
                  {
                    value: 3,
                    label: '家居用品',
                    children: [
                      { value: 301, label: '厨房用品' },
                      { value: 302, label: '卫浴用品' },
                      { value: 303, label: '收纳整理' },
                      { value: 304, label: '家居装饰' },
                      { value: 305, label: '清洁用品' },
                    ]
                  },
                  {
                    value: 4,
                    label: '户外运动',
                    children: [
                      { value: 401, label: '露营装备' },
                      { value: 402, label: '运动器材' },
                      { value: 403, label: '户外服装' },
                      { value: 404, label: '登山装备' },
                    ]
                  },
                  {
                    value: 6,
                    label: '电子产品',
                    children: [
                      { value: 601, label: '消费电子' },
                      { value: 602, label: '智能硬件' },
                      { value: 603, label: '电子配件' },
                      { value: 604, label: '照明产品' },
                    ]
                  },
                ]}
                showSearch
                displayRender={(labels) => labels.join(' > ')}
              />
            </Form.Item>
          ) : (
            <Form.Item name="name" label="模式名称" rules={[{ required: true, message: '请输入名称' }]}>
              <Input placeholder="请输入名称" />
            </Form.Item>
          )}
          <Form.Item name="rate" label="变化率" rules={[{ required: true, message: '请输入变化率' }]}>
            <Input placeholder={tradeChangeDirection === 'up' ? '例如: +25' : '例如: -8'} addonAfter="%" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 外贸业绩分析编辑模态框 */}
      <Modal
        title="编辑外贸业绩分析"
        open={isTradePerformanceModalOpen}
        confirmLoading={tradePerformanceSaving}
        onOk={async () => {
          try {
            await tradePerformanceForm.validateFields();
          } catch {
            return;
          }
          const values = tradePerformanceForm.getFieldsValue();
          const toNum = (v: unknown) => {
            if (v === '' || v === undefined || v === null) return undefined;
            const n = Number(v);
            return Number.isFinite(n) ? n : undefined;
          };
          const lastYearRevenue = toNum(values.lastYearRevenue);
          const yearBeforeLastRevenue = toNum(values.yearBeforeLastRevenue);
          if (lastYearRevenue === undefined || yearBeforeLastRevenue === undefined) {
            message.warning('请填写两年外贸营业额');
            return;
          }
          setTradePerformanceSaving(true);
          try {
            const ok = await saveEnterpriseFields(
              { lastYearRevenue, yearBeforeLastRevenue },
              '外贸业绩分析更新成功'
            );
            if (ok) setIsTradePerformanceModalOpen(false);
          } finally {
            setTradePerformanceSaving(false);
          }
        }}
        onCancel={() => setIsTradePerformanceModalOpen(false)}
        width={800}
        okText="保存"
        cancelText="取消"
      >
        <Form form={tradePerformanceForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label={`${new Date().getFullYear() - 2}年外贸营业额(万元)`}
                name="yearBeforeLastRevenue"
                rules={[{ required: true, message: '请输入营业额' }]}
              >
                <Input type="number" placeholder="请输入营业额" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label={`${new Date().getFullYear() - 1}年外贸营业额(万元)`}
                name="lastYearRevenue"
                rules={[{ required: true, message: '请输入营业额' }]}
              >
                <Input type="number" placeholder="请输入营业额" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 跨境平台编辑模态框 */}
      <Modal
        title="编辑主要跨境平台"
        open={isCrossborderPlatformModalOpen}
        onOk={async () => {
          const ok = await saveEnterpriseFields({
            crossBorderPlatforms: selectedCrossborderPlatforms,
          }, '跨境平台信息更新成功');
          if (ok) setIsCrossborderPlatformModalOpen(false);
        }}
        onCancel={() => setIsCrossborderPlatformModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={500}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="主要跨境平台">
            <Select
              mode="multiple"
              value={selectedCrossborderPlatforms}
              onChange={setSelectedCrossborderPlatforms}
              placeholder="请选择跨境平台"
              options={[
                { label: '亚马逊 (Amazon)', value: '亚马逊 (Amazon)' },
                { label: '阿里国际站 (Alibaba.com)', value: '阿里国际站 (Alibaba.com)' },
                { label: 'TikTok Shop', value: 'TikTok Shop' },
                { label: '速卖通 (AliExpress)', value: '速卖通 (AliExpress)' },
                { label: 'eBay', value: 'eBay' },
                { label: '独立站 (Shopify)', value: '独立站 (Shopify)' },
                { label: 'Temu', value: 'Temu' },
                { label: 'SHEIN', value: 'SHEIN' },
                { label: '沃尔玛 (Walmart)', value: '沃尔玛 (Walmart)' },
                { label: 'Lazada', value: 'Lazada' },
                { label: 'Shopee', value: 'Shopee' },
                { label: 'Wish', value: 'Wish' },
                { label: 'Etsy', value: 'Etsy' },
                { label: 'Wayfair', value: 'Wayfair' },
                { label: 'Mercado Libre', value: 'Mercado Libre' },
                { label: '乐天 (Rakuten)', value: '乐天 (Rakuten)' },
                { label: '京东国际 (JD Global)', value: '京东国际 (JD Global)' },
                { label: '其他', value: '其他' },
              ]}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 跨境基本信息编辑模态框 */}
      <Modal
        title="编辑跨境基本信息"
        open={isCrossborderBasicModalOpen}
        afterOpenChange={(open) => {
          if (open && enterprise) {
            const hasCb =
              enterprise.has_cross_border === 1 ||
              enterprise.has_cross_border === true;
            const erpOn =
              enterprise.using_erp === 1 || enterprise.using_erp === true;
            crossborderForm.setFieldsValue({
              hasCrossBorder: !!hasCb,
              crossBorderRatio:
                enterprise.cross_border_ratio != null &&
                enterprise.cross_border_ratio !== ''
                  ? String(enterprise.cross_border_ratio).replace(/%$/, '')
                  : undefined,
              crossBorderLogistics: enterprise.cross_border_logistics,
              paymentSettlement: enterprise.payment_settlement,
              crossBorderTeamSize: enterprise.cross_border_team_size,
              usingErp: erpOn ? 1 : 0,
              transformationWillingness: enterprise.transformation_willingness,
              investmentWillingness: enterprise.investment_willingness,
            });
          }
        }}
        onOk={async () => {
          try {
            await crossborderForm.validateFields();
          } catch {
            return;
          }
          const values = crossborderForm.getFieldsValue();
          const rawRatio = values.crossBorderRatio;
          const crossBorderRatioStr =
            rawRatio === undefined || rawRatio === null || String(rawRatio).trim() === ''
              ? null
              : String(rawRatio).trim();
          const rawTeam = values.crossBorderTeamSize;
          const crossBorderTeamSize =
            rawTeam === undefined || rawTeam === null || rawTeam === ''
              ? null
              : Number(rawTeam);
          const ok = await saveEnterpriseFields({
            hasCrossBorder: values.hasCrossBorder ? 1 : 0,
            crossBorderRatio: crossBorderRatioStr,
            crossBorderLogistics: values.crossBorderLogistics ?? null,
            paymentSettlement: values.paymentSettlement ?? null,
            crossBorderTeamSize:
              crossBorderTeamSize != null && Number.isFinite(crossBorderTeamSize)
                ? crossBorderTeamSize
                : null,
            usingErp: values.usingErp === 1 || values.usingErp === true ? 1 : 0,
            transformationWillingness: values.transformationWillingness ?? null,
            investmentWillingness: values.investmentWillingness ?? null,
          }, '跨境基本信息更新成功');
          if (ok) setIsCrossborderBasicModalOpen(false);
        }}
        onCancel={() => setIsCrossborderBasicModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={700}
      >
        <Form form={crossborderForm} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="hasCrossBorder" label="是否开展跨境电商">
                <Select options={[{ label: '是', value: true }, { label: '否', value: false }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="crossBorderRatio" label="跨境业务占比(%)">
                <Input type="number" placeholder="请输入占比" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="crossBorderLogistics" label="跨境物流模式">
                <Select 
                  placeholder="请选择物流模式"
                  options={[
                    { label: '海运', value: '海运' },
                    { label: '空运', value: '空运' },
                    { label: '国际快递', value: '国际快递' },
                    { label: 'FBA (亚马逊物流)', value: 'FBA (亚马逊物流)' },
                    { label: '海外仓', value: '海外仓' },
                    { label: '一件代发', value: '一件代发' },
                    { label: '中国邮政小包', value: '中国邮政小包' },
                    { label: '专线物流', value: '专线物流' },
                    { label: '铁路运输', value: '铁路运输' },
                    { label: '混合模式', value: '混合模式' },
                    { label: '其他', value: '其他' },
                  ]}
                  showSearch
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="paymentSettlement" label="支付结算方式">
                <Select 
                  placeholder="请选择结算方式"
                  options={[
                    { label: 'FOB (离岸价)', value: 'FOB (离岸价)' },
                    { label: 'CIF (到岸价)', value: 'CIF (到岸价)' },
                    { label: 'EXW (工厂交货)', value: 'EXW (工厂交货)' },
                    { label: 'DDP (完税后交货)', value: 'DDP (完税后交货)' },
                    { label: '现款现货', value: '现款现货' },
                    { label: '账期30天', value: '账期30天' },
                    { label: '账期60天', value: '账期60天' },
                    { label: '账期90天', value: '账期90天' },
                    { label: '信用证 (L/C)', value: '信用证 (L/C)' },
                    { label: '电汇 (T/T)', value: '电汇 (T/T)' },
                    { label: 'PayPal', value: 'PayPal' },
                    { label: 'Stripe', value: 'Stripe' },
                    { label: '支付宝国际', value: '支付宝国际' },
                    { label: '平台代收', value: '平台代收' },
                    { label: '其他', value: '其他' },
                  ]}
                  showSearch
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="crossBorderTeamSize" label="跨境电商团队规模">
                <Input type="number" placeholder="请输入团队规模" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="usingErp" label="是否在用ERP">
                <Select
                  placeholder="请选择"
                  options={[
                    { label: '是', value: 1 },
                    { label: '否', value: 0 },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="transformationWillingness" label="跨境转型意愿">
                <Select options={[{ label: '高', value: '高' }, { label: '中', value: '中' }, { label: '低', value: '低' }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="investmentWillingness" label="愿意投入转型程度">
                <Select options={[{ label: '高', value: '高' }, { label: '中', value: '中' }, { label: '低', value: '低' }]} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 目标市场编辑模态框 */}
      <Modal
        title="编辑目标市场及占比"
        open={isMarketModalOpen}
        onOk={async () => {
          const ok = await saveEnterpriseFields({
            targetMarkets: targetMarkets,
          }, '目标市场信息更新成功');
          if (ok) setIsMarketModalOpen(false);
        }}
        onCancel={() => setIsMarketModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary">总占比: <Text strong style={{ color: targetMarkets.reduce((sum, m) => sum + m.percentage, 0) === 100 ? '#52c41a' : '#ff4d4f' }}>{targetMarkets.reduce((sum, m) => sum + m.percentage, 0)}%</Text></Text>
            <Button 
              type="dashed" 
              icon={<PlusOutlined />} 
              onClick={() => setTargetMarkets([...targetMarkets, { market: '', percentage: 0 }])}
            >
              添加市场
            </Button>
          </div>
          {targetMarkets.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
              <Select
                style={{ flex: 1 }}
                placeholder="选择市场"
                value={item.market || undefined}
                onChange={(value) => {
                  const newMarkets = [...targetMarkets];
                  newMarkets[index].market = value;
                  setTargetMarkets(newMarkets);
                }}
                showSearch
                options={[
                  { label: '北美', value: '北美' },
                  { label: '欧洲', value: '欧洲' },
                  { label: '东南亚', value: '东南亚' },
                  { label: '东亚', value: '东亚' },
                  { label: '南亚', value: '南亚' },
                  { label: '中东', value: '中东' },
                  { label: '非洲', value: '非洲' },
                  { label: '南美', value: '南美' },
                  { label: '大洋洲', value: '大洋洲' },
                ]}
              />
              <Input
                style={{ width: 100 }}
                type="number"
                min={0}
                max={100}
                suffix="%"
                value={item.percentage}
                onChange={(e) => {
                  const newMarkets = [...targetMarkets];
                  newMarkets[index].percentage = Number(e.target.value) || 0;
                  setTargetMarkets(newMarkets);
                }}
              />
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => {
                  const newMarkets = targetMarkets.filter((_, i) => i !== index);
                  setTargetMarkets(newMarkets);
                }}
                disabled={targetMarkets.length <= 1}
              />
            </div>
          ))}
          {targetMarkets.reduce((sum, m) => sum + m.percentage, 0) !== 100 && (
            <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 8 }}>
              <WarningOutlined /> 占比总和应为100%
            </div>
          )}
        </div>
      </Modal>

      {/* 跨境需求和痛点编辑模态框 */}
      <Modal
        title="编辑跨境需求和痛点"
        open={isCrossborderNeedsModalOpen}
        afterOpenChange={(open) => {
          if (open && enterprise) {
            const demands = enterprise.tricenter_demands || [];
            const needsKeys = ['transformation', 'operation', 'marketing', 'training', 'branding', 'talent', 'office', 'settle', 'register'];
            const values: Record<string, boolean> = {};
            needsKeys.forEach((key) => { values[`need_${key}`] = demands.includes(key); });
            needsForm.setFieldsValue(values);
          }
        }}
        onOk={async () => {
          const values = needsForm.getFieldsValue();
          const needsKeys = ['transformation', 'operation', 'marketing', 'training', 'branding', 'talent', 'office', 'settle', 'register'];
          const demands = needsKeys.filter(key => values[`need_${key}`]);
          const ok = await saveEnterpriseFields({
            tricenterDemands: demands,
          }, '跨境需求信息更新成功');
          if (ok) setIsCrossborderNeedsModalOpen(false);
        }}
        onCancel={() => setIsCrossborderNeedsModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={700}
      >
        <Form form={needsForm} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            {[
              { label: '转型跨境意愿', key: 'transformation' },
              { label: '代运营需求', key: 'operation' },
              { label: '流量营销需求', key: 'marketing' },
              { label: '跨境培训需求', key: 'training' },
              { label: '品牌孵化需求', key: 'branding' },
              { label: '跨境人才需求', key: 'talent' },
              { label: '共享办公工位', key: 'office' },
              { label: '签约入驻三中心', key: 'settle' },
              { label: '注册至三中心', key: 'register' },
            ].map((item) => (
              <Col span={12} key={item.key}>
                <Form.Item name={`need_${item.key}`} label={item.label}>
                  <Select options={[{ label: '是', value: true }, { label: '否', value: false }]} />
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Form>
      </Modal>


      {/* 三中心合作编辑模态框 */}
      <Modal
        title="编辑三中心合作"
        open={isTriCenterCoopModalOpen}
        afterOpenChange={(open) => {
          if (open && enterprise) {
            coopForm.setFieldsValue({
              tricenterDemands: enterprise.tricenter_demands || [],
              tricenterConcerns: enterprise.tricenter_concerns,
            });
          }
        }}
        onOk={async () => {
          const values = coopForm.getFieldsValue();
          const ok = await saveEnterpriseFields({
            tricenterDemands: values.tricenterDemands,
            tricenterConcerns: values.tricenterConcerns,
          }, '三中心合作信息更新成功');
          if (ok) setIsTriCenterCoopModalOpen(false);
        }}
        onCancel={() => setIsTriCenterCoopModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={coopForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="tricenterDemands" label="与三中心合作主要需求">
            <Select
              mode="multiple"
              options={[
                { label: '跨境电商运营培训', value: '跨境电商运营培训' },
                { label: '平台资源对接', value: '平台资源对接' },
                { label: '品牌孵化服务', value: '品牌孵化服务' },
                { label: '代运营服务', value: '代运营服务' },
                { label: '人才招聘', value: '人才招聘' },
                { label: '政策申报', value: '政策申报' },
              ]}
            />
          </Form.Item>
          <Form.Item name="tricenterConcerns" label="不考虑合作主要顾虑">
            <Input.TextArea placeholder="请输入不考虑合作的主要顾虑" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 跨境业务痛点编辑模态框 */}
      <Modal
        title="编辑跨境业务痛点"
        open={isCrossborderPainModalOpen}
        afterOpenChange={(open) => {
          if (open && enterprise) {
            painForm.setFieldsValue({ painPoints: enterprise.pain_points || [] });
          }
        }}
        onOk={async () => {
          const values = painForm.getFieldsValue();
          const ok = await saveEnterpriseFields({
            painPoints: values.painPoints,
          }, '跨境业务痛点更新成功');
          if (ok) setIsCrossborderPainModalOpen(false);
        }}
        onCancel={() => setIsCrossborderPainModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={500}
      >
        <Form form={painForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="painPoints" label="跨境业务痛点">
            <Select
              mode="multiple"
              options={[
                { label: '流量获取困难', value: '流量获取困难' },
                { label: '运营人才缺乏', value: '运营人才缺乏' },
                { label: '物流成本高', value: '物流成本高' },
                { label: '支付结算复杂', value: '支付结算复杂' },
                { label: '知识产权风险', value: '知识产权风险' },
                { label: '合规风险', value: '合规风险' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 合作可能性评估编辑模态框 */}
      <Modal
        title="编辑合作可能性评估"
        open={isEvaluationModalOpen}
        afterOpenChange={(open) => {
          if (open && enterprise) {
            evalForm.setFieldsValue({
              serviceCooperationRating: enterprise.service_cooperation_rating,
              investmentCooperationRating: enterprise.investment_cooperation_rating,
              incubationCooperationRating: enterprise.incubation_cooperation_rating,
              brandCooperationRating: enterprise.brand_cooperation_rating,
              trainingCooperationRating: enterprise.training_cooperation_rating,
              overallCooperationRating: enterprise.overall_cooperation_rating,
            });
          }
        }}
        onOk={async () => {
          const values = evalForm.getFieldsValue();
          const ok = await saveEnterpriseFields({
            serviceCooperationRating: values.serviceCooperationRating,
            investmentCooperationRating: values.investmentCooperationRating,
            incubationCooperationRating: values.incubationCooperationRating,
            brandCooperationRating: values.brandCooperationRating,
            trainingCooperationRating: values.trainingCooperationRating,
            overallCooperationRating: values.overallCooperationRating,
          }, '合作可能性评估更新成功');
          if (ok) setIsEvaluationModalOpen(false);
        }}
        onCancel={() => setIsEvaluationModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={evalForm} layout="vertical" style={{ marginTop: 16 }}>
          {[
            { label: '企业服务合作可能性', name: 'serviceCooperationRating' },
            { label: '招商入驻合作可能性', name: 'investmentCooperationRating' },
            { label: '孵化转型合作可能性', name: 'incubationCooperationRating' },
            { label: '品牌营销合作可能性', name: 'brandCooperationRating' },
            { label: '人才培训合作可能性', name: 'trainingCooperationRating' },
            { label: '跨境整体方案合作可能性', name: 'overallCooperationRating' },
          ].map((item) => (
            <Form.Item key={item.name} name={item.name} label={item.label}>
              <Rate />
            </Form.Item>
          ))}
        </Form>
      </Modal>

      {/* 初步评估编辑模态框 */}
      <Modal
        title="编辑初步评估"
        open={isPreliminaryModalOpen}
        afterOpenChange={(open) => {
          if (open && enterprise) {
            prelimForm.setFieldsValue({
              transformationWillingness: enterprise.transformation_willingness,
              investmentWillingness: enterprise.investment_willingness,
              benchmarkPossibility: enterprise.benchmark_possibility,
            });
          }
        }}
        onOk={async () => {
          const values = prelimForm.getFieldsValue();
          const ok = await saveEnterpriseFields({
            transformationWillingness: values.transformationWillingness,
            investmentWillingness: values.investmentWillingness,
            benchmarkPossibility: values.benchmarkPossibility ? Number(values.benchmarkPossibility) : null,
          }, '初步评估更新成功');
          if (ok) setIsPreliminaryModalOpen(false);
        }}
        onCancel={() => setIsPreliminaryModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={prelimForm} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="transformationWillingness" label="跨境转型意愿">
                <Select options={[{ label: '高', value: '高' }, { label: '中', value: '中' }, { label: '低', value: '低' }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="investmentWillingness" label="愿意投入转型程度">
                <Select options={[{ label: '高', value: '高' }, { label: '中', value: '中' }, { label: '低', value: '低' }]} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="benchmarkPossibility" label="成为标杆企业可能性(%)">
                <Input type="number" placeholder="请输入0-100之间的数值" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 补充说明编辑模态框 */}
      <Modal
        title="编辑补充说明"
        open={isSupplementModalOpen}
        afterOpenChange={(open) => {
          if (open && enterprise) {
            supplementForm.setFieldsValue({
              additionalNotes: enterprise.additional_notes,
            });
          }
        }}
        onOk={async () => {
          const values = supplementForm.getFieldsValue();
          const ok = await saveEnterpriseFields({
            additionalNotes: values.additionalNotes,
          }, '补充说明更新成功');
          if (ok) setIsSupplementModalOpen(false);
        }}
        onCancel={() => setIsSupplementModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={supplementForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="additionalNotes" label="补充说明">
            <Input.TextArea rows={6} placeholder="请输入补充说明" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 政策支持情况编辑模态框 */}
      <Modal
        title="编辑政策支持情况"
        open={isPolicySupportModalOpen}
        afterOpenChange={(open) => {
          if (open && enterprise) {
            policyForm.setFieldsValue({
              hasPolicySupport:
                enterprise.has_policy_support === 1 || enterprise.has_policy_support === true,
              enjoyedPolicies: enterprise.enjoyed_policies || [],
            });
          }
        }}
        onOk={async () => {
          try {
            const values = await policyForm.validateFields();
            const ok = await saveEnterpriseFields(
              {
                hasPolicySupport: values.hasPolicySupport ? 1 : 0,
                enjoyedPolicies: values.enjoyedPolicies ?? [],
              },
              '政策支持情况更新成功',
            );
            if (ok) setIsPolicySupportModalOpen(false);
          } catch {
            /* 表单校验未通过，保持弹窗打开 */
          }
        }}
        onCancel={() => setIsPolicySupportModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={500}
      >
        <Form form={policyForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="hasPolicySupport" label="是否享受过政策支持">
            <Select options={[{ label: '是', value: true }, { label: '否', value: false }]} />
          </Form.Item>
          <Form.Item name="enjoyedPolicies" label="已享受政策">
            <Select mode="multiple" options={ENJOYED_POLICY_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 行业竞争地位编辑模态框 */}
      <Modal
        title="编辑行业竞争地位"
        open={isCompetitionModalOpen}
        afterOpenChange={(open) => {
          if (open && enterprise) {
            competitionForm.setFieldsValue({
              competitionPosition: enterprise.competition_position,
              competitionDescription: enterprise.competition_description,
            });
          }
        }}
        onOk={async () => {
          const values = competitionForm.getFieldsValue();
          const ok = await saveEnterpriseFields({
            competitionPosition: values.competitionPosition,
            competitionDescription: values.competitionDescription,
          }, '行业竞争地位更新成功');
          if (ok) setIsCompetitionModalOpen(false);
        }}
        onCancel={() => setIsCompetitionModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={500}
      >
        <Form form={competitionForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="competitionPosition" label="行业竞争地位">
            <Select
              options={[
                { label: '头部企业', value: '头部企业' },
                { label: '中型企业', value: '中型企业' },
                { label: '初创企业', value: '初创企业' },
              ]}
            />
          </Form.Item>
          <Form.Item name="competitionDescription" label="竞争地位描述">
            <Input.TextArea rows={3} placeholder="请描述企业在行业中的竞争地位" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 当前面临风险编辑模态框 */}
      <Modal
        title="编辑当前面临风险"
        open={isRiskModalOpen}
        afterOpenChange={(open) => {
          if (open && enterprise) {
            riskForm.setFieldsValue({
              risks: Array.isArray(enterprise.current_risk_tags) ? enterprise.current_risk_tags : [],
              riskDescription: enterprise.risk_description || '',
            });
          }
        }}
        onOk={async () => {
          const values = riskForm.getFieldsValue();
          const ok = await saveEnterpriseFields(
            {
              currentRiskTags: Array.isArray(values.risks) ? values.risks : [],
              riskDescription: (values.riskDescription && String(values.riskDescription).trim()) || '',
            },
            '当前面临风险更新成功'
          );
          if (ok) setIsRiskModalOpen(false);
        }}
        onCancel={() => setIsRiskModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={riskForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="risks" label="当前面临的主要风险">
            <Select
              mode="multiple"
              options={[
                { label: '原材料价格波动风险', value: '原材料价格波动风险' },
                { label: '跨境物流成本上涨', value: '跨境物流成本上涨' },
                { label: '人才流失风险', value: '人才流失风险' },
                { label: '汇率波动风险', value: '汇率波动风险' },
                { label: '市场竞争加剧', value: '市场竞争加剧' },
                { label: '政策变化风险', value: '政策变化风险' },
              ]}
            />
          </Form.Item>
          <Form.Item name="riskDescription" label="风险详细描述">
            <Input.TextArea rows={4} placeholder="请详细描述当前面临的风险情况" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default EnterpriseDetail;
