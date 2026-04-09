import { useEffect } from 'react';
import {
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  TreeSelect,
  message,
} from 'antd';
import { providerApi } from '@/services/api';
import type { ProviderDetail } from '@/types';
import { requirementTreeData, type SelectOption } from '../constants';
import { buildProviderUpdatePayload } from '../utils';

type EditProviderBasicInfoModalProps = {
  open: boolean;
  provider: ProviderDetail | null;
  staffSizeOptions: SelectOption[];
  districtOptions: string[];
  onClose: () => void;
  onSuccess: (provider: ProviderDetail) => void;
};

type FormValues = {
  name: string;
  creditCode?: string;
  staffSizeId?: number | null;
  province?: string;
  city?: string;
  district?: string;
  address?: string;
  website?: string;
  qualification?: string;
  description?: string;
  capabilityRequirementIds?: string[];
};

export default function EditProviderBasicInfoModal({
  open,
  provider,
  staffSizeOptions,
  districtOptions,
  onClose,
  onSuccess,
}: EditProviderBasicInfoModalProps) {
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    if (open && provider) {
      form.setFieldsValue({
        name: provider.name,
        creditCode: provider.creditCode,
        staffSizeId: provider.staffSizeId ?? null,
        province: provider.province,
        city: provider.city,
        district: provider.district,
        address: provider.address,
        website: provider.website,
        qualification: provider.qualification,
        description: provider.description,
        capabilityRequirementIds: provider.capabilityRequirementIds || [],
      });
    }
  }, [form, open, provider]);

  const handleOk = async () => {
    if (!provider) {
      return;
    }

    try {
      const values = await form.validateFields();
      const payload = buildProviderUpdatePayload(provider, {
        name: values.name.trim(),
        category: undefined,
        creditCode: values.creditCode?.trim() || undefined,
        cooperationStartDate: undefined,
        contractEndDate: undefined,
        cooperationStatus: undefined,
        staffSizeId: values.staffSizeId ?? null,
        province: values.province || undefined,
        city: values.city || undefined,
        district: values.district || undefined,
        address: values.address?.trim() || undefined,
        website: values.website?.trim() || undefined,
        qualification: values.qualification?.trim() || undefined,
        serviceScope: undefined,
        description: values.description?.trim() || undefined,
        capabilityRequirementIds: values.capabilityRequirementIds || [],
      });
      await providerApi.update(provider.id, payload);
      const response = await providerApi.getDetail(provider.id);
      onSuccess(response?.data ?? response);
      message.success('服务商基本信息更新成功');
      onClose();
      form.resetFields();
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      message.error(error?.message || '更新失败');
    }
  };

  return (
    <Modal
      maskClosable={false}
      title="编辑服务商基本信息"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
      width={760}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="name" label="服务商名称" rules={[{ required: true, message: '请输入服务商名称' }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="staffSizeId" label="人员规模">
              <Select allowClear options={staffSizeOptions.map((item) => ({ label: item.label, value: item.value }))} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="creditCode" label="统一社会信用代码">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="website" label="官网">
              <Input placeholder="请输入官网地址" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="服务商地址" style={{ marginBottom: 16 }}>
              <Row gutter={8}>
                <Col span={8}>
                  <Form.Item name="province" noStyle>
                    <Select placeholder="省份" options={[{ label: '江苏省', value: '江苏省' }]} allowClear />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="city" noStyle>
                    <Select placeholder="城市" options={[{ label: '常州市', value: '常州市' }]} allowClear />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="district" noStyle>
                    <Select
                      placeholder="区/县"
                      options={districtOptions.map((item) => ({ label: item, value: item }))}
                      allowClear
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="address" label="详细地址">
              <Input placeholder="请输入街道、门牌号等详细地址" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="qualification" label="资质说明">
              <Input.TextArea rows={3} placeholder="请输入资质说明" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="description" label="服务商简介">
              <Input.TextArea rows={4} placeholder="请输入服务商简介" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="capabilityRequirementIds" label="服务分类" rules={[{ required: true, message: '请选择至少一个服务分类' }]}>
              <TreeSelect
                treeData={requirementTreeData}
                multiple
                treeCheckable
                showCheckedStrategy={TreeSelect.SHOW_CHILD}
                placeholder="请选择对应的二级需求"
                allowClear
                maxTagCount="responsive"
                showSearch
                treeNodeFilterProp="title"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
