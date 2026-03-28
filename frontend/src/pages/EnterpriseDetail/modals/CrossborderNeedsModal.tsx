import { useEffect } from 'react';
import { Modal, Form, Select, Row, Col, message } from 'antd';
import request from '@/services/request';

const NEEDS_ITEMS = [
  { label: '转型跨境意愿', key: 'transformation' },
  { label: '代运营需求', key: 'operation' },
  { label: '流量营销需求', key: 'marketing' },
  { label: '跨境培训需求', key: 'training' },
  { label: '品牌孵化需求', key: 'branding' },
  { label: '跨境人才需求', key: 'talent' },
  { label: '共享办公工位', key: 'office' },
  { label: '签约入驻三中心', key: 'settle' },
  { label: '注册至三中心', key: 'register' },
];

const NEEDS_KEYS = NEEDS_ITEMS.map((i) => i.key);

interface CrossborderNeedsModalProps {
  open: boolean;
  enterpriseId: number;
  tricenterDemands: string[];
  onClose: () => void;
  onSuccess: (demands: string[]) => void;
}

export default function CrossborderNeedsModal({
  open,
  enterpriseId,
  tricenterDemands,
  onClose,
  onSuccess,
}: CrossborderNeedsModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      const values: Record<string, boolean> = {};
      NEEDS_KEYS.forEach((key) => {
        values[`need_${key}`] = (tricenterDemands || []).includes(key);
      });
      form.setFieldsValue(values);
    } else {
      form.resetFields();
    }
  }, [open, tricenterDemands, form]);

  const handleOk = async () => {
    try {
      const values = form.getFieldsValue();
      const demands = NEEDS_KEYS.filter((key) => values[`need_${key}`]);
      await request.put(`/enterprises/${enterpriseId}`, { tricenterDemands: demands });
      message.success('跨境需求信息更新成功');
      onSuccess(demands);
      onClose();
    } catch (e: any) {
      message.error(e?.message || '保存失败');
    }
  };

  return (
    <Modal
      maskClosable={false}
      title="编辑跨境需求和痛点"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
      width={700}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          {NEEDS_ITEMS.map((item) => (
            <Col span={12} key={item.key}>
              <Form.Item name={`need_${item.key}`} label={item.label}>
                <Select options={[{ label: '是', value: true }, { label: '否', value: false }]} />
              </Form.Item>
            </Col>
          ))}
        </Row>
      </Form>
    </Modal>
  );
}
