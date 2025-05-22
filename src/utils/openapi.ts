import axios from "axios";
import fs from "fs-extra";
import path from "path";
import type {
  OpenApiDocument,
  ApiPathInfo,
  ApiGroupInfo,
  OpenApiMethodObject,
  OpenApiSchemaObject,
  OpenApiParameterObject,
  OpenApiResponseObject,
} from "../types/openapi.js";
import openapiTS from "openapi-typescript";
import { writeFile } from "./file.js";
import type { Config } from "../config/index.js";

/**
 * 获取OpenAPI文档
 *
 * @param url OpenAPI文档URL
 * @returns OpenAPI文档对象
 */
export async function fetchOpenApiDocument(
  url: string
): Promise<OpenApiDocument> {
  try {
    const response = await axios.get<OpenApiDocument>(url);
    return response.data;
  } catch (error) {
    console.error("获取OpenAPI文档失败:", error);
    throw new Error(`获取OpenAPI文档失败: ${error}`);
  }
}

/**
 * 规范化标签名称，确保它是一个有效的文件夹名和变量名
 *
 * @param tag 原始标签名
 * @returns 规范化后的标签名
 */
function normalizeTagName(tag: string): string {
  // 如果标签名为空或者只包含特殊字符，使用默认值
  if (!tag || !tag.trim() || !tag.match(/[a-zA-Z0-9]/)) {
    return "defaultGroup";
  }

  // 移除或替换无效字符
  return tag.trim();
}

/**
 * 解析OpenAPI文档中的路径，并按标签分组
 *
 * @param document OpenAPI文档
 * @returns 按标签分组的API信息
 */
export function parseApiGroups(document: OpenApiDocument): ApiGroupInfo[] {
  const groupMap = new Map<string, ApiPathInfo[]>();
  const processedOperationIds = new Set<string>(); // 跟踪已处理的operationId

  // 遍历所有路径
  for (const [path, pathObj] of Object.entries(document.paths)) {
    // 遍历路径下的所有HTTP方法
    for (const [method, methodObjRaw] of Object.entries(pathObj)) {
      if (["get", "post", "put", "delete", "patch"].includes(method)) {
        const methodObj = methodObjRaw as OpenApiMethodObject;

        // 生成operationId（如果未提供）
        const operationId =
          methodObj.operationId || `${method}${path.replace(/[^\w]/g, "_")}`;

        // 如果已经处理过相同的operationId，则跳过
        if (processedOperationIds.has(operationId)) {
          continue;
        }
        processedOperationIds.add(operationId);

        // 规范化标签
        let tags = methodObj.tags?.map(normalizeTagName) || ["defaultGroup"];
        // 如果标签为空数组，使用默认分组
        if (tags.length === 0) {
          tags = ["defaultGroup"];
        }

        const apiInfo: ApiPathInfo = {
          path,
          method,
          tags,
          summary: methodObj.summary || "",
          description: methodObj.description || "",
          operationId,
          parameters: methodObj.parameters,
          requestBody: methodObj.requestBody,
          responses: methodObj.responses,
        };

        // 将API按每个标签进行分组（一个API可能属于多个分组）
        for (const tag of apiInfo.tags) {
          if (!groupMap.has(tag)) {
            groupMap.set(tag, []);
          }
          groupMap.get(tag)?.push(apiInfo);
        }
      }
    }
  }

  // 转换Map为数组
  return Array.from(groupMap.entries()).map(([name, apis]) => ({
    name,
    apis,
  }));
}

/**
 * 生成TypeScript类型定义
 *
 * @param document OpenAPI文档
 * @returns 生成的类型定义和各个DTO的定义
 */
export async function generateTypeDefinitions(
  document: OpenApiDocument
): Promise<{ schema: string; dtos: Record<string, string> }> {
  try {
    // 从对象生成类型定义
    const schemaNodes = await openapiTS(document as any);
    const schema = schemaNodes.toString();

    // 提取DTO定义
    const dtoDefinitions = extractResponseDTOs(document);

    // 处理DTO定义，并按名称分类
    const dtos: Record<string, string> = {};
    for (const dto of dtoDefinitions) {
      // 提取DTO名称（格式：export interface XxxDto { ... }）
      const match = dto.match(/export\s+interface\s+(\w+)/);
      if (match && match[1]) {
        const dtoName = match[1];
        dtos[dtoName] = dto;
      }
    }

    return {
      schema,
      dtos,
    };
  } catch (error) {
    console.error("生成TypeScript类型定义失败:", error);
    throw new Error(`生成TypeScript类型定义失败: ${error}`);
  }
}

/**
 * 为指定API组生成DTO索引文件
 *
 * @param groupName API组名称
 * @param dtos 该组使用的DTO列表
 * @param outputDir 输出目录
 * @param config 配置
 */
export async function generateDtoIndexFile(
  groupName: string,
  dtos: string[],
  outputDir: string,
  config: Config
): Promise<void> {
  // 规范化分组名称
  const folderName = groupName.toLowerCase().replace(/[^\w-]/g, "_");
  const safeFolderName = folderName || "default_group";

  // 确定输出路径
  const indexPath = path.join(outputDir, "dtos", safeFolderName, "index.ts");

  // 生成导出语句
  const exports = dtos
    .map((dtoName) => `export * from './${dtoName}';`)
    .join("\n");

  // 写入文件
  await writeFile(indexPath, exports, config);
}

/**
 * 生成DTO文件
 *
 * @param dtos DTO定义映射表
 * @param groups API分组信息
 * @param outputDir 输出目录
 * @param config 配置
 */
export async function generateDtoFiles(
  dtos: Record<string, string>,
  groups: ApiGroupInfo[],
  outputDir: string,
  config: Config
): Promise<void> {
  // 创建DTO到分组的映射
  const dtoToGroupMap = new Map<string, Set<string>>();

  // 遍历所有分组和API，记录每个DTO属于哪些分组
  for (const group of groups) {
    for (const api of group.apis) {
      const { operationId } = api;
      const dtoNames = new Set<string>();

      // 收集API使用的所有DTO
      if (api.parameters?.some((p) => p.in === "path")) {
        dtoNames.add(`${operationId}PathParams`);
      }

      if (api.parameters?.some((p) => p.in === "query")) {
        dtoNames.add(`${operationId}QueryParams`);
      }

      if (api.requestBody) {
        dtoNames.add(`${operationId}RequestBody`);
      }

      dtoNames.add(`${operationId}Response`);

      // 更新映射
      for (const dtoName of dtoNames) {
        if (!dtoToGroupMap.has(dtoName)) {
          dtoToGroupMap.set(dtoName, new Set());
        }
        dtoToGroupMap.get(dtoName)?.add(group.name);
      }
    }
  }

  // 记录每个分组使用的DTO
  const groupDtos = new Map<string, string[]>();

  // 生成DTO文件
  for (const [dtoName, content] of Object.entries(dtos)) {
    // 获取DTO所属分组
    const groups = dtoToGroupMap.get(dtoName);

    if (!groups || groups.size === 0) {
      // 如果DTO不属于任何分组，放在通用DTO目录
      const dtoFilePath = path.join(
        outputDir,
        "dtos",
        "common",
        `${dtoName}.ts`
      );
      await fs.ensureDir(path.dirname(dtoFilePath));
      await writeFile(dtoFilePath, content, config);

      // 更新通用分组的DTO列表
      if (!groupDtos.has("common")) {
        groupDtos.set("common", []);
      }
      groupDtos.get("common")?.push(dtoName);
    } else {
      // 如果DTO属于特定分组，为每个分组生成一个副本
      for (const groupName of groups) {
        // 规范化分组名称
        const folderName = groupName.toLowerCase().replace(/[^\w-]/g, "_");
        const safeFolderName = folderName || "default_group";

        // 创建DTO文件
        const dtoFilePath = path.join(
          outputDir,
          "dtos",
          safeFolderName,
          `${dtoName}.ts`
        );
        await fs.ensureDir(path.dirname(dtoFilePath));
        await writeFile(dtoFilePath, content, config);

        // 更新分组的DTO列表
        if (!groupDtos.has(safeFolderName)) {
          groupDtos.set(safeFolderName, []);
        }
        groupDtos.get(safeFolderName)?.push(dtoName);
      }
    }
  }

  // 为每个分组生成索引文件
  for (const [groupName, dtoList] of groupDtos.entries()) {
    await generateDtoIndexFile(groupName, dtoList, outputDir, config);
  }

  // 生成总索引文件
  const rootIndexPath = path.join(outputDir, "dtos", "index.ts");
  const exports = Array.from(groupDtos.keys())
    .map((group) => `export * from './${group}';`)
    .join("\n");

  await writeFile(rootIndexPath, exports, config);
}

/**
 * 从OpenAPI文档中提取响应DTO
 *
 * @param document OpenAPI文档
 * @returns DTO类型定义数组
 */
function extractResponseDTOs(document: OpenApiDocument): string[] {
  const dtos: string[] = [];
  const processedDTOs = new Set<string>(); // 避免重复处理

  // 提取components中的schemas
  if (document.components?.schemas) {
    for (const [schemaName, schema] of Object.entries(
      document.components.schemas
    )) {
      // 生成Schema的DTO定义
      const dtoName = schemaName.replace(/[^\w]/g, "");
      if (!processedDTOs.has(dtoName)) {
        processedDTOs.add(dtoName);

        let dtoDefinition = `export interface ${dtoName} {\n`;
        if (schema.type === "object" && schema.properties) {
          for (const [propName, propSchema] of Object.entries(
            schema.properties as Record<string, any>
          )) {
            const required =
              schema.required && schema.required.includes(propName);
            const optionalMark = required ? "" : "?";

            // 添加属性注释
            if (propSchema.description) {
              dtoDefinition += `  /** @description ${propSchema.description.replace(/\*\//g, "*\\/")} */\n`;
            }

            // 处理属性类型
            const propType = getPropertyType(propSchema);
            dtoDefinition += `  ${propName}${optionalMark}: ${propType};\n`;
          }
        } else {
          dtoDefinition += processSchema(schema as any, "  ");
        }
        dtoDefinition += "}";
        dtos.push(dtoDefinition);
      }
    }
  }

  // 遍历所有路径
  for (const [path, pathObj] of Object.entries(document.paths)) {
    // 遍历路径下的所有HTTP方法
    for (const [method, methodObjRaw] of Object.entries(pathObj)) {
      if (["get", "post", "put", "delete", "patch"].includes(method)) {
        const methodObj = methodObjRaw as OpenApiMethodObject;

        const operationId =
          methodObj.operationId || `${method}${path.replace(/[^\w]/g, "_")}`;

        // 处理请求参数
        if (methodObj.parameters && methodObj.parameters.length > 0) {
          // 路径参数
          const pathParams = methodObj.parameters.filter(
            (p) => p.in === "path"
          );
          if (pathParams.length > 0) {
            const dtoName = `${operationId}PathParams`;
            if (!processedDTOs.has(dtoName)) {
              processedDTOs.add(dtoName);

              let dtoDefinition = `export interface ${dtoName} {\n`;
              for (const param of pathParams) {
                if (param.description) {
                  dtoDefinition += `  /** @description ${param.description} */\n`;
                }
                dtoDefinition += `  ${param.name}${param.required === false ? "?" : ""}: ${getPropertyType(param.schema)};\n`;
              }
              dtoDefinition += "}";
              dtos.push(dtoDefinition);
            }
          }

          // 查询参数
          const queryParams = methodObj.parameters.filter(
            (p) => p.in === "query"
          );
          if (queryParams.length > 0) {
            const dtoName = `${operationId}QueryParams`;
            if (!processedDTOs.has(dtoName)) {
              processedDTOs.add(dtoName);

              let dtoDefinition = `export interface ${dtoName} {\n`;
              for (const param of queryParams) {
                if (param.description) {
                  dtoDefinition += `  /** @description ${param.description} */\n`;
                }
                dtoDefinition += `  ${param.name}${param.required === false ? "?" : ""}: ${getPropertyType(param.schema)};\n`;
              }
              dtoDefinition += "}";
              dtos.push(dtoDefinition);
            }
          }
        }

        // 处理请求体
        if (methodObj.requestBody) {
          const dtoName = `${operationId}RequestBody`;
          if (!processedDTOs.has(dtoName)) {
            processedDTOs.add(dtoName);

            let dtoDefinition = `export interface ${dtoName} {\n`;

            // 处理请求体内容
            for (const [contentType, content] of Object.entries(
              methodObj.requestBody.content
            )) {
              if (content.schema) {
                // 检查是否是直接引用
                if (content.schema.$ref) {
                  const refType = content.schema.$ref.split("/").pop() || "any";
                  const safeRefType = refType.replace(/[^\w]/g, "");
                  dtoDefinition += `  /** @description 引用自 ${content.schema.$ref} */\n`;
                  dtoDefinition += `  ${safeRefType ? safeRefType : "data"}: ${safeRefType};\n`;
                } else {
                  dtoDefinition += processSchema(content.schema, "  ");
                }
              }
            }

            dtoDefinition += "}";
            dtos.push(dtoDefinition);
          }
        }

        // 处理响应
        for (const [statusCode, response] of Object.entries(
          methodObj.responses
        )) {
          // 只处理成功的响应 (2xx)
          if (statusCode.startsWith("2") && response.content) {
            const dtoName = `${operationId}Response`;
            if (!processedDTOs.has(dtoName)) {
              processedDTOs.add(dtoName);

              let dtoDefinition = `export interface ${dtoName} {\n`;

              // 处理响应内容
              for (const [contentType, content] of Object.entries(
                response.content
              )) {
                if (content.schema) {
                  // 检查是否是直接引用
                  if (content.schema.$ref) {
                    const refType =
                      content.schema.$ref.split("/").pop() || "any";
                    const safeRefType = refType.replace(/[^\w]/g, "");
                    dtoDefinition += `  /** @description 引用自 ${content.schema.$ref} */\n`;
                    dtoDefinition += `  ${safeRefType ? safeRefType : "data"}: ${safeRefType};\n`;
                  } else {
                    dtoDefinition += processSchema(content.schema, "  ");
                  }
                }
              }

              dtoDefinition += "}";
              dtos.push(dtoDefinition);
            }
          }
        }
      }
    }
  }

  return dtos;
}

/**
 * 处理Schema，生成TypeScript类型
 *
 * @param schema OpenAPI Schema
 * @param indent 缩进
 * @returns TypeScript类型定义
 */
function processSchema(schema: any, indent: string = ""): string {
  let result = "";

  try {
    // 如果是引用其他Schema
    if (schema.$ref) {
      // 从引用中提取类型名称
      const parts = schema.$ref.split("/");
      const refType = parts[parts.length - 1];

      // 使用正确的引用类型
      // 对于DTO文件，需要在内部使用正确的属性名称
      const safeRefType = refType.replace(/[^\w]/g, "");
      if (safeRefType) {
        return `${indent}/** 引用自: ${schema.$ref} */\n${indent}${safeRefType}: ${safeRefType};\n`;
      } else {
        return `${indent}/** 无法解析的引用: ${schema.$ref} */\n${indent}[key: string]: any;\n`;
      }
    }

    // 处理anyOf、oneOf和allOf
    if (schema.anyOf) {
      // 使用联合类型表示anyOf
      const types = schema.anyOf
        .map((s: any) => getPropertyType(s))
        .join(" | ");
      result += `${indent}/** anyOf类型 */\n${indent}value: ${types};\n`;
      return result;
    }

    if (schema.oneOf) {
      // 也使用联合类型表示oneOf
      const types = schema.oneOf
        .map((s: any) => getPropertyType(s))
        .join(" | ");
      result += `${indent}/** oneOf类型 */\n${indent}value: ${types};\n`;
      return result;
    }

    if (schema.allOf) {
      // allOf表示类型的组合（交叉类型）
      result += `${indent}/** allOf - 组合多个类型 */\n`;
      for (const subSchema of schema.allOf) {
        result += processSchema(subSchema, indent);
      }
      return result;
    }

    // 如果有properties
    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(
        schema.properties as Record<string, any>
      )) {
        const required = schema.required && schema.required.includes(propName);
        const optionalMark = required ? "" : "?";

        // 添加属性注释
        if (propSchema.description) {
          result += `${indent}/** @description ${propSchema.description.replace(/\*\//g, "*\\/")} */\n`;
        }

        // 处理属性类型
        const propType = getPropertyType(propSchema);
        result += `${indent}${propName}${optionalMark}: ${propType};\n`;
      }
    } else if (schema.type === "array" && schema.items) {
      // 如果是数组，直接使用数组类型
      const itemType = getPropertyType(schema.items);
      result += `${indent}/** 数组类型 */\n`;
      result += `${indent}items: ${itemType}[];\n`;
    } else if (schema.type === "object" && schema.additionalProperties) {
      // 如果是对象但没有固定属性，只有additionalProperties
      const valueType =
        typeof schema.additionalProperties === "boolean"
          ? "any"
          : getPropertyType(schema.additionalProperties);

      result += `${indent}/** 动态键值对象 */\n`;
      result += `${indent}[key: string]: ${valueType};\n`;
    } else if (schema.type) {
      // 如果只有type而没有其他定义
      const tsType = mapOpenApiTypeToTs(schema.type, schema.format);
      if (schema.enum) {
        // 如果有枚举值
        result += `${indent}/** 枚举类型: ${schema.enum.join(" | ")} */\n`;
        const enumValues = schema.enum
          .map((v: any) => (typeof v === "string" ? `'${v}'` : v))
          .join(" | ");
        result += `${indent}value: ${enumValues};\n`;
      } else {
        // 基本类型
        result += `${indent}/** ${schema.type}类型 */\n`;
        result += `${indent}value: ${tsType};\n`;
      }
    } else {
      // 兜底处理 - 未知结构
      result += `${indent}/** 未能解析的类型 */\n`;
      result += `${indent}[key: string]: any;\n`;
    }
  } catch (error) {
    console.warn("处理Schema时出错:", error);
    result += `${indent}/** 解析错误 */\n`;
    result += `${indent}[key: string]: any; // 解析错误\n`;
  }

  return result;
}

/**
 * 将OpenAPI类型映射为TypeScript类型
 *
 * @param openApiType OpenAPI类型
 * @param format 格式说明
 * @returns TypeScript类型
 */
function mapOpenApiTypeToTs(openApiType: string, format?: string): string {
  switch (openApiType) {
    case "string":
      if (format === "date" || format === "date-time") {
        return "string"; // 可以根据需要改为 Date
      }
      if (format === "binary" || format === "byte") {
        return "Blob"; // 二进制数据
      }
      return "string";

    case "number":
    case "integer":
      if (format === "int64") {
        return "bigint"; // 对于大整数，可以使用bigint
      }
      return "number";

    case "boolean":
      return "boolean";

    case "array":
      return "any[]"; // 这应该在外部通过items进行处理

    case "object":
      return "Record<string, any>";

    case "null":
      return "null";

    default:
      return "any";
  }
}

/**
 * 获取属性的TypeScript类型
 *
 * @param schema 属性Schema
 * @returns TypeScript类型
 */
function getPropertyType(schema: any): string {
  if (!schema) return "any";

  // 引用类型
  if (schema.$ref) {
    const refType = schema.$ref.split("/").pop();
    return refType || "any";
  }

  // 处理组合类型
  if (schema.anyOf || schema.oneOf) {
    const types = (schema.anyOf || schema.oneOf).map((s: any) =>
      getPropertyType(s)
    );
    return types.join(" | ");
  }

  if (schema.allOf) {
    const types = schema.allOf.map((s: any) => getPropertyType(s));
    return types.join(" & ");
  }

  // 处理nullable
  let nullableStr = "";
  if (schema.nullable) {
    nullableStr = " | null";
  }

  // 根据OpenAPI类型映射到TypeScript类型
  switch (schema.type) {
    case "string":
      // 处理特定格式的字符串
      if (schema.format === "date-time" || schema.format === "date") {
        return "string" + nullableStr; // 或者可以是 Date
      }
      // 处理枚举
      if (schema.enum) {
        const enumValues = schema.enum
          .map((v: any) => (typeof v === "string" ? `'${v}'` : v))
          .join(" | ");
        return enumValues + nullableStr;
      }
      return "string" + nullableStr;

    case "integer":
    case "number":
      return "number" + nullableStr;

    case "boolean":
      return "boolean" + nullableStr;

    case "array":
      // 递归处理数组项的类型
      const itemType = schema.items ? getPropertyType(schema.items) : "any";
      return `${itemType}[]${nullableStr}`;

    case "object":
      // 如果有附加属性定义
      if (schema.additionalProperties) {
        if (typeof schema.additionalProperties === "boolean") {
          return `Record<string, any>${nullableStr}`;
        } else {
          const valueType = getPropertyType(schema.additionalProperties);
          return `Record<string, ${valueType}>${nullableStr}`;
        }
      }
      // 对于简单的情况，返回Record
      return `Record<string, any>${nullableStr}`;

    default:
      return "any" + nullableStr;
  }
}
