#!/usr/bin/env bun
// 这是一个针对 Bun 优化的入口文件
// 无需像 ts-node 那样需要额外的注册器

import { Command } from "commander";
import figlet from "figlet";
import chalk from "chalk";
import { generateApiClient } from "./utils/cli";

// 显示标题
console.log(
  chalk.blue(figlet.textSync("API-GEN", { horizontalLayout: "full" }))
);
console.log(chalk.green("使用 Bun 运行时 - 高性能 API 客户端生成器\n"));

const program = new Command();

program
  .version("1.0.0")
  .description("基于 OpenAPI 规范自动生成 TypeScript API 客户端")
  .option("-c, --config <path>", "配置文件路径", "./api-gen.config.json")
  .option("-o, --output <path>", "输出目录", "./api")
  .option("-u, --url <url>", "OpenAPI JSON 文档 URL")
  .option("-f, --file <path>", "本地 OpenAPI JSON 文件路径")
  .action(async (options) => {
    try {
      await generateApiClient(options);
    } catch (error) {
      console.error(chalk.red("生成失败:"), error);
      process.exit(1);
    }
  });

program.parse(process.argv);

// 如果没有提供任何参数，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
