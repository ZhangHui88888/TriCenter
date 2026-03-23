import { Card, Descriptions, Row, Col, Space, Button } from 'antd';
import {
  EditOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  StarFilled,
  MailOutlined,
  WechatOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import type { TabComponentProps } from '../types';

interface BasicInfoTabProps extends TabComponentProps {}

export default function BasicInfoTab({ enterprise, onEdit }: BasicInfoTabProps) {
  return (
    <div style={{ padding: 16 }}>
      <Card 
        title={<span style={{ fontWeight: 600, fontSize: 15 }}>企业信息</span>}
        size="small" 
        style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} 
        headStyle={{ borderBottom: '1px solid #f0f0f0' }}
        extra={<Button type="link" icon={<EditOutlined />} onClick={() => onEdit?.('enterprise')} style={{ fontWeight: 500 }}>编辑</Button>}
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
          <Descriptions.Item label="所属区域">{enterprise.district}</Descriptions.Item>
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
          <Descriptions.Item label="国内营收(万元)">{enterprise.domestic_revenue || '-'}</Descriptions.Item>
          <Descriptions.Item label="跨境营收(万元)">{enterprise.crossborder_revenue || '-'}</Descriptions.Item>
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
        title={<span style={{ fontWeight: 600, fontSize: 15 }}>联系人信息</span>}
        size="small" 
        style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} 
        headStyle={{ borderBottom: '1px solid #f0f0f0' }}
        extra={<Button type="link" icon={<EditOutlined />} onClick={() => onEdit?.('contact')} style={{ fontWeight: 500 }}>编辑</Button>}
      >
        <Row gutter={16}>
          {enterprise.contacts.map((contact, index) => (
            <Col span={12} key={index}>
                  <div style={{
                    background: contact.is_primary 
                      ? 'rgba(102,126,234,0.05)' 
                      : '#fafafa',
                    border: contact.is_primary ? '1px solid rgba(102,126,234,0.2)' : '1px solid #f0f0f0',
                    borderRadius: 10,
                    padding: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: contact.is_primary 
                          ? 'rgba(102,126,234,0.1)'
                          : '#e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: contact.is_primary ? '#667eea' : '#666',
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
                            background: 'rgba(102,126,234,0.1)',
                            color: '#667eea',
                            borderRadius: 4,
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
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MailOutlined style={{ color: '#667eea' }} />
                      <a href={`mailto:${contact.email}`} style={{ color: '#667eea' }}>{contact.email}</a>
                    </div>
                  )}
                  {contact.wechat && (
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <WechatOutlined style={{ color: '#07c160' }} />
                      <span style={{ color: '#555' }}>{contact.wechat}</span>
                    </div>
                  )}
                  {contact.remark && (
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MessageOutlined style={{ color: '#faad14' }} />
                      <span style={{ color: '#888' }}>{contact.remark}</span>
                    </div>
                  )}
                  </div>
                </div>
              </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
}
