// @ts-nocheck
import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Button, Spin, Typography } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons';

import { useEnterpriseData } from './hooks/useEnterpriseData';
import { useEnterpriseActions } from './hooks/useEnterpriseActions';
import EnterpriseHeader from './components/EnterpriseHeader';
import EnterpriseModals from './components/EnterpriseModals';
import { buildRecordColumns } from './components/FollowUpColumns';
import { enterpriseDetailTabLabel } from './tabUtils';

import BasicInfoTab from './tabs/BasicInfoTab';
import ProductInfoTab from './tabs/ProductInfoTab';
import TradeInfoTab from './tabs/TradeInfoTab';
import CrossborderTab from './tabs/CrossborderTab';
import RequirementsTab from './tabs/RequirementsTab';
import PolicyTab from './tabs/PolicyTab';
import CooperationTab from './tabs/CooperationTab';
import CompetitionTab from './tabs/CompetitionTab';
import FollowUpTab from './tabs/FollowUpTab';

const { Title } = Typography;

export default function EnterpriseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const d = useEnterpriseData(id);
  const actions = useEnterpriseActions(d);

  const recordColumns = useMemo(
    () => buildRecordColumns(actions.handleEditFollowUp, actions.handleDeleteFollowUp),
    [actions.handleEditFollowUp, actions.handleDeleteFollowUp],
  );

  if (d.loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>加载中...</div>
        </div>
      </Card>
    );
  }

  if (!d.enterprise) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Title level={4}>企业不存在</Title>
          <Button type="primary" onClick={() => navigate('/enterprise')}>
            返回列表
          </Button>
        </div>
      </Card>
    );
  }

  const tabItems = [
    {
      key: 'basic',
      label: enterpriseDetailTabLabel('基本信息', 'basic'),
      children: <BasicInfoTab enterprise={d.enterprise} openEditModal={actions.openEditModal} />,
    },
    {
      key: 'product',
      label: enterpriseDetailTabLabel('产品信息', 'product'),
      children: (
        <ProductInfoTab
          enterprise={d.enterprise}
          regionOptions={d.regionOptions}
          onEditOverview={() => d.setIsProductOverviewModalOpen(true)}
          onAddProduct={actions.handleAddProduct}
          onEditProduct={actions.handleEditProduct}
          onDeleteProduct={actions.handleDeleteProduct}
          onEditBrand={() => d.setIsBrandModalOpen(true)}
          onAddPatent={actions.handleAddPatent}
          onEditPatent={actions.handleEditPatent}
          onDeletePatent={actions.handleDeletePatent}
        />
      ),
    },
    {
      key: 'trade',
      label: enterpriseDetailTabLabel('外贸信息', 'trade'),
      children: (
        <TradeInfoTab
          enterprise={d.enterprise}
          hasForeignTrade={d.hasForeignTrade}
          setHasForeignTrade={d.setHasForeignTrade}
          marketChanges={d.marketChanges}
          setMarketChanges={d.setMarketChanges}
          modeChanges={d.modeChanges}
          setModeChanges={d.setModeChanges}
          categoryChanges={d.categoryChanges}
          setCategoryChanges={d.setCategoryChanges}
          growthReasons={d.growthReasons}
          setGrowthReasons={d.setGrowthReasons}
          declineReasons={d.declineReasons}
          setDeclineReasons={d.setDeclineReasons}
          persistTradePerformanceJson={actions.persistTradePerformanceJson}
          setTradeChangeType={d.setTradeChangeType}
          setTradeChangeDirection={d.setTradeChangeDirection}
          setEditingTradeChange={d.setEditingTradeChange}
          setIsTradeChangeModalOpen={d.setIsTradeChangeModalOpen}
          setIsTradeModalOpen={d.setIsTradeModalOpen}
          setIsTradePerformanceModalOpen={d.setIsTradePerformanceModalOpen}
          setReasonType={d.setReasonType}
          setEditingReason={d.setEditingReason}
          setIsReasonModalOpen={d.setIsReasonModalOpen}
          reasonForm={d.reasonForm}
        />
      ),
    },
    {
      key: 'crossborder',
      label: enterpriseDetailTabLabel('线上跨境电商', 'crossborder'),
      children: (
        <CrossborderTab
          enterprise={d.enterprise}
          hasCrossborderEcommerce={d.hasCrossborderEcommerce}
          setHasCrossborderEcommerce={d.setHasCrossborderEcommerce}
          selectedCrossborderPlatforms={d.selectedCrossborderPlatforms}
          targetMarkets={d.targetMarkets}
          onEditPlatform={() => d.setIsCrossborderPlatformModalOpen(true)}
          onEditBasic={() => d.setIsCrossborderBasicModalOpen(true)}
          onEditMarket={() => d.setIsMarketModalOpen(true)}
        />
      ),
    },
    {
      key: 'requirements',
      label: enterpriseDetailTabLabel('需求分析', 'requirements'),
      children: (
        <RequirementsTab
          reqConfig={d.reqConfig}
          dimensionSelections={d.dimensionSelections}
          setDimensionSelections={d.setDimensionSelections}
          removedRequirements={d.removedRequirements}
          setRemovedRequirements={d.setRemovedRequirements}
          addedRequirements={d.addedRequirements}
          setAddedRequirements={d.setAddedRequirements}
          customRequirements={d.customRequirements}
          setCustomRequirements={d.setCustomRequirements}
          isCustomRequirementModalOpen={d.isCustomRequirementModalOpen}
          setIsCustomRequirementModalOpen={d.setIsCustomRequirementModalOpen}
          customRequirementForm={d.customRequirementForm}
          saveEnterpriseFields={actions.saveEnterpriseFields}
        />
      ),
    },
    {
      key: 'policy',
      label: enterpriseDetailTabLabel('政策支持', 'policy'),
      children: <PolicyTab enterprise={d.enterprise} onEdit={() => d.setIsPolicySupportModalOpen(true)} />,
    },
    {
      key: 'cooperation',
      label: enterpriseDetailTabLabel('合作', 'cooperation'),
      children: (
        <CooperationTab
          enterprise={d.enterprise}
          setEnterprise={d.setEnterprise}
          isCooperating={d.isCooperating}
          setIsCooperating={d.setIsCooperating}
          serviceRecords={d.serviceRecords}
          reloadServiceRecords={d.loadServiceRecords}
          mergeServiceRecordInState={d.mergeServiceRecordInState}
          saveEnterpriseFields={actions.saveEnterpriseFields}
          navigateToServiceRecords={() => navigate(`/service-records?enterpriseId=${id}`)}
        />
      ),
    },
    {
      key: 'competition',
      label: enterpriseDetailTabLabel('竞争力与风险', 'competition'),
      children: (
        <CompetitionTab
          enterprise={d.enterprise}
          isSurveyed={d.isSurveyed}
          setIsSurveyed={d.setIsSurveyed}
          competitionPosition={d.competitionPosition}
          setCompetitionPosition={d.setCompetitionPosition}
          competitionDesc={d.competitionDesc}
          setCompetitionDesc={d.setCompetitionDesc}
          saveEnterpriseFields={actions.saveEnterpriseFields}
          onEditRisk={() => d.setIsRiskModalOpen(true)}
        />
      ),
    },
    {
      key: 'followup',
      label: enterpriseDetailTabLabel('跟进记录', 'followup'),
      children: (
        <FollowUpTab
          enterpriseRecords={d.enterpriseRecords}
          recordColumns={recordColumns}
          onAddFollowUp={() => d.setIsFollowUpModalOpen(true)}
        />
      ),
    },
  ];

  return (
    <div>
      <div
        data-tour="enterprise-detail-toolbar"
        style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/enterprise')}>
          返回列表
        </Button>
        <Button
          icon={<DownloadOutlined />}
          onClick={actions.handleExportExcel}
          loading={d.exporting}
          style={{
            borderRadius: 8,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            color: '#fff',
            fontWeight: 500,
            boxShadow: '0 2px 8px rgba(102,126,234,0.3)',
          }}
        >
          导出Excel
        </Button>
      </div>

      <EnterpriseHeader
        enterprise={d.enterprise}
        setEnterprise={d.setEnterprise}
        setSelectedStage={d.setSelectedStage}
      />

      <Card
        data-tour="enterprise-detail-tabs"
        style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
      >
        <Tabs
          activeKey={d.activeTab}
          onChange={d.setActiveTab}
          items={tabItems}
          tabBarStyle={{
            marginBottom: 0,
            borderBottom: '1px solid #f0f0f0',
            paddingLeft: 8,
          }}
        />
      </Card>

      <EnterpriseModals d={d} actions={actions} />
    </div>
  );
}
