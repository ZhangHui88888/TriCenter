// @ts-nocheck
import { useCallback } from 'react';
import { Modal, message } from 'antd';
import dayjs from 'dayjs';
import { enterpriseApi, followUpApi, productApi, patentApi, surveyExcelApi } from '@/services/api';
import { findProductCategoryPath, stripTrailingPercentForInput, ensurePercentSuffix } from '../utils';
import type { useEnterpriseData } from './useEnterpriseData';

type DataState = ReturnType<typeof useEnterpriseData>;

export function useEnterpriseActions(d: DataState) {
  // 通用字段保存辅助函数
  const saveEnterpriseFields = async (fields: Record<string, any>, successMsg: string) => {
    try {
      await enterpriseApi.update(d.enterprise.id, fields);
      d.setEnterprise((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...fields };
        if (Object.prototype.hasOwnProperty.call(fields, 'targetRegionIds')) {
          next.target_region_ids = fields.targetRegionIds;
          delete (next as any).overviewMergedTargetRegionNames;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'targetCountryIds')) {
          next.target_country_ids = fields.targetCountryIds;
          delete (next as any).overviewMergedTargetCountryNames;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'hasImportExportLicense')) {
          next.has_import_export_license =
            fields.hasImportExportLicense === 1 || fields.hasImportExportLicense === true;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'lastYearRevenue')) {
          next.last_year_revenue = fields.lastYearRevenue;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'yearBeforeLastRevenue')) {
          next.year_before_last_revenue = fields.yearBeforeLastRevenue;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'currentRiskTags')) {
          next.current_risk_tags = fields.currentRiskTags;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'riskDescription')) {
          next.risk_description = fields.riskDescription;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'marketChanges')) {
          next.market_changes = fields.marketChanges;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'modeChanges')) {
          next.mode_changes = fields.modeChanges;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'categoryChanges')) {
          next.category_changes = fields.categoryChanges;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'growthReasons')) {
          next.growth_reasons = fields.growthReasons;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'declineReasons')) {
          next.decline_reasons = fields.declineReasons;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'tradeModeId')) {
          next.trade_mode_id = fields.tradeModeId;
          if (fields.tradeModeId != null) {
            const opt = d.tradeModeOptions.find((o: any) => o.value === fields.tradeModeId);
            next.trade_mode = opt?.label ?? next.trade_mode;
          } else {
            next.trade_mode = undefined;
          }
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'customsDeclarationMode')) {
          next.customs_declaration_mode = fields.customsDeclarationMode;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'tradeTeamModeId')) {
          next.trade_team_mode_id = fields.tradeTeamModeId;
          if (fields.tradeTeamModeId != null) {
            const opt = d.tradeTeamModeOptions.find((o: any) => o.value === fields.tradeTeamModeId);
            next.trade_team_mode = opt?.label ?? next.trade_team_mode;
          } else {
            next.trade_team_mode = undefined;
          }
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'tradeTeamSize')) {
          next.trade_team_size = fields.tradeTeamSize;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'hasDomesticEcommerce')) {
          next.has_domestic_ecommerce = fields.hasDomesticEcommerce;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'hasOverseasDistributors')) {
          next.has_overseas_distributors =
            fields.hasOverseasDistributors === true || fields.hasOverseasDistributors === 1;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'hasCrossBorder')) {
          next.has_cross_border = fields.hasCrossBorder;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'crossBorderRatio')) {
          next.cross_border_ratio =
            fields.crossBorderRatio != null && fields.crossBorderRatio !== ''
              ? String(fields.crossBorderRatio)
              : undefined;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'crossBorderLogistics')) {
          next.cross_border_logistics = fields.crossBorderLogistics;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'paymentSettlement')) {
          next.payment_settlement = fields.paymentSettlement;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'crossBorderTeamSize')) {
          next.cross_border_team_size = fields.crossBorderTeamSize;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'usingErp')) {
          next.using_erp = fields.usingErp === 1 || fields.usingErp === true;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'transformationWillingness')) {
          next.transformation_willingness = fields.transformationWillingness;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'investmentWillingness')) {
          next.investment_willingness = fields.investmentWillingness;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'targetMarkets')) {
          next.target_markets = fields.targetMarkets;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'hasPolicySupport')) {
          next.has_policy_support =
            fields.hasPolicySupport === 1 || fields.hasPolicySupport === true ? 1 : 0;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'enjoyedPolicies')) {
          next.enjoyed_policies = fields.enjoyedPolicies ?? [];
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'serviceCooperationRating')) {
          next.service_cooperation_rating = fields.serviceCooperationRating;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'investmentCooperationRating')) {
          next.investment_cooperation_rating = fields.investmentCooperationRating;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'incubationCooperationRating')) {
          next.incubation_cooperation_rating = fields.incubationCooperationRating;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'brandCooperationRating')) {
          next.brand_cooperation_rating = fields.brandCooperationRating;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'trainingCooperationRating')) {
          next.training_cooperation_rating = fields.trainingCooperationRating;
        }
        if (Object.prototype.hasOwnProperty.call(fields, 'overallCooperationRating')) {
          next.overall_cooperation_rating = fields.overallCooperationRating;
        }
        return next;
      });
      message.success(successMsg);
      return true;
    } catch (error: any) {
      if (!error?.response) {
        message.error(error?.message || '保存失败');
      }
      return false;
    }
  };

  const persistTradePerformanceJson = async (
    nextMarket: { up: any[]; down: any[] },
    nextMode: { up: any[]; down: any[] },
    nextCategory: { up: any[]; down: any[] },
    successMsg = '外贸业绩变化已保存',
  ) => {
    const ok = await saveEnterpriseFields(
      { marketChanges: nextMarket, modeChanges: nextMode, categoryChanges: nextCategory },
      successMsg,
    );
    if (ok) {
      d.setMarketChanges(nextMarket);
      d.setModeChanges(nextMode);
      d.setCategoryChanges(nextCategory);
    }
    return ok;
  };

  const handleStageChange = () => {
    message.success('阶段变更成功');
    d.setIsStageModalOpen(false);
  };

  const handleAddFollowUp = async () => {
    try {
      const values = await d.followUpForm.validateFields();
      if (d.editingFollowUp) {
        await followUpApi.update(d.editingFollowUp.id, {
          followType: values.follow_up_type,
          followDate: values.follow_up_date?.format('YYYY-MM-DD'),
          content: values.content,
          status: values.overall_status,
          nextPlan: values.next_step,
        });
        message.success('跟进记录更新成功');
      } else {
        await followUpApi.create({
          enterpriseId: d.enterprise.id,
          followType: values.follow_up_type,
          followDate: values.follow_up_date?.format('YYYY-MM-DD'),
          content: values.content,
          status: values.overall_status,
          nextPlan: values.next_step,
          stageAfter: values.stage_after,
        });
        message.success('跟进记录添加成功');
        if (values.stage_after) {
          const detail = await enterpriseApi.getDetail(d.enterprise.id);
          if (detail.data?.stage) {
            d.setEnterprise((prev) =>
              prev
                ? {
                    ...prev,
                    funnel_stage: detail.data.stage,
                    stage_name: detail.data.stageName,
                    stage_color: detail.data.stageColor,
                  }
                : prev
            );
          }
        }
      }
      d.setIsFollowUpModalOpen(false);
      d.setEditingFollowUp(null);
      d.followUpForm.resetFields();
      await d.loadEnterpriseFollowUps(d.enterprise.id);
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e?.message || '操作失败');
    }
  };

  const handleEditFollowUp = (record: any) => {
    d.setEditingFollowUp(record);
    d.followUpForm.setFieldsValue({
      follow_up_type: record.follow_up_type,
      follow_up_date: record.follow_up_date ? dayjs(record.follow_up_date) : null,
      content: record.content,
      overall_status: record.overall_status,
      next_step: record.next_step,
      stage_after: record.stage_after,
    });
    d.setIsFollowUpModalOpen(true);
  };

  const handleDeleteFollowUp = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除该条跟进记录吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await followUpApi.delete(record.id);
          message.success('跟进记录删除成功');
          await d.loadEnterpriseFollowUps(d.enterprise.id);
        } catch (e) {
          message.error(e?.message || '删除失败');
        }
      },
    });
  };

  const handleAddProduct = () => {
    d.setEditingProduct(null);
    d.productForm.resetFields();
    d.setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: any) => {
    d.setEditingProduct(product);
    const catPath =
      product.categoryId != null ? findProductCategoryPath(d.productCategoryTree, product.categoryId) : null;
    const localPct =
      product.localProcurementRatio != null
        ? parseFloat(String(product.localProcurementRatio).replace(/[^\d.]/g, '')) || undefined
        : undefined;
    d.productForm.setFieldsValue({
      name: product.name,
      category: catPath || undefined,
      certification_ids: product.certificationIds || [],
      target_region_ids: product.targetRegionIds || [],
      target_country_ids: product.targetCountryIds || [],
      annual_sales: product.annualSales,
      export_ratio: stripTrailingPercentForInput(product.exportRatio),
      profit_margin: stripTrailingPercentForInput(product.profitMargin),
      local_procurement: localPct,
      automation_level_id: product.automationLevelId,
      annual_capacity: product.annualCapacity,
      logistics_partner_ids: product.logisticsPartnerIds || [],
    });
    d.setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (product: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除产品「${product.name}」吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          await productApi.delete(d.enterprise.id, product.id);
          message.success('产品已删除');
          const detail = await enterpriseApi.getDetail(d.enterprise.id);
          if (detail.data) {
            d.setEnterprise((prev) =>
              prev
                ? {
                    ...prev,
                    products: detail.data.products || [],
                    overviewMergedTargetRegionNames: detail.data.overviewMergedTargetRegionNames,
                    overviewMergedTargetCountryNames: detail.data.overviewMergedTargetCountryNames,
                  }
                : prev
            );
          }
        } catch (e) {
          message.error(e?.message || '删除失败');
        }
      },
    });
  };

  const handleSaveProduct = async () => {
    try {
      const values = await d.productForm.validateFields();
      const categoryId =
        Array.isArray(values.category) && values.category.length
          ? values.category[values.category.length - 1]
          : values.category;
      const payload = {
        name: values.name,
        categoryId: categoryId ?? undefined,
        certificationIds:
          Array.isArray(values.certification_ids) && values.certification_ids.length
            ? values.certification_ids
            : undefined,
        targetRegionIds:
          Array.isArray(values.target_region_ids) && values.target_region_ids.length
            ? values.target_region_ids
            : undefined,
        targetCountryIds:
          Array.isArray(values.target_country_ids) && values.target_country_ids.length
            ? values.target_country_ids
            : undefined,
        annualSales:
          values.annual_sales != null && values.annual_sales !== ''
            ? String(values.annual_sales)
            : undefined,
        exportRatio: ensurePercentSuffix(values.export_ratio),
        profitMargin: ensurePercentSuffix(values.profit_margin),
        localProcurementRatio:
          values.local_procurement != null && values.local_procurement !== ''
            ? `${values.local_procurement}%`
            : undefined,
        automationLevelId: values.automation_level_id ?? undefined,
        annualCapacity: values.annual_capacity || undefined,
        logisticsPartnerIds:
          Array.isArray(values.logistics_partner_ids) && values.logistics_partner_ids.length
            ? values.logistics_partner_ids
            : undefined,
      };
      if (d.editingProduct?.id) {
        await productApi.update(d.enterprise.id, d.editingProduct.id, payload);
        message.success('产品信息更新成功');
      } else {
        await productApi.create(d.enterprise.id, payload);
        message.success('产品添加成功');
      }
      const detail = await enterpriseApi.getDetail(d.enterprise.id);
      if (detail.data) {
        d.setEnterprise((prev) =>
          prev
            ? {
                ...prev,
                products: detail.data.products || [],
                overviewMergedTargetRegionNames: detail.data.overviewMergedTargetRegionNames,
                overviewMergedTargetCountryNames: detail.data.overviewMergedTargetCountryNames,
              }
            : prev
        );
      }
      d.setIsProductModalOpen(false);
      d.productForm.resetFields();
      d.setEditingProduct(null);
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e?.message || '保存失败');
    }
  };

  const handleSaveBrand = async () => {
    try {
      const values = await d.brandForm.validateFields();
      const hasOwn = values.has_brand === true ? 1 : 0;
      const names = Array.isArray(values.brand_names) ? values.brand_names.filter(Boolean) : [];
      await enterpriseApi.update(d.enterprise.id, {
        hasOwnBrand: hasOwn,
        brandNames: names.length ? names.join(',') : '',
      });
      d.setEnterprise((prev: any) =>
        prev
          ? {
              ...prev,
              has_own_brand: hasOwn === 1,
              brand_names: names,
            }
          : prev
      );
      message.success('品牌信息更新成功');
      d.setIsBrandModalOpen(false);
      d.brandForm.resetFields();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || '保存失败');
    }
  };

  const handleAddPatent = () => {
    d.setEditingPatent(null);
    d.patentForm.resetFields();
    d.setIsPatentModalOpen(true);
  };

  const handleEditPatent = (patent: any) => {
    d.setEditingPatent(patent);
    d.patentForm.setFieldsValue({
      name: patent.name,
      patent_no: patent.patentNo,
    });
    d.setIsPatentModalOpen(true);
  };

  const handleDeletePatent = (patent: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除专利「${patent.name}」吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          await patentApi.delete(d.enterprise.id, patent.id);
          message.success('专利已删除');
          const detail = await enterpriseApi.getDetail(d.enterprise.id);
          if (detail.data) {
            d.setEnterprise((prev) => (prev ? { ...prev, patents: detail.data.patents || [] } : prev));
          }
        } catch (e) {
          message.error(e?.message || '删除失败');
        }
      },
    });
  };

  const handleSavePatent = async () => {
    try {
      const values = await d.patentForm.validateFields();
      const body = { name: values.name, patentNo: values.patent_no };
      if (d.editingPatent?.id) {
        await patentApi.update(d.enterprise.id, d.editingPatent.id, body);
        message.success('专利信息更新成功');
      } else {
        await patentApi.create(d.enterprise.id, body);
        message.success('专利添加成功');
      }
      const detail = await enterpriseApi.getDetail(d.enterprise.id);
      if (detail.data) {
        d.setEnterprise((prev) => (prev ? { ...prev, patents: detail.data.patents || [] } : prev));
      }
      d.setIsPatentModalOpen(false);
      d.patentForm.resetFields();
      d.setEditingPatent(null);
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e?.message || '保存失败');
    }
  };

  const openEditModal = (section: 'enterprise' | 'contact') => {
    if (section === 'enterprise') {
      d.setIsEditEnterpriseOpen(true);
    } else if (section === 'contact') {
      d.setIsEditContactOpen(true);
    }
  };

  const handleExportExcel = async () => {
    if (!d.id) return;
    d.setExporting(true);
    try {
      const response = await surveyExcelApi.exportSingle(Number(d.id));
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `${d.enterprise?.enterprise_name || '企业'}_调研表_${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('导出成功，文件已下载');
    } catch (error) {
      console.error('Export failed:', error);
      message.error('导出失败，请重试');
    } finally {
      d.setExporting(false);
    }
  };

  return {
    saveEnterpriseFields,
    persistTradePerformanceJson,
    handleStageChange,
    handleAddFollowUp,
    handleEditFollowUp,
    handleDeleteFollowUp,
    handleAddProduct,
    handleEditProduct,
    handleDeleteProduct,
    handleSaveProduct,
    handleSaveBrand,
    handleAddPatent,
    handleEditPatent,
    handleDeletePatent,
    handleSavePatent,
    openEditModal,
    handleExportExcel,
  };
}
