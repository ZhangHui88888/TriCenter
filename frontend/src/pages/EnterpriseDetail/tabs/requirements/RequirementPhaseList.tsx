import { Button, Collapse, Empty, Row, Col, Select, Space, Typography } from 'antd';
import { CloseOutlined, DownOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons';
import { EnterpriseDetailSectionHint } from '@/components/enterpriseDetail/EnterpriseDetailSectionHint';
import RequirementCard from './RequirementCard';
import RequirementSearchAdd from './RequirementSearchAdd';
import { getPhaseColors } from './utils';
import type { RequirementDisplayMode, RequirementPhaseGroup } from './types';

const DISPLAY_MODE_OPTIONS = [
  { value: 'default', label: '按默认' },
  { value: 'template', label: '按推荐模板' },
  { value: 'dimension', label: '按维度' },
  { value: 'all', label: '全部' },
];
import type { RequirementConfigData } from '@/services/api';

const { Text } = Typography;

type ReqItem = RequirementConfigData['requirements'][number];

interface RequirementPhaseListProps {
  phaseGroups: RequirementPhaseGroup[];
  displayMode: RequirementDisplayMode;
  visibleCount: number;
  totalCount: number;
  allRequirements?: ReqItem[];
  existingIds?: Set<string>;
  onDisplayModeChange: (mode: RequirementDisplayMode) => void;
  defaultVisibleIds?: Set<string>;
  onRemoveRequirement: (reqId: string) => void;
  onRemoveRequirements: (reqIds: string[], label: string) => void;
  onAddRequirement?: (reqId: string) => void;
  onAddRequirements?: (reqIds: string[], label: string) => void;
  onSearchAdd?: (req: ReqItem) => void;
}

export default function RequirementPhaseList({
  phaseGroups,
  displayMode,
  visibleCount,
  totalCount,
  allRequirements,
  existingIds,
  defaultVisibleIds,
  onDisplayModeChange,
  onRemoveRequirement,
  onRemoveRequirements,
  onAddRequirement,
  onAddRequirements,
  onSearchAdd,
}: RequirementPhaseListProps) {
  if (phaseGroups.length === 0) {
    return (
      <div className="requirement-phase-list requirement-phase-list--empty">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Text strong style={{ fontSize: 14 }}>按阶段匹配的需求清单</Text>
            <EnterpriseDetailSectionHint sectionKey="req-phases" />
          </div>
          <Space size="small" align="center">
            <Text type="secondary" style={{ fontSize: 12 }}>
              0 / {totalCount} 项
            </Text>
            <Select
              value={displayMode}
              onChange={onDisplayModeChange}
              options={DISPLAY_MODE_OPTIONS}
              size="small"
              style={{ width: 120 }}
            />
          </Space>
        </div>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            displayMode === 'default'
              ? '该企业尚未确认任何需求，可切换到「按推荐模板」「按维度」或「全部」视图添加需求'
              : '当前筛选条件下暂无可显示需求'
          }
        />
      </div>
    );
  }

  return (
    <div className="requirement-phase-list">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Text strong style={{ fontSize: 14 }}>按阶段匹配的需求清单</Text>
          <EnterpriseDetailSectionHint sectionKey="req-phases" />
        </div>
        <Space size="small" align="center">
          <Text type="secondary" style={{ fontSize: 12 }}>
            {visibleCount} / {totalCount} 项
          </Text>
          <Select
            value={displayMode}
            onChange={onDisplayModeChange}
            options={DISPLAY_MODE_OPTIONS}
            size="small"
            style={{ width: 120 }}
          />
        </Space>
      </div>
      {allRequirements && existingIds && onSearchAdd && (
        <RequirementSearchAdd
          allRequirements={allRequirements}
          existingIds={existingIds}
          onAdd={onSearchAdd}
        />
      )}
      <Collapse
        defaultActiveKey={phaseGroups.map(group => group.key)}
        style={{ background: 'transparent', marginBottom: 16 }}
        expandIcon={({ isActive }) => (isActive ? <DownOutlined /> : <RightOutlined />)}
        items={phaseGroups.map((phaseGroup) => {
          const colors = getPhaseColors(phaseGroup.phase);
          return {
            key: phaseGroup.key,
            label: (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    padding: '4px 12px',
                    background: colors.bg,
                    color: colors.text,
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 13,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {phaseGroup.phase}
                </span>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  共 {phaseGroup.count} 项需求
                </Text>
                {displayMode !== 'default' && onAddRequirements && (
                  <Button
                    type="text"
                    size="small"
                    icon={<PlusOutlined />}
                    style={{ color: '#52c41a', padding: '2px 6px', height: 'auto', minWidth: 'auto' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const notInDefaultIds = phaseGroup.categories.flatMap(c => c.items.filter(item => !defaultVisibleIds?.has(item.id)).map(item => item.id));
                      if (notInDefaultIds.length > 0) {
                        onAddRequirements(notInDefaultIds, `「${phaseGroup.phase}」下 ${notInDefaultIds.length} 项需求`);
                      }
                    }}
                  />
                )}
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  style={{ color: '#999', padding: '2px 6px', height: 'auto', minWidth: 'auto' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const allIds = phaseGroup.categories.flatMap(c =>
                      c.items.filter(item => displayMode === 'default' || defaultVisibleIds?.has(item.id)).map(item => item.id)
                    );
                    if (allIds.length > 0) {
                      onRemoveRequirements(allIds, `「${phaseGroup.phase}」下 ${allIds.length} 项需求`);
                    }
                  }}
                />
              </div>
            ),
            children: (
              <Collapse
                defaultActiveKey={phaseGroup.categories.map(category => category.key)}
                ghost
                expandIcon={({ isActive }) => (
                  isActive ? <DownOutlined style={{ color: colors.text }} /> : <RightOutlined style={{ color: colors.text }} />
                )}
                style={{ background: 'transparent' }}
                items={phaseGroup.categories.map((categoryGroup) => ({
                  key: categoryGroup.key,
                  label: (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text strong style={{ fontSize: 13, color: '#555', paddingLeft: 8, borderLeft: `3px solid ${colors.text}` }}>
                          {categoryGroup.category}
                          <span style={{ marginLeft: 8, fontSize: 12, color: '#999', fontWeight: 400 }}>
                            ({categoryGroup.items.length}项)
                          </span>
                        </Text>
                        {displayMode !== 'default' && onAddRequirements && (
                          <Button
                            type="text"
                            size="small"
                            icon={<PlusOutlined />}
                            style={{ color: '#52c41a', padding: '2px 6px', height: 'auto', minWidth: 'auto' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              const notInDefaultIds = categoryGroup.items.filter(item => !defaultVisibleIds?.has(item.id)).map(item => item.id);
                              if (notInDefaultIds.length > 0) {
                                onAddRequirements(notInDefaultIds, `「${categoryGroup.category}」下 ${notInDefaultIds.length} 项需求`);
                              }
                            }}
                          />
                        )}
                        <Button
                          type="text"
                          size="small"
                          icon={<CloseOutlined />}
                          style={{ color: '#999', padding: '2px 6px', height: 'auto', minWidth: 'auto' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            const catIds = categoryGroup.items
                              .filter(item => displayMode === 'default' || defaultVisibleIds?.has(item.id))
                              .map(item => item.id);
                            if (catIds.length > 0) {
                              onRemoveRequirements(catIds, `「${categoryGroup.category}」下 ${catIds.length} 项需求`);
                            }
                          }}
                        />
                      </div>
                    </div>
                  ),
                  children: (
                    <Row gutter={[12, 12]} style={{ marginTop: 8 }}>
                      {categoryGroup.items.map((req) => (
                        <Col span={12} key={req.id}>
                          <RequirementCard
                            req={req}
                            colors={colors}
                            sources={req.sources}
                            displayMode={displayMode}
                            isRemoved={!defaultVisibleIds?.has(req.id)}
                            onRemove={onRemoveRequirement}
                            onAdd={onAddRequirement}
                          />
                        </Col>
                      ))}
                    </Row>
                  ),
                }))}
              />
            ),
          };
        })}
      />
    </div>
  );
}
