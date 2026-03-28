// @ts-nocheck
import { useState, useMemo } from 'react';
import { Card, Select, Tag, Button, Slider, Switch, Typography, Empty, message, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { EnterpriseDetailSectionHint } from '@/components/enterpriseDetail/EnterpriseDetailSectionHint';
import { CONCERN_OPTIONS } from '../constants';
import { serviceRecordApi } from '@/services/api';
import ServiceRecordModal from '../modals/ServiceRecordModal';
import ServiceRecordDetailCard from './ServiceRecordDetailCard';

const { Text } = Typography;

interface CooperationTabProps {
  enterprise: any;
  setEnterprise: (v: any) => void;
  isCooperating: boolean;
  setIsCooperating: (v: boolean) => void;
  serviceRecords: any[];
  reloadServiceRecords: () => void;
  mergeServiceRecordInState?: (updated: any) => void;
  saveEnterpriseFields: (fields: Record<string, any>, msg: string) => Promise<void>;
  navigateToServiceRecords: () => void;
}

export default function CooperationTab({
  enterprise, setEnterprise, isCooperating, setIsCooperating,
  serviceRecords, reloadServiceRecords, mergeServiceRecordInState, saveEnterpriseFields, navigateToServiceRecords,
}: CooperationTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const hasServiceRecords = serviceRecords.length > 0;
  /** 有合作服务记录时强制按已合作展示，且不允许改回未合作 */
  const showAsCooperating = hasServiceRecords || isCooperating;

  const summary = useMemo(() => ({
    total: serviceRecords.length,
    completed: serviceRecords.filter((r: any) => r.status === 'completed').length,
    inProgress: serviceRecords.filter((r: any) => r.status === 'in_progress').length,
  }), [serviceRecords]);

  const handleAdd = () => { setEditingRecord(null); setModalOpen(true); };
  const handleEdit = (r: any) => { setEditingRecord(r); setModalOpen(true); };
  const handleDelete = async (r: any) => {
    try {
      await serviceRecordApi.delete(enterprise.id, r.id);
      message.success('删除成功');
      reloadServiceRecords();
    } catch { message.error('删除失败'); }
  };

  return (
    <div>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>三中心合作</span>
              <EnterpriseDetailSectionHint sectionKey="coop-tricenter" />
            </span>
            <Tooltip title={hasServiceRecords ? '已存在合作服务记录，合作状态固定为「已合作」' : undefined}>
              <span style={{ display: 'inline-block' }}>
                <Switch
                  checked={showAsCooperating}
                  disabled={hasServiceRecords}
                  onChange={(checked) => {
                    if (!hasServiceRecords) setIsCooperating(checked);
                  }}
                  checkedChildren="已合作"
                  unCheckedChildren="未合作"
                  style={{ background: showAsCooperating ? '#43e97b' : '#ff6b6b' }}
                />
              </span>
            </Tooltip>
          </div>
        }
        size="small"
        style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        styles={{ header: { borderBottom: '1px solid #f5f5f5' } }}
      >
        {showAsCooperating ? (
          <div style={{ padding: 16, background: 'linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.05) 100%)', borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontWeight: 500 }}>标杆企业可能性</Text>
              <Text strong style={{ fontSize: 18, color: '#667eea' }}>{enterprise.benchmark_possibility || 0}%</Text>
            </div>
            <Slider value={enterprise.benchmark_possibility || 0} min={0} max={100} step={1}
              tooltip={{ formatter: (v) => `${v}%` }}
              onChange={(val) => setEnterprise({ ...enterprise, benchmark_possibility: val })}
              onChangeComplete={async (val) => { await saveEnterpriseFields({ benchmarkPossibility: val }, `标杆企业可能性已更新为${val}%`); }}
              styles={{ track: { background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' }, rail: { background: '#e8e8e8' } }}
            />
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Text strong style={{ fontSize: 14 }}>不合作主要顾虑</Text>
              <EnterpriseDetailSectionHint sectionKey="coop-tricenter-concerns" />
            </div>
            <Select mode="multiple" style={{ width: '100%' }} placeholder="请选择不合作的主要顾虑"
              value={enterprise.tricenter_concerns || []}
              onChange={async (value: string[]) => { setEnterprise({ ...enterprise, tricenter_concerns: value }); await saveEnterpriseFields({ tricenterConcerns: value }, '顾虑信息已更新'); }}
              options={CONCERN_OPTIONS} />
          </div>
        )}
      </Card>

      {showAsCooperating && (
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>商业化合作记录</span>
              <EnterpriseDetailSectionHint sectionKey="coop-service-records" />
              <Tag color="#396AFF" style={{ borderRadius: 10, fontWeight: 600, marginLeft: 4 }}>{summary.total}</Tag>
              {summary.completed > 0 && <Tag color="#16DBCC" style={{ borderRadius: 10 }}>已完成 {summary.completed}</Tag>}
              {summary.inProgress > 0 && <Tag color="#396AFF" style={{ borderRadius: 10 }}>进行中 {summary.inProgress}</Tag>}
            </div>
          }
          extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAdd} style={{ borderRadius: 6, background: '#396AFF', border: 'none' }}>添加记录</Button>}
          size="small"
          style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          styles={{ header: { borderBottom: '1px solid #f5f5f5' } }}
        >
          {serviceRecords.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {serviceRecords.slice(0, 10).map((r: any) => (
                <ServiceRecordDetailCard
                  key={r.id}
                  enterpriseId={enterprise.id}
                  record={r}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  mergeServiceRecordInState={mergeServiceRecordInState}
                  onAttachmentsChange={reloadServiceRecords}
                />
              ))}
              {serviceRecords.length > 10 && (
                <Button type="link" onClick={navigateToServiceRecords} style={{ alignSelf: 'center', color: '#396AFF', fontSize: 14 }}>
                  查看全部 {serviceRecords.length} 条记录
                </Button>
              )}
            </div>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<Text type="secondary" style={{ fontSize: 14 }}>暂无合作记录，点击上方按钮添加</Text>} />
          )}
        </Card>
      )}

      <ServiceRecordModal
        open={modalOpen}
        enterpriseId={enterprise?.id}
        editingRecord={editingRecord}
        onClose={() => { setModalOpen(false); setEditingRecord(null); }}
        onSuccess={reloadServiceRecords}
      />
    </div>
  );
}
