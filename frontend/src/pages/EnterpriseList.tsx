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
  Spin,
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
} from '@ant-design/icons';
import { Upload, Tabs, Badge } from 'antd';
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
import { enterpriseApi, optionsApi, dashboardApi } from '@/services/api';
import type { Enterprise } from '@/types';

const { Title, Text } = Typography;

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
  const [industryFilter, setIndustryFilter] = useState<string>('');
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});
  const [isCreating, setIsCreating] = useState(false);
  
  // API数据状态
  const [loading, setLoading] = useState(true);
  const [enterprises, setEnterprises] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [districts, setDistricts] = useState<string[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);
  const [funnelStats, setFunnelStats] = useState<any[]>([]);
  
  // 加载企业列表
  const fetchEnterprises = async () => {
    setLoading(true);
    try {
      const response = await enterpriseApi.getList({
        page,
        pageSize,
        keyword: searchTerm || undefined,
        stage: stageFilter || undefined,
        district: districtFilter || undefined,
        industryId: industryFilter ? Number(industryFilter) : undefined,
      });
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
          main_platforms: item.crossBorderPlatforms,
          target_markets: item.targetMarkets,
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
      const [districtRes, industryRes, funnelRes] = await Promise.all([
        optionsApi.getOptions('district'),
        optionsApi.getIndustries(),
        dashboardApi.getFunnelStats(),
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
  }, []);
  
  useEffect(() => {
    fetchEnterprises();
  }, [page, pageSize]);
  
  // 搜索
  const handleSearch = () => {
    setPage(1);
    fetchEnterprises();
  };
  
  // 计算已应用的筛选条件数量
  const activeFilterCount = Object.values(advancedFilters).filter(v => 
    v !== undefined && v !== null && v !== '' && 
    !(Array.isArray(v) && v.length === 0)
  ).length;

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
    setAdvancedFilters(values);
    setIsFilterModalOpen(false);
    message.success('筛选条件已应用');
  };
  
  // 重置高级筛选
  const handleResetFilters = () => {
    filterForm.resetFields();
    setAdvancedFilters({});
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
        bodyStyle={{ padding: '20px 24px' }}
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
            value={industryFilter || undefined}
            onChange={(value) => setIndustryFilter(value || '')}
            options={industries.map(i => ({ label: i, value: i }))}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
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
        bodyStyle={{ padding: '8px 0' }}
      >
        <Table
          columns={columns}
          dataSource={filteredEnterprises}
          rowKey="id"
          pagination={{
            total: filteredEnterprises.length,
            pageSize: 10,
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
              bodyStyle={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 'calc(100% - 57px)' }}
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
        title="导入企业数据"
        open={isImportModalOpen}
        onOk={() => {
          message.success('导入成功');
          setIsImportModalOpen(false);
        }}
        onCancel={() => setIsImportModalOpen(false)}
        okText="开始导入"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">支持 Excel (.xlsx, .xls) 格式文件，请按照模板格式上传</Text>
        </div>
        <Upload.Dragger
          name="file"
          multiple={false}
          accept=".xlsx,.xls"
          beforeUpload={() => false}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">支持 .xlsx, .xls 格式</p>
        </Upload.Dragger>
        <Button type="link" style={{ padding: 0, marginTop: 8 }}>下载导入模板</Button>
      </Modal>

      <Modal
        title="导出企业数据"
        open={isExportModalOpen}
        onOk={() => {
          message.success('导出成功，文件已下载');
          setIsExportModalOpen(false);
        }}
        onCancel={() => setIsExportModalOpen(false)}
        okText="确认导出"
        cancelText="取消"
      >
        <div style={{ padding: '16px 0' }}>
          <Text>将导出当前筛选条件下的 <Text strong>{filteredEnterprises.length}</Text> 条企业数据</Text>
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">导出格式：Excel (.xlsx)</Text>
          </div>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">导出字段：企业名称、区域、行业、类型、漏斗阶段、联系人、联系电话、对接人等</Text>
          </div>
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
                        <Select placeholder="请选择" allowClear options={EMPLOYEE_SCALES.map(s => ({ label: s, value: s }))} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="domestic_revenue" label="国内营收(万元)">
                        <Select placeholder="请选择" allowClear options={REVENUE_SCALES.map(r => ({ label: r, value: r }))} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="crossborder_revenue" label="跨境营收(万元)">
                        <Select placeholder="请选择" allowClear options={REVENUE_SCALES.map(r => ({ label: r, value: r }))} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="source" label="企业来源">
                        <Select placeholder="请选择" allowClear options={ENTERPRISE_SOURCES.map(s => ({ label: s, value: s }))} />
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
                          options={[
                            { label: '全自动化', value: '全自动化' },
                            { label: '半自动化', value: '半自动化' },
                            { label: '手工为主', value: '手工为主' },
                          ]} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="logistics_partners" label="物流合作方">
                        <Select 
                          mode="multiple"
                          placeholder="请选择" 
                          allowClear
                          options={[
                            { label: '顺丰', value: '顺丰' },
                            { label: '德邦', value: '德邦' },
                            { label: '京东物流', value: '京东物流' },
                            { label: '菜鸟', value: '菜鸟' },
                            { label: 'DHL', value: 'DHL' },
                            { label: 'FedEx', value: 'FedEx' },
                            { label: 'UPS', value: 'UPS' },
                            { label: '其他', value: '其他' },
                          ]} 
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
                            { label: 'OEM代工', value: 'OEM代工' },
                            { label: 'ODM贴牌', value: 'ODM贴牌' },
                            { label: 'OBM自主品牌', value: 'OBM自主品牌' },
                            { label: '一般贸易', value: '一般贸易' },
                            { label: '跨境电商', value: '跨境电商' },
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
    </div>
  );
}

export default EnterpriseList;
