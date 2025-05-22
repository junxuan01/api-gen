# API-GEN

一个基于Apifox OpenAPI 3.x规范自动生成TypeScript API客户端的工具。

## 功能特点

- 🚀 自动从Apifox OpenAPI URL获取最新的API定义
- 📁 按照API标签自动分组生成文件夹结构
- 🧬 自动生成TypeScript类型定义
- 💪 生成基于axios或fetch的请求函数
- 🔧 可配置的生成选项
- ⚡ 使用 Bun 运行时以获得更快的执行速度

## 安装与使用

### 安装依赖

```bash
# 使用 pnpm 安装依赖
pnpm install

# 或使用 Bun 安装依赖
bun install
```

### 初始化配置文件

```bash
bun run api init
```

这将在当前目录创建一个`api-gen.config.json`配置文件，可以根据需要修改配置项。

### 配置示例

```json
{
  "apifoxUrl": "https://your-apifox-openapi-url-here",
  "outputDir": "./api",
  "generateIndex": true,
  "prettierFormat": true,
  "baseURL": "/api",
  "timeout": 30000
}
```

### 生成API客户端

```bash
pnpm run dev
```

或者可以直接通过命令行指定选项：

```bash
pnpm run dev -- generate --url=https://your-apifox-openapi-url-here --output=./api
```

## 配置选项

| 选项 | 说明 | 默认值 |
| ---- | ---- | ------ |
| apifoxUrl | Apifox的OpenAPI URL | - |
| outputDir | 代码生成的输出目录 | ./api |
| generateIndex | 是否生成索引文件 | true |
| prettierFormat | 是否使用prettier格式化生成的代码 | true |
| baseURL | 请求的基础URL | /api |
| timeout | 请求超时时间(毫秒) | 30000 |

## 生成代码示例

### API请求函数

```typescript
/**
 * 获取用户信息
 * @description 获取当前登录用户的详细信息
 * @operationId getUserInfo
 */
export async function getUserInfo(options?: RequestOptions): Promise<components['schemas']['GetUserInfoResponse']> {
  return request({
    method: 'get',
    url: '/api/user/info',
    ...options,
  });
}
```

### 带参数的API请求函数

```typescript
/**
 * 获取商品详情
 * @description 根据商品ID获取商品的详细信息
 * @operationId getProductDetail
 */
export async function getProductDetail(params: components['parameters']['GetProductDetailParams'], options?: RequestOptions): Promise<components['schemas']['GetProductDetailResponse']> {
  return request({
    method: 'get',
    url: `/api/products/${params.id}`,
    ...options,
  });
}
```

## 项目结构

生成的代码结构如下：

```
api/
├── types/
│   ├── index.ts
│   └── schema.ts
├── utils/
│   └── request.ts
├── user.ts
├── product.ts
└── index.ts
```

## 开发计划

- [x] 支持更多配置选项
- [x] 支持生成其他HTTP客户端(如fetch)
- [ ] 支持自定义模板
- [ ] 支持生成Mock数据
- [ ] 支持发布为npm包

## 调试

使用以下命令在调试模式下运行，程序将在 `debugger` 语句处暂停：

```bash
bun run api
```

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT
