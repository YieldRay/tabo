# Tabo - Browser Extension Copilot Instructions

## 项目概述
Tabo 是一个基于 **WXT 框架**的浏览器扩展（Edge/Firefox），用于管理浏览器书签。使用 React 19、TanStack Query、Radix UI 和 Tailwind CSS v4。

## 架构要点

### WXT Framework 核心
- **入口点**: `entrypoints/newtab.html` → 使用 `@/src/newtab.tsx` 作为模块入口
- **配置**: `wxt.config.ts` 定义 manifest 权限（`bookmarks`）和 Vite 配置
- **路径别名**: 使用 `@/` 前缀指向项目根目录（如 `@/src/hooks/bookmark`）
- **TypeScript**: `tsconfig.json` extends `./.wxt/tsconfig.json`，React JSX 模式

### 数据流架构
1. **Browser API**: `browser.bookmarks.getTree()` 获取原始书签树
2. **TanStack Query**: `useQueryBookmarksTree` hook 管理状态，包含自动失效监听
3. **实时同步**: 监听 `browser.bookmarks` 事件（onCreated/onRemoved/onChanged/onMoved）自动 invalidate query
4. **数据转换**: `bookmarkUtils.ts` 提供扁平化、搜索、排序工具函数

### 关键数据结构
```typescript
// 原始树形结构（从 browser API）
BookmarkTreeNode { id, title, url?, children?, parentId?, dateAdded? }

// 扁平化结构（用于列表显示）
FlatBookmark { id, title, url, dateAdded, parentId, parentPath }

// 应用状态
AppState { currentFolderId, searchQuery, sortField, sortOrder, viewMode }
```

## 组件架构

### 主容器层级
```
App (QueryClientProvider)
└─ Bookmark (数据加载 + 错误处理)
   └─ BookmarkManager (状态管理中心)
      ├─ Sidebar (文件夹树 + 全局搜索)
      ├─ Breadcrumb (路径导航 + 局部搜索)
      └─ BookmarkList (虚拟化列表 + 多视图)
```

### 重要模式

#### 1. 虚拟化渲染
- 使用 `@tanstack/react-virtual` 处理大量书签
- 分组渲染: 根据 `viewMode` (1/2/4列) 将行分组
- **关键**: `key={view-${viewMode}}` 强制重新初始化 virtualizer

#### 2. 文件夹树（Sidebar）
- 使用 `@headless-tree/react` + `@headless-tree/core`
- 创建虚拟根节点包装顶层文件夹
- 递归子文件夹检测：区分空文件夹和包含子文件夹的文件夹

#### 3. 自动导航逻辑
- `BookmarkManager` 初始化时，如果根节点无直接书签，自动选择第一个文件夹
- 使用 `useRef(hasInitialized)` 确保只执行一次

#### 4. 全局搜索 vs 局部搜索
- **局部搜索**: `Breadcrumb` 中搜索当前文件夹
- **全局搜索**: `GlobalSearch` 对话框，支持正则表达式和大小写敏感

## 开发工作流

### 运行命令
```bash
pnpm dev          # 开发模式 (Edge)
pnpm dev:firefox  # Firefox 开发模式
pnpm build        # 生产构建
pnpm zip          # 打包扩展
```

### 依赖说明
- **UI 库**: Radix UI Themes（使用 `<Box>`, `<Flex>`, `<Text>` 等）
- **样式**: Tailwind CSS v4 via `@tailwindcss/vite` 插件
- **表格**: TanStack Table（排序功能）
- **状态**: TanStack Query（无需 Redux/Zustand）

## 编码约定

### 1. 中文优先
- UI 文本、注释、错误消息使用中文
- 代码标识符使用英文

### 2. 导入路径
- 使用 `@/src/` 别名，不使用相对路径 `../`
- 示例: `import { useQueryBookmarksTree } from "@/src/hooks/bookmark"`

### 3. 类型定义
- 所有 bookmark 相关类型定义在 `src/types/bookmark.ts`
- 工具函数使用严格类型注解（包含参数和返回值）

### 4. 组件结构
- 功能组件使用 `export function ComponentName()`
- Props 接口命名: `ComponentNameProps`
- 使用 `useMemo` 优化昂贵计算（如数据转换、过滤）

### 5. 性能优化模式
- 列表使用虚拟化（`@tanstack/react-virtual`）
- 滚动容器引用: `tableContainerRef`
- 文件夹切换时重置滚动位置: `useEffect(() => { ref.current.scrollTop = 0 }, [folderId])`

## 常见任务

### 添加新排序字段
1. 更新 `src/types/bookmark.ts` 中的 `SortField` 类型
2. 在 `BookmarkList.tsx` 添加新列定义
3. 更新 `bookmarkUtils.ts` 中的 `sortBookmarks` 函数

### 添加新视图模式
1. 更新 `ViewMode` 类型（必须是 1/2/4/8 等网格兼容值）
2. 在 `BookmarkList.tsx` 的 `SegmentedControl` 添加选项
3. 确保 `BookmarkGridRow` 组件的 `Grid columns` prop 正确处理

### 扩展浏览器 API 权限
1. 修改 `wxt.config.ts` 中的 `manifest.permissions` 数组
2. 运行 `pnpm postinstall` 重新生成 manifest

## 调试技巧
- 使用浏览器扩展开发者工具检查 `browser.bookmarks` API
- React Query Devtools 可添加用于调试查询状态
- 虚拟化问题: 检查 `estimateSize` 和 `measureElement` 配置
