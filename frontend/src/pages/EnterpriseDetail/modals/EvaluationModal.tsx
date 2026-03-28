import { useEffect } from 'react';
import { Modal, Form, Select, message } from 'antd';
import request from '@/services/request';
import { RATING_ITEMS, FEASIBILITY_RATING_SELECT_OPTIONS } from '../constants';

type EvaluationData = Record<string, number | undefined>;

interface EvaluationModalProps {
  open: boolean;
  enterpriseId: number;
  initialData: EvaluationData;
  onClose: () => void;
  onSuccess: (data: EvaluationData) => void;
}

export default function EvaluationModal({
  open,
  enterpriseId,
  initialData,
  onClose,
  onSuccess,
}: EvaluationModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      const mapped: EvaluationData = {};
      RATING_ITEMS.forEach((item) => {
        mapped[item.apiField] = initialData[item.apiField];
      });
      form.setFieldsValue(mapped);
    } else {
      form.resetFields();
    }
  }, [open, initialData, form]);

  const handleOk = async () => {
    try {
      const values = form.getFieldsValue();
      const body: Record<string, number | undefined> = {};
      RATING_ITEMS.forEach((item) => {
        body[item.apiField] = values[item.apiField];
      });
      await request.put(`/enterprises/${enterpriseId}`, body);
      message.success('合作可能性评估更新成功');
      onSuccess(values as EvaluationData);
      onClose();
    } catch (e: any) {
      message.error(e?.message || '保存失败');
    }
  };

  return (
    <Modal
      maskClosable={false}
      title="编辑合作可能性评估"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
      width={600}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        {RATING_ITEMS.map((item) => (
          <Form.Item
            key={item.apiField}
            name={item.apiField}
            label={
              <span>
                {item.label}{' '}
                <span style={{ color: '#888', fontSize: 12 }}>({item.desc})</span>
              </span>
            }
          >
            <Select
              placeholder="请选择评分"
              style={{ width: '100%' }}
              options={FEASIBILITY_RATING_SELECT_OPTIONS}
            />
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
}
