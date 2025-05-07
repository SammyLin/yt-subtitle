"use client"

import type React from "react"

import { useState } from "react"
import { processYoutubeVideo } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Download } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

const languages = [
  { value: "zh-TW", label: "繁體中文" },
  { value: "zh-CN", label: "簡體中文" },
  { value: "en", label: "英文" },
  { value: "ja", label: "日文" },
  { value: "ko", label: "韓文" },
  { value: "fr", label: "法文" },
  { value: "de", label: "德文" },
  { value: "es", label: "西班牙文" },
]

export default function SubtitleGenerator() {
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [targetLanguage, setTargetLanguage] = useState("zh-TW")
  const [isProcessing, setIsProcessing] = useState(false)
  const [subtitleData, setSubtitleData] = useState<string | null>(null)
  const [videoTitle, setVideoTitle] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!youtubeUrl) {
      toast({
        title: "請輸入 YouTube 連結",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)
      setSubtitleData(null)

      const result = await processYoutubeVideo(youtubeUrl, targetLanguage)

      if (result.success) {
        setSubtitleData(result.subtitles)
        setVideoTitle(result.title)
        toast({
          title: "字幕生成成功",
          description: "您現在可以下載字幕檔案",
        })
      } else {
        toast({
          title: "處理失敗",
          description: result.error || "無法處理此 YouTube 影片",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "發生錯誤",
        description: "處理影片時發生錯誤，請稍後再試",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadSubtitle = () => {
    if (!subtitleData || !videoTitle) return

    const fileName = `${videoTitle.replace(/[^\w\s]/gi, "")}_${targetLanguage}.srt`
    const blob = new Blob([subtitleData], { type: "text/plain;charset=utf-8" })

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="youtube-url">YouTube 連結</Label>
            <Input
              id="youtube-url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-language">目標語言</Label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage} disabled={isProcessing}>
              <SelectTrigger id="target-language">
                <SelectValue placeholder="選擇語言" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between items-center pt-2">
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  處理中...
                </>
              ) : (
                "生成字幕"
              )}
            </Button>

            {subtitleData && (
              <Button type="button" variant="outline" onClick={downloadSubtitle}>
                <Download className="mr-2 h-4 w-4" />
                下載字幕檔
              </Button>
            )}
          </div>
        </form>

        {subtitleData && (
          <div className="mt-6">
            <Label>預覽字幕</Label>
            <div className="mt-2 p-3 bg-muted rounded-md h-48 overflow-y-auto text-sm font-mono">{subtitleData}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
