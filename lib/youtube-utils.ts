// 從 YouTube URL 提取影片 ID
export function extractVideoId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[7].length === 11 ? match[7] : null
}

// YouTube 語言對照表（可擴充）
const YT_LANGUAGE_LABELS: Record<string, string> = {
  'zh-Hant': '繁體中文',
  'zh-Hans': '簡體中文',
  'en': '英文',
};

// 獲取影片資訊與字幕語言
export async function fetchVideoInfo(videoId: string) {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
      }
    });
    const html = await res.text();
    console.log('HTML length:', html.length);
    console.log('First 500 chars:', html.slice(0, 500));
    // 解析 <title> ... </title>
    const match = html.match(/<title>([^<]*)<\/title>/i);
    let title = match ? match[1] : '';
    title = title.replace(' - YouTube', '').trim();

    // 解析 player_response 裡的 captionTracks
    let languages: { value: string, label: string }[] = [];
    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*(\{[\s\S]*?\});/);
    console.log('playerResponseMatch:', playerResponseMatch ? '[found]' : '[not found]');
    if (playerResponseMatch) {
      console.log('playerResponseMatch length:', playerResponseMatch[1].length);
      console.log('First 500:', playerResponseMatch[1].slice(0, 500));
      console.log('Last 500:', playerResponseMatch[1].slice(-500));
    }
    if (playerResponseMatch) {
      try {
        const playerResponse = JSON.parse(playerResponseMatch[1]);
        // 新增 log
        console.log('playerResponse.captions:', playerResponse.captions);
        if (playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks) {
          console.log('captionTracks:', playerResponse.captions.playerCaptionsTracklistRenderer.captionTracks);
        }
        // 僅取 captionTracks，確保只顯示實際有字幕的語言
        const captionTracks = playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks;
        if (Array.isArray(captionTracks)) {
          languages = captionTracks.map((track: any) => {
            const value = track.languageCode;
            // 嘗試用 name.simpleText, 否則用對照表
            const label = track.name?.simpleText || YT_LANGUAGE_LABELS[value] || value;
            return { value, label };
          });
        }
      } catch (e) {
        // JSON parse 失敗忽略
      }
    }
    return { title, languages };
  } catch (error) {
    console.error('獲取影片資訊失敗:', error);
    return { title: '', languages: [] };
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
