/**
 * Token 管理端点
 *
 * POST /api/auth/token - 设置 token（存入 httpOnly cookie）
 * DELETE /api/auth/token - 清除 token
 * GET /api/auth/token - 检查 token 是否已设置（不返回值）
 */

import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const COOKIE_NAME = "gbrain_token"
const MAX_AGE = 60 * 60 * 24 * 365 // 1 year

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, token.trim(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: MAX_AGE,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const cookieStore = await cookies()
  const hasToken = !!cookieStore.get(COOKIE_NAME)?.value
  return NextResponse.json({ hasToken })
}
