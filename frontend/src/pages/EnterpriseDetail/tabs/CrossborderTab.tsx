// @ts-nocheck
import { Card, Row, Col, Space, Button, Switch, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import {
  EnterpriseDetailSectionHint,
  enterpriseDetailCardTitle,
} from '@/components/enterpriseDetail/EnterpriseDetailSectionHint';

const { Text } = Typography;

const PLATFORM_CONFIGS: Record<string, { name: string; subName: string; letter: string; logo?: string; gradient: string; border: string; shadow: string }> = {
  '亚马逊 (Amazon)': { name: '亚马逊', subName: 'Amazon', letter: 'A', logo: 'https://www.amazon.com/favicon.ico', gradient: 'rgba(250,140,22,0.05)', border: '1px solid rgba(250,140,22,0.2)', shadow: 'none' },
  '阿里国际站 (Alibaba.com)': { name: '阿里国际站', subName: 'Alibaba.com', letter: '阿', logo: 'https://www.alibaba.com/favicon.ico', gradient: 'rgba(212,56,13,0.05)', border: '1px solid rgba(212,56,13,0.2)', shadow: 'none' },
  'TikTok Shop': { name: 'TikTok Shop', subName: 'TikTok', letter: 'T', logo: 'https://www.tiktok.com/favicon.ico', gradient: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.2)', shadow: 'none' },
  '速卖通 (AliExpress)': { name: '速卖通', subName: 'AliExpress', letter: 'A', logo: 'https://www.aliexpress.com/favicon.ico', gradient: 'rgba(255,77,79,0.05)', border: '1px solid rgba(255,77,79,0.2)', shadow: 'none' },
  'eBay': { name: 'eBay', subName: 'eBay.com', letter: 'E', logo: 'https://www.ebay.com/favicon.ico', gradient: 'rgba(102,126,234,0.05)', border: '1px solid rgba(102,126,234,0.2)', shadow: 'none' },
  '独立站 (Shopify)': { name: '独立站', subName: 'Shopify', letter: '独', logo: 'https://www.shopify.com/favicon.ico', gradient: 'rgba(67,233,123,0.05)', border: '1px solid rgba(67,233,123,0.2)', shadow: 'none' },
  'Temu': { name: 'Temu', subName: 'Temu.com', letter: 'T', logo: 'https://www.temu.com/favicon.ico', gradient: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.2)', shadow: 'none' },
  'SHEIN': { name: 'SHEIN', subName: 'SHEIN.com', letter: 'S', logo: 'https://www.shein.com/favicon.ico', gradient: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.2)', shadow: 'none' },
  '沃尔玛 (Walmart)': { name: '沃尔玛', subName: 'Walmart', letter: 'W', logo: 'https://www.walmart.com/favicon.ico', gradient: 'rgba(0,113,220,0.05)', border: '1px solid rgba(0,113,220,0.2)', shadow: 'none' },
  'Lazada': { name: 'Lazada', subName: 'Lazada.com', letter: 'L', logo: 'https://www.lazada.com/favicon.ico', gradient: 'rgba(15,76,129,0.05)', border: '1px solid rgba(15,76,129,0.2)', shadow: 'none' },
  'Shopee': { name: 'Shopee', subName: 'Shopee.com', letter: 'S', logo: 'https://www.shopee.com/favicon.ico', gradient: 'rgba(238,77,45,0.05)', border: '1px solid rgba(238,77,45,0.2)', shadow: 'none' },
  'Wish': { name: 'Wish', subName: 'Wish.com', letter: 'W', logo: 'https://www.wish.com/favicon.ico', gradient: 'rgba(0,150,199,0.05)', border: '1px solid rgba(0,150,199,0.2)', shadow: 'none' },
  'Etsy': { name: 'Etsy', subName: 'Etsy.com', letter: 'E', logo: 'https://www.etsy.com/favicon.ico', gradient: 'rgba(242,101,34,0.05)', border: '1px solid rgba(242,101,34,0.2)', shadow: 'none' },
  'Wayfair': { name: 'Wayfair', subName: 'Wayfair.com', letter: 'W', logo: 'https://www.wayfair.com/favicon.ico', gradient: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.2)', shadow: 'none' },
  'Mercado Libre': { name: 'Mercado Libre', subName: 'MercadoLibre', letter: 'M', logo: 'https://www.mercadolibre.com/favicon.ico', gradient: 'rgba(255,229,0,0.05)', border: '1px solid rgba(255,229,0,0.2)', shadow: 'none' },
  '乐天 (Rakuten)': { name: '乐天', subName: 'Rakuten', letter: 'R', logo: 'https://www.rakuten.com/favicon.ico', gradient: 'rgba(191,0,0,0.05)', border: '1px solid rgba(191,0,0,0.2)', shadow: 'none' },
  '京东国际 (JD Global)': { name: '京东国际', subName: 'JD Global', letter: '京', logo: 'https://www.jd.com/favicon.ico', gradient: 'rgba(225,37,27,0.05)', border: '1px solid rgba(225,37,27,0.2)', shadow: 'none' },
  '其他': { name: '其他', subName: 'Other', letter: '其', gradient: 'rgba(156,163,175,0.05)', border: '1px solid rgba(156,163,175,0.2)', shadow: 'none' },
};

const ICON_COLORS: Record<string, string> = {
  '亚马逊 (Amazon)': '#fa8c16',
  '阿里国际站 (Alibaba.com)': '#d4380d',
  'TikTok Shop': '#000000',
  '速卖通 (AliExpress)': '#ff4d4f',
  'eBay': '#667eea',
  '独立站 (Shopify)': '#43e97b',
  'Temu': '#ff6b35',
  'SHEIN': '#404040',
  '沃尔玛 (Walmart)': '#0071dc',
  'Lazada': '#0f4c81',
  'Shopee': '#ee4d2d',
  'Wish': '#0096c7',
  'Etsy': '#f26522',
  'Wayfair': '#7c3aed',
  'Mercado Libre': '#ffeb3b',
  '乐天 (Rakuten)': '#dc2626',
  '京东国际 (JD Global)': '#e1251b',
  '其他': '#9ca3af',
};

interface CrossborderTabProps {
  enterprise: any;
  hasCrossborderEcommerce: boolean;
  setHasCrossborderEcommerce: (v: boolean) => void;
  selectedCrossborderPlatforms: string[];
  targetMarkets: { market: string; percentage: number }[];
  onEditPlatform: () => void;
  onEditBasic: () => void;
  onEditMarket: () => void;
}

export default function CrossborderTab({
  enterprise,
  hasCrossborderEcommerce,
  setHasCrossborderEcommerce,
  selectedCrossborderPlatforms,
  targetMarkets,
  onEditPlatform,
  onEditBasic,
  onEditMarket,
}: CrossborderTabProps) {
  return (
    <div style={{ padding: 16 }}>
      <Card
        size="small"
        style={{
          marginBottom: 16,
          borderRadius: 12,
          border: hasCrossborderEcommerce ? '1px solid rgba(102,126,234,0.3)' : 'none',
          boxShadow: hasCrossborderEcommerce ? '0 4px 12px rgba(102,126,234,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
          background: hasCrossborderEcommerce ? 'rgba(102,126,234,0.05)' : '#fff',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: hasCrossborderEcommerce ? '#667eea' : '#d9d9d9',
              transition: 'all 0.3s ease',
              boxShadow: hasCrossborderEcommerce ? '0 0 8px rgba(102,126,234,0.5)' : 'none'
            }} />
            <Text strong style={{ fontSize: 15 }}>是否开展跨境电商业务</Text>
            <EnterpriseDetailSectionHint sectionKey="cb-switch" />
          </div>
          <Switch
            checked={hasCrossborderEcommerce}
            onChange={setHasCrossborderEcommerce}
            checkedChildren="是"
            unCheckedChildren="否"
          />
        </div>
      </Card>

      <div style={{
        maxHeight: hasCrossborderEcommerce ? 2000 : 0,
        overflow: 'hidden',
        opacity: hasCrossborderEcommerce ? 1 : 0,
        transition: 'all 0.4s ease-in-out'
      }}>
        <Card
          title={enterpriseDetailCardTitle('主要跨境平台', 'cb-platforms')}
          size="small"
          style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          headStyle={{ borderBottom: '1px solid #f5f5f5' }}
          extra={<Button type="link" size="small" icon={<EditOutlined />} style={{ fontWeight: 500 }} onClick={onEditPlatform}>编辑</Button>}
        >
          <Space size={16} wrap>
            {selectedCrossborderPlatforms.map((platform) => {
              const config = PLATFORM_CONFIGS[platform] || { name: platform, subName: '', letter: platform.charAt(0), gradient: 'rgba(102,126,234,0.05)', border: '1px solid rgba(102,126,234,0.2)', shadow: 'none' };
              const iconColor = ICON_COLORS[platform] || '#667eea';
              return (
                <div key={platform} style={{
                  padding: '16px 20px',
                  background: config.gradient,
                  borderRadius: 12,
                  border: config.border,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  minWidth: 180
                }}>
                  <div style={{
                    width: 44, height: 44,
                    borderRadius: 12,
                    background: config.logo ? '#fff' : iconColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                  }}>
                    {config.logo ? (
                      <img
                        src={config.logo}
                        alt={config.name}
                        style={{ width: 32, height: 32, objectFit: 'contain' }}
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.style.background = iconColor;
                            parent.innerHTML = `<span style="color:#fff;font-weight:bold;font-size:${config.letter.length > 1 ? 16 : 18}px">${config.letter}</span>`;
                          }
                        }}
                      />
                    ) : (
                      <span style={{ color: '#fff', fontWeight: 'bold', fontSize: config.letter.length > 1 ? 16 : 18 }}>{config.letter}</span>
                    )}
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 15 }}>{config.name}</Text>
                    <div style={{ fontSize: 12, color: '#999' }}>{config.subName}</div>
                  </div>
                </div>
              );
            })}
          </Space>
        </Card>

        <Card
          title={enterpriseDetailCardTitle('跨境基本信息', 'cb-basic')}
          size="small"
          style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          headStyle={{ borderBottom: '1px solid #f5f5f5' }}
          extra={<Button type="link" size="small" icon={<EditOutlined />} style={{ fontWeight: 500 }} onClick={onEditBasic}>编辑</Button>}
        >
          <Row gutter={[16, 16]}>
            {[
              { label: '跨境业务占比', render: enterprise.cross_border_ratio ? <>{enterprise.cross_border_ratio}<span style={{ fontSize: 14, fontWeight: 500, color: '#666' }}>%</span></> : '-' },
              { label: '跨境物流模式', render: enterprise.cross_border_logistics || '-' },
              { label: '支付结算方式', render: enterprise.payment_settlement || '-' },
              { label: '跨境电商团队规模', render: enterprise.cross_border_team_size != null ? <>{enterprise.cross_border_team_size}<span style={{ fontSize: 14, fontWeight: 500, color: '#666' }}> 人</span></> : '-' },
              { label: '是否在用ERP', render: enterprise.using_erp != null ? (enterprise.using_erp ? '是' : '否') : '-' },
              { label: '跨境转型意愿', render: enterprise.transformation_willingness || '-' },
              { label: '愿意投入转型程度', render: enterprise.investment_willingness || '-' },
            ].map((item, idx) => (
              <Col span={6} key={idx}>
                <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>{item.label}</Text>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#333', lineHeight: 1.5 }}>{item.render}</div>
                </div>
              </Col>
            ))}
            <Col span={6} />
          </Row>
        </Card>

        <Card
          title={enterpriseDetailCardTitle('目标市场及占比', 'cb-markets')}
          size="small"
          style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          headStyle={{ borderBottom: '1px solid #f5f5f5' }}
          extra={<Button type="link" size="small" icon={<EditOutlined />} style={{ fontWeight: 500 }} onClick={onEditMarket}>编辑</Button>}
        >
          <Row gutter={16}>
            {targetMarkets.map((item, index) => {
              const colors = [
                { bg: 'rgba(102,126,234,0.08)', bgEnd: 'rgba(118,75,162,0.05)', bar: '#667eea', barEnd: '#764ba2', text: '#667eea' },
                { bg: 'rgba(67,233,123,0.08)', bgEnd: 'rgba(56,249,215,0.05)', bar: '#43e97b', barEnd: '#38f9d7', text: '#43e97b' },
                { bg: 'rgba(250,140,22,0.08)', bgEnd: 'rgba(250,173,20,0.05)', bar: '#fa8c16', barEnd: '#faad14', text: '#fa8c16' },
                { bg: 'rgba(240,147,251,0.08)', bgEnd: 'rgba(245,87,108,0.05)', bar: '#f093fb', barEnd: '#f5576c', text: '#f093fb' },
                { bg: 'rgba(24,144,255,0.08)', bgEnd: 'rgba(64,169,255,0.05)', bar: '#1890ff', barEnd: '#40a9ff', text: '#1890ff' },
                { bg: 'rgba(114,46,209,0.08)', bgEnd: 'rgba(157,78,221,0.05)', bar: '#722ed1', barEnd: '#9d4edd', text: '#722ed1' },
              ];
              const color = colors[index % colors.length];
              const colSpan = targetMarkets.length <= 4 ? 6 : targetMarkets.length <= 6 ? 4 : 3;
              return (
                <Col span={colSpan} key={index} style={{ marginBottom: 12 }}>
                  <div style={{ padding: '16px', background: `linear-gradient(135deg, ${color.bg} 0%, ${color.bgEnd} 100%)`, borderRadius: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <Text style={{ fontWeight: 500 }}>{item.market || '未设置'}</Text>
                      <Text strong style={{ color: color.text, fontSize: 16 }}>{item.percentage}%</Text>
                    </div>
                    <div style={{ height: 8, background: '#e8e8e8', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${item.percentage}%`, height: '100%', background: `linear-gradient(90deg, ${color.bar} 0%, ${color.barEnd} 100%)`, borderRadius: 4 }} />
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </Card>
      </div>
    </div>
  );
}
