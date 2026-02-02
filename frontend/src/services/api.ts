import request from './request';
import type { Enterprise, FollowUpRecord } from '@/types';

// 企业管理 API
export const enterpriseApi = {
  // 获取企业列表
  getList: (params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    stage?: string;
    district?: string;
    industry?: string;
  }) => request.get('/enterprises', { params }),

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
    return request.post('/enterprises/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // 导出企业
  export: (params?: { stage?: string; district?: string }) =>
    request.get('/enterprises/export', { params, responseType: 'blob' }),
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
};

// 漏斗分析 API
export const funnelApi = {
  // 获取漏斗数据
  getData: () => request.get('/funnel/data'),

  // 获取转化率
  getConversionRates: () => request.get('/funnel/conversion'),

  // 获取趋势数据
  getTrend: (params?: { startDate?: string; endDate?: string }) =>
    request.get('/funnel/trend', { params }),
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
