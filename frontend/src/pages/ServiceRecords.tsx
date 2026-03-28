import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Select,
  Tag,
  Radio,
} from 'antd';
import {
  CustomerServiceOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  StopOutlined,
  TeamOutlined,
  BankOutlined,
  RocketOutlined,
  ShopOutlined,
  TrophyOutlined,
  DollarOutlined,
  AppstoreOutlined,
  BookOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { serviceRecordApi, enterpriseApi, optionsApi } from '@/services/api';

const { Title, Text } = Typography;

interface ServiceRecord {
  id: number;
  enterpriseId: number;
  enterpriseName?: string;
  providerId?: number;
  providerName?: string;
  serviceType: string;
  serviceName: string;
  serviceDate: string;
  status: string;
  responsibleId?: number;
  responsibleName?: string;
  contractNo?: string;
  description?: string;
  result?: string;
  stageFrom?: string;
  stageTo?: string;
  projectLevel?: string;
  feasibilityScore?: number;
  assessmentData?: Record<string, number>;
}

const ASSESSMENT_DIMENSIONS = [
  { key: 'scale', label: '企业规模与基础', weight: 0.15, desc: '营收规模、人员规模、外贸基础' },
  { key: 'willingness', label: '合作意愿', weight: 0.2, desc: '决策层支持度、投入意愿、紧迫性' },
  { key: 'cooperation', label: '企业配合度', weight: 0.15, desc: '响应速度、资料完整度、对接人稳定性' },
  { key: 'marketFit', label: '产品市场匹配度', weight: 0.25, desc: '海外需求、认证合规、竞争优势' },
  { key: 'resourceFit', label: '资源匹配度', weight: 0.15, desc: '三中心服务能力、服务商资源、政策支持' },
  { key: 'riskControl', label: '风险可控度', weight: 0.1, desc: '知识产权、供应链、合规风险' },
];

const PROJECT_LEVELS = [
  { code: 'S', label: 'S-重点孵化', color: '#7B61FF', desc: '孵化中心主导，专属导师团队' },
  { code: 'A', label: 'A-商业化合作', color: '#396AFF', desc: '服务中心主导，匹配付费服务商' },
  { code: 'B', label: 'B-普惠服务', color: '#16DBCC', desc: '标准化公共服务，批量覆盖' },
  { code: 'C', label: 'C-培育观察', color: '#718EBF', desc: '纳入企业池，定期回访' },
];


const SERVICE_TYPES = [
  { value: 'training', label: '培训与赋能', icon: <BookOutlined />, color: '#396AFF' },
  { value: 'policy', label: '政策对接', icon: <BankOutlined />, color: '#16DBCC' },
  { value: 'incubation', label: '孵化与辅导', icon: <RocketOutlined />, color: '#FFBB38' },
  { value: 'platform', label: '平台资源对接', icon: <AppstoreOutlined />, color: '#396AFF' },
  { value: 'settlement', label: '招商入驻', icon: <ShopOutlined />, color: '#7B61FF' },
  { value: 'activity', label: '活动与展会', icon: <TrophyOutlined />, color: '#FE5C73' },
  { value: 'finance', label: '金融与资金', icon: <DollarOutlined />, color: '#FFBB38' },
  { value: 'other', label: '其他服务', icon: <CustomerServiceOutlined />, color: '#718EBF' },
];

const SERVICE_STATUSES = [
  { value: 'pending', label: '待启动', color: '#FFBB38', icon: <ClockCircleOutlined /> },
  { value: 'in_progress', label: '进行中', color: '#396AFF', icon: <SyncOutlined spin /> },
  { value: 'completed', label: '已完成', color: '#16DBCC', icon: <CheckCircleOutlined /> },
  { value: 'terminated', label: '已终止', color: '#FE5C73', icon: <StopOutlined /> },
];

const FUNNEL_STAGES = [
  { code: 'POTENTIAL', name: '潜在企业', color: '#718EBF' },
  { code: 'NO_DEMAND', name: '无明确需求', color: '#FFBB38' },
  { code: 'NO_INTENTION', name: '没有合作意向', color: '#FE5C73' },
  { code: 'HAS_DEMAND', name: '有明确需求', color: '#396AFF' },
  { code: 'SIGNED', name: '已签约', color: '#7B61FF' },
  { code: 'SETTLED', name: '已入驻', color: '#16DBCC' },
  { code: 'INCUBATING', name: '重点孵化', color: '#FFBB38' },
];

const getServiceTypeInfo = (type: string) =>
  SERVICE_TYPES.find(t => t.value === type) || SERVICE_TYPES[SERVICE_TYPES.length - 1];

const getStatusInfo = (status: string) =>
  SERVICE_STATUSES.find(s => s.value === status) || SERVICE_STATUSES[0];

export default function ServiceRecords() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paramEnterpriseId = searchParams.get('enterpriseId');

  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [enterprises, setEnterprises] = useState<{ id: number; name: string }[]>([]);
  const [providerOptions, setProviderOptions] = useState<{ label: string; value: number }[]>([]);
  const [filterType, setFilterType] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [filterProviderId, setFilterProviderId] = useState<number | undefined>();
  const [filterEnterpriseId, setFilterEnterpriseId] = useState<number | undefined>(
    paramEnterpriseId ? Number(paramEnterpriseId) : undefined
  );
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await serviceRecordApi.getGlobalList({
        page: currentPage,
        pageSize,
        enterpriseId: filterEnterpriseId,
        providerId: filterProviderId,
        serviceType: filterType,
        status: filterStatus,
      });
      const data = res.data;
      setRecords(data?.list || []);
      setTotal(data?.total || 0);
    } catch {
      setRecords([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filterEnterpriseId, filterProviderId, filterType, filterStatus]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    enterpriseApi.getList({ page: 1, pageSize: 9999 }).then(res => {
      const list = res.data?.list || [];
      setEnterprises(list.map((e: any) => ({ id: e.id, name: e.name })));
    }).catch(() => {});
    optionsApi.getProviders().then(res => {
      if (res.data) setProviderOptions(res.data.map((p: any) => ({ label: p.label, value: Number(p.value) })));
    }).catch(() => {});
  }, []);

  const handleFilterChange = (setter: (v: any) => void) => (v: any) => {
    setter(v);
    setCurrentPage(1);
  };

  const currentEnterprise = filterEnterpriseId
    ? enterprises.find(e => e.id === filterEnterpriseId)
    : null;

  const columns: ColumnsType<ServiceRecord> = [
    ...(!filterEnterpriseId ? [{
      title: '企业名称',
      dataIndex: 'enterpriseName',
      key: 'enterpriseName',
      width: 180,
      ellipsis: true,
      render: (name: string, record: ServiceRecord) => (
        <Button
          type="link"
          size="small"
          style={{ padding: 0, fontWeight: 500, color: '#343C6A' }}
          onClick={() => navigate(`/enterprise/${record.enterpriseId}`)}
        >
          {name || '-'}
        </Button>
      ),
    }] : []) as ColumnsType<ServiceRecord>,
    {
      title: '服务类型',
      dataIndex: 'serviceType',
      key: 'serviceType',
      width: 140,
      render: (type: string) => {
        const info = getServiceTypeInfo(type);
        return (
          <Tag
            icon={info.icon}
            style={{
              background: `${info.color}14`,
              color: info.color,
              border: `1px solid ${info.color}30`,
              borderRadius: 6,
              padding: '2px 10px',
              fontWeight: 500,
              fontSize: 12,
            }}
          >
            {info.label}
          </Tag>
        );
      },
    },
    {
      title: '服务名称',
      dataIndex: 'serviceName',
      key: 'serviceName',
      ellipsis: true,
      render: (text: string) => <span style={{ fontWeight: 500, color: '#343C6A' }}>{text}</span>,
    },
    {
      title: '服务日期',
      dataIndex: 'serviceDate',
      key: 'serviceDate',
      width: 120,
      sorter: (a, b) => (a.serviceDate || '').localeCompare(b.serviceDate || ''),
      defaultSortOrder: 'descend',
      render: (date: string) => (
        <span style={{ fontSize: 13, color: '#718EBF' }}>
          <CalendarOutlined style={{ marginRight: 4 }} />{date || '-'}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: string) => {
        const info = getStatusInfo(status);
        return (
          <Tag
            icon={info.icon}
            style={{
              background: `${info.color}14`,
              color: info.color,
              border: `1px solid ${info.color}30`,
              borderRadius: 20,
              padding: '2px 10px',
              fontWeight: 500,
              fontSize: 12,
            }}
          >
            {info.label}
          </Tag>
        );
      },
    },
    {
      title: '项目级别',
      dataIndex: 'projectLevel',
      key: 'projectLevel',
      width: 130,
      render: (level: string, rec: ServiceRecord) => {
        if (!level) return <span style={{ color: '#bfbfbf', fontSize: 12 }}>未评估</span>;
        const info = PROJECT_LEVELS.find(l => l.code === level) || PROJECT_LEVELS[3];
        return (
          <Tag
            style={{
              background: `${info.color}14`,
              color: info.color,
              border: `1px solid ${info.color}30`,
              borderRadius: 6,
              padding: '2px 8px',
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            {info.label}{rec.feasibilityScore ? ` ${rec.feasibilityScore}` : ''}
          </Tag>
        );
      },
    },
    {
      title: '服务商',
      dataIndex: 'providerName',
      key: 'providerName',
      width: 140,
      ellipsis: true,
      render: (name: string) => (
        <span style={{ color: name ? '#343C6A' : '#bfbfbf', fontSize: 13 }}>
          {name || '-'}
        </span>
      ),
    },
    {
      title: '负责人',
      dataIndex: 'responsibleName',
      key: 'responsibleName',
      width: 90,
      render: (name: string) => (
        <span style={{ color: '#718EBF', fontSize: 13 }}>
          {name ? <><TeamOutlined style={{ marginRight: 4, color: '#396AFF' }} />{name}</> : '-'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: ServiceRecord) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined style={{ color: '#396AFF' }} />}
          aria-label="打开企业合作标签页"
          onClick={() => navigate(`/enterprise/${record.enterpriseId}?tab=cooperation`)}
          style={{ borderRadius: 6 }}
        />
      ),
    },
  ];

  return (
    <div style={{ background: '#F5F7FA', minHeight: '100%', padding: 24, fontFamily: 'Inter, sans-serif' }}>
      {/* 页面标题 */}
      <div data-tour="service-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: '0 4px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {paramEnterpriseId && (
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(`/enterprise/${paramEnterpriseId}`)}
                style={{ borderRadius: 12 }}
              >
                返回企业详情
              </Button>
            )}
            <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#343C6A' }}>合作服务档案</Title>
          </div>
          <Text type="secondary" style={{ color: '#718EBF' }}>
            {currentEnterprise
              ? `${currentEnterprise.name} — 合作与服务历史记录`
              : '管理所有企业与三中心的合作服务记录'}
          </Text>
        </div>
        <div />
      </div>

      {/* 筛选与状态切换栏 */}
      <div data-tour="service-toolbar">
        <Card style={{ marginBottom: 16, borderRadius: 25, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', background: '#FFFFFF' }} styles={{ body: { padding: '16px 24px' } }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <Radio.Group
              value={filterStatus || 'all'}
              onChange={e => { handleFilterChange(setFilterStatus)(e.target.value === 'all' ? undefined : e.target.value); }}
              optionType="button"
              buttonStyle="solid"
              style={{ borderRadius: 12 }}
            >
              <Radio.Button value="all">全部服务</Radio.Button>
              <Radio.Button value="pending">待启动</Radio.Button>
              <Radio.Button value="in_progress">进行中</Radio.Button>
              <Radio.Button value="completed">已完成</Radio.Button>
            </Radio.Group>
            
            <Space wrap size={16}>
              <Select
                placeholder="按企业筛选"
                style={{ width: 200, borderRadius: 12, background: '#F5F7FA', border: 'none' }}
                allowClear
                showSearch
                optionFilterProp="label"
                value={filterEnterpriseId}
                onChange={handleFilterChange(setFilterEnterpriseId)}
                options={enterprises.map(e => ({ label: e.name, value: e.id }))}
              />
              <Select
                placeholder="服务商"
                style={{ width: 180, borderRadius: 12, background: '#F5F7FA', border: 'none' }}
                allowClear
                showSearch
                optionFilterProp="label"
                value={filterProviderId}
                onChange={handleFilterChange(setFilterProviderId)}
                options={providerOptions}
              />
              <Select
                placeholder="服务类型"
                style={{ width: 150, borderRadius: 12, background: '#F5F7FA', border: 'none' }}
                allowClear
                value={filterType}
                onChange={handleFilterChange(setFilterType)}
                options={SERVICE_TYPES.map(t => ({ label: t.label, value: t.value }))}
              />
            </Space>
          </div>
        </Card>
      </div>

      {/* 列表 */}
      <div data-tour="service-table">
        <Card style={{ borderRadius: 25, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', background: '#FFFFFF' }} styles={{ body: { padding: '8px 0' } }}>
          {records.length > 0 ? (
            <Table
              columns={columns}
              dataSource={records}
              rowKey="id"
              loading={loading}
              pagination={{
                current: currentPage,
                pageSize,
                total,
                onChange: (p, ps) => { setCurrentPage(p); setPageSize(ps); },
                showTotal: (t) => (
                  <span style={{ color: '#718EBF' }}>
                    共 <span style={{ color: '#396AFF', fontWeight: 600 }}>{t}</span> 条记录
                  </span>
                ),
                showSizeChanger: true,
                style: { padding: '16px 24px' },
              }}
              expandable={{
                expandedRowRender: (record) => (
                  <div style={{ padding: '8px 16px', color: '#718EBF', fontSize: 13, lineHeight: 1.8 }}>
                    {record.contractNo && <div><Text type="secondary">合同编号：</Text>{record.contractNo}</div>}
                    {record.description && <div><Text type="secondary">服务内容：</Text>{record.description}</div>}
                    {record.result && <div><Text type="secondary">服务成果：</Text>{record.result}</div>}
                    {record.stageFrom && record.stageTo && record.stageFrom !== record.stageTo && (
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary">阶段变更：</Text>
                        <Tag color={FUNNEL_STAGES.find(s => s.code === record.stageFrom)?.color}>
                          {FUNNEL_STAGES.find(s => s.code === record.stageFrom)?.name || record.stageFrom}
                        </Tag>
                        <span style={{ margin: '0 4px', color: '#718EBF' }}>→</span>
                        <Tag color={FUNNEL_STAGES.find(s => s.code === record.stageTo)?.color}>
                          {FUNNEL_STAGES.find(s => s.code === record.stageTo)?.name || record.stageTo}
                        </Tag>
                      </div>
                    )}
                    {record.projectLevel && record.assessmentData && (
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary">可行性评估：</Text>
                        {ASSESSMENT_DIMENSIONS.map(dim => {
                          const score = (record.assessmentData as Record<string, number>)?.[dim.key];
                          return score ? (
                            <Tag key={dim.key} style={{ margin: '2px 4px', fontSize: 11 }}>{dim.label}: {score}分</Tag>
                          ) : null;
                        })}
                      </div>
                    )}
                    {!record.contractNo && !record.description && !record.result && !record.projectLevel && <Text type="secondary">暂无详细信息</Text>}
                  </div>
                ),
                rowExpandable: () => true,
              }}
              rowClassName={() => 'custom-table-row'}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <CustomerServiceOutlined style={{ fontSize: 48, color: '#718EBF', marginBottom: 16, display: 'block' }} />
              <Text type="secondary" style={{ fontSize: 15, color: '#718EBF' }}>暂无合作服务记录</Text>
            </div>
          )}
        </Card>
      </div>

    </div>
  );
}
