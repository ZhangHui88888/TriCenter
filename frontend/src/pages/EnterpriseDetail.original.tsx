import { useState } from 'react';
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
} from '@ant-design/icons';
import { Rate, Switch } from 'antd';
import { Form, Input, DatePicker } from 'antd';
import { FOLLOW_UP_TYPES } from '@/utils/constants';
import { enterprises, funnelStages, followUpRecords, industryCategories } from '@/data/mockData';
import { dimensions, calculateRequirements, groupRequirementsByPhase, dimensionRequirementMapping, type RequirementItem } from '@/data/requirementsData';

const { Title, Text } = Typography;

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
  const [editingFollowUp, setEditingFollowUp] = useState<any>(null);
  const [isCooperating, setIsCooperating] = useState(true);
  const [hasForeignTrade, setHasForeignTrade] = useState(true);
  const [hasCrossborderEcommerce, setHasCrossborderEcommerce] = useState(true);
  const [isSurveyed, setIsSurveyed] = useState(false);
  const [selectedCrossborderPlatforms, setSelectedCrossborderPlatforms] = useState<string[]>(['亚马逊', '阿里国际站']);
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

  const enterprise = enterprises.find(e => e.id === Number(id));

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
    return funnelStages.find(s => s.code === code) || { name: code, color: '#94a3b8' };
  };

  const stageInfo = getStageInfo(enterprise.funnel_stage);
  const enterpriseRecords = followUpRecords.filter(r => r.enterprise_id === enterprise.id);

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

  const recordColumns = [
    { title: '日期', dataIndex: 'follow_up_date', key: 'date', width: 120 },
    { title: '类型', dataIndex: 'follow_up_type', key: 'type', width: 80 },
    { title: '跟进内容', dataIndex: 'content', key: 'content' },
    { title: '跟进人', dataIndex: 'follow_up_person', key: 'person', width: 80 },
    {
      title: '阶段变化',
      key: 'stage_change',
      width: 180,
      render: (_: unknown, record: { stage_before?: string; stage_after?: string }) => {
        if (record.stage_before && record.stage_after && record.stage_before !== record.stage_after) {
          return (
            <span>
              <Tag color={getStageInfo(record.stage_before).color}>{getStageInfo(record.stage_before).name}</Tag>
              →
              <Tag color={getStageInfo(record.stage_after).color}>{getStageInfo(record.stage_after).name}</Tag>
            </span>
          );
        }
        return '-';
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
          {/* 产品卡片 */}
          <div style={{ 
            marginBottom: 16, 
            borderRadius: 8, 
            borderLeft: '4px solid #667eea',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            background: '#fff',
            padding: 16
          }}>
          <Card 
            size="small" 
            style={{ 
              border: 'none',
              boxShadow: 'none',
              background: 'transparent'
            }} 
            extra={
              <Space size={4}>
                <Button 
                  type="link" 
                  size="small" 
                  icon={<EditOutlined />} 
                  style={{ fontWeight: 500 }}
                  onClick={() => handleEditProduct({
                    name: '园艺工具套装',
                    application: '家庭园艺、户外休闲',
                    certifications: ['CE认证', 'SGS认证'],
                    overseas_market: '欧美、东南亚',
                    annual_sales: 800,
                    local_procurement: 70,
                    automation_level: '高（80%）',
                    annual_capacity: '30万件',
                    logistics_partners: ['DHL', '顺丰']
                  })}
                >
                  编辑
                </Button>
                <Button 
                  type="link" 
                  size="small" 
                  danger
                  icon={<DeleteOutlined />} 
                  style={{ fontWeight: 500 }}
                  onClick={() => handleDeleteProduct('园艺工具套装')}
                >
                  删除
                </Button>
              </Space>
            }
          >
            {/* 产品头部 */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: '1px solid #f5f5f5'
            }}>
              <div>
                <Text strong style={{ fontSize: 16, fontWeight: 600 }}>园艺工具套装</Text>
                <div style={{ color: '#888', fontSize: 13, marginTop: 6 }}>
                  应用领域：家庭园艺、户外休闲
                </div>
              </div>
              <Space size={8}>
                <span style={{
                  padding: '4px 12px',
                  background: 'linear-gradient(135deg, rgba(67,233,123,0.15) 0%, rgba(56,249,215,0.1) 100%)',
                  borderRadius: 6,
                  color: '#389e0d',
                  fontSize: 12,
                  fontWeight: 500
                }}>CE认证</span>
                <span style={{
                  padding: '4px 12px',
                  background: 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.1) 100%)',
                  borderRadius: 6,
                  color: '#667eea',
                  fontSize: 12,
                  fontWeight: 500
                }}>SGS认证</span>
              </Space>
            </div>

            {/* 销售市场信息 */}
            <Row gutter={24} style={{ marginBottom: 20 }}>
              <Col span={8}>
                <div style={{
                  padding: '14px 16px',
                  background: '#fafbfc',
                  borderRadius: 10
                }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                    主要销售区域
                  </Text>
                  <div style={{ fontWeight: 600, color: '#333' }}>欧美、东南亚</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{
                  padding: '14px 16px',
                  background: '#fafbfc',
                  borderRadius: 10
                }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                    主要销售国家
                  </Text>
                  <div style={{ fontWeight: 600, color: '#333' }}>美国、德国、日本</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{
                  padding: '14px 16px',
                  background: 'linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.05) 100%)',
                  borderRadius: 10
                }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                    年销售额
                  </Text>
                  <div style={{ fontWeight: 700, color: '#667eea', fontSize: 16 }}>800万元</div>
                </div>
              </Col>
            </Row>

            {/* 供应链与产能 */}
            <div style={{ 
              padding: '16px',
              background: '#fafbfc',
              borderRadius: 10
            }}>
              <Text strong style={{ fontSize: 14, marginBottom: 14, display: 'block', color: '#333' }}>
                供应链与产能
              </Text>
              <Row gutter={24}>
                <Col span={6}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                    原材料本地采购
                  </Text>
                  <div style={{ fontWeight: 600, color: '#43e97b', fontSize: 15 }}>70%</div>
                </Col>
                <Col span={6}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                    设备自动化程度
                  </Text>
                  <div style={{ fontWeight: 600, color: '#333' }}>高（80%）</div>
                </Col>
                <Col span={6}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                    年产能
                  </Text>
                  <div style={{ fontWeight: 600, color: '#333' }}>30万件</div>
                </Col>
                <Col span={6}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                    物流合作方
                  </Text>
                  <Space size={6}>
                    <span style={{
                      padding: '2px 8px',
                      background: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: 4,
                      fontSize: 12
                    }}>DHL</span>
                    <span style={{
                      padding: '2px 8px',
                      background: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: 4,
                      fontSize: 12
                    }}>顺丰</span>
                  </Space>
                </Col>
              </Row>
            </div>
          </Card>
          </div>
          </Card>

          {/* 自主品牌 */}
          <Card
            size="small"
            title={<span style={{ fontWeight: 600, fontSize: 15, color: '#43e97b' }}>自主品牌</span>}
            style={{ 
              marginBottom: 16, 
              borderRadius: 8, 
              border: 'none',
              borderLeft: '3px solid #43e97b',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}
            headStyle={{ borderBottom: '1px solid #f0f0f0' }}
            extra={
              <Button 
                type="link" 
                size="small" 
                icon={<EditOutlined />} 
                style={{ fontWeight: 500 }}
                onClick={() => {
                  brandForm.setFieldsValue({
                    has_brand: true,
                    brand_names: ['GreenLife', 'OutdoorPro']
                  });
                  setIsBrandModalOpen(true);
                }}
              >
                编辑
              </Button>
            }
          >
            <Row gutter={24}>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                  是否有自主品牌
                </Text>
                <span style={{
                  padding: '4px 12px',
                  background: 'linear-gradient(135deg, rgba(67,233,123,0.15) 0%, rgba(56,249,215,0.1) 100%)',
                  borderRadius: 6,
                  color: '#389e0d',
                  fontSize: 12,
                  fontWeight: 600
                }}>是</span>
              </Col>
              <Col span={16}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                  品牌名称
                </Text>
                <Space size={8}>
                  <span style={{
                    padding: '5px 14px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 20,
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 500
                  }}>GreenLife</span>
                  <span style={{
                    padding: '5px 14px',
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    borderRadius: 20,
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 500
                  }}>OutdoorPro</span>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* 核心技术/专利 */}
          <Card
            size="small"
            title={<span style={{ fontWeight: 600, fontSize: 15, color: '#f97316' }}>核心技术/专利</span>}
            style={{ 
              borderRadius: 8, 
              border: 'none',
              borderLeft: '3px solid #f97316',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}
            headStyle={{ borderBottom: '1px solid #f0f0f0' }}
            extra={
              <Button 
                type="primary" 
                size="small" 
                icon={<PlusOutlined />}
                onClick={handleAddPatent}
                style={{
                  borderRadius: 6,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  fontWeight: 500
                }}
              >
                添加专利
              </Button>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              <div style={{
                padding: '16px 20px',
                background: 'linear-gradient(135deg, rgba(67,233,123,0.1) 0%, rgba(56,249,215,0.05) 100%)',
                borderRadius: 10,
                border: '1px solid rgba(67,233,123,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <SafetyCertificateOutlined style={{ color: '#fff', fontSize: 20 }} />
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 14, display: 'block' }}>环保材料应用技术</Text>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                      专利号：<span style={{ fontFamily: 'monospace' }}>ZL2023XXXXXXXX.X</span> | 
                      <span style={{ color: '#43e97b', fontWeight: 500, marginLeft: 4 }}>发明专利</span>
                    </div>
                  </div>
                </div>
                <Space size={4}>
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<EditOutlined />}
                    onClick={() => handleEditPatent({
                      name: '环保材料应用技术',
                      patent_no: 'ZL2023XXXXXXXX.X',
                      type: '发明专利'
                    })}
                  />
                  <Button 
                    type="text" 
                    size="small" 
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeletePatent('环保材料应用技术')}
                  />
                </Space>
              </div>
              <div style={{
                padding: '16px 20px',
                background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.05) 100%)',
                borderRadius: 10,
                border: '1px solid rgba(102,126,234,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <SafetyCertificateOutlined style={{ color: '#fff', fontSize: 20 }} />
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 14, display: 'block' }}>可折叠户外家具结构设计</Text>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                      专利号：<span style={{ fontFamily: 'monospace' }}>ZL2024XXXXXXXX.X</span> | 
                      <span style={{ color: '#667eea', fontWeight: 500, marginLeft: 4 }}>实用新型</span>
                    </div>
                  </div>
                </div>
                <Space size={4}>
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<EditOutlined />}
                    onClick={() => handleEditPatent({
                      name: '可折叠户外家具结构设计',
                      patent_no: 'ZL2024XXXXXXXX.X',
                      type: '实用新型'
                    })}
                  />
                  <Button 
                    type="text" 
                    size="small" 
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeletePatent('可折叠户外家具结构设计')}
                  />
                </Space>
              </div>
            </Space>
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
                  <div style={{ padding: '16px', background: 'linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.05) 100%)', borderRadius: 10 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>外贸数据(万元)</Text>
                    <div style={{ fontWeight: 700, color: '#667eea', fontSize: 20 }}>1500</div>
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
              extra={<Button type="link" icon={<EditOutlined />} style={{ fontWeight: 500 }}>编辑</Button>}
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
                  '亚马逊': { name: '亚马逊', subName: 'Amazon', letter: 'A', gradient: 'linear-gradient(135deg, rgba(250,140,22,0.1) 0%, rgba(250,173,20,0.05) 100%)', border: '1px solid rgba(250,140,22,0.2)', shadow: '0 4px 12px rgba(250,140,22,0.3)' },
                  '阿里国际站': { name: '阿里国际站', subName: 'Alibaba.com', letter: '阿', gradient: 'linear-gradient(135deg, rgba(212,56,13,0.1) 0%, rgba(245,87,108,0.05) 100%)', border: '1px solid rgba(212,56,13,0.2)', shadow: '0 4px 12px rgba(212,56,13,0.3)' },
                  'eBay': { name: 'eBay', subName: 'eBay.com', letter: 'E', gradient: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.05) 100%)', border: '1px solid rgba(102,126,234,0.2)', shadow: '0 4px 12px rgba(102,126,234,0.3)' },
                  'Wish': { name: 'Wish', subName: 'Wish.com', letter: 'W', gradient: 'linear-gradient(135deg, rgba(0,150,199,0.1) 0%, rgba(0,199,190,0.05) 100%)', border: '1px solid rgba(0,150,199,0.2)', shadow: '0 4px 12px rgba(0,150,199,0.3)' },
                  'Shopee': { name: 'Shopee', subName: 'Shopee.com', letter: 'S', gradient: 'linear-gradient(135deg, rgba(238,77,45,0.1) 0%, rgba(255,107,53,0.05) 100%)', border: '1px solid rgba(238,77,45,0.2)', shadow: '0 4px 12px rgba(238,77,45,0.3)' },
                  'Lazada': { name: 'Lazada', subName: 'Lazada.com', letter: 'L', gradient: 'linear-gradient(135deg, rgba(15,76,129,0.1) 0%, rgba(29,161,242,0.05) 100%)', border: '1px solid rgba(15,76,129,0.2)', shadow: '0 4px 12px rgba(15,76,129,0.3)' },
                  'TikTok Shop': { name: 'TikTok Shop', subName: 'TikTok', letter: 'T', gradient: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(105,201,208,0.05) 100%)', border: '1px solid rgba(0,0,0,0.2)', shadow: '0 4px 12px rgba(0,0,0,0.2)' },
                  '独立站': { name: '独立站', subName: 'Independent Site', letter: '独', gradient: 'linear-gradient(135deg, rgba(67,233,123,0.1) 0%, rgba(56,249,215,0.05) 100%)', border: '1px solid rgba(67,233,123,0.2)', shadow: '0 4px 12px rgba(67,233,123,0.3)' },
                };
                const iconColors: Record<string, string> = {
                  '亚马逊': 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
                  '阿里国际站': 'linear-gradient(135deg, #d4380d 0%, #f5222d 100%)',
                  'eBay': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  'Wish': 'linear-gradient(135deg, #0096c7 0%, #00c7be 100%)',
                  'Shopee': 'linear-gradient(135deg, #ee4d2d 0%, #ff6b35 100%)',
                  'Lazada': 'linear-gradient(135deg, #0f4c81 0%, #1da1f2 100%)',
                  'TikTok Shop': 'linear-gradient(135deg, #000000 0%, #69c9d0 100%)',
                  '独立站': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
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
              <Col span={6}>
                <div style={{ padding: '16px', background: 'linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.05) 100%)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text style={{ fontWeight: 500 }}>北美市场</Text>
                    <Text strong style={{ color: '#667eea', fontSize: 16 }}>40%</Text>
                  </div>
                  <div style={{ height: 8, background: '#e8e8e8', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: '40%', height: '100%', background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', borderRadius: 4 }} />
                  </div>
                  <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>美国、加拿大</Text>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ padding: '16px', background: 'linear-gradient(135deg, rgba(67,233,123,0.08) 0%, rgba(56,249,215,0.05) 100%)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text style={{ fontWeight: 500 }}>欧洲市场</Text>
                    <Text strong style={{ color: '#43e97b', fontSize: 16 }}>30%</Text>
                  </div>
                  <div style={{ height: 8, background: '#e8e8e8', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: '30%', height: '100%', background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', borderRadius: 4 }} />
                  </div>
                  <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>德国、英国、法国</Text>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ padding: '16px', background: 'linear-gradient(135deg, rgba(250,140,22,0.08) 0%, rgba(250,173,20,0.05) 100%)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text style={{ fontWeight: 500 }}>东南亚市场</Text>
                    <Text strong style={{ color: '#fa8c16', fontSize: 16 }}>20%</Text>
                  </div>
                  <div style={{ height: 8, background: '#e8e8e8', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: '20%', height: '100%', background: 'linear-gradient(90deg, #fa8c16 0%, #faad14 100%)', borderRadius: 4 }} />
                  </div>
                  <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>新加坡、马来西亚</Text>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ padding: '16px', background: 'linear-gradient(135deg, rgba(240,147,251,0.08) 0%, rgba(245,87,108,0.05) 100%)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text style={{ fontWeight: 500 }}>其他市场</Text>
                    <Text strong style={{ color: '#f093fb', fontSize: 16 }}>10%</Text>
                  </div>
                  <div style={{ height: 8, background: '#e8e8e8', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: '10%', height: '100%', background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)', borderRadius: 4 }} />
                  </div>
                  <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>澳大利亚、日本</Text>
                </div>
              </Col>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text strong style={{ fontSize: 14 }}>合作项目</Text>
                  <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setIsTriCenterCoopModalOpen(true)} style={{ borderRadius: 6, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', border: 'none' }}>添加项目</Button>
                </div>
                <Space direction="vertical" style={{ width: '100%' }} size={10}>
                  {['跨境电商运营培训', '平台资源对接', '品牌孵化服务'].map((text, idx) => (
                    <div key={idx} style={{ 
                      background: 'linear-gradient(135deg, rgba(67,233,123,0.08) 0%, rgba(56,249,215,0.05) 100%)', 
                      padding: '12px 16px', 
                      borderRadius: 10,
                      border: '1px solid rgba(67,233,123,0.15)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 8, height: 8, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', borderRadius: '50%' }} />
                        <Text style={{ fontWeight: 500 }}>{text}</Text>
                      </div>
                      <Space size={4}>
                        <Button type="text" size="small" icon={<EditOutlined />} onClick={() => setIsTriCenterCoopModalOpen(true)} />
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => message.success('删除成功')} />
                      </Space>
                    </div>
                  ))}
                </Space>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text strong style={{ fontSize: 14 }}>不合作原因</Text>
                  <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setIsTriCenterCoopModalOpen(true)} style={{ borderRadius: 6, background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa07a 100%)', border: 'none' }}>添加原因</Button>
                </div>
                <Space direction="vertical" style={{ width: '100%' }} size={10}>
                  {['暂无合作意向，企业自有团队较完善'].map((text, idx) => (
                    <div key={idx} style={{ 
                      background: 'linear-gradient(135deg, rgba(255,107,107,0.08) 0%, rgba(255,160,122,0.05) 100%)', 
                      padding: '12px 16px', 
                      borderRadius: 10, 
                      border: '1px solid rgba(255,107,107,0.2)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 8, height: 8, background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa07a 100%)', borderRadius: '50%' }} />
                        <Text style={{ color: '#cf1322' }}>{text}</Text>
                      </div>
                      <Space size={4}>
                        <Button type="text" size="small" icon={<EditOutlined />} onClick={() => setIsTriCenterCoopModalOpen(true)} />
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => message.success('删除成功')} />
                      </Space>
                    </div>
                  ))}
                </Space>
              </div>
            )}
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
            extra={<Button type="link" size="small" icon={<EditOutlined />} style={{ fontWeight: 500 }} onClick={() => setIsCompetitionModalOpen(true)}>编辑</Button>}
          >
            <Row gutter={16} style={{ textAlign: 'center', marginBottom: 16 }}>
              {[
                { label: '头部企业', selected: false },
                { label: '中型企业', selected: true },
                { label: '初创企业', selected: false },
              ].map((item, idx) => (
                <Col span={8} key={idx}>
                  <div style={{ 
                    padding: '16px',
                    background: item.selected ? 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.1) 100%)' : '#fafafa',
                    border: item.selected ? '2px solid #667eea' : '1px solid #f0f0f0',
                    borderRadius: 10,
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}>
                    <Text strong={item.selected} type={item.selected ? undefined : 'secondary'} style={{ color: item.selected ? '#667eea' : undefined }}>
                      {item.label} {item.selected && '✓'}
                    </Text>
                  </div>
                </Col>
              ))}
            </Row>
            <div style={{ padding: '12px 16px', background: '#fafbfc', borderRadius: 10, color: '#666', fontSize: 13 }}>
              在常州园艺制品行业处于中等偏上水平，具有一定的市场份额和品牌知名度
            </div>
          </Card>

          {/* 主要竞争对手 */}
          <Card 
            title={<span style={{ fontWeight: 600, fontSize: 15 }}>主要竞争对手</span>}
            size="small" 
            style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            headStyle={{ borderBottom: '1px solid #f5f5f5' }}
            extra={<Button type="link" size="small" icon={<EditOutlined />} style={{ fontWeight: 500 }} onClick={() => setIsCompetitorModalOpen(true)}>编辑</Button>}
          >
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              {[
                { name: 'XX园艺集团', desc: '行业龙头 | 年营收10亿+', level: '强竞争', color: '#f5222d', gradient: 'rgba(245,34,45,0.1)' },
                { name: 'YY户外用品有限公司', desc: '同规模企业 | 年营收3亿', level: '中等竞争', color: '#fa8c16', gradient: 'rgba(250,140,22,0.1)' },
                { name: 'ZZ工贸有限公司', desc: '新兴竞争者 | 年营收1亿', level: '潜在竞争', color: '#faad14', gradient: 'rgba(250,173,20,0.1)' },
              ].map((item, idx) => (
                <div key={idx} style={{ 
                  padding: '16px 20px',
                  background: '#fafbfc',
                  borderRadius: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ 
                      width: 44, 
                      height: 44, 
                      borderRadius: 12, 
                      background: `linear-gradient(135deg, ${item.gradient} 0%, transparent 100%)`,
                      border: `1px solid ${item.color}30`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ShopOutlined style={{ fontSize: 22, color: item.color }} />
                    </div>
                    <div>
                      <Text strong style={{ fontSize: 14 }}>{item.name}</Text>
                      <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{item.desc}</div>
                    </div>
                  </div>
                  <span style={{ 
                    padding: '4px 12px', 
                    background: `linear-gradient(135deg, ${item.gradient} 0%, transparent 100%)`,
                    border: `1px solid ${item.color}40`,
                    borderRadius: 20,
                    color: item.color,
                    fontSize: 12,
                    fontWeight: 500
                  }}>{item.level}</span>
                </div>
              ))}
            </Space>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* 录入时间 */}
              <div style={{ 
                textAlign: 'center',
                padding: '10px 18px',
                background: 'linear-gradient(135deg, #fafbfc 0%, #f1f5f9 100%)',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                minWidth: 100,
              }}>
                <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>录入时间</Text>
                <div style={{ fontWeight: 600, color: '#334155', marginTop: 4, fontSize: 14 }}>
                  {enterprise.created_at}
                </div>
              </div>
              
              {/* 漏斗阶段按钮 */}
              <div
                style={{
                  padding: '14px 22px',
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${stageInfo.color} 0%, ${stageInfo.color}cc 100%)`,
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: `0 6px 20px ${stageInfo.color}35`,
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  minWidth: 120,
                  justifyContent: 'center',
                }}
                onClick={() => {
                  setSelectedStage(enterprise.funnel_stage);
                  setIsStageModalOpen(true);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 25px ${stageInfo.color}45`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 6px 20px ${stageInfo.color}35`;
                }}
              >
                <span style={{ fontSize: 14 }}>{stageInfo.name}</span>
                <span style={{ opacity: 0.8, fontSize: 10 }}>▼</span>
              </div>
              
              {/* 编辑按钮 */}
              <Button 
                icon={<EditOutlined />} 
                onClick={() => openEditModal('enterprise')}
                style={{
                  height: 48,
                  paddingLeft: 20,
                  paddingRight: 20,
                  borderRadius: 12,
                  fontWeight: 500,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.25s ease',
                }}
              >
                编辑
              </Button>
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
            options={funnelStages.map(s => ({
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
                  options={funnelStages.map(s => ({ label: s.name, value: s.code }))} 
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
              <Form.Item name="industry" label="所属行业">
                <Cascader 
                  options={industryCategories} 
                  placeholder="请选择行业"
                  showSearch={{
                    filter: (inputValue, path) =>
                      path.some(option => 
                        (option.label as string).toLowerCase().includes(inputValue.toLowerCase())
                      ),
                  }}
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
              <Form.Item name="employee_scale" label="人员规模">
                <Select options={[
                  { label: '50人以下', value: '50人以下' },
                  { label: '50-200人', value: '50-200人' },
                  { label: '200-500人', value: '200-500人' },
                  { label: '500人以上', value: '500人以上' },
                ]} />
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
              <Form.Item name="domestic_revenue" label="国内营收(万元)">
                <Select placeholder="请选择" options={[
                  { label: '200以下', value: '200以下' },
                  { label: '200-500', value: '200-500' },
                  { label: '500-1000', value: '500-1000' },
                  { label: '1000-5000', value: '1000-5000' },
                  { label: '5000以上', value: '5000以上' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="crossborder_revenue" label="跨境营收(万元)">
                <Select placeholder="请选择" options={[
                  { label: '0', value: '0' },
                  { label: '200以下', value: '200以下' },
                  { label: '200-500', value: '200-500' },
                  { label: '500-1000', value: '500-1000' },
                  { label: '1000-5000', value: '1000-5000' },
                  { label: '5000以上', value: '5000以上' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="source" label="企业来源">
                <Select placeholder="请选择" options={[
                  { label: '调研', value: '调研' },
                  { label: '推荐', value: '推荐' },
                  { label: '活动', value: '活动' },
                  { label: '主动咨询', value: '主动咨询' },
                ]} />
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
              <Form.Item name="application" label="应用领域">
                <Input placeholder="如：家庭园艺、户外休闲" />
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
              <Form.Item label="外贸数据(万元)">
                <Input type="number" defaultValue={1500} />
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
          <Form.Item name="reason" label={reasonType === 'growth' ? '增长原因' : '下降原因'} rules={[{ required: true, message: '请输入原因' }]}>
            <Input.TextArea rows={3} placeholder="请输入原因" />
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
              const newItem = { name: values.name, rate: values.rate };
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
          ) : (
            <Form.Item name="name" label={tradeChangeType === 'mode' ? '模式名称' : '品类名称'} rules={[{ required: true, message: '请输入名称' }]}>
              <Input placeholder="请输入名称" />
            </Form.Item>
          )}
          <Form.Item name="rate" label="变化率" rules={[{ required: true, message: '请输入变化率' }]}>
            <Input placeholder={tradeChangeDirection === 'up' ? '例如: +25%' : '例如: -8%'} />
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
              options={[
                { label: '亚马逊', value: '亚马逊' },
                { label: '阿里国际站', value: '阿里国际站' },
                { label: 'eBay', value: 'eBay' },
                { label: 'Wish', value: 'Wish' },
                { label: 'Shopee', value: 'Shopee' },
                { label: 'Lazada', value: 'Lazada' },
                { label: 'TikTok Shop', value: 'TikTok Shop' },
                { label: '独立站', value: '独立站' },
              ]}
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
                <Input defaultValue="海运、FBA" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="支付结算方式">
                <Select defaultValue="FOB" options={[{ label: 'FOB', value: 'FOB' }, { label: 'CIF', value: 'CIF' }, { label: 'EXW', value: 'EXW' }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="跨境电商团队规模">
                <Input type="number" defaultValue={5} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="是否在用ERP">
                <Input defaultValue="是（用友U8）" />
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
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="北美市场占比(%)">
                <Input type="number" defaultValue={40} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="欧洲市场占比(%)">
                <Input type="number" defaultValue={30} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="东南亚市场占比(%)">
                <Input type="number" defaultValue={20} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="其他市场占比(%)">
                <Input type="number" defaultValue={10} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
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
              defaultValue={['跨境电商扶持资金', '外贸稳增长补贴']}
              options={[
                { label: '跨境电商扶持资金', value: '跨境电商扶持资金' },
                { label: '外贸稳增长补贴', value: '外贸稳增长补贴' },
                { label: '品牌出海补贴', value: '品牌出海补贴' },
                { label: '人才引进补贴', value: '人才引进补贴' },
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
