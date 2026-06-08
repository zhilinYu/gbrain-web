# gbrain-web MVP 方案设计（修正版）

> **变更日志**：2026-05-15 基于实际 GBrain v0.34.4 HTTP MCP API 验证结果修正。
> - 重写 API 设计部分：**MCP JSON-RPC over SSE**，非 REST
> - 删除虚构功能：Memory Inbox、Agent Profiles（GBrain 无对应接口）
> - 修正数据流：SSE 格式 + Accept 头要求
> - Fuse.js 仅用于 autocomplete，正式搜索走 GBrain `query`/`search` 工具
> - 同步策略改为手动刷新，无需 polling

---

## 1. 产品定位

**一句话定位**：GBrain 的 Web 管理界面 — 记忆治理控制台

**核心价值**：
- 人类可读的记忆浏览与审查
- 基于 MCP 协议的轻量级记忆查询与管理
- 记忆导出（Agent context bundle）

**差异化**（对比 OpenMemory 等竞品）：
- 不做 temporal graph / 时间线图谱
- 不做 Obsidian 克隆
- 专注"记忆治理 + MCP 原生管理"

---

## 2. MVP 功能模块

### 2.1 Dashboard（首页概览）
- 统计卡片：通过 `get_stats` 获取页面数、Chunk 数、链接数、标签数
- 最近更新的记忆列表：`list_pages` 带 `sort=updated_desc`
- 健康状态：`get_health` / `run_doctor`
- 快速搜索入口：跳转到 Search 页

### 2.2 Memory Library（记忆库）
- **列表视图**：`list_pages` — 支持 `type` / `tag` 过滤，`sort` 排序，`limit` 分页
- **过滤**：按 type（concept/project/decision）、按 tag
- **排序**：按更新时间、创建时间
- **预览**：点击行 → `get_page` 获取完整内容 + 前端渲染 Markdown

### 2.3 Search & Query（搜索查询）
- **关键词搜索**（前台，可选） → Fuse.js 客户端快速过滤
- **正式搜索**（后台）：
  - `search`：关键词全文检索（tsvector）
  - `query`：混合搜索（向量 + 关键词 + 多查询扩展）
- **结果展示**：标题 + 片段 + 类型 + 更新时间
- **快速跳转**：点击结果调用 `get_page` 查看详情

### 2.4 Export（导出）
- **简单导出**：`list_pages` + 批量 `get_page` → 组装 JSON bundle
- **格式**：JSON（每个记忆含 slug / type / title / content / tags / timeline）
- **CLI 兜底**：用户可手动运行 `gbrain export --dir ./out/`

### 2.5 Memory Detail（记忆详情）
- `get_page` 返回完整 Markdown（frontmatter + 内容 + timeline）
- 前端渲染：frontmatter 元数据面板 + Markdown 内容
- 关联页面：`get_links` / `get_backlinks` / `traverse_graph`
- 时间线：`get_timeline`
- 标签管理：`get_tags` / `add_tag` / `remove_tag`
- **编辑**（Phase 2）：`put_page` — Markdown 编辑器 + 预览

---

## 3. 技术选型

### 3.1 前端
- **框架**：Next.js 14 App Router
- **UI**：Tailwind CSS + shadcn/ui
- **状态**：Zustand
- **搜索（客户端）**：Fuse.js（仅用于搜索框 autocomplete 快速过滤）
- **图标**：Lucide React

### 3.2 后端集成
- **GBrain HTTP Transport（MCP over SSE）**：
  - 端点：`POST http://localhost:8787/mcp`
  - 协议：MCP JSON-RPC 2.0 over SSE
  - 认证：`Authorization: Bearer <token>`
  - 必要请求头：`Accept: application/json, text/event-stream`
- **不引入独立后端** — Next.js API Routes 作为 MCP 调用代理

### 3.3 数据流
```
浏览器
  │
  ├─ [直接调用，仅 get/list/stat 等只读操作]
  │   POST /api/gbrain → 转发 MCP JSON-RPC → gbrain serve --http (localhost:8787/mcp) → PGLite
  │
  └─ [走 Next.js API Routes，写操作或需要服务端处理]
      Next.js API Route → fetch(gbrain MCP HTTP) → PGLite
      ↑
  前端 fetch('/api/gbrain/mcp', { method: 'POST', body: JSON-RPC payload })
```

MCP 调用请求/响应格式:
```json
// 请求
POST /mcp
Content-Type: application/json
Accept: application/json, text/event-stream
Authorization: Bearer gbrain_xxxx

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_stats",
    "arguments": {}
  }
}

// 响应（SSE 格式）
event: message
data: {"result":{"content":[{"type":"text","text":"{\"page_count\":5,...}"}]},"jsonrpc":"2.0","id":1}
```

---

## 4. API 设计

### 4.1 GBrain MCP 工具清单（直接可用的 59 个工具）

以下为 gbrain-web 核心页面所需的关键工具：

| MCP 工具 | 用途 | 对应页面 |
|----------|------|---------|
| `get_stats` | 统计概览（page_count, chunk_count, link_count, tag_count, pages_by_type） | Dashboard |
| `get_health` | 健康状态（embed 覆盖率、stale pages、orphans） | Dashboard |
| `run_doctor` | 完整诊断报告 | Dashboard |
| `list_pages` | 列表页面：filter by type/tag, sort by updated, limit 分页 | Memory Library |
| `get_page` | 获取单页完整内容（Markdown frontmatter + body + timeline） | Memory Detail |
| `put_page` | 写入/更新页面（content 含 YAML frontmatter） | Memory Edit (Phase 2) |
| `delete_page` | 软删除页面 | Memory Library (Phase 2) |
| `search` | 关键词全文检索（query + limit + offset） | Search |
| `query` | 混合搜索（向量 + 关键词 + 扩展：support salience/recency/filters） | Search |
| `get_tags` | 获取页面的标签列表 | Memory Detail |
| `add_tag` / `remove_tag` | 添加/移除标签 | Memory Detail |
| `get_links` / `get_backlinks` | 关联链接（出链/入链） | Memory Detail |
| `traverse_graph` | 图遍历（depth + type/direction filters） | Memory Detail |
| `get_timeline` | 时间线 | Memory Detail |
| `add_timeline_entry` | 添加 timeline 条目 | Memory Detail (Phase 2) |
| `get_versions` / `revert_version` | 版本历史与回滚 | Memory Detail (Phase 2) |
| `find_orphans` | 孤立页面检测 | Dashboard (Phase 2) |
| `get_recent_salience` | 情绪 + 活动重要性排序（v0.29） | Dashboard 热点 |

### 4.2 Next.js API Routes

只暴露一个代理路由：

```
/api/gbrain/route.ts          # POST：接收前端 JSON-RPC payload，转发 MCP HTTP
```

其他所有逻辑由前端直接通过此代理调用对应的 MCP 工具。

---

## 5. 组件架构

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── page.tsx          # Dashboard（get_stats + list_pages + get_health）
│   │   └── memory/
│   │       ├── page.tsx      # Memory Library（list_pages）
│   │       └── [slug]/
│   │           └── page.tsx  # Memory Detail（get_page + get_links + get_timeline + get_tags）
│   ├── search/
│   │   └── page.tsx          # Search（search + query 切换）
│   ├── export/
│   │   └── page.tsx          # Export（批量导出）
│   ├── api/
│   │   └── gbrain/
│   │       └── route.ts      # 单一 MCP 代理
│   ├── layout.tsx            # 根布局
│   └── page.tsx              # 根 redirect → dashboard
├── components/
│   ├── ui/                   # shadcn/ui 组件
│   ├── layout/               # Sidebar + Header
│   ├── memory/               # MemoryCard, MemoryList, MemoryDetail, TagManager
│   ├── search/               # SearchInput, SearchResults, SearchHit
│   └── dashboard/            # StatCards, RecentList, HealthStatus
├── lib/
│   ├── gbrain.ts             # MCP Client：封装 JSON-RPC over HTTP fetch
│   ├── store.ts              # Zustand store
│   └── utils.ts              # 工具函数
└── types/
    └── gbrain.ts             # 类型定义（MCP Response, Page, Stats 等）
```

---

## 6. 实现优先级

### Phase 1：基础框架（P0）
1. Next.js 项目初始化 + Tailwind + shadcn/ui
2. `lib/gbrain.ts` — MCP Client（封装 JSON-RPC fetch，含 auth header + Accept header）
3. 基础布局（Sidebar + Header）
4. `api/gbrain/route.ts` — MCP 代理路由

### Phase 2：核心页面（P1）
1. **Dashboard**：StatCards（get_stats）+ RecentList（list_pages sort=updated_desc）+ HealthStatus（get_health）
2. **Memory Library**：list_pages + type/tag filter + 分页 + 搜索跳转
3. **Memory Detail**：get_page 渲染 Markdown + get_tags + get_links/backlinks + get_timeline
4. **Search**：search（关键词）+ query（混合搜索）+ 结果展示 + 跳转详情

### Phase 3：增强功能（P2）
1. **Export 页**：选定页面 + 批量 get_page → JSON bundle 下载
2. **Memory 编辑**：put_page 写入 Markdown（编辑器 + 预览）
3. **图表增强**：traverse_graph 可视化简单图关系
4. **搜索增强**：query 高级参数（salience/recency/since/until）

---

## 7. 关键决策

### 7.1 为什么只用一层 API Route？
- GBrain HTTP MCP 只需一个 `POST /mcp` 端点
- 无需拆成多个 REST 端点，减少维护
- MCP 工具名就是"路由"
- 前端 `lib/gbrain.ts` 负责调用工具，后端不介入业务逻辑

### 7.2 认证策略
- 复用 GBrain Bearer Token
- 前端 Token 存 localStorage
- 首次使用：指引用户 `gbrain auth create "gbrain-web" --takes-holders world`
- `/admin` Dashboard 页面也可直接用浏览器访问（内网环境可开启 DCR）

### 7.3 搜索策略
- **搜索框 autocomplete**：Fuse.js 本地过滤已有列表（即时响应）
- **正式搜索提交**：走 GBrain `search`（关键词）或 `query`（混合向量搜索）
- 不重复实现向量搜索，那是 GBrain 的核心能力

### 7.4 刷新策略
- **全部手动触发**：用户点击刷新按钮或导航时重新请求
- 无 polling — GBrain 是本地 PGLite，写入即时可见

---

## 8. 验收标准

- [ ] Dashboard 正确显示 `get_stats` 统计 + `list_pages` 最近 + `get_health` 状态
- [ ] Memory Library 支持按 type/tag 过滤、分页、刷新
- [ ] `search`（关键词）和 `query`（混合搜索）均可正常工作
- [ ] Memory Detail 完整展示 frontmatter + Markdown 内容 + tags + links + timeline
- [ ] Export 页可勾选页面 + 导出 JSON bundle
- [ ] 响应式设计，支持移动端

---

## 附录 A：验证过的 MCP 调用示例

```bash
# 1. 启动 GBrain Server
gbrain serve --http --port 8787

# 2. 创建 Token
gbrain auth create "gbrain-web" --takes-holders world

# 3. 测试 get_stats（正确返回 JSON）
curl -X POST http://localhost:8787/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer gbrain_xxx" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_stats","arguments":{}}}'

# 4. 测试 list_pages
curl -X POST http://localhost:8787/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer gbrain_xxx" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_pages","arguments":{"limit":10,"sort":"updated_desc"}}}'

# 5. 测试 get_page
curl -X POST http://localhost:8787/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer gbrain_xxx" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_page","arguments":{"slug":"tools/agent-ecosystem"}}}'
```
