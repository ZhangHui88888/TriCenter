// @ts-nocheck
import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Row, Col, Rate, Collapse, message } from 'antd';
import { CustomerServiceOutlined, StarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { enterpriseApi, serviceRecordApi, optionsApi } from '@/services/api';
import {
  ASSESSMENT_DIMENSIONS, SERVICE_TYPES_DATA, SERVICE_STATUSES_DATA, FUNNEL_STAGES,
  calcFeasibilityScore, calcProjectLevel,
} from '../constants';
import CooperationAttachmentsEditor, {
  normalizeAttachmentList,
  type AttachmentMeta,
} from '../components/CooperationAttachmentsEditor';

interface ServiceRecordModalProps {
  open: boolean;
  enterpriseId?: number;
  providerId?: number;
  editingRecord: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ServiceRecordModal({ open, enterpriseId, providerId, editingRecord, onClose, onSuccess }: ServiceRecordModalProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [userOptions, setUserOptions] = useState<{ label: string; value: number }[]>([]);
  const [providerOptions, setProviderOptions] = useState<{ label: string; value: number }[]>([]);
  const [enterpriseOptions, setEnterpriseOptions] = useState<{ label: string; value: number }[]>([]);
  const [attachments, setAttachments] = useState<AttachmentMeta[]>([]);

  useEffect(() => {
    if (!open) return;
    optionsApi.getUsers().then(res => {
      if (res.data) setUserOptions(res.data.map((u: any) => ({ label: u.label, value: u.value })));
    }).catch(() => {});
    optionsApi.getProviders().then(res => {
      if (res.data) setProviderOptions(res.data.map((p: any) => ({ label: p.label, value: Number(p.value) })));
    }).catch(() => {});
    if (enterpriseId == null) {
      enterpriseApi.getList({ page: 1, pageSize: 9999 }).then(res => {
        const list = res.data?.list || [];
        setEnterpriseOptions(list.map((item: any) => ({ label: item.name, value: item.id })));
      }).catch(() => {});
    }
  }, [open, enterpriseId]);

  useEffect(() => {
    if (!open) return;
    if (editingRecord) {
      const recordFields = { ...editingRecord };
      delete recordFields.benchmarkPossibility;
      delete recordFields.attachments;
      form.setFieldsValue({
        ...recordFields,
        enterpriseId: editingRecord.enterpriseId,
        providerId: editingRecord.providerId ?? providerId,
        serviceDate: editingRecord.serviceDate ? dayjs(editingRecord.serviceDate) : undefined,
      });
      setAttachments(normalizeAttachmentList(editingRecord.attachments));
    } else {
      form.resetFields();
      form.setFieldsValue({
        enterpriseId,
        providerId,
        status: 'pending',
        serviceDate: dayjs(),
      });
      setAttachments([]);
    }
  }, [open, editingRecord, form, enterpriseId, providerId]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const targetEnterpriseId = enterpriseId ?? editingRecord?.enterpriseId ?? values.enterpriseId;
      if (!targetEnterpriseId) {
        message.error('请选择企业');
        return;
      }
      setSubmitting(true);
      const payload = {
        ...values,
        providerId: providerId ?? values.providerId ?? null,
        serviceDate: values.serviceDate?.format('YYYY-MM-DD'),
        attachments,
      };
      delete payload.enterpriseId;
      // 标杆企业可能性在企业详情「合作」Tab 调整；此处保留单条记录上原值，避免更新时被后端写成 null
      if (editingRecord) {
        payload.benchmarkPossibility = editingRecord.benchmarkPossibility;
      }

      if (payload.assessmentData) {
        const hasScores = Object.values(payload.assessmentData as Record<string, number>).some(v => (v ?? 0) > 0);
        if (hasScores) {
          const score = calcFeasibilityScore(payload.assessmentData);
          payload.feasibilityScore = score;
          payload.projectLevel = calcProjectLevel(score);
        } else {
          delete payload.assessmentData;
          payload.feasibilityScore = null;
          payload.projectLevel = null;
        }
      } else if (editingRecord) {
        // 表单未带出 assessment 时保留库中原值（避免误清空）
        payload.assessmentData = editingRecord.assessmentData ?? null;
        payload.feasibilityScore = editingRecord.feasibilityScore ?? null;
        payload.projectLevel = editingRecord.projectLevel ?? null;
      }

      if (editingRecord) {
        await serviceRecordApi.update(targetEnterpriseId, editingRecord.id, payload);
        message.success('更新成功');
      } else {
        await serviceRecordApi.create(targetEnterpriseId, payload);
        message.success('创建成功');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      maskClosable={false}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#343C6A' }}>
          <CustomerServiceOutlined style={{ color: '#396AFF' }} />
          <span>{editingRecord ? '编辑合作记录' : '新增合作记录'}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      destroyOnHidden
      width={720}
      confirmLoading={submitting}
      onOk={handleSubmit}
      okText={editingRecord ? '保存修改' : '创建记录'}
      cancelText="取消"
      okButtonProps={{ style: { background: '#396AFF', border: 'none', borderRadius: 10 } }}
      cancelButtonProps={{ style: { borderRadius: 10 } }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          {enterpriseId == null && (
            <Col span={24}>
              <Form.Item name="enterpriseId" label="合作企业" rules={[{ required: true, message: '请选择企业' }]}>
                <Select placeholder="请选择企业" showSearch optionFilterProp="label" options={enterpriseOptions} disabled={editingRecord != null} />
              </Form.Item>
            </Col>
          )}
          <Col span={12}>
            <Form.Item name="serviceType" label="服务类型" rules={[{ required: true, message: '请选择' }]}>
              <Select placeholder="请选择" options={SERVICE_TYPES_DATA.map(t => ({ label: t.label, value: t.value }))} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="serviceName" label="服务名称" rules={[{ required: true, message: '请输入' }]}>
              <Input placeholder="如：亚马逊运营培训班（第3期）" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="serviceDate" label="服务日期" rules={[{ required: true, message: '请选择' }]}>
              <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="status" label="服务状态" rules={[{ required: true, message: '请选择' }]}>
              <Select placeholder="请选择" options={SERVICE_STATUSES_DATA.map(s => ({ label: s.label, value: s.value }))} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="providerId" label="服务商">
              <Select placeholder="选择服务商（可选）" allowClear showSearch optionFilterProp="label" options={providerOptions} disabled={providerId != null} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="responsibleId" label="负责人">
              <Select placeholder="请选择对接人" allowClear showSearch optionFilterProp="label" options={userOptions} />
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
            <Form.Item label="附件 / 图片">
              <CooperationAttachmentsEditor
                key={`${editingRecord?.id ?? 'new'}-${open ? '1' : '0'}`}
                initialMetas={normalizeAttachmentList(editingRecord?.attachments)}
                onChange={setAttachments}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Collapse ghost items={[{
              key: 'assessment',
              label: <span style={{ fontWeight: 500, color: '#343C6A' }}><StarOutlined style={{ color: '#FFBB38', marginRight: 6 }} />可行性评估（可选 · 本条服务记录）</span>,
              children: (
                <div style={{ background: '#F5F7FA', borderRadius: 12, padding: 16 }}>
                  <div style={{ color: '#718EBF', fontSize: 12, marginBottom: 12 }}>
                    与「合作」Tab 中企业档案六项评分相互独立；此处星级写入本条合作服务记录，用于自动计算项目级别（S/A/B/C）。
                  </div>
                  {ASSESSMENT_DIMENSIONS.map(dim => (
                    <Form.Item key={dim.key} name={['assessmentData', dim.key]}
                      label={<span>{dim.label} <span style={{ color: '#718EBF', fontSize: 12 }}>({dim.desc})</span></span>}
                      style={{ marginBottom: 12 }}>
                      <Rate count={5} />
                    </Form.Item>
                  ))}
                  <div style={{ textAlign: 'right', color: '#718EBF', fontSize: 12, marginTop: 8 }}>评分后将自动计算项目级别（S/A/B/C）</div>
                </div>
              ),
            }]} />
          </Col>
          <Col span={24}>
            <Form.Item name="stageTo" label="关联变更漏斗阶段（可选）">
              <Select placeholder="如需同步变更企业阶段，请选择" allowClear
                options={FUNNEL_STAGES.map(s => ({ label: s.name, value: s.code }))} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
