import { useEffect } from 'react';
import { Modal, Form, Select, Input, message } from 'antd';
import request from '@/services/request';

interface CompetitionModalProps {
  open: boolean;
  enterpriseId: number;
  competitionPosition: string;
  competitionDescription: string;
  onClose: () => void;
  onSuccess: (position: string, description: string) => void;
}

export default function CompetitionModal({
  open,
  enterpriseId,
  competitionPosition,
  competitionDescription,
  onClose,
  onSuccess,
}: CompetitionModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        competitionPosition,
        competitionDescription,
      });
    } else {
      form.resetFields();
    }
  }, [open, competitionPosition, competitionDescription, form]);

  const handleOk = async () => {
    try {
      const values = form.getFieldsValue();
      await request.put(`/enterprises/${enterpriseId}`, {
        competitionPosition: values.competitionPosition,
        competitionDescription: values.competitionDescription,
      });
      message.success('行业竞争地位更新成功');
      onSuccess(values.competitionPosition, values.competitionDescription);
      onClose();
    } catch (e: any) {
      message.error(e?.message || '保存失败');
    }
  };

  return (
    <Modal
      maskClosable={false}
      title="编辑行业竞争地位"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
      width={500}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="competitionPosition" label="行业竞争地位">
          <Select
            options={[
              { label: '头部企业', value: '头部企业' },
              { label: '中型企业', value: '中型企业' },
              { label: '初创企业', value: '初创企业' },
            ]}
          />
        </Form.Item>
        <Form.Item name="competitionDescription" label="竞争地位描述">
          <Input.TextArea rows={3} placeholder="请描述企业在行业中的竞争地位" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
