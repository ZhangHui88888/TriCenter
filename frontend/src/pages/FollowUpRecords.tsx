import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  DatePicker,
  Row,
  Col,
  Typography,
  Statistic,
  message,
  Spin,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  TeamOutlined,
  FileTextOutlined,
  ArrowRightOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { followUpApi, enterpriseApi, dashboardApi } from '@/services/api';
import { FOLLOW_UP_TYPES } from '@/utils/constants';
import type { FollowUpRecord } from '@/types';

// 漏斗阶段配置
const FUNNEL_STAGES = [
  { code: 'POTENTIAL', name: '潜在企业', color: '#94a3b8' },
  { code: 'NO_DEMAND', name: '无明确需求', color: '#fbbf24' },
  { code: 'NO_INTENTION', name: '没有合作意向', color: '#ef4444' },
  { code: 'HAS_DEMAND', name: '有明确需求', color: '#3b82f6' },
  { code: 'SIGNED', name: '已签约', color: '#8b5cf6' },
  { code: 'SETTLED', name: '已入驻', color: '#10b981' },
  { code: 'INCUBATING', name: '重点孵化', color: '#f97316' },
];

// 阶段顺序映射
const stageOrder: Record<string, number> = {
  'POTENTIAL': 1,
  'NO_DEMAND': 2,
  'NO_INTENTION': 3,
  'HAS_DEMAND': 4,
  'SIGNED': 5,
  'SETTLED': 6,
  'INCUBATING': 7,
};

const { Title, Text } = Typography;
const { TextArea } = Input;

function FollowUpRecords() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  
  // API数据状态
  const [loading, setLoading] = useState(true);
  const [followUpRecords, setFollowUpRecords] = useState<any[]>([]);
  const [enterprises, setEnterprises] = useState<any[]>([]);
  const [stats, setStats] = useState({
    monthCount: 0,
    weekCount: 0,
    todayCount: 0,
    pendingCount: 0,
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  
  // 加载跟进记录
  const fetchFollowUpRecords = async () => {
    setLoading(true);
    try {
      const response = await followUpApi.getList({
        page,
        pageSize,
        type: typeFilter || undefined,
      });
      if (response.data) {
        const list = (response.data.list || []).map((item: any) => ({
          id: item.id,
          enterprise_id: item.enterpriseId,
          enterprise_name: item.enterpriseName,
          follow_up_date: item.followUpDate,
          follow_up_person: item.followUpPerson,
          follow_up_type: item.followUpType,
          content: item.content,
          overall_status: item.overallStatus,
          next_step: item.nextPlan,
          stage_before: item.stageBefore,
          stage_after: item.stageAfter,
        }));
        setFollowUpRecords(list);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch follow-up records:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 加载企业列表（用于新增跟进时选择）
  const fetchEnterprises = async () => {
    try {
      const response = await enterpriseApi.getList({ pageSize: 1000 });
      if (response.data?.list) {
        setEnterprises(response.data.list.map((e: any) => ({
          id: e.id,
          enterprise_name: e.name,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch enterprises:', error);
    }
  };
  
  // 加载统计数据
  const fetchStats = async () => {
    try {
      const response = await dashboardApi.getPendingFollowUps();
      if (response.data) {
        setStats({
          monthCount: response.data.monthCount || 0,
          weekCount: response.data.weekCount || 0,
          todayCount: response.data.todayCount || 0,
          pendingCount: response.data.pendingCount || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };
  
  useEffect(() => {
    fetchEnterprises();
    fetchStats();
  }, []);
  
  useEffect(() => {
    fetchFollowUpRecords();
  }, [page, pageSize, typeFilter]);

  const getStageInfo = (code: string) => {
    const stage = FUNNEL_STAGES.find(s => s.code === code);
    return stage || { name: code, color: '#94a3b8' };
  };

  // 前端搜索过滤
  const filteredRecords = followUpRecords.filter(r => {
    const matchesSearch = !searchTerm || 
      r.enterprise_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.content?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case '电话': return <PhoneOutlined />;
      case '视频': return <VideoCameraOutlined />;
      case '拜访': return <TeamOutlined />;
      case '会议': return <TeamOutlined />;
      default: return <FileTextOutlined />;
    }
  };

  const columns: ColumnsType<FollowUpRecord> = [
    {
      title: '企业名称',
      dataIndex: 'enterprise_name',
      key: 'enterprise_name',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: '跟进类型',
      dataIndex: 'follow_up_type',
      key: 'follow_up_type',
      width: 100,
      render: (type: string) => (
        <Tag icon={getTypeIcon(type)}>{type}</Tag>
      ),
    },
    {
      title: '跟进内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: '跟进日期',
      dataIndex: 'follow_up_date',
      key: 'follow_up_date',
      width: 120,
    },
    {
      title: '跟进人',
      dataIndex: 'follow_up_person',
      key: 'follow_up_person',
      width: 80,
    },
    {
      title: '阶段变化',
      key: 'stage_change',
      width: 320,
      render: (_, record) => {
        if (record.stage_before && record.stage_after && record.stage_before !== record.stage_after) {
          const stageBefore = getStageInfo(record.stage_before);
          const stageAfter = getStageInfo(record.stage_after);
          const beforeOrder = stageOrder[record.stage_before] || 0;
          const afterOrder = stageOrder[record.stage_after] || 0;
          const isUpgrade = afterOrder > beforeOrder;
          const themeColor = isUpgrade ? '#52c41a' : '#faad14';

          return (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                borderRadius: 20,
                background: isUpgrade 
                  ? 'linear-gradient(135deg, rgba(82,196,26,0.08) 0%, rgba(255,255,255,0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(250,173,20,0.08) 0%, rgba(255,255,255,0.95) 100%)',
                border: `1px solid ${isUpgrade ? 'rgba(82,196,26,0.2)' : 'rgba(250,173,20,0.2)'}`,
              }}
            >
              {/* 起始阶段 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 10px',
                  borderRadius: 12,
                  background: `${stageBefore.color}12`,
                  border: `1px solid ${stageBefore.color}30`,
                  fontSize: 12,
                  fontWeight: 500,
                  color: stageBefore.color,
                  whiteSpace: 'nowrap',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: stageBefore.color,
                    opacity: 0.6,
                  }}
                />
                {stageBefore.name}
              </div>

              {/* 箭头指示器 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  padding: '4px 8px',
                  borderRadius: 10,
                  background: `${themeColor}15`,
                }}
              >
                {isUpgrade ? (
                  <RiseOutlined style={{ fontSize: 14, color: themeColor }} />
                ) : (
                  <FallOutlined style={{ fontSize: 14, color: themeColor }} />
                )}
                <ArrowRightOutlined style={{ fontSize: 12, color: themeColor }} />
              </div>

              {/* 目标阶段 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 10px',
                  borderRadius: 12,
                  background: `${stageAfter.color}20`,
                  border: `1px solid ${stageAfter.color}50`,
                  fontSize: 12,
                  fontWeight: 600,
                  color: stageAfter.color,
                  whiteSpace: 'nowrap',
                  boxShadow: `0 2px 8px ${stageAfter.color}20`,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: stageAfter.color,
                  }}
                />
                {stageAfter.name}
              </div>
            </div>
          );
        }
        return <span style={{ color: '#bfbfbf', fontSize: 13 }}>—</span>;
      },
    },
  ];

  const handleAddRecord = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        enterpriseId: values.enterprise_id,
        followUpType: values.follow_up_type,
        followUpDate: values.follow_up_date?.format('YYYY-MM-DD'),
        content: values.content,
        overallStatus: values.overall_status,
        nextPlan: values.next_step,
        stageAfter: values.stage_after,
        serviceProvider: values.service_provider,
      };
      await followUpApi.create(data);
      message.success('跟进记录添加成功');
      setIsModalOpen(false);
      form.resetFields();
      fetchFollowUpRecords();
      fetchStats();
    } catch (error: any) {
      if (error.errorFields) return; // 表单验证错误
      message.error(error.message || '添加失败');
    }
  };

  const statsDisplay = [
    { title: '本月跟进', value: stats.monthCount, icon: <FileTextOutlined style={{ color: '#1890ff' }} /> },
    { title: '本周跟进', value: stats.weekCount, icon: <PhoneOutlined style={{ color: '#52c41a' }} /> },
    { title: '今日跟进', value: stats.todayCount, icon: <TeamOutlined style={{ color: '#722ed1' }} /> },
    { title: '待跟进企业', value: stats.pendingCount, icon: <VideoCameraOutlined style={{ color: '#faad14' }} /> },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>跟进记录</Title>
          <Text type="secondary">管理所有企业跟进记录</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          新增跟进
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        {statsDisplay.map((stat, index) => (
          <Col xs={12} sm={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="搜索企业名称或跟进内容..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
          <Select
            placeholder="全部类型"
            style={{ width: 120 }}
            allowClear
            value={typeFilter || undefined}
            onChange={(value) => setTypeFilter(value || '')}
            options={FOLLOW_UP_TYPES.map(t => ({ label: t, value: t }))}
          />
        </Space>
      </Card>

      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredRecords}
            rowKey="id"
            pagination={{
              total: total,
              current: page,
              pageSize: pageSize,
              showTotal: (total) => `共 ${total} 条记录`,
              showSizeChanger: true,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
            }}
          />
        </Spin>
      </Card>

      <Modal
        title="新增跟进记录"
        open={isModalOpen}
        onOk={handleAddRecord}
        onCancel={() => setIsModalOpen(false)}
        width={600}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="enterprise_id" label="选择企业" rules={[{ required: true, message: '请选择企业' }]}>
                <Select
                  placeholder="请选择企业"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={enterprises.map(e => ({ label: e.enterprise_name, value: e.id }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="follow_up_type" label="跟进类型" rules={[{ required: true, message: '请选择跟进类型' }]}>
                <Select
                  placeholder="请选择"
                  options={[
                    { label: '电话', value: '电话' },
                    { label: '视频', value: '视频' },
                    { label: '拜访', value: '拜访' },
                    { label: '会议', value: '会议' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="follow_up_date" label="跟进日期" rules={[{ required: true, message: '请选择跟进日期' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="content" label="跟进内容" rules={[{ required: true, message: '请输入跟进内容' }]}>
                <TextArea rows={4} placeholder="请输入跟进内容..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="overall_status" label="整体状态">
                <Input placeholder="如：积极配合、观望中等" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="stage_after" label="变更阶段">
                <Select
                  placeholder="如无变化可不选"
                  allowClear
                  options={FUNNEL_STAGES.map(s => ({ label: s.name, value: s.code }))}
                />
              </Form.Item>
            </Col>
            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.stage_after !== cur.stage_after}>
              {({ getFieldValue }) => {
                const stageAfter = getFieldValue('stage_after');
                const signedStages = ['SIGNED', 'SETTLED', 'INCUBATING'];
                return signedStages.includes(stageAfter) ? (
                  <Col span={24}>
                    <Form.Item name="service_provider" label="合作服务商">
                      <Input placeholder="请输入合作服务商..." />
                    </Form.Item>
                  </Col>
                ) : null;
              }}
            </Form.Item>
            <Col span={24}>
              <Form.Item name="next_step" label="下一步计划">
                <Input placeholder="请输入下一步计划..." />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}

export default FollowUpRecords;
