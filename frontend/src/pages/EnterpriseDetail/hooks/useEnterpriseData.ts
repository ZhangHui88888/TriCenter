// @ts-nocheck
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form, message } from 'antd';
import { enterpriseApi, followUpApi, optionsApi, serviceRecordApi } from '@/services/api';
import type { RequirementConfigData } from '@/services/api';
import { ENTERPRISE_DETAIL_TAB_KEYS } from '../constants';
import { mapCategoriesToCascader, logEnterpriseDetail } from '../utils';
import { ENTERPRISE_GUIDE_TAB_EVENT } from '@/components/appGuideConfig';

export function useEnterpriseData(id: string | undefined) {
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
  const [competitionPosition, setCompetitionPosition] = useState('medium');
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
  const [isTradePerformanceModalOpen, setIsTradePerformanceModalOpen] = useState(false);

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

  const [enterprise, setEnterprise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enterpriseRecords, setEnterpriseRecords] = useState<any[]>([]);
  const [categoryTree, setCategoryTree] = useState<any[]>([]);

  const productCascaderOptions = useMemo(
    () => mapCategoriesToCascader(categoryTree),
    [categoryTree]
  );

  const industryCategories = useMemo(() => {
    const convert = (items: any[]): any[] =>
      items.map(item => ({
        value: item.id,
        label: item.name,
        children: item.children?.length ? convert(item.children) : undefined,
      }));
    return convert(categoryTree);
  }, [categoryTree]);

  const productCategoryTree = categoryTree;
  const [staffSizeOptions, setStaffSizeOptions] = useState<any[]>([]);
  const [sourceOptions, setSourceOptions] = useState<any[]>([]);
  const [sourceProviderOptions, setSourceProviderOptions] = useState<any[]>([]);
  const [regionOptions, setRegionOptions] = useState<any[]>([]);
  const [tradeModeOptions, setTradeModeOptions] = useState<any[]>([]);
  const [tradeTeamModeOptions, setTradeTeamModeOptions] = useState<any[]>([]);
  const [certificationOptions, setCertificationOptions] = useState<any[]>([]);
  const [automationLevelOptionsProduct, setAutomationLevelOptionsProduct] = useState<any[]>([]);
  const [logisticsOptionsProduct, setLogisticsOptionsProduct] = useState<any[]>([]);

  // ---------- 数据加载 ----------

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

  // 加载统一分类树（行业+产品品类共用）
  useEffect(() => {
    const fetchCategories = async () => {
      const startedAt = performance.now();
      logEnterpriseDetail('start category tree load');
      try {
        const response = await optionsApi.getCategories();
        if (response.data) {
          setCategoryTree(response.data);
        }
        logEnterpriseDetail('category tree load success', {
          durationMs: Math.round(performance.now() - startedAt),
          count: response.data?.length || 0,
        });
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        logEnterpriseDetail('category tree load failed', {
          durationMs: Math.round(performance.now() - startedAt),
        });
      }
    };
    fetchCategories();
  }, []);

  // 加载选项数据
  useEffect(() => {
    const fetchOptions = async () => {
      const startedAt = performance.now();
      logEnterpriseDetail('start dictionary options load');
      try {
        const [staffSize, source, sourceProvider, region, tradeMode, tradeTeamMode, certification, automationLevel, logistics] =
          await Promise.all([
            optionsApi.getOptions('staff_size'),
            optionsApi.getOptions('source'),
            optionsApi.getOptions('source_provider'),
            optionsApi.getOptions('region'),
            optionsApi.getOptions('trade_mode'),
            optionsApi.getOptions('trade_team_mode'),
            optionsApi.getOptions('certification'),
            optionsApi.getOptions('automation_level'),
            optionsApi.getOptions('logistics'),
          ]);
        if (staffSize.data) setStaffSizeOptions(staffSize.data.map((o: any) => ({ label: o.label, value: o.id })));
        if (source.data) setSourceOptions(source.data.map((o: any) => ({ label: o.label, value: o.id })));
        if (sourceProvider.data) setSourceProviderOptions(sourceProvider.data.map((o: any) => ({ label: o.label, value: o.id })));
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
            source_provider: data.sourceProviderLabel,
            source_provider_id: data.sourceProviderId,
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
            import_export_code: data.importExportCode,
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

  // productCategoryTree 已通过 categoryTree 统一加载，无需单独请求

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

  const mergeServiceRecordInState = useCallback((updated: any) => {
    if (!updated?.id) return;
    const rid = updated.id;
    setServiceRecords((prev) => prev.map((r) => (r.id === rid ? { ...r, ...updated } : r)));
  }, []);

  useEffect(() => {
    loadServiceRecords();
  }, [loadServiceRecords]);

  useEffect(() => {
    if (serviceRecords.length > 0) {
      setIsCooperating(true);
    }
  }, [serviceRecords]);

  // 从API数据初始化本地状态
  useEffect(() => {
    if (!enterprise) return;

    const hasTrade = !!(enterprise.trade_mode_id || enterprise.has_import_export_license ||
      (enterprise.target_region_ids && enterprise.target_region_ids.length > 0) ||
      enterprise.last_year_revenue || enterprise.year_before_last_revenue);
    setHasForeignTrade(hasTrade);

    setHasCrossborderEcommerce(!!enterprise.has_cross_border);

    const hasCoop = !!(enterprise.service_cooperation_rating ||
      (enterprise.tricenter_demands && enterprise.tricenter_demands.length > 0));
    setIsCooperating(hasCoop);

    setIsSurveyed(!!enterprise.competition_position);
    if (enterprise.competition_position) setCompetitionPosition(enterprise.competition_position);
    setCompetitionDesc(enterprise.competition_description || '');

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

    if (enterprise.cross_border_platforms && Array.isArray(enterprise.cross_border_platforms) && enterprise.cross_border_platforms.length > 0) {
      setSelectedCrossborderPlatforms(enterprise.cross_border_platforms.map((p: any) => String(p)));
    } else {
      setSelectedCrossborderPlatforms([]);
    }

    if (enterprise.target_markets && Array.isArray(enterprise.target_markets) && enterprise.target_markets.length > 0) {
      setTargetMarkets(enterprise.target_markets);
    } else {
      setTargetMarkets([]);
    }

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

  // 从数据库加载需求配置
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

  return {
    // 核心数据
    enterprise, setEnterprise, loading, id,
    activeTab, setActiveTab,
    enterpriseRecords, setEnterpriseRecords,
    productCategoryTree, productCascaderOptions,
    reqConfig,
    dimensionSelections, setDimensionSelections,
    // 选项
    industryCategories,
    staffSizeOptions, sourceOptions, sourceProviderOptions, regionOptions,
    tradeModeOptions, tradeTeamModeOptions,
    certificationOptions, automationLevelOptionsProduct, logisticsOptionsProduct,
    // 业务状态
    hasForeignTrade, setHasForeignTrade,
    hasCrossborderEcommerce, setHasCrossborderEcommerce,
    isSurveyed, setIsSurveyed,
    isCooperating, setIsCooperating,
    serviceRecords, loadServiceRecords, mergeServiceRecordInState,
    selectedCrossborderPlatforms, setSelectedCrossborderPlatforms,
    targetMarkets, setTargetMarkets,
    selectedStage, setSelectedStage,
    competitionPosition, setCompetitionPosition,
    competitionDesc, setCompetitionDesc,
    // 外贸业绩变化
    marketChanges, setMarketChanges,
    modeChanges, setModeChanges,
    categoryChanges, setCategoryChanges,
    growthReasons, setGrowthReasons,
    declineReasons, setDeclineReasons,
    growthReasonSuggest, declineReasonSuggest,
    loadTradeReasonOptions,
    // 需求分析
    removedRequirements, setRemovedRequirements,
    addedRequirements, setAddedRequirements,
    customRequirements, setCustomRequirements,
    // 弹窗状态
    isStageModalOpen, setIsStageModalOpen,
    isFollowUpModalOpen, setIsFollowUpModalOpen,
    isEditEnterpriseOpen, setIsEditEnterpriseOpen,
    isEditContactOpen, setIsEditContactOpen,
    isProductModalOpen, setIsProductModalOpen,
    editingProduct, setEditingProduct,
    isBrandModalOpen, setIsBrandModalOpen,
    isPatentModalOpen, setIsPatentModalOpen,
    editingPatent, setEditingPatent,
    isProductOverviewModalOpen, setIsProductOverviewModalOpen,
    isTradeModalOpen, setIsTradeModalOpen,
    isCrossborderPlatformModalOpen, setIsCrossborderPlatformModalOpen,
    isCrossborderBasicModalOpen, setIsCrossborderBasicModalOpen,
    isMarketModalOpen, setIsMarketModalOpen,
    isCrossborderNeedsModalOpen, setIsCrossborderNeedsModalOpen,
    isTriCenterCoopModalOpen, setIsTriCenterCoopModalOpen,
    isCrossborderPainModalOpen, setIsCrossborderPainModalOpen,
    isEvaluationModalOpen, setIsEvaluationModalOpen,
    isPreliminaryModalOpen, setIsPreliminaryModalOpen,
    isSupplementModalOpen, setIsSupplementModalOpen,
    isPolicySupportModalOpen, setIsPolicySupportModalOpen,
    isCompetitionModalOpen, setIsCompetitionModalOpen,
    isRiskModalOpen, setIsRiskModalOpen,
    isTradeChangeModalOpen, setIsTradeChangeModalOpen,
    tradeChangeType, setTradeChangeType,
    tradeChangeDirection, setTradeChangeDirection,
    editingTradeChange, setEditingTradeChange,
    isTradePerformanceModalOpen, setIsTradePerformanceModalOpen,
    isReasonModalOpen, setIsReasonModalOpen,
    reasonType, setReasonType,
    editingReason, setEditingReason,
    isCustomRequirementModalOpen, setIsCustomRequirementModalOpen,
    isRestoreRequirementModalOpen, setIsRestoreRequirementModalOpen,
    restoreCategory, setRestoreCategory,
    editingFollowUp, setEditingFollowUp,
    exporting, setExporting,
    reasonModalSaving, setReasonModalSaving,
    // 表单实例
    marketForm, reasonForm,
    customRequirementForm, followUpForm, productForm, brandForm, patentForm,
    tradeForm, needsForm, coopForm, painForm, evalForm, prelimForm,
    supplementForm, policyForm, competitionForm, riskForm,
    // 回调
    loadEnterpriseFollowUps,
  };
}
