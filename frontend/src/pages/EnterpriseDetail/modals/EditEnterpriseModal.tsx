import { useEffect } from 'react';
import dayjs from 'dayjs';
import { Modal, Form, Input, InputNumber, Select, Row, Col, Cascader, DatePicker, message } from 'antd';
import { ENTERPRISE_TYPE_OPTIONS } from '@/utils/constants';
import { enterpriseApi } from '@/services/api';

function findIndustryCascaderPath(nodes: any[], targetId: unknown, path: number[] = []): number[] | null {
  if (targetId == null || targetId === '') return null;
  const tid = Number(targetId);
  if (Number.isNaN(tid)) return null;
  for (const n of nodes || []) {
    const val = n.value as number;
    const next = [...path, val];
    if (val === tid) return next;
    if (n.children?.length) {
      const sub = findIndustryCascaderPath(n.children, targetId, next);
      if (sub) return sub;
    }
  }
  return null;
}

interface EditEnterpriseModalProps {
  open: boolean;
  enterprise: any;
  industryCategories: any[];
  staffSizeOptions: any[];
  sourceOptions: any[];
  sourceProviderOptions: any[];
  onClose: () => void;
  onSuccess: (updatedEnterprise: any) => void;
}

export default function EditEnterpriseModal({
  open,
  enterprise,
  industryCategories,
  staffSizeOptions,
  sourceOptions,
  sourceProviderOptions,
  onClose,
  onSuccess,
}: EditEnterpriseModalProps) {
  const [form] = Form.useForm();
  const sourceIdValue = Form.useWatch('source_id', form);
  const isProviderSource = sourceOptions.some((o: any) => o.value === sourceIdValue && o.label === '服务商');

  useEffect(() => {
    if (open && enterprise) {
      form.setFieldsValue({
        enterprise_name: enterprise.enterprise_name,
        unified_credit_code: enterprise.unified_credit_code,
        established_date: enterprise.established_date ? dayjs(enterprise.established_date) : undefined,
        registered_capital: enterprise.registered_capital
          ? parseFloat(String(enterprise.registered_capital).replace(/[^\d.]/g, '')) || undefined
          : undefined,
        province: enterprise.province,
        city: enterprise.city,
        district: enterprise.district,
        industry_id:
          findIndustryCascaderPath(industryCategories, enterprise.industry_id) ??
          (enterprise.industry_id != null ? [enterprise.industry_id] : undefined),
        enterprise_type: enterprise.enterprise_type,
        staff_size_id: enterprise.staff_size_id,
        detailed_address: enterprise.detailed_address,
        domestic_revenue_wan: enterprise.domestic_revenue_wan ?? undefined,
        crossborder_revenue_wan: enterprise.last_year_revenue ?? undefined,
        source_id: enterprise.source_id,
        source_provider_id: enterprise.source_provider_id,
        website: enterprise.website,
        iso_certifications: enterprise.iso_certifications ?? '',
        aeo_certification: enterprise.aeo_certification ?? '',
        other_certifications: enterprise.other_certifications ?? '',
        hasImportExportLicense:
          enterprise.has_import_export_license === true ||
          enterprise.has_import_export_license === 1 ||
          enterprise.has_import_export_license === '1',
        import_export_code: enterprise.import_export_code ?? '',
      });
    }
  }, [open, enterprise, industryCategories, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const industryId = Array.isArray(values.industry_id)
        ? values.industry_id[values.industry_id.length - 1]
        : values.industry_id;
      const parseWan = (raw: unknown): number | null => {
        if (raw == null || raw === '') return null;
        const n = typeof raw === 'number' ? raw : Number(raw);
        return Number.isFinite(n) ? n : null;
      };
      const updateData = {
        name: values.enterprise_name,
        creditCode: values.unified_credit_code,
        establishedDate: values.established_date ? dayjs(values.established_date).format('YYYY-MM-DD') : undefined,
        registeredCapital: values.registered_capital != null ? `${values.registered_capital}万元` : undefined,
        province: values.province,
        city: values.city,
        district: values.district,
        address: values.detailed_address,
        industryId,
        enterpriseType: values.enterprise_type,
        staffSizeId: values.staff_size_id,
        website: values.website,
        domesticRevenueWanTouched: true,
        domesticRevenueWan: parseWan(values.domestic_revenue_wan),
        lastYearRevenue: parseWan(values.crossborder_revenue_wan),
        sourceId: values.source_id,
        sourceProviderId: isProviderSource ? (values.source_provider_id ?? null) : null,
        hasImportExportLicense:
          values.hasImportExportLicense === true || values.hasImportExportLicense === 1 ? 1 : 0,
        importExportCode: (values.import_export_code ?? '').trim(),
        isoCertifications: (values.iso_certifications ?? '').trim(),
        aeoCertification: (values.aeo_certification ?? '').trim(),
        otherCertifications: (values.other_certifications ?? '').trim(),
      };
      await enterpriseApi.update(enterprise.id, updateData);
      const response = await enterpriseApi.getDetail(enterprise.id);
      if (response.data) {
        const data = response.data;
        onSuccess({
          enterprise_name: data.name,
          unified_credit_code: data.creditCode,
          established_date: data.establishedDate,
          registered_capital: data.registeredCapital,
          province: data.province,
          city: data.city,
          district: data.district,
          detailed_address: data.address,
          industry: data.industryName,
          industry_id: data.industryId,
          enterprise_type: data.enterpriseType,
          employee_scale: data.staffSizeLabel,
          staff_size_id: data.staffSizeId,
          website: data.website,
          domestic_revenue: data.domesticRevenueLabel,
          domestic_revenue_id: data.domesticRevenueId,
          domestic_revenue_wan: data.domesticRevenueWan != null ? Number(data.domesticRevenueWan) : undefined,
          crossborder_revenue: data.crossBorderRevenueLabel,
          last_year_revenue: data.lastYearRevenue != null ? Number(data.lastYearRevenue) : undefined,
          source: data.sourceLabel,
          source_id: data.sourceId,
          source_provider: data.sourceProviderLabel,
          source_provider_id: data.sourceProviderId,
          iso_certifications: data.isoCertifications,
          aeo_certification: data.aeoCertification,
          other_certifications: data.otherCertifications,
          has_import_export_license: data.hasImportExportLicense,
          import_export_code: data.importExportCode,
        });
      }
      message.success('企业信息更新成功');
      onClose();
      form.resetFields();
    } catch (error: any) {
      if (error.errorFields) return;
      message.error(error.message || '更新失败');
    }
  };

  return (
    <Modal
      maskClosable={false}
      title="编辑企业信息"
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
            <Form.Item name="enterprise_name" label="企业名称">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="unified_credit_code" label="统一社会信用代码">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="established_date" label="成立日期">
              <DatePicker style={{ width: '100%' }} placeholder="请选择成立日期" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="registered_capital" label="注册资本">
              <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入注册资本" addonAfter="万元" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="industry_id" label="所属行业">
              <Cascader
                options={industryCategories}
                placeholder="请选择行业"
                showSearch={{
                  filter: (inputValue, path) =>
                    path.some(option =>
                      (option.label as string).toLowerCase().includes(inputValue.toLowerCase())
                    ),
                }}
                changeOnSelect
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="enterprise_type" label="企业类型">
              <Select options={ENTERPRISE_TYPE_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="staff_size_id" label="人员规模">
              <Select options={staffSizeOptions} placeholder="请选择" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="企业地址" style={{ marginBottom: 16 }}>
              <Row gutter={8}>
                <Col span={8}>
                  <Form.Item name="province" noStyle>
                    <Select placeholder="省份" options={[{ label: '江苏省', value: '江苏省' }]} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="city" noStyle>
                    <Select placeholder="城市" options={[{ label: '常州市', value: '常州市' }]} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="district" noStyle>
                    <Select
                      placeholder="区/县"
                      options={[
                        { label: '武进区', value: '武进区' },
                        { label: '新北区', value: '新北区' },
                        { label: '天宁区', value: '天宁区' },
                        { label: '钟楼区', value: '钟楼区' },
                        { label: '经开区', value: '经开区' },
                        { label: '金坛区', value: '金坛区' },
                        { label: '溧阳市', value: '溧阳市' },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="detailed_address" label="详细地址">
              <Input placeholder="请输入街道、门牌号等详细地址" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="domestic_revenue_wan" label="国内营收(万元)">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入具体金额（万元）" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="crossborder_revenue_wan" label="跨境营收(万元)">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入数字" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="hasImportExportLicense" label="进出口经营权">
              <Select
                allowClear={false}
                options={[
                  { label: '有', value: true },
                  { label: '无', value: false },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="import_export_code" label="进出口收发货人代码">
              <Input placeholder="请输入收发货人代码" maxLength={20} />
            </Form.Item>
          </Col>
          <Col span={isProviderSource ? 6 : 12}>
            <Form.Item name="source_id" label="企业来源">
              <Select
                placeholder="请选择"
                options={sourceOptions}
                allowClear
                onChange={() => form.setFieldValue('source_provider_id', undefined)}
              />
            </Form.Item>
          </Col>
          {isProviderSource && (
            <Col span={6}>
              <Form.Item name="source_provider_id" label="服务商">
                <Select placeholder="请选择服务商" options={sourceProviderOptions} allowClear />
              </Form.Item>
            </Col>
          )}
          <Col span={12}>
            <Form.Item name="website" label="官网">
              <Input placeholder="请输入官网地址" />
            </Form.Item>
          </Col>
          <Col span={24} style={{ marginTop: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a56db', marginBottom: 8, borderBottom: '1px solid #e8eefb', paddingBottom: 4 }}>企业资质认证</div>
          </Col>
          <Col span={12}>
            <Form.Item name="iso_certifications" label="ISO认证">
              <Input placeholder="如 ISO9001:2015, ISO14001" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="aeo_certification" label="AEO认证等级">
              <Input placeholder="如：高级认证、一般认证" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="other_certifications" label="其他资质证书">
              <Input placeholder="如 CE、FDA、高新技术企业等" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
