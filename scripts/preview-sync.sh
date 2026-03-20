#!/bin/bash
# preview-sync: 同步回测结果到 OpenClaw Lens

set -e

LENS_DIR="/root/.openclaw/workspace/skills/trend-analysis/openclaw-lens"
DATA_DIR="$LENS_DIR/data"

echo "🔄 同步回测结果到 OpenClaw Lens..."

# 检查参数
if [ $# -lt 1 ]; then
    echo "用法: preview-sync <backtest_summary.json>"
    exit 1
fi

BACKTEST_FILE="$1"

if [ ! -f "$BACKTEST_FILE" ]; then
    echo "❌ 文件不存在: $BACKTEST_FILE"
    exit 1
fi

# 确保目录存在
mkdir -p "$DATA_DIR"

# 复制数据文件
cp "$BACKTEST_FILE" "$DATA_DIR/backtest_summary.json"
echo "✅ 数据已复制到 $DATA_DIR/backtest_summary.json"

# 进入 lens 目录
cd "$LENS_DIR"

# Git 操作
if [ -d .git ]; then
    git add data/
    git commit -m "更新回测结果: $(date '+%Y-%m-%d %H:%M:%S')" || echo "无变更需要提交"
    git push origin main || echo "推送失败，请检查 GitHub Token"
    echo "✅ 已推送到 GitHub Pages"
else
    echo "⚠️ 未找到 Git 仓库，跳过推送"
fi

echo ""
echo "🌐 预览地址: https://你的用户名.github.io/trend-analysis-lens/"
