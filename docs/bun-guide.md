# Bun 版本使用指南

## 简介

这是 API-GEN 工具的 Bun 版本，相比 Node.js 版本，它提供了更快的启动速度和执行性能，同时简化了项目配置。

## 前置条件

- 安装 [Bun](https://bun.sh/) (v1.0.0 或更高版本)
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```

## 使用方法

### 安装依赖

```bash
bun install
```

### 运行开发版本

```bash
bun run dev
```

或直接运行 CLI 工具：

```bash
bun run cli -c ./api-gen.config.json
```

### 构建生产版本

```bash
bun run build
```

或使用 Bun 内置的构建工具：

```bash
bun run bundle
```

## 与 Node.js 版本的区别

1. **性能提升**
   - 启动速度更快
   - TypeScript 执行无需编译步骤
   - 内存占用更低

2. **配置简化**
   - 不需要 ts-node 和相关配置
   - 路径别名自动支持（通过 tsconfig.json）
   - 内置优化的网络请求工具

3. **开发体验**
   - 无需担心 ESM/CJS 兼容性问题
   - 更快的包安装速度
   - 内置测试工具

## 示例

### 基础使用

```typescript
// 生成 API 客户端
import { generateApiClient } from "./src/utils/generator";

await generateApiClient({
  config: "./api-gen.config.json",
  output: "./api"
});
```

### 自定义请求实例

```typescript
// 使用 Bun 优化的请求工具
import { createRequest } from "./src/utils/bun-request";

const api = createRequest({
  baseURL: "https://api.example.com",
  headers: {
    Authorization: `Bearer ${token}`
  }
});

// 使用生成的 API 函数
const result = await api.get("/users");
```
