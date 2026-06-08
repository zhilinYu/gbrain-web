"use client"

import { useCallback, useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Clock, FileText, Tag, Filter, Search as SearchIcon } from "lucide-react"
import { useGBrainStore } from "@/lib/store"
import { listPages, getTags } from "@/lib/gbrain"

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return "今天"
  if (days === 1) return "昨天"
  if (days < 7) return `${days} 天前`
  if (days < 30) return `${Math.floor(days / 7)} 周前`
  return date.toLocaleDateString("zh-CN")
}

const typeColors: Record<string, string> = {
  concept: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  project: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  decision: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  note: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  default: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
}

export default function MemoryLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [allTags, setAllTags] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const {
    pages,
    setPages,
    filterType,
    setFilterType,
    filterTag,
    setFilterTag,
    sortOrder,
    setSortOrder,
    setLoading,
    setError,
  } = useGBrainStore()

  const loadData = useCallback(async () => {
    await Promise.resolve()
    setLoading(true)
    setError(null)

    try {
      const [pagesData, tagsData] = await Promise.all([
        listPages(
          { sort: sortOrder, limit: 100, ...(filterType ? { type: filterType } : {}), ...(filterTag ? { tag: filterTag } : {}) }
        ),
        getTags(),
      ])

      setPages(pagesData)
      setAllTags(tagsData)
    } catch (err) {
      console.error("Failed to load memory library:", err)
      // Demo mode
      setPages([
        { slug: "nextjs-perf", title: "Next.js 性能优化笔记", type: "note", updated_at: "2025-06-07T10:30:00Z", created_at: "2025-05-01T08:00:00Z", tags: ["frontend", "nextjs"] },
        { slug: "zustand-guide", title: "Zustand 状态管理实战", type: "article", updated_at: "2025-06-06T14:20:00Z", created_at: "2025-04-20T09:00:00Z", tags: ["react", "state"] },
        { slug: "shadcn-usage", title: "shadcn/ui 组件库使用", type: "note", updated_at: "2025-06-05T11:00:00Z", created_at: "2025-05-10T10:00:00Z", tags: ["ui", "components"] },
        { slug: "gbrain-arch", title: "GBrain 架构设计", type: "project", updated_at: "2025-06-04T16:45:00Z", created_at: "2025-03-15T08:00:00Z", tags: ["architecture", "mcp"] },
        { slug: "ts-advanced", title: "TypeScript 高级类型", type: "article", updated_at: "2025-06-03T09:30:00Z", created_at: "2025-02-28T08:00:00Z", tags: ["typescript", "type-system"] },
        { slug: "react-hooks", title: "React Hooks 深入", type: "note", updated_at: "2025-06-02T13:15:00Z", created_at: "2025-03-05T08:00:00Z", tags: ["react", "hooks"] },
        { slug: "tailwind-tips", title: "Tailwind CSS 技巧", type: "note", updated_at: "2025-06-01T10:00:00Z", created_at: "2025-04-12T08:00:00Z", tags: ["css", "tailwind"] },
        { slug: "mcp-protocol", title: "MCP 协议详解", type: "article", updated_at: "2025-05-30T15:30:00Z", created_at: "2025-03-20T08:00:00Z", tags: ["mcp", "protocol"] },
        { slug: "ai-workflow", title: "AI 工作流设计", type: "project", updated_at: "2025-05-28T11:20:00Z", created_at: "2025-02-15T08:00:00Z", tags: ["ai", "workflow"] },
        { slug: "node-best-practice", title: "Node.js 最佳实践", type: "note", updated_at: "2025-05-25T09:00:00Z", created_at: "2025-01-20T08:00:00Z", tags: ["backend", "node"] },
        { slug: "postgres-optimize", title: "PostgreSQL 优化", type: "article", updated_at: "2025-05-22T14:00:00Z", created_at: "2025-01-10T08:00:00Z", tags: ["database", "sql"] },
        { slug: "docker-deploy", title: "Docker 部署指南", type: "note", updated_at: "2025-05-20T10:30:00Z", created_at: "2025-01-05T08:00:00Z", tags: ["devops", "docker"] },
      ])
      setAllTags(["frontend", "nextjs", "react", "state", "ui", "components", "architecture", "mcp", "typescript", "type-system", "hooks", "css", "tailwind", "protocol", "ai", "workflow", "backend", "node", "database", "sql", "devops", "docker"])
    } finally {
      setLoading(false)
    }
  }, [filterTag, filterType, setError, setLoading, setPages, sortOrder])

  useEffect(() => {
    void Promise.resolve().then(loadData)
  }, [loadData])

  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return pages

    const q = searchQuery.toLowerCase()
    return pages.filter(
      (page) =>
        page.title?.toLowerCase().includes(q) ||
        page.slug?.toLowerCase().includes(q)
    )
  }, [pages, searchQuery])

  const clearFilters = () => {
    setFilterType(null)
    setFilterTag(null)
    setSearchQuery("")
  }

  const hasFilters = filterType || filterTag || searchQuery

  return (
    <div className="min-h-screen">
      <Header
        title="Memory Library"
        description="浏览和管理所有记忆"
        onRefresh={loadData}
      />

      <div className="p-6 space-y-6">
        {/* 搜索和过滤栏 */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索记忆..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            筛选
            {hasFilters && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {(filterType ? 1 : 0) + (filterTag ? 1 : 0) + (searchQuery ? 1 : 0)}
              </span>
            )}
          </Button>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="updated_desc">最近更新</option>
            <option value="updated_asc">最早更新</option>
            <option value="created_desc">最近创建</option>
            <option value="created_asc">最早创建</option>
          </select>
        </div>

        {/* 过滤面板 */}
        {showFilters && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">类型</label>
                  <div className="flex flex-wrap gap-2">
                    {["concept", "project", "decision", "note"].map((type) => (
                      <Button
                        key={type}
                        variant={filterType === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterType(filterType === type ? null : type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                {allTags.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">标签</label>
                    <div className="flex flex-wrap gap-2">
                      {allTags.slice(0, 15).map((tag) => (
                        <Button
                          key={tag}
                          variant={filterTag === tag ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {hasFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    清除筛选
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 结果统计 */}
        <div className="text-sm text-muted-foreground">
          共 {filteredPages.length} 条记忆
          {filterType && ` · 类型: ${filterType}`}
          {filterTag && ` · 标签: ${filterTag}`}
        </div>

        {/* 记忆列表 */}
        {filteredPages.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">暂无记忆数据</p>
              {hasFilters && (
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  清除筛选
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPages.map((page) => (
              <Link
                key={page.slug}
                href={`/memory/${encodeURIComponent(page.slug)}`}
              >
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{page.title}</h3>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {page.slug}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {page.type && (
                        <span className={`px-2 py-0.5 rounded text-xs ${typeColors[page.type] || typeColors.default}`}>
                          {page.type}
                        </span>
                      )}
                      {page.tags?.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-muted"
                        >
                          <Tag className="h-2.5 w-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(page.updated_at)}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
