import { Button, Card, Col, Descriptions, Empty, Row, Space, Tag } from 'antd';
import { EditOutlined, EnvironmentOutlined, GlobalOutlined, PhoneOutlined, StarFilled } from '@ant-design/icons';
import type { ProviderDetail } from '@/types';
import { getRequirementNames } from './constants';

type ProviderBasicInfoTabProps = {
  provider: ProviderDetail;
  openEditModal: (section: 'basic' | 'contact') => void;
};

function formatAddress(provider: ProviderDetail) {
  const regionText = [provider.province, provider.city, provider.district].filter(Boolean).join(' / ');
  if (!regionText && !provider.address) {
    return '-';
  }
  return [regionText, provider.address].filter(Boolean).join(' · ');
}

export default function ProviderBasicInfoTab({ provider, openEditModal }: ProviderBasicInfoTabProps) {
  const serviceCategoryNames = getRequirementNames(provider.capabilityRequirementIds);
  const contacts = provider.contacts || [];

  return (
    <div style={{ padding: 16 }}>
      <Card
        title="服务商信息"
        size="small"
        style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        extra={<Button type="link" icon={<EditOutlined />} onClick={() => openEditModal('basic')} style={{ fontWeight: 500 }}>编辑</Button>}
      >
        <Descriptions column={2} labelStyle={{ color: '#888', fontWeight: 500 }} contentStyle={{ color: '#333', fontSize: 14 }}>
          <Descriptions.Item label="服务商名称">{provider.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="服务分类" span={2}>
            {serviceCategoryNames.length > 0 ? (
              <Space size={[8, 8]} wrap>
                {serviceCategoryNames.map((item) => (
                  <Tag key={item} color="blue">{item}</Tag>
                ))}
              </Space>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="统一社会信用代码">
            <span style={{ fontFamily: 'monospace' }}>{provider.creditCode || '-'}</span>
          </Descriptions.Item>
          <Descriptions.Item label="人员规模">{provider.staffSizeName || '-'}</Descriptions.Item>
          <Descriptions.Item label="官网">
            {provider.website ? (
              <a href={provider.website} target="_blank" rel="noopener noreferrer" style={{ color: '#333', textDecoration: 'underline' }}>
                <GlobalOutlined style={{ marginRight: 4, color: '#8c8c8c' }} />
                {provider.website}
              </a>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="地址">
            <Space>
              <EnvironmentOutlined style={{ color: '#8c8c8c' }} />
              {formatAddress(provider)}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="资质说明" span={2}>{provider.qualification || '-'}</Descriptions.Item>
          <Descriptions.Item label="服务商简介" span={2}>{provider.description || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title="联系人信息"
        size="small"
        style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        extra={<Button type="link" icon={<EditOutlined />} onClick={() => openEditModal('contact')} style={{ fontWeight: 500 }}>编辑</Button>}
      >
        {contacts.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无联系人信息" />
        ) : (
          <Row gutter={16}>
            {contacts.map((contact, index) => (
              <Col span={12} key={contact.id ?? `${contact.name}-${index}`}>
                <Card
                  size="small"
                  style={{
                    background: contact.isPrimary === 1 ? 'linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.05) 100%)' : '#fafafa',
                    border: contact.isPrimary === 1 ? '1px solid rgba(102,126,234,0.2)' : '1px solid #f0f0f0',
                    borderRadius: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: contact.isPrimary === 1 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      {(contact.name || '?').charAt(0)}
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{contact.name || '-'}</span>
                      {contact.isPrimary === 1 && (
                        <span style={{ marginLeft: 8, padding: '2px 8px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', borderRadius: 10, fontSize: 11, fontWeight: 500 }}>
                          <StarFilled style={{ marginRight: 3, fontSize: 10 }} />主要联系人
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#666', paddingLeft: 46 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PhoneOutlined style={{ color: '#43e97b' }} />
                      <span style={{ fontFamily: 'monospace' }}>{contact.phone || '-'}</span>
                    </div>
                    {contact.position && <div style={{ marginTop: 6, color: '#888' }}>职位: <span style={{ color: '#555' }}>{contact.position}</span></div>}
                    {contact.email && <div style={{ marginTop: 6, color: '#888' }}>邮箱: <span style={{ color: '#555' }}>{contact.email}</span></div>}
                    {contact.wechat && <div style={{ marginTop: 6, color: '#888' }}>微信: <span style={{ color: '#555' }}>{contact.wechat}</span></div>}
                    {contact.remark && <div style={{ marginTop: 6, color: '#888' }}>备注: <span style={{ color: '#555' }}>{contact.remark}</span></div>}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>
    </div>
  );
}
