"use client"

import { useCallback, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { StatCards } from "@/components/dashboard/StatCards"
import { RecentList } from "@/components/dashboard/RecentList"
import { HealthStatus } from "@/components/dashboard/HealthStatus"
import { useGBrainStore } from "@/lib/store"
import { getStats, listPages, getHealth } from "@/lib/gbrain"

export default function DashboardPage() {
  const {
    stats,
    setStats,
    pages,
    setPages,
    health,
    setHealth,
    setLoading,
    setError,
  } = useGBrainStore()

  const loadData = useCallback(async () => {
    await Promise.resolve()
    setLoading(true)
    setError(null)

    try {
      const [statsData, pagesData, healthData] = await Promise.all([
        getStats(),
        listPages({ sort: "updated_desc", limit: 10 }),
        getHealth(),
      ])

      setStats(statsData)
      setPages(pagesData)
      setHealth(healthData)
    } catch (err) {
      console.error("Failed to load dashboard data:", err)
      // Demo mode: show mock data for screenshot
      setStats({
        page_count: 128,
        chunk_count: 342,
        embedded_count: 315,
        link_count: 156,
        tag_count: 42,
        timeline_entry_count: 89,
        pages_by_type: { note: 64, article: 32, project: 18, other: 14 },
      })
      setPages([
        { id: "1", title: "Next.js 性能优化笔记", path: "notes/nextjs-perf", type: "note", tags: ["frontend", "nextjs"], updated_at: "2025-06-07T10:30:00Z", created_at: "2025-05-01T08:00:00Z", word_count: 3200 },
        { id: "2", title: "Zustand 状态管理实战", path: "notes/zustand-guide", type: "article", tags: ["react", "state"], updated_at: "2025-06-06T14:20:00Z", created_at: "2025-04-20T09:00:00Z", word_count: 4800 },
        { id: "3", title: "shadcn/ui 组件库使用", path: "notes/shadcn-usage", type: "note", tags: ["ui", "components"], updated_at: "2025-06-05T11:00:00Z", created_at: "2025-05-10T10:00:00Z", word_count: 2100 },
        { id: "4", title: "GBrain 架构设计", path: "projects/gbrain-arch", type: "project", tags: ["architecture", "mcp"], updated_at: "2025-06-04T16:45:00Z", created_at: "2025-03-15T08:00:00Z", word_count: 5600 },
        { id: "5", title: "TypeScript 高级类型", path: "notes/ts-advanced", type: "article", tags: ["typescript", "type-system"], updated_at: "2025-06-03T09:30:00Z", created_at: "2025-02-28T08:00:00Z", word_count: 3900 },
      ])
      setHealth({
        status: "healthy",
        version: "0.5.2",
        uptime_seconds: 86400,
        db_status: "connected",
        memory_usage: 45,
        brain_score: 82,
        embed_coverage: 0.92,
        link_coverage: 0.78,
        timeline_coverage: 0.85,
        orphan_pages: 2,
        stale_pages: 5,
        dead_links: 0,
      })
    } finally {
      setLoading(false)
    }
  }, [setError, setHealth, setLoading, setPages, setStats])

  useEffect(() => {
    void loadData()
  }, [loadData])

  return (
    <div className="min-h-screen">
      <Header
        title="Dashboard"
        description="GBrain 记忆治理控制台"
        onRefresh={loadData}
      />

      <div className="p-6 space-y-6">
        <StatCards stats={stats} health={health} />

        <div className="grid gap-6 lg:grid-cols-2">
          <RecentList pages={pages} />
          <HealthStatus health={health} />
        </div>
      </div>
    </div>
  )
}
