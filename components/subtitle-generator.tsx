"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { processYoutubeVideo } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Download } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// 預設語言清單（尚未取得時使用）
const defaultLanguages = [
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

  // 新增影片預覽與語言狀態
  const [videoInfo, setVideoInfo] = useState<{title?: string, thumbnail?: string}|null>(null)
  const [availableLanguages, setAvailableLanguages] = useState<typeof defaultLanguages|null>(null)
  const [isFetchingLanguages, setIsFetchingLanguages] = useState(false)

  // 貼上連結時即時取得影片縮圖、標題與語言
  useEffect(() => {
    if (!youtubeUrl) {
      setVideoInfo(null)
      setVideoTitle(null)
      setAvailableLanguages(null)
      return
    }
    const videoIdMatch = youtubeUrl.match(/[?&]v=([\w-]+)/)
    if (videoIdMatch) {
      const videoId = videoIdMatch[1]
      setVideoInfo({
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      })
    } else {
      setVideoInfo(null)
    }
    // 取得標題與語言
    setIsFetchingLanguages(true)
    fetch("/api/youtube-info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: youtubeUrl }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.title) setVideoTitle(data.title)
        if (data.languages && Array.isArray(data.languages)) {
          setAvailableLanguages(data.languages)
          // 若目前語言不在新語言清單，重設
          if (!data.languages.some((l:any) => l.value === targetLanguage)) {
            setTargetLanguage(data.languages[0]?.value || "")
          }
        } else {
          setAvailableLanguages(null)
        }
      })
      .catch(() => {
        setAvailableLanguages(null)
      })
      .finally(() => setIsFetchingLanguages(false))
  }, [youtubeUrl])

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
      setSubtitleData(null);

      const res = await fetch("/api/subtitle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl, targetLanguage }),
      });
      const result = await res.json();

      if (res.ok && result.subtitles) {
        setSubtitleData(result.subtitles);
        setVideoTitle(result.title);
        // 從回傳取得語言清單（如果有）
        if (result.languages && Array.isArray(result.languages)) {
          setAvailableLanguages(result.languages);
          // 若目前語言不在清單中，自動選第一個
          if (!result.languages.some((l:any) => l.value === targetLanguage)) {
            setTargetLanguage(result.languages[0]?.value || "");
          }
        }
        toast({
          title: "字幕生成成功",
          description: "您現在可以下載字幕檔案",
        });
      } else {
        toast({
          title: "處理失敗",
          description: result.error || "無法處理此 YouTube 影片",
          variant: "destructive",
        });
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

          {Array.isArray(availableLanguages) && availableLanguages.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="target-language">
                目標語言
                {isFetchingLanguages && (
                  <span className="ml-2 text-xs text-muted-foreground">(需耗時產生)</span>
                )}
              </Label>
              <Select
                value={targetLanguage}
                onValueChange={setTargetLanguage}
                disabled={isProcessing || isFetchingLanguages}
              >
                <SelectTrigger id="target-language">
                  <SelectValue placeholder="選擇語言" />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : isFetchingLanguages && (
            <div className="space-y-2">
              <Label htmlFor="target-language">
                目標語言
                <span className="ml-2 text-xs text-muted-foreground">(需耗時產生)</span>
              </Label>
            </div>
          )}

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

        {/* 影片預覽 */}
        {videoInfo && (
          <div className="mt-6 flex items-center space-x-4">
            {videoInfo.thumbnail && (
              <img src={videoInfo.thumbnail} alt="影片縮圖" className="w-32 h-20 rounded object-cover border" />
            )}
            <div>
              <Label>影片預覽</Label>
              <div className="text-sm text-muted-foreground max-w-xs truncate">
                {videoTitle || "(標題將於生成字幕時顯示)"}
              </div>
            </div>
          </div>
        )}
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
