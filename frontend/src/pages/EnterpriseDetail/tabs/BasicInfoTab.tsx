// @ts-nocheck
import { Card, Descriptions, Space, Button, Row, Col, Typography } from 'antd';
import {
  EditOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  StarFilled,
} from '@ant-design/icons';
import {
  enterpriseDetailCardTitle,
} from '@/components/enterpriseDetail/EnterpriseDetailSectionHint';

const { Text } = Typography;

interface BasicInfoTabProps {
  enterprise: any;
  openEditModal: (section: 'enterprise' | 'contact') => void;
}

export default function BasicInfoTab({ enterprise, openEditModal }: BasicInfoTabProps) {
  return (
    <div style={{ padding: 16 }}>
      <Card
        title={enterpriseDetailCardTitle('企业信息', 'basic-enterprise')}
        size="small"
        style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        headStyle={{ borderBottom: '1px solid #f0f0f0' }}
        extra={<Button type="link" icon={<EditOutlined />} onClick={() => openEditModal('enterprise')} style={{ fontWeight: 500 }}>编辑</Button>}
      >
        <Descriptions
          column={2}
          labelStyle={{ color: '#888', fontWeight: 500 }}
          contentStyle={{ color: '#333', fontWeight: 400, fontSize: 14 }}
        >
          <Descriptions.Item label="企业名称">{enterprise.enterprise_name}</Descriptions.Item>
          <Descriptions.Item label="统一社会信用代码">
            <span style={{ fontFamily: 'monospace' }}>{enterprise.unified_credit_code || '-'}</span>
          </Descriptions.Item>
          <Descriptions.Item label="成立日期">{enterprise.established_date || '-'}</Descriptions.Item>
          <Descriptions.Item label="注册资本">{enterprise.registered_capital || '-'}</Descriptions.Item>
          <Descriptions.Item label="所属行业">{enterprise.industry || '-'}</Descriptions.Item>
          <Descriptions.Item label="企业类型">{enterprise.enterprise_type}</Descriptions.Item>
          <Descriptions.Item label="人员规模">{enterprise.employee_scale || '-'}</Descriptions.Item>
          <Descriptions.Item label="省/市/区">
            {[enterprise.province, enterprise.city, enterprise.district].filter(Boolean).join(' / ') || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="详细地址">
            <Space>
              <EnvironmentOutlined style={{ color: '#8c8c8c' }} />
              {enterprise.detailed_address || '-'}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="国内营收(万元)">
            {enterprise.domestic_revenue_wan != null && enterprise.domestic_revenue_wan !== ''
              ? enterprise.domestic_revenue_wan
              : enterprise.domestic_revenue || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="跨境营收(万元)">
            {enterprise.crossborder_revenue_wan != null && enterprise.crossborder_revenue_wan !== ''
              ? enterprise.crossborder_revenue_wan
              : enterprise.crossborder_revenue || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="企业来源">{enterprise.source || '-'}</Descriptions.Item>
          <Descriptions.Item label="官网">
            {enterprise.website ? (
              <a
                href={enterprise.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#333', fontWeight: 400, fontSize: 14, textDecoration: 'underline' }}
              >
                <GlobalOutlined style={{ marginRight: 4, color: '#8c8c8c' }} /> {enterprise.website}
              </a>
            ) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="进出口经营权">
            {enterprise.has_import_export_license ? '有' : '无'}
          </Descriptions.Item>
          <Descriptions.Item label="ISO认证">{enterprise.iso_certifications || '-'}</Descriptions.Item>
          <Descriptions.Item label="AEO认证等级">{enterprise.aeo_certification || '-'}</Descriptions.Item>
          <Descriptions.Item label="其他资质证书">{enterprise.other_certifications || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Card
        title={enterpriseDetailCardTitle('联系人信息', 'basic-contacts')}
        size="small"
        style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        headStyle={{ borderBottom: '1px solid #f0f0f0' }}
        extra={<Button type="link" icon={<EditOutlined />} onClick={() => openEditModal('contact')} style={{ fontWeight: 500 }}>编辑</Button>}
      >
        <Row gutter={16}>
          {enterprise.contacts.map((contact: any, index: number) => (
            <Col span={12} key={index}>
              <Card
                size="small"
                style={{
                  background: contact.is_primary
                    ? 'linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.05) 100%)'
                    : '#fafafa',
                  border: contact.is_primary ? '1px solid rgba(102,126,234,0.2)' : '1px solid #f0f0f0',
                  borderRadius: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: contact.is_primary
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : '#e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 14
                  }}>
                    {contact.name.charAt(0)}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{contact.name}</span>
                    {contact.is_primary && (
                      <span style={{
                        marginLeft: 8,
                        padding: '2px 8px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff',
                        borderRadius: 10,
                        fontSize: 11,
                        fontWeight: 500
                      }}>
                        <StarFilled style={{ marginRight: 3, fontSize: 10 }} />主要联系人
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#666', paddingLeft: 46 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <PhoneOutlined style={{ color: '#43e97b' }} />
                    <span style={{ fontFamily: 'monospace' }}>{contact.phone}</span>
                  </div>
                  {contact.position && (
                    <div style={{ marginTop: 6, color: '#888' }}>
                      职位: <span style={{ color: '#555' }}>{contact.position}</span>
                    </div>
                  )}
                  {contact.email && (
                    <div style={{ marginTop: 6, color: '#888' }}>
                      邮箱: <span style={{ color: '#555' }}>{contact.email}</span>
                    </div>
                  )}
                  {contact.wechat && (
                    <div style={{ marginTop: 6, color: '#888' }}>
                      微信: <span style={{ color: '#555' }}>{contact.wechat}</span>
                    </div>
                  )}
                  {contact.remark && (
                    <div style={{ marginTop: 6, color: '#888' }}>
                      备注: <span style={{ color: '#555' }}>{contact.remark}</span>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
}
