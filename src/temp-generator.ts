import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import openapiTS from 'openapi-typescript';
import { Config, ServiceConfig } from '../config/config.js';
import { generateAxiosInstance } from '../templates/axiosInstance.js';
import { generateApiFunction } from '../templates/apiFunction.js';
import { generateIndex } from '../templates/index.js';
import { extractModules, getEndpointsByModule } from '../utils/openApiParser.js';
import { formatCode } from '../utils/formatter.js';
import { camelCase } from '../utils/stringUtils.js';

/**
 * 生成API代码
 */
export async function generateApiCode(service: ServiceConfig, config: Config): Promise<void> {
  console.log(chalk.cyan('开始生成API代码:'), service.name);

  // 加载OpenAPI schema
  const schemaPath = path.resolve(process.cwd(), config.schemaDir, service.schemaPath);
  console.log(chalk.gray('加载Schema:'), schemaPath);
  
  let schemaContent;
  try {
    schemaContent = await fs.readFile(schemaPath, 'utf-8');
  } catch (error) {
    throw new Error(`无法读取Schema文件: ${schemaPath}`);
  }

  let schema;
  try {
    schema = JSON.parse(schemaContent);
  } catch (error) {
    throw new Error(`Schema文件不是有效的JSON: ${schemaPath}`);
  }

  // 使用openapi-typescript生成TypeScript类型定义
  console.log(chalk.gray('生成类型定义...'));
  let typesOutput;
  try {
    typesOutput = await openapiTS(schema);
  } catch (error) {
    console.error(chalk.red('生成类型定义失败:'), error);
    
    // 生成一个基本的类型定义作为备选
    typesOutput = `/**
 * 自动生成的API类型定义
 * 生成时间: ${new Date().toISOString()}
 */

export interface operations {
  [operationId: string]: {
    parameters?: {
      path?: Record<string, any>;
      query?: Record<string, any>;
    };
    requestBody?: {
      content: {
        'application/json': any;
      };
    };
    responses: {
      [statusCode: string]: {
        content?: {
          'application/json': any;
        };
      };
    };
  };
}`;
  }

  // 创建服务目录
  const serviceOutputDir = path.resolve(process.cwd(), config.outputDir, service.name);
  await fs.mkdir(serviceOutputDir, { recursive: true });

  // 生成类型定义文件
  const typesFilePath = path.join(serviceOutputDir, 'types.ts');
  await fs.writeFile(typesFilePath, typesOutput, 'utf-8');
  console.log(chalk.green('✓'), '生成类型定义:', chalk.gray(typesFilePath));

  // 生成axios实例
  const axiosInstanceCode = generateAxiosInstance(service);
  const axiosFilePath = path.join(serviceOutputDir, 'axios.ts');
  await fs.writeFile(axiosFilePath, await formatCode(axiosInstanceCode), 'utf-8');
  console.log(chalk.green('✓'), '生成Axios实例:', chalk.gray(axiosFilePath));

  // 提取模块
  const modules = extractModules(schema);
  console.log(chalk.gray('发现模块:'), modules.join(', '));

  // 为每个模块生成API函数
  for (const moduleName of modules) {
    // 获取该模块的所有端点
    const endpoints = getEndpointsByModule(schema, moduleName);
    if (endpoints.length === 0) continue;

    // 创建模块目录
    const moduleDir = path.join(serviceOutputDir, moduleName);
    await fs.mkdir(moduleDir, { recursive: true });

    // 生成模块索引文件
    let moduleImports = [];
    let moduleExports = [];

    // 为每个端点生成API函数
    for (const endpoint of endpoints) {
      const { functionName, code } = generateApiFunction(endpoint, service.name);
      
      const apiFilePath = path.join(moduleDir, `${functionName}.ts`);
      await fs.writeFile(apiFilePath, await formatCode(code), 'utf-8');
      
      // 添加到模块索引
      moduleImports.push(`import { ${functionName} } from './${functionName}';`);
      moduleExports.push(functionName);
      
      console.log(chalk.green('✓'), '生成API函数:', chalk.gray(`${moduleName}/${functionName}`));
    }

    // 生成模块索引文件
    const moduleIndexCode = moduleImports.join('\n') + '\n\n' + `export { ${moduleExports.join(', ')} };`;
    const moduleIndexPath = path.join(moduleDir, 'index.ts');
    await fs.writeFile(moduleIndexPath, await formatCode(moduleIndexCode), 'utf-8');
  }

  // 生成主索引文件
  const indexCode = generateIndex(service.name, modules);
  const indexPath = path.join(serviceOutputDir, 'index.ts');
  await fs.writeFile(indexPath, await formatCode(indexCode), 'utf-8');
  
  console.log(chalk.green('✓'), '生成索引文件:', chalk.gray(indexPath));
  
  // 更新根目录索引文件
  const rootIndexPath = path.join(process.cwd(), config.outputDir, 'index.ts');
  
  try {
    // 检查索引文件是否存在
    await fs.access(rootIndexPath);
    
    // 文件存在，检查是否需要添加当前服务
    const rootIndexContent = await fs.readFile(rootIndexPath, 'utf-8');
    const serviceCamelName = service.name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    
    // 如果服务尚未在索引中
    if (!rootIndexContent.includes(`export * as ${serviceCamelName} from './${service.name}'`)) {
      // 添加新服务到索引文件
      const updatedContent = rootIndexContent.trim() + `\nexport * as ${serviceCamelName} from './${service.name}';\n`;
      await fs.writeFile(rootIndexPath, updatedContent, 'utf-8');
      console.log(chalk.green('✓'), '更新根索引文件');
    }
  } catch (error) {
    // 根索引文件不存在，创建它
    const serviceCamelName = service.name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    const newRootIndexContent = `// 导出所有API服务
export * as ${serviceCamelName} from './${service.name}';\n`;
    await fs.writeFile(rootIndexPath, newRootIndexContent, 'utf-8');
    console.log(chalk.green('✓'), '生成根索引文件');
  }

  console.log(chalk.green('\n完成生成:'), service.name);
}
