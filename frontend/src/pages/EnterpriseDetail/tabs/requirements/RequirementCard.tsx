// @ts-nocheck
import { Button, Typography } from 'antd';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { SOURCE_STYLES } from './constants';
import type { RequirementConfigData } from '@/services/api';
import type { RequirementDisplayMode } from './types';

const { Text } = Typography;

type ReqItem = RequirementConfigData['requirements'][number];

interface RequirementCardProps {
  req: ReqItem;
  colors: { bg: string; text: string; border: string };
  sources: string[];
  displayMode?: RequirementDisplayMode;
  isRemoved?: boolean;
  onRemove: (id: string) => void;
  onAdd?: (id: string) => void;
}

export default function RequirementCard({ req, colors, sources, displayMode = 'default', isRemoved, onRemove, onAdd }: RequirementCardProps) {
  const isBrowseMode = displayMode !== 'default';

  return (
    <div
      style={{
        padding: '12px 14px',
        background: isRemoved ? '#fff5f5' : '#fafbfc',
        borderRadius: 8,
        border: `1px solid ${isRemoved ? '#ffd6d6' : '#f0f0f0'}`,
        transition: 'all 0.2s ease',
        position: 'relative',
        opacity: isRemoved ? 0.6 : 1,
      }}
      onMouseEnter={(e) => { if (!isRemoved) { e.currentTarget.style.background = colors.bg; e.currentTarget.style.borderColor = colors.border; } }}
      onMouseLeave={(e) => { e.currentTarget.style.background = isRemoved ? '#fff5f5' : '#fafbfc'; e.currentTarget.style.borderColor = isRemoved ? '#ffd6d6' : '#f0f0f0'; }}
    >
      <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 2 }}>
        {isBrowseMode && isRemoved && onAdd ? (
          <Button type="text" size="small" icon={<PlusOutlined />}
            style={{ color: '#52c41a', padding: '2px 6px', height: 'auto', minWidth: 'auto' }}
            onClick={(e) => { e.stopPropagation(); onAdd(req.id); }}
          />
        ) : (
          <Button type="text" size="small" icon={<CloseOutlined />}
            style={{ color: '#999', padding: '2px 6px', height: 'auto', minWidth: 'auto' }}
            onClick={(e) => { e.stopPropagation(); onRemove(req.id); }}
          />
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, paddingRight: 20 }}>
        <span style={{ padding: '2px 6px', background: colors.bg, color: colors.text, borderRadius: 4, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
          {req.id}
        </span>
        <div style={{ flex: 1 }}>
          <Text strong style={{ fontSize: 13, display: 'block' }}>{req.name}</Text>
          <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.4, display: 'block' }}>{req.description}</Text>
          {req.detailDescription && (
            <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.5, display: 'block', marginTop: 4, color: '#888', whiteSpace: 'pre-wrap' }}>
              {req.detailDescription}
            </Text>
          )}
          <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {sources.map((source, idx) => {
              const s = SOURCE_STYLES[source] || SOURCE_STYLES._default;
              return (
                <span key={idx} style={{ padding: '1px 6px', background: s.bg, color: s.color, borderRadius: 3, fontSize: 10, fontWeight: 500 }}>
                  {source}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
