"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Clock, FileText } from "lucide-react"
import type { GBrainPage } from "@/types/gbrain"

interface RecentListProps {
  pages: GBrainPage[]
  isLoading?: boolean
}

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

export function RecentList({ pages, isLoading }: RecentListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">最近更新</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-10 w-10 bg-muted rounded" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-muted rounded mb-1" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (pages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">最近更新</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            暂无记忆数据
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">最近更新</CardTitle>
        <Link
          href="/memory"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          查看全部 <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pages.slice(0, 10).map((page) => (
            <Link
              key={page.slug}
              href={`/memory/${encodeURIComponent(page.slug)}`}
              className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{page.title}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDate(page.updated_at)}
                  {page.type && (
                    <span className={`px-1.5 py-0.5 rounded text-xs ${typeColors[page.type] || typeColors.default}`}>
                      {page.type}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
