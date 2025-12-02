#!/bin/bash

# 自动重试推送到 GitHub 的脚本
# 使用方法: bash push-to-github.sh

echo "🚀 开始推送到 GitHub..."
echo ""

MAX_RETRIES=5
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo "尝试 $((RETRY_COUNT + 1))/$MAX_RETRIES..."
    
    if git push origin main; then
        echo ""
        echo "✅ 推送成功！"
        echo "🎉 Vercel 将自动检测并重新部署"
        echo ""
        echo "查看部署状态："
        echo "https://vercel.com/rosewei201796/spg-mvp-1202"
        exit 0
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo "❌ 推送失败，等待 5 秒后重试..."
            sleep 5
        fi
    fi
done

echo ""
echo "❌ 推送失败，已尝试 $MAX_RETRIES 次"
echo ""
echo "可能的原因："
echo "1. 网络连接不稳定"
echo "2. GitHub 服务暂时不可用"
echo "3. 代理或防火墙设置"
echo ""
echo "解决方案："
echo "1. 检查网络连接"
echo "2. 稍后再试: bash push-to-github.sh"
echo "3. 或手动运行: git push origin main"

exit 1

