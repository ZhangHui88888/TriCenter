// @ts-nocheck
import { Card, Table, Button, Typography } from 'antd';
import { PlusOutlined, FileTextOutlined } from '@ant-design/icons';
import {
  EnterpriseDetailSectionHint,
  enterpriseDetailCardTitle,
} from '@/components/enterpriseDetail/EnterpriseDetailSectionHint';

const { Text } = Typography;

interface FollowUpTabProps {
  enterpriseRecords: any[];
  recordColumns: any[];
  onAddFollowUp: () => void;
}

export default function FollowUpTab({ enterpriseRecords, recordColumns, onAddFollowUp }: FollowUpTabProps) {
  return (
    <div style={{ padding: 16 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        padding: '0 4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Text strong style={{ fontSize: 15 }}>共 <span style={{ color: '#667eea', fontSize: 18 }}>{enterpriseRecords.length}</span> 条跟进记录</Text>
          <EnterpriseDetailSectionHint sectionKey="followup-header" />
        </div>
        <Button
          type="primary"
          size="small"
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
      {enterpriseRecords.length > 0 ? (
        <Card
          title={enterpriseDetailCardTitle('跟进记录列表', 'followup-list')}
          style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          headStyle={{ borderBottom: '1px solid #f0f0f0' }}
        >
          <Table
            columns={recordColumns}
            dataSource={enterpriseRecords}
            rowKey="id"
            size="small"
            pagination={false}
          />
        </Card>
      ) : (
        <Card
          title={enterpriseDetailCardTitle('跟进记录列表', 'followup-list')}
          style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          headStyle={{ borderBottom: '1px solid #f0f0f0' }}
        >
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
