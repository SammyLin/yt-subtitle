"use server"

import { extractVideoId, fetchVideoInfo, generateSubtitles, translateSubtitles } from "@/lib/youtube-utils"

export async function processYoutubeVideo(youtubeUrl: string, targetLanguage: string) {
  try {
    // 1. 從 URL 提取 YouTube 影片 ID
    const videoId = extractVideoId(youtubeUrl)
    if (!videoId) {
      return { success: false, error: "無效的 YouTube 連結" }
    }

    // 2. 獲取影片資訊（標題等）
    const videoInfo = await fetchVideoInfo(videoId)
    if (!videoInfo) {
      return { success: false, error: "無法獲取影片資訊" }
    }

    // 3. 生成原始字幕
    const originalSubtitles = await generateSubtitles(videoId)
    if (!originalSubtitles) {
      return { success: false, error: "無法生成字幕" }
    }

    // 4. 如果需要，翻譯字幕到目標語言
    const translatedSubtitles = await translateSubtitles(originalSubtitles, targetLanguage)

    return {
      success: true,
      title: videoInfo.title,
      subtitles: translatedSubtitles || originalSubtitles,
    }
  } catch (error) {
    console.error("處理 YouTube 影片時出錯:", error)
    return { success: false, error: "處理影片時發生錯誤" }
  }
}
