// @ts-nocheck
import { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card,
  Tabs,
  Tag,
  Button,
  Space,
  Modal,
  Select,
  Typography,
  Row,
  Col,
  message,
  Cascader,
  Spin,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  EnvironmentOutlined,
  DeleteOutlined,
  RightOutlined,
  ArrowRightOutlined,
  RiseOutlined,
  FallOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { Form, Input, DatePicker, InputNumber } from 'antd';
import { enterpriseApi, contactApi, optionsApi, dictionaryApi, surveyExcelApi, serviceRecordApi, followUpApi, productApi, patentApi } from '@/services/api';
import type { RequirementConfigData } from '@/services/api';
import {
  enterpriseDetailCardTitle,
} from '@/components/enterpriseDetail/EnterpriseDetailSectionHint';
import { ENTERPRISE_GUIDE_TAB_EVENT } from '@/components/appGuideConfig';
import StageChangeModal from './EnterpriseDetail/modals/StageChangeModal';
import FollowUpModal from './EnterpriseDetail/modals/FollowUpModal';
import PatentModal from './EnterpriseDetail/modals/PatentModal';
import BrandModal from './EnterpriseDetail/modals/BrandModal';
import PolicySupportModal from './EnterpriseDetail/modals/PolicySupportModal';
import CompetitionModal from './EnterpriseDetail/modals/CompetitionModal';
import RiskModal from './EnterpriseDetail/modals/RiskModal';
import SupplementModal from './EnterpriseDetail/modals/SupplementModal';
import TriCenterCoopModal from './EnterpriseDetail/modals/TriCenterCoopModal';
import CrossborderPainModal from './EnterpriseDetail/modals/CrossborderPainModal';
import EvaluationModal from './EnterpriseDetail/modals/EvaluationModal';
import PreliminaryModal from './EnterpriseDetail/modals/PreliminaryModal';
import CrossborderPlatformModal from './EnterpriseDetail/modals/CrossborderPlatformModal';
import MarketModal from './EnterpriseDetail/modals/MarketModal';
import CrossborderNeedsModal from './EnterpriseDetail/modals/CrossborderNeedsModal';
import TradeModal from './EnterpriseDetail/modals/TradeModal';
import ReasonModal from './EnterpriseDetail/modals/ReasonModal';
import ProductModal from './EnterpriseDetail/modals/ProductModal';
import CrossborderBasicModal from './EnterpriseDetail/modals/CrossborderBasicModal';
import TradePerformanceModal from './EnterpriseDetail/modals/TradePerformanceModal';
import EditEnterpriseModal from './EnterpriseDetail/modals/EditEnterpriseModal';
import EditContactModal from './EnterpriseDetail/modals/EditContactModal';
import ProductOverviewModal from './EnterpriseDetail/modals/ProductOverviewModal';
import TradeChangeModal from './EnterpriseDetail/modals/TradeChangeModal';
import BasicInfoTab from './EnterpriseDetail/tabs/BasicInfoTab';
import ProductInfoTab from './EnterpriseDetail/tabs/ProductInfoTab';
import TradeInfoTab from './EnterpriseDetail/tabs/TradeInfoTab';
import CrossborderTab from './EnterpriseDetail/tabs/CrossborderTab';
import RequirementsTab from './EnterpriseDetail/tabs/RequirementsTab';
import PolicyTab from './EnterpriseDetail/tabs/PolicyTab';
import CooperationTab from './EnterpriseDetail/tabs/CooperationTab';
import CompetitionTab from './EnterpriseDetail/tabs/CompetitionTab';
import FollowUpTab from './EnterpriseDetail/tabs/FollowUpTab';

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

function logEnterpriseDetail(step: string, payload?: Record<string, unknown>) {
  if (payload) {
    console.info(`[EnterpriseDetail] ${step}`, payload);
    return;
  }
  console.info(`[EnterpriseDetail] ${step}`);
}

const { Title, Text } = Typography;

/** Tabs 文案 + data-tour，供顶栏 Tour 逐标签高亮 */
function enterpriseDetailTabLabel(text: string, tourKey: string) {
  return <span data-tour={`enterprise-detail-tab-${tourKey}`}>{text}</span>;
}

// 阶段顺序映射，用于判断升级/降级
const stageOrder: Record<string, number> = {
  '潜在企业': 1,
  '有明确需求': 2,
  '已对接': 3,
  '已签约': 4,
  '已落地': 5,
};

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

const ENTERPRISE_DETAIL_TAB_KEYS = new Set([
  'basic',
  'product',
  'trade',
  'crossborder',
  'requirements',
  'policy',
  'cooperation',
  'competition',
  'followup',
]);

function EnterpriseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('basic');
  const [dimensionSelections, setDimensionSelections] = useState<Record<string, string[]>>({});
  const [reqConfig, setReqConfig] = useState<RequirementConfigData | null>(null);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isEditEnterpriseOpen, setIsEditEnterpriseOpen] = useState(false);
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
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
  const [serviceRecords, setServiceRecords] = useState<any[]>([]);
  const [hasForeignTrade, setHasForeignTrade] = useState(false);
  const [hasCrossborderEcommerce, setHasCrossborderEcommerce] = useState(false);
  const [isSurveyed, setIsSurveyed] = useState(false);
  const [selectedCrossborderPlatforms, setSelectedCrossborderPlatforms] = useState<string[]>([]);
  const [selectedStage, setSelectedStage] = useState('');
  const [removedRequirements, setRemovedRequirements] = useState<string[]>([]);
  const [addedRequirements, setAddedRequirements] = useState<string[]>([]);
  const [customRequirements, setCustomRequirements] = useState<{id: string; name: string; description: string; phase: string; category: string}[]>([]);
  const [isCustomRequirementModalOpen, setIsCustomRequirementModalOpen] = useState(false);
  const [isRestoreRequirementModalOpen, setIsRestoreRequirementModalOpen] = useState(false);
  const [restoreCategory, setRestoreCategory] = useState<{phase: string; category: string} | null>(null);
  const [isTradeChangeModalOpen, setIsTradeChangeModalOpen] = useState(false);
  const [tradeChangeType, setTradeChangeType] = useState<'market' | 'mode' | 'category'>('market');
  const [tradeChangeDirection, setTradeChangeDirection] = useState<'up' | 'down'>('up');
  const [editingTradeChange, setEditingTradeChange] = useState<{name: string; rate: string} | null>(null);
  /** 变化率输入框右侧固定显示 %，编辑已保存数据时去掉末尾 % 避免显示成「25%%」 */
  const stripTradeRatePercentForInput = (rate: unknown) => {
    if (rate == null || rate === '') return rate;
    const s = String(rate).trim();
    return s.endsWith('%') ? s.slice(0, -1).trim() : s;
  };
  const [isTradePerformanceModalOpen, setIsTradePerformanceModalOpen] = useState(false);
  
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

  /** 支持从 URL ?tab=xxx 打开指定标签（如合作服务档案「查看」→ 合作） */
  const tabFromUrl = searchParams.get('tab');
  useEffect(() => {
    if (tabFromUrl && ENTERPRISE_DETAIL_TAB_KEYS.has(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [id, tabFromUrl]);

  useEffect(() => {
    const onGuideTab = (e: Event) => {
      const ce = e as CustomEvent<{ key?: string }>;
      const k = ce.detail?.key;
      if (k && typeof k === 'string') setActiveTab(k);
    };
    globalThis.addEventListener(ENTERPRISE_GUIDE_TAB_EVENT, onGuideTab);
    return () => globalThis.removeEventListener(ENTERPRISE_GUIDE_TAB_EVENT, onGuideTab);
  }, []);

  const [customRequirementForm] = Form.useForm();
  const [followUpForm] = Form.useForm();
  const [productForm] = Form.useForm();
  const [brandForm] = Form.useForm();
  const [patentForm] = Form.useForm();
  const [tradeForm] = Form.useForm();
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
    const startedAt = performance.now();
    logEnterpriseDetail('start follow-up load', { enterpriseId });
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
      logEnterpriseDetail('follow-up load success', {
        enterpriseId,
        count: list.length,
        durationMs: Math.round(performance.now() - startedAt),
      });
    } catch (e) {
      console.error(e);
      setEnterpriseRecords([]);
      logEnterpriseDetail('follow-up load failed', {
        enterpriseId,
        durationMs: Math.round(performance.now() - startedAt),
      });
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
      const startedAt = performance.now();
      logEnterpriseDetail('start industry tree load');
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
        logEnterpriseDetail('industry tree load success', {
          durationMs: Math.round(performance.now() - startedAt),
          count: response.data?.length || 0,
        });
      } catch (error) {
        console.error('Failed to fetch industries:', error);
        logEnterpriseDetail('industry tree load failed', {
          durationMs: Math.round(performance.now() - startedAt),
        });
      }
    };
    fetchIndustries();
  }, []);

  // 加载选项数据
  useEffect(() => {
    const fetchOptions = async () => {
      const startedAt = performance.now();
      logEnterpriseDetail('start dictionary options load');
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
        logEnterpriseDetail('dictionary options load success', {
          durationMs: Math.round(performance.now() - startedAt),
          staffSizeCount: staffSize.data?.length || 0,
          sourceCount: source.data?.length || 0,
          regionCount: region.data?.length || 0,
        });
      } catch (error) {
        console.error('Failed to fetch options:', error);
        logEnterpriseDetail('dictionary options load failed', {
          durationMs: Math.round(performance.now() - startedAt),
        });
      }
    };
    fetchOptions();
  }, []);

  // 从API获取企业详情
  useEffect(() => {
    const fetchEnterprise = async () => {
      if (!id) return;
      const startedAt = performance.now();
      logEnterpriseDetail('start enterprise detail load', { id: Number(id) });
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
            added_requirements: data.addedRequirements,
            custom_requirements: data.customRequirements,
            products: data.products || [],
            overviewMergedTargetRegionNames: data.overviewMergedTargetRegionNames,
            overviewMergedTargetCountryNames: data.overviewMergedTargetCountryNames,
            patents: data.patents || [],
            created_at: data.createdAt,
            updated_at: data.updatedAt,
          });
          logEnterpriseDetail('enterprise detail load success', {
            id: data.id,
            durationMs: Math.round(performance.now() - startedAt),
            contactCount: data.contacts?.length || 0,
            productCount: data.products?.length || 0,
            patentCount: data.patents?.length || 0,
            stage: data.stage,
          });
        }
      } catch (error: any) {
        console.error('Failed to fetch enterprise:', error);
        logEnterpriseDetail('enterprise detail load failed', {
          id: Number(id),
          durationMs: Math.round(performance.now() - startedAt),
          message: error?.message || 'unknown error',
        });
        message.error('获取企业详情失败');
      } finally {
        setLoading(false);
        logEnterpriseDetail('enterprise detail load finished', {
          id: Number(id),
          durationMs: Math.round(performance.now() - startedAt),
        });
      }
    };
    fetchEnterprise();
  }, [id]);

  useEffect(() => {
    const startedAt = performance.now();
    optionsApi
      .getProductCategories()
      .then((res) => {
        if (res.data) setProductCategoryTree(res.data);
        logEnterpriseDetail('product category load success', {
          durationMs: Math.round(performance.now() - startedAt),
          count: res.data?.length || 0,
        });
      })
      .catch(() => {
        logEnterpriseDetail('product category load failed', {
          durationMs: Math.round(performance.now() - startedAt),
        });
      });
  }, []);

  useEffect(() => {
    if (enterprise?.id) loadEnterpriseFollowUps(enterprise.id);
  }, [enterprise?.id, loadEnterpriseFollowUps]);

  const loadServiceRecords = useCallback(async () => {
    if (!id) return;
    try {
      const res = await serviceRecordApi.getList(Number(id));
      setServiceRecords(res.data || []);
    } catch {
      setServiceRecords([]);
    }
  }, [id]);

  /** 附件等局部更新：用后端 PUT 返回体合并单条，避免列表接口与解析延迟导致界面仍显示无附件 */
  const mergeServiceRecordInState = useCallback((updated: any) => {
    if (!updated?.id) return;
    const rid = updated.id;
    setServiceRecords((prev) => prev.map((r) => (r.id === rid ? { ...r, ...updated } : r)));
  }, []);

  useEffect(() => {
    loadServiceRecords();
  }, [loadServiceRecords]);

  /** 已有合作服务记录则视为已合作，与后端记录一致且不可在界面改回「未合作」 */
  useEffect(() => {
    if (serviceRecords.length > 0) {
      setIsCooperating(true);
    }
  }, [serviceRecords]);

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
    if (enterprise.added_requirements && Array.isArray(enterprise.added_requirements)) {
      setAddedRequirements(enterprise.added_requirements);
    }
    if (enterprise.custom_requirements && Array.isArray(enterprise.custom_requirements)) {
      setCustomRequirements(enterprise.custom_requirements);
    }
  }, [enterprise?.id]);

  // 从数据库加载需求配置（需求列表 + 通用/增强标记 + 维度映射）
  useEffect(() => {
    (async () => {
      const startedAt = performance.now();
      logEnterpriseDetail('start requirement config load');
      try {
        const res = await optionsApi.getRequirementConfig();
        setReqConfig((res as any).data || res);
        logEnterpriseDetail('requirement config load success', {
          durationMs: Math.round(performance.now() - startedAt),
        });
      } catch {
        console.error('加载需求配置失败');
        logEnterpriseDetail('requirement config load failed', {
          durationMs: Math.round(performance.now() - startedAt),
        });
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
          delete (next as any).overviewMergedTargetRegionNames;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'targetCountryIds')) {
          next.target_country_ids = fields.targetCountryIds;
          delete (next as any).overviewMergedTargetCountryNames;
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
        if (Object.prototype.hasOwnProperty.call(fields, 'serviceCooperationRating')) {
          next.service_cooperation_rating = fields.serviceCooperationRating;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'investmentCooperationRating')) {
          next.investment_cooperation_rating = fields.investmentCooperationRating;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'incubationCooperationRating')) {
          next.incubation_cooperation_rating = fields.incubationCooperationRating;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'brandCooperationRating')) {
          next.brand_cooperation_rating = fields.brandCooperationRating;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'trainingCooperationRating')) {
          next.training_cooperation_rating = fields.trainingCooperationRating;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'overallCooperationRating')) {
          next.overall_cooperation_rating = fields.overallCooperationRating;
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
            setEnterprise((prev) =>
              prev
                ? {
                    ...prev,
                    products: detail.data.products || [],
                    overviewMergedTargetRegionNames: detail.data.overviewMergedTargetRegionNames,
                    overviewMergedTargetCountryNames: detail.data.overviewMergedTargetCountryNames,
                  }
                : prev
            );
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
        setEnterprise((prev) =>
          prev
            ? {
                ...prev,
                products: detail.data.products || [],
                overviewMergedTargetRegionNames: detail.data.overviewMergedTargetRegionNames,
                overviewMergedTargetCountryNames: detail.data.overviewMergedTargetCountryNames,
              }
            : prev
        );
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
      setIsEditEnterpriseOpen(true);
    } else if (section === 'contact') {
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
      label: enterpriseDetailTabLabel('基本信息', 'basic'),
      children: <BasicInfoTab enterprise={enterprise} openEditModal={openEditModal} />,
    },
    {
      key: 'product',
      label: enterpriseDetailTabLabel('产品信息', 'product'),
      children: <ProductInfoTab enterprise={enterprise} regionOptions={regionOptions} onEditOverview={() => setIsProductOverviewModalOpen(true)} onAddProduct={handleAddProduct} onEditProduct={handleEditProduct} onDeleteProduct={handleDeleteProduct} onEditBrand={() => setIsBrandModalOpen(true)} onAddPatent={handleAddPatent} onEditPatent={handleEditPatent} onDeletePatent={handleDeletePatent} />,
    },
    {
      key: 'trade',
      label: enterpriseDetailTabLabel('外贸信息', 'trade'),
      children: <TradeInfoTab enterprise={enterprise} hasForeignTrade={hasForeignTrade} setHasForeignTrade={setHasForeignTrade} marketChanges={marketChanges} setMarketChanges={setMarketChanges} modeChanges={modeChanges} setModeChanges={setModeChanges} categoryChanges={categoryChanges} setCategoryChanges={setCategoryChanges} growthReasons={growthReasons} setGrowthReasons={setGrowthReasons} declineReasons={declineReasons} setDeclineReasons={setDeclineReasons} persistTradePerformanceJson={persistTradePerformanceJson} setTradeChangeType={setTradeChangeType} setTradeChangeDirection={setTradeChangeDirection} setEditingTradeChange={setEditingTradeChange} setIsTradeChangeModalOpen={setIsTradeChangeModalOpen} setIsTradeModalOpen={setIsTradeModalOpen} setIsTradePerformanceModalOpen={setIsTradePerformanceModalOpen} setReasonType={setReasonType} setEditingReason={setEditingReason} setIsReasonModalOpen={setIsReasonModalOpen} reasonForm={reasonForm} />,
    },
    {
      key: 'crossborder',
      label: enterpriseDetailTabLabel('线上跨境电商', 'crossborder'),
      children: <CrossborderTab enterprise={enterprise} hasCrossborderEcommerce={hasCrossborderEcommerce} setHasCrossborderEcommerce={setHasCrossborderEcommerce} selectedCrossborderPlatforms={selectedCrossborderPlatforms} targetMarkets={targetMarkets} onEditPlatform={() => setIsCrossborderPlatformModalOpen(true)} onEditBasic={() => setIsCrossborderBasicModalOpen(true)} onEditMarket={() => setIsMarketModalOpen(true)} />,
    },
    {
      key: 'requirements',
      label: enterpriseDetailTabLabel('需求分析', 'requirements'),
      children: <RequirementsTab reqConfig={reqConfig} dimensionSelections={dimensionSelections} setDimensionSelections={setDimensionSelections} removedRequirements={removedRequirements} setRemovedRequirements={setRemovedRequirements} addedRequirements={addedRequirements} setAddedRequirements={setAddedRequirements} customRequirements={customRequirements} setCustomRequirements={setCustomRequirements} isCustomRequirementModalOpen={isCustomRequirementModalOpen} setIsCustomRequirementModalOpen={setIsCustomRequirementModalOpen} customRequirementForm={customRequirementForm} saveEnterpriseFields={saveEnterpriseFields} />,
    },
    {
      key: 'policy',
      label: enterpriseDetailTabLabel('政策支持', 'policy'),
      children: <PolicyTab enterprise={enterprise} onEdit={() => setIsPolicySupportModalOpen(true)} />,
    },
    {
      key: 'cooperation',
      label: enterpriseDetailTabLabel('合作', 'cooperation'),
      children: <CooperationTab enterprise={enterprise} setEnterprise={setEnterprise} isCooperating={isCooperating} setIsCooperating={setIsCooperating} serviceRecords={serviceRecords} reloadServiceRecords={loadServiceRecords} mergeServiceRecordInState={mergeServiceRecordInState} saveEnterpriseFields={saveEnterpriseFields} navigateToServiceRecords={() => navigate(`/service-records?enterpriseId=${id}`)} />,
    },
    {
      key: 'competition',
      label: enterpriseDetailTabLabel('竞争力与风险', 'competition'),
      children: <CompetitionTab enterprise={enterprise} isSurveyed={isSurveyed} setIsSurveyed={setIsSurveyed} competitionPosition={competitionPosition} setCompetitionPosition={setCompetitionPosition} competitionDesc={competitionDesc} setCompetitionDesc={setCompetitionDesc} saveEnterpriseFields={saveEnterpriseFields} onEditRisk={() => setIsRiskModalOpen(true)} />,
    },
    {
      key: 'followup',
      label: enterpriseDetailTabLabel('跟进记录', 'followup'),
      children: <FollowUpTab enterpriseRecords={enterpriseRecords} recordColumns={recordColumns} onAddFollowUp={() => setIsFollowUpModalOpen(true)} />,
    },
  ];

  return (
    <div>
      <div
        data-tour="enterprise-detail-toolbar"
        style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
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
        data-tour="enterprise-detail-header"
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
          background: 'linear-gradient(90deg, #396aff 0%, rgba(57,106,255,0.38) 50%, transparent 100%)',
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
                background: 'linear-gradient(145deg, rgba(57,106,255,0.10) 0%, rgba(57,106,255,0.24) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                fontWeight: 700,
                color: '#396aff',
                border: '2px solid rgba(57,106,255,0.16)',
                boxShadow: '0 8px 24px rgba(57,106,255,0.12)',
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
                  background: '#396aff',
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
                  styles={{ popup: { root: { borderRadius: 8 } } }}
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

      <Card
        data-tour="enterprise-detail-tabs"
        style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
      >
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

      <StageChangeModal
        open={isStageModalOpen}
        selectedStage={selectedStage}
        onStageChange={setSelectedStage}
        onOk={handleStageChange}
        onClose={() => setIsStageModalOpen(false)}
      />

      <FollowUpModal
        open={isFollowUpModalOpen}
        enterpriseId={enterprise.id}
        editingRecord={editingFollowUp}
        onClose={() => { setIsFollowUpModalOpen(false); setEditingFollowUp(null); }}
        onSuccess={async (stageChanged) => {
          if (stageChanged) {
            setEnterprise((prev) =>
              prev
                ? { ...prev, funnel_stage: stageChanged.stage, stage_name: stageChanged.stageName, stage_color: stageChanged.stageColor }
                : prev
            );
          }
          await loadEnterpriseFollowUps(enterprise.id);
        }}
      />

      <EditEnterpriseModal
        open={isEditEnterpriseOpen}
        enterprise={enterprise}
        industryCategories={industryCategories}
        staffSizeOptions={staffSizeOptions}
        sourceOptions={sourceOptions}
        onClose={() => setIsEditEnterpriseOpen(false)}
        onSuccess={(updated) => setEnterprise((prev) => prev ? { ...prev, ...updated } : prev)}
      />

      <EditContactModal
        open={isEditContactOpen}
        enterpriseId={enterprise.id}
        initialContacts={enterprise.contacts || []}
        onClose={() => setIsEditContactOpen(false)}
        onSuccess={(contacts) => setEnterprise((prev) => prev ? { ...prev, contacts } : prev)}
      />

      <ProductModal
        open={isProductModalOpen}
        enterpriseId={enterprise.id}
        editingRecord={editingProduct}
        productCategoryTree={productCategoryTree}
        productCascaderOptions={productCascaderOptions}
        certificationOptions={certificationOptions}
        regionOptions={regionOptions}
        automationLevelOptions={automationLevelOptionsProduct}
        logisticsOptions={logisticsOptionsProduct}
        onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
        onSuccess={(products, regionNames, countryNames) =>
          setEnterprise((prev) =>
            prev
              ? {
                  ...prev,
                  products,
                  overviewMergedTargetRegionNames: regionNames,
                  overviewMergedTargetCountryNames: countryNames,
                }
              : prev
          )
        }
      />

      <BrandModal
        open={isBrandModalOpen}
        enterpriseId={enterprise.id}
        initialHasOwnBrand={!!(enterprise.has_own_brand === true || enterprise.has_own_brand === 1)}
        initialBrandNames={Array.isArray(enterprise.brand_names) ? enterprise.brand_names : (enterprise.brand_names ? String(enterprise.brand_names).split(',').filter(Boolean) : [])}
        onClose={() => setIsBrandModalOpen(false)}
        onSuccess={(hasOwnBrand, brandNames) =>
          setEnterprise((prev) => prev ? { ...prev, has_own_brand: hasOwnBrand, brand_names: brandNames } : prev)
        }
      />

      <PatentModal
        open={isPatentModalOpen}
        enterpriseId={enterprise.id}
        editingRecord={editingPatent}
        onClose={() => { setIsPatentModalOpen(false); setEditingPatent(null); }}
        onSuccess={(patents) => setEnterprise((prev) => prev ? { ...prev, patents } : prev)}
      />

      <ProductOverviewModal
        open={isProductOverviewModalOpen}
        enterpriseId={enterprise.id}
        enterprise={enterprise}
        regionOptions={regionOptions}
        onClose={() => setIsProductOverviewModalOpen(false)}
        onSuccess={(data) => {
          setEnterprise((prev) => {
            if (!prev) return prev;
            const next = { ...prev, ...data };
            next.target_region_ids = data.targetRegionIds;
            next.target_country_ids = data.targetCountryIds;
            next.has_import_export_license = data.hasImportExportLicense === 1;
            delete (next as any).overviewMergedTargetRegionNames;
            delete (next as any).overviewMergedTargetCountryNames;
            return next;
          });
        }}
      />

      <TradeModal
        open={isTradeModalOpen}
        enterpriseId={enterprise.id}
        initialData={{
          tradeModeId: enterprise.trade_mode_id ?? null,
          customsDeclarationMode: enterprise.customs_declaration_mode || '',
          tradeTeamModeId: enterprise.trade_team_mode_id ?? null,
          tradeTeamSize: enterprise.trade_team_size ?? null,
          hasDomesticEcommerce: enterprise.has_domestic_ecommerce === 1,
          hasOverseasDistributors: !!enterprise.has_overseas_distributors,
        }}
        tradeModeOptions={tradeModeOptions}
        tradeTeamModeOptions={tradeTeamModeOptions}
        marketChanges={marketChanges}
        modeChanges={modeChanges}
        categoryChanges={categoryChanges}
        growthReasons={growthReasons}
        declineReasons={declineReasons}
        onClose={() => setIsTradeModalOpen(false)}
        onSuccess={(data) =>
          setEnterprise((prev) => {
            if (!prev) return prev;
            const tradeLabel = tradeModeOptions.find(o => o.value === data.tradeModeId)?.label || prev.trade_mode;
            const teamLabel = tradeTeamModeOptions.find(o => o.value === data.tradeTeamModeId)?.label || prev.trade_team_mode;
            return {
              ...prev,
              trade_mode_id: data.tradeModeId,
              trade_mode: tradeLabel,
              customs_declaration_mode: data.customsDeclarationMode,
              trade_team_mode_id: data.tradeTeamModeId,
              trade_team_mode: teamLabel,
              trade_team_size: data.tradeTeamSize,
              has_domestic_ecommerce: data.hasDomesticEcommerce,
              has_overseas_distributors: data.hasOverseasDistributors === 1,
            };
          })
        }
      />

      <ReasonModal
        open={isReasonModalOpen}
        enterpriseId={enterprise.id}
        reasonType={reasonType}
        editingReason={editingReason}
        growthReasons={growthReasons}
        declineReasons={declineReasons}
        growthReasonSuggest={growthReasonSuggest}
        declineReasonSuggest={declineReasonSuggest}
        onLoadOptions={loadTradeReasonOptions}
        onClose={() => setIsReasonModalOpen(false)}
        onSuccess={(nextGrowth, nextDecline) => {
          setGrowthReasons(nextGrowth);
          setDeclineReasons(nextDecline);
          setEnterprise((prev) =>
            prev ? { ...prev, growth_reasons: nextGrowth, decline_reasons: nextDecline } : prev
          );
        }}
      />

      <TradeChangeModal
        open={isTradeChangeModalOpen}
        enterpriseId={enterprise.id}
        changeType={tradeChangeType}
        changeDirection={tradeChangeDirection}
        editingItem={editingTradeChange}
        marketChanges={marketChanges}
        modeChanges={modeChanges}
        categoryChanges={categoryChanges}
        onClose={() => setIsTradeChangeModalOpen(false)}
        onSuccess={(nextM, nextMo, nextC) => {
          setMarketChanges(nextM);
          setModeChanges(nextMo);
          setCategoryChanges(nextC);
        }}
      />

      <TradePerformanceModal
        open={isTradePerformanceModalOpen}
        enterpriseId={enterprise.id}
        initialData={{
          yearBeforeLastRevenue: enterprise.year_before_last_revenue ?? undefined,
          lastYearRevenue: enterprise.last_year_revenue ?? undefined,
        }}
        onClose={() => setIsTradePerformanceModalOpen(false)}
        onSuccess={(data) => {
          setEnterprise((prev) =>
            prev
              ? {
                  ...prev,
                  last_year_revenue: data.lastYearRevenue,
                  year_before_last_revenue: data.yearBeforeLastRevenue,
                }
              : prev
          );
        }}
      />

      <CrossborderPlatformModal
        open={isCrossborderPlatformModalOpen}
        enterpriseId={enterprise.id}
        selectedPlatforms={selectedCrossborderPlatforms}
        onPlatformsChange={setSelectedCrossborderPlatforms}
        onClose={() => setIsCrossborderPlatformModalOpen(false)}
        onSuccess={(platforms) =>
          setEnterprise((prev) => prev ? { ...prev, cross_border_platforms: platforms } : prev)
        }
      />

      <CrossborderBasicModal
        open={isCrossborderBasicModalOpen}
        enterpriseId={enterprise.id}
        initialData={{
          hasCrossBorder: enterprise.has_cross_border === 1 || enterprise.has_cross_border === true,
          crossBorderRatio: enterprise.cross_border_ratio ?? '',
          crossBorderLogistics: enterprise.cross_border_logistics ?? '',
          paymentSettlement: enterprise.payment_settlement ?? '',
          crossBorderTeamSize: enterprise.cross_border_team_size ?? null,
          usingErp: enterprise.using_erp === 1 || enterprise.using_erp === true,
          transformationWillingness: enterprise.transformation_willingness ?? '',
          investmentWillingness: enterprise.investment_willingness ?? '',
        }}
        onClose={() => setIsCrossborderBasicModalOpen(false)}
        onSuccess={(data) => {
          setEnterprise((prev) =>
            prev
              ? {
                  ...prev,
                  has_cross_border: data.hasCrossBorder ? 1 : 0,
                  cross_border_ratio: data.crossBorderRatio,
                  cross_border_logistics: data.crossBorderLogistics,
                  payment_settlement: data.paymentSettlement,
                  cross_border_team_size: data.crossBorderTeamSize,
                  using_erp: data.usingErp,
                  transformation_willingness: data.transformationWillingness,
                  investment_willingness: data.investmentWillingness,
                }
              : prev
          );
        }}
      />

      <MarketModal
        open={isMarketModalOpen}
        enterpriseId={enterprise.id}
        targetMarkets={targetMarkets}
        onMarketsChange={setTargetMarkets}
        onClose={() => setIsMarketModalOpen(false)}
        onSuccess={(markets) =>
          setEnterprise((prev) => prev ? { ...prev, target_markets: markets } : prev)
        }
      />

      <CrossborderNeedsModal
        open={isCrossborderNeedsModalOpen}
        enterpriseId={enterprise.id}
        tricenterDemands={enterprise.tricenter_demands || []}
        onClose={() => setIsCrossborderNeedsModalOpen(false)}
        onSuccess={(demands) =>
          setEnterprise((prev) => prev ? { ...prev, tricenter_demands: demands } : prev)
        }
      />


      <TriCenterCoopModal
        open={isTriCenterCoopModalOpen}
        enterpriseId={enterprise.id}
        tricenterDemands={enterprise.tricenter_demands || []}
        tricenterConcerns={enterprise.tricenter_concerns || ''}
        onClose={() => setIsTriCenterCoopModalOpen(false)}
        onSuccess={(demands, concerns) =>
          setEnterprise((prev) =>
            prev ? { ...prev, tricenter_demands: demands, tricenter_concerns: concerns } : prev
          )
        }
      />

      <CrossborderPainModal
        open={isCrossborderPainModalOpen}
        enterpriseId={enterprise.id}
        painPoints={enterprise.pain_points || []}
        onClose={() => setIsCrossborderPainModalOpen(false)}
        onSuccess={(painPoints) =>
          setEnterprise((prev) => prev ? { ...prev, pain_points: painPoints } : prev)
        }
      />

      {/* 合作可能性评估编辑模态框 */}
      <EvaluationModal
        open={isEvaluationModalOpen}
        enterpriseId={enterprise.id}
        initialData={{
          serviceCooperationRating: enterprise.service_cooperation_rating,
          investmentCooperationRating: enterprise.investment_cooperation_rating,
          incubationCooperationRating: enterprise.incubation_cooperation_rating,
          brandCooperationRating: enterprise.brand_cooperation_rating,
          trainingCooperationRating: enterprise.training_cooperation_rating,
          overallCooperationRating: enterprise.overall_cooperation_rating,
        }}
        onClose={() => setIsEvaluationModalOpen(false)}
        onSuccess={(data) =>
          setEnterprise((prev) =>
            prev
              ? {
                  ...prev,
                  service_cooperation_rating: data.serviceCooperationRating,
                  investment_cooperation_rating: data.investmentCooperationRating,
                  incubation_cooperation_rating: data.incubationCooperationRating,
                  brand_cooperation_rating: data.brandCooperationRating,
                  training_cooperation_rating: data.trainingCooperationRating,
                  overall_cooperation_rating: data.overallCooperationRating,
                }
              : prev
          )
        }
      />

      <PreliminaryModal
        open={isPreliminaryModalOpen}
        enterpriseId={enterprise.id}
        transformationWillingness={enterprise.transformation_willingness || ''}
        investmentWillingness={enterprise.investment_willingness || ''}
        benchmarkPossibility={enterprise.benchmark_possibility ?? null}
        onClose={() => setIsPreliminaryModalOpen(false)}
        onSuccess={(data) =>
          setEnterprise((prev) =>
            prev
              ? {
                  ...prev,
                  transformation_willingness: data.transformationWillingness,
                  investment_willingness: data.investmentWillingness,
                  benchmark_possibility: data.benchmarkPossibility,
                }
              : prev
          )
        }
      />

      <SupplementModal
        open={isSupplementModalOpen}
        enterpriseId={enterprise.id}
        additionalNotes={enterprise.additional_notes || ''}
        onClose={() => setIsSupplementModalOpen(false)}
        onSuccess={(additionalNotes) =>
          setEnterprise((prev) => prev ? { ...prev, additional_notes: additionalNotes } : prev)
        }
      />

      <PolicySupportModal
        open={isPolicySupportModalOpen}
        enterpriseId={enterprise.id}
        hasPolicySupport={enterprise.has_policy_support === 1 || enterprise.has_policy_support === true}
        enjoyedPolicies={enterprise.enjoyed_policies || []}
        onClose={() => setIsPolicySupportModalOpen(false)}
        onSuccess={(hasPolicySupport, enjoyedPolicies) =>
          setEnterprise((prev) => prev ? { ...prev, has_policy_support: hasPolicySupport, enjoyed_policies: enjoyedPolicies } : prev)
        }
      />

      <CompetitionModal
        open={isCompetitionModalOpen}
        enterpriseId={enterprise.id}
        competitionPosition={enterprise.competition_position || ''}
        competitionDescription={enterprise.competition_description || ''}
        onClose={() => setIsCompetitionModalOpen(false)}
        onSuccess={(position, description) => {
          setEnterprise((prev) =>
            prev ? { ...prev, competition_position: position, competition_description: description } : prev
          );
          setCompetitionPosition(position);
          setCompetitionDesc(description);
        }}
      />

      <RiskModal
        open={isRiskModalOpen}
        enterpriseId={enterprise.id}
        currentRiskTags={Array.isArray(enterprise.current_risk_tags) ? enterprise.current_risk_tags : []}
        riskDescription={enterprise.risk_description || ''}
        onClose={() => setIsRiskModalOpen(false)}
        onSuccess={(riskTags, riskDescription) =>
          setEnterprise((prev) =>
            prev ? { ...prev, current_risk_tags: riskTags, risk_description: riskDescription } : prev
          )
        }
      />
    </div>
  );
}

export default EnterpriseDetail;
