import { useEffect } from 'react';
import { Modal, Form, Select, message } from 'antd';
import { ENJOYED_POLICY_OPTIONS } from '../constants';
import request from '@/services/request';

interface PolicySupportModalProps {
  open: boolean;
  enterpriseId: number;
  hasPolicySupport: boolean;
  enjoyedPolicies: string[];
  onClose: () => void;
  onSuccess: (hasPolicySupport: number, enjoyedPolicies: string[]) => void;
}

export default function PolicySupportModal({
  open,
  enterpriseId,
  hasPolicySupport,
  enjoyedPolicies,
  onClose,
  onSuccess,
}: PolicySupportModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        hasPolicySupport,
        enjoyedPolicies: enjoyedPolicies || [],
      });
    } else {
      form.resetFields();
    }
  }, [open, hasPolicySupport, enjoyedPolicies, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const hasPolicySupportVal = values.hasPolicySupport ? 1 : 0;
      const policies = values.enjoyedPolicies ?? [];
      await request.put(`/enterprises/${enterpriseId}`, {
        hasPolicySupport: hasPolicySupportVal,
        enjoyedPolicies: policies,
      });
      message.success('政策支持情况更新成功');
      onSuccess(hasPolicySupportVal, policies);
      onClose();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || '保存失败');
    }
  };

  return (
    <Modal
      maskClosable={false}
      title="编辑政策支持情况"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
      width={500}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="hasPolicySupport" label="是否享受过政策支持">
          <Select options={[{ label: '是', value: true }, { label: '否', value: false }]} />
        </Form.Item>
        <Form.Item name="enjoyedPolicies" label="已享受政策">
          <Select mode="multiple" options={ENJOYED_POLICY_OPTIONS} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
