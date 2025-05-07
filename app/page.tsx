import { Suspense } from "react"
import { YoutubeIcon } from "lucide-react"
import SubtitleGenerator from "@/components/subtitle-generator"
import LoadingState from "@/components/loading-state"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-24">
      <div className="max-w-3xl w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <YoutubeIcon className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold">YouTube 字幕生成器</h1>
          </div>
          <p className="text-muted-foreground">貼上 YouTube 連結，自動生成您需要的語系字幕檔</p>
        </div>

        <Suspense fallback={<LoadingState />}>
          <SubtitleGenerator />
        </Suspense>
      </div>
    </main>
  )
}
