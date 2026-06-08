"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, AlertTriangle, CheckCircle2, Unplug } from "lucide-react"
import type { GBrainHealth } from "@/types/gbrain"

interface HealthStatusProps {
  health: GBrainHealth | null
  isLoading?: boolean
}

export function HealthStatus({ health, isLoading }: HealthStatusProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            健康状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-4 w-48 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!health) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">健康状态</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">无法获取健康状态</p>
        </CardContent>
      </Card>
    )
  }

  // 根据 brain_score 判断状态
  const score = health.brain_score
  const statusConfig = score >= 70
    ? {
        icon: CheckCircle2,
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-950",
        label: "健康",
      }
    : score >= 40
    ? {
        icon: AlertTriangle,
        color: "text-amber-600",
        bgColor: "bg-amber-50 dark:bg-amber-950",
        label: "需要关注",
      }
    : {
        icon: AlertTriangle,
        color: "text-red-600",
        bgColor: "bg-red-50 dark:bg-red-950",
        label: "需要改进",
      }

  const Icon = statusConfig.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Heart className="h-4 w-4" />
          健康状态
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`flex items-center gap-3 p-3 rounded-lg ${statusConfig.bgColor}`}>
          <Icon className={`h-5 w-5 ${statusConfig.color}`} />
          <span className={`font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
          <span className={`ml-auto font-bold ${statusConfig.color}`}>{score}/100</span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">向量覆盖率</span>
            <span className="font-medium">{Math.round(health.embed_coverage * 100)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">链接密度</span>
            <span className="font-medium">{Math.round(health.link_coverage * 100)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">时间线覆盖</span>
            <span className="font-medium">{Math.round(health.timeline_coverage * 100)}%</span>
          </div>
        </div>

        <div className="pt-2 border-t space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Unplug className="h-3 w-3" />
              孤立页面
            </span>
            <span className={`font-medium ${health.orphan_pages > 0 ? "text-amber-600" : "text-green-600"}`}>
              {health.orphan_pages}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">过时页面</span>
            <span className="font-medium">{health.stale_pages}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">死链</span>
            <span className={`font-medium ${health.dead_links > 0 ? "text-red-600" : "text-green-600"}`}>
              {health.dead_links}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
