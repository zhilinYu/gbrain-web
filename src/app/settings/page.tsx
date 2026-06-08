"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle2, Key, Terminal, ExternalLink } from "lucide-react"
import { setGbrainToken, clearGbrainToken, hasGbrainToken } from "@/lib/gbrain"

export default function SettingsPage() {
  const [token, setToken] = useState("")
  const [hasToken, setHasToken] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")

  useEffect(() => {
    hasGbrainToken().then(setHasToken)
  }, [])

  const handleSave = async () => {
    if (!token.trim()) return

    try {
      await setGbrainToken(token.trim())
      setHasToken(true)
      setToken("")
      setStatus("success")
      setStatusMessage("Token 已保存")
      setTimeout(() => setStatus("idle"), 3000)
    } catch {
      setStatus("error")
      setStatusMessage("保存失败")
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  const handleClear = async () => {
    try {
      await clearGbrainToken()
      setHasToken(false)
      setToken("")
      setStatus("success")
      setStatusMessage("Token 已清除")
      setTimeout(() => setStatus("idle"), 3000)
    } catch {
      setStatus("error")
      setStatusMessage("清除失败")
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  return (
    <div className="min-h-screen">
      <Header title="Settings" description="配置 GBrain 连接" />
      <div className="p-6 space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Token
            </CardTitle>
            <CardDescription>
              设置 GBrain 的认证 Token，用于访问 MCP 接口
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Token</label>
              <Input
                type="password"
                placeholder="gbrain_xxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              {hasToken && (
                <p className="text-xs text-muted-foreground">
                  Token 已配置（存储在 httpOnly cookie 中）
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!token.trim()}>
                保存
              </Button>
              {hasToken && (
                <Button variant="outline" onClick={handleClear}>
                  清除
                </Button>
              )}
            </div>
            {status === "success" && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                {statusMessage}
              </div>
            )}
            {status === "error" && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {statusMessage}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              如何获取 Token
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm">1. 确保 GBrain 服务已启动：</p>
              <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                gbrain serve --http --port 8787
              </pre>
              <p className="text-sm">2. 创建 Token：</p>
              <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                gbrain auth create &quot;gbrain-web&quot; --takes-holders world
              </pre>
              <p className="text-sm">3. 复制生成的 token 并粘贴到上方输入框</p>
              <a
                href="https://github.com/garrytan/gbrain"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                查看 GBrain 文档
              </a>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">环境配置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">GBrain URL</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {process.env.NEXT_PUBLIC_GBRAIN_URL || "http://localhost:8787"}
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">API Route</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  /api/gbrain
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}