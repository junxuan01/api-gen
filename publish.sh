#!/usr/bin/env bash
# 发布新版本的脚本

# 确保在项目根目录运行
if [ ! -f package.json ]; then
  echo "错误：请在项目根目录运行此脚本"
  exit 1
fi

# 获取参数
VERSION=$1
if [ -z "$VERSION" ]; then
  echo "错误：请指定版本号，例如：./publish.sh 1.0.0"
  exit 1
fi

# 确认版本号格式
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "错误：版本号格式应为 x.y.z，例如：1.0.0"
  exit 1
fi

# 确认发布
echo "即将发布版本 v$VERSION"
read -p "确认发布? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "已取消发布"
  exit 1
fi

# 更新package.json中的版本
echo "正在更新package.json中的版本..."
sed -i '' "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" package.json

# 构建项目
echo "正在构建项目..."
bun run build

# 创建变更日志
echo "正在更新变更日志..."
CHANGELOG_FILE="CHANGELOG.md"
if [ ! -f "$CHANGELOG_FILE" ]; then
  echo "# 变更日志" > "$CHANGELOG_FILE"
  echo "" >> "$CHANGELOG_FILE"
fi

# 获取上次提交到现在的提交信息
echo "## v$VERSION ($(date +%Y-%m-%d))" > /tmp/changelog_entry
echo "" >> /tmp/changelog_entry
git log --pretty=format:"- %s" $(git describe --tags --abbrev=0 2>/dev/null || echo HEAD^)..HEAD >> /tmp/changelog_entry
echo "" >> /tmp/changelog_entry
echo "" >> /tmp/changelog_entry

# 插入到变更日志的顶部（在标题后）
sed -i '' -e "/^# 变更日志/r /tmp/changelog_entry" "$CHANGELOG_FILE"

# 提交更改
echo "正在提交版本更新..."
git add package.json "$CHANGELOG_FILE"
git commit -m "chore: 发布 v$VERSION"

# 创建标签
echo "正在创建标签..."
git tag -a "v$VERSION" -m "版本 v$VERSION"

# 推送到远程仓库
echo "正在推送到远程仓库..."
git push origin main
git push origin "v$VERSION"

# 发布到npm
echo "正在发布到npm..."
npm publish

echo "发布完成！版本 v$VERSION 已发布"
