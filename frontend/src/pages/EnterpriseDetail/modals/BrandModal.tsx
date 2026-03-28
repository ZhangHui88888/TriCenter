import { useEffect } from 'react';
import { Modal, Form, Select, message } from 'antd';
import request from '@/services/request';

interface BrandModalProps {
  open: boolean;
  enterpriseId: number;
  initialHasOwnBrand: boolean;
  initialBrandNames: string[];
  onClose: () => void;
  onSuccess: (hasOwnBrand: boolean, brandNames: string[]) => void;
}

export default function BrandModal({
  open,
  enterpriseId,
  initialHasOwnBrand,
  initialBrandNames,
  onClose,
  onSuccess,
}: BrandModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        has_brand: initialHasOwnBrand,
        brand_names: initialBrandNames,
      });
    } else {
      form.resetFields();
    }
  }, [open, initialHasOwnBrand, initialBrandNames, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const hasOwn = values.has_brand === true ? 1 : 0;
      const names: string[] = Array.isArray(values.brand_names) ? values.brand_names.filter(Boolean) : [];
      await request.put(`/enterprises/${enterpriseId}`, {
        hasOwnBrand: hasOwn,
        brandNames: names.length ? names.join(',') : '',
      });
      message.success('品牌信息更新成功');
      onSuccess(hasOwn === 1, names);
      onClose();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || '保存失败');
    }
  };

  return (
    <Modal
      maskClosable={false}
      title="编辑自主品牌"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
      width={500}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="has_brand" label="是否有自主品牌">
          <Select
            options={[
              { label: '是', value: true },
              { label: '否', value: false },
            ]}
          />
        </Form.Item>
        <Form.Item name="brand_names" label="品牌名称">
          <Select
            mode="tags"
            placeholder="输入品牌名称后按回车添加"
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
