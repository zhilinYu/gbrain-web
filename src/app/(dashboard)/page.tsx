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
      setError(err instanceof Error ? err.message : "Failed to load data")
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
