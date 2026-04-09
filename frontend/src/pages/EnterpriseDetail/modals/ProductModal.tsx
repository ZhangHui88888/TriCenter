import { useCallback, useEffect } from 'react';
import { Modal, Form, Row, Col, Input, Select, Cascader, Card, message } from 'antd';
import { productApi, enterpriseApi } from '@/services/api';
import { getCountryNameOptions, getRegionByCountryName, REGION_LABEL_MAP } from '@/data/countries';
import {
  findProductCategoryPath,
  stripTrailingPercentForInput,
  ensurePercentSuffix,
} from '../utils';

interface ProductModalProps {
  open: boolean;
  enterpriseId: number;
  editingRecord: any | null;
  productCategoryTree: any[];
  productCascaderOptions: any[];
  certificationOptions: any[];
  regionOptions: any[];
  automationLevelOptions: any[];
  logisticsOptions: any[];
  onClose: () => void;
  onSuccess: (products: any[], overviewRegionNames?: string, overviewCountryNames?: string) => void;
}

export default function ProductModal({
  open,
  enterpriseId,
  editingRecord,
  productCategoryTree,
  productCascaderOptions,
  certificationOptions,
  regionOptions,
  automationLevelOptions,
  logisticsOptions,
  onClose,
  onSuccess,
}: ProductModalProps) {
  const [form] = Form.useForm();

  const handleCountriesChange = useCallback(
    (selectedCountryNames: string[]) => {
      const regionCodes = new Set(
        selectedCountryNames.map(getRegionByCountryName).filter(Boolean) as string[],
      );
      const regionIdsFromCountries = [...regionCodes]
        .map((code) => {
          const label = REGION_LABEL_MAP[code];
          return regionOptions.find((o: any) => o.label === label)?.value;
        })
        .filter((id): id is number => id != null);

      const current: number[] = form.getFieldValue('target_region_ids') || [];
      const merged = [...new Set([...current, ...regionIdsFromCountries])];
      form.setFieldsValue({ target_region_ids: merged });
    },
    [form, regionOptions],
  );

  useEffect(() => {
    if (open && editingRecord) {
      const catPath =
        editingRecord.categoryId != null
          ? findProductCategoryPath(productCategoryTree, editingRecord.categoryId)
          : null;
      const localPct =
        editingRecord.localProcurementRatio != null
          ? parseFloat(String(editingRecord.localProcurementRatio).replace(/[^\d.]/g, '')) || undefined
          : undefined;
      form.setFieldsValue({
        name: editingRecord.name,
        category: catPath || undefined,
        certification_ids: editingRecord.certificationIds || [],
        target_region_ids: editingRecord.targetRegionIds || [],
        target_country_ids: editingRecord.targetCountryIds || [],
        annual_sales: editingRecord.annualSales,
        export_ratio: stripTrailingPercentForInput(editingRecord.exportRatio),
        profit_margin: stripTrailingPercentForInput(editingRecord.profitMargin),
        local_procurement: localPct,
        automation_level_id: editingRecord.automationLevelId,
        annual_capacity: editingRecord.annualCapacity,
        logistics_partner_ids: editingRecord.logisticsPartnerIds || [],
      });
    } else if (!open) {
      form.resetFields();
    }
  }, [open, editingRecord, productCategoryTree, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const categoryId =
        Array.isArray(values.category) && values.category.length
          ? values.category[values.category.length - 1]
          : values.category;
      const payload = {
        name: values.name,
        categoryId: categoryId ?? undefined,
        certificationIds:
          Array.isArray(values.certification_ids) && values.certification_ids.length
            ? values.certification_ids
            : undefined,
        targetRegionIds:
          Array.isArray(values.target_region_ids) && values.target_region_ids.length
            ? values.target_region_ids
            : undefined,
        targetCountryIds:
          Array.isArray(values.target_country_ids) && values.target_country_ids.length
            ? values.target_country_ids
            : undefined,
        annualSales:
          values.annual_sales != null && values.annual_sales !== ''
            ? String(values.annual_sales)
            : undefined,
        exportRatio: ensurePercentSuffix(values.export_ratio),
        profitMargin: ensurePercentSuffix(values.profit_margin),
        localProcurementRatio:
          values.local_procurement != null && values.local_procurement !== ''
            ? `${values.local_procurement}%`
            : undefined,
        automationLevelId: values.automation_level_id ?? undefined,
        annualCapacity: values.annual_capacity || undefined,
        logisticsPartnerIds:
          Array.isArray(values.logistics_partner_ids) && values.logistics_partner_ids.length
            ? values.logistics_partner_ids
            : undefined,
      };
      if (editingRecord?.id) {
        await productApi.update(enterpriseId, editingRecord.id, payload);
        message.success('产品信息更新成功');
      } else {
        await productApi.create(enterpriseId, payload);
        message.success('产品添加成功');
      }
      const detail = await enterpriseApi.getDetail(enterpriseId);
      if (detail.data) {
        onSuccess(
          detail.data.products || [],
          detail.data.overviewMergedTargetRegionNames,
          detail.data.overviewMergedTargetCountryNames,
        );
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
      title={editingRecord ? '编辑产品' : '添加产品'}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
      width={700}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="name" label="产品名称" rules={[{ required: true, message: '请输入产品名称' }]}>
              <Input placeholder="请输入产品名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="category" label="产品品类">
              <Cascader
                placeholder="请选择产品品类"
                options={productCascaderOptions}
                showSearch
                changeOnSelect
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="certification_ids" label="产品认证">
              <Select
                mode="multiple"
                placeholder="请选择产品认证（字典 certification，保存为选项 ID）"
                options={certificationOptions}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="annual_sales" label="年销售额(万元)">
              <Input type="number" placeholder="请输入年销售额" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="export_ratio" label="出口占比">
              <Input placeholder="如 60" suffix="%" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="profit_margin" label="利润率">
              <Input placeholder="如 15 或 15-20" suffix="%" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="target_region_ids" label="主要销售区域">
              <Select
                mode="multiple"
                placeholder="请选择销售区域（字典 region）"
                options={regionOptions}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="target_country_ids" label="主要销售国家">
              <Select
                mode="tags"
                placeholder="输入或选择国家/地区名称"
                allowClear
                showSearch
                optionFilterProp="label"
                options={getCountryNameOptions()}
                onChange={handleCountriesChange}
              />
            </Form.Item>
          </Col>
        </Row>
        <Card size="small" title="供应链与产能" style={{ marginTop: 8 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="local_procurement" label="原材料本地采购比例(%)">
                <Input type="number" placeholder="如：70" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="automation_level_id" label="设备自动化程度">
                <Select
                  placeholder="请选择（字典 automation_level）"
                  options={automationLevelOptions}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="annual_capacity" label="年产能">
                <Input placeholder="如：30万件" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="logistics_partner_ids" label="物流合作方">
                <Select
                  mode="multiple"
                  placeholder="请选择物流合作方（字典 logistics）"
                  options={logisticsOptions}
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
}
