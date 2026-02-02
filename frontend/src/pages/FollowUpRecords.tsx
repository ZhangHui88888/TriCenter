import { useState } from 'react';
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
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  TeamOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { followUpRecords, funnelStages, enterprises } from '@/data/mockData';
import { FOLLOW_UP_TYPES } from '@/utils/constants';
import type { FollowUpRecord } from '@/types';

const { Title, Text } = Typography;
const { TextArea } = Input;

function FollowUpRecords() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const getStageInfo = (code: string) => {
    return funnelStages.find(s => s.code === code) || { name: code, color: '#94a3b8' };
  };

  const filteredRecords = followUpRecords.filter(r => {
    const matchesSearch = r.enterprise_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || r.follow_up_type === typeFilter;
    return matchesSearch && matchesType;
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
      width: 200,
      render: (_, record) => {
        if (record.stage_before && record.stage_after && record.stage_before !== record.stage_after) {
          return (
            <Space>
              <Tag color={getStageInfo(record.stage_before).color}>{getStageInfo(record.stage_before).name}</Tag>
              →
              <Tag color={getStageInfo(record.stage_after).color}>{getStageInfo(record.stage_after).name}</Tag>
            </Space>
          );
        }
        return <span style={{ color: '#999' }}>-</span>;
      },
    },
  ];

  const handleAddRecord = () => {
    form.validateFields().then(() => {
      message.success('跟进记录添加成功');
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  const stats = [
    { title: '本月跟进', value: 28, icon: <FileTextOutlined style={{ color: '#1890ff' }} /> },
    { title: '本周跟进', value: 8, icon: <PhoneOutlined style={{ color: '#52c41a' }} /> },
    { title: '今日跟进', value: 2, icon: <TeamOutlined style={{ color: '#722ed1' }} /> },
    { title: '待跟进企业', value: 12, icon: <VideoCameraOutlined style={{ color: '#faad14' }} /> },
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
        {stats.map((stat, index) => (
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
        <Table
          columns={columns}
          dataSource={filteredRecords}
          rowKey="id"
          pagination={{
            total: filteredRecords.length,
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条记录`,
            showSizeChanger: true,
          }}
        />
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
                  options={funnelStages.map(s => ({ label: s.name, value: s.code }))}
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
