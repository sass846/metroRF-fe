"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "./auth-context"
import { LRUCache, routeKey } from "@/lib/lru"
import { useEffect, useState } from "react"

export type StoredRoute = {
  start: string
  end: string
  metro?: string // Add metro field to stored routes
  time: number
  fare: number
  at: number
}

const LRU_CAP = 10
const MAX_SHOW = 6

function storageKeys(userId: string) {
  return {
    recent: `metro:${userId}:recent`,
    freq: `metro:${userId}:freq`,
  }
}

export function useRouteStorage() {
  const { user } = useAuth()
  const [recent, setRecent] = useState<[string, StoredRoute][]>([])
  const [freqTop, setFreqTop] = useState<[string, number][]>([])

  useEffect(() => {
    if (!user) {
      setRecent([])
      setFreqTop([])
      return
    }
    const { recent: rk, freq: fk } = storageKeys(user.id)
    try {
      const rawRecent = JSON.parse(localStorage.getItem(rk) || "[]") as [string, StoredRoute][]
      setRecent(rawRecent.slice(0, MAX_SHOW))
      const freqMap = new Map<string, number>(JSON.parse(localStorage.getItem(fk) || "[]"))
      const top = Array.from(freqMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, MAX_SHOW)
      setFreqTop(top)
    } catch {
      // ignore
    }
  }, [user])

  const update = (route: StoredRoute) => {
    if (!user) return
    const { recent: rk, freq: fk } = storageKeys(user.id)
    // Update LRU
    const arr = (JSON.parse(localStorage.getItem(rk) || "[]") as [string, StoredRoute][]) ?? []
    const lru = LRUCache.fromArray<StoredRoute>(arr, LRU_CAP)
    const key = routeKey(route.start, route.end)
    lru.set(key, route)
    const newArr = lru.toArray()
    localStorage.setItem(rk, JSON.stringify(newArr))
    setRecent(newArr.slice(0, MAX_SHOW))

    // Update frequency map
    const freqArr = (JSON.parse(localStorage.getItem(fk) || "[]") as [string, number][]) ?? []
    const freqMap = new Map<string, number>(freqArr)
    freqMap.set(key, (freqMap.get(key) || 0) + 1)
    const newFreqArr = Array.from(freqMap.entries())
    localStorage.setItem(fk, JSON.stringify(newFreqArr))
    const top = newFreqArr.sort((a, b) => b[1] - a[1]).slice(0, MAX_SHOW)
    setFreqTop(top)
  }

  return { recent, freqTop, update }
}

export function HistoryPanels({
  onPick,
}: {
  onPick: (start: string, end: string) => void
}) {
  const { user } = useAuth()
  const { recent, freqTop } = useRouteStorage()

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-pretty">Your trips</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Login or sign up to see your recently and frequently traveled routes.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Recently traveled</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent routes yet.</p>
          ) : (
            recent.map(([k, r]) => (
              <Badge
                key={k}
                variant="secondary"
                className="cursor-pointer capitalize flex flex-col items-start p-2 h-auto"
                onClick={() => onPick(r.start, r.end)}
                title={`~${Math.round(r.time)} min • ₹${r.fare}`}
              >
                <div className="font-medium">
                  {r.start} → {r.end}
                </div>
                {r.metro && <div className="text-xs opacity-75 mt-1">{r.metro}</div>}
              </Badge>
            ))
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Frequently traveled</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {freqTop.length === 0 ? (
            <p className="text-sm text-muted-foreground">No frequent routes yet.</p>
          ) : (
            freqTop.map(([k, count]) => {
              const [start, end] = k.split("→")
              return (
                <Badge
                  key={k}
                  variant="outline"
                  className="cursor-pointer capitalize"
                  onClick={() => onPick(start, end)}
                  title={`${count}x traveled`}
                >
                  {start} → {end}
                </Badge>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
