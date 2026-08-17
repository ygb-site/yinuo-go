const fs = require('fs');

const script = `#!/usr/bin/env bash

# ==========================================
# YiNuo Go 一键提交与发布脚本
# ==========================================

set -e

# 获取自定义提交说明，默认为带时间戳的更新信息
COMMIT_MSG="${1:-"feat: update yinuo-go at $(date +'%Y-%m-%d %H:%M:%S')"}"

echo "=========================================="
echo "🚀 准备提交 YiNuo Go 代码..."
echo "💬 提交信息: $COMMIT_MSG"
echo "=========================================="

# 1. 检查是否有变动
git status -s

# 2. 暂存所有修改
echo ""
echo "📦 正在暂存变动文件 (git add .)..."
git add .

# 3. 提交更改（若无变动则友好跳过）
if git diff-index --quiet HEAD --; then
  echo "✨ 没有需要提交的新变动，直接准备推送已有提交..."
else
  echo "📝 正在生成 Commit..."
  git commit -m "$COMMIT_MSG"
fi

# 4. 获取当前所在分支
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "🌿 当前分支: $CURRENT_BRANCH"

# 5. 推送到远程仓库
echo "🚀 正在推送到远程 GitHub 仓库 (git push origin $CURRENT_BRANCH)..."
git push origin "$CURRENT_BRANCH"

echo ""
echo "=========================================="
echo "🎉 恭喜！代码已成功推送到 GitHub！"
echo "🌐 GitHub Actions 正在自动构建并部署到 GitHub Pages。"
echo "=========================================="
`;

fs.writeFileSync('deploy.sh', script, 'utf8');

// Also add scripts to package.json
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts.push = 'bash deploy.sh';
pkg.scripts.deploy = 'bash deploy.sh';
pkg.scripts.sync = 'bash deploy.sh';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n', 'utf8');

console.log('deploy.sh and package.json updated successfully');
