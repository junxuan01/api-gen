// src/templates/bun-template.ts
// Bun 环境下的模板生成工具

/**
 * 生成 API 函数模板
 */
export function generateApiTemplate(
  methodName: string,
  url: string,
  method: string,
  hasPathParams: boolean,
  hasQueryParams: boolean,
  hasRequestBody: boolean,
  hasResponseType: boolean,
  requestBodyType: string = "unknown",
  responseType: string = "any",
  queryParamsType: string = "Record<string, any>",
  pathParamsType: string = "Record<string, string>",
  summary: string = "",
  description: string = ""
): string {
  const comments = [];
  if (summary) comments.push(` * ${summary}`);
  if (description) comments.push(` * ${description}`);

  const jsdoc = comments.length ? `/**\n${comments.join("\n")}\n */` : "";

  // 参数构建
  const functionParams = [];
  if (hasPathParams) {
    functionParams.push(`pathParams: ${pathParamsType}`);
  }
  if (hasQueryParams) {
    functionParams.push(
      `queryParams${hasPathParams ? "?" : ""}: ${queryParamsType}`
    );
  }
  if (hasRequestBody) {
    const optional = hasPathParams || hasQueryParams ? "?" : "";
    functionParams.push(`data${optional}: ${requestBodyType}`);
  }
  if (functionParams.length === 0) {
    functionParams.push("options?: RequestConfig");
  } else {
    functionParams.push("options?: RequestConfig");
  }

  // 构建URL部分
  let urlCode = "";
  if (hasPathParams) {
    urlCode = `\n  // 替换路径参数
  let finalUrl = \`${url.replace(/\{([^}]+)\}/g, "${pathParams.$1}")}\`;`;
  } else {
    urlCode = `\n  const finalUrl = "${url}";`;
  }

  // 构建请求部分
  let requestCode = "";
  if (hasQueryParams && hasRequestBody) {
    requestCode = `\n  return request<${responseType}>(finalUrl, { 
    ...options,
    method: "${method}",
    data,
    params: queryParams
  });`;
  } else if (hasQueryParams) {
    requestCode = `\n  return request<${responseType}>(finalUrl, { 
    ...options,
    method: "${method}",
    params: queryParams
  });`;
  } else if (hasRequestBody) {
    requestCode = `\n  return request<${responseType}>(finalUrl, { 
    ...options,
    method: "${method}",
    data
  });`;
  } else {
    requestCode = `\n  return request<${responseType}>(finalUrl, { 
    ...options,
    method: "${method}"
  });`;
  }

  // 生成最终函数代码
  return `${jsdoc}
export function ${methodName}(${functionParams.join(", ")}) {${urlCode}${requestCode}
}`;
}

/**
 * 生成 API 索引文件模板
 */
export function generateApiIndexTemplate(exports: string[]): string {
  return exports.map((name) => `export * from "./${name}";`).join("\n");
}

/**
 * 生成类型定义模板
 */
export function generateTypeTemplate(name: string, schema: string): string {
  return `export type ${name} = ${schema};`;
}

/**
 * 生成请求实例工具模板
 */
export function generateRequestUtilTemplate(): string {
  return `// 使用 Bun 优化后的请求工具
import { createRequest } from "../utils/bun-request";

// 创建请求实例（可配置为不同环境指向不同的基础URL）
const baseURL = process.env.API_BASE_URL || "https://api.example.com";

// 创建请求实例
const request = createRequest({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 默认10秒超时
});

// 请求配置类型
export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  signal?: AbortSignal;
}

export default request;`;
}

/**
 * 生成配置文件模板
 */
export function generateConfigTemplate(): string {
  return `{
  "openapi": {
    "url": "https://your-api-url.com/openapi.json",
    "tagGrouping": true
  },
  "output": {
    "path": "./api",
    "client": "fetch",
    "requestFunctions": true,
    "types": true,
    "mock": false
  }
}`;
}
