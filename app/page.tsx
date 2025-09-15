"use client"

import { useState } from "react"
import useSWRMutation from "swr/mutation"
import { fetchRoute } from "@/lib/api"
import { StationAutocomplete } from "@/components/station-autocomplete"
import { MetroSelector } from "@/components/metro-selector"
import { RouteSummary } from "@/components/route-summary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AuthProvider, useAuth } from "@/components/auth-context"
import { AuthDialog } from "@/components/auth-dialog"
import { HistoryPanels, useRouteStorage } from "@/components/history-panels"
import { useToast } from "@/hooks/use-toast"

type RouteData = Awaited<ReturnType<typeof fetchRoute>>

function PlannerInner() {
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [selectedMetroId, setSelectedMetroId] = useState("")
  const [selectedMetroName, setSelectedMetroName] = useState("")
  const { user } = useAuth()
  const { update } = useRouteStorage()
  const { toast } = useToast()

  const { trigger, data, isMutating, error } = useSWRMutation<
    RouteData,
    Error,
    string,
    { start: string; end: string; metroId: string }
  >("route", async (_key, { arg }) => fetchRoute(arg.start, arg.end, arg.metroId))

  const canSearch = start.trim().length > 0 && end.trim().length > 0 && selectedMetroId

  const handleMetroChange = (metroId: string, metroName: string) => {
    setSelectedMetroId(metroId)
    setSelectedMetroName(metroName)
    setStart("")
    setEnd("")
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold text-pretty">Metro Route Finder</h1>
        <AuthDialog />
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-pretty">Plan your trip</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <MetroSelector value={selectedMetroId} onChange={handleMetroChange} />
          <div className="grid md:grid-cols-2 gap-4">
            <StationAutocomplete label="Start Station" value={start} onChange={setStart} metroId={selectedMetroId} />
            <StationAutocomplete label="Destination" value={end} onChange={setEnd} metroId={selectedMetroId} />
          </div>
          <div className="flex items-center gap-3">
            <Button
              disabled={!canSearch || isMutating}
              onClick={async () => {
                try {
                  const res = await trigger({ start, end, metroId: selectedMetroId })
                  if (!res || !Array.isArray(res.finalPath) || res.finalPath.length === 0) {
                    toast({
                      title: "No route found",
                      description: "Please check the station names and try again.",
                      variant: "destructive",
                    })
                    return
                  }
                  if (user) {
                    update({
                      start,
                      end,
                      metro: selectedMetroName,
                      time: res.totalTime,
                      fare: res.estimatedFare,
                      at: Date.now(),
                    })
                  }
                } catch (e) {
                  toast({
                    title: "Failed to fetch route",
                    description: "The server could not compute a route. Try different stations or try again later.",
                    variant: "destructive",
                  })
                }
              }}
            >
              {isMutating ? "Finding..." : "Get Shortest Path"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setStart("")
                setEnd("")
              }}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {data && (
        <RouteSummary
          finalPath={data.finalPath}
          totalTime={data.totalTime}
          interChanges={data.interChanges}
          estimatedFare={data.estimatedFare}
        />
      )}

      <Separator />

      <HistoryPanels
        onPick={(s, e) => {
          setStart(s)
          setEnd(e)
        }}
      />

      <footer className="pt-8 text-center text-xs text-muted-foreground">© Copyright 2025 MetroRF</footer>
    </main>
  )
}

export default function Page() {
  return (
    <AuthProvider>
      <PlannerInner />
    </AuthProvider>
  )
}
