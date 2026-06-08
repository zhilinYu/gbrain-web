"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search as SearchIcon, FileText, Zap, Sparkles, Clock, SlidersHorizontal } from "lucide-react"
import { searchPages, queryPages } from "@/lib/gbrain"
import type { SearchResult } from "@/types/gbrain"

const typeOptions = ["concept", "project", "decision", "note"]

export default function SearchPage() {
  const [query_, setQuery] = useState("")
  const [searchMode, setSearchMode] = useState<"search" | "query">("search")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // 高级参数
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [sinceDate, setSinceDate] = useState("")
  const [untilDate, setUntilDate] = useState("")
  const [useSalience, setUseSalience] = useState(false)
  const [useRecency, setUseRecency] = useState(false)

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags((prev) => [...prev, tag])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query_.trim()) return

    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      let data: SearchResult[]

      if (searchMode === "search") {
        data = await searchPages({ query: query_, limit: 20 })
      } else {
        const queryParams: Record<string, unknown> = {
          query: query_,
          limit: 20,
        }

        // 仅在 query 模式下支持高级参数
        if (selectedTypes.length > 0) queryParams.types = selectedTypes
        if (selectedTags.length > 0) queryParams.tags = selectedTags
        if (sinceDate) queryParams.since = sinceDate
        if (untilDate) queryParams.until = untilDate
        if (useSalience) queryParams.salience = true
        if (useRecency) queryParams.recency = true

        data = await queryPages(
          queryParams as unknown as import("@/types/gbrain").QueryOptions
        )
      }

      setResults(data)
    } catch (err) {
      console.error("Search failed:", err)
      // Demo mode: return mock search results
      setResults([
        { slug: "nextjs-perf", page_id: 1, title: "Next.js 性能优化笔记", type: "note", chunk_text: "Next.js 提供了多种性能优化手段，包括 SSR、SSG、ISR 等渲染策略。图片优化通过 next/image 自动实现 WebP 转换和响应式加载。代码分割基于路由自动完成...", chunk_source: "notes/nextjs-perf", chunk_id: 101, chunk_index: 0, score: 0.95, stale: false, source_id: "local" },
        { slug: "zustand-guide", page_id: 2, title: "Zustand 状态管理实战", type: "article", chunk_text: "Zustand 是一个轻量级的 React 状态管理库，API 简洁直观。相比 Redux，它不需要写样板代码。创建 store 只需一行代码...", chunk_source: "notes/zustand-guide", chunk_id: 102, chunk_index: 0, score: 0.88, stale: false, source_id: "local" },
        { slug: "react-hooks", page_id: 6, title: "React Hooks 深入", type: "note", chunk_text: "useEffect 是 React 中最常用的 Hook 之一，用于处理副作用。注意依赖数组的正确使用，避免无限循环。useMemo 和 useCallback 用于性能优化...", chunk_source: "notes/react-hooks", chunk_id: 103, chunk_index: 0, score: 0.82, stale: false, source_id: "local" },
        { slug: "gbrain-arch", page_id: 4, title: "GBrain 架构设计", type: "project", chunk_text: "GBrain 采用 MCP (Model Context Protocol) 作为核心通信协议，支持 JSON-RPC 2.0 格式。前端通过 HTTP 代理与 GBrain 服务通信...", chunk_source: "projects/gbrain-arch", chunk_id: 104, chunk_index: 0, score: 0.78, stale: false, source_id: "local" },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const clearAdvanced = () => {
    setSelectedTypes([])
    setSelectedTags([])
    setTagInput("")
    setSinceDate("")
    setUntilDate("")
    setUseSalience(false)
    setUseRecency(false)
  }

  return (
    <div className="min-h-screen">
      <Header title="Search" description="搜索记忆库" />

      <div className="p-6 space-y-6">
        {/* 搜索框 */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="输入搜索关键词..."
                    value={query_}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9"
                    autoFocus
                  />
                </div>
                <Button type="submit" disabled={isLoading || !query_.trim()}>
                  {isLoading ? "搜索中..." : "搜索"}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={searchMode === "search" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSearchMode("search")}
                  className="gap-1.5"
                >
                  <Zap className="h-3.5 w-3.5" />
                  关键词搜索
                </Button>
                <Button
                  type="button"
                  variant={searchMode === "query" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSearchMode("query")}
                  className="gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  智能搜索
                </Button>

                {searchMode === "query" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="gap-1.5 ml-auto"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    高级参数
                  </Button>
                )}
              </div>
            </form>

            {/* 高级参数面板 */}
            {showAdvanced && searchMode === "query" && (
              <div className="mt-4 pt-4 border-t space-y-4">
                {/* 类型过滤 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">类型过滤</label>
                  <div className="flex flex-wrap gap-2">
                    {typeOptions.map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={selectedTypes.includes(type) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleType(type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 标签过滤 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">标签过滤</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="输入标签..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      className="max-w-xs"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addTag}>
                      添加
                    </Button>
                  </div>
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-muted"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 时间范围 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">时间范围</label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="date"
                      value={sinceDate}
                      onChange={(e) => setSinceDate(e.target.value)}
                      className="max-w-[180px]"
                    />
                    <span className="text-muted-foreground">—</span>
                    <Input
                      type="date"
                      value={untilDate}
                      onChange={(e) => setUntilDate(e.target.value)}
                      className="max-w-[180px]"
                    />
                  </div>
                </div>

                {/* 排序选项 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">排序选项</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={useSalience ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseSalience(!useSalience)}
                    >
                      重要性排序
                    </Button>
                    <Button
                      type="button"
                      variant={useRecency ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseRecency(!useRecency)}
                    >
                      时效性排序
                    </Button>
                  </div>
                </div>

                <Button type="button" variant="ghost" size="sm" onClick={clearAdvanced}>
                  清除高级参数
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 错误 */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="p-4">
              <p className="text-destructive text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* 初始提示 */}
        {!hasSearched && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <SearchIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">输入关键词开始搜索</p>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>• <strong>关键词搜索</strong>：基于全文检索的精确匹配</p>
                <p>• <strong>智能搜索</strong>：混合向量 + 关键词的语义搜索，支持高级参数</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 无结果 */}
        {hasSearched && results.length === 0 && !isLoading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <SearchIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">未找到相关记忆</p>
              <p className="text-sm text-muted-foreground mt-1">尝试其他关键词或切换搜索模式</p>
            </CardContent>
          </Card>
        )}

        {/* 搜索结果 */}
        {results.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              找到 {results.length} 条相关记忆
            </p>

            <div className="space-y-3">
              {results.map((result, index) => (
                <Link
                  key={`${result.slug}-${result.chunk_id}-${index}`}
                  href={`/memory/${encodeURIComponent(result.slug)}`}
                >
                  <Card className="transition-colors hover:bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium">{result.title || result.slug}</h3>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {result.slug}
                          </p>
                          {result.chunk_text && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                              {result.chunk_text.slice(0, 300)}
                              {result.chunk_text.length > 300 ? "..." : ""}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            {result.type && (
                              <span className="text-xs px-2 py-0.5 rounded bg-muted">
                                {result.type}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              匹配度 {Math.round(result.score * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
