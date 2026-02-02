import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Progress, Button, List, Typography } from 'antd';
import {
  ShopOutlined,
  ClockCircleOutlined,
  AimOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  WarningOutlined,
  PlusOutlined,
  RiseOutlined,
  FunnelPlotOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { funnelStages, districtStats, industryStats } from '@/data/mockData';

const { Title, Text } = Typography;

function Dashboard() {
  const navigate = useNavigate();
  
  const totalEnterprises = funnelStages.reduce((sum, s) => sum + s.count, 0);
  const signedCount = funnelStages
    .filter(s => ['SIGNED', 'SETTLED', 'INCUBATING'].includes(s.code))
    .reduce((sum, s) => sum + s.count, 0);
  const hasDemandCount = funnelStages.find(s => s.code === 'HAS_DEMAND')?.count || 0;
  const potentialCount = funnelStages.find(s => s.code === 'POTENTIAL')?.count || 0;

  const stats = [
    { 
      label: '企业总数', 
      value: totalEnterprises, 
      icon: <ShopOutlined />, 
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      lightBg: 'rgba(102, 126, 234, 0.1)',
      change: '+12',
      changeColor: '#667eea'
    },
    { 
      label: '潜在企业', 
      value: potentialCount, 
      icon: <ClockCircleOutlined />, 
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      lightBg: 'rgba(245, 87, 108, 0.1)',
      change: '+8',
      changeColor: '#f5576c'
    },
    { 
      label: '有明确需求', 
      value: hasDemandCount, 
      icon: <AimOutlined />, 
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      lightBg: 'rgba(79, 172, 254, 0.1)',
      change: '+5',
      changeColor: '#4facfe'
    },
    { 
      label: '已签约入驻', 
      value: signedCount, 
      icon: <CheckCircleOutlined />, 
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      lightBg: 'rgba(67, 233, 123, 0.1)',
      change: '+3',
      changeColor: '#43e97b'
    },
  ];

  const districtChartOption = {
    tooltip: { 
      trigger: 'axis', 
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#eee',
      borderWidth: 1,
      textStyle: { color: '#333' }
    },
    grid: { left: '3%', right: '8%', bottom: '3%', top: '3%', containLabel: true },
    xAxis: { 
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }
    },
    yAxis: { 
      type: 'category', 
      data: districtStats.map(d => d.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#666' }
    },
    series: [{
      type: 'bar',
      data: districtStats.map((d, i) => ({
        value: d.count,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#667eea' },
              { offset: 1, color: '#764ba2' }
            ]
          }
        }
      })),
      barWidth: '60%',
      itemStyle: { borderRadius: [0, 6, 6, 0] },
      label: { show: true, position: 'right', color: '#666', fontSize: 12 }
    }],
  };

  const industryChartOption = {
    tooltip: { 
      trigger: 'item', 
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#eee',
      borderWidth: 1,
      textStyle: { color: '#333' }
    },
    legend: { 
      orient: 'vertical', 
      right: '5%', 
      top: 'center',
      textStyle: { color: '#666' },
      itemGap: 12
    },
    series: [{
      type: 'pie',
      radius: ['45%', '75%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      label: { show: false },
      emphasis: { 
        label: { show: true, fontSize: 14, fontWeight: 'bold' },
        itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0, 0, 0, 0.2)' }
      },
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      data: industryStats.map((item, index) => ({
        value: item.count,
        name: item.name,
        itemStyle: {
          color: [
            '#667eea', '#f093fb', '#4facfe', '#43e97b', 
            '#fa709a', '#fee140', '#30cfd0', '#a8edea'
          ][index % 8],
        },
      })),
    }],
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>概览看板</Title>
        <Text type="secondary">企业信息管理系统数据概览</Text>
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card 
              hoverable 
              className="stat-card"
              style={{ 
                borderRadius: 16,
                border: 'none',
                background: '#fff'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 14 }}>{stat.label}</Text>
                  <div style={{ 
                    fontSize: 32, 
                    fontWeight: 700, 
                    margin: '12px 0 8px',
                    background: stat.gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 10px',
                    borderRadius: 20,
                    background: stat.lightBg,
                    fontSize: 12,
                    fontWeight: 500,
                    color: stat.changeColor
                  }}>
                    <RiseOutlined style={{ marginRight: 4 }} />
                    {stat.change} 本月
                  </div>
                </div>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: stat.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 26,
                    color: '#fff',
                    boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ fontWeight: 600, fontSize: 16 }}>漏斗阶段分布</span>
            }
            extra={
              <Button 
                type="link" 
                onClick={() => navigate('/funnel')}
                style={{ fontWeight: 500 }}
              >
                查看详情 <ArrowRightOutlined />
              </Button>
            }
            style={{ borderRadius: 16, border: 'none' }}
            bodyStyle={{ padding: '20px 24px' }}
          >
            <div style={{ padding: '4px 0' }}>
              {funnelStages.map((stage, idx) => {
                const gradients = [
                  'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
                  'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
                  'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                  'linear-gradient(90deg, #fa709a 0%, #fee140 100%)',
                  'linear-gradient(90deg, #a8edea 0%, #fed6e3 100%)',
                  'linear-gradient(90deg, #5ee7df 0%, #b490ca 100%)',
                  'linear-gradient(90deg, #d299c2 0%, #fef9d7 100%)',
                ];
                return (
                  <div
                    key={stage.code}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: 16,
                      gap: 16,
                    }}
                  >
                    <span style={{ 
                      width: 90, 
                      fontSize: 13, 
                      color: '#555',
                      fontWeight: 500 
                    }}>
                      {stage.name}
                    </span>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <div style={{
                        height: 10,
                        borderRadius: 5,
                        background: '#f0f0f0',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(stage.count / totalEnterprises) * 100}%`,
                          height: '100%',
                          background: gradients[idx % gradients.length],
                          borderRadius: 5,
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                    </div>
                    <span style={{ 
                      width: 45, 
                      textAlign: 'right', 
                      fontWeight: 600,
                      fontSize: 14,
                      color: '#333'
                    }}>
                      {stage.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={<span style={{ fontWeight: 600, fontSize: 16 }}>区域分布</span>}
            style={{ borderRadius: 16, border: 'none' }}
            bodyStyle={{ padding: '16px 24px' }}
          >
            <ReactECharts option={districtChartOption} style={{ height: 280 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card 
            title={<span style={{ fontWeight: 600, fontSize: 16 }}>行业分布</span>}
            style={{ borderRadius: 16, border: 'none' }}
            bodyStyle={{ padding: '16px 24px' }}
          >
            <ReactECharts option={industryChartOption} style={{ height: 250 }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title={<span style={{ fontWeight: 600, fontSize: 16 }}>快捷操作</span>}
            style={{ borderRadius: 16, border: 'none' }}
            bodyStyle={{ padding: '20px 24px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Button
                type="default"
                icon={<PlusOutlined />}
                block
                size="large"
                style={{ 
                  textAlign: 'left', 
                  height: 52, 
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                  borderRadius: 12,
                  fontWeight: 500
                }}
                onClick={() => navigate('/enterprise')}
              >
                新增企业
              </Button>
              <Button
                type="default"
                icon={<RiseOutlined />}
                block
                size="large"
                style={{ 
                  textAlign: 'left', 
                  height: 52, 
                  background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)',
                  borderColor: 'rgba(67, 233, 123, 0.3)',
                  borderRadius: 12,
                  fontWeight: 500
                }}
                onClick={() => navigate('/follow-up')}
              >
                添加跟进
              </Button>
              <Button
                type="default"
                icon={<FunnelPlotOutlined />}
                block
                size="large"
                style={{ 
                  textAlign: 'left', 
                  height: 52, 
                  background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%)',
                  borderColor: 'rgba(240, 147, 251, 0.3)',
                  borderRadius: 12,
                  fontWeight: 500
                }}
                onClick={() => navigate('/funnel')}
              >
                漏斗分析
              </Button>
            </div>
            <div style={{ 
              marginTop: 20, 
              paddingTop: 20, 
              borderTop: '1px solid #f0f0f0' 
            }}>
              <Text strong style={{ fontSize: 14, color: '#333' }}>待跟进提醒</Text>
              <List
                size="small"
                style={{ marginTop: 12 }}
                dataSource={[
                  { 
                    icon: <WarningOutlined />, 
                    text: '12家企业超过30天未跟进',
                    bg: 'linear-gradient(135deg, rgba(250, 173, 20, 0.15) 0%, rgba(255, 193, 7, 0.1) 100%)',
                    color: '#d48806'
                  },
                  { 
                    icon: <ClockCircleOutlined />, 
                    text: '5家企业本周需回访',
                    bg: 'linear-gradient(135deg, rgba(79, 172, 254, 0.15) 0%, rgba(0, 242, 254, 0.1) 100%)',
                    color: '#1890ff'
                  },
                ]}
                renderItem={(item) => (
                  <List.Item style={{ padding: '6px 0', border: 'none' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 10, 
                      fontSize: 13, 
                      color: '#555',
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: item.bg,
                      width: '100%'
                    }}>
                      <span style={{ color: item.color, fontSize: 16 }}>{item.icon}</span>
                      <span style={{ fontWeight: 500 }}>{item.text}</span>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
