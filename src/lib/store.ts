import { create } from "zustand"
import type {
  GBrainPage,
  GBrainStats,
  GBrainHealth,
  SearchResult,
} from "@/types/gbrain"

interface GBrainState {
  // 统计数据
  stats: GBrainStats | null
  setStats: (stats: GBrainStats | null) => void

  // 健康状态
  health: GBrainHealth | null
  setHealth: (health: GBrainHealth | null) => void

  // 页面列表
  pages: GBrainPage[]
  setPages: (pages: GBrainPage[]) => void
  appendPages: (pages: GBrainPage[]) => void

  // 搜索结果
  searchResults: SearchResult[]
  setSearchResults: (results: SearchResult[]) => void

  // UI 状态
  isLoading: boolean
  setLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void

  // 过滤状态
  filterType: string | null
  setFilterType: (type: string | null) => void
  filterTag: string | null
  setFilterTag: (tag: string | null) => void
  sortOrder: "created_desc" | "created_asc" | "updated_desc" | "updated_asc"
  setSortOrder: (order: "created_desc" | "created_asc" | "updated_desc" | "updated_asc") => void
}

export const useGBrainStore = create<GBrainState>((set) => ({
  // 统计数据
  stats: null,
  setStats: (stats) => set({ stats }),

  // 健康状态
  health: null,
  setHealth: (health) => set({ health }),

  // 页面列表
  pages: [],
  setPages: (pages) => set({ pages }),
  appendPages: (pages) => set((state) => ({
    pages: [...state.pages, ...pages]
  })),

  // 搜索结果
  searchResults: [],
  setSearchResults: (results) => set({ searchResults: results }),

  // UI 状态
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error }),

  // 过滤状态
  filterType: null,
  setFilterType: (type) => set({ filterType: type }),
  filterTag: null,
  setFilterTag: (tag) => set({ filterTag: tag }),
  sortOrder: "updated_desc",
  setSortOrder: (order) => set({ sortOrder: order }),
}))
