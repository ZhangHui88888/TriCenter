import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';

const request: AxiosInstance = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
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
    const { data } = response;
    if (response.config.responseType === 'blob') {
      return response;
    }
    if (data.code && data.code !== 200 && data.code !== 0) {
      showErrorOnce(data.message || '请求失败');
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    return data;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      switch (status) {
        case 401:
        case 403:
          if (window.location.pathname === '/login') {
            showErrorOnce(error.response.data?.message || '用户名或密码错误');
          } else if (!isRedirecting) {
            isRedirecting = true;
            localStorage.removeItem('token');
            showErrorOnce('登录已过期或没有权限，请重新登录');
            setTimeout(() => {
              window.location.href = '/login';
              isRedirecting = false;
            }, 300);
          }
          break;
        case 404:
          break;
        case 500:
          showErrorOnce(error.response.data?.message || '服务器错误');
          break;
        default:
          showErrorOnce(error.response.data?.message || '请求失败');
      }
    } else if (error.message.includes('timeout')) {
      showErrorOnce('请求超时');
    } else {
      showErrorOnce('网络错误');
    }
    return Promise.reject(error);
  }
);

export default request;
