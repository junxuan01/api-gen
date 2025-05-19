import fs from 'fs/promises';
import path from 'path';

export interface ServiceConfig {
  name: string;
  baseURL: string;
  schemaPath: string;
}

export interface Config {
  outputDir: string;
  schemaDir: string;
  services: ServiceConfig[];
}

const CONFIG_FILE = 'api-gen.config.json';

/**
 * 加载配置文件
 */
export async function loadConfig(): Promise<Config> {
  try {
    const configPath = path.resolve(process.cwd(), CONFIG_FILE);
    const configData = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    // 如果配置文件不存在，返回默认配置
    return {
      outputDir: 'src/api',
      schemaDir: 'openapi',
      services: []
    };
  }
}

/**
 * 保存配置文件
 */
export async function saveConfig(config: Config): Promise<void> {
  const configPath = path.resolve(process.cwd(), CONFIG_FILE);
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
}
