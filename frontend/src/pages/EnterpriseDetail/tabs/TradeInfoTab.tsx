// @ts-nocheck
import { Card, Row, Col, Space, Tag, Button, Switch, Typography } from 'antd';
import { EditOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons';
import {
  EnterpriseDetailSectionHint,
  enterpriseDetailCardTitle,
} from '@/components/enterpriseDetail/EnterpriseDetailSectionHint';
import type { FormInstance } from 'antd';

const { Text } = Typography;

interface TradeInfoTabProps {
  enterprise: any;
  hasForeignTrade: boolean;
  setHasForeignTrade: (v: boolean) => void;
  marketChanges: { up: any[]; down: any[] };
  setMarketChanges: React.Dispatch<React.SetStateAction<{ up: any[]; down: any[] }>>;
  modeChanges: { up: any[]; down: any[] };
  setModeChanges: React.Dispatch<React.SetStateAction<{ up: any[]; down: any[] }>>;
  categoryChanges: { up: any[]; down: any[] };
  setCategoryChanges: React.Dispatch<React.SetStateAction<{ up: any[]; down: any[] }>>;
  growthReasons: string[];
  setGrowthReasons: React.Dispatch<React.SetStateAction<string[]>>;
  declineReasons: string[];
  setDeclineReasons: React.Dispatch<React.SetStateAction<string[]>>;
  persistTradePerformanceJson: (market: any, mode: any, category: any) => Promise<void>;
  setTradeChangeType: (v: 'market' | 'mode' | 'category') => void;
  setTradeChangeDirection: (v: 'up' | 'down') => void;
  setEditingTradeChange: (v: any) => void;
  setIsTradeChangeModalOpen: (v: boolean) => void;
  setIsTradeModalOpen: (v: boolean) => void;
  setIsTradePerformanceModalOpen: (v: boolean) => void;
  setReasonType: (v: 'growth' | 'decline') => void;
  setEditingReason: (v: any) => void;
  setIsReasonModalOpen: (v: boolean) => void;
  reasonForm: FormInstance;
}

export default function TradeInfoTab({
  enterprise,
  hasForeignTrade,
  setHasForeignTrade,
  marketChanges,
  setMarketChanges,
  modeChanges,
  setModeChanges,
  categoryChanges,
  setCategoryChanges,
  growthReasons,
  setGrowthReasons,
  declineReasons,
  setDeclineReasons,
  persistTradePerformanceJson,
  setTradeChangeType,
  setTradeChangeDirection,
  setEditingTradeChange,
  setIsTradeChangeModalOpen,
  setIsTradeModalOpen,
  setIsTradePerformanceModalOpen,
  setReasonType,
  setEditingReason,
  setIsReasonModalOpen,
  reasonForm,
}: TradeInfoTabProps) {

  const openTradeChange = (type: 'market' | 'mode' | 'category', direction: 'up' | 'down', editing: any = null) => {
    setTradeChangeType(type);
    setTradeChangeDirection(direction);
    setEditingTradeChange(editing);
    setIsTradeChangeModalOpen(true);
  };

  const openReasonModal = (type: 'growth' | 'decline', editing: { index: number; value: string } | null = null) => {
    setReasonType(type);
    setEditingReason(editing);
    if (editing) {
      reasonForm.setFieldsValue({ reason: editing.value });
    } else {
      reasonForm.resetFields();
    }
    setIsReasonModalOpen(true);
  };

  const renderChangeSection = (
    title: string,
    hintKey: string,
    upData: any[],
    downData: any[],
    type: 'market' | 'mode' | 'category',
    onRemoveUp: (idx: number) => void,
    onRemoveDown: (idx: number) => void,
  ) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
        <Text strong style={{ fontSize: 14, color: '#333' }}>{title}</Text>
        <EnterpriseDetailSectionHint sectionKey={hintKey} />
      </div>
      <Row gutter={16}>
        <Col span={12}>
          <div style={{ padding: '14px 16px', background: 'rgba(67,233,123,0.05)', borderRadius: 10, border: '1px solid rgba(67,233,123,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#43e97b' }} />
                <Text type="secondary" style={{ fontSize: 12 }}>增长{title.replace('变化', '')}</Text>
              </div>
              <Button type="link" size="small" icon={<PlusOutlined />} style={{ padding: 0, height: 'auto', fontSize: 12 }}
                onClick={() => openTradeChange(type, 'up')}>添加</Button>
            </div>
            <Space size={8} wrap>
              {upData.map((item, idx) => (
                <Tag key={idx} color="green" closable style={{ borderRadius: 4, fontWeight: 500 }}
                  onClose={() => onRemoveUp(idx)}>
                  <span style={{ cursor: 'pointer' }} onClick={() => openTradeChange(type, 'up', item)}>
                    {item.name} {item.rate}
                  </span>
                </Tag>
              ))}
            </Space>
          </div>
        </Col>
        <Col span={12}>
          <div style={{ padding: '14px 16px', background: 'rgba(255,77,79,0.05)', borderRadius: 10, border: '1px solid rgba(255,77,79,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4d4f' }} />
                <Text type="secondary" style={{ fontSize: 12 }}>下降{title.replace('变化', '')}</Text>
              </div>
              <Button type="link" size="small" icon={<PlusOutlined />} style={{ padding: 0, height: 'auto', fontSize: 12 }}
                onClick={() => openTradeChange(type, 'down')}>添加</Button>
            </div>
            <Space size={8} wrap>
              {downData.map((item, idx) => (
                <Tag key={idx} color="red" closable style={{ borderRadius: 4, fontWeight: 500 }}
                  onClose={() => onRemoveDown(idx)}>
                  <span style={{ cursor: 'pointer' }} onClick={() => openTradeChange(type, 'down', item)}>
                    {item.name} {item.rate}
                  </span>
                </Tag>
              ))}
            </Space>
          </div>
        </Col>
      </Row>
    </div>
  );

  return (
    <div>
      <Card
        size="small"
        style={{
          marginBottom: 16,
          borderRadius: 12,
          border: hasForeignTrade ? '1px solid rgba(67,233,123,0.3)' : 'none',
          boxShadow: hasForeignTrade ? '0 4px 12px rgba(67,233,123,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
          background: hasForeignTrade ? 'rgba(67,233,123,0.05)' : '#fff',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: hasForeignTrade ? '#43e97b' : '#d9d9d9',
              transition: 'all 0.3s ease',
              boxShadow: hasForeignTrade ? '0 0 8px rgba(67,233,123,0.5)' : 'none'
            }} />
            <Text strong style={{ fontSize: 15 }}>是否开展外贸业务</Text>
            <EnterpriseDetailSectionHint sectionKey="trade-switch" />
          </div>
          <Switch checked={hasForeignTrade} onChange={setHasForeignTrade} checkedChildren="是" unCheckedChildren="否" />
        </div>
      </Card>

      <div style={{
        maxHeight: hasForeignTrade ? 3000 : 0,
        overflow: 'hidden',
        opacity: hasForeignTrade ? 1 : 0,
        transition: 'all 0.4s ease-in-out'
      }}>
        <Card
          size="small"
          title={enterpriseDetailCardTitle('外贸基础信息', 'trade-basics')}
          style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          headStyle={{ borderBottom: '1px solid #f0f0f0' }}
          extra={<Button type="link" icon={<EditOutlined />} style={{ fontWeight: 500 }} onClick={() => setIsTradeModalOpen(true)}>编辑</Button>}
        >
          <Row gutter={[20, 20]}>
            {[
              { label: '外贸模式', value: enterprise.trade_mode || '-' },
              { label: '报关申报主体模式', value: enterprise.customs_declaration_mode || '-' },
              { label: '外贸业务团队模式', value: enterprise.trade_team_mode || '-' },
              { label: '外贸团队人数', value: enterprise.trade_team_size != null && enterprise.trade_team_size !== '' ? <>{enterprise.trade_team_size}<span style={{ fontSize: 14, fontWeight: 500, color: '#666' }}> 人</span></> : '-' },
              { label: '是否有国内电商经验', value: enterprise.has_domestic_ecommerce ? '是' : '否' },
              { label: '是否有海外分销商', value: enterprise.has_overseas_distributors ? '是' : '否' },
            ].map((item, idx) => (
              <Col span={8} key={idx}>
                <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>{item.label}</Text>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#333', lineHeight: 1.5 }}>{item.value}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        <Card
          size="small"
          title={enterpriseDetailCardTitle('外贸业绩分析', 'trade-performance')}
          style={{ marginTop: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          headStyle={{ borderBottom: '1px solid #f0f0f0' }}
          extra={<Button type="link" icon={<EditOutlined />} style={{ fontWeight: 500 }} onClick={() => setIsTradePerformanceModalOpen(true)}>编辑</Button>}
        >
          {(() => {
            const currentYear = new Date().getFullYear();
            const lastYear = currentYear - 1;
            const yearBeforeLast = currentYear - 2;
            const parseWan = (v: unknown): number | null => {
              if (v === null || v === undefined || v === '') return null;
              const n = Number(v);
              return Number.isFinite(n) ? n : null;
            };
            const lastYearRevenue = parseWan(enterprise.last_year_revenue);
            const yearBeforeLastRevenue = parseWan(enterprise.year_before_last_revenue);
            const canComputeGrowth = lastYearRevenue != null && yearBeforeLastRevenue != null && yearBeforeLastRevenue > 0;
            const growthRate = canComputeGrowth
              ? ((lastYearRevenue - yearBeforeLastRevenue) / yearBeforeLastRevenue * 100).toFixed(1)
              : null;
            const isPositive = growthRate != null && Number(growthRate) >= 0;
            const wanCell = (v: number | null) =>
              v != null ? <>{v}<span style={{ fontSize: 14, fontWeight: 500, color: '#888' }}> 万元</span></> : <span style={{ fontSize: 22, fontWeight: 600, color: '#bfbfbf' }}>—</span>;

            return (
              <Row gutter={16} style={{ marginBottom: 20 }}>
                <Col span={8}>
                  <div style={{ padding: '20px', background: 'rgba(102,126,234,0.05)', borderRadius: 12, border: '1px solid rgba(102,126,234,0.2)', textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>{yearBeforeLast}年外贸营业额</Text>
                    <div style={{ fontWeight: 700, color: '#667eea', fontSize: 28 }}>{wanCell(yearBeforeLastRevenue)}</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ padding: '20px', background: 'rgba(250,173,20,0.05)', borderRadius: 12, border: '1px solid rgba(250,173,20,0.2)', textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>{lastYear}年外贸营业额</Text>
                    <div style={{ fontWeight: 700, color: '#faad14', fontSize: 28 }}>{wanCell(lastYearRevenue)}</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{
                    padding: '20px',
                    background: growthRate != null && isPositive ? 'rgba(67,233,123,0.05)' : 'rgba(239,68,68,0.05)',
                    borderRadius: 12,
                    border: growthRate != null && isPositive ? '1px solid rgba(67,233,123,0.2)' : '1px solid rgba(239,68,68,0.2)',
                    textAlign: 'center'
                  }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>同比增长率</Text>
                    <div style={{ fontWeight: 700, color: growthRate == null ? '#bfbfbf' : isPositive ? '#43e97b' : '#ef4444', fontSize: 28 }}>
                      {growthRate != null ? <>{isPositive ? '+' : ''}{growthRate}<span style={{ fontSize: 14, fontWeight: 500 }}>%</span></> : <span style={{ fontSize: 22, fontWeight: 600 }}>—</span>}
                    </div>
                  </div>
                </Col>
              </Row>
            );
          })()}

          {renderChangeSection('市场变化', 'trade-performance-market', marketChanges.up, marketChanges.down, 'market',
            (idx) => setMarketChanges(prev => ({ ...prev, up: prev.up.filter((_, i) => i !== idx) })),
            (idx) => {
              const next = { ...marketChanges, down: marketChanges.down.filter((_, i) => i !== idx) };
              void persistTradePerformanceJson(next, modeChanges, categoryChanges);
            },
          )}

          {renderChangeSection('模式变化', 'trade-performance-mode', modeChanges.up, modeChanges.down, 'mode',
            (idx) => {
              const next = { ...modeChanges, up: modeChanges.up.filter((_, i) => i !== idx) };
              void persistTradePerformanceJson(marketChanges, next, categoryChanges);
            },
            (idx) => {
              const next = { ...modeChanges, down: modeChanges.down.filter((_, i) => i !== idx) };
              void persistTradePerformanceJson(marketChanges, next, categoryChanges);
            },
          )}

          {renderChangeSection('品类变化', 'trade-performance-category', categoryChanges.up, categoryChanges.down, 'category',
            (idx) => {
              const next = { ...categoryChanges, up: categoryChanges.up.filter((_, i) => i !== idx) };
              void persistTradePerformanceJson(marketChanges, modeChanges, next);
            },
            (idx) => {
              const next = { ...categoryChanges, down: categoryChanges.down.filter((_, i) => i !== idx) };
              void persistTradePerformanceJson(marketChanges, modeChanges, next);
            },
          )}

          {/* 原因分析 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
              <Text strong style={{ fontSize: 14, color: '#333' }}>原因分析</Text>
              <EnterpriseDetailSectionHint sectionKey="trade-performance-reasons" />
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ padding: '14px 16px', background: 'rgba(67,233,123,0.05)', borderRadius: 10, border: '1px solid rgba(67,233,123,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#43e97b' }} />
                      <Text type="secondary" style={{ fontSize: 12 }}>增长原因</Text>
                    </div>
                    <Button type="link" size="small" icon={<PlusOutlined />} style={{ padding: 0, height: 'auto', fontSize: 12 }}
                      onClick={() => openReasonModal('growth')}>添加</Button>
                  </div>
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    {growthReasons.map((reason, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.8)', borderRadius: 6 }}>
                        <span style={{ fontSize: 13, color: '#333', cursor: 'pointer' }}
                          onClick={() => openReasonModal('growth', { index: idx, value: reason })}>{reason}</span>
                        <CloseOutlined style={{ fontSize: 10, color: '#999', cursor: 'pointer' }}
                          onClick={() => setGrowthReasons(prev => prev.filter((_, i) => i !== idx))} />
                      </div>
                    ))}
                  </Space>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ padding: '14px 16px', background: 'rgba(255,77,79,0.05)', borderRadius: 10, border: '1px solid rgba(255,77,79,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4d4f' }} />
                      <Text type="secondary" style={{ fontSize: 12 }}>下降原因</Text>
                    </div>
                    <Button type="link" size="small" icon={<PlusOutlined />} style={{ padding: 0, height: 'auto', fontSize: 12 }}
                      onClick={() => openReasonModal('decline')}>添加</Button>
                  </div>
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    {declineReasons.map((reason, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.8)', borderRadius: 6 }}>
                        <span style={{ fontSize: 13, color: '#333', cursor: 'pointer' }}
                          onClick={() => openReasonModal('decline', { index: idx, value: reason })}>{reason}</span>
                        <CloseOutlined style={{ fontSize: 10, color: '#999', cursor: 'pointer' }}
                          onClick={() => setDeclineReasons(prev => prev.filter((_, i) => i !== idx))} />
                      </div>
                    ))}
                  </Space>
                </div>
              </Col>
            </Row>
          </div>
        </Card>
      </div>
    </div>
  );
}
