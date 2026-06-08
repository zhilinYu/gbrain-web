"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { GraphViewer } from "@/components/graph/GraphViewer"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { buildFullGraph } from "@/lib/gbrain"
import type { GraphData } from "@/types/gbrain"
import { Search, Network, AlertCircle, Loader2 } from "lucide-react"

export default function GraphPage() {
  const router = useRouter()
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)

  const loadGraph = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await buildFullGraph({ maxNodes: 150 })
      setGraphData(data)
    } catch (err) {
      console.error("Failed to load graph:", err)
      setError(err instanceof Error ? err.message : "无法加载图谱数据")
    } finally {
      setIsLoading(false)
    }
  }, [])

  /* eslint-disable react-hooks/set-state-in-effect -- data-fetching in mount effect is standard */
  useEffect(() => {
    setIsLoading(true)
    setError(null)
    buildFullGraph({ maxNodes: 150 })
      .then((data) => {
        setGraphData(data)
      })
      .catch((err) => {
        console.error("Failed to load graph:", err)
        setError(err instanceof Error ? err.message : "无法加载图谱数据")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Derived from graphData + searchQuery, no separate state needed
  const filteredNodes = useMemo(() => {
    if (!graphData) return []
    if (!searchQuery.trim()) return graphData.nodes
    const q = searchQuery.toLowerCase()
    return graphData.nodes.filter(
      (n) =>
        n.title?.toLowerCase().includes(q) ||
        n.slug?.toLowerCase().includes(q) ||
        n.tags?.some((t) => t.toLowerCase().includes(q))
    )
  }, [searchQuery, graphData])

  const handleNodeClick = (slug: string) => {
    setSelectedSlug(slug)
    router.push(`/memory/${encodeURIComponent(slug)}`)
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Knowledge Graph"
        description="记忆图谱可视化"
        onRefresh={loadGraph}
      />

      <div className="p-6 space-y-6">
        {/* Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索节点..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {searchQuery && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                找到 {filteredNodes.length} 个节点
              </span>
              <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                清除
              </Button>
            </div>
          )}
        </div>

        {/* Graph area */}
        {isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">构建知识图谱...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-24">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-destructive mb-2">{error}</p>
              <p className="text-sm text-muted-foreground mb-4">请确保 GBrain 服务正在运行</p>
              <Button onClick={loadGraph} variant="outline">
                重试
              </Button>
            </CardContent>
          </Card>
        ) : graphData && graphData.nodes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-24">
              <Network className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">图谱为空</p>
              <p className="text-sm text-muted-foreground mt-1">暂无记忆关联数据</p>
            </CardContent>
          </Card>
        ) : graphData ? (
          <GraphViewer
            data={
              searchQuery
                ? {
                    nodes: filteredNodes,
                    edges: graphData.edges.filter(
                      (e) =>
                        filteredNodes.some((n) => n.slug === e.source) &&
                        filteredNodes.some((n) => n.slug === e.target)
                    ),
                  }
                : graphData
            }
            onNodeClick={handleNodeClick}
            selectedSlug={selectedSlug}
          />
        ) : null}

        {/* Node list (filtered) */}
        {!isLoading && !error && filteredNodes.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {filteredNodes.slice(0, 50).map((node) => (
                  <Button
                    key={node.slug}
                    variant={selectedSlug === node.slug ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNodeClick(node.slug)}
                    className="text-xs"
                  >
                    {node.title || node.slug}
                  </Button>
                ))}
                {filteredNodes.length > 50 && (
                  <span className="text-xs text-muted-foreground self-center">
                    +{filteredNodes.length - 50} 更多
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
