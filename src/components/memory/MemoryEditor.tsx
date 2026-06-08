"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Edit3, Save, X } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { putPage } from "@/lib/gbrain"

interface MemoryEditorProps {
  slug: string
  initialContent: string
  onSave?: (content: string) => void
  onCancel?: () => void
}

export function MemoryEditor({ slug, initialContent, onSave, onCancel }: MemoryEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    if (!content.trim()) return

    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      await putPage(slug, content)
      setSuccess(true)
      setIsEditing(false)
      onSave?.(content)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("Failed to save page:", err)
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setIsSaving(false)
    }
  }

  if (!isEditing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">内容</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="gap-1.5"
          >
            <Edit3 className="h-3.5 w-3.5" />
            编辑
          </Button>
        </CardHeader>
        <CardContent className="p-6 prose prose-neutral dark:prose-invert max-w-none">
          {initialContent ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {initialContent}
            </ReactMarkdown>
          ) : (
            <p className="text-muted-foreground italic">暂无内容，点击编辑添加</p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">编辑内容</CardTitle>
        <div className="flex gap-2">
          {success && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              ✅ 已保存
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? "保存中..." : "保存"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsEditing(false)
              setContent(initialContent)
              onCancel?.()
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {error && (
          <div className="mb-3 p-2 text-sm text-destructive bg-destructive/10 rounded">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              <Edit3 className="h-3.5 w-3.5 inline mr-1" />
              编辑
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-96 p-3 rounded-lg border border-input bg-transparent text-sm font-mono resize-y focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="输入 Markdown 内容..."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              <Eye className="h-3.5 w-3.5 inline mr-1" />
              预览
            </label>
            <div className="w-full h-96 p-3 rounded-lg border border-input bg-muted/30 overflow-y-auto prose prose-neutral dark:prose-invert max-w-none text-sm">
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              ) : (
                <p className="text-muted-foreground italic">预览区域</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
