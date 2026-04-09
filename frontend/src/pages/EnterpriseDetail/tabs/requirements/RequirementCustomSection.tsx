import { Button, Card, Col, Row, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { EnterpriseDetailSectionHint } from '@/components/enterpriseDetail/EnterpriseDetailSectionHint';
import type { EnterpriseCustomRequirement } from './types';

const { Text } = Typography;

interface RequirementCustomSectionProps {
  customRequirements: EnterpriseCustomRequirement[];
  onOpenModal: () => void;
  onRemove: (reqId: string) => void;
}

export default function RequirementCustomSection({
  customRequirements,
  onOpenModal,
  onRemove,
}: RequirementCustomSectionProps) {
  return (
    <Card
      size="small"
      title={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ padding: '4px 12px', background: 'rgba(250,140,22,0.08)', color: '#fa8c16', borderRadius: 6, fontWeight: 600, fontSize: 13, border: '1px solid rgba(250,140,22,0.2)' }}>
            自定义需求
          </span>
          <Text type="secondary" style={{ fontSize: 13 }}>针对该企业的个性化需求</Text>
          <EnterpriseDetailSectionHint sectionKey="req-custom" />
        </div>
      )}
      extra={(
        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={onOpenModal} style={{ borderRadius: 6 }}>
          添加需求
        </Button>
      )}
      style={{ marginTop: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      headStyle={{ borderBottom: '1px solid #f0f0f0' }}
    >
      {customRequirements.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Text type="secondary">暂无自定义需求，点击上方按钮添加</Text>
        </div>
      ) : (
        <Row gutter={[12, 12]}>
          {customRequirements.map(req => (
            <Col span={12} key={req.id}>
              <div style={{ padding: '12px 14px', background: 'rgba(250,140,22,0.04)', borderRadius: 8, border: '1px solid rgba(250,140,22,0.15)', position: 'relative' }}>
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  style={{ position: 'absolute', top: 4, right: 4, padding: '2px 6px', height: 'auto', minWidth: 'auto' }}
                  onClick={() => onRemove(req.id)}
                />
                <div style={{ paddingRight: 20 }}>
                  <Text strong style={{ fontSize: 13, display: 'block' }}>{req.name}</Text>
                  <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.4 }}>{req.description}</Text>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </Card>
  );
}
