import { useEffect } from 'react';
import { Modal, Form, Select, Input, Row, Col, message } from 'antd';
import request from '@/services/request';

const LOGISTICS_OPTIONS = [
  { label: '海运', value: '海运' },
  { label: '空运', value: '空运' },
  { label: '国际快递', value: '国际快递' },
  { label: 'FBA (亚马逊物流)', value: 'FBA (亚马逊物流)' },
  { label: '海外仓', value: '海外仓' },
  { label: '一件代发', value: '一件代发' },
  { label: '中国邮政小包', value: '中国邮政小包' },
  { label: '专线物流', value: '专线物流' },
  { label: '铁路运输', value: '铁路运输' },
  { label: '混合模式', value: '混合模式' },
  { label: '其他', value: '其他' },
];

const PAYMENT_OPTIONS = [
  { label: 'FOB (离岸价)', value: 'FOB (离岸价)' },
  { label: 'CIF (到岸价)', value: 'CIF (到岸价)' },
  { label: 'EXW (工厂交货)', value: 'EXW (工厂交货)' },
  { label: 'DDP (完税后交货)', value: 'DDP (完税后交货)' },
  { label: '现款现货', value: '现款现货' },
  { label: '账期30天', value: '账期30天' },
  { label: '账期60天', value: '账期60天' },
  { label: '账期90天', value: '账期90天' },
  { label: '信用证 (L/C)', value: '信用证 (L/C)' },
  { label: '电汇 (T/T)', value: '电汇 (T/T)' },
  { label: 'PayPal', value: 'PayPal' },
  { label: 'Stripe', value: 'Stripe' },
  { label: '支付宝国际', value: '支付宝国际' },
  { label: '平台代收', value: '平台代收' },
  { label: '其他', value: '其他' },
];

const WILLINGNESS_OPTIONS = [
  { label: '高', value: '高' },
  { label: '中', value: '中' },
  { label: '低', value: '低' },
];

interface CrossborderBasicData {
  hasCrossBorder: boolean;
  crossBorderRatio: string | null;
  crossBorderLogistics: string | null;
  paymentSettlement: string | null;
  crossBorderTeamSize: number | null;
  usingErp: number;
  transformationWillingness: string | null;
  investmentWillingness: string | null;
}

interface CrossborderBasicModalProps {
  open: boolean;
  enterpriseId: number;
  initialData: {
    hasCrossBorder: boolean;
    crossBorderRatio: string;
    crossBorderLogistics: string;
    paymentSettlement: string;
    crossBorderTeamSize: number | null;
    usingErp: boolean;
    transformationWillingness: string;
    investmentWillingness: string;
  };
  onClose: () => void;
  onSuccess: (data: CrossborderBasicData) => void;
}

export default function CrossborderBasicModal({
  open,
  enterpriseId,
  initialData,
  onClose,
  onSuccess,
}: CrossborderBasicModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      const erpOn = initialData.usingErp === true || (initialData.usingErp as any) === 1;
      form.setFieldsValue({
        hasCrossBorder: !!initialData.hasCrossBorder,
        crossBorderRatio:
          initialData.crossBorderRatio != null && initialData.crossBorderRatio !== ''
            ? String(initialData.crossBorderRatio).replace(/%$/, '')
            : undefined,
        crossBorderLogistics: initialData.crossBorderLogistics,
        paymentSettlement: initialData.paymentSettlement,
        crossBorderTeamSize: initialData.crossBorderTeamSize,
        usingErp: erpOn ? 1 : 0,
        transformationWillingness: initialData.transformationWillingness,
        investmentWillingness: initialData.investmentWillingness,
      });
    } else {
      form.resetFields();
    }
  }, [open, initialData, form]);

  const handleOk = async () => {
    try {
      await form.validateFields();
    } catch {
      return;
    }
    const values = form.getFieldsValue();
    const rawRatio = values.crossBorderRatio;
    const crossBorderRatioStr =
      rawRatio === undefined || rawRatio === null || String(rawRatio).trim() === ''
        ? null
        : String(rawRatio).trim();
    const rawTeam = values.crossBorderTeamSize;
    const crossBorderTeamSize =
      rawTeam === undefined || rawTeam === null || rawTeam === ''
        ? null
        : Number(rawTeam);
    const payload = {
      hasCrossBorder: values.hasCrossBorder ? 1 : 0,
      crossBorderRatio: crossBorderRatioStr,
      crossBorderLogistics: values.crossBorderLogistics ?? null,
      paymentSettlement: values.paymentSettlement ?? null,
      crossBorderTeamSize:
        crossBorderTeamSize != null && Number.isFinite(crossBorderTeamSize)
          ? crossBorderTeamSize
          : null,
      usingErp: values.usingErp === 1 || values.usingErp === true ? 1 : 0,
      transformationWillingness: values.transformationWillingness ?? null,
      investmentWillingness: values.investmentWillingness ?? null,
    };
    try {
      await request.put(`/enterprises/${enterpriseId}`, payload);
      message.success('跨境基本信息更新成功');
      onSuccess(payload as unknown as CrossborderBasicData);
      onClose();
    } catch (e: any) {
      message.error(e?.message || '保存失败');
    }
  };

  return (
    <Modal
      maskClosable={false}
      title="编辑跨境基本信息"
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
            <Form.Item name="hasCrossBorder" label="是否开展跨境电商">
              <Select options={[{ label: '是', value: true }, { label: '否', value: false }]} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="crossBorderRatio" label="跨境业务占比(%)">
              <Input type="number" placeholder="请输入占比" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="crossBorderLogistics" label="跨境物流模式">
              <Select placeholder="请选择物流模式" options={LOGISTICS_OPTIONS} showSearch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="paymentSettlement" label="支付结算方式">
              <Select placeholder="请选择结算方式" options={PAYMENT_OPTIONS} showSearch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="crossBorderTeamSize" label="跨境电商团队规模">
              <Input type="number" placeholder="请输入团队规模" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="usingErp" label="是否在用ERP">
              <Select
                placeholder="请选择"
                options={[
                  { label: '是', value: 1 },
                  { label: '否', value: 0 },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="transformationWillingness" label="跨境转型意愿">
              <Select options={WILLINGNESS_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="investmentWillingness" label="愿意投入转型程度">
              <Select options={WILLINGNESS_OPTIONS} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
