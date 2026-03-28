// @ts-nocheck
import { useState } from 'react';
import { Card, Row, Col, Select, Collapse, Button, Space, Spin, Modal, Form, Input, Popconfirm, Typography, Switch } from 'antd';
import { PlusOutlined, CloseOutlined, DeleteOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import {
  EnterpriseDetailSectionHint,
  enterpriseDetailCardTitle,
} from '@/components/enterpriseDetail/EnterpriseDetailSectionHint';
import { dimensions, groupRequirementsByPhase, type RequirementItem } from '@/data/requirementsData';
import type { RequirementConfigData } from '@/services/api';
import { PHASES, PHASE_COLORS, DIMENSION_LABELS } from './constants';
import RequirementCard from './RequirementCard';
import RequirementSearchAdd from './RequirementSearchAdd';

const { Text } = Typography;

interface RequirementsTabProps {
  reqConfig: RequirementConfigData | null;
  dimensionSelections: Record<string, string[]>;
  setDimensionSelections: (v: Record<string, string[]>) => void;
  removedRequirements: string[];
  setRemovedRequirements: (v: string[]) => void;
  customRequirements: { id: string; name: string; description: string; phase: string; category: string }[];
  setCustomRequirements: (v: any[]) => void;
  isCustomRequirementModalOpen: boolean;
  setIsCustomRequirementModalOpen: (v: boolean) => void;
  isRestoreRequirementModalOpen: boolean;
  setIsRestoreRequirementModalOpen: (v: boolean) => void;
  restoreCategory: { phase: string; category: string } | null;
  setRestoreCategory: (v: any) => void;
  customRequirementForm: any;
  saveEnterpriseFields: (fields: Record<string, any>, msg: string) => Promise<void>;
}

export default function RequirementsTab({
  reqConfig,
  dimensionSelections,
  setDimensionSelections,
  removedRequirements,
  setRemovedRequirements,
  customRequirements,
  setCustomRequirements,
  isCustomRequirementModalOpen,
  setIsCustomRequirementModalOpen,
  isRestoreRequirementModalOpen,
  setIsRestoreRequirementModalOpen,
  restoreCategory,
  setRestoreCategory,
  customRequirementForm,
  saveEnterpriseFields,
}: RequirementsTabProps) {
  const [showAll, setShowAll] = useState(false);

  const handleRemoveRequirement = (reqId: string) => {
    const newRemoved = [...removedRequirements, reqId];
    setRemovedRequirements(newRemoved);
    saveEnterpriseFields({ removedRequirements: newRemoved }, '已移除该需求');
  };

  const handleRemoveCustomRequirement = (reqId: string) => {
    const newCustom = customRequirements.filter(r => r.id !== reqId);
    setCustomRequirements(newCustom);
    saveEnterpriseFields({ customRequirements: newCustom }, '已删除自定义需求');
  };

  const handleAddCustomRequirement = () => {
    customRequirementForm.validateFields().then((values: any) => {
      const newReq = {
        id: `CUSTOM-${Date.now()}`,
        name: values.name,
        description: values.description,
        phase: values.phase,
        category: '自定义需求'
      };
      const newCustom = [...customRequirements, newReq];
      setCustomRequirements(newCustom);
      setIsCustomRequirementModalOpen(false);
      customRequirementForm.resetFields();
      saveEnterpriseFields({ customRequirements: newCustom }, '已添加自定义需求');
    });
  };

  const handleRestoreRequirement = (reqId: string) => {
    const newRemoved = removedRequirements.filter(id => id !== reqId);
    setRemovedRequirements(newRemoved);
    saveEnterpriseFields({ removedRequirements: newRemoved }, '已恢复该需求');
  };

  const handleSearchAdd = (req: any) => {
    const newReq = {
      id: req.id,
      name: req.name,
      description: req.description || '',
      phase: req.phase || '',
      category: req.category || '',
      sourceRequirementId: req.id,
    };
    const newCustom = [...customRequirements, newReq];
    setCustomRequirements(newCustom);
    saveEnterpriseFields({ customRequirements: newCustom }, `已添加需求「${req.name}」`);
  };

  return (
    <div style={{ padding: 16 }}>
      {/* 维度选择区域 */}
      <Card
        title={enterpriseDetailCardTitle('企业画像维度选择', 'req-dimensions')}
        size="small"
        style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        headStyle={{ borderBottom: '1px solid #f0f0f0' }}
      >
        <Row gutter={[16, 16]}>
          {dimensions.map(dim => (
            <Col span={dim.key === 'ecommerceExp' ? 24 : 12} key={dim.key}>
              <div style={{ marginBottom: 4 }}>
                <Text strong style={{ fontSize: 13 }}>{dim.name}</Text>
                <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                  {dim.multiple ? '（可多选）' : '（单选）'}
                </Text>
              </div>
              <Select
                mode={dim.multiple ? 'multiple' : undefined}
                style={{ width: '100%' }}
                placeholder={`请选择${dim.name}`}
                value={dimensionSelections[dim.key] || (dim.multiple ? [] : undefined)}
                onChange={(value) => {
                  const newSelections = {
                    ...dimensionSelections,
                    [dim.key]: Array.isArray(value) ? value : (value ? [value] : [])
                  };
                  setDimensionSelections(newSelections);
                  saveEnterpriseFields({ dimensionSelections: newSelections }, '维度选择已保存');
                }}
                allowClear
                options={dim.options.map(opt => ({
                  label: (
                    <div>
                      <span>{opt.label}</span>
                      {opt.description && (
                        <span style={{ fontSize: 11, color: '#999', marginLeft: 8 }}>{opt.description}</span>
                      )}
                    </div>
                  ),
                  value: opt.value,
                }))}
              />
            </Col>
          ))}
        </Row>
      </Card>

      {/* 需求清单展示区域 */}
      {renderRequirementList()}
    </div>
  );

  function renderRequirementList() {
    if (!reqConfig) return <Spin style={{ padding: 32, display: 'block', textAlign: 'center' }} />;
    const { requirements: dbRequirements, universalRequiredIds, universalEnhancedIds, dimensionRequirementMapping } = reqConfig;
    const recommendedIds = new Set(dbRequirements.filter(r => r.isRecommended === 1).map(r => r.id));
    const requirementIds = new Set<string>(universalRequiredIds);
    Object.entries(dimensionSelections).forEach(([dimKey, selectedValues]) => {
      if (!selectedValues || selectedValues.length === 0) return;
      const dimMapping = dimensionRequirementMapping[dimKey];
      if (!dimMapping) return;
      selectedValues.forEach(v => { const ids = dimMapping[v]; if (ids) ids.forEach(id => requirementIds.add(id)); });
    });
    const universalSet = new Set(universalRequiredIds);
    const enhancedSet = new Set(universalEnhancedIds);
    const result = {
      universal: dbRequirements.filter(r => universalSet.has(r.id)),
      enhanced: dbRequirements.filter(r => enhancedSet.has(r.id)),
      dimensional: dbRequirements.filter(r => requirementIds.has(r.id) && !universalSet.has(r.id) && !enhancedSet.has(r.id)),
      all: dbRequirements.filter(r => requirementIds.has(r.id)),
    };
    const isNotRemoved = (req: any) => !removedRequirements.includes(req.id);
    const filteredUniversal = result.universal.filter(isNotRemoved);
    const filteredEnhanced = result.enhanced.filter(isNotRemoved);
    const filteredAll = result.all.filter(isNotRemoved);
    const hasSelection = Object.values(dimensionSelections).some(arr => arr && arr.length > 0);
    const allRequirements = [...filteredUniversal, ...filteredEnhanced, ...filteredAll];
    const uniqueRequirementsAll = allRequirements.filter((req, index, self) =>
      self.findIndex(r => r.id === req.id) === index
    );
    const uniqueRequirements = showAll
      ? uniqueRequirementsAll
      : uniqueRequirementsAll.filter(r => recommendedIds.has(r.id));
    const groupedByPhase = groupRequirementsByPhase(uniqueRequirements);

    const getRequirementSources = (reqId: string): string[] => {
      const sources: string[] = [];
      if (result.universal.some(r => r.id === reqId)) sources.push('通用必选');
      if (result.enhanced.some(r => r.id === reqId)) sources.push('增强项');
      Object.entries(dimensionSelections).forEach(([dimKey, selectedValues]) => {
        if (!selectedValues || selectedValues.length === 0) return;
        const dimMapping = dimensionRequirementMapping[dimKey];
        if (!dimMapping) return;
        selectedValues.forEach(value => {
          if (dimMapping[value] && dimMapping[value].includes(reqId)) {
            const label = DIMENSION_LABELS[dimKey]?.[value] || value;
            if (!sources.includes(label)) sources.push(label);
          }
        });
      });
      return sources;
    };

    const getRemovableRequirementsForCategory = (phase: string, category: string) => {
      return result.all.filter(req =>
        req.phase === phase && req.category === category && removedRequirements.includes(req.id)
      );
    };

    const allMatchedByPhase: Record<string, any[]> = {};
    [...new Set([...result.universal, ...result.enhanced, ...result.all])].forEach(req => {
      if (!allMatchedByPhase[req.phase]) allMatchedByPhase[req.phase] = [];
      if (!allMatchedByPhase[req.phase].some(r => r.id === req.id)) allMatchedByPhase[req.phase].push(req);
    });

    const existingCustomIds = new Set(customRequirements.map(r => r.id));
    const existingMatchedIds = new Set(uniqueRequirementsAll.map(r => r.id));
    const allExistingIds = new Set([...existingCustomIds, ...existingMatchedIds]);

    const phaseItems = PHASES.map(phase => {
      const phaseRequirements = groupedByPhase[phase] || [];
      const allPhaseReqs = allMatchedByPhase[phase] || [];
      const removedInPhase = allPhaseReqs.filter(r => removedRequirements.includes(r.id));
      if (allPhaseReqs.length === 0) return null;
      const colors = PHASE_COLORS[phase] || PHASE_COLORS['战略规划与资源准备'];
      const categories: Record<string, RequirementItem[]> = {};
      phaseRequirements.forEach((req: RequirementItem) => {
        if (!categories[req.category]) categories[req.category] = [];
        categories[req.category].push(req);
      });

      return {
        key: phase,
        label: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ padding: '4px 12px', background: colors.bg, color: colors.text, borderRadius: 6, fontWeight: 600, fontSize: 13, border: `1px solid ${colors.border}` }}>
              {phase}
            </span>
            <Text type="secondary" style={{ fontSize: 13 }}>共 {phaseRequirements.length} 项需求</Text>
            {removedInPhase.length > 0 && (
              <Popconfirm
                title={`恢复「${phase}」下全部 ${removedInPhase.length} 项已移除需求？`}
                onConfirm={(e) => {
                  e?.stopPropagation();
                  const idsToRestore = new Set(removedInPhase.map(r => r.id));
                  const newRemoved = removedRequirements.filter(id => !idsToRestore.has(id));
                  setRemovedRequirements(newRemoved);
                  saveEnterpriseFields({ removedRequirements: newRemoved }, `已恢复「${phase}」的 ${removedInPhase.length} 项需求`);
                }}
                onCancel={(e) => e?.stopPropagation()}
                okText="确定恢复" cancelText="取消"
              >
                <Button size="small" type="link" style={{ color: colors.text, fontSize: 12 }} onClick={(e) => e.stopPropagation()}>
                  恢复已移除 ({removedInPhase.length})
                </Button>
              </Popconfirm>
            )}
          </div>
        ),
        children: (
          <Collapse
            activeKey={Object.keys(categories)}
            ghost
            expandIcon={({ isActive }) => isActive ? <DownOutlined style={{ color: colors.text }} /> : <RightOutlined style={{ color: colors.text }} />}
            style={{ background: 'transparent' }}
            items={Object.entries(categories).map(([category, items]) => ({
              key: category,
              label: (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <Text strong style={{ fontSize: 13, color: '#555', paddingLeft: 8, borderLeft: `3px solid ${colors.text}` }}>
                    {category}
                    <span style={{ marginLeft: 8, fontSize: 12, color: '#999', fontWeight: 400 }}>({items.length}项)</span>
                  </Text>
                  {result.all.filter(req => req.phase === phase && req.category === category && removedRequirements.includes(req.id)).length > 0 && (
                    <Button type="link" size="small" icon={<PlusOutlined />}
                      style={{ color: colors.text, padding: '0 4px', height: 'auto' }}
                      onClick={(e) => { e.stopPropagation(); setRestoreCategory({ phase, category }); setIsRestoreRequirementModalOpen(true); }}>
                      恢复需求
                    </Button>
                  )}
                </div>
              ),
              children: (
                <Row gutter={[12, 12]} style={{ marginTop: 8 }}>
                  {items.map((req: RequirementItem) => (
                    <Col span={12} key={req.id}>
                      <RequirementCard
                        req={req}
                        colors={colors}
                        sources={getRequirementSources(req.id)}
                        onRemove={handleRemoveRequirement}
                      />
                    </Col>
                  ))}
                </Row>
              )
            }))}
          />
        )
      };
    }).filter(Boolean);

    return (
      <>
        <Card size="small"
          title={enterpriseDetailCardTitle('需求匹配概览', 'req-stats')}
          style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          headStyle={{ borderBottom: '1px solid #f0f0f0' }}
        >
          <Row gutter={16}>
            {[
              { label: '匹配需求总数', value: uniqueRequirements.length + customRequirements.length, color: '#667eea', bg: 'rgba(102,126,234,0.05)', border: 'rgba(102,126,234,0.2)' },
              { label: '通用必选需求', value: filteredUniversal.length, color: '#43e97b', bg: 'rgba(67,233,123,0.05)', border: 'rgba(67,233,123,0.2)' },
              { label: '增强项需求', value: filteredEnhanced.length, color: '#f97316', bg: 'rgba(249,115,22,0.05)', border: 'rgba(249,115,22,0.2)' },
              { label: '差异化需求', value: hasSelection ? result.dimensional.filter(isNotRemoved).length : 0, color: '#8b5cf6', bg: 'rgba(139,92,246,0.05)', border: 'rgba(139,92,246,0.2)' },
            ].map((stat, idx) => (
              <Col span={6} key={idx}>
                <div style={{ padding: '16px', background: stat.bg, border: `1px solid ${stat.border}`, borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{stat.label}</Text>
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Text strong style={{ fontSize: 14 }}>按阶段匹配的需求清单</Text>
            <EnterpriseDetailSectionHint sectionKey="req-phases" />
          </div>
          <Space size="small" align="center">
            <Text type="secondary" style={{ fontSize: 12 }}>
              {showAll ? `全部 ${uniqueRequirementsAll.length} 项` : `推荐 ${uniqueRequirements.length} / ${uniqueRequirementsAll.length} 项`}
            </Text>
            <Switch
              checked={showAll}
              onChange={setShowAll}
            />
          </Space>
        </div>
        <Collapse
          activeKey={PHASES}
          style={{ background: 'transparent', marginBottom: 16 }}
          expandIcon={({ isActive }) => isActive ? <DownOutlined /> : <RightOutlined />}
          items={phaseItems as any}
        />

        {/* 搜索添加需求 + 自定义需求区域 */}
        <Card size="small"
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ padding: '4px 12px', background: 'rgba(250,140,22,0.08)', color: '#fa8c16', borderRadius: 6, fontWeight: 600, fontSize: 13, border: '1px solid rgba(250,140,22,0.2)' }}>
                自定义需求
              </span>
              <Text type="secondary" style={{ fontSize: 13 }}>针对该企业的个性化需求</Text>
              <EnterpriseDetailSectionHint sectionKey="req-custom" />
            </div>
          }
          extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setIsCustomRequirementModalOpen(true)} style={{ borderRadius: 6 }}>添加需求</Button>}
          style={{ marginTop: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          headStyle={{ borderBottom: '1px solid #f0f0f0' }}
        >
          <RequirementSearchAdd
            allRequirements={dbRequirements}
            existingIds={allExistingIds}
            onAdd={handleSearchAdd}
          />
          {customRequirements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Text type="secondary">暂无自定义需求，点击上方按钮添加</Text>
            </div>
          ) : (
            <Row gutter={[12, 12]}>
              {customRequirements.map(req => (
                <Col span={12} key={req.id}>
                  <div style={{ padding: '12px 14px', background: 'rgba(250,140,22,0.04)', borderRadius: 8, border: '1px solid rgba(250,140,22,0.15)', position: 'relative' }}>
                    <Button type="text" size="small" danger icon={<DeleteOutlined />}
                      style={{ position: 'absolute', top: 4, right: 4, padding: '2px 6px', height: 'auto', minWidth: 'auto' }}
                      onClick={() => handleRemoveCustomRequirement(req.id)}
                    />
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, paddingRight: 20 }}>
                      <span style={{ padding: '2px 6px', background: 'rgba(250,140,22,0.1)', color: '#fa8c16', borderRadius: 4, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                        {req.phase}
                      </span>
                      <div>
                        <Text strong style={{ fontSize: 13, display: 'block' }}>{req.name}</Text>
                        <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.4 }}>{req.description}</Text>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </Card>

        {/* 恢复需求弹窗 */}
        <Modal
          maskClosable={false}
          title="恢复已删除的需求"
          open={isRestoreRequirementModalOpen}
          onCancel={() => { setIsRestoreRequirementModalOpen(false); setRestoreCategory(null); }}
          footer={null}
          width={500}
        >
          {restoreCategory && (
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                选择要恢复到「{restoreCategory.phase} - {restoreCategory.category}」的需求：
              </Text>
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {getRemovableRequirementsForCategory(restoreCategory.phase, restoreCategory.category).map(req => (
                  <div key={req.id} style={{ padding: '12px 14px', background: '#fafbfc', borderRadius: 8, border: '1px solid #f0f0f0', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flex: 1 }}>
                      <span style={{ padding: '2px 6px', background: 'rgba(102,126,234,0.1)', color: '#667eea', borderRadius: 4, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{req.id}</span>
                      <div>
                        <Text strong style={{ fontSize: 13, display: 'block' }}>{req.name}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>{req.description}</Text>
                      </div>
                    </div>
                    <Button type="primary" size="small" icon={<PlusOutlined />} style={{ borderRadius: 6, marginLeft: 8 }}
                      onClick={() => {
                        handleRestoreRequirement(req.id);
                        if (getRemovableRequirementsForCategory(restoreCategory.phase, restoreCategory.category).length <= 1) {
                          setIsRestoreRequirementModalOpen(false);
                          setRestoreCategory(null);
                        }
                      }}>
                      恢复
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>

        {/* 自定义需求弹窗 */}
        <Modal
          maskClosable={false}
          title="添加自定义需求"
          open={isCustomRequirementModalOpen}
          onCancel={() => { setIsCustomRequirementModalOpen(false); customRequirementForm.resetFields(); }}
          onOk={handleAddCustomRequirement}
          okText="添加" cancelText="取消"
        >
          <Form form={customRequirementForm} layout="vertical">
            <Form.Item name="name" label="需求名称" rules={[{ required: true, message: '请输入需求名称' }]}>
              <Input placeholder="请输入需求名称" />
            </Form.Item>
            <Form.Item name="description" label="需求描述" rules={[{ required: true, message: '请输入需求描述' }]}>
              <Input.TextArea rows={3} placeholder="请输入需求描述" />
            </Form.Item>
            <Form.Item name="phase" label="所属阶段" rules={[{ required: true, message: '请选择所属阶段' }]}>
              <Select placeholder="请选择所属阶段">
                {PHASES.map(p => <Select.Option key={p} value={p}>{p}</Select.Option>)}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  }
}
