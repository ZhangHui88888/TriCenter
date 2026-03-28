import { useEffect } from 'react';
import { Modal, Form, Select, Input, Row, Col, message } from 'antd';
import request from '@/services/request';

const WILLINGNESS_OPTIONS = [
  { label: '高', value: '高' },
  { label: '中', value: '中' },
  { label: '低', value: '低' },
];

interface PreliminaryModalProps {
  open: boolean;
  enterpriseId: number;
  transformationWillingness: string;
  investmentWillingness: string;
  benchmarkPossibility: number | null;
  onClose: () => void;
  onSuccess: (data: { transformationWillingness: string; investmentWillingness: string; benchmarkPossibility: number | null }) => void;
}

export default function PreliminaryModal({
  open,
  enterpriseId,
  transformationWillingness,
  investmentWillingness,
  benchmarkPossibility,
  onClose,
  onSuccess,
}: PreliminaryModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        transformationWillingness,
        investmentWillingness,
        benchmarkPossibility,
      });
    } else {
      form.resetFields();
    }
  }, [open, transformationWillingness, investmentWillingness, benchmarkPossibility, form]);

  const handleOk = async () => {
    try {
      const values = form.getFieldsValue();
      const bp = values.benchmarkPossibility ? Number(values.benchmarkPossibility) : null;
      await request.put(`/enterprises/${enterpriseId}`, {
        transformationWillingness: values.transformationWillingness,
        investmentWillingness: values.investmentWillingness,
        benchmarkPossibility: bp,
      });
      message.success('初步评估更新成功');
      onSuccess({
        transformationWillingness: values.transformationWillingness,
        investmentWillingness: values.investmentWillingness,
        benchmarkPossibility: bp,
      });
      onClose();
    } catch (e: any) {
      message.error(e?.message || '保存失败');
    }
  };

  return (
    <Modal
      maskClosable={false}
      title="编辑初步评估"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
      width={600}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="transformationWillingness" label="跨境转型意愿">
              <Select options={WILLINGNESS_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="investmentWillingness" label="愿意投入转型程度">
              <Select options={WILLINGNESS_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="benchmarkPossibility" label="成为标杆企业可能性(%)">
              <Input type="number" placeholder="请输入0-100之间的数值" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
