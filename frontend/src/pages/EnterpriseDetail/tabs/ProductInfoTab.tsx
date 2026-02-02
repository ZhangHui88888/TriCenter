import { Card, Row, Col, Space, Button, Typography } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import type { ProductTabProps } from '../types';

const { Text } = Typography;

export default function ProductInfoTab({
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onAddPatent,
  onEditPatent,
  onDeletePatent,
  onEditBrand,
}: ProductTabProps) {
  return (
    <div style={{ padding: 16 }}>
      {/* 产品列表区域 */}
      <Card
        title={<span style={{ fontWeight: 600, fontSize: 15 }}>产品列表</span>}
        size="small"
        style={{ marginBottom: 16, borderRadius: 8, border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        headStyle={{ borderBottom: '1px solid #f0f0f0' }}
        extra={
          <Button 
            type="primary" 
            size="small" 
            icon={<PlusOutlined />}
            onClick={onAddProduct}
            style={{ borderRadius: 8, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', fontWeight: 500 }}
          >
            添加产品
          </Button>
        }
      >
        {/* 产品卡片 */}
        <div style={{ marginBottom: 16, borderRadius: 8, borderLeft: '4px solid #667eea', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', background: '#fff', padding: 16 }}>
          <Card size="small" style={{ border: 'none', boxShadow: 'none', background: 'transparent' }} 
            extra={
              <Space size={4}>
                <Button type="link" size="small" icon={<EditOutlined />} style={{ fontWeight: 500 }}
                  onClick={() => onEditProduct({ name: '园艺工具套装', application: '家庭园艺、户外休闲' })}>编辑</Button>
                <Button type="link" size="small" danger icon={<DeleteOutlined />} style={{ fontWeight: 500 }}
                  onClick={() => onDeleteProduct('园艺工具套装')}>删除</Button>
              </Space>
            }
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f5f5f5' }}>
              <div>
                <Text strong style={{ fontSize: 16, fontWeight: 600 }}>园艺工具套装</Text>
                <div style={{ color: '#888', fontSize: 13, marginTop: 6 }}>应用领域：家庭园艺、户外休闲</div>
              </div>
              <Space size={8}>
                <span style={{ padding: '4px 12px', background: 'linear-gradient(135deg, rgba(67,233,123,0.15) 0%, rgba(56,249,215,0.1) 100%)', borderRadius: 6, color: '#389e0d', fontSize: 12, fontWeight: 500 }}>CE认证</span>
                <span style={{ padding: '4px 12px', background: 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.1) 100%)', borderRadius: 6, color: '#667eea', fontSize: 12, fontWeight: 500 }}>SGS认证</span>
              </Space>
            </div>
            <Row gutter={24} style={{ marginBottom: 20 }}>
              <Col span={8}>
                <div style={{ padding: '14px 16px', background: '#fafbfc', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>主要销售区域</Text>
                  <div style={{ fontWeight: 600, color: '#333' }}>欧美、东南亚</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ padding: '14px 16px', background: '#fafbfc', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>主要销售国家</Text>
                  <div style={{ fontWeight: 600, color: '#333' }}>美国、德国、日本</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.05) 100%)', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>年销售额</Text>
                  <div style={{ fontWeight: 700, color: '#667eea', fontSize: 16 }}>800万元</div>
                </div>
              </Col>
            </Row>
            <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
              <Text strong style={{ fontSize: 14, marginBottom: 14, display: 'block', color: '#333' }}>供应链与产能</Text>
              <Row gutter={24}>
                <Col span={6}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>原材料本地采购</Text>
                  <div style={{ fontWeight: 600, color: '#43e97b', fontSize: 15 }}>70%</div>
                </Col>
                <Col span={6}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>设备自动化程度</Text>
                  <div style={{ fontWeight: 600, color: '#333' }}>高（80%）</div>
                </Col>
                <Col span={6}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>年产能</Text>
                  <div style={{ fontWeight: 600, color: '#333' }}>30万件</div>
                </Col>
                <Col span={6}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>物流合作方</Text>
                  <Space size={6}>
                    <span style={{ padding: '2px 8px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 12 }}>DHL</span>
                    <span style={{ padding: '2px 8px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 12 }}>顺丰</span>
                  </Space>
                </Col>
              </Row>
            </div>
          </Card>
        </div>
      </Card>

      {/* 自主品牌 */}
      <Card
        size="small"
        title={<span style={{ fontWeight: 600, fontSize: 15, color: '#43e97b' }}>自主品牌</span>}
        style={{ marginBottom: 16, borderRadius: 8, border: 'none', borderLeft: '3px solid #43e97b', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        headStyle={{ borderBottom: '1px solid #f0f0f0' }}
        extra={<Button type="link" size="small" icon={<EditOutlined />} style={{ fontWeight: 500 }} onClick={onEditBrand}>编辑</Button>}
      >
        <Row gutter={24}>
          <Col span={8}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>是否有自主品牌</Text>
            <span style={{ padding: '4px 12px', background: 'linear-gradient(135deg, rgba(67,233,123,0.15) 0%, rgba(56,249,215,0.1) 100%)', borderRadius: 6, color: '#389e0d', fontSize: 12, fontWeight: 600 }}>是</span>
          </Col>
          <Col span={16}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>品牌名称</Text>
            <Space size={8}>
              <span style={{ padding: '5px 14px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 20, color: '#fff', fontSize: 13, fontWeight: 500 }}>GreenLife</span>
              <span style={{ padding: '5px 14px', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', borderRadius: 20, color: '#fff', fontSize: 13, fontWeight: 500 }}>OutdoorPro</span>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 核心技术/专利 */}
      <Card
        size="small"
        title={<span style={{ fontWeight: 600, fontSize: 15, color: '#f97316' }}>核心技术/专利</span>}
        style={{ borderRadius: 8, border: 'none', borderLeft: '3px solid #f97316', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        headStyle={{ borderBottom: '1px solid #f0f0f0' }}
        extra={
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={onAddPatent}
            style={{ borderRadius: 6, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', fontWeight: 500 }}>
            添加专利
          </Button>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(67,233,123,0.1) 0%, rgba(56,249,215,0.05) 100%)', borderRadius: 10, border: '1px solid rgba(67,233,123,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SafetyCertificateOutlined style={{ color: '#fff', fontSize: 20 }} />
              </div>
              <div>
                <Text strong style={{ fontSize: 14, display: 'block' }}>环保材料应用技术</Text>
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                  专利号：<span style={{ fontFamily: 'monospace' }}>ZL2023XXXXXXXX.X</span> | 
                  <span style={{ color: '#43e97b', fontWeight: 500, marginLeft: 4 }}>发明专利</span>
                </div>
              </div>
            </div>
            <Space size={4}>
              <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEditPatent({ name: '环保材料应用技术', patent_no: 'ZL2023XXXXXXXX.X', type: '发明专利' })} />
              <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => onDeletePatent('环保材料应用技术')} />
            </Space>
          </div>
          <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.05) 100%)', borderRadius: 10, border: '1px solid rgba(102,126,234,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SafetyCertificateOutlined style={{ color: '#fff', fontSize: 20 }} />
              </div>
              <div>
                <Text strong style={{ fontSize: 14, display: 'block' }}>可折叠户外家具结构设计</Text>
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                  专利号：<span style={{ fontFamily: 'monospace' }}>ZL2024XXXXXXXX.X</span> | 
                  <span style={{ color: '#667eea', fontWeight: 500, marginLeft: 4 }}>实用新型</span>
                </div>
              </div>
            </div>
            <Space size={4}>
              <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEditPatent({ name: '可折叠户外家具结构设计', patent_no: 'ZL2024XXXXXXXX.X', type: '实用新型' })} />
              <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => onDeletePatent('可折叠户外家具结构设计')} />
            </Space>
          </div>
        </Space>
      </Card>
    </div>
  );
}
