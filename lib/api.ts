const API_BASE =
  (typeof window !== "undefined" && (window as any).NEXT_PUBLIC_API_BASE) ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:8000";

type RecommendResponse = {
  recommendations1?: string[];
  recommendations2?: string[];
};

type RouteResponse = {
  finalPath: {
    station: string;
    color1: string | null;
    color2: string | null;
  }[];
  totalTime: number;
  interChanges: string[];
  estimatedFare: number;
};

type AuthRespose = {
  token: string;
};

type RegisterResponse = {
  message: string;
};

async function handleApiResponse(res: Response) {
  if (!res.ok) {
    let errorData = { error: `API Error: ${res.status} ${res.statusText}` };
    try {
      errorData = await res.json();
    } catch (e) {}
    throw new Error(errorData.error || "An unknown error occured");
  }
  return res.json();
}

export async function fetchRecommendations(query: string): Promise<string[]> {
  if (!query?.trim()) return [];
  try {
    const res = await fetch(`${API_BASE}/api/v1/recommend1`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stationName: query }),
    });
    const data: RecommendResponse = await handleApiResponse(res);
    return data.recommendations1 ?? [];
  } catch (error) {
    console.log("Failed to fetch recommendations: ", error);
    return [];
  }
}

export async function fetchRoute(
  start: string,
  end: string
): Promise<RouteResponse> {
  const res = await fetch(`${API_BASE}/api/v1/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ startStation: start, endStation: end }),
  });
  const data = (await handleApiResponse(res)) as Partial<RouteResponse>;

  const finalPath = Array.isArray(data?.finalPath) ? data.finalPath : [];
  const totalTime = typeof data?.totalTime === "number" ? data.totalTime : 0;
  const interChanges = Array.isArray(data?.interChanges)
    ? data.interChanges
    : [];
  const estimatedFare =
    typeof data?.estimatedFare === "number" ? data.estimatedFare : 0;

  return { finalPath, totalTime, interChanges, estimatedFare };
}

export async function registerUser(
  email: string,
  password: string
): Promise<RegisterResponse> {
  const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleApiResponse(res);
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthRespose> {
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleApiResponse(res);
}
