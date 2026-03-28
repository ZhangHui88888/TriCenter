import { useEffect } from 'react';
import { Modal, Form, Select, Input, message } from 'antd';
import request from '@/services/request';

const DEMANDS_OPTIONS = [
  { label: '跨境电商运营培训', value: '跨境电商运营培训' },
  { label: '平台资源对接', value: '平台资源对接' },
  { label: '品牌孵化服务', value: '品牌孵化服务' },
  { label: '代运营服务', value: '代运营服务' },
  { label: '人才招聘', value: '人才招聘' },
  { label: '政策申报', value: '政策申报' },
];

interface TriCenterCoopModalProps {
  open: boolean;
  enterpriseId: number;
  tricenterDemands: string[];
  tricenterConcerns: string;
  onClose: () => void;
  onSuccess: (demands: string[], concerns: string) => void;
}

export default function TriCenterCoopModal({
  open,
  enterpriseId,
  tricenterDemands,
  tricenterConcerns,
  onClose,
  onSuccess,
}: TriCenterCoopModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        tricenterDemands: tricenterDemands || [],
        tricenterConcerns: tricenterConcerns || '',
      });
    } else {
      form.resetFields();
    }
  }, [open, tricenterDemands, tricenterConcerns, form]);

  const handleOk = async () => {
    try {
      const values = form.getFieldsValue();
      await request.put(`/enterprises/${enterpriseId}`, {
        tricenterDemands: values.tricenterDemands,
        tricenterConcerns: values.tricenterConcerns,
      });
      message.success('三中心合作信息更新成功');
      onSuccess(values.tricenterDemands, values.tricenterConcerns);
      onClose();
    } catch (e: any) {
      message.error(e?.message || '保存失败');
    }
  };

  return (
    <Modal
      maskClosable={false}
      title="编辑三中心合作"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
      width={600}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="tricenterDemands" label="与三中心合作主要需求">
          <Select mode="multiple" options={DEMANDS_OPTIONS} />
        </Form.Item>
        <Form.Item name="tricenterConcerns" label="不考虑合作主要顾虑">
          <Input.TextArea placeholder="请输入不考虑合作的主要顾虑" rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
