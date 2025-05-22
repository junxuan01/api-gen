// src/utils/schema-generator.ts
// 从 OpenAPI 文档生成有效的 TypeScript 类型定义
// 这是一个用于 Bun 环境的备用解决方案

import type { OpenApiDocument } from "../types/openapi.js";

/**
 * 从 OpenAPI 文档生成基本的 TypeScript 类型定义
 * 当 openapi-typescript 库在 Bun 环境中不能正常工作时使用
 */
export function generateBasicTypes(document: OpenApiDocument): string {
  const types: string[] = [];

  // 添加顶级注释
  types.push(
    "// 手动生成的基本类型定义 - 由于 openapi-typescript 在 Bun 环境中的兼容性问题"
  );
  types.push("// 这些类型可能不完整，仅作为基本类型使用");

  // 定义顶层命名空间 - 与 openapi-typescript 生成的格式保持一致
  types.push("\nexport namespace components {");

  // 生成基本组件类型
  if (document.components?.schemas) {
    types.push("  export namespace schemas {");

    for (const [name, schema] of Object.entries(document.components.schemas)) {
      types.push(`    export interface ${name} {`);

      // 添加属性（如果有）
      if (schema.properties) {
        for (const [propName, propSchema] of Object.entries(
          schema.properties
        )) {
          const isRequired = schema.required?.includes(propName) || false;
          const optional = isRequired ? "" : "?";

          // 尝试确定属性类型
          const propType = determinePropertyType(propSchema, document);

          // 添加属性注释
          if (propSchema.description) {
            types.push(
              `      /** @description ${propSchema.description.replace(/\n/g, " ").replace(/\*\//g, "*\\/")} */`
            );
          }

          types.push(`      ${propName}${optional}: ${propType};`);
        }
      }

      types.push("    }");
    }

    types.push("  }");
  }

  types.push("}");

  // 添加路径定义
  types.push("\nexport namespace paths {");

  for (const [path, pathItem] of Object.entries(document.paths)) {
    // 路径变量替换为类型安全的变量
    const typeSafePath = path.replace(/{([^}]+)}/g, "{$1:string}");
    types.push(`  export namespace ${escapePathForTypeName(path)} {`);

    for (const [method, operation] of Object.entries(pathItem)) {
      if (!["get", "post", "put", "delete", "patch"].includes(method)) continue;

      const operationObj = operation as any;
      if (!operationObj) continue;

      const operationId =
        operationObj.operationId || `${method}${path.replace(/\W/g, "_")}`;

      types.push(`    export namespace ${method} {`);

      // 请求参数
      types.push("      export type RequestParams = {");

      // 路径参数
      if (operationObj.parameters?.some((p: any) => p.in === "path")) {
        const pathParams = operationObj.parameters.filter(
          (p: any) => p.in === "path"
        );
        types.push("        path: {");

        for (const param of pathParams) {
          // 添加参数注释
          if (param.description) {
            types.push(
              `          /** @description ${param.description.replace(/\n/g, " ").replace(/\*\//g, "*\\/")} */`
            );
          }

          const paramType = param.schema
            ? determinePropertyType(param.schema, document)
            : "string";
          types.push(
            `          ${param.name}${param.required === false ? "?" : ""}: ${paramType};`
          );
        }

        types.push("        };");
      } else {
        types.push("        path?: never;");
      }

      // 查询参数
      if (operationObj.parameters?.some((p: any) => p.in === "query")) {
        const queryParams = operationObj.parameters.filter(
          (p: any) => p.in === "query"
        );
        types.push("        query: {");

        for (const param of queryParams) {
          // 添加参数注释
          if (param.description) {
            types.push(
              `          /** @description ${param.description.replace(/\n/g, " ").replace(/\*\//g, "*\\/")} */`
            );
          }

          const paramType = param.schema
            ? determinePropertyType(param.schema, document)
            : "any";
          types.push(
            `          ${param.name}${param.required === false ? "?" : ""}: ${paramType};`
          );
        }

        types.push("        };");
      } else {
        types.push("        query?: never;");
      }

      // 请求体
      if (operationObj.requestBody) {
        types.push("        body: {");

        if (operationObj.requestBody.content) {
          // 获取内容类型
          const contentTypes = Object.keys(operationObj.requestBody.content);

          for (const contentType of contentTypes) {
            const content = operationObj.requestBody.content[contentType];

            if (content.schema) {
              if (content.schema.$ref) {
                // 处理引用
                const refType = getRefTypeName(content.schema.$ref);
                types.push(`          /** @contentType ${contentType} */`);
                types.push(`          content: components.schemas.${refType};`);
              } else {
                // 内联模式
                types.push(`          /** @contentType ${contentType} */`);
                types.push(
                  `          content: ${determinePropertyType(content.schema, document)};`
                );
              }
              break; // 使用第一个内容类型
            }
          }
        } else {
          types.push("          [key: string]: any;");
        }

        types.push("        };");
      } else {
        types.push("        body?: never;");
      }

      types.push("      };");

      // 响应
      types.push("      export type Responses = {");

      // 处理响应
      let hasResponse = false;
      for (const [statusCode, response] of Object.entries(
        operationObj.responses || {}
      )) {
        if (statusCode.startsWith("2")) {
          // 成功响应
          hasResponse = true;
          types.push(`        /** 状态码 ${statusCode} */`);

          if (response.content) {
            // 获取内容类型
            const contentTypes = Object.keys(response.content);

            for (const contentType of contentTypes) {
              const content = response.content[contentType];

              if (content.schema) {
                if (content.schema.$ref) {
                  // 处理引用
                  const refType = getRefTypeName(content.schema.$ref);
                  types.push(`        /** @contentType ${contentType} */`);
                  types.push(
                    `        [${statusCode}]: components.schemas.${refType};`
                  );
                } else {
                  // 内联模式
                  types.push(`        /** @contentType ${contentType} */`);
                  types.push(
                    `        [${statusCode}]: ${determinePropertyType(content.schema, document)};`
                  );
                }
                break; // 使用第一个内容类型
              }
            }
          } else {
            types.push(`        [${statusCode}]: any;`);
          }
        }
      }

      if (!hasResponse) {
        types.push("        /** 默认响应 */");
        types.push("        [statusCode: number]: any;");
      }

      types.push("      };");

      types.push("    }");
    }

    types.push("  }");
  }

  types.push("}");

  return types.join("\n");
}

/**
 * 转义路径字符串以创建有效的 TypeScript 类型名称
 */
function escapePathForTypeName(path: string): string {
  return (
    path
      .replace(/\/+/g, "_") // 将斜杠替换为下划线
      .replace(/^_/, "") // 删除前导下划线
      .replace(/{([^}]+)}/g, "$$$1") // 将 {param} 替换为 $param
      .replace(/[^a-zA-Z0-9_$]/g, "_") || // 将其他特殊字符替换为下划线
    "_root"
  ); // 确保结果不为空
}

/**
 * 从引用字符串中提取类型名称
 */
function getRefTypeName(ref: string): string {
  // 假设引用格式为 '#/components/schemas/TypeName'
  const parts = ref.split("/");
  return parts[parts.length - 1];
}

/**
 * 确定属性的 TypeScript 类型
 */
function determinePropertyType(schema: any, document: OpenApiDocument): string {
  if (!schema) return "any";

  // 引用
  if (schema.$ref) {
    const refType = getRefTypeName(schema.$ref);
    return `components.schemas.${refType}`;
  }

  // 组合类型
  if (schema.allOf) {
    const types = schema.allOf.map((item: any) =>
      determinePropertyType(item, document)
    );
    return types.join(" & ");
  }

  if (schema.oneOf || schema.anyOf) {
    const items = schema.oneOf || schema.anyOf;
    const types = items.map((item: any) =>
      determinePropertyType(item, document)
    );
    return types.join(" | ");
  }

  // 数组
  if (schema.type === "array" && schema.items) {
    const itemType = determinePropertyType(schema.items, document);
    return `Array<${itemType}>`;
  }

  // 枚举类型
  if (schema.enum && schema.enum.length > 0) {
    return schema.enum
      .map((item: any) => {
        if (typeof item === "string") return `'${item}'`;
        return String(item);
      })
      .join(" | ");
  }

  // 对象类型
  if (schema.type === "object") {
    if (schema.properties) {
      const props = Object.entries(schema.properties).map(
        ([name, propSchema]: [string, any]) => {
          const isRequired = schema.required?.includes(name) || false;
          const optional = isRequired ? "" : "?";
          const propType = determinePropertyType(propSchema, document);
          return `${name}${optional}: ${propType}`;
        }
      );
      return `{ ${props.join("; ")} }`;
    }

    // 动态属性
    if (schema.additionalProperties) {
      if (typeof schema.additionalProperties === "boolean") {
        return "Record<string, any>";
      }
      const valueType = determinePropertyType(
        schema.additionalProperties,
        document
      );
      return `Record<string, ${valueType}>`;
    }

    return "Record<string, any>";
  }

  // 基本类型
  switch (schema.type) {
    case "string":
      if (schema.format === "date" || schema.format === "date-time") {
        return "string"; // 或 'Date'，取决于您的偏好
      }
      if (schema.format === "binary") {
        return "Blob";
      }
      return "string";

    case "number":
    case "integer":
      if (schema.format === "int64") {
        return "number"; // 或 'bigint'，但可能会引起兼容性问题
      }
      return "number";

    case "boolean":
      return "boolean";

    case "null":
      return "null";

    default:
      return "any";
  }
}
