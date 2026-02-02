import React from 'react';
import { Button } from 'antd';
import {
  InboxOutlined,
  FileSearchOutlined,
  TeamOutlined,
  HistoryOutlined,
} from '@ant-design/icons';

interface EmptyStateProps {
  type?: 'default' | 'search' | 'enterprise' | 'record';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

const icons = {
  default: InboxOutlined,
  search: FileSearchOutlined,
  enterprise: TeamOutlined,
  record: HistoryOutlined,
};

const defaultContent = {
  default: { title: '暂无数据', description: '当前没有可显示的内容' },
  search: { title: '未找到结果', description: '尝试调整搜索条件或筛选项' },
  enterprise: { title: '暂无企业', description: '点击下方按钮添加第一个企业' },
  record: { title: '暂无跟进记录', description: '开始记录您的第一次跟进' },
};

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'default',
  title,
  description,
  actionText,
  onAction,
}) => {
  const Icon = icons[type];
  const content = defaultContent[type];

  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon />
      </div>
      <div className="empty-state-title">{title || content.title}</div>
      <div className="empty-state-description">{description || content.description}</div>
      {actionText && onAction && (
        <Button type="primary" onClick={onAction} style={{ marginTop: 16 }}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
