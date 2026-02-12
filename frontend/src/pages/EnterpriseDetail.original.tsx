import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '@ant-design/icons';
import { Rate, Switch, Slider } from 'antd';
import { Form, Input, DatePicker } from 'antd';
import { FOLLOW_UP_TYPES } from '@/utils/constants';
import { dimensions, calculateRequirements, groupRequirementsByPhase, dimensionRequirementMapping, type RequirementItem } from '@/data/requirementsData';
import { enterpriseApi, optionsApi } from '@/services/api';

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

const { Title, Text } = Typography;

// 阶段顺序映射，用于判断升级/降级
const stageOrder: Record<string, number> = {
  '潜在企业': 1,
  '有明确需求': 2,
  '已对接': 3,
  '已签约': 4,
  '已落地': 5,
};

function EnterpriseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [dimensionSelections, setDimensionSelections] = useState<Record<string, string[]>>({});
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isEditEnterpriseOpen, setIsEditEnterpriseOpen] = useState(false);
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isPatentModalOpen, setIsPatentModalOpen] = useState(false);
  const [editingPatent, setEditingPatent] = useState<any>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isCrossborderPlatformModalOpen, setIsCrossborderPlatformModalOpen] = useState(false);
  const [isCrossborderBasicModalOpen, setIsCrossborderBasicModalOpen] = useState(false);
  const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);
  // 目标市场数据状态
  const [targetMarkets, setTargetMarkets] = useState<{market: string; percentage: number}[]>([
    { market: '北美', percentage: 40 },
    { market: '欧洲', percentage: 30 },
    { market: '东南亚', percentage: 20 },
    { market: '大洋洲', percentage: 10 },
  ]);
  const [marketForm] = Form.useForm();
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
  const [competitionPosition, setCompetitionPosition] = useState('medium'); // 行业竞争地位: leader/medium/startup
  const [competitionDesc, setCompetitionDesc] = useState('在常州园艺制品行业处于中等偏上水平，具有一定的市场份额和品牌知名度');
  const [editingFollowUp, setEditingFollowUp] = useState<any>(null);
  const [isCooperating, setIsCooperating] = useState(true);
  const [hasForeignTrade, setHasForeignTrade] = useState(true);
  const [hasCrossborderEcommerce, setHasCrossborderEcommerce] = useState(true);
  const [isSurveyed, setIsSurveyed] = useState(false);
  const [selectedCrossborderPlatforms, setSelectedCrossborderPlatforms] = useState<string[]>(['亚马逊 (Amazon)', '阿里国际站 (Alibaba.com)']);
  const [selectedStage, setSelectedStage] = useState('');
  const [removedRequirements, setRemovedRequirements] = useState<string[]>([]);
  const [customRequirements, setCustomRequirements] = useState<{id: string; name: string; description: string; phase: string; category: string}[]>([]);
  const [isCustomRequirementModalOpen, setIsCustomRequirementModalOpen] = useState(false);
  const [isRestoreRequirementModalOpen, setIsRestoreRequirementModalOpen] = useState(false);
  const [restoreCategory, setRestoreCategory] = useState<{phase: string; category: string} | null>(null);
  const [isTradeChangeModalOpen, setIsTradeChangeModalOpen] = useState(false);
  const [tradeChangeType, setTradeChangeType] = useState<'market' | 'mode' | 'category'>('market');
  const [tradeChangeDirection, setTradeChangeDirection] = useState<'up' | 'down'>('up');
  const [editingTradeChange, setEditingTradeChange] = useState<{name: string; rate: string} | null>(null);
  const [tradeChangeForm] = Form.useForm();
  const [isTradePerformanceModalOpen, setIsTradePerformanceModalOpen] = useState(false);
  const [tradePerformanceForm] = Form.useForm();
  
  // 外贸业绩变化数据 - type: region(区域) / country(国家)
  const [marketChanges, setMarketChanges] = useState({
    up: [{ type: 'region', name: '东南亚', rate: '+25%' }, { type: 'region', name: '中东', rate: '+18%' }, { type: 'region', name: '南美', rate: '+12%' }],
    down: [{ type: 'region', name: '欧洲', rate: '-8%' }, { type: 'region', name: '北美', rate: '-5%' }]
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
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [reasonType, setReasonType] = useState<'growth' | 'decline'>('growth');
  const [editingReason, setEditingReason] = useState<{index: number; value: string} | null>(null);
  const [reasonForm] = Form.useForm();

  const [customRequirementForm] = Form.useForm();
  const [followUpForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [productForm] = Form.useForm();
  const [brandForm] = Form.useForm();
  const [patentForm] = Form.useForm();

  // 企业数据状态
  const [enterprise, setEnterprise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enterpriseRecords, setEnterpriseRecords] = useState<any[]>([]);
  const [industryCategories, setIndustryCategories] = useState<any[]>([]);
  
  // 选项数据状态
  const [staffSizeOptions, setStaffSizeOptions] = useState<any[]>([]);
  const [domesticRevenueOptions, setDomesticRevenueOptions] = useState<any[]>([]);
  const [crossBorderRevenueOptions, setCrossBorderRevenueOptions] = useState<any[]>([]);
  const [sourceOptions, setSourceOptions] = useState<any[]>([]);

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
        const [staffSize, domesticRevenue, crossBorderRevenue, source] = await Promise.all([
          optionsApi.getOptions('staff_size'),
          optionsApi.getOptions('domestic_revenue'),
          optionsApi.getOptions('cross_border_revenue'),
          optionsApi.getOptions('source'),
        ]);
        if (staffSize.data) setStaffSizeOptions(staffSize.data.map((o: any) => ({ label: o.label, value: o.id })));
        if (domesticRevenue.data) setDomesticRevenueOptions(domesticRevenue.data.map((o: any) => ({ label: o.label, value: o.id })));
        if (crossBorderRevenue.data) setCrossBorderRevenueOptions(crossBorderRevenue.data.map((o: any) => ({ label: o.label, value: o.id })));
        if (source.data) setSourceOptions(source.data.map((o: any) => ({ label: o.label, value: o.id })));
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
            crossborder_revenue: data.crossBorderRevenueLabel,
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
            customs_declaration_mode: data.customsDeclarationMode,
            trade_team_mode_id: data.tradeTeamModeId,
            trade_team_mode: data.tradeTeamModeLabel,
            trade_team_size: data.tradeTeamSize,
            has_domestic_ecommerce: data.hasDomesticEcommerce,
            last_year_revenue: data.lastYearRevenue,
            year_before_last_revenue: data.yearBeforeLastRevenue,
            has_cross_border: data.hasCrossBorder,
            cross_border_ratio: data.crossBorderRatio,
            cross_border_logistics: data.crossBorderLogistics,
            payment_settlement: data.paymentSettlement,
            cross_border_team_size: data.crossBorderTeamSize,
            using_erp: data.usingErp,
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
            has_policy_support: data.hasPolicySupport,
            enjoyed_policies: data.enjoyedPolicies,
            competition_position: data.competitionPosition,
            competition_description: data.competitionDescription,
            pain_points: data.painPoints,
            tricenter_demands: data.tricenterDemands,
            tricenter_concerns: data.tricenterConcerns,
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

  const handleStageChange = () => {
    message.success('阶段变更成功');
    setIsStageModalOpen(false);
  };

  const handleAddFollowUp = () => {
    followUpForm.validateFields().then(() => {
      if (editingFollowUp) {
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

  const handleEditEnterprise = async () => {
    try {
      const values = await editForm.validateFields();
      // 处理行业ID（Cascader返回数组，取最后一个值）
      const industryId = Array.isArray(values.industry_id) 
        ? values.industry_id[values.industry_id.length - 1] 
        : values.industry_id;
      // 构建更新数据
      const updateData = {
        name: values.enterprise_name,
        creditCode: values.unified_credit_code,
        province: values.province,
        city: values.city,
        district: values.district,
        address: values.detailed_address,
        industryId: industryId,
        enterpriseType: values.enterprise_type,
        staffSizeId: values.staff_size_id,
        website: values.website,
        domesticRevenueId: values.domestic_revenue_id,
        crossBorderRevenueId: values.crossborder_revenue_id,
        sourceId: values.source_id,
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
          crossborder_revenue: data.crossBorderRevenueLabel,
          crossborder_revenue_id: data.crossBorderRevenueId,
          source: data.sourceLabel,
          source_id: data.sourceId,
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
    try {
      const values = await editForm.validateFields();
      // 构建联系人数据
      const contacts = [{
        name: values.contact_name,
        phone: values.contact_phone,
        position: values.contact_position,
        isPrimary: true,
      }];
      // 调用API更新联系人
      await enterpriseApi.update(enterprise.id, { contacts });
      // 更新本地状态
      setEnterprise({
        ...enterprise,
        contacts: contacts,
      });
      message.success('联系人信息更新成功');
      setIsEditContactOpen(false);
      editForm.resetFields();
    } catch (error: any) {
      if (error.errorFields) return;
      message.error(error.message || '更新失败');
    }
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
      message.success(editingProduct ? '产品信息更新成功' : '产品添加成功');
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
      message.success(editingPatent ? '专利信息更新成功' : '专利添加成功');
      setIsPatentModalOpen(false);
      patentForm.resetFields();
      setEditingPatent(null);
    });
  };

  const openEditModal = (section: 'enterprise' | 'contact') => {
    if (section === 'enterprise') {
      editForm.setFieldsValue({
        enterprise_name: enterprise.enterprise_name,
        unified_credit_code: enterprise.unified_credit_code,
        province: enterprise.province,
        city: enterprise.city,
        district: enterprise.district,
        industry_id: enterprise.industry_id ? [enterprise.industry_id] : undefined,
        enterprise_type: enterprise.enterprise_type,
        staff_size_id: enterprise.staff_size_id,
        detailed_address: enterprise.detailed_address,
        domestic_revenue_id: enterprise.domestic_revenue_id,
        crossborder_revenue_id: enterprise.crossborder_revenue_id,
        source_id: enterprise.source_id,
        website: enterprise.website,
      });
      setIsEditEnterpriseOpen(true);
    } else if (section === 'contact') {
      // 设置联系人表单值
      const primaryContact = enterprise.contacts?.find((c: any) => c.isPrimary) || enterprise.contacts?.[0];
      if (primaryContact) {
        editForm.setFieldsValue({
          contact_name: primaryContact.name,
          contact_phone: primaryContact.phone,
          contact_position: primaryContact.position,
        });
      }
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
            <Descriptions column={2} labelStyle={{ color: '#888', fontWeight: 500 }} contentStyle={{ color: '#333' }}>
              <Descriptions.Item label="企业名称">
                <span style={{ fontWeight: 500 }}>{enterprise.enterprise_name}</span>
              </Descriptions.Item>
              <Descriptions.Item label="统一社会信用代码">
                <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{enterprise.unified_credit_code || '-'}</span>
              </Descriptions.Item>
              <Descriptions.Item label="所属区域">{enterprise.district}</Descriptions.Item>
              <Descriptions.Item label="所属行业">
                <span style={{ 
                  padding: '2px 8px', 
                  background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
                  borderRadius: 4,
                  color: '#667eea',
                  fontWeight: 500,
                  fontSize: 12
                }}>{enterprise.industry}</span>
              </Descriptions.Item>
              <Descriptions.Item label="企业类型">{enterprise.enterprise_type}</Descriptions.Item>
              <Descriptions.Item label="人员规模">{enterprise.employee_scale || '-'}</Descriptions.Item>
              <Descriptions.Item label="省/市/区">
                {[enterprise.province, enterprise.city, enterprise.district].filter(Boolean).join(' / ') || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="详细地址">
                <Space>
                  <EnvironmentOutlined style={{ color: '#667eea' }} />
                  {enterprise.detailed_address || '-'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="国内营收(万元)">
                <span style={{ fontWeight: 600, color: '#667eea' }}>{enterprise.domestic_revenue || '-'}</span>
              </Descriptions.Item>
              <Descriptions.Item label="跨境营收(万元)">
                <span style={{ fontWeight: 600, color: '#43e97b' }}>{enterprise.crossborder_revenue || '-'}</span>
              </Descriptions.Item>
              <Descriptions.Item label="企业来源">{enterprise.source || '-'}</Descriptions.Item>
              <Descriptions.Item label="官网">
                {enterprise.website ? (
                  <a href={enterprise.website} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
                    <GlobalOutlined style={{ marginRight: 4 }} /> {enterprise.website}
                  </a>
                ) : '-'}
              </Descriptions.Item>
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
          {/* 产品列表区域 */}
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
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  fontWeight: 500
                }}
              >
                添加产品
              </Button>
            }
          >
          {/* 产品卡片列表 */}
          {enterprise.products && enterprise.products.length > 0 ? (
            enterprise.products.map((product: any) => (
              <div key={product.id} style={{ 
                marginBottom: 16, 
                borderRadius: 8, 
                borderLeft: '4px solid #667eea',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                background: '#fff',
                padding: 16
              }}>
              <Card 
                size="small" 
                style={{ border: 'none', boxShadow: 'none', background: 'transparent' }} 
                extra={
                  <Space size={4}>
                    <Button type="link" size="small" icon={<EditOutlined />} style={{ fontWeight: 500 }}
                      onClick={() => handleEditProduct(product)}>编辑</Button>
                    <Button type="link" size="small" danger icon={<DeleteOutlined />} style={{ fontWeight: 500 }}
                      onClick={() => handleDeleteProduct(product.name)}>删除</Button>
                  </Space>
                }
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f5f5f5' }}>
                  <div>
                    <Text strong style={{ fontSize: 16, fontWeight: 600 }}>{product.name}</Text>
                    {product.categoryName && <div style={{ color: '#888', fontSize: 13, marginTop: 6 }}>产品品类：{product.categoryName}</div>}
                  </div>
                  <Space size={8}>
                    {product.certificationNames?.map((cert: string, idx: number) => (
                      <span key={idx} style={{ padding: '4px 12px', background: idx % 2 === 0 ? 'linear-gradient(135deg, rgba(67,233,123,0.15) 0%, rgba(56,249,215,0.1) 100%)' : 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.1) 100%)', borderRadius: 6, color: idx % 2 === 0 ? '#389e0d' : '#667eea', fontSize: 12, fontWeight: 500 }}>{cert}</span>
                    ))}
                  </Space>
                </div>
                <Row gutter={24} style={{ marginBottom: 20 }}>
                  <Col span={8}>
                    <div style={{ padding: '14px 16px', background: '#fafbfc', borderRadius: 10 }}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>主要销售区域</Text>
                      <div style={{ fontWeight: 600, color: '#333' }}>{product.targetRegionNames?.join('、') || '-'}</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ padding: '14px 16px', background: '#fafbfc', borderRadius: 10 }}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>主要销售国家</Text>
                      <div style={{ fontWeight: 600, color: '#333' }}>{product.targetCountryIds?.join('、') || '-'}</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.05) 100%)', borderRadius: 10 }}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>年销售额</Text>
                      <div style={{ fontWeight: 700, color: '#667eea', fontSize: 16 }}>{product.annualSales || '-'}</div>
                    </div>
                  </Col>
                </Row>
                <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                  <Text strong style={{ fontSize: 14, marginBottom: 14, display: 'block', color: '#333' }}>供应链与产能</Text>
                  <Row gutter={24}>
                    <Col span={6}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>原材料本地采购</Text>
                      <div style={{ fontWeight: 600, color: '#43e97b', fontSize: 15 }}>{product.localProcurementRatio || '-'}</div>
                    </Col>
                    <Col span={6}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>设备自动化程度</Text>
                      <div style={{ fontWeight: 600, color: '#333' }}>{product.automationLevelName || '-'}</div>
                    </Col>
                    <Col span={6}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>年产能</Text>
                      <div style={{ fontWeight: 600, color: '#333' }}>{product.annualCapacity || '-'}</div>
                    </Col>
                    <Col span={6}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>物流合作方</Text>
                      <Space size={6} wrap>
                        {product.logisticsPartnerNames?.map((p: string, i: number) => (
                          <span key={i} style={{ padding: '2px 8px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 12 }}>{p}</span>
                        )) || '-'}
                      </Space>
                    </Col>
                  </Row>
                </div>
              </Card>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>暂无产品信息，点击"添加产品"按钮添加</div>
          )}
          </Card>

          {/* 自主品牌 */}
          <Card
            size="small"
            title={<span style={{ fontWeight: 600, fontSize: 15, color: '#43e97b' }}>自主品牌</span>}
            style={{ marginBottom: 16, borderRadius: 8, border: 'none', borderLeft: '3px solid #43e97b', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            headStyle={{ borderBottom: '1px solid #f0f0f0' }}
            extra={
              <Button type="link" size="small" icon={<EditOutlined />} style={{ fontWeight: 500 }}
                onClick={() => {
                  brandForm.setFieldsValue({ has_brand: enterprise.has_own_brand, brand_names: enterprise.brand_names || [] });
                  setIsBrandModalOpen(true);
                }}>编辑</Button>
            }
          >
            <Row gutter={24}>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>是否有自主品牌</Text>
                <span style={{ padding: '4px 12px', background: enterprise.has_own_brand ? 'linear-gradient(135deg, rgba(67,233,123,0.15) 0%, rgba(56,249,215,0.1) 100%)' : 'rgba(0,0,0,0.04)', borderRadius: 6, color: enterprise.has_own_brand ? '#389e0d' : '#999', fontSize: 12, fontWeight: 600 }}>{enterprise.has_own_brand ? '是' : '否'}</span>
              </Col>
              <Col span={16}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>品牌名称</Text>
                {enterprise.brand_names && enterprise.brand_names.length > 0 ? (
                  <Space size={8} wrap>
                    {enterprise.brand_names.map((brand: string, idx: number) => (
                      <span key={idx} style={{ padding: '5px 14px', background: idx % 2 === 0 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', borderRadius: 20, color: '#fff', fontSize: 13, fontWeight: 500 }}>{brand}</span>
                    ))}
                  </Space>
                ) : <span style={{ color: '#999' }}>-</span>}
              </Col>
            </Row>
          </Card>

          {/* 核心技术/专利 */}
          <Card
            size="small"
            title={<span style={{ fontWeight: 600, fontSize: 15, color: '#f97316' }}>核心技术/专利</span>}
            style={{ borderRadius: 8, border: 'none', borderLeft: '3px solid #f97316', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            headStyle={{ borderBottom: '1px solid #f0f0f0' }}
            extra={
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAddPatent}
                style={{ borderRadius: 6, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', fontWeight: 500 }}>添加专利</Button>
            }
          >
            {enterprise.patents && enterprise.patents.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }} size={12}>
                {enterprise.patents.map((patent: any, idx: number) => (
                  <div key={patent.id} style={{ padding: '16px 20px', background: idx % 2 === 0 ? 'linear-gradient(135deg, rgba(67,233,123,0.1) 0%, rgba(56,249,215,0.05) 100%)' : 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.05) 100%)', borderRadius: 10, border: idx % 2 === 0 ? '1px solid rgba(67,233,123,0.2)' : '1px solid rgba(102,126,234,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: idx % 2 === 0 ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SafetyCertificateOutlined style={{ color: '#fff', fontSize: 20 }} />
                      </div>
                      <div>
                        <Text strong style={{ fontSize: 14, display: 'block' }}>{patent.name}</Text>
                        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                          专利号：<span style={{ fontFamily: 'monospace' }}>{patent.patentNo || '-'}</span>
                        </div>
                      </div>
                    </div>
                    <Space size={4}>
                      <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEditPatent(patent)} />
                      <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeletePatent(patent.name)} />
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
              background: hasForeignTrade ? 'linear-gradient(135deg, rgba(67,233,123,0.05) 0%, rgba(56,249,215,0.02) 100%)' : '#fff',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: hasForeignTrade ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' : '#d9d9d9',
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
                style={{ 
                  background: hasForeignTrade ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' : undefined
                }}
              />
            </div>
          </Card>

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
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>主要销售区域</Text>
                    <div style={{ fontWeight: 600, color: '#333' }}>欧洲、东南亚</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>主要销售国家</Text>
                    <div style={{ fontWeight: 600, color: '#333' }}>美国、德国</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>外贸模式</Text>
                    <span style={{ padding: '4px 12px', background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.08) 100%)', borderRadius: 6, color: '#667eea', fontWeight: 600, fontSize: 13 }}>0110</span>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ padding: '16px', background: 'linear-gradient(135deg, rgba(67,233,123,0.08) 0%, rgba(56,249,215,0.05) 100%)', borderRadius: 10 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>是否有进出口资质</Text>
                    <span style={{ padding: '4px 12px', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', borderRadius: 20, color: '#fff', fontWeight: 500, fontSize: 12 }}>是</span>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>报关申报主体模式</Text>
                    <div style={{ fontWeight: 600, color: '#333' }}>自营</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>外贸业务团队模式</Text>
                    <div style={{ fontWeight: 600, color: '#333' }}>自建</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>外贸团队人数</Text>
                    <div style={{ fontWeight: 700, color: '#667eea', fontSize: 18 }}>8<span style={{ fontSize: 13, fontWeight: 500, color: '#888' }}> 人</span></div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ padding: '16px', background: 'linear-gradient(135deg, rgba(67,233,123,0.08) 0%, rgba(56,249,215,0.05) 100%)', borderRadius: 10 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>是否有国内电商经验</Text>
                    <span style={{ padding: '4px 12px', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', borderRadius: 20, color: '#fff', fontWeight: 500, fontSize: 12 }}>是</span>
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
              extra={<Button type="link" icon={<EditOutlined />} style={{ fontWeight: 500 }} onClick={() => setIsTradePerformanceModalOpen(true)}>编辑</Button>}
            >
              {/* 核心指标 - 年份动态计算 */}
              {(() => {
                const currentYear = new Date().getFullYear();
                const lastYear = currentYear - 1;
                const yearBeforeLast = currentYear - 2;
                const lastYearRevenue = enterprise.last_year_revenue || 1500;
                const yearBeforeLastRevenue = enterprise.year_before_last_revenue || 1280;
                const growthRate = yearBeforeLastRevenue > 0 
                  ? ((lastYearRevenue - yearBeforeLastRevenue) / yearBeforeLastRevenue * 100).toFixed(1)
                  : 0;
                const isPositive = Number(growthRate) >= 0;
                
                return (
                  <Row gutter={16} style={{ marginBottom: 20 }}>
                    <Col span={8}>
                      <div style={{ 
                        padding: '20px', 
                        background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.05) 100%)', 
                        borderRadius: 12,
                        textAlign: 'center'
                      }}>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>{yearBeforeLast}年外贸营业额</Text>
                        <div style={{ fontWeight: 700, color: '#667eea', fontSize: 28 }}>{yearBeforeLastRevenue}<span style={{ fontSize: 14, fontWeight: 500, color: '#888' }}> 万元</span></div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ 
                        padding: '20px', 
                        background: 'linear-gradient(135deg, rgba(250,173,20,0.1) 0%, rgba(255,193,7,0.05) 100%)', 
                        borderRadius: 12,
                        textAlign: 'center'
                      }}>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>{lastYear}年外贸营业额</Text>
                        <div style={{ fontWeight: 700, color: '#faad14', fontSize: 28 }}>{lastYearRevenue}<span style={{ fontSize: 14, fontWeight: 500, color: '#888' }}> 万元</span></div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ 
                        padding: '20px', 
                        background: `linear-gradient(135deg, ${isPositive ? 'rgba(67,233,123,0.1)' : 'rgba(239,68,68,0.1)'} 0%, ${isPositive ? 'rgba(56,249,215,0.05)' : 'rgba(239,68,68,0.05)'} 100%)`, 
                        borderRadius: 12,
                        textAlign: 'center'
                      }}>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>同比增长率</Text>
                        <div style={{ fontWeight: 700, color: isPositive ? '#43e97b' : '#ef4444', fontSize: 28 }}>{isPositive ? '+' : ''}{growthRate}<span style={{ fontSize: 14, fontWeight: 500 }}>%</span></div>
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
                      background: 'linear-gradient(135deg, rgba(67,233,123,0.08) 0%, rgba(56,249,215,0.03) 100%)', 
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
                            <span style={{ cursor: 'pointer' }} onClick={() => { setTradeChangeType('market'); setTradeChangeDirection('up'); setEditingTradeChange(item); tradeChangeForm.setFieldsValue(item); setIsTradeChangeModalOpen(true); }}>
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
                      background: 'linear-gradient(135deg, rgba(255,77,79,0.08) 0%, rgba(255,77,79,0.03) 100%)', 
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
                            onClose={() => setMarketChanges(prev => ({ ...prev, down: prev.down.filter((_, i) => i !== idx) }))}>
                            <span style={{ cursor: 'pointer' }} onClick={() => { setTradeChangeType('market'); setTradeChangeDirection('down'); setEditingTradeChange(item); tradeChangeForm.setFieldsValue(item); setIsTradeChangeModalOpen(true); }}>
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
                      background: 'linear-gradient(135deg, rgba(67,233,123,0.08) 0%, rgba(56,249,215,0.03) 100%)', 
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
                            onClose={() => setModeChanges(prev => ({ ...prev, up: prev.up.filter((_, i) => i !== idx) }))}>
                            <span style={{ cursor: 'pointer' }} onClick={() => { setTradeChangeType('mode'); setTradeChangeDirection('up'); setEditingTradeChange(item); tradeChangeForm.setFieldsValue(item); setIsTradeChangeModalOpen(true); }}>
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
                      background: 'linear-gradient(135deg, rgba(255,77,79,0.08) 0%, rgba(255,77,79,0.03) 100%)', 
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
                            onClose={() => setModeChanges(prev => ({ ...prev, down: prev.down.filter((_, i) => i !== idx) }))}>
                            <span style={{ cursor: 'pointer' }} onClick={() => { setTradeChangeType('mode'); setTradeChangeDirection('down'); setEditingTradeChange(item); tradeChangeForm.setFieldsValue(item); setIsTradeChangeModalOpen(true); }}>
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
                      background: 'linear-gradient(135deg, rgba(67,233,123,0.08) 0%, rgba(56,249,215,0.03) 100%)', 
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
                            onClose={() => setCategoryChanges(prev => ({ ...prev, up: prev.up.filter((_, i) => i !== idx) }))}>
                            <span style={{ cursor: 'pointer' }} onClick={() => { setTradeChangeType('category'); setTradeChangeDirection('up'); setEditingTradeChange(item); tradeChangeForm.setFieldsValue(item); setIsTradeChangeModalOpen(true); }}>
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
                      background: 'linear-gradient(135deg, rgba(255,77,79,0.08) 0%, rgba(255,77,79,0.03) 100%)', 
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
                            onClose={() => setCategoryChanges(prev => ({ ...prev, down: prev.down.filter((_, i) => i !== idx) }))}>
                            <span style={{ cursor: 'pointer' }} onClick={() => { setTradeChangeType('category'); setTradeChangeDirection('down'); setEditingTradeChange(item); tradeChangeForm.setFieldsValue(item); setIsTradeChangeModalOpen(true); }}>
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
                      background: 'linear-gradient(135deg, rgba(67,233,123,0.08) 0%, rgba(56,249,215,0.03) 100%)', 
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
                      background: 'linear-gradient(135deg, rgba(255,77,79,0.08) 0%, rgba(255,77,79,0.03) 100%)', 
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
      label: '跨境电商',
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
              background: hasCrossborderEcommerce ? 'linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.02) 100%)' : '#fff',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: hasCrossborderEcommerce ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#d9d9d9',
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
                style={{ 
                  background: hasCrossborderEcommerce ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : undefined
                }}
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
                  '亚马逊 (Amazon)': { name: '亚马逊', subName: 'Amazon', letter: 'A', gradient: 'linear-gradient(135deg, rgba(250,140,22,0.1) 0%, rgba(250,173,20,0.05) 100%)', border: '1px solid rgba(250,140,22,0.2)', shadow: '0 4px 12px rgba(250,140,22,0.3)' },
                  '阿里国际站 (Alibaba.com)': { name: '阿里国际站', subName: 'Alibaba.com', letter: '阿', gradient: 'linear-gradient(135deg, rgba(212,56,13,0.1) 0%, rgba(245,87,108,0.05) 100%)', border: '1px solid rgba(212,56,13,0.2)', shadow: '0 4px 12px rgba(212,56,13,0.3)' },
                  'TikTok Shop': { name: 'TikTok Shop', subName: 'TikTok', letter: 'T', gradient: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(105,201,208,0.05) 100%)', border: '1px solid rgba(0,0,0,0.2)', shadow: '0 4px 12px rgba(0,0,0,0.2)' },
                  '速卖通 (AliExpress)': { name: '速卖通', subName: 'AliExpress', letter: 'A', gradient: 'linear-gradient(135deg, rgba(255,77,79,0.1) 0%, rgba(255,107,53,0.05) 100%)', border: '1px solid rgba(255,77,79,0.2)', shadow: '0 4px 12px rgba(255,77,79,0.3)' },
                  'eBay': { name: 'eBay', subName: 'eBay.com', letter: 'E', gradient: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.05) 100%)', border: '1px solid rgba(102,126,234,0.2)', shadow: '0 4px 12px rgba(102,126,234,0.3)' },
                  '独立站 (Shopify)': { name: '独立站', subName: 'Shopify', letter: '独', gradient: 'linear-gradient(135deg, rgba(67,233,123,0.1) 0%, rgba(56,249,215,0.05) 100%)', border: '1px solid rgba(67,233,123,0.2)', shadow: '0 4px 12px rgba(67,233,123,0.3)' },
                  'Temu': { name: 'Temu', subName: 'Temu.com', letter: 'T', gradient: 'linear-gradient(135deg, rgba(255,107,53,0.1) 0%, rgba(255,140,22,0.05) 100%)', border: '1px solid rgba(255,107,53,0.2)', shadow: '0 4px 12px rgba(255,107,53,0.3)' },
                  'SHEIN': { name: 'SHEIN', subName: 'SHEIN.com', letter: 'S', gradient: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(64,64,64,0.05) 100%)', border: '1px solid rgba(0,0,0,0.2)', shadow: '0 4px 12px rgba(0,0,0,0.2)' },
                  '沃尔玛 (Walmart)': { name: '沃尔玛', subName: 'Walmart', letter: 'W', gradient: 'linear-gradient(135deg, rgba(0,113,220,0.1) 0%, rgba(0,150,255,0.05) 100%)', border: '1px solid rgba(0,113,220,0.2)', shadow: '0 4px 12px rgba(0,113,220,0.3)' },
                  'Lazada': { name: 'Lazada', subName: 'Lazada.com', letter: 'L', gradient: 'linear-gradient(135deg, rgba(15,76,129,0.1) 0%, rgba(29,161,242,0.05) 100%)', border: '1px solid rgba(15,76,129,0.2)', shadow: '0 4px 12px rgba(15,76,129,0.3)' },
                  'Shopee': { name: 'Shopee', subName: 'Shopee.com', letter: 'S', gradient: 'linear-gradient(135deg, rgba(238,77,45,0.1) 0%, rgba(255,107,53,0.05) 100%)', border: '1px solid rgba(238,77,45,0.2)', shadow: '0 4px 12px rgba(238,77,45,0.3)' },
                  'Wish': { name: 'Wish', subName: 'Wish.com', letter: 'W', gradient: 'linear-gradient(135deg, rgba(0,150,199,0.1) 0%, rgba(0,199,190,0.05) 100%)', border: '1px solid rgba(0,150,199,0.2)', shadow: '0 4px 12px rgba(0,150,199,0.3)' },
                  'Etsy': { name: 'Etsy', subName: 'Etsy.com', letter: 'E', gradient: 'linear-gradient(135deg, rgba(242,101,34,0.1) 0%, rgba(255,140,22,0.05) 100%)', border: '1px solid rgba(242,101,34,0.2)', shadow: '0 4px 12px rgba(242,101,34,0.3)' },
                  'Wayfair': { name: 'Wayfair', subName: 'Wayfair.com', letter: 'W', gradient: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(139,92,246,0.05) 100%)', border: '1px solid rgba(124,58,237,0.2)', shadow: '0 4px 12px rgba(124,58,237,0.3)' },
                  'Mercado Libre': { name: 'Mercado Libre', subName: 'MercadoLibre', letter: 'M', gradient: 'linear-gradient(135deg, rgba(255,229,0,0.1) 0%, rgba(255,235,59,0.05) 100%)', border: '1px solid rgba(255,229,0,0.2)', shadow: '0 4px 12px rgba(255,229,0,0.3)' },
                  '乐天 (Rakuten)': { name: '乐天', subName: 'Rakuten', letter: 'R', gradient: 'linear-gradient(135deg, rgba(191,0,0,0.1) 0%, rgba(220,38,38,0.05) 100%)', border: '1px solid rgba(191,0,0,0.2)', shadow: '0 4px 12px rgba(191,0,0,0.3)' },
                  '京东国际 (JD Global)': { name: '京东国际', subName: 'JD Global', letter: '京', gradient: 'linear-gradient(135deg, rgba(225,37,27,0.1) 0%, rgba(239,68,68,0.05) 100%)', border: '1px solid rgba(225,37,27,0.2)', shadow: '0 4px 12px rgba(225,37,27,0.3)' },
                  '其他': { name: '其他', subName: 'Other', letter: '其', gradient: 'linear-gradient(135deg, rgba(156,163,175,0.1) 0%, rgba(209,213,219,0.05) 100%)', border: '1px solid rgba(156,163,175,0.2)', shadow: '0 4px 12px rgba(156,163,175,0.3)' },
                };
                const iconColors: Record<string, string> = {
                  '亚马逊 (Amazon)': 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
                  '阿里国际站 (Alibaba.com)': 'linear-gradient(135deg, #d4380d 0%, #f5222d 100%)',
                  'TikTok Shop': 'linear-gradient(135deg, #000000 0%, #69c9d0 100%)',
                  '速卖通 (AliExpress)': 'linear-gradient(135deg, #ff4d4f 0%, #ff6b35 100%)',
                  'eBay': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '独立站 (Shopify)': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  'Temu': 'linear-gradient(135deg, #ff6b35 0%, #fa8c16 100%)',
                  'SHEIN': 'linear-gradient(135deg, #000000 0%, #404040 100%)',
                  '沃尔玛 (Walmart)': 'linear-gradient(135deg, #0071dc 0%, #0096ff 100%)',
                  'Lazada': 'linear-gradient(135deg, #0f4c81 0%, #1da1f2 100%)',
                  'Shopee': 'linear-gradient(135deg, #ee4d2d 0%, #ff6b35 100%)',
                  'Wish': 'linear-gradient(135deg, #0096c7 0%, #00c7be 100%)',
                  'Etsy': 'linear-gradient(135deg, #f26522 0%, #fa8c16 100%)',
                  'Wayfair': 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
                  'Mercado Libre': 'linear-gradient(135deg, #ffe500 0%, #ffeb3b 100%)',
                  '乐天 (Rakuten)': 'linear-gradient(135deg, #bf0000 0%, #dc2626 100%)',
                  '京东国际 (JD Global)': 'linear-gradient(135deg, #e1251b 0%, #ef4444 100%)',
                  '其他': 'linear-gradient(135deg, #9ca3af 0%, #d1d5db 100%)',
                };
                return selectedCrossborderPlatforms.map((platform) => {
                  const config = platformConfigs[platform] || { name: platform, subName: '', letter: platform.charAt(0), gradient: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.05) 100%)', border: '1px solid rgba(102,126,234,0.2)', shadow: '0 4px 12px rgba(102,126,234,0.3)' };
                  const iconColor = iconColors[platform] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
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
                <div style={{ padding: '14px', background: 'linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.05) 100%)', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>跨境业务占比</Text>
                  <div style={{ fontWeight: 700, color: '#667eea', fontSize: 18 }}>25%</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ padding: '14px', background: '#fafbfc', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>跨境物流模式</Text>
                  <div style={{ fontWeight: 600, color: '#333' }}>海运、FBA</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ padding: '14px', background: '#fafbfc', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>支付结算方式</Text>
                  <div style={{ fontWeight: 600, color: '#333' }}>FOB</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ padding: '14px', background: '#fafbfc', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>跨境电商团队规模</Text>
                  <div style={{ fontWeight: 700, color: '#667eea', fontSize: 16 }}>5<span style={{ fontSize: 12, fontWeight: 500, color: '#888' }}> 人</span></div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ padding: '14px', background: '#fafbfc', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>是否在用ERP</Text>
                  <div style={{ fontWeight: 600, color: '#333' }}>是（用友U8）</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ padding: '14px', background: 'linear-gradient(135deg, rgba(67,233,123,0.08) 0%, rgba(56,249,215,0.05) 100%)', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>跨境转型意愿</Text>
                  <div style={{ fontWeight: 600, color: '#43e97b' }}>{enterprise.transformation_willingness || '-'}</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ padding: '14px', background: 'linear-gradient(135deg, rgba(67,233,123,0.08) 0%, rgba(56,249,215,0.05) 100%)', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>愿意投入转型程度</Text>
                  <div style={{ fontWeight: 600, color: '#43e97b' }}>高</div>
                </div>
              </Col>
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
                      setDimensionSelections(prev => ({
                        ...prev,
                        [dim.key]: Array.isArray(value) ? value : (value ? [value] : [])
                      }));
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
            const result = calculateRequirements(dimensionSelections);
            const filteredAll = result.all.filter(req => !removedRequirements.includes(req.id));
            const hasSelection = Object.values(dimensionSelections).some(arr => arr && arr.length > 0);
            // 合并通用需求和差异化需求，按阶段分组
            const allRequirements = [...result.universal, ...result.enhanced, ...filteredAll];
            const uniqueRequirements = allRequirements.filter((req, index, self) => 
              self.findIndex(r => r.id === req.id) === index
            );
            const groupedByPhase = groupRequirementsByPhase(uniqueRequirements);
            const phases = ['战略规划与资源准备', '渠道搭建与商品上线', '营销推广与规模增长', '品牌深耕与持续优化'];
            
            // 维度标签映射
            const dimensionLabels: Record<string, Record<string, string>> = {
              enterpriseType: { factory: '工厂型', trading: '贸易型', factoryTrading: '工贸一体', startup: '初创/SOHO' },
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
              setRemovedRequirements(prev => [...prev, reqId]);
              message.success('已移除该需求');
            };
            
            const handleRemoveCustomRequirement = (reqId: string) => {
              setCustomRequirements(prev => prev.filter(r => r.id !== reqId));
              message.success('已删除自定义需求');
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
                setCustomRequirements(prev => [...prev, newReq]);
                setIsCustomRequirementModalOpen(false);
                customRequirementForm.resetFields();
                message.success('已添加自定义需求');
              });
            };
            
            const handleRestoreRequirement = (reqId: string) => {
              setRemovedRequirements(prev => prev.filter(id => id !== reqId));
              message.success('已恢复该需求');
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
                        background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.05) 100%)',
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
                        background: 'linear-gradient(135deg, rgba(67,233,123,0.1) 0%, rgba(56,249,215,0.05) 100%)',
                        borderRadius: 10,
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#43e97b' }}>
                          {result.universal.length}
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>通用必选需求</Text>
                      </div>
                    </Col>
                    <Col span={6}>
                      <div style={{
                        padding: '16px',
                        background: 'linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(251,191,36,0.05) 100%)',
                        borderRadius: 10,
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#f97316' }}>
                          {result.enhanced.length}
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>增强项需求</Text>
                      </div>
                    </Col>
                    <Col span={6}>
                      <div style={{
                        padding: '16px',
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(168,85,247,0.05) 100%)',
                        borderRadius: 10,
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#8b5cf6' }}>
                          {hasSelection ? result.dimensional.length : 0}
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
                  
                  const phaseItems = phases.map(phase => {
                    const phaseRequirements = groupedByPhase[phase] || [];
                    if (phaseRequirements.length === 0) return null;
                    
                    const colors = phaseColors[phase] || phaseColors['战略规划与资源准备'];
                    
                    // 按分类分组
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
                      style={{ borderRadius: 6, background: 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)', border: 'none' }}
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
                  <span style={{ padding: '4px 12px', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', borderRadius: 20, color: '#fff', fontWeight: 500, fontSize: 12 }}>是</span>
                </div>
              </Col>
              <Col span={16}>
                <div style={{ padding: '14px 16px', background: '#fafbfc', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>已享受政策</Text>
                  <Space size={8}>
                    <span style={{ padding: '4px 12px', background: 'linear-gradient(135deg, rgba(67,233,123,0.15) 0%, rgba(56,249,215,0.1) 100%)', borderRadius: 6, color: '#389e0d', fontWeight: 500, fontSize: 12 }}>跨境电商扶持资金</span>
                    <span style={{ padding: '4px 12px', background: 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.1) 100%)', borderRadius: 6, color: '#667eea', fontWeight: 500, fontSize: 12 }}>外贸稳增长补贴</span>
                  </Space>
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
                    background: isCooperating ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' : 'linear-gradient(135deg, #ff6b6b 0%, #ffa07a 100%)'
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
                  defaultValue={['ecommerce_training', 'platform_resource', 'brand_incubation']}
                  onChange={(value) => message.success('合作项目已更新')}
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
                  defaultValue={['no_intention', 'own_team']}
                  onChange={(value) => message.success('顾虑信息已更新')}
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
                  { label: '企业服务合作', value: 4, color: '#667eea' },
                  { label: '招商入驻合作', value: 3, color: '#43e97b' },
                  { label: '孵化转型合作', value: 5, color: '#f97316' },
                  { label: '品牌营销合作', value: 4, color: '#ec4899' },
                  { label: '人才培训合作', value: 3, color: '#8b5cf6' },
                  { label: '跨境整体方案', value: 4, color: '#06b6d4' },
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
                        defaultValue={item.value} 
                        style={{ fontSize: 14 }} 
                        onChange={(value) => message.success(`${item.label}评分已更新为${value}星`)}
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
                  <Text strong style={{ fontSize: 18, color: '#667eea' }}>75%</Text>
                </div>
                <Slider
                  defaultValue={75}
                  min={0}
                  max={100}
                  step={1}
                  tooltip={{ formatter: (value) => `${value}%` }}
                  onChangeComplete={(value) => message.success(`标杆企业可能性已更新为${value}%`)}
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
                defaultValue="该企业在园艺工具领域有较强的生产能力和品牌基础，跨境电商转型意愿强烈，建议重点跟进孵化转型合作。企业负责人对三中心服务表示认可，后续可安排深度对接。"
                rows={3}
                style={{ borderRadius: 10, marginBottom: 12 }}
              />
              <div style={{ textAlign: 'right' }}>
                <Button 
                  type="primary" 
                  onClick={() => message.success('补充说明已保存')}
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
              background: isSurveyed ? 'linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.02) 100%)' : '#fff',
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
                        background: isSelected ? 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.1) 100%)' : '#fafafa',
                        border: isSelected ? '2px solid #667eea' : '1px solid #f0f0f0',
                        borderRadius: 10,
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onClick={() => {
                        setCompetitionPosition(item.value);
                        message.success(`行业竞争地位已更新为"${item.label}"`);
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
              onBlur={() => message.success('竞争地位描述已保存')}
            />
          </Card>

          {/* 当前面临风险 */}
          <Card 
            title={<span style={{ fontWeight: 600, fontSize: 15 }}>当前面临风险</span>}
            size="small" 
            style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            headStyle={{ borderBottom: '1px solid #f5f5f5' }}
            extra={<Button type="link" size="small" icon={<EditOutlined />} style={{ fontWeight: 500 }} onClick={() => setIsRiskModalOpen(true)}>编辑</Button>}
          >
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              {[
                { icon: <AlertOutlined />, title: '原材料价格波动风险', desc: '近期钢材、塑料等原材料价格波动较大，影响生产成本', level: 'high', color: '#f5222d', gradient: 'rgba(245,34,45,0.08)' },
                { icon: <WarningOutlined />, title: '跨境物流成本上涨', desc: '国际运费持续高位运行，压缩利润空间', level: 'medium', color: '#fa8c16', gradient: 'rgba(250,140,22,0.08)' },
                { icon: <WarningOutlined />, title: '人才流失风险', desc: '跨境电商运营人才稀缺，存在核心员工流失风险', level: 'low', color: '#faad14', gradient: 'rgba(250,173,20,0.08)' },
              ].map((item, idx) => (
                <div key={idx} style={{ 
                  padding: '16px 20px',
                  background: `linear-gradient(135deg, ${item.gradient} 0%, transparent 100%)`,
                  borderRadius: 12,
                  border: `1px solid ${item.color}20`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14
                }}>
                  <div style={{ 
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
                    flexShrink: 0
                  }}>{item.icon}</div>
                  <div>
                    <Text strong style={{ color: item.color, fontSize: 14 }}>{item.title}</Text>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </Space>
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
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/enterprise')}>
          返回列表
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
        bodyStyle={{ padding: 0 }}
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
            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.stage_after !== cur.stage_after}>
              {({ getFieldValue }) => {
                const stageAfter = getFieldValue('stage_after');
                const signedStages = ['SIGNED', 'SETTLED', 'INCUBATING'];
                return signedStages.includes(stageAfter) ? (
                  <Col span={24}>
                    <Form.Item name="service_provider" label="合作服务商">
                      <Input placeholder="请输入合作服务商..." />
                    </Form.Item>
                  </Col>
                ) : null;
              }}
            </Form.Item>
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
                <Select options={[
                  { label: '工厂型', value: '工厂型' },
                  { label: '贸易型', value: '贸易型' },
                  { label: '工贸一体', value: '工贸一体' },
                  { label: '初创/SOHO', value: '初创/SOHO' },
                ]} />
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
              <Form.Item name="domestic_revenue_id" label="国内营收(万元)">
                <Select placeholder="请选择" options={domesticRevenueOptions} allowClear />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="crossborder_revenue_id" label="跨境营收(万元)">
                <Select placeholder="请选择" options={crossBorderRevenueOptions} allowClear />
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
        width={600}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          {enterprise.contacts.map((contact, index) => (
            <Card 
              key={index} 
              size="small" 
              style={{ marginBottom: 12 }} 
              title={`联系人 ${index + 1}`}
              extra={
                enterprise.contacts.length > 1 && (
                  <Button 
                    type="text" 
                    danger 
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      Modal.confirm({
                        title: '确认删除',
                        content: `确定要删除联系人「${contact.name}」吗？`,
                        okText: '删除',
                        okType: 'danger',
                        cancelText: '取消',
                        onOk() {
                          message.success('联系人已删除');
                        },
                      });
                    }}
                  >
                    删除
                  </Button>
                )
              }
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="姓名">
                    <Input defaultValue={contact.name} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="电话">
                    <Input defaultValue={contact.phone} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="职位">
                    <Input defaultValue={contact.position} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          ))}
          <Button type="dashed" block icon={<PlusOutlined />}>添加联系人</Button>
        </Form>
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
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="certifications" label="产品认证">
                <Select
                  mode="multiple"
                  placeholder="请选择产品认证"
                  options={[
                    { label: 'CE认证', value: 'CE认证' },
                    { label: 'SGS认证', value: 'SGS认证' },
                    { label: 'ISO9001', value: 'ISO9001' },
                    { label: 'FDA认证', value: 'FDA认证' },
                    { label: 'UL认证', value: 'UL认证' },
                    { label: 'RoHS认证', value: 'RoHS认证' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="annual_sales" label="年销售额(万元)">
                <Input type="number" placeholder="请输入年销售额" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="target_regions" label="主要销售区域">
                <Select
                  mode="multiple"
                  placeholder="请选择销售区域"
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
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="target_countries" label="主要销售国家">
                <Select
                  mode="multiple"
                  placeholder="请选择销售国家"
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
                <Form.Item name="automation_level" label="设备自动化程度">
                  <Select
                    placeholder="请选择"
                    options={[
                      { label: '低（<30%）', value: '低（<30%）' },
                      { label: '中（30%-60%）', value: '中（30%-60%）' },
                      { label: '高（60%-80%）', value: '高（60%-80%）' },
                      { label: '很高（>80%）', value: '很高（>80%）' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="annual_capacity" label="年产能">
                  <Input placeholder="如：30万件" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="logistics_partners" label="物流合作方">
                  <Select
                    mode="multiple"
                    placeholder="请选择物流合作方"
                    options={[
                      { label: 'DHL', value: 'DHL' },
                      { label: 'UPS', value: 'UPS' },
                      { label: 'FedEx', value: 'FedEx' },
                      { label: '顺丰', value: '顺丰' },
                      { label: '中通', value: '中通' },
                      { label: '圆通', value: '圆通' },
                      { label: '韵达', value: '韵达' },
                    ]}
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
          <Form.Item name="has_brand" label="是否有自主品牌" valuePropName="checked">
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
          <Form.Item name="type" label="专利类型">
            <Select
              placeholder="请选择专利类型"
              options={[
                { label: '发明专利', value: '发明专利' },
                { label: '实用新型', value: '实用新型' },
                { label: '外观设计', value: '外观设计' },
                { label: '核心技术', value: '核心技术' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 外贸信息编辑模态框 */}
      <Modal
        title="编辑外贸信息"
        open={isTradeModalOpen}
        onOk={() => { message.success('外贸信息更新成功'); setIsTradeModalOpen(false); }}
        onCancel={() => setIsTradeModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={700}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="主要销售区域">
                <Select
                  mode="multiple"
                  defaultValue={['欧洲', '东南亚']}
                  placeholder="请选择销售区域"
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
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="主要销售国家">
                <Select
                  mode="multiple"
                  defaultValue={['美国', '德国']}
                  placeholder="请选择销售国家"
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
            <Col span={12}>
              <Form.Item label="外贸模式">
                <Select defaultValue="0110" options={[{ label: '0110', value: '0110' }, { label: '1039', value: '1039' }, { label: '9610', value: '9610' }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="是否有进出口资质">
                <Select defaultValue={true} options={[{ label: '是', value: true }, { label: '否', value: false }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="报关申报主体模式">
                <Select defaultValue="自营" options={[{ label: '自营', value: '自营' }, { label: '代理', value: '代理' }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="外贸业务团队模式">
                <Select defaultValue="自建" options={[{ label: '自建', value: '自建' }, { label: '外包', value: '外包' }, { label: '混合', value: '混合' }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="外贸团队人数">
                <Input type="number" defaultValue={8} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="是否有国内电商经验">
                <Select defaultValue={true} options={[{ label: '是', value: true }, { label: '否', value: false }]} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 原因编辑模态框 */}
      <Modal
        title={editingReason ? '编辑原因' : '添加原因'}
        open={isReasonModalOpen}
        onOk={() => {
          reasonForm.validateFields().then(values => {
            if (reasonType === 'growth') {
              if (editingReason) {
                setGrowthReasons(prev => prev.map((r, i) => i === editingReason.index ? values.reason : r));
              } else {
                setGrowthReasons(prev => [...prev, values.reason]);
              }
            } else {
              if (editingReason) {
                setDeclineReasons(prev => prev.map((r, i) => i === editingReason.index ? values.reason : r));
              } else {
                setDeclineReasons(prev => [...prev, values.reason]);
              }
            }
            message.success(editingReason ? '修改成功' : '添加成功');
            setIsReasonModalOpen(false);
            reasonForm.resetFields();
          });
        }}
        onCancel={() => { setIsReasonModalOpen(false); reasonForm.resetFields(); }}
        okText="保存"
        cancelText="取消"
        width={400}
      >
        <Form form={reasonForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="reason" label={reasonType === 'growth' ? '增长原因' : '下降原因'} rules={[{ required: true, message: '请选择原因' }]}>
            <Select
              placeholder="请选择原因"
              options={reasonType === 'growth' ? [
                { label: '东南亚市场需求旺盛', value: '东南亚市场需求旺盛' },
                { label: '跨境电商渠道拓展成功', value: '跨境电商渠道拓展成功' },
                { label: '新产品线上市表现良好', value: '新产品线上市表现良好' },
                { label: '品牌升级带动销量', value: '品牌升级带动销量' },
                { label: '价格优势明显', value: '价格优势明显' },
                { label: '产品质量提升', value: '产品质量提升' },
                { label: '大客户开发成功', value: '大客户开发成功' },
                { label: '平台流量扶持', value: '平台流量扶持' },
                { label: '政策红利', value: '政策红利' },
                { label: '供应链优化降本增效', value: '供应链优化降本增效' },
                { label: '营销推广效果显著', value: '营销推广效果显著' },
                { label: '季节性旺季', value: '季节性旺季' },
                { label: '其他', value: '其他' },
              ] : [
                { label: '欧美市场竞争加剧', value: '欧美市场竞争加剧' },
                { label: '传统B2B订单减少', value: '传统B2B订单减少' },
                { label: '部分品类价格下降', value: '部分品类价格下降' },
                { label: '原材料成本上涨', value: '原材料成本上涨' },
                { label: '汇率波动影响', value: '汇率波动影响' },
                { label: '物流成本上升', value: '物流成本上升' },
                { label: '目标国政策变化', value: '目标国政策变化' },
                { label: '产品质量问题', value: '产品质量问题' },
                { label: '主要客户流失', value: '主要客户流失' },
                { label: '平台规则调整', value: '平台规则调整' },
                { label: '季节性淡季', value: '季节性淡季' },
                { label: '供应链问题', value: '供应链问题' },
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

      {/* 外贸业绩变化编辑模态框 */}
      <Modal
        title={editingTradeChange ? '编辑' : '添加'}
        open={isTradeChangeModalOpen}
        onOk={() => {
          tradeChangeForm.validateFields().then(values => {
            if (tradeChangeType === 'market') {
              const newItem = { type: values.type || 'region', name: values.name, rate: values.rate };
              if (editingTradeChange) {
                setMarketChanges(prev => ({
                  ...prev,
                  [tradeChangeDirection]: prev[tradeChangeDirection].map(item => 
                    item.name === editingTradeChange.name ? newItem : item
                  )
                }));
              } else {
                setMarketChanges(prev => ({
                  ...prev,
                  [tradeChangeDirection]: [...prev[tradeChangeDirection], newItem]
                }));
              }
            } else if (tradeChangeType === 'mode') {
              const newItem = { name: values.name, rate: values.rate };
              if (editingTradeChange) {
                setModeChanges(prev => ({
                  ...prev,
                  [tradeChangeDirection]: prev[tradeChangeDirection].map(item => 
                    item.name === editingTradeChange.name ? newItem : item
                  )
                }));
              } else {
                setModeChanges(prev => ({
                  ...prev,
                  [tradeChangeDirection]: [...prev[tradeChangeDirection], newItem]
                }));
              }
            } else {
              // 品类变化
              let categoryName = '';
              if (values.category) {
                // 从级联选择器获取完整路径的标签
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
                ];
                
                categoryName = findCategoryPath(categoryOptions, values.category) || '未知品类';
              }
              
              const newItem = { name: categoryName, rate: values.rate };
              if (editingTradeChange) {
                setCategoryChanges(prev => ({
                  ...prev,
                  [tradeChangeDirection]: prev[tradeChangeDirection].map(item => 
                    item.name === editingTradeChange.name ? newItem : item
                  )
                }));
              } else {
                setCategoryChanges(prev => ({
                  ...prev,
                  [tradeChangeDirection]: [...prev[tradeChangeDirection], newItem]
                }));
              }
            }
            message.success(editingTradeChange ? '修改成功' : '添加成功');
            setIsTradeChangeModalOpen(false);
            tradeChangeForm.resetFields();
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
            <Input placeholder={tradeChangeDirection === 'up' ? '例如: +25%' : '例如: -8%'} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 外贸业绩分析编辑模态框 */}
      <Modal
        title="编辑外贸业绩分析"
        open={isTradePerformanceModalOpen}
        onOk={() => {
          tradePerformanceForm.validateFields().then(values => {
            message.success('外贸业绩分析更新成功');
            setIsTradePerformanceModalOpen(false);
          });
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
                initialValue={1280}
                rules={[{ required: true, message: '请输入营业额' }]}
              >
                <Input type="number" placeholder="请输入营业额" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label={`${new Date().getFullYear() - 1}年外贸营业额(万元)`}
                name="lastYearRevenue"
                initialValue={1500}
                rules={[{ required: true, message: '请输入营业额' }]}
              >
                <Input type="number" placeholder="请输入营业额" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="备注说明" name="remark">
            <Input.TextArea rows={3} placeholder="可以添加业绩变化的说明..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* 跨境平台编辑模态框 */}
      <Modal
        title="编辑主要跨境平台"
        open={isCrossborderPlatformModalOpen}
        onOk={() => { message.success('跨境平台信息更新成功'); setIsCrossborderPlatformModalOpen(false); }}
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
        onOk={() => { message.success('跨境基本信息更新成功'); setIsCrossborderBasicModalOpen(false); }}
        onCancel={() => setIsCrossborderBasicModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={700}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="是否开展跨境电商">
                <Select defaultValue={true} options={[{ label: '是', value: true }, { label: '否', value: false }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="跨境业务占比(%)">
                <Input type="number" defaultValue={25} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="跨境物流模式">
                <Select 
                  defaultValue="fba" 
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
              <Form.Item label="支付结算方式">
                <Select 
                  defaultValue="FOB (离岸价)" 
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
              <Form.Item label="跨境电商团队规模">
                <Input type="number" defaultValue={5} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="是否在用ERP">
                <Select 
                  defaultValue="是（用友U8）" 
                  placeholder="请选择"
                  options={[
                    { label: '是（用友U8）', value: '是（用友U8）' },
                    { label: '是（金蝶K3）', value: '是（金蝶K3）' },
                    { label: '是（SAP）', value: '是（SAP）' },
                    { label: '是（Oracle）', value: '是（Oracle）' },
                    { label: '是（浪潮）', value: '是（浪潮）' },
                    { label: '是（鼎捷）', value: '是（鼎捷）' },
                    { label: '是（管家婆）', value: '是（管家婆）' },
                    { label: '是（速达）', value: '是（速达）' },
                    { label: '是（其他ERP）', value: '是（其他ERP）' },
                    { label: '否', value: '否' },
                  ]}
                  showSearch
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="跨境转型意愿">
                <Select defaultValue="高" options={[{ label: '高', value: '高' }, { label: '中', value: '中' }, { label: '低', value: '低' }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="愿意投入转型程度">
                <Select defaultValue="高" options={[{ label: '高', value: '高' }, { label: '中', value: '中' }, { label: '低', value: '低' }]} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 目标市场编辑模态框 */}
      <Modal
        title="编辑目标市场及占比"
        open={isMarketModalOpen}
        onOk={() => { message.success('目标市场信息更新成功'); setIsMarketModalOpen(false); }}
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
        onOk={() => { message.success('跨境需求信息更新成功'); setIsCrossborderNeedsModalOpen(false); }}
        onCancel={() => setIsCrossborderNeedsModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={700}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            {['转型跨境意愿', '代运营需求', '流量营销需求', '跨境培训需求', '品牌孵化需求', '跨境人才需求', '共享办公工位', '签约入驻三中心', '注册至三中心'].map((item, idx) => (
              <Col span={12} key={idx}>
                <Form.Item label={item}>
                  <Select defaultValue={idx < 6} options={[{ label: '是', value: true }, { label: '否', value: false }]} />
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
        onOk={() => { message.success('三中心合作信息更新成功'); setIsTriCenterCoopModalOpen(false); }}
        onCancel={() => setIsTriCenterCoopModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="与三中心合作主要需求">
            <Select
              mode="multiple"
              defaultValue={['跨境电商运营培训', '平台资源对接', '品牌孵化服务']}
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
          <Form.Item label="不考虑合作主要顾虑">
            <Input.TextArea placeholder="请输入不考虑合作的主要顾虑" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 跨境业务痛点编辑模态框 */}
      <Modal
        title="编辑跨境业务痛点"
        open={isCrossborderPainModalOpen}
        onOk={() => { message.success('跨境业务痛点更新成功'); setIsCrossborderPainModalOpen(false); }}
        onCancel={() => setIsCrossborderPainModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={500}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="跨境业务痛点">
            <Select
              mode="multiple"
              defaultValue={['流量获取困难', '运营人才缺乏', '物流成本高']}
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
        onOk={() => { message.success('合作可能性评估更新成功'); setIsEvaluationModalOpen(false); }}
        onCancel={() => setIsEvaluationModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          {['企业服务合作可能性', '招商入驻合作可能性', '孵化转型合作可能性', '品牌营销合作可能性', '人才培训合作可能性', '跨境整体方案合作可能性'].map((item, idx) => (
            <Form.Item key={idx} label={item}>
              <Rate defaultValue={[4, 3, 5, 4, 5, 4][idx]} />
            </Form.Item>
          ))}
        </Form>
      </Modal>

      {/* 初步评估编辑模态框 */}
      <Modal
        title="编辑初步评估"
        open={isPreliminaryModalOpen}
        onOk={() => { message.success('初步评估更新成功'); setIsPreliminaryModalOpen(false); }}
        onCancel={() => setIsPreliminaryModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="调研日期">
                <Input defaultValue="2024-01-15" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="调研人员">
                <Input defaultValue="张明、李华" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="跨境转型意愿(%)">
                <Input type="number" defaultValue={85} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="投入转型程度(%)">
                <Input type="number" defaultValue={75} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="成为标杆企业可能性(%)">
                <Input type="number" defaultValue={90} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 补充说明编辑模态框 */}
      <Modal
        title="编辑补充说明"
        open={isSupplementModalOpen}
        onOk={() => { message.success('补充说明更新成功'); setIsSupplementModalOpen(false); }}
        onCancel={() => setIsSupplementModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="补充说明">
            <Input.TextArea rows={6} defaultValue="该企业为常州园艺制品行业优质企业，产品质量过硬，外贸经验丰富。" />
          </Form.Item>
          <Form.Item label="建议事项">
            <Input.TextArea rows={4} defaultValue="优先安排亚马逊招商经理对接&#10;推荐参加下期跨境电商实操培训班&#10;协助申请跨境电商出口退税政策&#10;作为园艺行业标杆案例重点培育" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 政策支持情况编辑模态框 */}
      <Modal
        title="编辑政策支持情况"
        open={isPolicySupportModalOpen}
        onOk={() => { message.success('政策支持情况更新成功'); setIsPolicySupportModalOpen(false); }}
        onCancel={() => setIsPolicySupportModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={500}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="是否享受过政策支持">
            <Select defaultValue={true} options={[{ label: '是', value: true }, { label: '否', value: false }]} />
          </Form.Item>
          <Form.Item label="已享受政策">
            <Select
              mode="multiple"
              defaultValue={['cross_border_fund', 'trade_growth_subsidy']}
              options={[
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
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 行业竞争地位编辑模态框 */}
      <Modal
        title="编辑行业竞争地位"
        open={isCompetitionModalOpen}
        onOk={() => { message.success('行业竞争地位更新成功'); setIsCompetitionModalOpen(false); }}
        onCancel={() => setIsCompetitionModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={500}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="行业竞争地位">
            <Select
              defaultValue="中型企业"
              options={[
                { label: '头部企业', value: '头部企业' },
                { label: '中型企业', value: '中型企业' },
                { label: '初创企业', value: '初创企业' },
              ]}
            />
          </Form.Item>
          <Form.Item label="竞争地位描述">
            <Input.TextArea rows={3} defaultValue="在常州园艺制品行业处于中等偏上水平，具有一定的市场份额和品牌知名度" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 主要竞争对手编辑模态框 */}
      <Modal
        title="编辑主要竞争对手"
        open={isCompetitorModalOpen}
        onOk={() => { message.success('主要竞争对手更新成功'); setIsCompetitorModalOpen(false); }}
        onCancel={() => setIsCompetitorModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }} size={12}>
            {[1, 2, 3].map(idx => (
              <Card key={idx} size="small" title={`竞争对手 ${idx}`}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="企业名称">
                      <Input placeholder="请输入企业名称" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="竞争程度">
                      <Select options={[{ label: '强竞争', value: '强竞争' }, { label: '中等竞争', value: '中等竞争' }, { label: '潜在竞争', value: '潜在竞争' }]} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            ))}
          </Space>
        </Form>
      </Modal>

      {/* 当前面临风险编辑模态框 */}
      <Modal
        title="编辑当前面临风险"
        open={isRiskModalOpen}
        onOk={() => { message.success('当前面临风险更新成功'); setIsRiskModalOpen(false); }}
        onCancel={() => setIsRiskModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="当前面临的主要风险">
            <Select
              mode="multiple"
              defaultValue={['原材料价格波动风险', '跨境物流成本上涨', '人才流失风险']}
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
          <Form.Item label="风险详细描述">
            <Input.TextArea rows={4} placeholder="请详细描述当前面临的风险情况" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default EnterpriseDetail;
