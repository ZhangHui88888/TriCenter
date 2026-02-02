import { useState } from 'react';
import { Form, message, Modal } from 'antd';
import dayjs from 'dayjs';

export function useEnterpriseDetail() {
  // Tab state
  const [activeTab, setActiveTab] = useState('basic');
  
  // Modal states
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isEditEnterpriseOpen, setIsEditEnterpriseOpen] = useState(false);
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isPatentModalOpen, setIsPatentModalOpen] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isCrossborderPlatformModalOpen, setIsCrossborderPlatformModalOpen] = useState(false);
  const [isCrossborderBasicModalOpen, setIsCrossborderBasicModalOpen] = useState(false);
  const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);
  const [isCrossborderNeedsModalOpen, setIsCrossborderNeedsModalOpen] = useState(false);
  const [isTriCenterCoopModalOpen, setIsTriCenterCoopModalOpen] = useState(false);
  const [isCrossborderPainModalOpen, setIsCrossborderPainModalOpen] = useState(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [isPreliminaryModalOpen, setIsPreliminaryModalOpen] = useState(false);
  const [isSupplementModalOpen, setIsSupplementModalOpen] = useState(false);
  const [isPolicySupportModalOpen, setIsPolicySupportModalOpen] = useState(false);
  const [isCompetitionModalOpen, setIsCompetitionModalOpen] = useState(false);
  const [isCompetitorModalOpen, setIsCompetitorModalOpen] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [isCustomRequirementModalOpen, setIsCustomRequirementModalOpen] = useState(false);
  const [isRestoreRequirementModalOpen, setIsRestoreRequirementModalOpen] = useState(false);
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [isTradeChangeModalOpen, setIsTradeChangeModalOpen] = useState(false);

  // Editing states
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingPatent, setEditingPatent] = useState<any>(null);
  const [editingFollowUp, setEditingFollowUp] = useState<any>(null);
  const [editingReason, setEditingReason] = useState<{index: number; value: string} | null>(null);
  const [editingTradeChange, setEditingTradeChange] = useState<{name: string; rate: string} | null>(null);

  // Toggle states
  const [isCooperating, setIsCooperating] = useState(true);
  const [hasForeignTrade, setHasForeignTrade] = useState(true);
  const [hasCrossborderEcommerce, setHasCrossborderEcommerce] = useState(true);
  const [isSurveyed, setIsSurveyed] = useState(false);

  // Selection states
  const [selectedCrossborderPlatforms, setSelectedCrossborderPlatforms] = useState<string[]>(['亚马逊', '阿里国际站']);
  const [selectedStage, setSelectedStage] = useState('');
  const [dimensionSelections, setDimensionSelections] = useState<Record<string, string[]>>({});
  const [removedRequirements, setRemovedRequirements] = useState<string[]>([]);
  const [customRequirements, setCustomRequirements] = useState<{id: string; name: string; description: string; phase: string; category: string}[]>([]);
  const [restoreCategory, setRestoreCategory] = useState<{phase: string; category: string} | null>(null);

  // Trade change states
  const [reasonType, setReasonType] = useState<'growth' | 'decline'>('growth');
  const [tradeChangeType, setTradeChangeType] = useState<'market' | 'mode' | 'category'>('market');
  const [tradeChangeDirection, setTradeChangeDirection] = useState<'up' | 'down'>('up');
  
  // Trade data
  const [marketChanges, setMarketChanges] = useState({
    up: [{ name: '东南亚', rate: '+25%' }, { name: '中东', rate: '+18%' }, { name: '南美', rate: '+12%' }],
    down: [{ name: '欧洲', rate: '-8%' }, { name: '北美', rate: '-5%' }]
  });
  const [modeChanges, setModeChanges] = useState({
    up: [{ name: '跨境电商B2C', rate: '+35%' }, { name: '海外仓直发', rate: '+22%' }],
    down: [{ name: '传统B2B', rate: '-10%' }]
  });
  const [categoryChanges, setCategoryChanges] = useState({
    up: [{ name: '园艺工具', rate: '+28%' }, { name: '户外家具', rate: '+20%' }, { name: '智能灌溉', rate: '+45%' }],
    down: [{ name: '传统手工具', rate: '-15%' }, { name: '塑料花盆', rate: '-8%' }]
  });
  const [growthReasons, setGrowthReasons] = useState(['东南亚市场需求旺盛', '跨境电商渠道拓展成功', '新产品线上市表现良好']);
  const [declineReasons, setDeclineReasons] = useState(['欧美市场竞争加剧', '传统B2B订单减少', '部分品类价格下降']);

  // Forms
  const [customRequirementForm] = Form.useForm();
  const [followUpForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [productForm] = Form.useForm();
  const [brandForm] = Form.useForm();
  const [patentForm] = Form.useForm();
  const [reasonForm] = Form.useForm();
  const [tradeChangeForm] = Form.useForm();

  return {
    // Tab
    activeTab, setActiveTab,
    // Modals
    isStageModalOpen, setIsStageModalOpen,
    isFollowUpModalOpen, setIsFollowUpModalOpen,
    isEditEnterpriseOpen, setIsEditEnterpriseOpen,
    isEditContactOpen, setIsEditContactOpen,
    isProductModalOpen, setIsProductModalOpen,
    isBrandModalOpen, setIsBrandModalOpen,
    isPatentModalOpen, setIsPatentModalOpen,
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
    isCompetitorModalOpen, setIsCompetitorModalOpen,
    isRiskModalOpen, setIsRiskModalOpen,
    isCustomRequirementModalOpen, setIsCustomRequirementModalOpen,
    isRestoreRequirementModalOpen, setIsRestoreRequirementModalOpen,
    isReasonModalOpen, setIsReasonModalOpen,
    isTradeChangeModalOpen, setIsTradeChangeModalOpen,
    // Editing
    editingProduct, setEditingProduct,
    editingPatent, setEditingPatent,
    editingFollowUp, setEditingFollowUp,
    editingReason, setEditingReason,
    editingTradeChange, setEditingTradeChange,
    // Toggles
    isCooperating, setIsCooperating,
    hasForeignTrade, setHasForeignTrade,
    hasCrossborderEcommerce, setHasCrossborderEcommerce,
    isSurveyed, setIsSurveyed,
    // Selections
    selectedCrossborderPlatforms, setSelectedCrossborderPlatforms,
    selectedStage, setSelectedStage,
    dimensionSelections, setDimensionSelections,
    removedRequirements, setRemovedRequirements,
    customRequirements, setCustomRequirements,
    restoreCategory, setRestoreCategory,
    // Trade
    reasonType, setReasonType,
    tradeChangeType, setTradeChangeType,
    tradeChangeDirection, setTradeChangeDirection,
    marketChanges, setMarketChanges,
    modeChanges, setModeChanges,
    categoryChanges, setCategoryChanges,
    growthReasons, setGrowthReasons,
    declineReasons, setDeclineReasons,
    // Forms
    customRequirementForm,
    followUpForm,
    editForm,
    productForm,
    brandForm,
    patentForm,
    reasonForm,
    tradeChangeForm,
  };
}

export function useEnterpriseHandlers(state: ReturnType<typeof useEnterpriseDetail>, enterprise: any) {
  const {
    setIsStageModalOpen,
    setIsFollowUpModalOpen,
    setIsEditEnterpriseOpen,
    setIsEditContactOpen,
    setIsProductModalOpen,
    setEditingProduct,
    setEditingPatent,
    setIsPatentModalOpen,
    setEditingFollowUp,
    followUpForm,
    editForm,
    productForm,
    patentForm,
    brandForm,
    setIsBrandModalOpen,
  } = state;

  const handleStageChange = () => {
    message.success('阶段变更成功');
    setIsStageModalOpen(false);
  };

  const handleAddFollowUp = () => {
    followUpForm.validateFields().then(() => {
      if (state.editingFollowUp) {
        message.success('跟进记录更新成功');
      } else {
        message.success('跟进记录添加成功');
      }
      setIsFollowUpModalOpen(false);
      setEditingFollowUp(null);
      followUpForm.resetFields();
    });
  };

  const handleEditFollowUp = (record: any) => {
    setEditingFollowUp(record);
    followUpForm.setFieldsValue({
      ...record,
      follow_up_date: record.follow_up_date ? dayjs(record.follow_up_date) : null,
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
      onOk: () => {
        message.success('跟进记录删除成功');
      },
    });
  };

  const handleEditEnterprise = () => {
    editForm.validateFields().then(() => {
      message.success('企业信息更新成功');
      setIsEditEnterpriseOpen(false);
      editForm.resetFields();
    });
  };

  const handleEditContact = () => {
    editForm.validateFields().then(() => {
      message.success('联系人信息更新成功');
      setIsEditContactOpen(false);
      editForm.resetFields();
    });
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    productForm.resetFields();
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    productForm.setFieldsValue(product);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (productName: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除产品「${productName}」吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        message.success('产品已删除');
      },
    });
  };

  const handleSaveProduct = () => {
    productForm.validateFields().then(() => {
      message.success(state.editingProduct ? '产品信息更新成功' : '产品添加成功');
      setIsProductModalOpen(false);
      productForm.resetFields();
      setEditingProduct(null);
    });
  };

  const handleSaveBrand = () => {
    brandForm.validateFields().then(() => {
      message.success('品牌信息更新成功');
      setIsBrandModalOpen(false);
      brandForm.resetFields();
    });
  };

  const handleAddPatent = () => {
    setEditingPatent(null);
    patentForm.resetFields();
    setIsPatentModalOpen(true);
  };

  const handleEditPatent = (patent: any) => {
    setEditingPatent(patent);
    patentForm.setFieldsValue(patent);
    setIsPatentModalOpen(true);
  };

  const handleDeletePatent = (patentName: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除专利「${patentName}」吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        message.success('专利已删除');
      },
    });
  };

  const handleSavePatent = () => {
    patentForm.validateFields().then(() => {
      message.success(state.editingPatent ? '专利信息更新成功' : '专利添加成功');
      setIsPatentModalOpen(false);
      patentForm.resetFields();
      setEditingPatent(null);
    });
  };

  const openEditModal = (section: 'enterprise' | 'contact') => {
    if (section === 'enterprise') {
      editForm.setFieldsValue({
        enterprise_name: enterprise.enterprise_name,
        province: enterprise.province,
        city: enterprise.city,
        district: enterprise.district,
        industry: enterprise.industry,
        enterprise_type: enterprise.enterprise_type,
        employee_scale: enterprise.employee_scale,
        detailed_address: enterprise.detailed_address,
        domestic_revenue: enterprise.domestic_revenue,
        crossborder_revenue: enterprise.crossborder_revenue,
        source: enterprise.source,
        website: enterprise.website,
      });
      setIsEditEnterpriseOpen(true);
    } else if (section === 'contact') {
      setIsEditContactOpen(true);
    }
  };

  return {
    handleStageChange,
    handleAddFollowUp,
    handleEditFollowUp,
    handleDeleteFollowUp,
    handleEditEnterprise,
    handleEditContact,
    handleAddProduct,
    handleEditProduct,
    handleDeleteProduct,
    handleSaveProduct,
    handleSaveBrand,
    handleAddPatent,
    handleEditPatent,
    handleDeletePatent,
    handleSavePatent,
    openEditModal,
  };
}
