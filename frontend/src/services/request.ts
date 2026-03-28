import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';

type RequestLogMeta = {
  requestId: number;
  startedAt: number;
};

type RequestConfigWithMeta = InternalAxiosRequestConfig & {
  metadata?: RequestLogMeta;
  /** 为 true 时不弹全局 message，由调用方自行展示（避免与页面内提示重复叠在一起） */
  skipGlobalErrorToast?: boolean;
};

const request: AxiosInstance = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let requestSequence = 0;

function buildRequestUrl(config?: RequestConfigWithMeta) {
  const baseURL = config?.baseURL || '';
  const url = config?.url || '';
  if (!baseURL) return url;
  if (/^https?:\/\//.test(url)) return url;
  return `${baseURL}${url}`;
}

function getDurationMs(config?: RequestConfigWithMeta) {
  if (!config?.metadata?.startedAt) return undefined;
  return Math.round(performance.now() - config.metadata.startedAt);
}

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const nextConfig = config as RequestConfigWithMeta;
    nextConfig.metadata = {
      requestId: ++requestSequence,
      startedAt: performance.now(),
    };
    const token = localStorage.getItem('token');
    if (token && nextConfig.headers) {
      nextConfig.headers.Authorization = `Bearer ${token}`;
    }
    console.info('[HTTP][start]', {
      id: nextConfig.metadata.requestId,
      method: (nextConfig.method || 'get').toUpperCase(),
      url: buildRequestUrl(nextConfig),
      params: nextConfig.params,
    });
    return nextConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRedirecting = false;
const recentErrors = new Map<string, number>();
const ERROR_DEDUPE_MS = 2000;

function showErrorOnce(msg: string) {
  const now = Date.now();
  const last = recentErrors.get(msg);
  if (last && now - last < ERROR_DEDUPE_MS) return;
  recentErrors.set(msg, now);
  message.error(msg);
  setTimeout(() => recentErrors.delete(msg), ERROR_DEDUPE_MS);
}

request.interceptors.response.use(
  (response: AxiosResponse) => {
    const config = response.config as RequestConfigWithMeta;
    console.info('[HTTP][success]', {
      id: config.metadata?.requestId,
      method: (config.method || 'get').toUpperCase(),
      url: buildRequestUrl(config),
      status: response.status,
      durationMs: getDurationMs(config),
    });
    const { data } = response;
    if (response.config.responseType === 'blob') {
      return response;
    }
    if (data.code && data.code !== 200 && data.code !== 0) {
      if (!config.skipGlobalErrorToast) {
        showErrorOnce(data.message || '请求失败');
      }
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    return data;
  },
  (error) => {
    const config = error.config as RequestConfigWithMeta | undefined;
    console.error('[HTTP][error]', {
      id: config?.metadata?.requestId,
      method: (config?.method || 'get').toUpperCase(),
      url: buildRequestUrl(config),
      status: error.response?.status,
      durationMs: getDurationMs(config),
      message: error.message,
    });
    const skipToast = (config as RequestConfigWithMeta | undefined)?.skipGlobalErrorToast;
    if (error.response) {
      const { status } = error.response;
      switch (status) {
        case 401:
        case 403:
          if (window.location.pathname === '/login') {
            if (!skipToast) showErrorOnce(error.response.data?.message || '用户名或密码错误');
          } else if (!isRedirecting) {
            isRedirecting = true;
            localStorage.removeItem('token');
            if (!skipToast) showErrorOnce('登录已过期或没有权限，请重新登录');
            setTimeout(() => {
              window.location.href = '/login';
              isRedirecting = false;
            }, 300);
          }
          break;
        case 404:
          break;
        case 500:
          if (!skipToast) showErrorOnce(error.response.data?.message || '服务器错误');
          break;
        default:
          if (!skipToast) showErrorOnce(error.response.data?.message || '请求失败');
      }
    } else if (error.message.includes('timeout')) {
      if (!skipToast) showErrorOnce('请求超时');
    } else {
      if (!skipToast) showErrorOnce('网络错误');
    }
    return Promise.reject(error);
  }
);

export default request;
