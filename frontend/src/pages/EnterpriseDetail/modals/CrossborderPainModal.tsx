import { useEffect } from 'react';
import { Modal, Form, Select, message } from 'antd';
import request from '@/services/request';

const PAIN_OPTIONS = [
  { label: '流量获取困难', value: '流量获取困难' },
  { label: '运营人才缺乏', value: '运营人才缺乏' },
  { label: '物流成本高', value: '物流成本高' },
  { label: '支付结算复杂', value: '支付结算复杂' },
  { label: '知识产权风险', value: '知识产权风险' },
  { label: '合规风险', value: '合规风险' },
];

interface CrossborderPainModalProps {
  open: boolean;
  enterpriseId: number;
  painPoints: string[];
  onClose: () => void;
  onSuccess: (painPoints: string[]) => void;
}

export default function CrossborderPainModal({
  open,
  enterpriseId,
  painPoints,
  onClose,
  onSuccess,
}: CrossborderPainModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ painPoints: painPoints || [] });
    } else {
      form.resetFields();
    }
  }, [open, painPoints, form]);

  const handleOk = async () => {
    try {
      const values = form.getFieldsValue();
      await request.put(`/enterprises/${enterpriseId}`, { painPoints: values.painPoints });
      message.success('跨境业务痛点更新成功');
      onSuccess(values.painPoints);
      onClose();
    } catch (e: any) {
      message.error(e?.message || '保存失败');
    }
  };

  return (
    <Modal
      maskClosable={false}
      title="编辑跨境业务痛点"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
      width={500}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="painPoints" label="跨境业务痛点">
          <Select mode="multiple" options={PAIN_OPTIONS} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
