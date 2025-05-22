/**
 * API路径信息
 */
export interface ApiPathInfo {
  /** 接口路径 */
  path: string;
  /** 接口方法 (get, post, put, delete等) */
  method: string;
  /** 接口标签/分组 */
  tags: string[];
  /** 接口描述 */
  summary: string;
  /** 接口详细描述 */
  description?: string;
  /** 操作ID */
  operationId: string;
  /** 请求参数 */
  parameters?: OpenApiParameterObject[];
  /** 请求体 */
  requestBody?: OpenApiRequestBodyObject;
  /** 响应数据 */
  responses: Record<string, OpenApiResponseObject>;
}

/**
 * API分组信息
 */
export interface ApiGroupInfo {
  /** 分组名称 */
  name: string;
  /** API路径信息列表 */
  apis: ApiPathInfo[];
}

/**
 * OpenAPI参数对象
 */
export interface OpenApiParameterObject {
  /** 参数名称 */
  name: string;
  /** 参数位置 */
  in: "path" | "query" | "header" | "cookie";
  /** 是否必需 */
  required?: boolean;
  /** 参数描述 */
  description?: string;
  /** 参数架构 */
  schema?: OpenApiSchemaObject;
  /** 示例值 */
  example?: any;
  /** 内容 */
  content?: Record<string, { schema?: OpenApiSchemaObject; example?: any }>;
}

/**
 * OpenAPI请求体对象
 */
export interface OpenApiRequestBodyObject {
  /** 请求体描述 */
  description?: string;
  /** 请求体内容 */
  content: Record<
    string,
    {
      schema?: OpenApiSchemaObject;
      example?: any;
    }
  >;
  /** 是否必需 */
  required?: boolean;
}

/**
 * OpenAPI响应对象
 */
export interface OpenApiResponseObject {
  /** 响应描述 */
  description?: string;
  /** 响应头 */
  headers?: Record<string, OpenApiHeaderObject>;
  /** 响应内容 */
  content?: Record<
    string,
    {
      schema?: OpenApiSchemaObject;
      example?: any;
    }
  >;
}

/**
 * OpenAPI头对象
 */
export interface OpenApiHeaderObject {
  /** 描述 */
  description?: string;
  /** 必需 */
  required?: boolean;
  /** Schema */
  schema?: OpenApiSchemaObject;
}

/**
 * OpenAPI Schema对象
 */
export interface OpenApiSchemaObject {
  /** 引用 */
  $ref?: string;
  /** 类型 */
  type?: string;
  /** 格式 */
  format?: string;
  /** 标题 */
  title?: string;
  /** 描述 */
  description?: string;
  /** 默认值 */
  default?: any;
  /** 多重类型 */
  oneOf?: OpenApiSchemaObject[];
  /** 全部类型 */
  allOf?: OpenApiSchemaObject[];
  /** 任一类型 */
  anyOf?: OpenApiSchemaObject[];
  /** 枚举值 */
  enum?: any[];
  /** 属性 */
  properties?: Record<string, OpenApiSchemaObject>;
  /** 必需属性 */
  required?: string[];
  /** 项目 (对于数组) */
  items?: OpenApiSchemaObject;
  /** 附加属性 */
  additionalProperties?: boolean | OpenApiSchemaObject;
  /** 最小值 */
  minimum?: number;
  /** 最大值 */
  maximum?: number;
  /** 长度相关 */
  minLength?: number;
  maxLength?: number;
  /** 模式 */
  pattern?: string;
  /** 是否为允许空值 */
  nullable?: boolean;
  /** 是否已废弃 */
  deprecated?: boolean;
  /** XML配置 */
  xml?: Record<string, any>;
  /** 示例 */
  examples?: Record<string, any>;
  example?: any;
}

/**
 * OpenAPI方法对象
 */
export interface OpenApiMethodObject {
  /** 操作ID */
  operationId?: string;
  /** 标签 */
  tags?: string[];
  /** 摘要 */
  summary?: string;
  /** 详细描述 */
  description?: string;
  /** 请求参数 */
  parameters?: OpenApiParameterObject[];
  /** 请求体 */
  requestBody?: OpenApiRequestBodyObject;
  /** 响应 */
  responses: Record<string, OpenApiResponseObject>;
  /** 安全要求 */
  security?: Array<Record<string, string[]>>;
  /** 废弃标志 */
  deprecated?: boolean;
  /** 服务器 */
  servers?: Array<{
    url: string;
    description?: string;
    variables?: Record<
      string,
      {
        default: string;
        enum?: string[];
        description?: string;
      }
    >;
  }>;
}

/**
 * OpenAPI路径对象
 */
export interface OpenApiPathObject {
  get?: OpenApiMethodObject;
  post?: OpenApiMethodObject;
  put?: OpenApiMethodObject;
  delete?: OpenApiMethodObject;
  patch?: OpenApiMethodObject;
  parameters?: OpenApiParameterObject[];
  [key: string]: OpenApiMethodObject | OpenApiParameterObject[] | undefined;
}

/**
 * OpenAPI Components对象
 */
export interface OpenApiComponentsObject {
  /** Schema定义 */
  schemas?: Record<string, OpenApiSchemaObject>;
  /** 响应定义 */
  responses?: Record<string, OpenApiResponseObject>;
  /** 参数定义 */
  parameters?: Record<string, OpenApiParameterObject>;
  /** 请求体定义 */
  requestBodies?: Record<string, OpenApiRequestBodyObject>;
  /** 示例定义 */
  examples?: Record<string, any>;
  /** 头定义 */
  headers?: Record<string, OpenApiHeaderObject>;
  /** 链接定义 */
  links?: Record<string, any>;
  /** 回调定义 */
  callbacks?: Record<string, any>;
}

/**
 * OpenAPI文档
 */
export interface OpenApiDocument {
  /** OpenAPI版本 */
  openapi: string;
  /** API信息 */
  info: {
    title: string;
    description?: string;
    version: string;
    termsOfService?: string;
    contact?: {
      name?: string;
      url?: string;
      email?: string;
    };
    license?: {
      name: string;
      url?: string;
    };
  };
  /** 服务器信息 */
  servers?: Array<{
    url: string;
    description?: string;
    variables?: Record<
      string,
      {
        default: string;
        enum?: string[];
        description?: string;
      }
    >;
  }>;
  /** API路径 */
  paths: Record<string, OpenApiPathObject>;
  /** 组件定义 */
  components?: OpenApiComponentsObject;
  /** API标签 */
  tags?: Array<{
    name: string;
    description?: string;
    externalDocs?: {
      description?: string;
      url: string;
    };
  }>;
  /** 外部文档 */
  externalDocs?: {
    description?: string;
    url: string;
  };
  /** 安全定义 */
  security?: Array<Record<string, string[]>>;
}
