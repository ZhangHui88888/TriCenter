// @ts-nocheck
import { Button, Space } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ArrowRightOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { FUNNEL_STAGES, stageOrder } from '../constants';

function getStageInfo(code: string) {
  return FUNNEL_STAGES.find(s => s.code === code) || { name: code, color: '#94a3b8' };
}

export function buildRecordColumns(
  onEdit: (record: any) => void,
  onDelete: (record: any) => void,
) {
  return [
    { title: '日期', dataIndex: 'follow_up_date', key: 'date', width: 120 },
    { title: '类型', dataIndex: 'follow_up_type', key: 'type', width: 80 },
    { title: '跟进内容', dataIndex: 'content', key: 'content' },
    { title: '跟进人', dataIndex: 'follow_up_person', key: 'person', width: 80 },
    {
      title: '阶段变化',
      key: 'stage_change',
      width: 320,
      render: (_: unknown, record: { stage_before?: string; stage_after?: string }) => {
        if (record.stage_before && record.stage_after && record.stage_before !== record.stage_after) {
          const stageBefore = getStageInfo(record.stage_before);
          const stageAfter = getStageInfo(record.stage_after);
          const beforeOrder = stageOrder[stageBefore.name] || 0;
          const afterOrder = stageOrder[stageAfter.name] || 0;
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
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: any) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => onEdit(record)}>编辑</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => onDelete(record)}>删除</Button>
        </Space>
      ),
    },
  ];
}
