# 🔐 GitHub Secrets 配置清单

## ✅ 简化配置 - 只需一个Secret！

**好消息**: 现在只需要配置一个Firebase Service Account JSON即可！系统会自动从中提取所有需要的配置。

**访问路径**: `https://github.com/Matthewyin/nssa_inspirista/settings/secrets/actions`

### 🚀 唯一必需的Secret

```env
FIREBASE_SERVICE_ACCOUNT_NSSA_INSPIRISTA=your_complete_firebase_service_account_json
```

**状态**: ✅ 已配置

## 🔧 自动配置说明

GitHub Actions会自动从Service Account JSON中提取以下配置：

- ✅ `project_id` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- ✅ `project_id` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` (自动生成)
- ✅ `project_id` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` (自动生成)
- ✅ 已知项目配置 → `NEXT_PUBLIC_FIREBASE_API_KEY`
- ✅ 已知项目配置 → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- ✅ 已知项目配置 → `NEXT_PUBLIC_FIREBASE_APP_ID`

## 📋 配置状态检查清单

- [x] `FIREBASE_SERVICE_ACCOUNT_NSSA_INSPIRISTA` - Firebase 服务账户 JSON (已配置)
- [x] 自动提取的Firebase Web配置 (无需手动配置)

## 🔧 配置步骤

### 1. 访问 GitHub Secrets 设置
```
https://github.com/Matthewyin/nssa_inspirista/settings/secrets/actions
```

### 2. 添加每个 Secret
1. 点击 "New repository secret"
2. 输入 Secret 名称（如 `NEXT_PUBLIC_FIREBASE_API_KEY`）
3. 输入对应的值
4. 点击 "Add secret"

### 3. 验证配置
推送代码到 main 分支后，检查 GitHub Actions 是否成功运行。

## 🎯 重要说明

- **Firebase 配置**: 这些是前端公开配置，不包含敏感信息
- **Service Account**: 包含敏感信息，必须保密
- **构建兼容**: 即使没有配置这些 Secrets，构建仍会成功（使用占位符）
- **完整功能**: 配置所有 Secrets 后可获得完整的部署和功能支持
