import { useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { patentApi, enterpriseApi } from '@/services/api';

interface PatentRecord {
  id?: number;
  name?: string;
  patentNo?: string;
}

interface PatentModalProps {
  open: boolean;
  enterpriseId: number;
  editingRecord: PatentRecord | null;
  onClose: () => void;
  onSuccess: (patents: any[]) => void;
}

export default function PatentModal({
  open,
  enterpriseId,
  editingRecord,
  onClose,
  onSuccess,
}: PatentModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && editingRecord) {
      form.setFieldsValue({
        name: editingRecord.name,
        patent_no: editingRecord.patentNo,
      });
    } else if (!open) {
      form.resetFields();
    }
  }, [open, editingRecord, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const body = { name: values.name, patentNo: values.patent_no };
      if (editingRecord?.id) {
        await patentApi.update(enterpriseId, editingRecord.id, body);
        message.success('专利信息更新成功');
      } else {
        await patentApi.create(enterpriseId, body);
        message.success('专利添加成功');
      }
      const detail = await enterpriseApi.getDetail(enterpriseId);
      if (detail.data) {
        onSuccess(detail.data.patents || []);
      } else {
        onSuccess([]);
      }
      onClose();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || '保存失败');
    }
  };

  return (
    <Modal
      maskClosable={false}
      title={editingRecord ? '编辑专利' : '添加专利'}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
      width={500}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="name" label="专利/技术名称" rules={[{ required: true, message: '请输入专利名称' }]}>
          <Input placeholder="请输入专利或核心技术名称" />
        </Form.Item>
        <Form.Item name="patent_no" label="专利号">
          <Input placeholder="如：ZL2023XXXXXXXX.X" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
