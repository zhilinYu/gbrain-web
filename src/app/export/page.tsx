"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/layout/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, CheckSquare, Square, FileJson } from "lucide-react"
import { listPages, getPage } from "@/lib/gbrain"
import type { GBrainPage, GBrainPageDetail } from "@/types/gbrain"

export default function ExportPage() {
  const [pages, setPages] = useState<GBrainPage[]>([])
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPages = async () => {
      setIsLoading(true)

      try {
        const data = await listPages({ limit: 100 })
        setPages(data)
      } catch (err) {
        console.error("Failed to load pages:", err)
        setError(err instanceof Error ? err.message : "Failed to load pages")
      } finally {
        setIsLoading(false)
      }
    }

    loadPages()
  }, [])

  const toggleSelect = (slug: string) => {
    const newSelected = new Set(selectedSlugs)
    if (newSelected.has(slug)) {
      newSelected.delete(slug)
    } else {
      newSelected.add(slug)
    }
    setSelectedSlugs(newSelected)
  }

  const selectAll = () => {
    if (selectedSlugs.size === pages.length) {
      setSelectedSlugs(new Set())
    } else {
      setSelectedSlugs(new Set(pages.map((p) => p.slug)))
    }
  }

  const handleExport = async () => {
    if (selectedSlugs.size === 0) return

    setIsExporting(true)

    try {
      const exportData: Array<{
        slug: string
        title: string
        type: string
        tags: string[]
        created_at: string
        updated_at: string
        compiled_truth: string
        source_id: string
      }> = []

      for (const slug of selectedSlugs) {
        const page: GBrainPageDetail = await getPage(slug)
        exportData.push({
          slug: page.slug,
          title: page.title,
          type: page.type,
          tags: page.tags || [],
          created_at: page.created_at,
          updated_at: page.updated_at,
          compiled_truth: page.compiled_truth,
          source_id: page.source_id,
        })
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `gbrain-export-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Export failed:", err)
      setError(err instanceof Error ? err.message : "Export failed")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Export"
        description="导出记忆数据"
        action={
          <Button
            onClick={handleExport}
            disabled={selectedSlugs.size === 0 || isExporting}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "导出中..." : `导出 ${selectedSlugs.size} 条`}
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {error && (
          <Card className="border-destructive">
            <CardContent className="p-4">
              <p className="text-destructive text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">选择要导出的记忆</CardTitle>
            <Button variant="outline" size="sm" onClick={selectAll}>
              {selectedSlugs.size === pages.length ? "取消全选" : "全选"}
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              已选择 {selectedSlugs.size} / {pages.length} 条记忆
            </p>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="h-5 w-5 bg-muted rounded" />
                    <div className="h-4 w-32 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : pages.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">暂无记忆可导出</p>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {pages.map((page) => {
                  const isSelected = selectedSlugs.has(page.slug)
                  return (
                    <button
                      key={page.slug}
                      onClick={() => toggleSelect(page.slug)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-5 w-5 text-primary shrink-0" />
                      ) : (
                        <Square className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{page.title}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {page.slug}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileJson className="h-4 w-4" />
              导出格式说明
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>导出的 JSON 文件包含以下字段：</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><code className="text-xs bg-muted px-1 py-0.5 rounded">slug</code> - 页面唯一标识</li>
                <li><code className="text-xs bg-muted px-1 py-0.5 rounded">title</code> - 标题</li>
                <li><code className="text-xs bg-muted px-1 py-0.5 rounded">type</code> - 类型</li>
                <li><code className="text-xs bg-muted px-1 py-0.5 rounded">tags</code> - 标签数组</li>
                <li><code className="text-xs bg-muted px-1 py-0.5 rounded">compiled_truth</code> - 编译后的内容</li>
                <li><code className="text-xs bg-muted px-1 py-0.5 rounded">source_id</code> - 来源标识</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
