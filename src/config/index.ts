import type { Config } from "./default.js";
import { defaultConfig } from "./default.js";
import fs from "fs-extra";
import path from "path";

/**
 * 获取配置
 *
 * 尝试从项目根目录读取 api-gen.config.json 配置文件，
 * 如果不存在则使用默认配置
 *
 * @returns 合并后的配置信息
 */
export async function getConfig(): Promise<Config> {
  try {
    // 尝试从当前目录读取配置文件
    const configPath = path.resolve(process.cwd(), "api-gen.config.json");
    if (await fs.pathExists(configPath)) {
      const configFile = await fs.readJson(configPath);
      return {
        ...defaultConfig,
        ...configFile,
      };
    }
  } catch (error) {
    console.error("读取配置文件失败", error);
  }

  return defaultConfig;
}

// 重新导出类型和默认配置
export type { Config };
export { defaultConfig };
