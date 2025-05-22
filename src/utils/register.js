// src/utils/register.js
// 这是一个用于Node.js注册ts-node的辅助文件
// 使用.js扩展名以便Node.js可以直接导入

import { register } from 'ts-node/esm';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载tsconfig配置
const tsconfigPath = resolve(__dirname, '../../tsconfig.json');
const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'));

// 注册ts-node
register({
  esm: true,
  transpileOnly: true,
  "experimentalSpecifierResolution": 'node',
  project: tsconfigPath
});

// 注册路径别名
import 'tsconfig-paths/register';
