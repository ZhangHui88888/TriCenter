import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Spin } from 'antd';
import {
  ShopOutlined,
  ClockCircleOutlined,
  AimOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  WarningOutlined,
  PlusOutlined,
  BarChartOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { dashboardApi } from '@/services/api';

const C = {
  blue: '#396AFF',
  teal: '#16DBCC',
  pink: '#FE5C73',
  yellow: '#FFBB38',
  purple: '#7B61FF',
  orange: '#FF6B35',
  textDark: '#343C6A',
  textMuted: '#718EBF',
  cardBg: '#FFFFFF',
  pageBg: '#F5F7FA',
};

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [funnelStats, setFunnelStats] = useState<any[]>([]);
  const [industryStats, setIndustryStats] = useState<any[]>([]);
  const [pendingFollowUps, setPendingFollowUps] = useState<any>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [overviewRes, funnelRes, industryRes, pendingRes, trendRes] = await Promise.all([
          dashboardApi.getOverview(),
          dashboardApi.getFunnelStats(),
          dashboardApi.getIndustryStats(),
          dashboardApi.getPendingFollowUps(),
          dashboardApi.getMonthlyTrend(),
        ]);
        setOverview(overviewRes.data);
        setFunnelStats(funnelRes.data || []);
        setIndustryStats(industryRes.data || []);
        setPendingFollowUps(pendingRes.data);
        setMonthlyTrend(trendRes.data || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  const totalEnterprises = overview?.totalEnterprises || 0;
  const potentialCount = overview?.potentialCount || 0;
  const hasDemandCount = overview?.hasDemandCount || 0;
  const signedCount = overview?.signedSettledCount || 0;
  const monthlyChange = overview?.monthlyChange || {};
  const signRate = potentialCount > 0 ? ((signedCount / potentialCount) * 100).toFixed(0) : '0';

  const stageColors = ['#1814F3', '#FC7900', '#FA00FF', '#2D60FF', C.teal, C.yellow, '#4FACFE'];
  const industryColors = [C.blue, C.teal, C.pink, C.orange, C.purple, C.yellow, '#4FACFE', '#A8EDEA'];

  /* ── 饼图：漏斗阶段分布（BankDash Expense Statistics 风格） ── */
  const funnelPieOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}家 ({d}%)',
      backgroundColor: '#fff',
      borderColor: '#E6EFF5',
      borderRadius: 12,
      textStyle: { color: C.textDark, fontSize: 13 },
    },
    legend: { show: false },
    series: [{
      type: 'pie',
      radius: ['40%', '80%'],
      center: ['50%', '50%'],
      startAngle: 200,
      padAngle: 3,
      itemStyle: { borderColor: '#fff', borderWidth: 4 },
      label: { show: false },
      emphasis: {
        scaleSize: 8,
        label: {
          show: true,
          formatter: '{d}%\n{b}',
          fontSize: 14,
          fontWeight: 600,
          fontFamily: 'Inter',
          color: C.textDark,
          lineHeight: 20,
        },
        itemStyle: { shadowBlur: 16, shadowColor: 'rgba(0,0,0,0.15)' },
      },
      data: funnelStats.map((s, i) => ({
        value: s.count,
        name: s.name,
        itemStyle: { color: stageColors[i % stageColors.length] },
      })),
    }],
  };

  /* ── 柱状图：行业分布（BankDash Weekly Activity 风格） ── */
  const industryBarOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(57,106,255,0.06)' } },
      backgroundColor: '#fff',
      borderColor: '#E6EFF5',
      borderRadius: 12,
      textStyle: { color: C.textDark, fontSize: 13 },
    },
    grid: { left: '2%', right: '4%', bottom: '14%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: industryStats.map(s => s.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: C.textMuted, fontSize: 11, interval: 0,
        rotate: industryStats.length > 6 ? 30 : 0,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#F3F3F5', type: 'dashed' } },
      axisLabel: { color: C.textMuted, fontSize: 11 },
    },
    series: [{
      type: 'bar',
      barWidth: 18,
      barMaxWidth: 28,
      data: industryStats.map((s, i) => ({
        value: s.count,
        itemStyle: {
          color: industryColors[i % industryColors.length],
          borderRadius: [6, 6, 0, 0],
        },
      })),
      label: {
        show: true,
        position: 'top',
        color: C.textDark,
        fontSize: 12,
        fontWeight: 600,
      },
    }],
  };

  /* ── 月度新增趋势折线图（BankDash Balance History 风格） ── */
  const monthlyTrendOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#E6EFF5',
      borderRadius: 12,
      textStyle: { color: C.textDark, fontSize: 13 },
    },
    legend: {
      data: ['新增企业', '新增签约'],
      top: 0, right: 20,
      textStyle: { color: C.textMuted, fontSize: 13 },
      itemWidth: 12, itemHeight: 12, itemGap: 24,
    },
    grid: { left: '3%', right: '4%', bottom: '8%', top: '14%', containLabel: true },
    xAxis: {
      type: 'category',
      data: monthlyTrend.map(m => m.month),
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: C.textMuted, fontSize: 14, fontFamily: 'Inter' },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#DFE5EE', type: 'dashed' } },
      axisLabel: { color: C.textMuted, fontSize: 13 },
    },
    series: [
      {
        name: '新增企业',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 3, color: '#1814F3' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(45, 96, 255, 0.35)' },
              { offset: 1, color: 'rgba(45, 96, 255, 0)' },
            ],
          },
        },
        data: monthlyTrend.map(m => m.totalNew),
      },
      {
        name: '新增签约',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 3, color: '#16DBCC' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(22, 219, 204, 0.25)' },
              { offset: 1, color: 'rgba(22, 219, 204, 0)' },
            ],
          },
        },
        data: monthlyTrend.map(m => m.signedNew),
      },
    ],
  };

  const cardStyle = { borderRadius: 25, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' };

  return (
    <div>
      {/* ═══ 第一行：蓝色主卡 + 统计卡 + 待跟进提醒 ═══ */}
      <div data-tour="dashboard-overview">
        <Row gutter={[24, 24]}>
          {/* 蓝色渐变主卡（BankDash "My Cards" 位置） */}
          <Col xs={24} lg={10}>
            <div style={{
              background: 'linear-gradient(135deg, #4F6CF7 0%, #253BA0 100%)',
              borderRadius: 25, padding: '28px 32px', color: '#fff',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              minHeight: 210, position: 'relative', overflow: 'hidden',
            }}>
              {/* 装饰半圆 */}
              <div style={{
                position: 'absolute', top: -30, right: -30,
                width: 160, height: 160, borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
              }} />
              <div style={{
                position: 'absolute', bottom: -40, right: 60,
                width: 120, height: 120, borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
              }} />

              <div>
                <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>企业总数</div>
                <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1 }}>{totalEnterprises}</div>
              </div>
              <div style={{ display: 'flex', gap: 32, marginTop: 16 }}>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>潜在企业</div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>{potentialCount}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>签约率</div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>{signRate}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>本月新增</div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>+{monthlyChange.total || 0}</div>
                </div>
              </div>
            </div>
          </Col>

          {/* 两张小统计卡（BankDash 第二张卡片位置） */}
          <Col xs={24} lg={7}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
              {[
                { label: '有明确需求', value: hasDemandCount, icon: <AimOutlined />, bg: '#DCFAF8', color: C.teal, change: monthlyChange.hasDemand || 0 },
                { label: '已签约入驻', value: signedCount, icon: <CheckCircleOutlined />, bg: '#FFF5D9', color: C.yellow, change: monthlyChange.signedSettled || 0 },
              ].map((s) => (
                <Card key={s.label} style={{ ...cardStyle, flex: 1 }} styles={{ body: { padding: '18px 24px', height: '100%', display: 'flex', alignItems: 'center' } }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: s.color, flexShrink: 0 }}>
                      {s.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: C.textDark }}>{s.value}</div>
                    </div>
                    <div style={{ fontSize: 11, color: s.change >= 0 ? C.teal : C.pink, fontWeight: 600 }}>
                      {s.change >= 0 ? '+' : ''}{s.change} 本月
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Col>

          {/* 待跟进提醒（BankDash "Recent Transaction" 位置） */}
          <Col xs={24} lg={7}>
            <Card
              title={<span style={{ fontWeight: 600, color: C.textDark }}>待跟进提醒</span>}
              style={{ ...cardStyle, height: '100%' }}
              styles={{ body: { padding: '12px 24px' } }}
            >
              {[
                { icon: <WarningOutlined />, text: `${pendingFollowUps?.overdue30Days || 0} 家企业超30天未跟进`, color: C.pink, bg: '#FFE0EB', sub: '需要尽快跟进' },
                { icon: <ClockCircleOutlined />, text: `${pendingFollowUps?.needFollowThisWeek || 0} 家企业本周需回访`, color: C.blue, bg: '#E7EDFF', sub: '计划中的回访' },
                { icon: <ShopOutlined />, text: `${potentialCount} 家潜在企业待转化`, color: C.teal, bg: '#DCFAF8', sub: '转化漏斗顶部' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < 2 ? '1px solid #F3F3F5' : 'none' }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, fontSize: 18, flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.textDark }}>{item.text}</div>
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </Card>
          </Col>
        </Row>
      </div>

      {/* ═══ 第二行：漏斗饼图 + 行业柱状图 ═══ */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }} data-tour="dashboard-charts">
        {/* 漏斗阶段分布（饼图） */}
        <Col xs={24} lg={9}>
          <Card
            title={<span style={{ fontWeight: 600, color: C.textDark }}>漏斗阶段分布</span>}
            extra={
              <Button type="link" onClick={() => navigate('/data-analysis')} style={{ fontWeight: 500, color: C.blue, fontSize: 13 }}>
                数据分析 <ArrowRightOutlined />
              </Button>
            }
            style={cardStyle}
            styles={{ body: { padding: '8px 16px 12px' } }}
          >
            <ReactECharts option={funnelPieOption} style={{ height: 240 }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', padding: '0 4px' }}>
              {funnelStats.map((s, i) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.textMuted }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: stageColors[i % stageColors.length], flexShrink: 0 }} />
                  {s.name}
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* 行业分布（柱状图） */}
        <Col xs={24} lg={15}>
          <Card
            title={<span style={{ fontWeight: 600, color: C.textDark }}>行业分布</span>}
            style={cardStyle}
            styles={{ body: { padding: '8px 20px 16px' } }}
          >
            <ReactECharts option={industryBarOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      {/* ═══ 第三行：快捷操作 + 区域分布 ═══ */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }} data-tour="dashboard-actions">
        {/* 快捷操作（BankDash "Quick Transfer" 位置） */}
        <Col xs={24} lg={9}>
          <Card
            title={<span style={{ fontWeight: 600, color: C.textDark }}>快捷操作</span>}
            style={cardStyle}
            styles={{ body: { padding: '20px 28px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 24 }}>
              {[
                { label: '新增企业', icon: <PlusOutlined />, color: C.blue, bg: '#E7EDFF', path: '/enterprise' },
                { label: '添加跟进', icon: <FileTextOutlined />, color: C.teal, bg: '#DCFAF8', path: '/follow-up' },
                { label: '数据分析', icon: <BarChartOutlined />, color: C.purple, bg: '#F0EBFF', path: '/data-analysis' },
              ].map((a) => (
                <div
                  key={a.label}
                  onClick={() => navigate(a.path)}
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, color: a.color, margin: '0 auto 8px',
                    transition: 'transform 0.2s',
                  }}>
                    {a.icon}
                  </div>
                  <div style={{ fontSize: 12, color: C.textDark, fontWeight: 500 }}>{a.label}</div>
                </div>
              ))}
            </div>

            <Button
              type="primary" block
              onClick={() => navigate('/enterprise')}
              style={{
                height: 44, borderRadius: 25, fontSize: 14, fontWeight: 600,
                background: C.blue, border: 'none',
                boxShadow: '0 4px 12px rgba(57,106,255,0.3)',
              }}
            >
              进入企业管理 <ArrowRightOutlined />
            </Button>
          </Card>
        </Col>

        {/* 月度新增趋势（BankDash "Balance History" 位置） */}
        <Col xs={24} lg={15}>
          <Card
            title={<span style={{ fontWeight: 600, color: C.textDark }}>月度新增趋势</span>}
            style={cardStyle}
            styles={{ body: { padding: '8px 20px 16px' } }}
          >
            <ReactECharts option={monthlyTrendOption} style={{ height: 260 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
