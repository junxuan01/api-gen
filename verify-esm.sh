#!/bin/zsh
# verify-esm.sh
# 验证 ESM 迁移是否成功的脚本

echo "===== 开始验证 ESM 配置 ====="

# 清除 Node.js 缓存
echo "清除 Node.js 缓存..."
rm -rf node_modules/.cache

# 验证 ESM 导入
echo "验证 ESM 导入..."
cat << EOF > /tmp/esm-test.mjs
import chalk from 'chalk';
console.log(chalk.green('ESM 导入测试成功!'));
EOF

node /tmp/esm-test.mjs
if [ $? -eq 0 ]; then
  echo "✅ 基本 ESM 导入测试通过"
else
  echo "❌ 基本 ESM 导入测试失败"
  exit 1
fi

# 测试项目入口文件
echo "测试项目构建..."
pnpm run build

if [ $? -eq 0 ]; then
  echo "✅ 项目构建成功"
else
  echo "❌ 项目构建失败"
  exit 1
fi

# 执行项目
echo "尝试执行开发模式..."
pnpm run dev -- --help

if [ $? -eq 0 ]; then
  echo "✅ 所有测试通过，ESM 迁移成功!"
else
  echo "❌ 开发模式执行失败"
  exit 1
fi

echo "===== 验证完成 ====="
