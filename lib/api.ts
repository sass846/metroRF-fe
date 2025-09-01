const API_BASE =
  (typeof window !== "undefined" && (window as any).NEXT_PUBLIC_API_BASE) ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:8000"

type RecommendResponse = { recommendations1?: string[]; recommendations2?: string[] }
type RouteResponse = {
  finalPath: { station: string; color1: string | null; color2: string | null }[]
  totalTime: number
  interChanges: string[]
  estimatedFare: number
}

export async function fetchRecommendations(query: string): Promise<string[]> {
  if (!query?.trim()) return []
  const res = await fetch(`${API_BASE}/api/v1/recommend1`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stationName: query }),
  })
  if (!res.ok) return []
  const data: RecommendResponse = await res.json()
  return data.recommendations1 ?? []
}

export async function fetchRoute(start: string, end: string): Promise<RouteResponse> {
  const res = await fetch(`${API_BASE}/api/v1/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ startStation: start, endStation: end }),
  })
  if (!res.ok) {
    throw new Error(`Route API error: ${res.status}`)
  }
  const data = (await res.json()) as Partial<RouteResponse>

  const finalPath = Array.isArray(data?.finalPath) ? data.finalPath : []
  const totalTime = typeof data?.totalTime === "number" ? data.totalTime : 0
  const interChanges = Array.isArray(data?.interChanges) ? data.interChanges : []
  const estimatedFare = typeof data?.estimatedFare === "number" ? data.estimatedFare : 0

  return { finalPath, totalTime, interChanges, estimatedFare }
}
