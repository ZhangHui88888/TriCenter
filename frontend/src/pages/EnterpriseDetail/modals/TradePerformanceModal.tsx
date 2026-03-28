import { useState } from 'react';
import { Modal, Form, Input, Row, Col, message } from 'antd';
import request from '@/services/request';

interface TradePerformanceModalProps {
  open: boolean;
  enterpriseId: number;
  initialData: {
    yearBeforeLastRevenue: number | undefined;
    lastYearRevenue: number | undefined;
  };
  onClose: () => void;
  onSuccess: (data: { lastYearRevenue: number; yearBeforeLastRevenue: number }) => void;
}

export default function TradePerformanceModal({
  open,
  enterpriseId,
  initialData,
  onClose,
  onSuccess,
}: TradePerformanceModalProps) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleOk = async () => {
    try {
      await form.validateFields();
    } catch {
      return;
    }
    const values = form.getFieldsValue();
    const toNum = (v: unknown) => {
      if (v === '' || v === undefined || v === null) return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };
    const lastYearRevenue = toNum(values.lastYearRevenue);
    const yearBeforeLastRevenue = toNum(values.yearBeforeLastRevenue);
    if (lastYearRevenue === undefined || yearBeforeLastRevenue === undefined) {
      message.warning('请填写两年外贸营业额');
      return;
    }
    setSaving(true);
    try {
      await request.put(`/enterprises/${enterpriseId}`, { lastYearRevenue, yearBeforeLastRevenue });
      message.success('外贸业绩分析更新成功');
      onSuccess({ lastYearRevenue, yearBeforeLastRevenue });
      onClose();
    } catch (e: any) {
      message.error(e?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      maskClosable={false}
      title="编辑外贸业绩分析"
      open={open}
      confirmLoading={saving}
      onOk={handleOk}
      onCancel={onClose}
      width={800}
      okText="保存"
      cancelText="取消"
      afterOpenChange={(visible) => {
        if (visible) {
          form.setFieldsValue({
            yearBeforeLastRevenue: initialData.yearBeforeLastRevenue,
            lastYearRevenue: initialData.lastYearRevenue,
          });
        } else {
          form.resetFields();
        }
      }}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={`${new Date().getFullYear() - 2}年外贸营业额(万元)`}
              name="yearBeforeLastRevenue"
              rules={[{ required: true, message: '请输入营业额' }]}
            >
              <Input type="number" placeholder="请输入营业额" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={`${new Date().getFullYear() - 1}年外贸营业额(万元)`}
              name="lastYearRevenue"
              rules={[{ required: true, message: '请输入营业额' }]}
            >
              <Input type="number" placeholder="请输入营业额" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
