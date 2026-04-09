import { Card, Empty, Space, Typography } from 'antd';
import type { ProviderServiceAreaInfo } from '@/types';

const { Text } = Typography;

type ProviderServiceAreasTabProps = {
  serviceAreas?: ProviderServiceAreaInfo[];
};

export default function ProviderServiceAreasTab({ serviceAreas }: ProviderServiceAreasTabProps) {
  const areaList = serviceAreas || [];

  return (
    <div style={{ padding: 16 }}>
      <Card
        title="服务领域"
        size="small"
        style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        {areaList.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无服务领域" />
        ) : (
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            {areaList.map((item, index) => (
              <Card
                key={item.id ?? `${item.areaName}-${index}`}
                size="small"
                style={{ borderRadius: 10, background: '#fafafa' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <Text strong>{item.areaName || '-'}</Text>
                  <Text type="secondary">排序 {item.sortOrder ?? index + 1}</Text>
                </div>
                <div style={{ marginTop: 8, color: '#666' }}>{item.description || '暂无说明'}</div>
              </Card>
            ))}
          </Space>
        )}
      </Card>
    </div>
  );
}
