import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Empty, Tag, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ProviderDetail, ServiceRecordItem } from '@/types';
import { serviceRecordApi } from '@/services/api';
import ServiceRecordModal from '../EnterpriseDetail/modals/ServiceRecordModal';
import ServiceRecordDetailCard from '../EnterpriseDetail/tabs/ServiceRecordDetailCard';

const { Text } = Typography;

type ProviderCooperationTabProps = {
  provider: ProviderDetail;
  onRecordsChanged?: () => Promise<void> | void;
};

export default function ProviderCooperationTab({ provider, onRecordsChanged }: ProviderCooperationTabProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecordItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ServiceRecordItem | null>(null);

  const reloadServiceRecords = useCallback(async () => {
    if (!provider.id) {
      setServiceRecords([]);
      return;
    }

    setLoading(true);
    try {
      const res = await serviceRecordApi.getGlobalList({
        page: 1,
        pageSize: 1000,
        providerId: provider.id,
      });
      setServiceRecords(res.data?.list || []);
    } catch {
      setServiceRecords([]);
      message.error('加载合作记录失败');
    } finally {
      setLoading(false);
    }
  }, [provider.id]);

  const refreshAfterMutation = useCallback(async () => {
    await reloadServiceRecords();
    await onRecordsChanged?.();
  }, [onRecordsChanged, reloadServiceRecords]);

  useEffect(() => {
    void reloadServiceRecords();
  }, [reloadServiceRecords]);

  const summary = useMemo(() => {
    const enterpriseCount = new Set(
      serviceRecords
        .map((item) => item.enterpriseId)
        .filter((item): item is number => Number.isFinite(item)),
    ).size;

    return {
      total: serviceRecords.length,
      enterpriseCount,
      completed: serviceRecords.filter((item) => item.status === 'completed').length,
      inProgress: serviceRecords.filter((item) => item.status === 'in_progress').length,
    };
  }, [serviceRecords]);

  const mergeServiceRecordInState = (updatedRecord: ServiceRecordItem) => {
    setServiceRecords((prev) => prev.map((item) => (item.id === updatedRecord.id ? { ...item, ...updatedRecord } : item)));
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  const handleEdit = (record: ServiceRecordItem) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  const handleDelete = async (record: ServiceRecordItem) => {
    if (!record.enterpriseId) {
      message.error('当前记录缺少企业信息，无法删除');
      return;
    }

    try {
      await serviceRecordApi.delete(record.enterpriseId, record.id);
      message.success('删除成功');
      await refreshAfterMutation();
    } catch {
      message.error('删除失败');
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <Card
        size="small"
        style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', marginBottom: 8 }}>合作概览</div>
            <Text type="secondary">在当前服务商视角查看合作记录；新增记录时需要先选择对应企业。</Text>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Tag color="#396AFF" style={{ borderRadius: 10, padding: '4px 10px', margin: 0 }}>合作记录 {summary.total}</Tag>
            <Tag color="#16DBCC" style={{ borderRadius: 10, padding: '4px 10px', margin: 0 }}>服务企业 {summary.enterpriseCount}</Tag>
            {summary.completed > 0 && (
              <Tag color="#52c41a" style={{ borderRadius: 10, padding: '4px 10px', margin: 0 }}>已完成 {summary.completed}</Tag>
            )}
            {summary.inProgress > 0 && (
              <Tag color="#1677ff" style={{ borderRadius: 10, padding: '4px 10px', margin: 0 }}>进行中 {summary.inProgress}</Tag>
            )}
          </div>
        </div>
      </Card>

      <Card
        title="商业化合作记录"
        extra={
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAdd} style={{ borderRadius: 6, background: '#396AFF', border: 'none' }}>
            添加记录
          </Button>
        }
        size="small"
        loading={loading}
        style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        styles={{ header: { borderBottom: '1px solid #f5f5f5' } }}
      >
        {serviceRecords.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {serviceRecords.slice(0, 10).map((record) => (
              <ServiceRecordDetailCard
                key={record.id}
                enterpriseId={record.enterpriseId}
                record={record}
                onEdit={handleEdit}
                onDelete={handleDelete}
                mergeServiceRecordInState={mergeServiceRecordInState}
                onAttachmentsChange={reloadServiceRecords}
              />
            ))}
            {serviceRecords.length > 10 && (
              <Button
                type="link"
                onClick={() => navigate(`/service-records?providerId=${provider.id}`)}
                style={{ alignSelf: 'center', color: '#396AFF', fontSize: 14 }}
              >
                查看全部 {serviceRecords.length} 条记录
              </Button>
            )}
          </div>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<Text type="secondary" style={{ fontSize: 14 }}>暂无合作记录，点击上方按钮添加</Text>} />
        )}
      </Card>

      <ServiceRecordModal
        open={modalOpen}
        providerId={provider.id}
        editingRecord={editingRecord}
        onClose={() => {
          setModalOpen(false);
          setEditingRecord(null);
        }}
        onSuccess={refreshAfterMutation}
      />
    </div>
  );
}
