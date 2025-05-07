#!/usr/bin/env python3
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "youtube-transcript-api",
#     "yt-dlp",
#     "openai-whisper",
# ]
# ///

"""
Python script to fetch or generate subtitles for a YouTube video.
Usage: python generate_subtitle.py <youtube_url>

- Tries to fetch subtitles using youtube-transcript-api first.
- If unavailable, downloads audio and uses Whisper to generate subtitles.
- Outputs SRT subtitle text to stdout.
"""
import sys
import json
import subprocess

try:
    from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
except ImportError:
    print("[ERROR] youtube-transcript-api not installed.", file=sys.stderr)
    sys.exit(1)

def fetch_youtube_id(url):
    """Extract YouTube video ID from URL."""
    import re
    patterns = [
        r"(?:v=|youtu.be/|embed/|shorts/)([\w-]{11})",
        r"youtube.com/watch\?v=([\w-]{11})"
    ]
    for pat in patterns:
        m = re.search(pat, url)
        if m:
            return m.group(1)
    return None

def transcript_to_srt(transcript):
    from datetime import timedelta
    def format_time(seconds):
        td = timedelta(seconds=float(seconds))
        return str(td)[:11].replace('.', ',')
    srt = []
    for i, entry in enumerate(transcript, 1):
        start = format_time(entry['start'])
        end = format_time(entry['start'] + entry['duration'])
        text = entry['text'].replace('\n', ' ')
        srt.append(f"{start} --> {end}\n{text}\n")
    return '\n\n'.join(srt)

def get_transcript(video_id, lang_codes=None):
    try:
        if lang_codes is None:
            lang_codes = ['zh', 'zh-Hant', 'zh-Hans', 'en']
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=lang_codes)
        print("[INFO] Successfully fetched transcript.", file=sys.stderr)
        return transcript_to_srt(transcript)
    except (TranscriptsDisabled, NoTranscriptFound) as e:
        print(f"[WARN] No transcript found: {e}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"[ERROR] {e}", file=sys.stderr)
        return None

def generate_subtitle_whisper(url):
    """Download audio and run whisper to generate subtitles."""
    import tempfile
    import os
    with tempfile.TemporaryDirectory() as tmpdir:
        audio_path = os.path.join(tmpdir, "audio.mp3")
        # Download audio
        ytdlp_cmd = [
            "yt-dlp", "-f", "bestaudio", "--extract-audio", "--audio-format", "mp3",
            "-o", audio_path, url
        ]
        try:
            subprocess.run(ytdlp_cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        except Exception as e:
            print(f"[ERROR] yt-dlp failed: {e}", file=sys.stderr)
            return None
        # Run whisper
        whisper_cmd = [
            "whisper", audio_path, "--model", "base", "--output_format", "srt", "--output_dir", tmpdir
        ]
        try:
            subprocess.run(whisper_cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            srt_path = audio_path.replace(".mp3", ".srt")
            with open(srt_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            print(f"[ERROR] whisper failed: {e}", file=sys.stderr)
            return None

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing YouTube URL"}))
        sys.exit(1)
    url = sys.argv[1]
    lang = sys.argv[2] if len(sys.argv) > 2 else None
    video_id = fetch_youtube_id(url)
    if not video_id:
        print(json.dumps({"error": "Invalid YouTube URL"}))
        sys.exit(1)
    lang_codes = None
    if lang:
        if lang in ["zh-TW", "zh-Hant"]:
            lang_codes = ["zh-Hant", "zh", "zh-Hans"]
        elif lang in ["zh-CN", "zh-Hans"]:
            lang_codes = ["zh-Hans", "zh", "zh-Hant"]
        elif lang == "en":
            lang_codes = ["en"]
        else:
            lang_codes = [lang]
    srt = get_transcript(video_id, lang_codes)
    if srt:
        print(srt)
        sys.exit(0)
    srt = generate_subtitle_whisper(url)
    if srt:
        print(srt)
        sys.exit(0)
    print("[ERROR] Unable to generate subtitles.", file=sys.stderr)
    sys.exit(1)

if __name__ == "__main__":
    main()
