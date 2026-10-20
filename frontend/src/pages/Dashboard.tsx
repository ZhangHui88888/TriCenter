import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Spin } from 'antd';
import { ShopOutlined, AimOutlined, CheckCircleOutlined, ArrowRightOutlined, ClockCircleOutlined, PlusOutlined, FileTextOutlined } from '@ant-design/icons';
import { dashboardApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import DashboardDistributions, { type DistributionItem } from './DashboardDistributions';
import DashboardRanking from './dashboard/DashboardRanking';
import DashboardTrend, { type MonthlyTrend } from './dashboard/DashboardTrend';
import './dashboard/dashboard.css';

type Overview = {
  totalEnterprises: number; potentialCount: number; hasDemandCount: number; signedSettledCount: number;
  monthlyChange?: { total?: number; hasDemand?: number; signedSettled?: number };
};
type Pending = { overdue30Days: number; needFollowThisWeek: number };
const number = (value: number) => value.toLocaleString('zh-CN');

export default function Dashboard() {
  const navigate = useNavigate();
  const hasPermission = useAuthStore(state => state.hasPermission);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [funnelStats, setFunnelStats] = useState<DistributionItem[]>([]);
  const [industryStats, setIndustryStats] = useState<DistributionItem[]>([]);
  const [districtStats, setDistrictStats] = useState<DistributionItem[]>([]);
  const [enterpriseTypeStats, setEnterpriseTypeStats] = useState<DistributionItem[]>([]);
  const [pending, setPending] = useState<Pending | null>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    Promise.all([
      dashboardApi.getOverview(), dashboardApi.getFunnelStats(), dashboardApi.getIndustryStats(),
      dashboardApi.getDistrictStats(), dashboardApi.getEnterpriseTypeStats(),
      dashboardApi.getPendingFollowUps(), dashboardApi.getMonthlyTrend(),
    ]).then(([summary, funnel, industry, district, types, reminders, trend]) => {
      if (!active) return;
      setOverview(summary.data);
      setFunnelStats(funnel.data || []);
      setIndustryStats(industry.data || []);
      setDistrictStats(district.data || []);
      setEnterpriseTypeStats(types.data || []);
      setPending(reminders.data);
      setMonthlyTrend(trend.data || []);
    }).catch(() => { if (active) setFailed(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);

  if (loading) return <div className="dashboard-loading"><Spin size="large" /></div>;
  if (failed) return <Alert type="error" showIcon message="看板数据加载失败" description="请稍后重试。" action={<Button onClick={() => setAttempt(value => value + 1)}>重新加载</Button>} />;

  const total = overview?.totalEnterprises || 0;
  const potential = overview?.potentialCount || 0;
  const signed = overview?.signedSettledCount || 0;
  const monthly = overview?.monthlyChange || {};
  const metrics = [
    { title: '企业总数', value: total, note: '本月新增 ' + number(monthly.total || 0) + ' 家', icon: <ShopOutlined />, primary: true },
    { title: '潜在企业', value: potential, note: '待进一步了解与转化', icon: <ClockCircleOutlined /> },
    { title: '有明确需求', value: overview?.hasDemandCount || 0, note: '本月新增 ' + number(monthly.hasDemand || 0) + ' 家', icon: <AimOutlined /> },
    { title: '已签约入驻', value: signed, note: '本月新增 ' + number(monthly.signedSettled || 0) + ' 家', icon: <CheckCircleOutlined /> },
  ];

  return <div className="dashboard-page">
    <div className="dashboard-toolbar" data-tour="dashboard-actions">
      <p>企业运营概况<span>掌握业务进展，安排下一步跟进</span></p>
      <div className="dashboard-actions">
        {hasPermission('followup:manage') && <Button icon={<FileTextOutlined />} onClick={() => navigate('/follow-up')}>添加跟进</Button>}
        {hasPermission('enterprise:create') && <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/enterprise')}>新增企业</Button>}
      </div>
    </div>
    <div className="dashboard-metrics" data-tour="dashboard-overview">
      {metrics.map(item => <section className={'dashboard-metric' + (item.primary ? ' dashboard-metric-primary' : '')} key={item.title}>
        <div className="dashboard-metric-label">{item.title}{item.icon}</div>
        <div className="dashboard-metric-value">{number(item.value)}<span>家</span></div>
        <p>{item.note}</p>
      </section>)}
    </div>
    <div className="dashboard-priority-grid">
      <DashboardTrend data={monthlyTrend} />
      <section className="dashboard-panel dashboard-reminders">
        <div className="dashboard-panel-heading"><h2>待跟进提醒</h2><span>工作安排</span></div>
        <div className="dashboard-reminder dashboard-reminder-urgent">
          <div><span className="dashboard-status-dot" />超 30 天未跟进<strong>{number(pending?.overdue30Days || 0)}<small>家</small></strong></div>
          <p>{pending?.overdue30Days ? '建议优先联系，更新企业近况' : '暂无超期未跟进企业'}</p>
        </div>
        <div className="dashboard-reminder">
          <div><span className="dashboard-status-dot" />本周需回访<strong>{number(pending?.needFollowThisWeek || 0)}<small>家</small></strong></div>
          <p>{pending?.needFollowThisWeek ? '按计划推进本周回访' : '本周暂无待回访计划'}</p>
        </div>
        <Button block onClick={() => navigate('/follow-up')}>查看跟进记录 <ArrowRightOutlined /></Button>
        <Button type="text" block onClick={() => navigate('/enterprise')}>进入企业管理 <ArrowRightOutlined /></Button>
      </section>
    </div>
    <div className="dashboard-section-heading"><h2>企业分布</h2><Button type="link" onClick={() => navigate('/data-analysis')}>查看完整分析 <ArrowRightOutlined /></Button></div>
    <div className="dashboard-distribution-grid" data-tour="dashboard-charts">
      <DashboardRanking title="漏斗阶段分布" subtitle="各阶段企业数量" data={funnelStats} total={total} preserveOrder />
      <DashboardRanking title="行业分布" subtitle="已分类行业 · 按企业数排序" data={industryStats} total={total} separateUnknown />
      <DashboardDistributions districts={districtStats} types={enterpriseTypeStats} />
    </div>
  </div>;
}
