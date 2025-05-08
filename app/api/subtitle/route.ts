import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { extractVideoId, fetchVideoInfo } from '@/lib/youtube-utils';

// Mock subtitle generator for initial API scaffolding
export async function POST(req: NextRequest) {
  try {
    const { url, targetLanguage } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid YouTube URL.' }, { status: 400 });
    }
    // 取得影片 ID
    const videoId = extractVideoId(url);
    let title = '';
    if (videoId) {
      const info = await fetchVideoInfo(videoId);
      title = info?.title || '';
    }

    // 呼叫 Python 腳本產生字幕
    const { spawn } = require('child_process');
    const scriptPath = path.join(process.cwd(), 'subtitle_backend', 'generate_subtitle.py');
    const args = ['run', scriptPath, url];
    if (targetLanguage) args.push(targetLanguage);
    const py = spawn('uv', args);

    let stdout = '';
    let stderr = '';
    for await (const chunk of py.stdout) {
      stdout += chunk;
    }
    for await (const chunk of py.stderr) {
      stderr += chunk;
    }
    const exitCode = await new Promise((resolve) => {
      py.on('close', resolve);
    });

    // 模擬可用語言清單（可改為串接 API）
    const languages = [
      { value: 'zh-TW', label: '繁體中文' },
      { value: 'zh-CN', label: '簡體中文' },
      { value: 'en', label: '英文' },
      { value: 'ja', label: '日文' },
      { value: 'ko', label: '韓文' },
      { value: 'fr', label: '法文' },
      { value: 'de', label: '德文' },
      { value: 'es', label: '西班牙文' },
    ];

    // Debug log to server console
    console.log('[DEBUG] PYTHON exitCode:', exitCode);
    console.log('[DEBUG] PYTHON STDOUT length:', stdout.length, '| preview:', stdout.slice(0, 300));
    console.log('[DEBUG] PYTHON STDERR:', stderr);

    if (exitCode === 0 && stdout.trim()) {
      return NextResponse.json({ subtitles: stdout, type: 'srt', title, languages });
    } else {
      return NextResponse.json({
        error: 'Failed to generate subtitles.',
        debug: {
          exitCode,
          stdout_preview: stdout.slice(0, 300),
          stdout_length: stdout.length,
          stderr
        },
        title,
        languages
      }, { status: 500 });
    }
  } catch (e) {
    return NextResponse.json({ error: 'Failed to process request.' }, { status: 500 });
  }
}
