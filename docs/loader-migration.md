# 处理Node.js加载器警告

## 问题描述

在使用 `ts-node` 运行 TypeScript 文件时，可能会看到如下警告：

```
(node:4865) ExperimentalWarning: `--experimental-loader` may be removed in the future; instead use `register()`:
```

这个警告表明Node.js中的`--experimental-loader`选项可能在未来版本中被移除，建议改用`register()`API。

## 当前解决方案

在项目中，我们采用了以下临时解决方案：

1. 在`package.json`中添加`NODE_OPTIONS='--no-warnings'`以临时禁用警告：

```json
{
  "scripts": {
    "dev": "NODE_OPTIONS='--no-warnings' node --loader ts-node/esm --experimental-specifier-resolution=node src/test.ts",
    "debug": "NODE_OPTIONS='--no-warnings' node --inspect-brk --loader ts-node/esm --experimental-specifier-resolution=node src/index.ts"
  }
}
```

## 未来迁移计划

当Node.js完全移除`--loader`选项或者`ts-node`完全支持新API时，可以采用以下步骤迁移：

### 步骤1：创建注册文件

创建`src/utils/register.js`文件（注意是.js不是.ts）：

```javascript
// src/utils/register.js
import { register } from 'ts-node';

register({
  esm: true,
  transpileOnly: true,
  experimentalSpecifierResolution: 'node',
});

// 导入路径别名支持
import 'tsconfig-paths/register';
```

### 步骤2：更新package.json

将脚本修改为使用`--import`代替`--loader`：

```json
{
  "scripts": {
    "dev": "node --import=./src/utils/register.js src/test.ts",
    "debug": "node --inspect-brk --import=./src/utils/register.js src/index.ts"
  }
}
```

### 注意事项

- 确保在实际迁移前测试新的配置
- 可能需要同时更新相关依赖（ts-node和tsconfig-paths）到支持新API的版本
