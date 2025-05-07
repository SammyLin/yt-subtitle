import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function LoadingState() {
  return (
    <Card>
      <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">載入中...</p>
      </CardContent>
    </Card>
  )
}
