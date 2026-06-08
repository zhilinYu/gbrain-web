"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force"
import type { GraphData } from "@/types/gbrain"
import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

interface SimNode extends SimulationNodeDatum {
  slug: string
  title: string
  type: string
  tags: string[]
  weight: number
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  type: string
}

interface GraphViewerProps {
  data: GraphData
  onNodeClick?: (slug: string) => void
  selectedSlug?: string | null
}

const typeColors: Record<string, string> = {
  concept: "#3b82f6",
  project: "#22c55e",
  decision: "#f59e0b",
  note: "#6b7280",
  default: "#a855f7",
}

const typeLabels: Record<string, string> = {
  concept: "概念",
  project: "项目",
  decision: "决策",
  note: "笔记",
  default: "未分类",
}

export function GraphViewer({ data, onNodeClick, selectedSlug }: GraphViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 })
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const simRef = useRef<ReturnType<typeof forceSimulation<SimNode>> | null>(null)
  const nodesRef = useRef<SimNode[]>([])
  const linksRef = useRef<SimLink[]>([])

  // Measure container
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setDimensions({ width: Math.max(width, 400), height: Math.max(height, 400) })
      }
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Build simulation when data changes
  useEffect(() => {
    simRef.current?.stop()

    const slugs = new Set(data.nodes.map((n) => n.slug))

    const nodes: SimNode[] = data.nodes.map((n) => ({
      slug: n.slug,
      title: n.title || n.slug,
      type: n.type || "default",
      tags: n.tags || [],
      weight: n.weight || 1,
    }))

    const links: SimLink[] = data.edges
      .filter((e) => slugs.has(e.source) && slugs.has(e.target))
      .map((e) => ({
        source: e.source,
        target: e.target,
        type: e.type || "link",
      }))

    nodesRef.current = nodes
    linksRef.current = links

    if (nodes.length === 0) return

    const centerX = dimensions.width / 2
    const centerY = dimensions.height / 2

    const simulation = forceSimulation<SimNode>(nodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(links)
          .id((d) => d.slug)
          .distance(80)
          .strength(0.4)
      )
      .force("charge", forceManyBody().strength(-200))
      .force("center", forceCenter(centerX, centerY))
      .force("collide", forceCollide(20))
      .alphaDecay(0.02)
      .on("tick", ticked)

    simRef.current = simulation

    function ticked() {
      const svg = svgRef.current
      if (!svg) return

      // Update links
      const linkElements = svg.querySelectorAll<SVGLineElement>(".graph-link")
      links.forEach((link, i) => {
        const el = linkElements[i]
        if (el && link.source && link.target) {
          const s = link.source as unknown as SimNode
          const t = link.target as unknown as SimNode
          if (s.x != null && s.y != null && t.x != null && t.y != null) {
            el.setAttribute("x1", String(s.x))
            el.setAttribute("y1", String(s.y))
            el.setAttribute("x2", String(t.x))
            el.setAttribute("y2", String(t.y))
          }
        }
      })

      // Update nodes
      const nodeElements = svg.querySelectorAll<SVGGElement>(".graph-node")
      nodes.forEach((node, i) => {
        const el = nodeElements[i]
        if (el && node.x != null && node.y != null) {
          el.setAttribute("transform", `translate(${node.x},${node.y})`)
        }
      })
    }

    return () => {
      simulation.stop()
    }
  }, [data, dimensions.width, dimensions.height])

  // Zoom handlers
  const handleZoomIn = () => {
    setTransform((t) => ({ ...t, k: Math.min(t.k * 1.3, 5) }))
  }
  const handleZoomOut = () => {
    setTransform((t) => ({ ...t, k: Math.max(t.k / 1.3, 0.2) }))
  }
  const handleReset = () => {
    setTransform({ x: 0, y: 0, k: 1 })
  }

  // Pan handling
  const isPanning = useRef(false)
  const panStart = useRef({ x: 0, y: 0 })

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only pan if clicking on empty space (not a node)
    if ((e.target as HTMLElement).closest(".graph-node")) return
    isPanning.current = true
    panStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y }
  }, [transform.x, transform.y])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return
    setTransform((t) => ({
      ...t,
      x: e.clientX - panStart.current.x,
      y: e.clientY - panStart.current.y,
    }))
  }, [])

  const handleMouseUp = useCallback(() => {
    isPanning.current = false
  }, [])

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setTransform((t) => ({ ...t, k: Math.max(0.2, Math.min(5, t.k * delta)) }))
  }, [])

  // Node radius based on weight
  const nodeRadius = (node: SimNode) => {
    // Weight range should give 6-20px radius
    const base = Math.max(6, Math.min(20, 6 + node.weight * 2))
    return base
  }

  return (
    <div
      ref={containerRef}
      className={`relative rounded-lg border border-border bg-card overflow-hidden ${
        isFullscreen ? "fixed inset-4 z-50" : "w-full h-[600px]"
      }`}
    >
      {/* Toolbar */}
      <div className="absolute top-3 right-3 z-10 flex gap-1">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleZoomIn} title="放大">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleZoomOut} title="缩小">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleReset} title="重置">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? "退出全屏" : "全屏"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-10 bg-card/90 backdrop-blur-sm rounded-lg border border-border p-2 text-xs space-y-1">
        {Object.entries(typeLabels).map(([type, label]) => (
          <div key={type} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: typeColors[type] || typeColors.default }}
            />
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
        <div className="text-muted-foreground pt-1 border-t border-border mt-1">
          {data.nodes.length} 节点 · {data.edges.length} 边
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredNode && (
        <div className="absolute top-3 left-3 z-10 bg-card/95 backdrop-blur-sm rounded-lg border border-border p-3 shadow-lg max-w-xs">
          <p className="font-medium text-sm">{hoveredNode.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{hoveredNode.slug}</p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: typeColors[hoveredNode.type] || typeColors.default }}
            />
            <span className="text-xs text-muted-foreground">
              {typeLabels[hoveredNode.type] || hoveredNode.type}
            </span>
          </div>
        </div>
      )}

      {/* SVG Graph */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
          {/* eslint-disable react-hooks/refs -- D3 direct DOM manipulation pattern */}
          {/* Links */}
          {linksRef.current.map((link, i) => (
            <line
              key={`link-${i}`}
              className="graph-link"
              stroke="hsl(var(--border))"
              strokeWidth={1}
              strokeOpacity={0.5}
            />
          ))}
          {/* Nodes */}
          {nodesRef.current.map((node) => {
            const r = nodeRadius(node)
            const isSelected = node.slug === selectedSlug
            const color = typeColors[node.type] || typeColors.default

            return (
              <g
                key={node.slug}
                className="graph-node"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => onNodeClick?.(node.slug)}
              >
                {/* Glow for selected */}
                {isSelected && (
                  <circle r={r + 6} fill={color} opacity={0.15} />
                )}
                {/* Main circle */}
                <circle
                  r={r}
                  fill={color}
                  stroke={isSelected ? "#fff" : "transparent"}
                  strokeWidth={isSelected ? 2 : 0}
                  opacity={isSelected ? 1 : 0.85}
                />
                {/* Label for larger nodes */}
                {r > 10 && (
                  <text
                    dy={r + 14}
                    textAnchor="middle"
                    fill="hsl(var(--muted-foreground))"
                    fontSize="10"
                    className="pointer-events-none"
                  >
                    {node.title.length > 12 ? node.title.slice(0, 12) + "..." : node.title}
                  </text>
                )}
              </g>
            )
          })}
          {/* eslint-enable react-hooks/refs */}
        </g>
      </svg>
    </div>
  )
}
