import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface RequestOptions extends AxiosRequestConfig {}

// 创建axios实例
const instance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 在这里添加认证信息或其他请求处理逻辑
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 直接返回响应数据
    return response.data;
  },
  (error) => {
    // 处理错误
    return Promise.reject(error);
  }
);

/**
 * 通用请求函数
 *
 * @param options 请求配置
 * @returns 请求结果
 */
export async function request<T = any>(options: RequestOptions): Promise<T> {
  return instance(options) as unknown as T;
}
