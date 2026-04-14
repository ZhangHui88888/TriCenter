import { AxiosHeaders, AxiosRequestConfig } from 'axios';
import request from './request';
import type { Enterprise, FollowUpRecord, ProviderDetail, ProviderListItem, ProviderUpdatePayload } from '@/types';

/**
 * FormData 上传：实例默认 Content-Type: application/json 会破坏 multipart；
 * 使用 AxiosHeaders 将 Content-Type 设为 false，由浏览器自动带 boundary。
 */
function formDataRequestOptions(extra: Record<string, unknown> = {}) {
  const { headers: rawHeaders, ...rest } = extra as { headers?: unknown } & Record<string, unknown>;
  const headers = AxiosHeaders.from(rawHeaders as any);
  headers.set('Content-Type', false as any);
  return { ...rest, headers };
}

// 企业管理 API
export const enterpriseApi = {
  // 获取企业列表
  getList: (params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    stage?: string;
    district?: string;
    industryId?: number;
    province?: string;
    city?: string;
    enterpriseType?: string;
    staffSizeId?: number;
    domesticRevenueId?: number;
    crossBorderRevenueMinWan?: number;
    crossBorderRevenueMaxWan?: number;
    sourceId?: number;
    hasCrossBorder?: number;
    transformationWillingness?: string;
    usingErp?: number;
    automationLevelId?: number;
    localProcurementRatio?: string;
    logisticsPartnerIds?: string;
    lastFollowupDays?: number;
    requirementIds?: string;
    hasAnyRequirement?: number;
    mainPlatforms?: string;
    targetMarkets?: string;
    createdDateStart?: string;
    createdDateEnd?: string;
  }) => request.get('/enterprises', { params }),

  /** 与列表相同筛选条件下的概览统计（全量匹配企业，不受分页影响） */
  getOverviewStats: (params?: Record<string, unknown>) =>
    request.get('/enterprises/overview-stats', { params }),

  // 获取企业详情
  getDetail: (id: number) => request.get(`/enterprises/${id}`),

  // 创建企业
  create: (data: Partial<Enterprise>) => request.post('/enterprises', data),

  // 更新企业
  update: (id: number, data: Partial<Enterprise>) => request.put(`/enterprises/${id}`, data),

  // 删除企业
  delete: (id: number) => request.delete(`/enterprises/${id}`),

  // 变更漏斗阶段
  updateStage: (id: number, stage: string) => request.patch(`/enterprises/${id}/stage`, { stage }),

  // 导入企业
  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request.post('/enterprises/import', formData, formDataRequestOptions({ timeout: 0 }));
  },

  // 导出企业（与列表相同查询参数；双 Sheet：企业列表 + 需求分析矩阵）
  export: (params?: Record<string, unknown>) =>
    request.get('/enterprises/export', { params, responseType: 'blob', timeout: 0 }),

  // 下载导入模板
  downloadTemplate: () =>
    request.get('/enterprises/template', { responseType: 'blob' }),

  // 批量删除企业
  batchDelete: (ids: number[]) => request.delete('/enterprises/batch', { data: { ids } }),

  // 批量变更阶段
  batchChangeStage: (ids: number[], stage: string, reason?: string) =>
    request.patch('/enterprises/batch/stage', { ids, stage, reason }),
};

// 企业合作服务档案 API
export const serviceRecordApi = {
  getList: (enterpriseId: number) =>
    request.get(`/enterprises/${enterpriseId}/services`),

  getGlobalList: (params?: {
    page?: number;
    pageSize?: number;
    enterpriseId?: number;
    providerId?: number;
    serviceType?: string;
    status?: string;
  }) => request.get('/service-records', { params }),

  create: (enterpriseId: number, data: any) =>
    request.post(`/enterprises/${enterpriseId}/services`, data),

  update: (
    enterpriseId: number,
    serviceId: number,
    data: any,
    config?: AxiosRequestConfig & { skipGlobalErrorToast?: boolean },
  ) => request.put(`/enterprises/${enterpriseId}/services/${serviceId}`, data, config),

  delete: (enterpriseId: number, serviceId: number) =>
    request.delete(`/enterprises/${enterpriseId}/services/${serviceId}`),
};

/** 合作服务记录附件（文件/图片）上传与下载，需登录 */
export const cooperationUploadApi = {
  uploadAttachment: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return request.post(
      '/upload/cooperation-attachment',
      fd,
      formDataRequestOptions({ timeout: 120000, skipGlobalErrorToast: true }),
    );
  },

  downloadAttachment: (storedFileName: string, downloadName?: string) =>
    request.get(
      `/upload/cooperation-attachment/download/${encodeURIComponent(storedFileName)}`,
      {
        responseType: 'blob',
        params: downloadName ? { name: downloadName } : {},
        timeout: 0,
      },
    ),
};

// 跟进记录 API
export const followUpApi = {
  // 获取跟进记录列表
  getList: (params?: {
    page?: number;
    pageSize?: number;
    enterpriseId?: number;
    type?: string;
  }) => request.get('/follow-ups', { params }),

  // 获取企业的跟进记录
  getByEnterprise: (enterpriseId: number) => request.get(`/enterprises/${enterpriseId}/follow-ups`),

  // 创建跟进记录
  create: (data: Partial<FollowUpRecord>) => request.post('/follow-ups', data),

  // 更新跟进记录
  update: (id: number, data: Partial<FollowUpRecord>) => request.put(`/follow-ups/${id}`, data),

  // 删除跟进记录
  delete: (id: number) => request.delete(`/follow-ups/${id}`),

  /** 本月/本周/今日/待跟进企业统计 */
  getStats: () => request.get('/follow-ups/stats'),
};

// 看板统计 API
export const dashboardApi = {
  // 获取统计概览
  getOverview: () => request.get('/dashboard/overview'),

  // 获取漏斗阶段分布
  getFunnelStats: () => request.get('/dashboard/funnel'),

  // 获取区域分布
  getDistrictStats: () => request.get('/dashboard/districts'),

  // 获取行业分布
  getIndustryStats: () => request.get('/dashboard/industries'),

  // 获取待跟进提醒
  getPendingFollowUps: () => request.get('/dashboard/pending-follow-ups'),

  // 获取月度新增趋势
  getMonthlyTrend: () => request.get('/dashboard/monthly-trend'),

  // 数据分析聚合统计（替代前端全量拉取）
  getAnalysisStats: (params?: Record<string, any>) => request.get('/dashboard/analysis-stats', { params }),

  // 清除所有缓存
  clearCache: () => request.delete('/dashboard/cache'),
};

// 用户认证 API
export const authApi = {
  // 登录
  login: (data: { username: string; password: string }) => request.post('/auth/login', data),

  // 登出
  logout: () => request.post('/auth/logout'),

  // 获取当前用户信息
  getCurrentUser: () => request.get('/auth/me'),

  // 修改密码
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    request.post('/auth/change-password', data),
};

// 联系人管理 API
export const contactApi = {
  // 获取企业联系人列表
  getByEnterprise: (enterpriseId: number) =>
    request.get(`/enterprises/${enterpriseId}/contacts`),

  // 批量更新企业联系人（全量替换）
  update: (enterpriseId: number, contacts: Array<{
    id?: number;
    name: string;
    phone: string;
    position?: string;
    isPrimary?: boolean;
    email?: string;
    wechat?: string;
    remark?: string;
  }>) => request.put(`/enterprises/${enterpriseId}/contacts`, { contacts }),
};

// 产品管理 API
export const productApi = {
  // 添加产品
  create: (enterpriseId: number, data: any) => 
    request.post(`/enterprises/${enterpriseId}/products`, data),

  // 更新产品
  update: (enterpriseId: number, productId: number, data: any) => 
    request.put(`/enterprises/${enterpriseId}/products/${productId}`, data),

  // 删除产品
  delete: (enterpriseId: number, productId: number) => 
    request.delete(`/enterprises/${enterpriseId}/products/${productId}`),
};

// 专利管理 API
export const patentApi = {
  // 添加专利
  create: (enterpriseId: number, data: any) => 
    request.post(`/enterprises/${enterpriseId}/patents`, data),

  // 更新专利
  update: (enterpriseId: number, patentId: number, data: any) => 
    request.put(`/enterprises/${enterpriseId}/patents/${patentId}`, data),

  // 删除专利
  delete: (enterpriseId: number, patentId: number) => 
    request.delete(`/enterprises/${enterpriseId}/patents/${patentId}`),
};

// 调研Excel导入导出 API
export const surveyExcelApi = {
  // 导出单个企业调研表
  exportSingle: (enterpriseId: number) =>
    request.get(`/survey-excel/export/${enterpriseId}`, { responseType: 'blob' }),

  // 批量导出企业调研表
  exportBatch: (enterpriseIds: number[]) =>
    request.post('/survey-excel/export/batch', enterpriseIds, {
      responseType: 'blob',
      timeout: 0,
    }),

  // 导入调研数据
  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request.post('/survey-excel/import', formData, formDataRequestOptions({ timeout: 0 }));
  },

  // 下载调研导入模板（全量企业多 Sheet，生成可能超过默认 10s）
  downloadTemplate: () =>
    request.get('/survey-excel/template', { responseType: 'blob', timeout: 0 }),
};

// 市场调研报告 API
export const marketReportApi = {
  get: (enterpriseId: number) =>
    request.get(`/market-reports/${enterpriseId}`),

  save: (enterpriseId: number, version: 'basic' | 'deep', data: Record<string, any>) =>
    request.put(`/market-reports/${enterpriseId}/${version}`, data),
};

// 基础数据/选项 API
export const optionsApi = {
  // 获取系统选项
  getOptions: (category: string) => request.get(`/options/${category}`),

  // 获取统一分类树（行业+产品品类共用）
  getCategories: () => request.get('/options/categories'),
  // 兼容旧调用
  getIndustries: () => request.get('/options/categories'),
  getProductCategories: () => request.get('/options/categories'),

  // 获取用户列表（对接人）
  getUsers: () => request.get('/options/users'),

  // 获取需求配置（需求列表+标记+维度映射，企业详情需求分析用）
  getRequirementConfig: () => request.get<RequirementConfigData>('/options/requirements/config'),

  getProviders: () => request.get('/options/providers'),
};

export interface RequirementConfigData {
  requirements: Array<{
    id: string;
    name: string;
    description: string;
    detailDescription?: string;
    phase: string;
    category: string;
    isRecommended?: number;
  }>;
  universalRequiredIds: string[];
  universalEnhancedIds: string[];
  dimensionRequirementMapping: Record<string, Record<string, string[]>>;
}

/** 树形分类管理（行业 / 产品品类 / 需求分类，写入对应分类表） */
export const treeCategoryApi = {
  list: (type: string) => request.get<TreeCategoryItem[]>(`/tree-categories/${type}`),
  create: (type: string, data: { parentId: number; name: string; sortOrder?: number; isEnabled?: boolean }) =>
    request.post<TreeCategoryItem>(`/tree-categories/${type}`, data),
  update: (type: string, id: number, data: { name?: string; sortOrder?: number; isEnabled?: boolean }) =>
    request.put<TreeCategoryItem>(`/tree-categories/${type}/${id}`, data),
  delete: (type: string, id: number) => request.delete(`/tree-categories/${type}/${id}`),
  resetToDefault: (type: string) => request.post<TreeCategoryItem[]>(`/tree-categories/${type}/reset`),
};

export interface TreeCategoryItem {
  id: number;
  parentId: number;
  name: string;
  level: number;
  path: string;
  sortOrder: number;
  isEnabled: number;
  createdAt: string;
  /** 需求分类三级节点：与 requirements.id 对齐时由后端填充，用于编辑画像五维 */
  linkedRequirementId?: string | null;
}

/** 服务商管理 API */
export const providerApi = {
  getList: (params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    category?: string;
    cooperationStatus?: string;
    district?: string;
  }) => request.get<{ list: ProviderListItem[]; total: number; page: number; pageSize: number }>('/providers', { params }),

  getDetail: (id: number) => request.get<ProviderDetail>(`/providers/${id}`),

  create: (data: any) => request.post('/providers', data),

  update: (id: number, data: ProviderUpdatePayload) => request.put(`/providers/${id}`, data),

  delete: (id: number) => request.delete(`/providers/${id}`),
};

/** 数据字典管理（新增选项等，写入 system_options 并刷新服务端缓存） */
export const dictionaryApi = {
  addOption: (
    category: string,
    body: { value: string; label: string; color?: string; sortOrder?: number; isEnabled?: number }
  ) => request.post(`/dictionary/${category}`, body),

  updateOption: (
    category: string,
    id: number,
    body: { label?: string; color?: string; sortOrder?: number; isEnabled?: number }
  ) => request.put(`/dictionary/${category}/${id}`, body),

  deleteOption: (category: string, id: number) => request.delete(`/dictionary/${category}/${id}`),
};

/** 数据字典：标准需求项 + 企业画像五维映射（requirement_dimension_mapping） */
export const requirementItemAdminApi = {
  list: () => request.get<unknown[]>('/dictionary/requirement-items'),
  getRecommended: (id: string) =>
    request.get<{ isRecommended?: number }>(`/dictionary/requirement-items/${encodeURIComponent(id)}/recommended`),
  getDimensions: (id: string) =>
    request.get<Record<string, string[]>>(`/dictionary/requirement-items/${encodeURIComponent(id)}/dimensions`),
  putDimensions: (id: string, body: Record<string, string[]>) =>
    request.put(`/dictionary/requirement-items/${encodeURIComponent(id)}/dimensions`, body),
  toggleRecommended: (id: string, isRecommended: boolean) =>
    request.patch(`/dictionary/requirement-items/${encodeURIComponent(id)}/recommended`, { isRecommended }),
};
