/**
 * 默认配置
 */
export interface Config {
  /** Apifox OpenAPI URL */
  apifoxUrl: string;
  /** 生成目标目录 */
  outputDir: string;
  /** 是否生成索引文件 */
  generateIndex: boolean;
  /** 是否美化代码 */
  prettierFormat: boolean;
  /** API基础URL */
  baseURL?: string;
  /** 请求超时时间(毫秒) */
  timeout?: number;
  /** HTTP客户端类型: 'axios' 或 'fetch' */
  httpClient?: "axios" | "fetch";
}

/**
 * 默认配置
 */
export const defaultConfig: Config = {
  apifoxUrl: "",
  outputDir: "./api",
  generateIndex: true,
  prettierFormat: true,
  baseURL: "/api",
  timeout: 30000,
  httpClient: "axios",
};
