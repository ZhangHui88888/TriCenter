import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Table, Progress, Spin } from 'antd';
import { ArrowRightOutlined, RiseOutlined, ArrowUpOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { dashboardApi } from '@/services/api';

const { Title, Text } = Typography;

// BankDash 色系
const C = { blue: '#396AFF', teal: '#16DBCC', pink: '#FE5C73', yellow: '#FFBB38', purple: '#7B61FF', textDark: '#343C6A', textMuted: '#718EBF' };
const cardStyle = { borderRadius: 25, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' };

// 漏斗阶段配置（BankDash 色系）
const FUNNEL_STAGES_CONFIG = [
  { code: 'POTENTIAL', name: '潜在企业', color: C.purple },
  { code: 'NO_DEMAND', name: '无明确需求', color: C.yellow },
  { code: 'NO_INTENTION', name: '没有合作意向', color: C.pink },
  { code: 'HAS_DEMAND', name: '有明确需求', color: C.blue },
  { code: 'SIGNED', name: '已签约', color: C.purple },
  { code: 'SETTLED', name: '已入驻', color: C.teal },
  { code: 'INCUBATING', name: '重点孵化', color: C.yellow },
];

// 转化数据（待后端API开发后替换）
const defaultConversionData = [
  { from: '潜在企业', to: '有明确需求', count: 0, rate: 0 },
  { from: '潜在企业', to: '无明确需求', count: 0, rate: 0 },
  { from: '无明确需求', to: '有明确需求', count: 0, rate: 0 },
  { from: '无明确需求', to: '没有合作意向', count: 0, rate: 0 },
  { from: '有明确需求', to: '已签约', count: 0, rate: 0 },
  { from: '已签约', to: '已入驻', count: 0, rate: 0 },
  { from: '已入驻', to: '重点孵化', count: 0, rate: 0 },
];

function FunnelAnalysis() {
  const [loading, setLoading] = useState(true);
  const [funnelStages, setFunnelStages] = useState<any[]>([]);
  const [conversionData, setConversionData] = useState(defaultConversionData);
  
  // 加载漏斗数据
  const fetchFunnelData = async () => {
    setLoading(true);
    try {
      const response = await dashboardApi.getFunnelStats();
      if (response.data) {
        // 合并配置和数据
        const stages = FUNNEL_STAGES_CONFIG.map(config => {
          const data = response.data.find((d: any) => d.code === config.code);
          return {
            ...config,
            count: data?.count || 0,
          };
        });
        setFunnelStages(stages);
        
        // 计算转化数据
        const newConversionData = [
          { from: '潜在企业', to: '有明确需求', count: 0, rate: 0 },
          { from: '潜在企业', to: '无明确需求', count: 0, rate: 0 },
          { from: '无明确需求', to: '有明确需求', count: 0, rate: 0 },
          { from: '无明确需求', to: '没有合作意向', count: 0, rate: 0 },
          { from: '有明确需求', to: '已签约', count: 0, rate: 0 },
          { from: '已签约', to: '已入驻', count: 0, rate: 0 },
          { from: '已入驻', to: '重点孵化', count: 0, rate: 0 },
        ];
        
        // 根据阶段数据计算转化率
        const getCount = (name: string) => stages.find((s: any) => s.name === name)?.count || 0;
        newConversionData.forEach(item => {
          const fromCount = getCount(item.from);
          const toCount = getCount(item.to);
          item.count = toCount;
          item.rate = fromCount > 0 ? Math.round((toCount / fromCount) * 100 * 10) / 10 : 0;
        });
        setConversionData(newConversionData);
      }
    } catch (error) {
      console.error('Failed to fetch funnel data:', error);
      // 使用默认空数据
      setFunnelStages(FUNNEL_STAGES_CONFIG.map(c => ({ ...c, count: 0 })));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchFunnelData();
  }, []);

  const totalEnterprises = funnelStages.reduce((sum, s) => sum + s.count, 0);
  
  const potentialCount = funnelStages.find(s => s.code === 'POTENTIAL')?.count || 0;
  const signedCount = funnelStages.find(s => s.code === 'SIGNED')?.count || 0;
  const settledCount = funnelStages.find(s => s.code === 'SETTLED')?.count || 0;
  const incubatingCount = funnelStages.find(s => s.code === 'INCUBATING')?.count || 0;

  const overallConversionRate = ((signedCount + settledCount + incubatingCount) / totalEnterprises * 100).toFixed(1);
  const signingRate = (signedCount / potentialCount * 100).toFixed(1);
  const settlementRate = (settledCount / signedCount * 100).toFixed(1);

  const funnelOption = {
    tooltip: { 
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: Array<{ name: string; value: number; color: string }>) => {
        const item = params[0];
        return `<div style="font-weight:500;color:${C.textDark}">${item.name}</div><div style="color:${item.color};font-size:16px;font-weight:600">${item.value}家</div>`;
      },
      backgroundColor: '#fff',
      borderColor: '#E6EFF5',
      borderRadius: 12,
      textStyle: { color: C.textDark, fontSize: 13 },
    },
    grid: {
      left: '3%',
      right: '8%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: funnelStages.map(s => s.name),
      axisLabel: {
        interval: 0,
        fontSize: 11,
        color: C.textMuted,
        rotate: 0,
      },
      axisLine: { lineStyle: { color: '#E6EFF5' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: C.textMuted, fontSize: 11 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#F3F3F5', type: 'dashed' } },
    },
    series: [{
      type: 'bar',
      barWidth: '50%',
      data: funnelStages.map(stage => ({
        value: stage.count,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: stage.color },
              { offset: 1, color: adjustColor(stage.color, 30) },
            ],
          },
          borderRadius: [6, 6, 0, 0],
        },
      })),
      label: {
        show: true,
        position: 'top',
        formatter: '{c}家',
        fontSize: 12,
        fontWeight: 600,
        color: C.textDark,
      },
    }],
  };

  // 调整颜色亮度的辅助函数
  function adjustColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.slice(0, 2), 16) + amount);
    const g = Math.min(255, parseInt(hex.slice(2, 4), 16) + amount);
    const b = Math.min(255, parseInt(hex.slice(4, 6), 16) + amount);
    return `rgb(${r}, ${g}, ${b})`;
  }

  const trendOption = {
    tooltip: { trigger: 'axis', backgroundColor: '#fff', borderColor: '#E6EFF5', borderRadius: 12, textStyle: { color: C.textDark } },
    legend: { data: ['潜在企业', '有明确需求', '已签约', '已入驻'], bottom: 0, textStyle: { color: C.textMuted } },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['8月', '9月', '10月', '11月', '12月', '1月'],
      axisLabel: { color: C.textMuted },
    },
    yAxis: { type: 'value', axisLabel: { color: C.textMuted } },
    series: [
      { name: '潜在企业', type: 'line', data: [120, 132, 141, 148, 152, 156], smooth: true, itemStyle: { color: C.purple } },
      { name: '有明确需求', type: 'line', data: [42, 48, 52, 58, 62, 65], smooth: true, itemStyle: { color: C.blue } },
      { name: '已签约', type: 'line', data: [18, 22, 25, 28, 31, 34], smooth: true, itemStyle: { color: C.purple } },
      { name: '已入驻', type: 'line', data: [12, 14, 16, 18, 20, 23], smooth: true, itemStyle: { color: C.teal } },
    ],
  };

  const conversionColumns = [
    { title: '转化路径', key: 'path', render: (_: unknown, record: { from: string; to: string }) => (
      <span>{record.from} <ArrowRightOutlined style={{ color: C.textMuted, margin: '0 8px' }} /> {record.to}</span>
    )},
    { title: '转化数量', dataIndex: 'count', key: 'count', width: 100, render: (count: number) => <span style={{ fontWeight: 500, color: C.textDark }}>{count}家</span> },
    { title: '转化率', dataIndex: 'rate', key: 'rate', width: 150, render: (rate: number) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Progress percent={rate} size="small" strokeColor={C.blue} trailColor="#F3F3F5" style={{ flex: 1, margin: 0 }} />
        <span style={{ width: 45, color: C.textDark }}>{rate}%</span>
      </div>
    )},
  ];

  return (
    <div style={{ background: '#F5F7FA', minHeight: '100%', padding: 24, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, color: C.textDark }}>漏斗分析</Title>
        <Text style={{ color: C.textMuted }}>企业转化漏斗分析与趋势</Text>
      </div>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <Card title={<span style={{ fontWeight: 600, color: C.textDark }}>转化漏斗</span>} style={cardStyle} styles={{ body: { padding: '16px 24px' } }}>
              <ReactECharts option={funnelOption} style={{ height: 400 }} />
            </Card>
          </Col>
        <Col xs={24} lg={10}>
          <Card title={<span style={{ fontWeight: 600, color: C.textDark }}>阶段转化率</span>} style={{ ...cardStyle, marginBottom: 16 }} styles={{ body: { padding: '16px 24px' } }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {funnelStages.slice(0, -1).map((stage, index) => {
                const nextStage = funnelStages[index + 1];
                const rate = nextStage ? ((nextStage.count / stage.count) * 100) : 0;
                const isHighRate = rate > 100;
                return (
                  <div key={stage.code} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12,
                    padding: '8px 12px',
                    borderRadius: 12,
                    background: '#FAFBFC',
                    transition: 'all 0.2s ease',
                  }}>
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 4,
                        backgroundColor: stage.color,
                        boxShadow: `0 2px 4px ${stage.color}40`,
                      }}
                    />
                    <span style={{ width: 85, fontSize: 13, fontWeight: 500, color: C.textDark }}>{stage.name}</span>
                    <ArrowRightOutlined style={{ color: C.textMuted, fontSize: 12 }} />
                    <span style={{ width: 85, fontSize: 13, color: C.textMuted }}>{nextStage?.name}</span>
                    <div style={{ flex: 1 }}>
                      <Progress
                        percent={Math.min(Number(rate.toFixed(1)), 100)}
                        size="small"
                        strokeColor={{
                          '0%': stage.color,
                          '100%': nextStage?.color || stage.color,
                        }}
                        trailColor="#F3F3F5"
                        style={{ margin: 0 }}
                      />
                    </div>
                    {isHighRate ? (
                      <span style={{ 
                        width: 60, 
                        textAlign: 'right', 
                        fontWeight: 600,
                        color: C.teal,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 2,
                      }}>
                        <ArrowUpOutlined style={{ fontSize: 11 }} />
                        {rate.toFixed(1)}%
                      </span>
                    ) : (
                      <span style={{ width: 60, textAlign: 'right', fontWeight: 600, color: C.textDark }}>
                        {rate.toFixed(1)}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
          <Card title={<span style={{ fontWeight: 600, color: C.textDark }}>关键指标</span>} style={cardStyle} styles={{ body: { padding: '16px 24px' } }}>
            <Row gutter={16} align="middle">
              <Col span={8}>
                <div style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '16px 0',
                  background: '#FFFFFF',
                  borderRadius: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#DCFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, color: C.teal }}>
                    <RiseOutlined style={{ fontSize: 18 }} />
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4, fontWeight: 500 }}>整体转化率</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.teal }}>{overallConversionRate}%</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '16px 0',
                  background: '#FFFFFF',
                  borderRadius: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#E7EDFF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, color: C.blue }}>
                    <ArrowRightOutlined style={{ fontSize: 18 }} />
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4, fontWeight: 500 }}>签约转化率</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.blue }}>{signingRate}%</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '16px 0',
                  background: '#FFFFFF',
                  borderRadius: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F0EBFF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, color: C.purple }}>
                    <ArrowUpOutlined style={{ fontSize: 18 }} />
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4, fontWeight: 500 }}>入驻转化率</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.purple }}>{settlementRate}%</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title={<span style={{ fontWeight: 600, color: C.textDark }}>趋势分析</span>} style={cardStyle} styles={{ body: { padding: '16px 24px' } }}>
            <ReactECharts option={trendOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={<span style={{ fontWeight: 600, color: C.textDark }}>转化明细</span>} style={cardStyle} styles={{ body: { padding: '16px 24px' } }}>
            <Table
              columns={conversionColumns}
              dataSource={conversionData}
              rowKey={(record) => `${record.from}-${record.to}`}
              size="small"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
      </Spin>
    </div>
  );
}

export default FunnelAnalysis;
