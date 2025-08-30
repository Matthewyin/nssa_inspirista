# 🔐 GitHub Secrets 配置指南

## 📋 GitHub Secrets 配置

**重要提示**: GitHub Actions 现在可以在没有 Firebase Secrets 的情况下成功构建！如果您只需要构建测试，可以跳过 Firebase 配置。

为了完整的部署功能，建议配置以下 Secrets：

### 🔥 Firebase 配置 Secrets

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加以下 secrets：

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 🚀 Firebase 部署 Secret

```
FIREBASE_SERVICE_ACCOUNT_NSSA_INSPIRISTA=your_firebase_service_account_json
```

## 📝 如何获取这些值

### 1. Firebase 项目配置
1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 选择您的项目
3. 点击齿轮图标 > 项目设置
4. 在"您的应用"部分找到 Web 应用
5. 复制配置对象中的值

### 2. Firebase Service Account
1. 在 Firebase Console 中，转到项目设置 > 服务账号
2. 点击"生成新的私钥"
3. 下载 JSON 文件
4. 将整个 JSON 文件内容复制到 `FIREBASE_SERVICE_ACCOUNT_NSSA_INSPIRISTA` secret

## 🔧 设置步骤

### 1. 访问 GitHub Secrets 设置
```
https://github.com/YOUR_USERNAME/nssa_inspirista/settings/secrets/actions
```

### 2. 添加每个 Secret
- 点击 "New repository secret"
- 输入 Secret 名称（如 `NEXT_PUBLIC_FIREBASE_API_KEY`）
- 输入对应的值
- 点击 "Add secret"

### 3. 验证配置
推送代码到 main 分支后，检查 GitHub Actions 是否成功运行。

## ⚠️ 安全注意事项

- ✅ 这些 secrets 只在 GitHub Actions 中可见
- ✅ Firebase 配置为公开信息，但通过 secrets 管理更安全
- ✅ Service Account 密钥包含敏感信息，必须保密
- ❌ 不要在代码中硬编码任何密钥或配置

## 🔍 构建行为说明

### ✅ 无 Secrets 构建
- 如果没有配置 Firebase Secrets，构建仍会成功
- 使用占位符配置进行静态生成
- 适用于代码测试和基本构建验证

### 🚀 完整部署
- 配置所有 Firebase Secrets 后可进行完整部署
- 应用将使用真实的 Firebase 配置
- 支持用户认证和数据存储功能

## 🔍 故障排除

如果构建失败，检查：
1. 所有必需的 secrets 是否已添加
2. Secret 名称是否完全匹配（区分大小写）
3. Firebase 项目是否已正确配置
4. Service Account 是否有足够的权限
