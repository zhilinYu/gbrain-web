# GBrain Web - 记忆治理控制台

> GBrain 的 Web 管理界面，基于 MCP JSON-RPC 协议。将 AI Agent 的记忆可视化为知识图谱。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)

[English](./README.md)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FzhilinYu%2Fgbrain-web&env=GBRAIN_URL,NEXT_PUBLIC_GBRAIN_URL&envDescription=GBrain%20MCP%20server%20URL&envLink=https%3A%2F%2Fgithub.com%2FzhilinYu%2Fgbrain-web%23environment-variables)

![Dashboard](./public/screenshot-dashboard.png)
![Memory Library](./public/screenshot-library.png)
![Knowledge Graph](./public/screenshot-graph.png)

## 功能

- **Dashboard** - 统计概览、健康评分、最近更新
- **记忆库** - 浏览记忆，支持类型/标签过滤和排序
- **知识图谱** - 交互式力导向图，可视化记忆关联
- **记忆详情** - Markdown 渲染、反向链接、时间线历史
- **语义搜索** - 关键词搜索 + 向量语义搜索
- **批量导出** - 导出记忆为 JSON
- **设置** - Token 配置

## 快速开始

### 1. 启动 GBrain 服务

```bash
# 启动 GBrain MCP 服务
gbrain serve --http --port 8787

# 创建访问 Token
gbrain auth create "gbrain-web" --takes-holders world
```

### 2. 安装并启动

```bash
npm install
npm run dev
```

### 3. 配置 Token

打开 http://localhost:3000，进入设置页面：

1. 复制上一步生成的 `gbrain_xxx` Token
2. 粘贴到 Token 输入框
3. 点击保存

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 样式 | Tailwind CSS 4 |
| UI | shadcn/ui |
| 状态 | Zustand |
| 协议 | MCP JSON-RPC |
| 图谱 | D3.js 力导向图 |

## 项目结构

```
src/
├── app/
│   ├── (dashboard)/page.tsx    # Dashboard
│   ├── memory/
│   │   ├── page.tsx            # 记忆库
│   │   └── [slug]/page.tsx     # 记忆详情
│   ├── graph/page.tsx          # 知识图谱
│   ├── search/page.tsx         # 搜索
│   ├── export/page.tsx         # 导出
│   ├── settings/page.tsx       # 设置
│   └── api/gbrain/route.ts    # MCP 代理
├── components/
│   ├── layout/                 # Sidebar, Header
│   ├── dashboard/              # StatCards, RecentList, HealthStatus
│   ├── graph/                  # GraphViewer
│   └── ui/                     # shadcn/ui 组件
├── lib/
│   ├── gbrain.ts               # MCP Client
│   └── store.ts                # Zustand Store
└── types/
    └── gbrain.ts               # TypeScript 类型
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `GBRAIN_URL` | `http://localhost:8787` | GBrain MCP 服务地址（服务端） |
| `NEXT_PUBLIC_GBRAIN_URL` | `http://localhost:8787` | GBrain MCP 服务地址（客户端） |

## 使用的 MCP 工具

| 工具 | 说明 |
|------|------|
| `get_stats` | 获取记忆统计 |
| `get_health` | 获取健康评分 |
| `list_pages` | 列出记忆页面 |
| `get_page` | 获取页面详情 |
| `search` | 关键词搜索 |
| `query` | 语义搜索 |
| `get_links` / `get_backlinks` | 获取页面链接 |
| `get_timeline` | 获取时间线 |
| `get_tags` | 获取标签 |
| `build_graph` | 构建知识图谱 |

## 贡献

欢迎提交 PR！详见 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 许可证

[MIT](./LICENSE)
