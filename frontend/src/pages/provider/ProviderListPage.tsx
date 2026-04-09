import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Input, Modal, Row, Select, Space, Table, message } from 'antd';
import { ExclamationCircleOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { optionsApi, providerApi } from '@/services/api';
import type { ProviderListItem } from '@/types';
import { createProviderColumns } from './providerListColumns';

type ProviderListFilters = {
  keyword?: string;
  district?: string;
};

export default function ProviderListPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<ProviderListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState<string>('');
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const fetchProviders = async (
    nextPage = page,
    nextPageSize = pageSize,
    overrides?: ProviderListFilters
  ) => {
    const keyword = overrides?.keyword ?? searchTerm;
    const district = overrides?.district ?? districtFilter;

    setLoading(true);
    try {
      const response = await providerApi.getList({
        page: nextPage,
        pageSize: nextPageSize,
        keyword: keyword || undefined,
        district: district || undefined,
      });
      const data = response?.data ?? response;
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
      const districtRes = await optionsApi.getOptions('district');
      if (districtRes?.data) {
        setDistrictOptions(districtRes.data.map((item: any) => item.label));
      }
    } catch (error) {
      console.error('Failed to fetch provider options:', error);
    }
  };

  useEffect(() => {
    void fetchOptions();
    void fetchProviders(1, pageSize);
  }, []);

  const handleSearch = () => {
    setPage(1);
    void fetchProviders(1, pageSize);
  };

  const handleCreate = async () => {
    if (isCreating) {
      return;
    }

    setIsCreating(true);
    try {
      const response = await providerApi.create({});
      const newProviderId = response?.data?.id;

      if (newProviderId) {
        message.success('服务商创建成功，正在跳转...');
        navigate(`/providers/${newProviderId}`);
        return;
      }

      message.error('创建服务商失败');
    } catch (error: any) {
      message.error(error?.message || '创建服务商失败');
    } finally {
      setIsCreating(false);
    }
  };

  const handleView = (record: ProviderListItem) => {
    navigate(`/providers/${record.id}`);
  };

  const handleDelete = (record: ProviderListItem) => {
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
          void fetchProviders();
        } catch {
          message.error('删除失败');
        }
      },
    });
  };

  const columns = createProviderColumns({ onView: handleView, onDelete: handleDelete });

  return (
    <div>
      <Card style={{ marginBottom: 16, borderRadius: 12 }} bodyStyle={{ padding: '16px 24px' }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space wrap size="middle">
              <Input
                placeholder="搜索服务商名称"
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onPressEnter={handleSearch}
                style={{ width: 220 }}
                allowClear
              />
              <Select
                placeholder="所属区域"
                value={districtFilter || undefined}
                onChange={(value: string | undefined) => {
                  const nextDistrict = value || '';
                  setDistrictFilter(nextDistrict);
                  setPage(1);
                  void fetchProviders(1, pageSize, { district: nextDistrict });
                }}
                allowClear
                style={{ width: 130 }}
                options={districtOptions.map((item) => ({ label: item, value: item }))}
              />
            </Space>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => void handleCreate()} loading={isCreating}>
              新增服务商
            </Button>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table
          rowKey="id"
          className="enterprise-list-table"
          columns={columns}
          dataSource={providers}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (value: number) => `共 ${value} 条`,
            onChange: (nextPage: number, nextPageSize: number) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
              void fetchProviders(nextPage, nextPageSize);
            },
          }}
        />
      </Card>
    </div>
  );
}
