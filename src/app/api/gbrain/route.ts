/**
 * GBrain MCP 代理路由
 *
 * 前端通过此路由调用 GBrain MCP 工具
 * 路由：POST /api/gbrain
 *
 * Token 从 httpOnly cookie (gbrain_token) 读取，兜底环境变量
 */

import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const GBRAIN_BASE_URL = process.env.GBRAIN_URL || "http://localhost:8787"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 从 httpOnly cookie 获取 token，兜底环境变量
    const cookieStore = await cookies()
    const token = cookieStore.get("gbrain_token")?.value || process.env.GBRAIN_TOKEN

    // 直接转发到 GBrain MCP 端点
    const response = await fetch(`${GBRAIN_BASE_URL}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      await response.text()
      const message =
        response.status === 401
          ? "API Token 未配置或无效，请在 Settings 页面设置 Token"
          : `GBrain MCP failed: ${response.status}`
      return NextResponse.json({ error: message }, { status: response.status })
    }

    // 返回 GBrain 的 SSE 响应
    const text = await response.text()
    return new Response(text, {
      headers: {
        "Content-Type": "text/event-stream",
      },
    })
  } catch (error) {
    console.error("GBrain MCP proxy error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
