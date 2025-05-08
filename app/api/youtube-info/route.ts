import { NextRequest, NextResponse } from 'next/server';
import { extractVideoId, fetchVideoInfo } from '@/lib/youtube-utils';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid YouTube URL.' }, { status: 400 });
    }
    // 取得影片 ID
    const videoId = extractVideoId(url);
    if (videoId) {
      const { title, languages } = await fetchVideoInfo(videoId);
      return NextResponse.json({ title, languages });
    } else {
      return NextResponse.json({ error: 'Invalid YouTube URL.' }, { status: 400 });
    }
  } catch (error) {
    console.error('YouTube Info API error:', error);
    return NextResponse.json({ error: "Failed to process request.", detail: String(error) }, { status: 500 });
  }
}
