import { Modal, Select, Input, Button, Typography, message } from 'antd';
import { PlusOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import request from '@/services/request';

const { Text } = Typography;

const MARKET_OPTIONS = [
  { label: '北美', value: '北美' },
  { label: '欧洲', value: '欧洲' },
  { label: '东南亚', value: '东南亚' },
  { label: '东亚', value: '东亚' },
  { label: '南亚', value: '南亚' },
  { label: '中东', value: '中东' },
  { label: '非洲', value: '非洲' },
  { label: '南美', value: '南美' },
  { label: '大洋洲', value: '大洋洲' },
];

interface MarketItem {
  market: string;
  percentage: number;
}

interface MarketModalProps {
  open: boolean;
  enterpriseId: number;
  targetMarkets: MarketItem[];
  onMarketsChange: (markets: MarketItem[]) => void;
  onClose: () => void;
  onSuccess: (markets: MarketItem[]) => void;
}

export default function MarketModal({
  open,
  enterpriseId,
  targetMarkets,
  onMarketsChange,
  onClose,
  onSuccess,
}: MarketModalProps) {
  const total = targetMarkets.reduce((sum, m) => sum + m.percentage, 0);

  const handleOk = async () => {
    try {
      await request.put(`/enterprises/${enterpriseId}`, { targetMarkets });
      message.success('目标市场信息更新成功');
      onSuccess(targetMarkets);
      onClose();
    } catch (e: any) {
      message.error(e?.message || '保存失败');
    }
  };

  return (
    <Modal
      maskClosable={false}
      title="编辑目标市场及占比"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
      width={600}
    >
      <div style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary">
            总占比:{' '}
            <Text strong style={{ color: total === 100 ? '#52c41a' : '#ff4d4f' }}>
              {total}%
            </Text>
          </Text>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => onMarketsChange([...targetMarkets, { market: '', percentage: 0 }])}
          >
            添加市场
          </Button>
        </div>
        {targetMarkets.map((item, index) => (
          <div key={index} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
            <Select
              style={{ flex: 1 }}
              placeholder="选择市场"
              value={item.market || undefined}
              onChange={(value) => {
                const newMarkets = [...targetMarkets];
                newMarkets[index] = { ...newMarkets[index], market: value };
                onMarketsChange(newMarkets);
              }}
              showSearch
              options={MARKET_OPTIONS}
            />
            <Input
              style={{ width: 100 }}
              type="number"
              min={0}
              max={100}
              suffix="%"
              value={item.percentage}
              onChange={(e) => {
                const newMarkets = [...targetMarkets];
                newMarkets[index] = { ...newMarkets[index], percentage: Number(e.target.value) || 0 };
                onMarketsChange(newMarkets);
              }}
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onMarketsChange(targetMarkets.filter((_, i) => i !== index))}
              disabled={targetMarkets.length <= 1}
            />
          </div>
        ))}
        {total !== 100 && (
          <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 8 }}>
            <WarningOutlined /> 占比总和应为100%
          </div>
        )}
      </div>
    </Modal>
  );
}
