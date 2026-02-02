import { Card, Descriptions, Row, Col, Space, Button } from 'antd';
import {
  EditOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  StarFilled,
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
        <Descriptions column={2} labelStyle={{ color: '#888', fontWeight: 500 }} contentStyle={{ color: '#333' }}>
          <Descriptions.Item label="企业名称">
            <span style={{ fontWeight: 500 }}>{enterprise.enterprise_name}</span>
          </Descriptions.Item>
          <Descriptions.Item label="统一社会信用代码">
            <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{enterprise.unified_credit_code || '-'}</span>
          </Descriptions.Item>
          <Descriptions.Item label="所属区域">{enterprise.district}</Descriptions.Item>
          <Descriptions.Item label="所属行业">
            <span style={{ 
              padding: '2px 8px', 
              background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
              borderRadius: 4,
              color: '#667eea',
              fontWeight: 500,
              fontSize: 12
            }}>{enterprise.industry}</span>
          </Descriptions.Item>
          <Descriptions.Item label="企业类型">{enterprise.enterprise_type}</Descriptions.Item>
          <Descriptions.Item label="人员规模">{enterprise.employee_scale || '-'}</Descriptions.Item>
          <Descriptions.Item label="省/市/区">
            {[enterprise.province, enterprise.city, enterprise.district].filter(Boolean).join(' / ') || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="详细地址">
            <Space>
              <EnvironmentOutlined style={{ color: '#667eea' }} />
              {enterprise.detailed_address || '-'}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="国内营收(万元)">
            <span style={{ fontWeight: 600, color: '#667eea' }}>{enterprise.domestic_revenue || '-'}</span>
          </Descriptions.Item>
          <Descriptions.Item label="跨境营收(万元)">
            <span style={{ fontWeight: 600, color: '#43e97b' }}>{enterprise.crossborder_revenue || '-'}</span>
          </Descriptions.Item>
          <Descriptions.Item label="企业来源">{enterprise.source || '-'}</Descriptions.Item>
          <Descriptions.Item label="官网">
            {enterprise.website ? (
              <a href={enterprise.website} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
                <GlobalOutlined style={{ marginRight: 4 }} /> {enterprise.website}
              </a>
            ) : '-'}
          </Descriptions.Item>
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
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
}
