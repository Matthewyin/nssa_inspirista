# 数据管理指南 / Data Management Guide

## 数据存储位置 / Data Storage Location

### 当前配置 / Current Configuration
- **开发环境**: Firebase Project `n8n-project-460516`
- **生产环境**: 需要创建独立的Firebase项目
- **数据库**: Firestore
- **集合**: `notes` (包含灵感和清单数据)

### 数据结构 / Data Structure
```javascript
{
  id: "document_id",
  uid: "user_id",           // 用户ID，确保数据隔离
  title: "标题",
  content: "内容",
  tags: ["标签1", "标签2"],
  category: "inspiration" | "checklist",
  completed: boolean,       // 仅清单项目
  sortOrder: number,        // 仅清单项目
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 跨设备同步 / Cross-Device Sync

### ✅ 已实现功能
- Firebase Authentication确保用户身份一致
- Firestore实时同步，任何设备的更改立即同步
- 安全规则确保用户只能访问自己的数据

### 测试跨设备同步
1. 在设备A登录并创建笔记
2. 在设备B用同一账户登录
3. 验证数据是否同步显示

## 环境隔离 / Environment Isolation

### 🚨 当前问题
- 开发和生产环境使用同一个Firebase项目
- 测试数据和生产数据混合存储

### 解决方案
1. **创建独立的生产Firebase项目**
2. **使用环境配置文件**
3. **数据迁移和备份**

## 环境设置命令 / Environment Setup Commands

```bash
# 设置开发环境
npm run env:dev

# 设置生产环境  
npm run env:prod

# 开发环境启动
npm run dev:clean

# 生产环境构建
npm run build:prod
```

## 数据备份和迁移 / Data Backup and Migration

### 备份当前数据
```bash
# 使用Firebase CLI导出数据
firebase firestore:export gs://your-bucket/backup-$(date +%Y%m%d)

# 或使用gcloud命令
gcloud firestore export gs://your-bucket/backup-$(date +%Y%m%d)
```

### 迁移到新项目
```bash
# 1. 创建新的Firebase项目
# 2. 导入数据到新项目
gcloud firestore import gs://your-bucket/backup-folder --project=new-project-id

# 3. 更新.env.production配置
# 4. 部署安全规则到新项目
firebase deploy --only firestore:rules --project=new-project-id
```

## 安全规则验证 / Security Rules Validation

当前安全规则确保：
- 用户只能访问自己的数据 (`request.auth.uid == resource.data.uid`)
- 必须登录才能操作数据 (`request.auth != null`)
- 创建数据时必须使用自己的uid

## 监控和日志 / Monitoring and Logging

### 开发环境
- 控制台显示Firebase项目信息
- 详细的错误日志

### 生产环境
- 最小化日志输出
- 错误监控和报警

## 下一步行动 / Next Steps

1. **立即**: 创建独立的生产Firebase项目
2. **配置**: 更新.env.production文件
3. **测试**: 验证环境隔离
4. **迁移**: 将现有用户数据迁移到生产环境
5. **监控**: 设置数据备份和监控
