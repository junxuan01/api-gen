// src/utils/bun-request.ts
// Bun 优化版本的 HTTP 请求工具
// 利用 Bun 内置的 fetch API 实现高性能请求

type RequestOptions = {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
};

type RequestConfig = {
  method?: string;
  headers?: Record<string, string>;
  data?: any;
  params?: Record<string, any>;
  timeout?: number;
  signal?: AbortSignal;
};

/**
 * 创建一个基于 Bun 的请求工具实例
 */
export function createRequest(defaultOptions: RequestOptions = {}) {
  const {
    baseURL = "",
    headers: defaultHeaders = {},
    timeout = 30000,
  } = defaultOptions;

  /**
   * 发送请求
   */
  async function request<T = any>(
    url: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      method = "GET",
      headers = {},
      data,
      params,
      timeout: requestTimeout = timeout,
      signal,
    } = config;

    // 构建完整URL（处理查询参数）
    let fullUrl = `${baseURL}${url}`;
    if (params) {
      const queryString = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryString.append(key, String(value));
        }
      });
      const queryPart = queryString.toString();
      if (queryPart) {
        fullUrl += (fullUrl.includes("?") ? "&" : "?") + queryPart;
      }
    }

    // 请求选项
    const fetchOptions: RequestInit = {
      method,
      headers: { ...defaultHeaders, ...headers },
      signal,
    };

    // 添加请求体
    if (data !== undefined) {
      if (
        typeof data === "object" &&
        !(data instanceof FormData) &&
        !(data instanceof Blob) &&
        !(data instanceof URLSearchParams)
      ) {
        fetchOptions.body = JSON.stringify(data);
        // 如果没有指定 content-type，默认为 json
        if (
          !fetchOptions.headers["Content-Type"] &&
          !fetchOptions.headers["content-type"]
        ) {
          (fetchOptions.headers as Record<string, string>)["Content-Type"] =
            "application/json";
        }
      } else {
        fetchOptions.body = data;
      }
    }

    // 创建超时控制
    const controller = new AbortController();
    if (!signal) {
      fetchOptions.signal = controller.signal;
      if (requestTimeout > 0) {
        setTimeout(() => controller.abort("Request timeout"), requestTimeout);
      }
    }

    try {
      const response = await fetch(fullUrl, fetchOptions);

      // 处理不同响应类型
      let responseData: any;
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        responseData = await response.json();
      } else if (contentType?.includes("text/")) {
        responseData = await response.text();
      } else {
        responseData = await response.blob();
      }

      // 处理错误响应
      if (!response.ok) {
        throw {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        };
      }

      return responseData as T;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw error;
    }
  }

  // 便捷方法
  const get = <T = any>(url: string, config?: RequestConfig) =>
    request<T>(url, { ...config, method: "GET" });

  const post = <T = any>(url: string, data?: any, config?: RequestConfig) =>
    request<T>(url, { ...config, data, method: "POST" });

  const put = <T = any>(url: string, data?: any, config?: RequestConfig) =>
    request<T>(url, { ...config, data, method: "PUT" });

  const del = <T = any>(url: string, config?: RequestConfig) =>
    request<T>(url, { ...config, method: "DELETE" });

  const patch = <T = any>(url: string, data?: any, config?: RequestConfig) =>
    request<T>(url, { ...config, data, method: "PATCH" });

  return {
    request,
    get,
    post,
    put,
    delete: del,
    patch,
  };
}

// 创建默认实例
export default createRequest();
