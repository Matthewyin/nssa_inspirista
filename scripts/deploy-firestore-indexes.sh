#!/bin/bash

# Firebase Firestore 索引部署脚本
# 用于部署任务相关的 Firestore 索引

echo "🔥 开始部署 Firestore 索引..."

# 检查是否安装了 Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI 未安装。请先安装："
    echo "npm install -g firebase-tools"
    exit 1
fi

# 检查是否已登录 Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ 请先登录 Firebase："
    echo "firebase login"
    exit 1
fi

# 检查索引文件是否存在
if [ ! -f "firestore.indexes.json" ]; then
    echo "❌ firestore.indexes.json 文件不存在"
    exit 1
fi

echo "📋 当前索引配置："
cat firestore.indexes.json

echo ""
echo "🚀 部署索引到 Firestore..."

# 部署索引
firebase deploy --only firestore:indexes

if [ $? -eq 0 ]; then
    echo "✅ 索引部署成功！"
    echo ""
    echo "📝 注意事项："
    echo "1. 索引创建可能需要几分钟时间"
    echo "2. 在索引创建完成前，相关查询可能会失败"
    echo "3. 可以在 Firebase Console 中查看索引创建进度"
    echo "4. URL: https://console.firebase.google.com/project/$(firebase use --current)/firestore/indexes"
else
    echo "❌ 索引部署失败"
    exit 1
fi
