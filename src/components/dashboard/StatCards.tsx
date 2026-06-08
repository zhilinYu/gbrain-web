"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, FileText, Link2, Tags, TrendingUp } from "lucide-react"
import type { GBrainStats, GBrainHealth } from "@/types/gbrain"

interface StatCardsProps {
  stats: GBrainStats | null
  health: GBrainHealth | null
  isLoading?: boolean
}

export function StatCards({ stats, health, isLoading }: StatCardsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-20 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const items = [
    {
      title: "总记忆数",
      value: stats.page_count,
      icon: Brain,
      description: "已存储的记忆页面",
    },
    {
      title: "内容块",
      value: stats.chunk_count,
      icon: FileText,
      description: `已向量化 ${stats.embedded_count}`,
    },
    {
      title: "链接数",
      value: stats.link_count,
      icon: Link2,
      description: "页面间关联链接",
    },
    {
      title: "标签数",
      value: stats.tag_count,
      icon: Tags,
      description: "使用的标签总数",
    },
    {
      title: "脑图分数",
      value: health?.brain_score ?? 0,
      icon: TrendingUp,
      description: `覆盖率 ${Math.round((health?.embed_coverage ?? 0) * 100)}%`,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.title}
            </CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
