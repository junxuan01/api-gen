// src/utils/bun-register.ts
// 用于 Bun 的路径别名和配置加载文件
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 导出当前目录信息以便其他模块使用
export const paths = {
  root: resolve(__dirname, "../.."),
  src: resolve(__dirname, ".."),
  utils: __dirname,
};

// 注意: Bun 默认支持 TypeScript 和路径别名 (通过 tsconfig.json)
// 所以这个文件主要是为了提供一些通用路径变量
