"use client"

import type React from "react"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { type JWTPayload, signJWT, verifyJWT } from "@/lib/jwt"

type AuthState = {
  user: { id: string; email: string } | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthCtx = createContext<AuthState | null>(null)

const LS_KEY = "metro:jwt"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)

  useEffect(() => {
    const t = localStorage.getItem(LS_KEY)
    if (!t) return
    ;(async () => {
      const payload = await verifyJWT(t)
      if (payload) {
        setToken(t)
        setUser({ id: payload.sub, email: payload.sub })
      } else {
        localStorage.removeItem(LS_KEY)
      }
    })()
  }, [])

  const issueToken = useCallback(async (email: string) => {
    const now = Math.floor(Date.now() / 1000)
    const payload: JWTPayload = { sub: email.toLowerCase(), iat: now, exp: now + 60 * 60 * 24 * 7 }
    const jwt = await signJWT(payload)
    localStorage.setItem(LS_KEY, jwt)
    setToken(jwt)
    setUser({ id: payload.sub, email })
  }, [])

  const login = useCallback(
    async (email: string, _password: string) => {
      await issueToken(email)
    },
    [issueToken],
  )

  const signup = useCallback(
    async (email: string, _password: string) => {
      await issueToken(email)
    },
    [issueToken],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(LS_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, token, login, signup, logout }), [user, token, login, signup, logout])

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
