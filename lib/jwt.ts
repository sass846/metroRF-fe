function base64urlDecode(input: string): Uint8Array {
  const str = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  const bin = atob(str + pad);
  return new Uint8Array([...bin].map((c) => c.charCodeAt(0)));
}

export type JWTPayload = {
  id: string;
  email: string;
  is_admin: boolean;
  iat: number;
  exp: number;
};

export function decodeJWT(token: string): JWTPayload | null {
  try {
    const [_header, payload, _signature] = token.split(".");
    if (!payload) {
      return null;
    }

    const decodedPayload = JSON.parse(
      new TextDecoder().decode(base64urlDecode(payload))
    ) as JWTPayload;

    if (Date.now() / 1000 > decodedPayload.exp) {
      console.warn("JWT has expired.");
      return null;
    }

    return decodedPayload;
  } catch (error) {
    console.log("Failed to decode JWT: ", error);
    return null;
  }
}
