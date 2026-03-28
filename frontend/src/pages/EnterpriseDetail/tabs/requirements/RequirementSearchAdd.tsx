// @ts-nocheck
import { useState, useMemo } from 'react';
import { Input, Typography, Button, Empty } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { PHASE_COLORS } from './constants';
import type { RequirementConfigData } from '@/services/api';

const { Text } = Typography;

type ReqItem = RequirementConfigData['requirements'][number];

interface RequirementSearchAddProps {
  allRequirements: ReqItem[];
  existingIds: Set<string>;
  onAdd: (req: ReqItem) => void;
}

export default function RequirementSearchAdd({ allRequirements, existingIds, onAdd }: RequirementSearchAddProps) {
  const [keyword, setKeyword] = useState('');

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return [];
    return allRequirements.filter(r => {
      const haystack = `${r.name} ${r.description || ''} ${r.detailDescription || ''}`.toLowerCase();
      return haystack.includes(kw);
    });
  }, [keyword, allRequirements]);

  return (
    <div style={{ marginBottom: 16 }}>
      <Input
        prefix={<SearchOutlined style={{ color: '#bbb' }} />}
        placeholder="搜索需求名称、说明或详细解释，选择后为当前企业添加"
        allowClear
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={{ marginBottom: keyword.trim() ? 8 : 0 }}
      />
      {keyword.trim() && (
        <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid #f0f0f0', borderRadius: 8, background: '#fff' }}>
          {filtered.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="未找到匹配需求" style={{ padding: 24 }} />
          ) : (
            filtered.map(req => {
              const already = existingIds.has(req.id);
              const colors = PHASE_COLORS[req.phase] || PHASE_COLORS['战略规划与资源准备'];
              return (
                <div key={req.id} style={{
                  padding: '10px 14px', borderBottom: '1px solid #f5f5f5',
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8,
                  opacity: already ? 0.5 : 1,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ padding: '1px 6px', background: colors.bg, color: colors.text, borderRadius: 4, fontSize: 10, fontWeight: 600, flexShrink: 0 }}>
                        {req.id}
                      </span>
                      <Text strong style={{ fontSize: 13 }}>{req.name}</Text>
                    </div>
                    {req.description && (
                      <Text type="secondary" style={{ fontSize: 11, display: 'block', lineHeight: 1.4 }}>{req.description}</Text>
                    )}
                    {req.detailDescription && (
                      <Text type="secondary" style={{ fontSize: 11, display: 'block', lineHeight: 1.4, marginTop: 2, color: '#999' }}>
                        {req.detailDescription}
                      </Text>
                    )}
                  </div>
                  <Button
                    type={already ? 'default' : 'primary'}
                    size="small"
                    icon={<PlusOutlined />}
                    disabled={already}
                    style={{ borderRadius: 6, flexShrink: 0, marginTop: 2 }}
                    onClick={() => onAdd(req)}
                  >
                    {already ? '已添加' : '添加'}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
