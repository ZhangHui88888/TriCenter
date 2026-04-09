// @ts-nocheck
import { useMemo, useState } from 'react';
import { Card, Button, Spin, Modal, Form, Input, Select, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  enterpriseDetailCardTitle,
} from '@/components/enterpriseDetail/EnterpriseDetailSectionHint';
import type { RequirementConfigData } from '@/services/api';
import { PHASES } from './constants';
import RequirementDimensionSelector from './RequirementDimensionSelector';
import RequirementCustomSection from './RequirementCustomSection';
import RequirementOverviewStats from './RequirementOverviewStats';
import RequirementPhaseList from './RequirementPhaseList';
import { buildRequirementViewData, getRequirementStatItems, toggleRequirementStatFilter } from './utils';
import type { EnterpriseCustomRequirement, RequirementDisplayMode, RequirementStatFilterKey } from './types';

const { Text } = Typography;

interface RequirementsTabProps {
  reqConfig: RequirementConfigData | null;
  dimensionSelections: Record<string, string[]>;
  setDimensionSelections: (v: Record<string, string[]>) => void;
  removedRequirements: string[];
  setRemovedRequirements: (v: string[]) => void;
  addedRequirements: string[];
  setAddedRequirements: (v: string[]) => void;
  customRequirements: { id: string; name: string; description: string; phase: string; category: string }[];
  setCustomRequirements: (v: any[]) => void;
  isCustomRequirementModalOpen: boolean;
  setIsCustomRequirementModalOpen: (v: boolean) => void;
  customRequirementForm: any;
  saveEnterpriseFields: (fields: Record<string, any>, msg: string) => Promise<void>;
}

export default function RequirementsTab({
  reqConfig,
  dimensionSelections,
  setDimensionSelections,
  removedRequirements,
  setRemovedRequirements,
  addedRequirements,
  setAddedRequirements,
  customRequirements,
  setCustomRequirements,
  isCustomRequirementModalOpen,
  setIsCustomRequirementModalOpen,
  customRequirementForm,
  saveEnterpriseFields,
}: RequirementsTabProps) {
  const [displayMode, setDisplayMode] = useState<RequirementDisplayMode>('default');
  const [activeFilters, setActiveFilters] = useState<RequirementStatFilterKey[]>(['all']);

  const handleRemoveRequirement = (reqId: string) => {
    const newRemoved = [...new Set([...removedRequirements, reqId])];
    const newAdded = addedRequirements.filter(id => id !== reqId);
    setRemovedRequirements(newRemoved);
    setAddedRequirements(newAdded);
    saveEnterpriseFields({ removedRequirements: newRemoved, addedRequirements: newAdded }, '已从默认清单移除该需求');
  };

  const handleRemoveRequirements = (reqIds: string[], label: string) => {
    const existingSet = new Set(removedRequirements);
    const newIds = reqIds.filter(id => !existingSet.has(id));
    const removeSet = new Set(reqIds);
    const newRemoved = [...removedRequirements, ...newIds];
    const newAdded = addedRequirements.filter(id => !removeSet.has(id));
    setRemovedRequirements(newRemoved);
    setAddedRequirements(newAdded);
    saveEnterpriseFields({ removedRequirements: newRemoved, addedRequirements: newAdded }, `已批量从默认清单移除${label}`);
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
        phase: '',
        category: '自定义需求'
      };
      const newCustom = [...customRequirements, newReq];
      setCustomRequirements(newCustom);
      setIsCustomRequirementModalOpen(false);
      customRequirementForm.resetFields();
      saveEnterpriseFields({ customRequirements: newCustom }, '已添加自定义需求');
    });
  };

  const handleSearchAdd = (req: any) => {
    const newRemoved = removedRequirements.filter(id => id !== req.id);
    const newAdded = [...new Set([...addedRequirements, req.id])];
    setRemovedRequirements(newRemoved);
    setAddedRequirements(newAdded);
    saveEnterpriseFields({ removedRequirements: newRemoved, addedRequirements: newAdded }, `已添加需求「${req.name}」`);
  };

  const handleAddRequirement = (reqId: string) => {
    const newRemoved = removedRequirements.filter(id => id !== reqId);
    const newAdded = [...new Set([...addedRequirements, reqId])];
    setRemovedRequirements(newRemoved);
    setAddedRequirements(newAdded);
    saveEnterpriseFields({ removedRequirements: newRemoved, addedRequirements: newAdded }, '已添加该需求到默认清单');
  };

  const handleAddRequirements = (reqIds: string[], label: string) => {
    const idsToRestore = new Set(reqIds);
    const newRemoved = removedRequirements.filter(id => !idsToRestore.has(id));
    const newAdded = [...new Set([...addedRequirements, ...reqIds])];
    setRemovedRequirements(newRemoved);
    setAddedRequirements(newAdded);
    saveEnterpriseFields({ removedRequirements: newRemoved, addedRequirements: newAdded }, `已批量添加${label}到默认清单`);
  };

  const viewData = useMemo(() => {
    if (!reqConfig) {
      return null;
    }

    return buildRequirementViewData({
      reqConfig,
      dimensionSelections,
      removedRequirements,
      addedRequirements,
      customRequirements: customRequirements as EnterpriseCustomRequirement[],
      displayMode,
      activeFilters,
    });
  }, [reqConfig, dimensionSelections, removedRequirements, addedRequirements, customRequirements, displayMode, activeFilters]);

  const statItems = useMemo(() => {
    if (!viewData) {
      return [];
    }
    return getRequirementStatItems(viewData, customRequirements.length, displayMode);
  }, [viewData, customRequirements.length, displayMode]);

  const existingIds = useMemo(() => {
    const removedSet = new Set(removedRequirements);
    const customIds = customRequirements.map(r => r.id).filter(id => !removedSet.has(id));
    const confirmedIds = addedRequirements.filter(id => !removedSet.has(id));
    return new Set([...customIds, ...confirmedIds]);
  }, [customRequirements, addedRequirements, removedRequirements]);

  const handleToggleStat = (key: RequirementStatFilterKey) => {
    setActiveFilters(current => toggleRequirementStatFilter(current, key));
  };

  return (
    <div style={{ padding: 16 }}>
      <RequirementDimensionSelector
        dimensionSelections={dimensionSelections}
        setDimensionSelections={setDimensionSelections}
        saveEnterpriseFields={saveEnterpriseFields}
      />

      {renderRequirementList()}
    </div>
  );

  function renderRequirementList() {
    if (!reqConfig || !viewData) return <Spin style={{ padding: 32, display: 'block', textAlign: 'center' }} />;

    return (
      <>
        <Card size="small"
          title={enterpriseDetailCardTitle('需求匹配概览', 'req-stats')}
          style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          headStyle={{ borderBottom: '1px solid #f0f0f0' }}
        >
          <RequirementOverviewStats
            items={statItems}
            activeFilters={activeFilters}
            onToggle={handleToggleStat}
          />
        </Card>

        <RequirementPhaseList
          key={`${activeFilters.join('-')}-${displayMode}`}
          phaseGroups={viewData.phaseGroups}
          displayMode={displayMode}
          visibleCount={viewData.visibleRequirements.length}
          totalCount={viewData.totalCount}
          allRequirements={reqConfig.requirements}
          existingIds={existingIds}
          onDisplayModeChange={setDisplayMode}
          defaultVisibleIds={viewData.defaultVisibleIds}
          onRemoveRequirement={handleRemoveRequirement}
          onRemoveRequirements={handleRemoveRequirements}
          onAddRequirement={handleAddRequirement}
          onAddRequirements={handleAddRequirements}
          onSearchAdd={handleSearchAdd}
        />

        <RequirementCustomSection
          customRequirements={customRequirements as EnterpriseCustomRequirement[]}
          onOpenModal={() => setIsCustomRequirementModalOpen(true)}
          onRemove={handleRemoveCustomRequirement}
        />

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
          </Form>
        </Modal>
      </>
    );
  }
}
