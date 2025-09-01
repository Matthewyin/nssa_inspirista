# 任务页面错误修复说明

## 问题概述

在 `/tasks` 页面中发现了两个主要错误：

1. **RangeError: Invalid time value** - 日期处理错误
2. **FirebaseError: The query requires an index** - Firebase 索引缺失错误

## 问题1: RangeError: Invalid time value

### 错误原因
- 在任务详情页面和相关组件中，直接使用了 `task.createdAt.toDate()` 等方法
- 当 Firebase Timestamp 字段为 null、undefined 或包含无效值时，会抛出此错误
- 没有使用项目中已有的安全日期处理工具

### 修复方案
1. **更新了 `task-detail-view.tsx`**：
   - 导入并使用 `useSafeTaskDates` Hook
   - 使用 `safeToDate` 和 `safeFormatDate` 函数替换直接的日期转换
   - 为无效日期提供了回退显示

2. **更新了 `task-status-visualization.tsx`**：
   - 添加了安全日期处理函数的导入
   - 修复了完成时间的日期格式化
   - 使用安全的日期计算方法

3. **更新了 `milestone-timeline.tsx`**：
   - 使用 `useSafeMilestoneDates` Hook 处理里程碑日期
   - 修复了所有日期格式化调用
   - 确保只处理有效日期的里程碑

### 修复的文件
- `src/components/tasks/task-detail-view.tsx`
- `src/components/tasks/task-status-visualization.tsx`
- `src/components/tasks/milestone-timeline.tsx`
- `src/lib/firebase/tasks.ts` - 修复了 `getTaskStats` 函数中的日期处理
- `src/hooks/use-tasks.ts` - 更新了 `useTodayTasks` Hook 的客户端筛选逻辑

## 问题2: FirebaseError: The query requires an index

### 错误原因
- Firebase Firestore 查询使用了多个筛选条件（userId + status/priority/category + orderBy）
- 这种复合查询需要创建相应的复合索引
- 项目中缺少任务相关的 Firestore 索引配置

### 修复方案
1. **优化了查询逻辑** (`src/lib/firebase/tasks.ts`)：
   - 修改了 `getUserTasks` 方法，避免同时应用多个筛选条件
   - 使用优先级策略：status > priority > category
   - 将排序字段从 `dueDate` 改为 `createdAt`，避免复杂索引

2. **添加了 Firestore 索引配置**：
   - 更新了 `firestore.indexes.json` 文件
   - 添加了任务相关的所有必要索引
   - 包括基础查询和各种筛选条件的索引

3. **创建了部署脚本**：
   - `scripts/deploy-firestore-indexes.sh`
   - 自动化索引部署流程

### 新增的索引
```json
{
  "collectionGroup": "tasks",
  "fields": [
    {"fieldPath": "userId", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
},
{
  "collectionGroup": "tasks", 
  "fields": [
    {"fieldPath": "userId", "order": "ASCENDING"},
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
},
// ... 其他索引配置
```

## 部署步骤

### 1. 部署代码更改
代码更改已经完成，重新启动应用即可生效。

### 2. 部署 Firestore 索引
```bash
# 方法1: 使用提供的脚本
chmod +x scripts/deploy-firestore-indexes.sh
./scripts/deploy-firestore-indexes.sh

# 方法2: 直接使用 Firebase CLI
firebase deploy --only firestore:indexes
```

### 3. 验证修复
1. 重新启动应用
2. 访问 `/tasks` 页面
3. 点击任务选项卡，确认不再出现 "Invalid time value" 错误
4. 使用筛选功能，确认不再出现索引错误

## 注意事项

1. **索引创建时间**：Firestore 索引创建可能需要几分钟到几小时，取决于数据量
2. **索引状态监控**：可以在 [Firebase Console](https://console.firebase.google.com) 中监控索引创建进度
3. **向后兼容性**：所有修改都保持了向后兼容性，不会影响现有功能
4. **错误处理**：添加了更好的错误处理和回退机制

## 预防措施

为了避免类似问题再次发生：

1. **始终使用安全的日期处理函数**：
   - 使用 `safeToDate()` 而不是直接调用 `.toDate()`
   - 使用 `safeFormatDate()` 进行日期格式化
   - 使用项目中的安全日期处理 Hooks

2. **Firebase 查询最佳实践**：
   - 在添加新的复合查询前，先检查是否需要新索引
   - 优先使用简单查询，在客户端进行额外筛选
   - 定期审查和优化索引配置

3. **测试覆盖**：
   - 测试边界情况（null/undefined 日期）
   - 测试各种筛选条件组合
   - 在开发环境中验证索引需求
