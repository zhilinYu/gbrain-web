// GBrain MCP Types - 基于 GBrain v0.34.4 实际 API 返回格式

export interface MCPRPCRequest {
  jsonrpc: "2.0"
  id: number | string
  method: string
  params?: {
    name: string
    arguments?: Record<string, unknown>
  }
}

export interface MCPRPCResponse {
  jsonrpc: "2.0"
  id: number | string
  result?: {
    content: Array<{
      type: string
      text: string
    }>
  }
  error?: {
    code: number
    message: string
    data?: unknown
  }
}

// GBrain Page Types (list_pages 返回)
export interface GBrainPage {
  slug: string
  title: string
  type: string  // "concept" | "project" | "decision" | "note" | "default"
  updated_at: string
  created_at?: string
  tags?: string[]
}

// GBrain Page Detail (get_page 返回)
export interface GBrainPageDetail {
  id: number
  slug: string
  type: string
  title: string
  compiled_truth: string  // 编译后的内容（纯文本，非 Markdown）
  timeline: string
  frontmatter: Record<string, unknown>
  content_hash: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  source_id: string
  tags: string[]
}

// GBrain Stats (get_stats 返回)
export interface GBrainStats {
  page_count: number
  chunk_count: number
  embedded_count: number
  link_count: number
  tag_count: number
  timeline_entry_count: number
  pages_by_type: Record<string, number>
}

// GBrain Health (get_health 返回)
export interface GBrainHealth {
  page_count: number
  embed_coverage: number  // 0-1 比例
  stale_pages: number
  orphan_pages: number
  missing_embeddings: number
  brain_score: number
  dead_links: number
  link_coverage: number
  timeline_coverage: number
  most_connected: string[]
  embed_coverage_score: number
  link_density_score: number
  timeline_coverage_score: number
  no_orphans_score: number
  no_dead_links_score: number
}

// Search Results (search 返回)
export interface SearchResult {
  slug: string
  page_id: number
  title: string
  type: string
  chunk_text: string
  chunk_source: string
  chunk_id: number
  chunk_index: number
  score: number
  stale: boolean
  source_id: string
}

// Graph / Knowledge Graph
export interface GraphNode {
  id: string
  slug: string
  title: string
  type: string
  tags: string[]
  weight: number
  x?: number
  y?: number
}

export interface GraphEdge {
  source: string
  target: string
  weight: number
  type: string
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

// Query Options
export interface QueryOptions {
  query: string
  limit?: number
  offset?: number
  salience?: boolean
  recency?: boolean
  since?: string
  until?: string
  types?: string[]
  tags?: string[]
}
