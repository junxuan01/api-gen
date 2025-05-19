import chalk from 'chalk';

export class ApiGenError extends Error {
  constructor(message: string, public details?: string) {
    super(message);
    this.name = 'ApiGenError';
  }
}

/**
 * 处理错误并打印友好的错误消息
 */
export function handleError(error: unknown): never {
  if (error instanceof ApiGenError) {
    console.error(`${chalk.red('错误:')} ${error.message}`);
    
    if (error.details) {
      console.error(`${chalk.gray('详情:')} ${error.details}`);
    }
  } else if (error instanceof Error) {
    console.error(`${chalk.red('发生错误:')} ${error.message}`);
    
    if (error.stack) {
      console.error(chalk.gray('技术细节:'));
      console.error(chalk.gray(error.stack.split('\n').slice(1).join('\n')));
    }
  } else {
    console.error(`${chalk.red('发生未知错误:')} ${error}`);
  }
  
  // 打印帮助信息
  console.error(`\n${chalk.cyan('需要帮助?')}`);
  console.error(`- 使用 ${chalk.yellow('api-gen --help')} 查看可用命令`);
  console.error(`- 确保您的 OpenAPI 规范文件是有效的 JSON 或 YAML`);
  console.error(`- 检查配置文件 ${chalk.yellow('api-gen.config.json')} 是否正确\n`);
  
  process.exit(1);
}
