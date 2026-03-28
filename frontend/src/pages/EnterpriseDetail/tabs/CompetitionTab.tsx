// @ts-nocheck
import { Card, Row, Col, Space, Button, Switch, Input, Typography } from 'antd';
import { EditOutlined, AlertOutlined, WarningOutlined } from '@ant-design/icons';
import {
  EnterpriseDetailSectionHint,
  enterpriseDetailCardTitle,
} from '@/components/enterpriseDetail/EnterpriseDetailSectionHint';

const { Text } = Typography;

interface CompetitionTabProps {
  enterprise: any;
  isSurveyed: boolean;
  setIsSurveyed: (v: boolean) => void;
  competitionPosition: string;
  setCompetitionPosition: (v: string) => void;
  competitionDesc: string;
  setCompetitionDesc: (v: string) => void;
  saveEnterpriseFields: (fields: Record<string, any>, msg: string) => Promise<void>;
  onEditRisk: () => void;
}

export default function CompetitionTab({
  enterprise,
  isSurveyed,
  setIsSurveyed,
  competitionPosition,
  setCompetitionPosition,
  competitionDesc,
  setCompetitionDesc,
  saveEnterpriseFields,
  onEditRisk,
}: CompetitionTabProps) {
  return (
    <div>
      <Card
        size="small"
        style={{
          marginBottom: 16,
          borderRadius: 12,
          border: isSurveyed ? '1px solid rgba(102,126,234,0.3)' : 'none',
          boxShadow: isSurveyed ? '0 4px 12px rgba(102,126,234,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
          background: isSurveyed ? 'rgba(102,126,234,0.05)' : '#fff',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: isSurveyed ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#d9d9d9',
              transition: 'all 0.3s ease',
              boxShadow: isSurveyed ? '0 0 8px rgba(102,126,234,0.5)' : 'none'
            }} />
            <Text strong style={{ fontSize: 15 }}>该企业是否经过调研</Text>
            <EnterpriseDetailSectionHint sectionKey="comp-survey-switch" />
          </div>
          <Switch
            checked={isSurveyed}
            onChange={setIsSurveyed}
            checkedChildren="是"
            unCheckedChildren="否"
            style={{ background: isSurveyed ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : undefined }}
          />
        </div>
      </Card>

      <div style={{
        maxHeight: isSurveyed ? 2000 : 0,
        overflow: 'hidden',
        opacity: isSurveyed ? 1 : 0,
        transition: 'all 0.4s ease-in-out'
      }}>
        <Card
          title={enterpriseDetailCardTitle('行业竞争地位', 'comp-position')}
          size="small"
          style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          headStyle={{ borderBottom: '1px solid #f5f5f5' }}
        >
          <Row gutter={16} style={{ textAlign: 'center', marginBottom: 16 }}>
            {[
              { label: '头部企业', value: 'leader' },
              { label: '中型企业', value: 'medium' },
              { label: '初创企业', value: 'startup' },
            ].map((item, idx) => {
              const isSelected = item.value === competitionPosition;
              return (
                <Col span={8} key={idx}>
                  <div
                    style={{
                      padding: '16px',
                      background: isSelected ? 'rgba(102,126,234,0.1)' : '#fafafa',
                      border: isSelected ? '2px solid #667eea' : '1px solid #f0f0f0',
                      borderRadius: 10,
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onClick={async () => {
                      setCompetitionPosition(item.value);
                      await saveEnterpriseFields({ competitionPosition: item.value }, `行业竞争地位已更新为"${item.label}"`);
                    }}
                  >
                    <Text strong={isSelected} type={isSelected ? undefined : 'secondary'} style={{ color: isSelected ? '#667eea' : undefined }}>
                      {item.label} {isSelected && '✓'}
                    </Text>
                  </div>
                </Col>
              );
            })}
          </Row>
          <Input.TextArea
            value={competitionDesc}
            onChange={(e) => setCompetitionDesc(e.target.value)}
            rows={2}
            style={{ borderRadius: 10 }}
            onBlur={() => saveEnterpriseFields({ competitionDescription: competitionDesc }, '竞争地位描述已保存')}
          />
        </Card>

        <Card
          title={enterpriseDetailCardTitle('当前面临风险', 'comp-risk')}
          size="small"
          style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          headStyle={{ borderBottom: '1px solid #f5f5f5' }}
          extra={<Button type="link" size="small" icon={<EditOutlined />} style={{ fontWeight: 500 }} onClick={onEditRisk}>编辑</Button>}
        >
          {(() => {
            const riskTags = Array.isArray(enterprise.current_risk_tags) ? enterprise.current_risk_tags : [];
            const riskDesc = (enterprise.risk_description && String(enterprise.risk_description).trim()) || '';
            const palette = [
              { icon: <AlertOutlined />, color: '#f5222d', gradient: 'rgba(245,34,45,0.08)' },
              { icon: <WarningOutlined />, color: '#fa8c16', gradient: 'rgba(250,140,22,0.08)' },
              { icon: <WarningOutlined />, color: '#faad14', gradient: 'rgba(250,173,20,0.08)' },
            ];
            if (riskTags.length === 0 && !riskDesc) {
              return (
                <div style={{ textAlign: 'center', padding: '28px 0', color: '#999', fontSize: 13 }}>
                  暂无记录，点击「编辑」维护当前面临风险
                </div>
              );
            }
            return (
              <Space direction="vertical" style={{ width: '100%' }} size={12}>
                {riskTags.map((title: string, idx: number) => {
                  const item = palette[idx % palette.length];
                  return (
                    <div
                      key={`${title}-${idx}`}
                      style={{
                        padding: '16px 20px',
                        background: `linear-gradient(135deg, ${item.gradient} 0%, transparent 100%)`,
                        borderRadius: 12,
                        border: `1px solid ${item.color}20`,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 14,
                      }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, color: item.color,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                        flexShrink: 0,
                      }}>
                        {item.icon}
                      </div>
                      <div>
                        <Text strong style={{ color: item.color, fontSize: 14 }}>{title}</Text>
                      </div>
                    </div>
                  );
                })}
                {riskDesc ? (
                  <div style={{ padding: '14px 18px', background: '#fafafa', borderRadius: 10, border: '1px solid #f0f0f0' }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>补充说明</Text>
                    <div style={{ fontSize: 13, color: '#444', whiteSpace: 'pre-wrap' }}>{riskDesc}</div>
                  </div>
                ) : null}
              </Space>
            );
          })()}
        </Card>
      </div>
    </div>
  );
}
