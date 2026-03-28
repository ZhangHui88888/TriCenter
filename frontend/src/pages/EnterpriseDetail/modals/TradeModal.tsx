import { useEffect } from 'react';
import { Modal, Form, Select, Input, Row, Col, message } from 'antd';
import request from '@/services/request';

interface TradeModalProps {
  open: boolean;
  enterpriseId: number;
  initialData: {
    tradeModeId: number | null;
    customsDeclarationMode: string;
    tradeTeamModeId: number | null;
    tradeTeamSize: number | null;
    hasDomesticEcommerce: boolean;
    hasOverseasDistributors: boolean;
  };
  tradeModeOptions: { label: string; value: number }[];
  tradeTeamModeOptions: { label: string; value: number }[];
  marketChanges: { up: any[]; down: any[] };
  modeChanges: { up: any[]; down: any[] };
  categoryChanges: { up: any[]; down: any[] };
  growthReasons: string[];
  declineReasons: string[];
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export default function TradeModal({
  open,
  enterpriseId,
  initialData,
  tradeModeOptions,
  tradeTeamModeOptions,
  marketChanges,
  modeChanges,
  categoryChanges,
  growthReasons,
  declineReasons,
  onClose,
  onSuccess,
}: TradeModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        tradeModeId: initialData.tradeModeId,
        customsDeclarationMode: initialData.customsDeclarationMode,
        tradeTeamModeId: initialData.tradeTeamModeId,
        tradeTeamSize: initialData.tradeTeamSize,
        hasDomesticEcommerce: initialData.hasDomesticEcommerce,
        hasOverseasDistributors: initialData.hasOverseasDistributors,
      });
    } else {
      form.resetFields();
    }
  }, [open, initialData, form]);

  const handleOk = async () => {
    const values = form.getFieldsValue();
    const rawSize = values.tradeTeamSize;
    const tradeTeamSize =
      rawSize === undefined || rawSize === null || rawSize === '' ? null : Number(rawSize);
    try {
      await request.put(`/enterprises/${enterpriseId}`, {
        tradeModeId: values.tradeModeId,
        customsDeclarationMode: values.customsDeclarationMode,
        tradeTeamModeId: values.tradeTeamModeId,
        tradeTeamSize: Number.isFinite(tradeTeamSize as number) ? tradeTeamSize : null,
        hasDomesticEcommerce: values.hasDomesticEcommerce ? 1 : 0,
        hasOverseasDistributors: values.hasOverseasDistributors ? 1 : 0,
        marketChanges,
        modeChanges,
        categoryChanges,
        growthReasons,
        declineReasons,
      });
      message.success('外贸信息更新成功');
      onSuccess({
        tradeModeId: values.tradeModeId,
        customsDeclarationMode: values.customsDeclarationMode,
        tradeTeamModeId: values.tradeTeamModeId,
        tradeTeamSize: Number.isFinite(tradeTeamSize as number) ? tradeTeamSize : null,
        hasDomesticEcommerce: values.hasDomesticEcommerce ? 1 : 0,
        hasOverseasDistributors: values.hasOverseasDistributors ? 1 : 0,
      });
      onClose();
    } catch (e: any) {
      message.error(e?.message || '保存失败');
    }
  };

  return (
    <Modal
      maskClosable={false}
      title="编辑外贸信息"
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
            <Form.Item name="tradeModeId" label="外贸模式">
              <Select placeholder="请选择外贸模式" options={tradeModeOptions} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="customsDeclarationMode" label="报关申报主体模式">
              <Select options={[{ label: '自营', value: '自营' }, { label: '代理', value: '代理' }]} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="tradeTeamModeId" label="外贸业务团队模式">
              <Select placeholder="请选择团队模式" options={tradeTeamModeOptions} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="tradeTeamSize" label="外贸团队人数">
              <Input type="number" placeholder="请输入团队人数" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="hasDomesticEcommerce" label="是否有国内电商经验">
              <Select options={[{ label: '是', value: true }, { label: '否', value: false }]} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="hasOverseasDistributors" label="是否有海外分销商">
              <Select options={[{ label: '是', value: true }, { label: '否', value: false }]} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
