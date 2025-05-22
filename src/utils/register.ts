// src/utils/register.ts
// 用于ts-node注册的辅助文件
import { register } from "ts-node";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载tsconfig配置
const tsconfigPath = resolve(__dirname, "../../tsconfig.json");
const tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf8"));

// 注册ts-node
register({
  esm: true,
  transpileOnly: true,
  experimentalSpecifierResolution: "node",
  project: tsconfigPath,
  compilerOptions: tsconfig.compilerOptions,
});

// 注册路径别名
import "tsconfig-paths/register";
