import { Command } from "commander";
import chalk from "chalk";
import figlet from "figlet";
import ora from "ora";
import path from "path";
import fs from "fs-extra";
import { getConfig } from "../config";
import {
  fetchOpenApiDocument,
  parseApiGroups,
  generateTypeDefinitions,
  generateDtoFiles,
} from "./openapi";
import {
  createDirectory,
  clearDirectory,
  writeFile,
  createApiUtilFiles,
} from "./file";
import { generateGroupFile, generateIndexFile } from "./generator";

export async function run() {
  // 打印标题
  console.log(
    chalk.cyan(figlet.textSync("API-GEN", { horizontalLayout: "full" }))
  );

  // 创建命令行程序
  const program = new Command();

  program
    .name("api-gen")
    .description("基于Apifox OpenAPI生成TypeScript API客户端")
    .version("1.0.0");

  program
    .command("generate")
    .description("根据OpenAPI规范生成API客户端")
    .option("-u, --url <url>", "Apifox OpenAPI URL")
    .option("-o, --output <dir>", "输出目录")
    .option("-b, --base-url <baseUrl>", "API基础URL")
    .option("--http-client <type>", "HTTP客户端类型: axios 或 fetch", "axios")
    .option("--no-prettier", "不使用prettier格式化代码")
    .option("--no-index", "不生成索引文件")
    .action(async (options) => {
      await generateApiClient(options);
    });

  program
    .command("init")
    .description("初始化配置文件")
    .action(async () => {
      await initConfigFile();
    });

  // 默认命令
  if (process.argv.length <= 2) {
    await generateApiClient({});
  } else {
    program.parse(process.argv);
  }
}

/**
 * 初始化配置文件
 */
async function initConfigFile() {
  const configPath = path.resolve(process.cwd(), "api-gen.config.json");

  // 检查配置文件是否已存在
  if (await fs.pathExists(configPath)) {
    console.log(chalk.yellow("配置文件已存在，跳过初始化"));
    return;
  }

  // 创建配置文件
  const configContent = {
    apifoxUrl: "https://your-apifox-openapi-url-here",
    outputDir: "./api",
    generateIndex: true,
    prettierFormat: true,
    baseURL: "/api",
    timeout: 30000,
  };

  await fs.writeJson(configPath, configContent, { spaces: 2 });
  console.log(chalk.green("✓ 配置文件已创建: api-gen.config.json"));
  console.log(
    chalk.blue("请更新配置文件中的 apifoxUrl 为实际的Apifox OpenAPI URL")
  );
}

/**
 * 生成API客户端
 *
 * @param options 命令行选项
 */
export async function generateApiClient(options: any) {
  // 加载配置
  const config = await getConfig();

  // 命令行选项覆盖配置文件
  if (options.url) config.apifoxUrl = options.url;
  if (options.output) config.outputDir = options.output;
  if (options.baseUrl) config.baseURL = options.baseUrl;
  if (options.prettier === false) config.prettierFormat = false;
  if (options.index === false) config.generateIndex = false;

  // 检查必要的配置
  if (!config.apifoxUrl) {
    console.log(chalk.red("错误: 未指定Apifox OpenAPI URL"));
    console.log(chalk.yellow("提示: 可以通过以下方式指定URL:"));
    console.log(chalk.yellow("1. 命令行参数: --url=<your-url>"));
    console.log(chalk.yellow("2. 配置文件: api-gen.config.json"));
    console.log(chalk.yellow("3. 环境变量: APIFOX_URL"));
    process.exit(1);
  }

  // 输出目录处理
  const outputDir = path.resolve(process.cwd(), config.outputDir);

  try {
    // 创建输出目录
    const spinner = ora("正在生成API客户端...").start();

    // 第1步：获取OpenAPI文档
    spinner.text = "正在获取OpenAPI文档...";
    const document = await fetchOpenApiDocument(config.apifoxUrl);

    // 记录基本信息
    const apiInfo = document.info || {};
    console.log(
      chalk.green(
        `\n✓ 成功获取API文档: ${apiInfo.title || "Unknown"} (版本: ${apiInfo.version || "Unknown"})`
      )
    );

    // 第2步：解析API分组
    spinner.text = "正在解析API分组...";
    debugger; // 在关键功能处暂停
    const apiGroups = parseApiGroups(document);
    debugger;

    console.log(
      chalk.green(
        `✓ 成功解析 ${apiGroups.length} 个API分组, 共 ${apiGroups.reduce((sum, group) => sum + group.apis.length, 0)} 个API接口`
      )
    );

    // 第3步：清空输出目录
    spinner.text = "正在准备输出目录...";
    await clearDirectory(outputDir);

    // 创建基础目录结构
    await createDirectory(path.join(outputDir, "types"));
    await createDirectory(path.join(outputDir, "utils"));
    await createDirectory(path.join(outputDir, "dtos"));
    await createDirectory(path.join(outputDir, "apis"));

    // 为每个分组创建对应的目录
    for (const group of apiGroups) {
      // 安全的文件夹名称转换
      const folderName = group.name.toLowerCase().replace(/[^\w-]/g, "_");
      // 确保文件夹名不为空且有效
      const safeFolderName = folderName || "default_group";

      // 创建APIs和DTOs目录
      await createDirectory(path.join(outputDir, "dtos", safeFolderName));
      await createDirectory(path.join(outputDir, "apis", safeFolderName));
    }

    // 创建通用DTO目录
    await createDirectory(path.join(outputDir, "dtos", "common"));

    // 第4步：生成TypeScript类型定义
    spinner.text = "正在生成TypeScript类型定义...";
    const { schema, dtos } = await generateTypeDefinitions(document);

    // 写入主类型定义文件
    await writeFile(
      path.join(outputDir, "types", "schema.ts"),
      `// 根据OpenAPI规范自动生成的类型定义\n${schema}`,
      config
    );

    // 第5步：生成DTO文件
    spinner.text = "正在生成DTO文件...";
    await generateDtoFiles(dtos, apiGroups, outputDir, config);

    // 第6步：创建工具文件
    spinner.text = "正在创建工具文件...";
    await createApiUtilFiles(outputDir, config);

    // 第7步：生成每个分组的API文件
    spinner.text = "正在生成API文件...";
    for (const group of apiGroups) {
      await generateGroupFile(group, outputDir, config);
    }

    // 第8步：生成索引文件
    if (config.generateIndex) {
      spinner.text = "正在生成索引文件...";
      await generateIndexFile(apiGroups, outputDir, config);
    }

    spinner.succeed(`API客户端已成功生成到目录: ${outputDir}`);

    // 输出分组明细
    console.log("\n" + chalk.cyan("API分组明细:"));
    apiGroups.forEach((group) => {
      console.log(chalk.cyan(`  - ${group.name}: ${group.apis.length} 个接口`));
    });

    // 提取有效的模块名
    const moduleNames = apiGroups.map((g) => {
      // 生成安全的模块名称
      const moduleName = g.name.toLowerCase().replace(/[^\w]/g, "_");
      return moduleName || "default_group";
    });

    console.log(
      "\n" + chalk.green("✓ 生成完成! 现在可以通过导入以下路径来使用:")
    );
    console.log(
      chalk.yellow(
        `  import { ${moduleNames.join(", ")} } from '${config.outputDir}';`
      )
    );
  } catch (error) {
    console.error(chalk.red("生成API客户端失败:"), error);
    process.exit(1);
  }
}
