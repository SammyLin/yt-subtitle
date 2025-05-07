// 從 YouTube URL 提取影片 ID
export function extractVideoId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[7].length === 11 ? match[7] : null
}

// 獲取影片資訊
export async function fetchVideoInfo(videoId: string) {
  try {
    // 在實際應用中，這裡應該調用 YouTube API 獲取影片資訊
    // 這裡為了示範，返回模擬數據
    return {
      title: `YouTube Video ${videoId}`,
      duration: "10:00",
      author: "YouTube Creator",
    }
  } catch (error) {
    console.error("獲取影片資訊失敗:", error)
    return null
  }
}

// 生成字幕
export async function generateSubtitles(videoId: string): Promise<string | null> {
  try {
    // 在實際應用中，這裡應該使用語音識別 API 或服務
    // 這裡為了示範，返回模擬字幕
    return `1
00:00:00,000 --> 00:00:03,000
歡迎來到這個示範影片

2
00:00:03,500 --> 00:00:07,000
這是一個自動生成字幕的示範

3
00:00:07,500 --> 00:00:12,000
實際應用中，我們會使用 AI 服務來處理真實的影片內容

4
00:00:12,500 --> 00:00:18,000
您可以將這個系統整合到您的網站中`
  } catch (error) {
    console.error("生成字幕失敗:", error)
    return null
  }
}

// 翻譯字幕
export async function translateSubtitles(subtitles: string, targetLanguage: string): Promise<string | null> {
  try {
    // 在實際應用中，這裡應該使用翻譯 API 或服務
    // 這裡為了示範，根據目標語言返回不同的模擬翻譯

    if (targetLanguage === "en") {
      return `1
00:00:00,000 --> 00:00:03,000
Welcome to this demo video

2
00:00:03,500 --> 00:00:07,000
This is a demonstration of automatic subtitle generation

3
00:00:07,500 --> 00:00:12,000
In real applications, we would use AI services to process actual video content

4
00:00:12,500 --> 00:00:18,000
You can integrate this system into your website`
    }

    if (targetLanguage === "ja") {
      return `1
00:00:00,000 --> 00:00:03,000
このデモビデオへようこそ

2
00:00:03,500 --> 00:00:07,000
これは自動字幕生成のデモンストレーションです

3
00:00:07,500 --> 00:00:12,000
実際のアプリケーションでは、AIサービスを使用して実際のビデオコンテンツを処理します

4
00:00:12,500 --> 00:00:18,000
このシステムをあなたのウェブサイトに統合することができます`
    }

    // 默認返回原始字幕
    return subtitles
  } catch (error) {
    console.error("翻譯字幕失敗:", error)
    return subtitles // 翻譯失敗時返回原始字幕
  }
}
