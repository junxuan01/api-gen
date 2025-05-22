# API-Gen 调试指南

本文档详细介绍了如何在不同场景下调试 API-Gen 工具。

## 调试模式概述

API-Gen 提供了多种调试方式，适应不同的开发和测试场景：

| 调试模式 | 命令 | 描述 |
|---------|------|------|
| 标准调试 | `pnpm run dev` | 使用 ts-node 运行项目 |
| 调试模式 | `pnpm run debug` | 启动调试模式，在程序开始时暂停等待调试器连接 |
| VS Code 调试 | 通过 VS Code 调试面板 | 使用 VS Code 的调试功能进行调试 |
| 自定义调试 | `./run.sh` | 使用辅助脚本运行项目（支持路径别名） |

## 设置断点的方法

### 方法1：使用 `debugger` 语句

在你想要暂停执行的代码位置添加 `debugger` 语句：

```javascript
function processApiData(data) {
  // 在这里添加断点
  debugger;
  
  // 继续处理数据
  return transformData(data);
}
```

### 方法2：在 VS Code 中设置断点

1. 在 VS Code 中打开源代码文件
2. 点击要暂停的代码行左侧的空白区域，添加红色断点
3. 使用 "Debug API Gen" 配置启动调试会话

## 在 VS Code 中调试

### 使用预配置的调试配置

API-Gen 已经为 VS Code 配置了调试设置：

1. 按 `F5` 或点击侧边栏中的"运行和调试"按钮
2. 从下拉菜单中选择 "Debug API Gen"
3. 点击绿色的开始按钮启动调试会话

### 使用任务调试

1. 按 `Cmd+Shift+P` 打开命令面板
2. 输入 "Tasks: Run Task" 并选择
3. 选择 "Run API-Gen (Debug Mode)" 任务

```typescript
function myFunction() {
  // 在这里将暂停执行
  debugger;
  
  // 继续执行的代码
}
```

### 方法2：使用 VS Code 断点

1. 在 VS Code 中打开相关文件
2. 点击编辑器左侧边栏（行号旁边）设置断点
3. 使用 VS Code 调试配置启动程序

## 调试流程演示

### 基础调试流程

1. 运行 `bun run debug:test` 命令
2. 在 Chrome DevTools 或 VS Code 调试器中连接
3. 程序会在 `debugger` 语句处暂停
4. 检查变量值、执行状态等
5. 使用继续执行、单步执行等命令控制程序流程

### 实际项目调试

1. 在需要调试的关键位置添加 `debugger` 语句
2. 执行 `bun run api` 或 `bun run debug` 命令
3. 连接调试器（如果需要）
4. 在断点处检查相关变量和数据
5. 逐步执行，观察程序行为

## 高级调试技巧

### 条件断点

只有当特定条件满足时才触发断点：

```typescript
if (someCondition) {
  debugger;
}
```

### 使用调试变量

可以在调试过程中查看和修改的特定变量：

```typescript
let _debug = {
  state: "初始状态",
  data: null
};

// 在关键点更新调试状态
_debug.state = "解析API";
_debug.data = apiData;
debugger;
```

### 环境变量控制

使用环境变量启用/禁用调试功能：

```bash
# 启用调试日志
DEBUG=true bun run api

# 启用完整执行流程
RUN_FULL=true bun run debug
```

## 常见问题解决

### 断点不触发

- 确认运行的是调试版本 (`--inspect-brk` 参数)
- 检查是否使用了正确的调试器连接
- 验证 `debugger` 语句是否放在正确的位置

### 调试器无法连接

- 确认使用的端口（默认6499）没有被占用
- 尝试重新启动 VS Code 或浏览器
- 检查是否有防火墙或安全软件阻止连接

### 观察不到变量变化

- 确保在正确的作用域中查看变量
- 使用监视表达式(Watch)跟踪特定变量
- 考虑使用临时的调试对象存储中间状态

## 附录

### Bun 调试参数说明

- `--inspect`: 启用调试器但不暂停
- `--inspect-brk`: 启用调试器并在第一行暂停
- `--inspect-wait`: 启用调试器并等待连接

### VS Code 调试配置参考

可通过修改 `.vscode/launch.json` 自定义调试配置：

```json
{
  "type": "bun",
  "request": "launch",
  "name": "自定义调试配置",
  "program": "${workspaceFolder}/src/index.ts",
  "stopOnEntry": true,
  "console": "integratedTerminal"
}
```
