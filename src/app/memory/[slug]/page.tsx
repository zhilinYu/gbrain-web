"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { MemoryEditor } from "@/components/memory/MemoryEditor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Link2, Clock, Tag, Calendar, ExternalLink } from "lucide-react"
import { getPage, getLinks, getBacklinks, getTimeline } from "@/lib/gbrain"
import type { GBrainPageDetail } from "@/types/gbrain"

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function MemoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug ? decodeURIComponent(params.slug as string) : ""

  const [page, setPage] = useState<GBrainPageDetail | null>(null)
  const [links, setLinks] = useState<string[]>([])
  const [backlinks, setBacklinks] = useState<string[]>([])
  const [timeline, setTimeline] = useState<unknown[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"content" | "links" | "timeline">("content")

  const loadPageData = useCallback(async () => {
    if (!slug) return
    await Promise.resolve()
    setIsLoading(true)
    setError(null)

    try {
      const [pageData, linksData, backlinksData, timelineData] = await Promise.all([
        getPage(slug),
        getLinks(slug),
        getBacklinks(slug),
        getTimeline(slug),
      ])

      setPage(pageData)
      setLinks(linksData)
      setBacklinks(backlinksData)
      setTimeline(Array.isArray(timelineData) ? timelineData : [])
    } catch (err) {
      console.error("Failed to load page:", err)
      setError(err instanceof Error ? err.message : "Failed to load page")
    } finally {
      setIsLoading(false)
    }
  }, [slug])

  useEffect(() => {
    void Promise.resolve().then(loadPageData)
  }, [loadPageData])

  const handleContentSave = (newContent: string) => {
    if (page) {
      setPage({ ...page, compiled_truth: newContent })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Loading..." />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded mt-8" />
            <div className="h-4 w-3/4 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="min-h-screen">
        <Header title="Error" />
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-destructive mb-4">{error || "Page not found"}</p>
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header
        title={page.title || slug}
        description={slug}
        action={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
        }
      />

      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 主体内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 元信息 */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    更新于 {formatDate(page.updated_at)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    创建于 {formatDate(page.created_at)}
                  </div>
                </div>
                {page.tags && page.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {page.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-muted"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 标签页切换 */}
            <div className="flex gap-2 border-b">
              <button
                onClick={() => setActiveTab("content")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "content"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                内容
              </button>
              <button
                onClick={() => setActiveTab("links")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "links"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                链接 ({links.length + backlinks.length})
              </button>
              <button
                onClick={() => setActiveTab("timeline")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "timeline"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                时间线
              </button>
            </div>

            {/* 内容 Tab - 使用 MemoryEditor */}
            {activeTab === "content" && (
              <MemoryEditor
                slug={slug}
                initialContent={page.compiled_truth || ""}
                onSave={handleContentSave}
              />
            )}

            {/* 链接 Tab */}
            {activeTab === "links" && (
              <div className="space-y-6">
                {links.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        出链 ({links.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {links.map((link) => (
                          <a
                            key={link}
                            href={`/memory/${encodeURIComponent(link)}`}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
                          >
                            <Link2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{link}</span>
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {backlinks.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Link2 className="h-4 w-4" />
                        入链 ({backlinks.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {backlinks.map((link) => (
                          <a
                            key={link}
                            href={`/memory/${encodeURIComponent(link)}`}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
                          >
                            <Link2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{link}</span>
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {links.length === 0 && backlinks.length === 0 && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <Link2 className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">暂无链接</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* 时间线 Tab */}
            {activeTab === "timeline" && (
              <Card>
                <CardContent className="p-6">
                  {timeline.length > 0 ? (
                    <div className="space-y-4 border-l-2 border-muted pl-4">
                      {timeline.map((entry: unknown, index: number) => {
                        const e = entry as { timestamp?: string; content?: string }
                        return (
                          <div key={index} className="relative">
                            <div className="absolute -left-[21px] w-3 h-3 rounded-full bg-primary" />
                            <div className="text-xs text-muted-foreground mb-1">
                              {e.timestamp ? formatDate(e.timestamp) : ""}
                            </div>
                            <div className="text-sm">{e.content || ""}</div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">暂无时间线记录</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">类型：</span>
                  <span className="ml-1 font-medium">{page.type || "default"}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Slug：</span>
                  <code className="ml-1 text-xs bg-muted px-1 py-0.5 rounded">
                    {page.slug}
                  </code>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">来源：</span>
                  <span className="ml-1 font-medium">{page.source_id}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">链接：</span>
                  <span className="ml-1 font-medium">{links.length + backlinks.length}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">内容哈希：</span>
                  <code className="ml-1 text-xs bg-muted px-1 py-0.5 rounded">
                    {page.content_hash?.slice(0, 12)}...
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
