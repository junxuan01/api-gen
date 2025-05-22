import fs from "fs-extra";
import path from "path";
import { format } from "prettier";
import type { Config } from "../config/index.js";
import type { ApiGroupInfo, ApiPathInfo } from "../types/openapi.js";
import { writeFile } from "./file.js";

/**
 * 生成API请求函数
 *
 * @param apiInfo API信息
 * @returns 生成的请求函数代码
 */
export function generateRequestFunction(apiInfo: ApiPathInfo): string {
  const { path: apiPath, method, summary, operationId } = apiInfo;
  const functionName = operationId;

  // 提取请求参数
  const hasParams = apiInfo.parameters?.some((p) => p.in === "path");
  const hasQuery = apiInfo.parameters?.some((p) => p.in === "query");
  const hasBody = !!apiInfo.requestBody;

  // 根据接口信息准备模板变量
  const templateVars = {
    path: apiPath,
    method,
    summary: summary || "",
    description: apiInfo.description || "",
    operationId,
    functionName,
    hasParams,
    hasQuery,
    hasBody,
    urlTemplate: apiPath.replace(/{([^}]+)}/g, "${params.$1}"),
    responseType: getResponseType(apiInfo),
  };

  // 简化的模板渲染，实际项目中可能使用更复杂的模板引擎
  let functionCode = `
/**
 * ${templateVars.summary}
 * ${templateVars.description ? `\n * @description ${templateVars.description}` : ""}
 * @operationId ${templateVars.operationId}
 */
export async function ${templateVars.functionName}(`;

  // 添加函数参数
  if (hasParams) {
    functionCode += `params: ${operationId}PathParams, `;
  }
  if (hasQuery) {
    functionCode += `query: ${operationId}QueryParams, `;
  }
  if (hasBody) {
    functionCode += `body: ${operationId}RequestBody, `;
  }

  functionCode += `options?: RequestOptions): Promise<${templateVars.responseType}> {
  return request({
    method: '${templateVars.method}',
    url: ${hasParams ? `\`${templateVars.urlTemplate}\`` : `'${templateVars.path}'`},
    ${hasQuery ? "params: query," : ""}
    ${hasBody ? "data: body," : ""}
    ...options,
  });
}`;

  return functionCode;
}

/**
 * 获取请求体类型
 *
 * @param apiInfo API信息
 * @returns 请求体类型名称
 */
function getRequestBodyType(apiInfo: ApiPathInfo): string {
  if (!apiInfo.requestBody) return "any";

  // 直接使用DTO命名约定，使用操作ID+RequestBody作为请求体类型
  return `${apiInfo.operationId}RequestBody`;
}

/**
 * 获取响应类型
 *
 * @param apiInfo API信息
 * @returns 响应类型名称
 */
function getResponseType(apiInfo: ApiPathInfo): string {
  const successResponse =
    apiInfo.responses["200"] ||
    apiInfo.responses["201"] ||
    Object.values(apiInfo.responses)[0];
  if (!successResponse) return "any";

  // 直接使用DTO命名约定，使用操作ID+Response作为响应类型
  return `${apiInfo.operationId}Response`;
}

/**
 * 生成给定分组的API文件
 *
 * @param group API分组信息
 * @param outputDir 输出目录
 * @param config 配置
 */
export async function generateGroupFile(
  group: ApiGroupInfo,
  outputDir: string,
  config: Config
): Promise<void> {
  // 规范化分组名称为文件夹名
  // 将不合法字符替换为下划线，确保生成合法的文件夹名称
  const folderName = group.name.toLowerCase().replace(/[^\w-]/g, "_");

  // 确保文件夹名不为空或无效
  const safeFolderName = folderName || "default_group";

  // 创建分组对应的目录
  const groupDirPath = path.join(outputDir, "apis", safeFolderName);
  await fs.ensureDir(groupDirPath);

  // 同时创建DTO目录以匹配相同的结构
  const dtoDirPath = path.join(outputDir, "dtos", safeFolderName);
  await fs.ensureDir(dtoDirPath);

  // 跟踪已经处理的API，避免重复
  const processedOperationIds = new Set<string>();

  // 为每个API生成单独的文件
  for (const api of group.apis) {
    const { operationId } = api;

    // 如果这个operationId已经处理过，跳过
    if (processedOperationIds.has(operationId)) {
      continue;
    }
    processedOperationIds.add(operationId);

    // 收集需要导入的类型
    const typeImports = new Set<string>();

    // 检查参数类型
    if (api.parameters?.some((p) => p.in === "path")) {
      typeImports.add(`${operationId}PathParams`);
    }

    if (api.parameters?.some((p) => p.in === "query")) {
      typeImports.add(`${operationId}QueryParams`);
    }

    // 检查请求体类型
    if (api.requestBody) {
      typeImports.add(`${operationId}RequestBody`);
    }

    // 检查响应类型
    typeImports.add(`${operationId}Response`);

    // 构建导入路径 - 这里使用相对路径
    const relativePath = path.relative(groupDirPath, path.join(dtoDirPath));

    // 构建API文件内容
    const fileContent = `import { request, RequestOptions } from '../../../utils/request';
import { 
  // 导入DTO类型
${Array.from(typeImports)
  .map((type) => `  ${type}`)
  .join(",\n")}
} from '${relativePath.startsWith(".") ? relativePath : "./" + relativePath}';

${generateRequestFunction(api)}
`;

    // 将API文件写入对应的目录
    const apiFilePath = path.join(groupDirPath, `${operationId}.ts`);

    // 写入文件
    await fs.ensureDir(path.dirname(apiFilePath));
    let content = fileContent;

    // 如果需要格式化
    if (config.prettierFormat) {
      try {
        content = await format(fileContent, {
          parser: "typescript",
          singleQuote: true,
          trailingComma: "es5",
          printWidth: 100,
        });
      } catch (error) {
        console.warn("格式化代码失败，使用原始内容", error);
      }
    }

    await fs.writeFile(apiFilePath, content, "utf-8");
  }

  // 生成分组的索引文件
  await generateGroupIndexFile(
    group,
    processedOperationIds,
    groupDirPath,
    config
  );
}

/**
 * 生成分组索引文件
 *
 * @param group API分组信息
 * @param processedOperationIds 已处理的操作ID集合
 * @param groupDirPath 分组目录路径
 * @param config 配置
 */
async function generateGroupIndexFile(
  group: ApiGroupInfo,
  processedOperationIds: Set<string>,
  groupDirPath: string,
  config: Config
): Promise<void> {
  // 构建导入语句
  const imports: string[] = [];
  const exports: string[] = [];

  // 遍历所有已处理的operationId
  for (const operationId of processedOperationIds) {
    imports.push(`import { ${operationId} } from './${operationId}';`);
    exports.push(operationId);
  }

  // 构建索引文件内容
  const indexContent = `// ${group.name} API索引文件
${imports.join("\n")}

export {
  ${exports.join(",\n  ")}
};
`;

  // 写入索引文件
  const indexFilePath = path.join(groupDirPath, "index.ts");
  await writeFile(indexFilePath, indexContent, config);
}

/**
 * 生成根索引文件，导出所有API分组
 *
 * @param groups API分组信息列表
 * @param outputDir 输出目录
 * @param config 配置
 */
export async function generateIndexFile(
  groups: ApiGroupInfo[],
  outputDir: string,
  config: Config
): Promise<void> {
  if (!config.generateIndex) return;

  const apisDir = path.join(outputDir, "apis");
  const filePath = path.join(apisDir, "index.ts");

  // 生成每个分组的导入语句
  const imports = groups
    .map((group) => {
      // 使用更安全的文件名转换
      const fileName = group.name.toLowerCase().replace(/[^\w-]/g, "_");
      const safeFileName = fileName || "default_group";
      const moduleName = safeName(group.name);
      // 确保模块名不为空
      return moduleName
        ? `import * as ${moduleName} from './${safeFileName}';`
        : `// 跳过无效名称的分组: ${group.name}`;
    })
    .join("\n");

  // 生成导出语句
  const validGroups = groups
    .map((group) => {
      const name = safeName(group.name);
      return name ? name : null;
    })
    .filter(Boolean);

  const exports =
    validGroups.length > 0
      ? `export {\n  ${validGroups.join(",\n  ")},\n};`
      : "// 没有有效的分组需要导出";

  // 构建完整的文件内容
  const fileContent = `${imports}\n\n${exports}\n`;

  // 写入文件
  let content = fileContent;

  // 如果需要格式化
  if (config.prettierFormat) {
    try {
      content = await format(fileContent, {
        parser: "typescript",
        singleQuote: true,
        trailingComma: "es5",
        printWidth: 100,
      });
    } catch (error) {
      console.warn("格式化代码失败，使用原始内容", error);
    }
  }

  await fs.writeFile(filePath, content, "utf-8");

  // 生成根目录索引文件，导出所有内容
  const rootIndexPath = path.join(outputDir, "index.ts");
  const rootIndexContent = `export * from './apis';
export * from './types';
export { request, RequestOptions } from './utils/request';
`;

  await writeFile(rootIndexPath, rootIndexContent, config);
}

/**
 * 将分组名转换为安全的变量名
 *
 * @param name 分组名
 * @returns 安全的变量名，如果无法生成有效变量名则返回空字符串
 */
function safeName(name: string): string {
  if (!name || name.trim() === "") return "";

  // 转换为驼峰命名，确保首字母小写
  const sanitized = name
    .replace(/[^\w\s]/g, " ") // 仅保留字母、数字、下划线和空格
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");

  // 确保变量名以字母或下划线开头，不能以数字开头
  if (/^[0-9]/.test(sanitized)) {
    return "group" + sanitized;
  }

  // 如果最终结果为空，返回默认名称
  return sanitized || "defaultGroup";
}
