import { useEffect } from 'react';
import { Modal, Form, Select, Input, message } from 'antd';
import request from '@/services/request';

const RISK_OPTIONS = [
  { label: '原材料价格波动风险', value: '原材料价格波动风险' },
  { label: '跨境物流成本上涨', value: '跨境物流成本上涨' },
  { label: '人才流失风险', value: '人才流失风险' },
  { label: '汇率波动风险', value: '汇率波动风险' },
  { label: '市场竞争加剧', value: '市场竞争加剧' },
  { label: '政策变化风险', value: '政策变化风险' },
];

interface RiskModalProps {
  open: boolean;
  enterpriseId: number;
  currentRiskTags: string[];
  riskDescription: string;
  onClose: () => void;
  onSuccess: (riskTags: string[], riskDescription: string) => void;
}

export default function RiskModal({
  open,
  enterpriseId,
  currentRiskTags,
  riskDescription,
  onClose,
  onSuccess,
}: RiskModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        risks: Array.isArray(currentRiskTags) ? currentRiskTags : [],
        riskDescription: riskDescription || '',
      });
    } else {
      form.resetFields();
    }
  }, [open, currentRiskTags, riskDescription, form]);

  const handleOk = async () => {
    try {
      const values = form.getFieldsValue();
      const tags: string[] = Array.isArray(values.risks) ? values.risks : [];
      const desc = (values.riskDescription && String(values.riskDescription).trim()) || '';
      await request.put(`/enterprises/${enterpriseId}`, {
        currentRiskTags: tags,
        riskDescription: desc,
      });
      message.success('当前面临风险更新成功');
      onSuccess(tags, desc);
      onClose();
    } catch (e: any) {
      message.error(e?.message || '保存失败');
    }
  };

  return (
    <Modal
      maskClosable={false}
      title="编辑当前面临风险"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
      width={600}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="risks" label="当前面临的主要风险">
          <Select mode="multiple" options={RISK_OPTIONS} />
        </Form.Item>
        <Form.Item name="riskDescription" label="风险详细描述">
          <Input.TextArea rows={4} placeholder="请详细描述当前面临的风险情况" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
