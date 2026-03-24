import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Tag,
  Row,
  Col,
  message,
  Popconfirm,
  Radio,
  Alert,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
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
import dayjs from 'dayjs';
import { serviceRecordApi, enterpriseApi, optionsApi } from '@/services/api';

const { Title, Text } = Typography;

interface ServiceRecord {
  id: number;
  enterpriseId: number;
  enterpriseName?: string;
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
}

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

/** 合作服务后端接口实现后改为 true，否则会请求未实现接口触发全局「系统异常」提示 */
const COOPERATION_SERVICE_BACKEND_READY = false;

export default function ServiceRecords() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paramEnterpriseId = searchParams.get('enterpriseId');

  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ServiceRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [enterprises, setEnterprises] = useState<{ id: number; name: string }[]>([]);
  const [userOptions, setUserOptions] = useState<{ label: string; value: number }[]>([]);
  const [filterType, setFilterType] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [filterEnterpriseId, setFilterEnterpriseId] = useState<number | undefined>(
    paramEnterpriseId ? Number(paramEnterpriseId) : undefined
  );
  const [form] = Form.useForm();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    if (!COOPERATION_SERVICE_BACKEND_READY) {
      setRecords([]);
      setLoading(false);
      return;
    }
    try {
      if (filterEnterpriseId) {
        const res = await serviceRecordApi.getList(filterEnterpriseId);
        const list = Array.isArray(res.data) ? res.data : res.data?.list || [];
        setRecords(list.map((r: any) => ({ ...r, enterpriseId: filterEnterpriseId })));
      } else {
        const entRes = await enterpriseApi.getList({ page: 1, pageSize: 9999 });
        const entList = entRes.data?.list || [];
        const allRecords: ServiceRecord[] = [];
        for (const ent of entList) {
          try {
            const res = await serviceRecordApi.getList(ent.id);
            const list = Array.isArray(res.data) ? res.data : res.data?.list || [];
            list.forEach((r: any) => allRecords.push({ ...r, enterpriseId: ent.id, enterpriseName: ent.name }));
          } catch { /* skip */ }
        }
        setRecords(allRecords);
      }
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [filterEnterpriseId]);

  useEffect(() => {
    fetchRecords();
    enterpriseApi.getList({ page: 1, pageSize: 9999 }).then(res => {
      const list = res.data?.list || [];
      setEnterprises(list.map((e: any) => ({ id: e.id, name: e.name })));
    }).catch(() => {});
    optionsApi.getUsers().then(res => {
      if (res.data) setUserOptions(res.data.map((u: any) => ({ label: u.label, value: u.value })));
    }).catch(() => {});
  }, [fetchRecords]);

  const filteredRecords = records.filter(r => {
    if (filterType && r.serviceType !== filterType) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'pending',
      serviceDate: dayjs(),
      enterpriseId: filterEnterpriseId,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (record: ServiceRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      serviceDate: record.serviceDate ? dayjs(record.serviceDate) : undefined,
    });
    setModalOpen(true);
  };

  const handleDelete = async (record: ServiceRecord) => {
    try {
      await serviceRecordApi.delete(record.enterpriseId, record.id);
      message.success('删除成功');
      fetchRecords();
    } catch {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const entId = values.enterpriseId || filterEnterpriseId;
      if (!entId) {
        message.error('请选择企业');
        setSubmitting(false);
        return;
      }
      const payload = { ...values, serviceDate: values.serviceDate?.format('YYYY-MM-DD') };
      delete payload.enterpriseId;

      if (editingRecord) {
        await serviceRecordApi.update(entId, editingRecord.id, payload);
        message.success('更新成功');
      } else {
        await serviceRecordApi.create(entId, payload);
        message.success('创建成功');
      }
      setModalOpen(false);
      form.resetFields();
      fetchRecords();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
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
      width: 120,
      render: (_: unknown, record: ServiceRecord) => (
        <Space size={4}>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined style={{ color: '#396AFF' }} />}
            onClick={() => navigate(`/enterprise/${record.enterpriseId}`)}
            style={{ borderRadius: 6 }}
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined style={{ color: '#16DBCC' }} />}
            onClick={() => handleOpenEdit(record)}
            style={{ borderRadius: 6 }}
          />
          <Popconfirm
            title="确定删除这条服务记录吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 6 }} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#F5F7FA', minHeight: '100%', padding: 24, fontFamily: 'Inter, sans-serif' }}>
      {!COOPERATION_SERVICE_BACKEND_READY && (
        <Alert
          type="info"
          showIcon
          message="该模块还没开发完成"
          description="合作服务相关功能正在开发中，列表与新增等服务暂不可用。"
          style={{ marginBottom: 16, borderRadius: 12 }}
        />
      )}
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
        <Tooltip title={!COOPERATION_SERVICE_BACKEND_READY ? '该模块还没开发完成' : undefined}>
          <span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenAdd}
              disabled={!COOPERATION_SERVICE_BACKEND_READY}
              style={{
                borderRadius: 12,
                height: 40,
                fontWeight: 500,
                background: '#396AFF',
                border: 'none',
              }}
            >
              新增服务
            </Button>
          </span>
        </Tooltip>
      </div>

      {/* 筛选与状态切换栏 */}
      <div data-tour="service-toolbar">
        <Card style={{ marginBottom: 16, borderRadius: 25, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', background: '#FFFFFF' }} styles={{ body: { padding: '16px 24px' } }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <Radio.Group
              value={filterStatus || 'all'}
              onChange={e => setFilterStatus(e.target.value === 'all' ? undefined : e.target.value)}
              optionType="button"
              buttonStyle="solid"
              style={{ borderRadius: 12 }}
            >
              <Radio.Button value="all">
                全部服务 <span style={{ opacity: 0.8, marginLeft: 4 }}>{records.filter(r => filterType ? r.serviceType === filterType : true).length}</span>
              </Radio.Button>
              <Radio.Button value="pending">
                待启动 <span style={{ opacity: 0.8, marginLeft: 4 }}>{records.filter(r => r.status === 'pending' && (filterType ? r.serviceType === filterType : true)).length}</span>
              </Radio.Button>
              <Radio.Button value="in_progress">
                进行中 <span style={{ opacity: 0.8, marginLeft: 4 }}>{records.filter(r => r.status === 'in_progress' && (filterType ? r.serviceType === filterType : true)).length}</span>
              </Radio.Button>
              <Radio.Button value="completed">
                已完成 <span style={{ opacity: 0.8, marginLeft: 4 }}>{records.filter(r => r.status === 'completed' && (filterType ? r.serviceType === filterType : true)).length}</span>
              </Radio.Button>
            </Radio.Group>
            
            <Space wrap size={16}>
              <Select
                placeholder="按企业筛选"
                style={{ width: 220, borderRadius: 12, background: '#F5F7FA', border: 'none' }}
                allowClear
                showSearch
                optionFilterProp="label"
                value={filterEnterpriseId}
                onChange={(v) => setFilterEnterpriseId(v)}
                options={enterprises.map(e => ({ label: e.name, value: e.id }))}
              />
              <Select
                placeholder="服务类型"
                style={{ width: 150, borderRadius: 12, background: '#F5F7FA', border: 'none' }}
                allowClear
                value={filterType}
                onChange={setFilterType}
                options={SERVICE_TYPES.map(t => ({ label: t.label, value: t.value }))}
              />
            </Space>
          </div>
        </Card>
      </div>

      {/* 列表 */}
      <div data-tour="service-table">
        <Card style={{ borderRadius: 25, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', background: '#FFFFFF' }} styles={{ body: { padding: '8px 0' } }}>
          {filteredRecords.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredRecords}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showTotal: (total) => (
                  <span style={{ color: '#718EBF' }}>
                    共 <span style={{ color: '#396AFF', fontWeight: 600 }}>{total}</span> 条记录，涉及 <span style={{ color: '#FFBB38', fontWeight: 600 }}>{new Set(filteredRecords.map(r => r.enterpriseId)).size}</span> 家企业
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
                    {!record.contractNo && !record.description && !record.result && <Text type="secondary">暂无详细信息</Text>}
                  </div>
                ),
                rowExpandable: () => true,
              }}
              rowClassName={() => 'custom-table-row'}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <CustomerServiceOutlined style={{ fontSize: 48, color: '#718EBF', marginBottom: 16, display: 'block' }} />
              <Text type="secondary" style={{ fontSize: 15, color: '#718EBF' }}>
                {COOPERATION_SERVICE_BACKEND_READY ? '暂无合作服务记录' : '该模块还没开发完成'}
              </Text>
              <br />
              {COOPERATION_SERVICE_BACKEND_READY ? (
                <Button type="link" icon={<PlusOutlined />} onClick={handleOpenAdd} style={{ marginTop: 8, color: '#396AFF', fontWeight: 500 }}>
                  添加第一条服务记录
                </Button>
              ) : (
                <Button type="link" disabled style={{ marginTop: 8, color: '#bfbfbf', fontWeight: 500, cursor: 'not-allowed' }}>
                  添加第一条服务记录
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#343C6A' }}>
            <CustomerServiceOutlined style={{ color: '#396AFF' }} />
            <span>{editingRecord ? '编辑服务记录' : '新增服务记录'}</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        width={700}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => { setModalOpen(false); form.resetFields(); }} style={{ borderRadius: 12 }}>取消</Button>
            <Button type="primary" loading={submitting} onClick={handleSubmit} style={{ background: '#396AFF', border: 'none', borderRadius: 12 }}>
              {editingRecord ? '保存修改' : '创建记录'}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            {!filterEnterpriseId && (
              <Col span={24}>
                <Form.Item name="enterpriseId" label="所属企业" rules={[{ required: true, message: '请选择企业' }]}>
                  <Select placeholder="搜索并选择企业" showSearch optionFilterProp="label" options={enterprises.map(e => ({ label: e.name, value: e.id }))} style={{ borderRadius: 12, background: '#F5F7FA', border: 'none' }} />
                </Form.Item>
              </Col>
            )}
            <Col span={12}>
              <Form.Item name="serviceType" label="服务类型" rules={[{ required: true, message: '请选择服务类型' }]}>
                <Select placeholder="请选择" options={SERVICE_TYPES.map(t => ({
                  label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: t.color }}>{t.icon}</span>{t.label}</span>,
                  value: t.value,
                }))} style={{ borderRadius: 12, background: '#F5F7FA', border: 'none' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="serviceName" label="服务名称" rules={[{ required: true, message: '请输入服务名称' }]}>
                <Input placeholder="如：亚马逊运营培训班（第3期）" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="serviceDate" label="服务日期" rules={[{ required: true, message: '请选择日期' }]}>
                <DatePicker style={{ width: '100%', borderRadius: 12, background: '#F5F7FA', border: 'none' }} placeholder="选择日期" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="服务状态" rules={[{ required: true, message: '请选择状态' }]}>
                <Select placeholder="请选择" options={SERVICE_STATUSES.map(s => ({
                  label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: s.color }}>{s.icon}</span>{s.label}</span>,
                  value: s.value,
                }))} style={{ borderRadius: 12, background: '#F5F7FA', border: 'none' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="responsibleId" label="负责人">
                <Select placeholder="请选择对接人" allowClear showSearch optionFilterProp="label" options={userOptions} style={{ borderRadius: 12, background: '#F5F7FA', border: 'none' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contractNo" label="合同/协议编号">
                <Input placeholder="如有签约则填写" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="服务内容描述">
                <Input.TextArea rows={3} placeholder="详细描述本次服务内容" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="result" label="服务成果/备注">
                <Input.TextArea rows={2} placeholder="成果描述、后续跟进计划" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="stageTo" label="关联变更漏斗阶段（可选）">
                <Select placeholder="如需同步变更企业阶段，请选择" allowClear options={FUNNEL_STAGES.map(s => ({
                  label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: s.color }} />{s.name}
                  </span>,
                  value: s.code,
                }))} style={{ borderRadius: 12, background: '#F5F7FA', border: 'none' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
