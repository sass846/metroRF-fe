"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

type Segment = { station: string; color1: string | null; color2: string | null }

export function RouteSummary({
  finalPath,
  totalTime,
  interChanges,
  estimatedFare,
  onBooked,
}: {
  finalPath: Segment[]
  totalTime: number
  interChanges: string[]
  estimatedFare: number
  onBooked?: () => void
}) {
  const { toast } = useToast()

  const safePath = Array.isArray(finalPath) ? finalPath : []
  const safeInterchanges = Array.isArray(interChanges) ? interChanges : []
  const interchangeSet = new Set(safeInterchanges.map((s) => s.toLowerCase().trim()))

  if (!safePath.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-pretty">Your Route</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No route found. Please check the stations and try again.</p>
        </CardContent>
      </Card>
    )
  }

  function colorBadge(c?: string | null) {
    if (!c) return null
    const base = c.replace("Color", "")
    const map: Record<string, string> = {
      blue: "bg-blue-600",
      bluebranch: "bg-blue-500",
      magenta: "bg-pink-600",
      yellow: "bg-yellow-500 text-black",
      violet: "bg-fuchsia-600",
      red: "bg-red-600",
      green: "bg-green-600",
      greenbranch: "bg-emerald-600",
      pink: "bg-pink-500",
      pinkbranch: "bg-rose-500",
      orange: "bg-orange-500",
      grey: "bg-gray-500",
    }
    return <span className={`inline-block h-2 w-2 rounded-full ${map[base] ?? "bg-gray-400"}`} aria-hidden="true" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-pretty">Your Route</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ol className="space-y-1">
          {safePath.map((p, idx) => {
            const isInterchange = interchangeSet.has((p?.station ?? "").toLowerCase().trim())
            return (
              <li
                key={`${p?.station ?? "station"}-${idx}`}
                className={`flex items-center justify-between rounded-md px-3 py-2 border ${
                  isInterchange ? "border-yellow-500 bg-yellow-500/10" : "border-border"
                }`}
              >
                <div className="flex items-center gap-2">
                  {colorBadge(p?.color2) || colorBadge(p?.color1)}
                  <span className="capitalize">{p?.station ?? "Unknown"}</span>
                </div>
                {isInterchange && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded border border-yellow-500 text-yellow-700 dark:text-yellow-400"
                    aria-label="Interchange station"
                  >
                    Interchange
                  </span>
                )}
              </li>
            )
          })}
        </ol>

        <div className="grid grid-cols-2 gap-4 md:max-w-md">
          <div>
            <div className="text-sm text-muted-foreground">Estimated Time</div>
            <div className="font-medium">{Math.round(totalTime)} min</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Estimated Fare</div>
            <div className="font-medium">₹{estimatedFare}</div>
          </div>
          <div className="col-span-2">
            <div className="text-sm text-muted-foreground">Interchanges</div>
            {safeInterchanges.length ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {safeInterchanges.map((s) => (
                  <span
                    key={s}
                    className="text-xs font-medium px-2 py-0.5 rounded border border-yellow-500 text-yellow-700 dark:text-yellow-400 capitalize"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <div className="font-medium">No interchanges</div>
            )}
          </div>
        </div>

        <Button
          className="mt-2"
          onClick={() => {
            toast({ title: "Ticket booked", description: "Your metro ticket has been reserved." })
            onBooked?.()
          }}
        >
          Book Ticket
        </Button>
      </CardContent>
    </Card>
  )
}
