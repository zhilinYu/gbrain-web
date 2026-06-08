# GBrain Web - 记忆治理控制台

> GBrain 的 Web 管理界面，基于 MCP JSON-RPC 协议

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)

![Dashboard](./public/screenshot-dashboard.png)

## 功能

- **Dashboard** - 统计概览、健康状态、最近更新
- **Memory Library** - 记忆列表，支持类型/标签过滤、排序
- **Memory Detail** - 记忆详情，支持 Markdown 渲染、链接查看、时间线
- **Search** - 关键词搜索和智能语义搜索
- **Export** - 批量导出记忆为 JSON
- **Settings** - Token 配置

## 快速开始

### 1. 启动 GBrain 服务

```bash
# 启动 GBrain MCP 服务
gbrain serve --http --port 8787

# 创建访问 Token
gbrain auth create "gbrain-web" --takes-holders world
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 访问应用

打开 http://localhost:3000

首次使用需要配置 Token（Settings 页面）：

1. 复制上一步生成的 `gbrain_xxx` Token
2. 粘贴到 Settings 页面的 Token 输入框
3. 点击保存

## 技术栈

- **Next.js 16** - React 框架
- **Tailwind CSS 4** - 样式
- **shadcn/ui** - UI 组件
- **Zustand** - 状态管理
- **MCP JSON-RPC** - GBrain 接口调用

## 项目结构

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── page.tsx         # Dashboard 首页
│   ├── memory/
│   │   ├── page.tsx         # Memory Library
│   │   └── [slug]/page.tsx  # Memory Detail
│   ├── search/page.tsx      # Search 页
│   ├── export/page.tsx      # Export 页
│   ├── settings/page.tsx    # Settings 页
│   ├── api/gbrain/route.ts  # MCP 代理路由
│   └── layout.tsx           # 根布局
├── components/
│   ├── layout/              # Sidebar, Header
│   ├── dashboard/          # StatCards, RecentList, HealthStatus
│   └── ui/                 # shadcn/ui 组件
├── lib/
│   ├── gbrain.ts           # MCP Client
│   ├── store.ts            # Zustand Store
│   └── utils.ts            # 工具函数
└── types/
    └── gbrain.ts           # 类型定义
```

## 环境变量

```env
NEXT_PUBLIC_GBRAIN_URL=http://localhost:8787
GBRAIN_URL=http://localhost:8787
```

## MCP 工具

项目使用以下 GBrain MCP 工具：

- `get_stats` - 获取统计信息
- `get_health` - 获取健康状态
- `list_pages` - 列表页面
- `get_page` - 获取页面详情
- `search` - 关键词搜索
- `query` - 语义搜索
- `get_links` / `get_backlinks` - 获取链接
- `get_timeline` - 获取时间线
- `get_tags` - 获取标签

## 许可证

MIT
