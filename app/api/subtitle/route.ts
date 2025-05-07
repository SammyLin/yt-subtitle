import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

// Mock subtitle generator for initial API scaffolding
export async function POST(req: NextRequest) {
  try {
    const { url, targetLanguage } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid YouTube URL.' }, { status: 400 });
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

    // Debug log to server console
    console.log('[DEBUG] PYTHON exitCode:', exitCode);
    console.log('[DEBUG] PYTHON STDOUT length:', stdout.length, '| preview:', stdout.slice(0, 300));
    console.log('[DEBUG] PYTHON STDERR:', stderr);

    if (exitCode === 0 && stdout.trim()) {
      return NextResponse.json({ subtitles: stdout, type: 'srt' });
    } else {
      return NextResponse.json({
        error: 'Failed to generate subtitles.',
        debug: {
          exitCode,
          stdout_preview: stdout.slice(0, 300),
          stdout_length: stdout.length,
          stderr
        }
      }, { status: 500 });
    }
  } catch (e) {
    return NextResponse.json({ error: 'Failed to process request.' }, { status: 500 });
  }
}
