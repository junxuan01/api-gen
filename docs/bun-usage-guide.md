# API-GEN 使用指南 (Bun 版本)

## 简介

API-GEN 是一个基于 OpenAPI 规范自动生成 TypeScript API 客户端的工具。借助 Bun 运行时，它可以更快速地执行，并提供更好的开发体验。

## 安装

### 前置条件

- [Bun](https://bun.sh/) v1.0.0 或更高版本
- 有效的 OpenAPI 3.x 规范 JSON 文件或 URL

### 安装方式

#### 全局安装

```bash
# 使用 npm
npm install -g api-gen

# 使用 yarn
yarn global add api-gen

# 使用 pnpm
pnpm add -g api-gen

# 使用 bun
bun install -g api-gen
```

#### 本地安装

```bash
# 使用 bun
bun install api-gen --dev

# 使用 npm
npm install api-gen --save-dev
```

## 使用方法

### 命令行使用

```bash
# 使用配置文件
api-gen -c ./api-gen.config.json

# 直接指定 OpenAPI URL 和输出目录
api-gen -u https://api.example.com/openapi.json -o ./src/api
```

### 配置文件

创建一个 `api-gen.config.json` 文件：

```json
{
  "apifoxUrl": "https://api.example.com/openapi.json",
  "outputDir": "./api",
  "baseURL": "https://api.example.com",
  "prettierFormat": true,
  "generateIndex": true,
  "requestLib": "axios",
  "tagGrouping": true
}
```

### 配置选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `apifoxUrl` | OpenAPI 规范 JSON 文档 URL | - |
| `outputDir` | 生成文件输出目录 | `./api` |
| `baseURL` | API 基础 URL | - |
| `prettierFormat` | 是否使用 Prettier 格式化生成的代码 | `true` |
| `generateIndex` | 是否生成索引文件 | `true` |
| `requestLib` | 请求库类型 (`axios` 或 `fetch`) | `axios` |
| `tagGrouping` | 是否按标签分组 | `true` |
| `useTypeAlias` | 是否使用类型别名 | `true` |
| `requestImport` | 请求实例导入路径 | `./utils/request` |
| `includeCommonDir` | 是否包含公共类型目录 | `true` |
| `commonTypesPath` | 公共类型路径 | `./dtos/common` |

## 示例

### 生成的目录结构

```
api/
├── apis/              # API 请求函数
│   ├── user/          # 按标签分组
│   │   ├── index.ts
│   │   ├── getUser.ts
│   │   └── updateUser.ts
│   └── index.ts
├── dtos/              # 数据传输对象类型
│   ├── common/        # 公共类型
│   │   ├── index.ts
│   │   └── User.ts
│   ├── user/
│   │   ├── index.ts
│   │   ├── getUserResponse.ts
│   │   └── updateUserRequestBody.ts
│   └── index.ts
├── types/             # 生成的类型定义
│   ├── index.ts
│   └── schema.ts
├── utils/             # 工具函数
│   └── request.ts     # 请求实例
└── index.ts           # 主入口点
```

### 使用生成的 API

```typescript
// 导入生成的 API 函数
import { getUser, updateUser } from './api/apis/user';
import type { UpdateUserRequestBody } from './api/dtos/user';

// 使用 API 函数
const user = await getUser({ userId: 1 });
console.log(user.name);

// 更新用户
const updateData: UpdateUserRequestBody = {
  name: 'New Name',
  email: 'new@example.com'
};
await updateUser({ userId: 1 }, updateData);
```

## 高级用法

### 自定义请求实例

可以根据需要自定义请求实例，只需修改 `utils/request.ts` 文件：

```typescript
// 使用 Bun 优化的请求实例
import { createRequest } from 'api-gen/utils/bun-request';

// 创建自定义请求实例
const request = createRequest({
  baseURL: process.env.API_BASE_URL,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
  timeout: 5000,
});

// 请求拦截器
request.interceptors.request.use((config) => {
  // 在请求发送前做一些处理
  return config;
});

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 处理响应数据
    return response.data;
  },
  (error) => {
    // 处理错误
    return Promise.reject(error);
  }
);

export default request;
```

## 疑难解答

### 常见问题

1. **路径别名问题**：确保 `tsconfig.json` 中的路径别名配置与实际使用匹配
2. **类型错误**：检查生成的类型是否与 API 规范一致
3. **请求失败**：检查 baseURL 和请求路径是否正确

### 调试

使用 Bun 的调试功能：

```bash
bun --inspect-brk src/cli.ts -c ./api-gen.config.json
```

## 贡献

欢迎提交 Pull Request 和 Issue！

## 许可证

MIT
