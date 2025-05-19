# API-Gen

基于OpenAPI 3.x规范生成TypeScript类型定义和API请求函数的CLI工具。

## 功能特性

- 解析OpenAPI 3.x JSON和YAML规范文件
- 生成TypeScript类型定义
- 创建基于axios的API请求函数
- 支持多服务/API管理
- 按模块组织生成的代码（基于API标签或端点）
- 使用prettier格式化生成的代码

## 安装

```bash
# 使用npm
npm install -g api-gen

# 使用pnpm
pnpm add -g api-gen

# 使用yarn
yarn global add api-gen
```

或者作为项目开发依赖安装：

```bash
# 使用npm
npm install --save-dev api-gen

# 使用pnpm
pnpm add -D api-gen

# 使用yarn
yarn add -D api-gen
```

## 使用方法

### 初始化配置

```bash
api-gen init
```

这将创建`api-gen.config.json`配置文件，并设置基本目录结构。

### 添加API服务

```bash
api-gen add-service
```

按照提示添加API服务的信息：
- 服务名称
- 基础URL
- OpenAPI Schema文件路径

### 生成API代码

```bash
# 生成所有API代码
api-gen generate

# 或者使用npm脚本
npm run api

# 生成特定服务的API代码
api-gen generate --service <服务名称>
```

## 命令行选项

### `generate` 命令选项

- `-s, --service <name>`: 指定要生成的服务名称
- `-a, --all`: 生成所有服务
- `-p, --prefix <prefix>`: 设置生成的API函数前缀
- `--no-format`: 跳过代码格式化

## 配置文件

`api-gen.config.json` 文件结构：

```json
{
  "outputDir": "src/api",
  "schemaDir": "openapi",
  "services": [
    {
      "name": "main-service",
      "baseURL": "https://api.example.com",
      "schemaPath": "main-service.json"
    },
    {
      "name": "order-service",
      "baseURL": "https://orders.example.com",
      "schemaPath": "order-service.yaml"
    }
  ]
}
```

## 生成的代码结构

```
src/api/
├── index.ts                  # 主索引文件
├── main-service/             # 服务目录
│   ├── axios.ts              # Axios实例
│   ├── index.ts              # 服务索引
│   ├── types.ts              # 类型定义
│   ├── users/                # 模块目录
│   │   ├── index.ts          # 模块索引
│   │   ├── getUserById.ts    # API函数
│   │   └── ...
│   └── products/
│       ├── index.ts
│       └── ...
└── order-service/
    └── ...
```

## 开发

```bash
# 克隆仓库
git clone https://github.com/yourusername/api-gen.git
cd api-gen

# 安装依赖
pnpm install

# 构建
pnpm build

# 链接到全局
pnpm link --global
```

## 许可证

MIT
