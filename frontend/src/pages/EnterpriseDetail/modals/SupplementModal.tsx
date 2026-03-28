import { useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import request from '@/services/request';

interface SupplementModalProps {
  open: boolean;
  enterpriseId: number;
  additionalNotes: string;
  onClose: () => void;
  onSuccess: (additionalNotes: string) => void;
}

export default function SupplementModal({
  open,
  enterpriseId,
  additionalNotes,
  onClose,
  onSuccess,
}: SupplementModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ additionalNotes });
    } else {
      form.resetFields();
    }
  }, [open, additionalNotes, form]);

  const handleOk = async () => {
    try {
      const values = form.getFieldsValue();
      await request.put(`/enterprises/${enterpriseId}`, { additionalNotes: values.additionalNotes });
      message.success('补充说明更新成功');
      onSuccess(values.additionalNotes);
      onClose();
    } catch (e: any) {
      message.error(e?.message || '保存失败');
    }
  };

  return (
    <Modal
      maskClosable={false}
      title="编辑补充说明"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
      width={600}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="additionalNotes" label="补充说明">
          <Input.TextArea rows={6} placeholder="请输入补充说明" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
