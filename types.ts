export interface Metro {
  id: number;
  name: string;
  city: string;
}

export interface Station {
  id: number;
  name: string;
}

export interface Line {
  id: number;
  name: string;
  color: string;
  metroId: number;
}

export interface RoutePathSegment {
  station: string;
  color1: string | null;
  color2: string | null;
}

export interface RouteResponse {
  finalPath: RoutePathSegment[];
  totalTime: number;
  interChanges: string[];
  estimatedFare: number;
}
