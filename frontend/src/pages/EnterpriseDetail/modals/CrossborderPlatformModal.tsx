import { Modal, Form, Select, message } from 'antd';
import request from '@/services/request';

const PLATFORM_OPTIONS = [
  { label: '亚马逊 (Amazon)', value: '亚马逊 (Amazon)' },
  { label: '阿里国际站 (Alibaba.com)', value: '阿里国际站 (Alibaba.com)' },
  { label: 'TikTok Shop', value: 'TikTok Shop' },
  { label: '速卖通 (AliExpress)', value: '速卖通 (AliExpress)' },
  { label: 'eBay', value: 'eBay' },
  { label: '独立站 (Shopify)', value: '独立站 (Shopify)' },
  { label: 'Temu', value: 'Temu' },
  { label: 'SHEIN', value: 'SHEIN' },
  { label: '沃尔玛 (Walmart)', value: '沃尔玛 (Walmart)' },
  { label: 'Lazada', value: 'Lazada' },
  { label: 'Shopee', value: 'Shopee' },
  { label: 'Wish', value: 'Wish' },
  { label: 'Etsy', value: 'Etsy' },
  { label: 'Wayfair', value: 'Wayfair' },
  { label: 'Mercado Libre', value: 'Mercado Libre' },
  { label: '乐天 (Rakuten)', value: '乐天 (Rakuten)' },
  { label: '京东国际 (JD Global)', value: '京东国际 (JD Global)' },
  { label: '其他', value: '其他' },
];

interface CrossborderPlatformModalProps {
  open: boolean;
  enterpriseId: number;
  selectedPlatforms: string[];
  onPlatformsChange: (platforms: string[]) => void;
  onClose: () => void;
  onSuccess: (platforms: string[]) => void;
}

export default function CrossborderPlatformModal({
  open,
  enterpriseId,
  selectedPlatforms,
  onPlatformsChange,
  onClose,
  onSuccess,
}: CrossborderPlatformModalProps) {
  const handleOk = async () => {
    try {
      await request.put(`/enterprises/${enterpriseId}`, {
        crossBorderPlatforms: selectedPlatforms,
      });
      message.success('跨境平台信息更新成功');
      onSuccess(selectedPlatforms);
      onClose();
    } catch (e: any) {
      message.error(e?.message || '保存失败');
    }
  };

  return (
    <Modal
      maskClosable={false}
      title="编辑主要跨境平台"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
      width={500}
    >
      <Form layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item label="主要跨境平台">
          <Select
            mode="multiple"
            value={selectedPlatforms}
            onChange={onPlatformsChange}
            placeholder="请选择跨境平台"
            options={PLATFORM_OPTIONS}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
