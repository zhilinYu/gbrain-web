/**
 * GBrain MCP Client
 *
 * 封装 MCP JSON-RPC over HTTP 的调用逻辑
 * GBrain 通过 gbrain serve --http --port 8787 暴露 MCP 端点
 *
 * 已基于 GBrain v0.34.4 实际 API 验证
 *
 * Token 通过 httpOnly cookie 自动携带，客户端无需手动传递
 */

import type {
  MCPRPCRequest,
  MCPRPCResponse,
  GBrainPage,
  GBrainPageDetail,
  GBrainStats,
  GBrainHealth,
  SearchResult,
  QueryOptions,
  GraphData,
  GraphNode,
  GraphEdge,
} from "@/types/gbrain"

// Token 管理 — 通过 /api/auth/token 端点操作 httpOnly cookie
export async function setGbrainToken(token: string): Promise<void> {
  const res = await fetch("/api/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  })
  if (!res.ok) throw new Error("Failed to save token")
}

export async function clearGbrainToken(): Promise<void> {
  await fetch("/api/auth/token", { method: "DELETE" })
}

export async function hasGbrainToken(): Promise<boolean> {
  const res = await fetch("/api/auth/token")
  const data = await res.json()
  return data.hasToken
}

// 创建 MCP JSON-RPC 请求
function createRequest(
  method: string,
  name: string,
  arguments_: Record<string, unknown> = {}
): MCPRPCRequest {
  return {
    jsonrpc: "2.0",
    id: Date.now(),
    method,
    params: {
      name,
      arguments: arguments_,
    },
  }
}

/**
 * 解析 SSE 响应文本为 MCP RPC Response
 *
 * 支持：
 * - 标准 SSE 格式（event: message\ndata: ...\n\n）
 * - 多行 data 字段（按 SSE 规范拼接）
 * - 多个 event 块（取最后一个有效 data）
 * - 纯 JSON 响应（GBrain 某些版本直接返回 JSON）
 */
function parseSSEResponse(text: string): MCPRPCResponse {
  const trimmed = text.trim()

  // 尝试直接解析为 JSON（非 SSE 格式的响应）
  if (trimmed.startsWith("{")) {
    try {
      return JSON.parse(trimmed) as MCPRPCResponse
    } catch {
      // 不是有效 JSON，继续尝试 SSE 解析
    }
  }

  // SSE 解析：按空行分割为多个 event 块
  const blocks = trimmed.split(/\n\n+/)
  let lastData = ""

  for (const block of blocks) {
    const lines = block.split("\n")
    const dataLines: string[] = []

    for (const line of lines) {
      if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trimStart())
      } else if (line.startsWith("data")) {
        // "data" without colon means empty data line per SSE spec
        dataLines.push("")
      }
    }

    if (dataLines.length > 0) {
      lastData = dataLines.join("\n")
    }
  }

  if (!lastData) {
    throw new Error(`Invalid SSE response: no data field found. Raw: ${trimmed.slice(0, 200)}`)
  }

  try {
    return JSON.parse(lastData) as MCPRPCResponse
  } catch {
    throw new Error(`Failed to parse SSE data as JSON. Data: ${lastData.slice(0, 200)}`)
  }
}

// 解析 MCP 响应中的 text 内容为 JSON
function parseMCPResult(text: string): unknown {
  const rpcResponse = parseSSEResponse(text)

  if (rpcResponse.error) {
    throw new Error(`MCP error: ${rpcResponse.error.message}`)
  }

  if (!rpcResponse.result?.content?.[0]?.text) {
    throw new Error("No content in MCP response")
  }

  return JSON.parse(rpcResponse.result.content[0].text)
}

// 调用 MCP 工具（通过 Next.js API Route，token 由 cookie 自动携带）
export async function callMCP(
  name: string,
  arguments_: Record<string, unknown> = {}
): Promise<unknown> {
  const response = await fetch("/api/gbrain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(createRequest("tools/call", name, arguments_)),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`MCP call failed: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const text = await response.text()
  return parseMCPResult(text)
}

// ==================== GBrain API 封装 ====================

export async function getStats(): Promise<GBrainStats> {
  return callMCP("get_stats") as Promise<GBrainStats>
}

export async function getHealth(): Promise<GBrainHealth> {
  return callMCP("get_health") as Promise<GBrainHealth>
}

export async function runDoctor(): Promise<unknown> {
  return callMCP("run_doctor")
}

export interface ListPagesOptions {
  type?: string
  tag?: string
  sort?: "created_desc" | "created_asc" | "updated_desc" | "updated_asc"
  limit?: number
  offset?: number
}

export async function listPages(
  options: ListPagesOptions = {}
): Promise<GBrainPage[]> {
  const result = await callMCP("list_pages", options as unknown as Record<string, unknown>)
  return Array.isArray(result) ? result : []
}

export async function getPage(slug: string): Promise<GBrainPageDetail> {
  return callMCP("get_page", { slug }) as Promise<GBrainPageDetail>
}

export async function putPage(slug: string, content: string): Promise<void> {
  await callMCP("put_page", { slug, content })
}

export async function deletePage(slug: string): Promise<void> {
  await callMCP("delete_page", { slug })
}

export interface SearchOptions {
  query: string
  limit?: number
  offset?: number
}

export async function searchPages(options: SearchOptions): Promise<SearchResult[]> {
  const result = await callMCP("search", options as unknown as Record<string, unknown>)
  return Array.isArray(result) ? result : []
}

export async function queryPages(options: QueryOptions): Promise<SearchResult[]> {
  const result = await callMCP("query", options as unknown as Record<string, unknown>)
  return Array.isArray(result) ? result : []
}

export async function getTags(): Promise<string[]> {
  const result = await callMCP("get_tags")
  return Array.isArray(result) ? result : []
}

export async function getLinks(slug: string): Promise<string[]> {
  const result = await callMCP("get_links", { slug })
  if (Array.isArray(result)) return result
  if (result && typeof result === "object" && "links" in result) {
    return (result as { links: string[] }).links
  }
  return []
}

export async function getBacklinks(slug: string): Promise<string[]> {
  const result = await callMCP("get_backlinks", { slug })
  if (Array.isArray(result)) return result
  if (result && typeof result === "object" && "backlinks" in result) {
    return (result as { backlinks: string[] }).backlinks
  }
  return []
}

export async function getTimeline(slug: string): Promise<unknown> {
  return callMCP("get_timeline", { slug })
}

// ==================== Knowledge Graph ====================

export async function traverseGraph(slug: string, depth: number = 1): Promise<GraphData> {
  const raw = await callMCP("traverse_graph", { slug, depth }) as Record<string, unknown>
  // normalize MCP response: gbrain may return nodes/edges at top level or nested
  const data = (raw && typeof raw === "object") ? raw : {}
  const nodes = Array.isArray(data.nodes) ? data.nodes : (Array.isArray(data.result) ? data.result : [])
  const edges = Array.isArray(data.edges) ? data.edges : (Array.isArray(data.links) ? data.links : [])
  return { nodes: nodes as GraphNode[], edges: edges as GraphEdge[] }
}

// 构建完整图数据：从连通度最高的节点开始遍历
export async function buildFullGraph(options: { maxNodes?: number; centerSlug?: string } = {}): Promise<GraphData> {
  const { maxNodes = 100, centerSlug } = options

  // 如果有中心节点，从它开始遍历
  if (centerSlug) {
    const data = await traverseGraph(centerSlug, 2)
    if (data.nodes.length > 0) return data
    // 中心节点无链接，降级为显示它本身
    const page = await getPage(centerSlug).catch(() => null)
    if (page) {
      return {
        nodes: [{ id: page.slug, slug: page.slug, title: page.title, type: page.type, tags: page.tags || [], weight: 1 }],
        edges: [],
      }
    }
    return { nodes: [], edges: [] }
  }

  // 否则用 most_connected 节点作为入口
  const health = await getHealth()
  const entryPoints = health.most_connected || []

  if (entryPoints.length > 0) {
    const results = await Promise.allSettled(
      entryPoints.slice(0, 5).map((slug: string) => traverseGraph(slug, 1))
    )
    const merged = mergeGraphs(results)
    if (merged.nodes.length > 0) return merged
  }

  // 兜底：没有链接关系时，直接显示最近的页面列表作为孤立节点
  const pages = await listPages({ sort: "updated_desc", limit: maxNodes })
  if (pages.length === 0) return { nodes: [], edges: [] }

  return {
    nodes: pages.map((p) => ({
      id: p.slug,
      slug: p.slug,
      title: p.title,
      type: p.type || "note",
      tags: p.tags || [],
      weight: 1,
    })),
    edges: [],
  }
}

function mergeGraphs(results: PromiseSettledResult<GraphData>[]): GraphData {
  const nodeMap = new Map<string, GraphNode>()
  const edgeSet = new Set<string>()

  for (const result of results) {
    if (result.status !== "fulfilled") continue
    const nodes = Array.isArray(result.value?.nodes) ? result.value.nodes : []
    const edges = Array.isArray(result.value?.edges) ? result.value.edges : []
    for (const n of nodes) {
      if (n?.slug) nodeMap.set(n.slug, n)
    }
    for (const e of edges) {
      if (e?.source && e?.target) edgeSet.add(`${e.source}|${e.target}`)
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges: Array.from(edgeSet).map((k) => {
      const [source, target] = k.split("|")
      return { source, target, weight: 1, type: "link" }
    }),
  }
}
