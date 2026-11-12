#!/bin/bash

# 红楼梦3D游戏 - GitHub部署脚本

echo "🎮 红楼梦3D动作游戏 - GitHub部署"
echo "=================================="

# 检查是否已经配置了git remote
if git remote get-url origin > /dev/null 2>&1; then
    echo "✓ Git remote已配置"
else
    echo "⚠ 添加GitHub remote..."
    git remote add origin https://github.com/AkinoHu/hongloumeng-3d.git
fi

# 确保在main分支
echo "📦 准备推送到GitHub..."
git branch -M main

# 推送代码
echo "🚀 推送代码到GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 部署成功！"
    echo ""
    echo "📝 下一步："
    echo "1. 访问 https://github.com/AkinoHu/hongloumeng-3d"
    echo "2. 开启GitHub Pages："
    echo "   - 进入 Settings > Pages"
    echo "   - Source 选择 'Deploy from a branch'"
    echo "   - Branch 选择 'main' 和 '/ (root)'"
    echo "   - 点击 Save"
    echo ""
    echo "3. 稍等几分钟，游戏将发布到："
    echo "   https://AkinoHu.github.io/hongloumeng-3d/"
    echo ""
else
    echo ""
    echo "❌ 推送失败"
    echo ""
    echo "请手动运行以下命令："
    echo "  cd /Users/h/Documents/lulupopo/hongloumeng-3d"
    echo "  git push -u origin main"
    echo ""
    echo "如果需要认证，GitHub会提示你登录。"
fi
