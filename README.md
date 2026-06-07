# GBrain Web

> GBrain 的 Web 管理界面 / Web-based management console for GBrain personal knowledge base.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)](https://tailwindcss.com/)
[![MCP](https://img.shields.io/badge/MCP-JSON--RPC-orange)](https://modelcontextprotocol.io/)

English &middot; [中文](#中文)

---

<a name="english"></a>

## English

A web-based dashboard for managing your [GBrain](https://github.com/zhilinYu/gbrain) personal knowledge base. Built with Next.js 16 and communicates with GBrain via the MCP JSON-RPC protocol.

### ✨ Features

| | |
|---|---|
| **Dashboard** | Stats overview, health status, recent updates |
| **Memory Library** | Browse memories with type/tag filters and sorting |
| **Memory Detail** | Full Markdown rendering, link graph, timeline view |
| **Search** | Keyword search + semantic querying |
| **Knowledge Graph** | Interactive force-directed graph visualization |
| **Export** | Batch export memories as JSON |
| **Settings** | Token configuration for GBrain connection |

### Prerequisites

- [GBrain](https://github.com/zhilinYu/gbrain) installed and running
- Node.js 20+

### Quick Start

```bash
# 1. Start the GBrain MCP service
gbrain serve --http --port 8787

# 2. Create an access token
gbrain auth create "gbrain-web" --scopes read

# 3. Clone and install
git clone https://github.com/zhilinYu/gbrain-web.git
cd gbrain-web
npm install

# 4. Configure environment
cp .env.example .env.local
# Edit .env.local and set your GBRAIN_TOKEN

# 5. Start dev server
npm run dev
```

Open http://localhost:3000, then go to **Settings** page and paste your `gbrain_xxx` token.

### Tech Stack

- **Next.js 16** — React framework with App Router
- **Tailwind CSS 4** — Utility-first CSS
- **shadcn/ui** — Accessible UI components
- **Zustand** — Lightweight state management
- **D3 Force** — Interactive knowledge graph
- **MCP JSON-RPC** — GBrain API communication

### Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── api/gbrain/route.ts     # MCP proxy route
│   ├── memory/                 # Memory Library & Detail
│   ├── search/                 # Search page
│   ├── graph/                  # Knowledge Graph
│   ├── export/                 # Export page
│   └── settings/               # Settings page
├── components/
│   ├── layout/                 # Sidebar, Header
│   ├── dashboard/              # Stats, Health, Recents
│   ├── memory/                 # Memory editor
│   └── graph/                  # Graph visualization
├── lib/
│   ├── gbrain.ts               # MCP Client
│   ├── store.ts                # Zustand Store
│   └── utils.ts                # Utility functions
└── types/
    └── gbrain.ts               # TypeScript definitions
```

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_GBRAIN_URL=http://localhost:8787
GBRAIN_URL=http://localhost:8787
GBRAIN_TOKEN=gbrain_xxxxx
```

### Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

### License

[MIT](LICENSE) © 2026 喻志林 (zhilinYu)

---

<a name="中文"></a>

## 中文

GBrain 个人知识库的 Web 管理界面。基于 Next.js 16，通过 MCP JSON-RPC 协议与 GBrain 服务通信。

### ✨ 功能一览

| | |
|---|---|
| **Dashboard** | 统计概览、健康状态、最近更新 |
| **记忆库** | 记忆列表，支持类型/标签过滤、排序 |
| **记忆详情** | Markdown 渲染、链接查看、时间线 |
| **搜索** | 关键词搜索和智能语义搜索 |
| **知识图谱** | 交互式力导向图可视化 |
| **导出** | 批量导出记忆为 JSON |
| **设置** | GBrain 连接 Token 配置 |

### 前置条件

- 已安装并运行 [GBrain](https://github.com/zhilinYu/gbrain)
- Node.js 20+

### 快速开始

```bash
# 1. 启动 GBrain MCP 服务
gbrain serve --http --port 8787

# 2. 创建访问令牌
gbrain auth create "gbrain-web" --scopes read

# 3. 克隆并安装
git clone https://github.com/zhilinYu/gbrain-web.git
cd gbrain-web
npm install

# 4. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入你的 GBRAIN_TOKEN

# 5. 启动开发服务器
npm run dev
```

打开 http://localhost:3000，进入 **Settings** 页面粘贴 `gbrain_xxx` Token。

### 技术栈

- **Next.js 16** — React 框架（App Router）
- **Tailwind CSS 4** — 原子化 CSS
- **shadcn/ui** — 无障碍 UI 组件
- **Zustand** — 轻量状态管理
- **D3 Force** — 交互式知识图谱
- **MCP JSON-RPC** — GBrain API 通信

### 项目结构

```
src/
├── app/                        # Next.js App Router 页面
│   ├── api/gbrain/route.ts     # MCP 代理路由
│   ├── memory/                 # 记忆库 & 详情
│   ├── search/                 # 搜索页
│   ├── graph/                  # 知识图谱
│   ├── export/                 # 导出页
│   └── settings/               # 设置页
├── components/
│   ├── layout/                 # 侧边栏、顶栏
│   ├── dashboard/              # 统计、健康状态、最近更新
│   ├── memory/                 # 记忆编辑器
│   └── graph/                  # 图谱可视化
├── lib/
│   ├── gbrain.ts               # MCP 客户端
│   ├── store.ts                # Zustand 状态
│   └── utils.ts                # 工具函数
└── types/
    └── gbrain.ts               # TypeScript 类型定义
```

### 环境变量

```env
# .env.local
NEXT_PUBLIC_GBRAIN_URL=http://localhost:8787
GBRAIN_URL=http://localhost:8787
GBRAIN_TOKEN=gbrain_xxxxx
```

### 参与贡献

欢迎贡献！请先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。

1. Fork 本仓库
2. 创建功能分支（`git checkout -b feature/xxx`）
3. 提交变更（`git commit -m 'feat: add xxx'`）
4. 推送到分支（`git push origin feature/xxx`）
5. 打开 Pull Request

### 开源协议

[MIT](LICENSE) © 2026 喻志林 (zhilinYu)
