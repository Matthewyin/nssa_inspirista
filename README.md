# Inspirista / 灵感笔记

[English](#english) | [中文](#中文)

---

## English

Inspirista is a Next.js application designed to help users capture, refine, and organize their thoughts, ideas, and inspirations. It leverages AI to enhance the note-taking experience and uses Firebase for seamless authentication and real-time data synchronization.

This project was built in Firebase Studio.

### Features

-   **Cloud-Synced Notes**: Create, edit, and delete notes that are saved to your account.
-   **Dual Note Categories**:
    -   **Inspirations**: Capture creative ideas and thoughts in a flexible card layout
    -   **Checklists**: Organize tasks with drag-and-drop sorting, completion tracking, and list view
-   **Interactive Features**:
    -   **Drag & Drop Sorting**: Manually reorder checklist items with smooth animations
    -   **Batch Operations**: Select and delete multiple items at once
    -   **Smart Filtering**: Filter items by completion status (All/Pending/Completed)
    -   **Click-to-Edit**: Click any note card to enter edit mode
-   **Firebase Integration**:
    -   **Authentication**: Secure user login with Google Sign-In
    -   **Firestore**: Real-time database for storing and syncing notes across devices
    -   **Security Rules**: Proper data access control and user isolation
-   **AI-Powered Features (via Genkit)**:
    -   **Refine Notes**: Use Google Gemini to automatically organize and summarize note content
    -   **Suggest Tags**: Automatically get tag suggestions based on your note's content
    -   **API Key Management**: Secure local storage of your own AI API keys
-   **User Experience**:
    -   **Multi-Language Support**: Full UI available in English and Chinese
    -   **Theme Switching**: Light and Dark mode support
    -   **Responsive Design**: Works seamlessly on desktop and mobile devices
    -   **Real-time Updates**: Changes sync instantly across all your devices

---

## 中文

Inspirista 是一个基于 Next.js 的应用程序，旨在帮助用户捕捉、完善和整理他们的想法、创意和灵感。它利用 AI 技术增强笔记体验，并使用 Firebase 实现无缝身份验证和实时数据同步。

该项目在 Firebase Studio 中构建。

### 功能特性

-   **云端同步笔记**: 创建、编辑和删除保存到您账户的笔记。
-   **双重笔记分类**:
    -   **灵感笔记**: 以灵活的卡片布局捕捉创意想法和思考
    -   **清单管理**: 通过拖拽排序、完成状态跟踪和列表视图组织任务
-   **交互功能**:
    -   **拖拽排序**: 通过流畅的动画手动重新排列清单项目
    -   **批量操作**: 一次选择和删除多个项目
    -   **智能筛选**: 按完成状态筛选项目（全部/待完成/已完成）
    -   **点击编辑**: 点击任何笔记卡片即可进入编辑模式
-   **Firebase 集成**:
    -   **身份验证**: 通过 Google 登录的安全用户认证
    -   **Firestore**: 用于跨设备存储和同步笔记的实时数据库
    -   **安全规则**: 适当的数据访问控制和用户隔离
-   **AI 驱动功能 (通过 Genkit)**:
    -   **优化笔记**: 使用 Google Gemini 自动整理和总结笔记内容
    -   **标签建议**: 根据笔记内容自动获取标签建议
    -   **API 密钥管理**: 安全地本地存储您自己的 AI API 密钥
-   **用户体验**:
    -   **多语言支持**: 完整的中英文界面
    -   **主题切换**: 支持浅色和深色模式
    -   **响应式设计**: 在桌面和移动设备上无缝工作
    -   **实时更新**: 更改在您的所有设备上即时同步

---

## Tech Stack / 技术栈

- **Framework / 框架**: [Next.js](https://nextjs.org/) (with App Router / 使用 App Router)
- **Authentication / 身份验证**: [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Database / 数据库**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Hosting / 托管**: Configured for [Firebase App Hosting](https://firebase.google.com/docs/hosting)
- **AI / 人工智能**: [Genkit](https://firebase.google.com/docs/genkit)
- **UI / 用户界面**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Components / 组件**: [shadcn/ui](https://ui.shadcn.com/)
- **Drag & Drop / 拖拽**: [@dnd-kit](https://dndkit.com/)

## Getting Started / 开始使用

### 1. Prerequisites / 前置要求

- [Node.js](https://nodejs.org/en) (v18 or later / v18 或更高版本)
- A Firebase Project / 一个 Firebase 项目

### 2. Installation / 安装

Clone the repository and install the dependencies:
克隆仓库并安装依赖：

```bash
git clone https://github.com/Matthewyin/nssa_inspirista.git
cd nssa_inspirista
npm install
```

### 3. Firebase Configuration / Firebase 配置

You need to connect the app to your Firebase project.
您需要将应用连接到您的 Firebase 项目。

1. Create a `.env` file in the root of the project:
   在项目根目录创建 `.env` 文件：
   ```bash
   touch .env
   ```

2. Go to your Firebase project settings in the [Firebase Console](https://console.firebase.google.com/).
   在 [Firebase 控制台](https://console.firebase.google.com/) 中进入您的 Firebase 项目设置。

3. Under "Your apps", select your web app.
   在"您的应用"下，选择您的 Web 应用。

4. Copy the Firebase configuration object (SDK setup and configuration).
   复制 Firebase 配置对象（SDK 设置和配置）。

5. Paste the corresponding values into your `.env` file. It should look like this:
   将相应的值粘贴到您的 `.env` 文件中。它应该看起来像这样：

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=1:...:web:...
   ```

### 4. Firestore Security Rules / Firestore 安全规则

Deploy the Firestore security rules to enable proper data access:
部署 Firestore 安全规则以启用适当的数据访问：

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 5. Run the Development Server / 运行开发服务器

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.
在浏览器中打开 [http://localhost:9002](http://localhost:9002) 查看结果。

## Usage / 使用方法

### Inspirations / 灵感笔记
- Click the "+" button to create new inspiration notes
- Click any note card to edit it
- Use AI features to refine content and suggest tags
- 点击"+"按钮创建新的灵感笔记
- 点击任何笔记卡片进行编辑
- 使用 AI 功能优化内容和建议标签

### Checklists / 清单管理
- Create checklist items for task management
- Drag items up and down to reorder them
- Check off completed items
- Filter by completion status
- 创建清单项目进行任务管理
- 上下拖拽项目进行重新排序
- 勾选已完成的项目
- 按完成状态筛选

### AI Features / AI 功能
- Go to Settings to configure your AI API keys
- Use "Refine with AI" to improve note content
- Use "Suggest Tags" to get relevant tags
- 前往设置配置您的 AI API 密钥
- 使用"AI 优化"改进笔记内容
- 使用"建议标签"获取相关标签

## Contributing / 贡献

Contributions are welcome! Please feel free to submit a Pull Request.
欢迎贡献！请随时提交 Pull Request。

## License / 许可证

This project is open source and available under the [MIT License](LICENSE).
该项目是开源的，采用 [MIT 许可证](LICENSE)。
