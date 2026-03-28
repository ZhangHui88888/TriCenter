import { useEffect } from 'react';
import { Modal, Form, Select, Row, Col, Alert, message } from 'antd';
import request from '@/services/request';

const COUNTRY_OPTIONS = [
  { label: '美国', value: '美国' }, { label: '加拿大', value: '加拿大' },
  { label: '英国', value: '英国' }, { label: '德国', value: '德国' },
  { label: '法国', value: '法国' }, { label: '日本', value: '日本' },
  { label: '韩国', value: '韩国' }, { label: '澳大利亚', value: '澳大利亚' },
  { label: '新加坡', value: '新加坡' }, { label: '马来西亚', value: '马来西亚' },
  { label: '泰国', value: '泰国' }, { label: '越南', value: '越南' },
  { label: '印度', value: '印度' }, { label: '阿联酋', value: '阿联酋' },
];

function mergeIds(enterprise: any, products: any[], fieldSnake: string, fieldCamel: string): any[] {
  const enterpriseIds =
    Array.isArray(enterprise[fieldSnake]) && enterprise[fieldSnake].length > 0
      ? enterprise[fieldSnake]
      : Array.isArray(enterprise[fieldCamel])
        ? enterprise[fieldCamel]
        : [];
  const productIds = (products || []).flatMap((p: any) => {
    const ids = p[fieldCamel] || p[fieldSnake];
    return Array.isArray(ids) ? ids : [];
  });
  return [...new Set([...enterpriseIds, ...productIds].filter(Boolean))];
}

interface ProductOverviewModalProps {
  open: boolean;
  enterpriseId: number;
  enterprise: any;
  regionOptions: { label: string; value: number }[];
  onClose: () => void;
  onSuccess: (data: { targetRegionIds: number[]; targetCountryIds: string[]; hasImportExportLicense: number }) => void;
}

export default function ProductOverviewModal({
  open,
  enterpriseId,
  enterprise,
  regionOptions,
  onClose,
  onSuccess,
}: ProductOverviewModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && enterprise) {
      const regionIds = mergeIds(enterprise, enterprise.products, 'target_region_ids', 'targetRegionIds')
        .map((id: any) => Number(id))
        .filter((id: number) => Number.isFinite(id));
      const countryIds = mergeIds(enterprise, enterprise.products, 'target_country_ids', 'targetCountryIds');
      const lic = enterprise.has_import_export_license;
      const hasLicense = lic === true || lic === 1 || lic === '1' || enterprise.hasImportExportLicense === true || enterprise.hasImportExportLicense === 1;
      form.setFieldsValue({ targetRegionIds: regionIds, targetCountryIds: countryIds, hasImportExportLicense: hasLicense });
    } else {
      form.resetFields();
    }
  }, [open, enterprise, form]);

  const handleOk = async () => {
    const values = form.getFieldsValue(true);
    const fallbackRegions = mergeIds(enterprise, enterprise.products, 'target_region_ids', 'targetRegionIds')
      .map((id: any) => Number(id))
      .filter((id: number) => Number.isFinite(id))
      .filter((id: number, i: number, arr: number[]) => arr.indexOf(id) === i);
    const fallbackCountries = mergeIds(enterprise, enterprise.products, 'target_country_ids', 'targetCountryIds')
      .filter((id: any, i: number, arr: any[]) => arr.indexOf(id) === i);

    const targetRegionIds = Array.isArray(values.targetRegionIds) ? values.targetRegionIds : fallbackRegions;
    const targetCountryIds = Array.isArray(values.targetCountryIds) ? values.targetCountryIds : fallbackCountries;
    let licVal = values.hasImportExportLicense;
    if (licVal === undefined || licVal === null) {
      const lic = enterprise.has_import_export_license;
      licVal = lic === true || lic === 1 || lic === '1';
    }
    const payload = { targetRegionIds, targetCountryIds, hasImportExportLicense: licVal ? 1 : 0 };
    try {
      await request.put(`/enterprises/${enterpriseId}`, payload);
      message.success('产品信息更新成功');
      onSuccess(payload);
      onClose();
    } catch (e: any) {
      message.error(e?.message || '保存失败');
    }
  };

  return (
    <Modal
      maskClosable={false}
      title="编辑产品信息"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
      width={640}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="说明"
          description="是否有进出口资质仅在本弹窗维护。主要销售区域、主要销售国家：概览区展示为「企业级（本弹窗）+ 全部产品」去重合并；若仅在产品列表中填写，也会出现在概览。产品数量、产品品类、年销售额合计、产品认证、物流合作方由下方「产品列表」自动汇总。"
        />
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="targetRegionIds" label="主要销售区域">
              <Select mode="multiple" placeholder="请选择销售区域" options={regionOptions} allowClear />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="targetCountryIds" label="主要销售国家">
              <Select mode="multiple" placeholder="请选择销售国家" allowClear options={COUNTRY_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="hasImportExportLicense" label="是否有进出口资质">
              <Select allowClear={false} options={[{ label: '是', value: true }, { label: '否', value: false }]} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
