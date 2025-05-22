import fs from "fs-extra";
import path from "path";
import type { Config } from "../config/index.js";
import { requestUtilTemplate, fetchUtilTemplate } from "../templates/index.js";
import { format } from "prettier";

/**
 * 创建目录
 *
 * @param dirPath 目录路径
 */
export async function createDirectory(dirPath: string): Promise<void> {
  try {
    await fs.ensureDir(dirPath);
  } catch (error) {
    console.error(`创建目录失败: ${dirPath}`, error);
    throw error;
  }
}

/**
 * 清空目录
 *
 * @param dirPath 目录路径
 */
export async function clearDirectory(dirPath: string): Promise<void> {
  try {
    if (await fs.pathExists(dirPath)) {
      await fs.emptyDir(dirPath);
    } else {
      await fs.ensureDir(dirPath);
    }
  } catch (error) {
    console.error(`清空目录失败: ${dirPath}`, error);
    throw error;
  }
}

/**
 * 写入文件
 *
 * @param filePath 文件路径
 * @param content 文件内容
 * @param config 配置信息，用于决定是否格式化代码
 */
export async function writeFile(
  filePath: string,
  content: string,
  config?: Pick<Config, "prettierFormat">
): Promise<void> {
  try {
    await fs.ensureDir(path.dirname(filePath));

    // 如果需要格式化代码
    if (config?.prettierFormat) {
      try {
        // 根据文件扩展名确定解析器
        const ext = path.extname(filePath);
        let parser = "typescript";
        if (ext === ".json") parser = "json";
        if (ext === ".js") parser = "babel";

        content = await format(content, {
          parser,
          singleQuote: true,
          trailingComma: "es5",
          printWidth: 100,
        });
      } catch (error) {
        console.warn(`格式化文件失败: ${filePath}`, error);
      }
    }

    await fs.writeFile(filePath, content, "utf-8");
  } catch (error) {
    console.error(`写入文件失败: ${filePath}`, error);
    throw error;
  }
}

/**
 * 创建API工具文件
 *
 * @param outputDir 输出目录
 * @param config 配置
 */
export async function createApiUtilFiles(
  outputDir: string,
  config: Config
): Promise<void> {
  // 创建请求工具文件
  const requestUtilPath = path.join(outputDir, "utils/request.ts");

  // 根据配置选择HTTP客户端模板
  const httpClient = config.httpClient || "axios";
  let requestUtilContent =
    httpClient === "axios" ? requestUtilTemplate : fetchUtilTemplate;

  if (httpClient === "axios" && config.baseURL) {
    // 为axios客户端添加baseURL配置
    requestUtilContent = requestUtilContent.replace(
      "const instance = axios.create({",
      `const instance = axios.create({\n  baseURL: '${config.baseURL}',`
    );
  } else if (httpClient === "fetch" && config.baseURL) {
    // 为fetch客户端添加baseURL配置
    const baseUrlLine = `const BASE_URL = '${config.baseURL}';`;
    // 在默认选项前添加BASE_URL常量定义
    requestUtilContent = requestUtilContent.replace(
      "/**\n * 默认请求选项\n */",
      `${baseUrlLine}\n\n/**\n * 默认请求选项\n */`
    );

    // 修改URL拼接逻辑
    requestUtilContent = requestUtilContent.replace(
      "let url = config.url || '';",
      "let url = (config.url?.startsWith('http') ? '' : BASE_URL) + (config.url || '');"
    );
  }

  await writeFile(requestUtilPath, requestUtilContent, config);

  // 创建索引类型文件
  const indexTypePath = path.join(outputDir, "types/index.ts");
  const indexTypeContent = `// 此文件会自动生成为OpenAPI的类型定义索引
export * from './schema';
`;

  await writeFile(indexTypePath, indexTypeContent, config);
}

/**
 * 拷贝模板文件到目标路径
 *
 * @param templatePath 模板文件路径
 * @param targetPath 目标文件路径
 * @param vars 替换变量
 */
export async function copyTemplateFile(
  templatePath: string,
  targetPath: string,
  vars: Record<string, string> = {}
): Promise<void> {
  try {
    let content = await fs.readFile(templatePath, "utf-8");

    // 替换变量
    Object.entries(vars).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, "g"), value);
    });

    await writeFile(targetPath, content);
  } catch (error) {
    console.error(`拷贝模板文件失败: ${templatePath} -> ${targetPath}`, error);
    throw error;
  }
}
