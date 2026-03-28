import { useState, useEffect } from 'react';
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
  Tag,
  TreeSelect,
  message,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { providerApi, optionsApi } from '@/services/api';
import { requirements } from '@/data/requirementsData';

function buildRequirementTree() {
  const phaseMap = new Map<string, Map<string, { id: string; name: string }[]>>();
  for (const r of requirements) {
    if (!phaseMap.has(r.phase)) phaseMap.set(r.phase, new Map());
    const catMap = phaseMap.get(r.phase)!;
    if (!catMap.has(r.category)) catMap.set(r.category, []);
    catMap.get(r.category)!.push(r);
  }
  return Array.from(phaseMap.entries()).map(([phase, catMap]) => ({
    title: phase,
    value: `phase_${phase}`,
    selectable: false,
    children: Array.from(catMap.entries()).map(([cat, items]) => ({
      title: cat,
      value: `cat_${phase}_${cat}`,
      selectable: false,
      children: items.map(item => ({
        title: `${item.id} ${item.name}`,
        value: item.id,
      })),
    })),
  }));
}

const requirementTreeData = buildRequirementTree();

const COOPERATION_STATUS_MAP: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: '合作中', color: 'green' },
  SUSPENDED: { label: '已暂停', color: 'orange' },
  TERMINATED: { label: '已终止', color: 'red' },
};

type SelectOption = { label: string; value: number | string };

interface ProviderRecord {
  id: number;
  name: string;
  category: string;
  categoryName?: string;
  district?: string;
  cooperationStatus?: string;
  cooperationStartDate?: string;
  contractEndDate?: string;
  serviceRating?: number;
  totalServiceCount?: number;
  totalServedEnterprises?: number;
  primaryContactName?: string;
  primaryContactPhone?: string;
  capabilityRequirementIds?: string[];
  createdAt?: string;
}

function ProviderList() {
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<ProviderRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [districtFilter, setDistrictFilter] = useState<string>('');

  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form] = Form.useForm();

  const fetchProviders = async (p = page, ps = pageSize) => {
    setLoading(true);
    try {
      const response = await providerApi.getList({
        page: p,
        pageSize: ps,
        keyword: searchTerm || undefined,
        category: categoryFilter || undefined,
        cooperationStatus: statusFilter || undefined,
        district: districtFilter || undefined,
      });
      const data = (response as any)?.data ?? response;
      setProviders(data?.list || []);
      setTotal(data?.total || 0);
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [catRes, distRes] = await Promise.all([
        optionsApi.getOptions('provider_category'),
        optionsApi.getOptions('district'),
      ]);
      if ((catRes as any)?.data) {
        setCategoryOptions((catRes as any).data.map((d: any) => ({ label: d.label, value: d.value ?? String(d.id) })));
      }
      if ((distRes as any)?.data) {
        setDistrictOptions((distRes as any).data.map((d: any) => d.label));
      }
    } catch (error) {
      console.error('Failed to fetch options:', error);
    }
  };

  useEffect(() => {
    fetchOptions();
    fetchProviders(1, pageSize);
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchProviders(1, pageSize);
  };

  const handleCreate = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = async (record: ProviderRecord) => {
    setEditingId(record.id);
    try {
      const res = await providerApi.getDetail(record.id);
      const detail = (res as any)?.data ?? res;
      form.setFieldsValue({
        name: detail.name,
        category: detail.category,
        cooperationStatus: detail.cooperationStatus,
        description: detail.description,
        capabilityRequirementIds: detail.capabilityRequirementIds || [],
      });
    } catch {
      form.setFieldsValue({
        name: record.name,
        category: record.category,
        cooperationStatus: record.cooperationStatus,
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (record: ProviderRecord) => {
    Modal.confirm({
      title: '删除确认',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除服务商「${record.name}」吗？`,
      okText: '确定删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await providerApi.delete(record.id);
          message.success('删除成功');
          fetchProviders();
        } catch {
          message.error('删除失败');
        }
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setIsCreating(true);
      if (editingId) {
        await providerApi.update(editingId, values);
        message.success('更新成功');
      } else {
        await providerApi.create(values);
        message.success('创建成功');
      }
      setIsModalOpen(false);
      fetchProviders();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(editingId ? '更新失败' : '创建失败');
    } finally {
      setIsCreating(false);
    }
  };

  const columns: ColumnsType<ProviderRecord> = [
    {
      title: '服务商名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: '服务分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 120,
      render: (text: string, record: ProviderRecord) => text || record.category || '-',
    },
    {
      title: '所属区域',
      dataIndex: 'district',
      key: 'district',
      width: 100,
      render: (text: string) => text || '-',
    },
    {
      title: '合作状态',
      dataIndex: 'cooperationStatus',
      key: 'cooperationStatus',
      width: 100,
      render: (status: string) => {
        const cfg = COOPERATION_STATUS_MAP[status];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : <span style={{ color: '#999' }}>-</span>;
      },
    },
    {
      title: '主要联系人',
      key: 'contact',
      width: 150,
      render: (_: unknown, record: ProviderRecord) => (
        <div>
          <div>{record.primaryContactName || '-'}</div>
          {record.primaryContactPhone && (
            <div style={{ fontSize: 12, color: '#999' }}>{record.primaryContactPhone}</div>
          )}
        </div>
      ),
    },
    {
      title: '服务评分',
      dataIndex: 'serviceRating',
      key: 'serviceRating',
      width: 90,
      align: 'center',
      render: (val: number) => (val != null ? val.toFixed(1) : '-'),
    },
    {
      title: '服务次数',
      dataIndex: 'totalServiceCount',
      key: 'totalServiceCount',
      width: 90,
      align: 'center',
      render: (val: number) => val ?? '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_: unknown, record: ProviderRecord) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 搜索筛选栏 */}
      <Card style={{ marginBottom: 16, borderRadius: 12 }} bodyStyle={{ padding: '16px 24px' }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space wrap size="middle">
              <Input
                placeholder="搜索服务商名称"
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onPressEnter={handleSearch}
                style={{ width: 220 }}
                allowClear
              />
              <Select
                placeholder="服务分类"
                value={categoryFilter || undefined}
                onChange={v => { setCategoryFilter(v || ''); setPage(1); setTimeout(() => fetchProviders(1, pageSize), 0); }}
                allowClear
                style={{ width: 150 }}
                options={categoryOptions.map(o => ({ label: o.label, value: o.value }))}
              />
              <Select
                placeholder="合作状态"
                value={statusFilter || undefined}
                onChange={v => { setStatusFilter(v || ''); setPage(1); setTimeout(() => fetchProviders(1, pageSize), 0); }}
                allowClear
                style={{ width: 130 }}
                options={Object.entries(COOPERATION_STATUS_MAP).map(([k, v]) => ({ label: v.label, value: k }))}
              />
              <Select
                placeholder="所属区域"
                value={districtFilter || undefined}
                onChange={v => { setDistrictFilter(v || ''); setPage(1); setTimeout(() => fetchProviders(1, pageSize), 0); }}
                allowClear
                style={{ width: 130 }}
                options={districtOptions.map(d => ({ label: d, value: d }))}
              />
            </Space>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              新增服务商
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 表格 */}
      <Card style={{ borderRadius: 12 }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={providers}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: t => `共 ${t} 条`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); fetchProviders(p, ps); },
          }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingId ? '编辑服务商' : '新增服务商'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={isCreating}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="服务商名称" rules={[{ required: true, message: '请输入服务商名称' }]}>
            <Input placeholder="请输入服务商名称" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="服务分类" rules={[{ required: true, message: '请选择服务分类' }]}>
                <Select placeholder="请选择" options={categoryOptions.map(o => ({ label: o.label, value: o.value }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="cooperationStatus" label="合作状态">
                <Select
                  placeholder="请选择"
                  allowClear
                  options={Object.entries(COOPERATION_STATUS_MAP).map(([k, v]) => ({ label: v.label, value: k }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="capabilityRequirementIds" label="需求能力">
            <TreeSelect
              treeData={requirementTreeData}
              multiple
              treeCheckable
              showCheckedStrategy={TreeSelect.SHOW_CHILD}
              placeholder="选择该服务商可解决的需求"
              allowClear
              treeDefaultExpandAll={false}
              maxTagCount="responsive"
              showSearch
              treeNodeFilterProp="title"
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item name="description" label="服务商简介">
            <Input.TextArea rows={3} placeholder="请输入简介" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ProviderList;
