// 请求函数模板
export const requestFunctionTemplate = `
/**
 * {{summary}}
 * {{#if description}}
 * @description {{description}}
 * {{/if}}
 * @operationId {{operationId}}
 */
export async function {{functionName}}({{#if hasParams}}params: components['parameters']['{{operationId}}Params'], {{/if}}{{#if hasQuery}}query: components['parameters']['{{operationId}}Query'], {{/if}}{{#if hasBody}}body: components['requestBodies']['{{operationId}}RequestBody']['content']['application/json'], {{/if}}options?: RequestOptions): Promise<{{responseType}}> {
  return request({
    method: '{{method}}',
    url: {{#if hasParams}}\`{{urlTemplate}}\`{{else}}'{{path}}'{{/if}},
    {{#if hasQuery}}params: query,{{/if}}
    {{#if hasBody}}data: body,{{/if}}
    ...options,
  });
}`;

// API文件模板
export const apiFileTemplate = `
import { request, RequestOptions } from '../utils/request';
import { 
  // 导入DTO类型
  {{#each typeImports}}
  {{this}},
  {{/each}}
} from '../types/schema';

{{functions}}
`;

// 索引文件模板
export const indexFileTemplate = `
{{imports}}

export {
  {{exports}}
};
`;

// Axios 工具文件模板
export const requestUtilTemplate = `
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface RequestOptions extends AxiosRequestConfig {}

// 创建axios实例
const instance = axios.create({
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
`;

// Fetch 工具文件模板
export const fetchUtilTemplate = `
/**
 * 请求选项类型定义
 * 保持与 axios 的接口兼容，方便切换
 */
export interface RequestOptions {
  // 请求方法
  method?: string;
  // 请求URL
  url?: string;
  // URL参数
  params?: Record<string, any>;
  // 请求体数据
  data?: any;
  // 请求头
  headers?: Record<string, string>;
  // 超时时间(毫秒)
  timeout?: number;
  // 其他 fetch 特有的选项
  credentials?: RequestCredentials;
  cache?: RequestCache;
  mode?: RequestMode;
  signal?: AbortSignal;
  // 扩展属性，允许其他选项
  [key: string]: any;
}

/**
 * 请求拦截器
 */
interface RequestInterceptor {
  onFulfilled: (config: RequestOptions) => RequestOptions | Promise<RequestOptions>;
  onRejected?: (error: any) => any;
}

/**
 * 响应拦截器
 */
interface ResponseInterceptor {
  onFulfilled: (response: any) => any;
  onRejected?: (error: any) => any;
}

// 拦截器列表
const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];

/**
 * 添加请求拦截器
 * 
 * @param onFulfilled 拦截器函数，处理请求配置
 * @param onRejected 错误处理函数
 */
export function addRequestInterceptor(
  onFulfilled: (config: RequestOptions) => RequestOptions | Promise<RequestOptions>,
  onRejected?: (error: any) => any
) {
  requestInterceptors.push({ onFulfilled, onRejected });
  return { onFulfilled, onRejected };
}

/**
 * 添加响应拦截器
 * 
 * @param onFulfilled 拦截器函数，处理响应数据
 * @param onRejected 错误处理函数
 */
export function addResponseInterceptor(
  onFulfilled: (response: any) => any,
  onRejected?: (error: any) => any
) {
  responseInterceptors.push({ onFulfilled, onRejected });
  return { onFulfilled, onRejected };
}

/**
 * 默认请求选项
 */
const defaultOptions: RequestOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
};

/**
 * 构建查询字符串
 * 
 * @param params 参数对象
 * @returns 查询字符串
 */
function buildQueryString(params: Record<string, any>): string {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(
      ([key, value]) => 
        \`\${encodeURIComponent(key)}=\${encodeURIComponent(String(value))}\`
    )
    .join('&');
}

/**
 * 添加默认请求拦截器，用于处理认证信息等
 * 可以根据项目需求修改
 */
addRequestInterceptor((config) => {
  // 在这里添加认证信息或其他请求处理逻辑
  return config;
});

/**
 * 添加默认响应拦截器，处理响应数据转换
 */
addResponseInterceptor(async (response) => {
  // 直接返回响应数据
  return response;
});

/**
 * 通用请求函数
 * 
 * @param options 请求配置
 * @returns 请求结果
 */
export async function request<T = any>(options: RequestOptions): Promise<T> {
  // 合并默认选项
  let config = { ...defaultOptions, ...options };
  
  // 应用请求拦截器
  for (const interceptor of requestInterceptors) {
    try {
      config = await interceptor.onFulfilled(config);
    } catch (error) {
      if (interceptor.onRejected) {
        interceptor.onRejected(error);
      }
      throw error;
    }
  }

  // 构建完整URL（添加查询参数）
  let url = config.url || '';
  if (config.params && Object.keys(config.params).length > 0) {
    const queryString = buildQueryString(config.params);
    url += (url.includes('?') ? '&' : '?') + queryString;
  }

  // 准备fetch选项
  const fetchOptions: RequestInit = {
    method: config.method || 'GET',
    headers: config.headers || {},
    credentials: config.credentials,
    cache: config.cache,
    mode: config.mode,
    signal: config.signal,
  };

  // 添加请求体
  if (config.data !== undefined) {
    if (typeof config.data === 'object' && 
        fetchOptions.headers && 
        fetchOptions.headers['Content-Type'] === 'application/json') {
      fetchOptions.body = JSON.stringify(config.data);
    } else if (typeof config.data === 'string' || config.data instanceof FormData) {
      fetchOptions.body = config.data;
    } else {
      fetchOptions.body = JSON.stringify(config.data);
    }
  }

  // 处理超时
  const controller = new AbortController();
  if (!fetchOptions.signal && config.timeout && config.timeout > 0) {
    fetchOptions.signal = controller.signal;
    setTimeout(() => controller.abort(), config.timeout);
  }

  try {
    // 发送请求
    const response = await fetch(url, fetchOptions);
    
    // 处理HTTP错误
    if (!response.ok) {
      throw new Error(\`HTTP error! Status: \${response.status}\`);
    }

    // 解析响应
    let data: any;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // 应用响应拦截器
    for (const interceptor of responseInterceptors) {
      try {
        data = await interceptor.onFulfilled(data);
      } catch (error) {
        if (interceptor.onRejected) {
          interceptor.onRejected(error);
        }
        throw error;
      }
    }

    return data as T;
  } catch (error) {
    // 处理所有拦截器中的错误处理函数
    for (const interceptor of responseInterceptors) {
      if (interceptor.onRejected) {
        try {
          return await interceptor.onRejected(error) as T;
        } catch (e) {
          // 继续抛出错误，尝试下一个拦截器
        }
      }
    }
    
    // 如果没有被任何拦截器处理，则抛出错误
    throw error;
  }
}
`;
