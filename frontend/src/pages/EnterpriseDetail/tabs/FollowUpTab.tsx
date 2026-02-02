import { Card, Table, Button, Space, Tag, Typography } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { FollowUpTabProps } from '../types';

const { Text } = Typography;

export default function FollowUpTab({
  records,
  onAddFollowUp,
  onEditFollowUp,
  onDeleteFollowUp,
  getStageInfo,
}: FollowUpTabProps) {
  const columns: ColumnsType<any> = [
    { title: '日期', dataIndex: 'follow_up_date', key: 'date', width: 120 },
    { title: '类型', dataIndex: 'follow_up_type', key: 'type', width: 80 },
    { title: '跟进内容', dataIndex: 'content', key: 'content' },
    { title: '跟进人', dataIndex: 'follow_up_person', key: 'person', width: 80 },
    {
      title: '阶段变化',
      key: 'stage_change',
      width: 180,
      render: (_: unknown, record: { stage_before?: string; stage_after?: string }) => {
        if (record.stage_before && record.stage_after && record.stage_before !== record.stage_after) {
          return (
            <span>
              <Tag color={getStageInfo(record.stage_before).color}>{getStageInfo(record.stage_before).name}</Tag>
              →
              <Tag color={getStageInfo(record.stage_after).color}>{getStageInfo(record.stage_after).name}</Tag>
            </span>
          );
        }
        return '-';
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: any) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => onEditFollowUp(record)}>编辑</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => onDeleteFollowUp(record)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={onAddFollowUp}
          style={{
            borderRadius: 8,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            fontWeight: 500
          }}
        >
          添加跟进
        </Button>
      </div>
      
      {records.length > 0 ? (
        <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <Table
            columns={columns}
            dataSource={records}
            rowKey="id"
            pagination={{
              pageSize: 5,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        </Card>
      ) : (
        <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ 
              width: 64, 
              height: 64, 
              margin: '0 auto 16px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.05) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileTextOutlined style={{ fontSize: 28, color: '#667eea' }} />
            </div>
            <Text type="secondary">暂无跟进记录</Text>
          </div>
        </Card>
      )}
    </div>
  );
}
