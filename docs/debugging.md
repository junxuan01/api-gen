# API-Gen 调试指南

本文档提供了关于如何调试 API-Gen 工具的详细说明。

## 调试选项

API-Gen 提供了两种主要的调试方式：

### 1. 使用命令行调试

当你执行 `bun run api` 命令时，程序会自动启用调试模式并在遇到 `debugger` 语句时停止。

```bash
# 运行并在断点处停止
bun run api
```

### 2. 使用 VS Code 调试

我们提供了两种 VS Code 调试配置：

- **Debug API Gen**：直接启动程序并在 VS Code 中进行调试
- **Attach to Bun**：连接到已经在调试模式下运行的 Bun 进程

## 调试步骤

1. **准备代码**：
   - 在需要调试的代码位置添加 `debugger` 语句

2. **启动调试**：
   - **选项 A** - 命令行方式：
     ```bash
     bun run api
     ```
   - **选项 B** - VS Code 方式：
     - 打开 VS Code 调试面板（Ctrl+Shift+D 或 Cmd+Shift+D）
     - 选择 "Debug API Gen" 配置
     - 点击绿色的开始按钮或按 F5

3. **调试体验**：
   - 程序会在 `debugger` 语句处暂停执行
   - 你可以检查变量值、执行表达式等
   - 使用调试控制栏（继续、单步执行、单步跳过等）控制执行流程

## 注意事项

- 确保已安装 "Bun for Visual Studio Code" 扩展
- 如果遇到连接问题，请确认调试端口（默认 6499）没有被其他程序占用
- 如需修改调试端口，可以在命令中指定 `--inspect-brk=<端口号>`
