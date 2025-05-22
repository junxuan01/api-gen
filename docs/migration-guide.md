# 从 Bun 迁移到 Node.js + pnpm 的步骤

本文档记录了将项目从 Bun 迁移到 Node.js 和 pnpm 的主要步骤。

## 已完成的迁移工作

1. **包管理器切换**
   - 从 Bun 切换到 pnpm
   - 更新了 package.json 内容和脚本

2. **模块系统**
   - 保持 ESM 模块系统
   - 更新了导入语法使用 `.js` 扩展名
   - 调整了相对路径替代 alias 路径

3. **TypeScript 配置**
   - 更新 tsconfig.json 以适配 Node.js ESM
   - 使用 NodeNext 模块解析策略

4. **调试配置**
   - 更新 VS Code 调试配置
   
5. **解决Node.js加载器警告**
   - 添加 `NODE_OPTIONS='--no-warnings'` 临时解决 `--experimental-loader` 警告
   - 提供了迁移到 `--import` 注册方式的未来规划
   - 更新 VS Code 任务配置
   - 添加了 Debug 辅助脚本

5. **路径别名处理**
   - 使用 tsconfig-paths 支持路径别名
   - 创建了辅助脚本解决 ESM 路径问题

## 后续工作

1. **测试所有功能**
   - 生成 API 客户端
   - 验证生成的代码质量

2. **性能优化**
   - 检查是否有 Node.js 特有的性能优化点

3. **更新文档**
   - 更新所有涉及 Bun 的文档为 Node.js
   - 添加新的调试指南

## 注意事项

- 保持对 ESM 的支持，大多数依赖都是 ESM 的
- 确保测试在迁移后正常工作
- 保持目录结构和生成逻辑不变

## 更多资源

- [Node.js ESM 文档](https://nodejs.org/api/esm.html)
- [TypeScript ESM 支持](https://www.typescriptlang.org/docs/handbook/esm-node.html)
- [pnpm 文档](https://pnpm.io/)
