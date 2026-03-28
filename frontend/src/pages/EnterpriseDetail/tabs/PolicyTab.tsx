// @ts-nocheck
import { Card, Row, Col, Space, Tag, Button, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { enterpriseDetailCardTitle } from '@/components/enterpriseDetail/EnterpriseDetailSectionHint';

const { Text } = Typography;

const ENJOYED_POLICY_OPTIONS = [
  { label: '跨境电商扶持资金', value: 'cross_border_fund' },
  { label: '外贸稳增长补贴', value: 'trade_growth_subsidy' },
  { label: '品牌出海补贴', value: 'brand_overseas_subsidy' },
  { label: '人才引进补贴', value: 'talent_subsidy' },
  { label: '跨境电商出口退税', value: 'export_tax_rebate' },
  { label: '海外仓补贴', value: 'overseas_warehouse_subsidy' },
  { label: '产品认证补贴', value: 'certification_subsidy' },
  { label: '展会补贴', value: 'exhibition_subsidy' },
  { label: '物流补贴', value: 'logistics_subsidy' },
  { label: '培训补贴', value: 'training_subsidy' },
  { label: '创新研发资金', value: 'innovation_fund' },
  { label: '中小企业扶持', value: 'sme_support' },
  { label: '其他', value: 'other' },
];

function labelForEnjoyedPolicyValue(v: string) {
  return ENJOYED_POLICY_OPTIONS.find((x) => x.value === v)?.label ?? v;
}

interface PolicyTabProps {
  enterprise: any;
  onEdit: () => void;
}

export default function PolicyTab({ enterprise, onEdit }: PolicyTabProps) {
  return (
    <div>
      <Card
        title={enterpriseDetailCardTitle('政策支持情况', 'policy-support')}
        size="small"
        style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        headStyle={{ borderBottom: '1px solid #f5f5f5' }}
        extra={<Button type="link" size="small" icon={<EditOutlined />} style={{ fontWeight: 500 }} onClick={onEdit}>编辑</Button>}
      >
        <Row gutter={24}>
          <Col span={8}>
            <div style={{ padding: '14px 16px', background: '#fafbfc', borderRadius: 10 }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>是否享受过政策支持</Text>
              <span style={{ color: '#333', fontWeight: 400, fontSize: 14 }}>
                {enterprise.has_policy_support === 1 || enterprise.has_policy_support === true ? '是' : '否'}
              </span>
            </div>
          </Col>
          <Col span={16}>
            <div style={{ padding: '14px 16px', background: '#fafbfc', borderRadius: 10 }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>已享受政策</Text>
              {Array.isArray(enterprise.enjoyed_policies) && enterprise.enjoyed_policies.length > 0 ? (
                <Space size={8} wrap>
                  {enterprise.enjoyed_policies.map((code: string) => (
                    <Tag key={code} style={{ margin: 0, fontWeight: 400, fontSize: 14 }}>
                      {labelForEnjoyedPolicyValue(String(code))}
                    </Tag>
                  ))}
                </Space>
              ) : (
                <span style={{ color: '#333', fontWeight: 400, fontSize: 14 }}>-</span>
              )}
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
