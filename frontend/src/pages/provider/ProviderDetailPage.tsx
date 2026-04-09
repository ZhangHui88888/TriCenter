import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Empty, Spin, Tabs, Typography, message } from 'antd';
import { optionsApi, providerApi } from '@/services/api';
import type { ProviderDetail } from '@/types';
import ProviderBasicInfoTab from './ProviderBasicInfoTab';
import ProviderCooperationTab from './ProviderCooperationTab';
import ProviderServiceAreasTab from './ProviderServiceAreasTab';
import EditProviderBasicInfoModal from './modals/EditProviderBasicInfoModal';
import EditProviderContactModal from './modals/EditProviderContactModal';
import { getRequirementNames, type SelectOption } from './constants';

const { Text, Title } = Typography;

function formatDateTime(value?: string) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function ProviderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<ProviderDetail | null>(null);
  const [staffSizeOptions, setStaffSizeOptions] = useState<SelectOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [editModal, setEditModal] = useState<'basic' | 'contact' | null>(null);

  const loadData = async (providerId: number) => {
    setLoading(true);
    try {
      const [detailRes, staffSizeRes, districtRes] = await Promise.all([
        providerApi.getDetail(providerId),
        optionsApi.getOptions('staff_size'),
        optionsApi.getOptions('district'),
      ]);
      const detail = detailRes?.data ?? detailRes;
      setProvider(detail || null);
      setStaffSizeOptions((staffSizeRes?.data || []).map((item: any) => ({ label: item.label, value: item.id })));
      setDistrictOptions((districtRes?.data || []).map((item: any) => item.label));
    } catch (error) {
      console.error('Failed to fetch provider detail:', error);
      setProvider(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const providerId = Number(id);
    if (!providerId) {
      message.error('服务商ID无效');
      setLoading(false);
      return;
    }

    void loadData(providerId);
  }, [id]);

  const displayProvider = useMemo(() => {
    if (!provider) {
      return null;
    }

    const staffSizeName = staffSizeOptions.find((item) => Number(item.value) === Number(provider.staffSizeId))?.label;
    return {
      ...provider,
      staffSizeName,
    };
  }, [provider, staffSizeOptions]);

  if (loading) {
    return (
      <div style={{ minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!displayProvider) {
    return (
      <Card style={{ borderRadius: 16 }}>
        <Empty description="未找到服务商详情" />
      </Card>
    );
  }

  const serviceCategoryNames = getRequirementNames(displayProvider.capabilityRequirementIds);
  const tabItems = [
    {
      key: 'basic',
      label: '基本信息',
      children: <ProviderBasicInfoTab provider={displayProvider} openEditModal={setEditModal} />,
    },
    {
      key: 'cooperation',
      label: '合作',
      children: <ProviderCooperationTab provider={displayProvider} onRecordsChanged={() => loadData(displayProvider.id)} />,
    },
    {
      key: 'serviceAreas',
      label: '服务领域',
      children: <ProviderServiceAreasTab serviceAreas={displayProvider.serviceAreas} />,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/providers')}>
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
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ height: 4, background: 'linear-gradient(90deg, #396aff 0%, rgba(57,106,255,0.38) 50%, transparent 100%)' }} />
        <div style={{ padding: '28px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div
                style={{
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
                }}
              >
                {displayProvider.name.charAt(0)}
              </div>
              <div>
                <Title level={3} style={{ margin: 0, fontWeight: 700, letterSpacing: -0.5, fontSize: 22 }}>
                  {displayProvider.name}
                </Title>
                <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 14px', background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)', borderRadius: 20, color: '#00838f', fontWeight: 500, fontSize: 13 }}>
                    {displayProvider.district || '未填写区域'}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 14px', background: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)', borderRadius: 20, color: '#f57c00', fontWeight: 500, fontSize: 13 }}>
                    {serviceCategoryNames.length > 0 ? `服务分类 ${serviceCategoryNames.length} 项` : '未填写服务分类'}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'stretch', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center', padding: '12px 20px', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', minWidth: 120 }}>
                <Text type="secondary" style={{ fontSize: 11, letterSpacing: 0.5 }}>录入时间</Text>
                <div style={{ fontWeight: 600, color: '#334155', marginTop: 4, fontSize: 14 }}>{formatDateTime(displayProvider.createdAt)}</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px 20px', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', minWidth: 120 }}>
                <Text type="secondary" style={{ fontSize: 11, letterSpacing: 0.5 }}>服务企业数</Text>
                <div style={{ fontWeight: 600, color: '#334155', marginTop: 4, fontSize: 14 }}>
                  {displayProvider.totalServedEnterprises ?? '-'}
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px 20px', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', minWidth: 120 }}>
                <Text type="secondary" style={{ fontSize: 11, letterSpacing: 0.5 }}>服务次数</Text>
                <div style={{ fontWeight: 600, color: '#334155', marginTop: 4, fontSize: 14 }}>{displayProvider.totalServiceCount ?? '-'}</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <Tabs items={tabItems} tabBarStyle={{ marginBottom: 0, borderBottom: '1px solid #f0f0f0', paddingLeft: 8 }} />
      </Card>

      <EditProviderBasicInfoModal
        open={editModal === 'basic'}
        provider={displayProvider}
        staffSizeOptions={staffSizeOptions}
        districtOptions={districtOptions}
        onClose={() => setEditModal(null)}
        onSuccess={(nextProvider) => {
          setProvider(nextProvider);
          setEditModal(null);
        }}
      />

      <EditProviderContactModal
        open={editModal === 'contact'}
        provider={displayProvider}
        onClose={() => setEditModal(null)}
        onSuccess={(nextProvider) => {
          setProvider(nextProvider);
          setEditModal(null);
        }}
      />
    </div>
  );
}
