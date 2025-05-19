#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateApiCode } from './core/generator.js';
import { loadConfig, saveConfig } from './config/config.js';
import { ApiGenError, handleError } from './utils/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 初始化命令行程序
const program = new Command();

program
  .name('api-gen')
  .description('基于OpenAPI 3.x规范生成TypeScript类型定义和API请求函数')
  .version('1.0.0');

program
  .command('init')
  .description('初始化配置文件')
  .action(async () => {
    try {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'outputDir',
          message: '请输入生成代码的输出目录（相对路径）:',
          default: 'src/api'
        },
        {
          type: 'input',
          name: 'schemaDir',
          message: '请输入OpenAPI Schema文件目录（相对路径）:',
          default: 'openapi'
        }
      ]);

      // 创建输出目录
      const outputDir = path.resolve(process.cwd(), answers.outputDir);
      const schemaDir = path.resolve(process.cwd(), answers.schemaDir);
      
      try {
        await fs.mkdir(outputDir, { recursive: true });
        await fs.mkdir(schemaDir, { recursive: true });
      } catch (err) {
        // 目录可能已存在，忽略错误
      }

      // 保存配置
      await saveConfig({
        outputDir: answers.outputDir,
        schemaDir: answers.schemaDir,
        services: []
      });

      console.log(chalk.green('✓') + ' 配置初始化成功!');
      console.log(chalk.cyan('提示: ') + '现在您可以将OpenAPI schema文件放入 ' + chalk.yellow(answers.schemaDir) + ' 目录');
      console.log(chalk.cyan('提示: ') + '然后运行 ' + chalk.yellow('npm run api') + ' 生成API代码');
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('add-service')
  .description('添加一个新的API服务')
  .action(async () => {
    try {
      const config = await loadConfig();
      
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: '服务名称:',
          validate: (input) => input.trim() !== '' ? true : '服务名称不能为空'
        },
        {
          type: 'input',
          name: 'baseURL',
          message: '基础URL:',
          default: 'http://localhost:3000'
        },
        {
          type: 'input',
          name: 'schemaPath',
          message: `OpenAPI Schema文件路径 (相对于 ${config.schemaDir}):`,
          validate: (input) => input.trim() !== '' ? true : 'Schema路径不能为空'
        }
      ]);

      // 更新配置
      config.services.push({
        name: answers.name,
        baseURL: answers.baseURL,
        schemaPath: answers.schemaPath
      });

      await saveConfig(config);

      console.log(chalk.green('✓') + ` 服务 "${answers.name}" 添加成功!`);
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('generate')
  .description('生成API代码')
  .option('-s, --service <name>', '指定要生成的服务名称')
  .option('-a, --all', '生成所有服务')
  .option('-p, --prefix <prefix>', '设置生成的API函数前缀')
  .option('--no-format', '跳过代码格式化')
  .action(async (options) => {
    try {
      const config = await loadConfig();
      
      if (!config.services || config.services.length === 0) {
        throw new ApiGenError(
          '没有配置任何服务', 
          '使用 "api-gen add-service" 添加服务'
        );
      }

      // 检查schema目录是否存在
      const schemaDir = path.resolve(process.cwd(), config.schemaDir);
      try {
        await fs.access(schemaDir);
      } catch (err) {
        throw new ApiGenError(
          `Schema目录 "${config.schemaDir}" 不存在`, 
          '请先运行 "api-gen init" 初始化配置或手动创建此目录'
        );
      }

      // 确定要生成的服务
      let servicesToGenerate = [];

      if (options.service) {
        // 使用指定的服务
        const service = config.services.find(s => s.name === options.service);
        if (!service) {
          throw new ApiGenError(
            `找不到服务 "${options.service}"`,
            `可用的服务: ${config.services.map(s => s.name).join(', ')}`
          );
        }
        servicesToGenerate.push(service);
      } else if (options.all) {
        // 生成所有服务
        servicesToGenerate = config.services;
      } else if (config.services.length > 1) {
        // 如果有多个服务且未指定，让用户选择
        const { selectedServices } = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'selectedServices',
            message: '请选择要生成的服务:',
            choices: config.services.map(service => ({
              name: `${service.name} (${service.baseURL})`,
              value: service.name
            })),
            validate: (answer) => answer.length > 0 ? true : '请至少选择一个服务'
          }
        ]);

        // 筛选选中的服务
        servicesToGenerate = config.services.filter(service => 
          selectedServices.includes(service.name)
        );
      } else {
        // 只有一个服务，直接生成
        servicesToGenerate = config.services;
      }

      // 生成代码
      const generateOptions = {
        prefix: options.prefix || '',
        format: options.format !== false
      };

      for (const service of servicesToGenerate) {
        await generateApiCode(service, config, generateOptions);
      }

      console.log(chalk.green('✓') + ' API代码生成成功!');
    } catch (error) {
      handleError(error);
    }
  });

// 默认命令别名，直接运行`npm run api`就是执行generate命令
program
  .action(() => {
    program.parse(['node', 'api-gen', 'generate']);
  });

program.parse();
