"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { decodeJWT, type JWTPayload } from "@/lib/jwt"
import { useToast } from "@/hooks/use-toast"
import { loginUser, registerUser } from "@/lib/api"

type AuthState = {
  user: JWTPayload | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthCtx = createContext<AuthState | null>(null)

const LS_KEY = "metro:jwt"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<JWTPayload | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const t = localStorage.getItem(LS_KEY)
    if (!t) return

    const payload = decodeJWT(t)
    if(payload) {
      setToken(t)
      setUser(payload)
    } else {
      //token invalid or expired
      localStorage.removeItem(LS_KEY)
    }
  }, [])


  const handleAuthSuccess = useCallback((jwt: string) =>{
    const payload = decodeJWT(jwt)
    if(payload) {
      localStorage.setItem(LS_KEY, jwt)
      setToken(jwt)
      setUser(payload)
      toast({
        title: "Success",
        description: `Welcome, ${payload.email}!`,
      })
    }
  }, [toast])

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const { token } = await loginUser(email, password)
        handleAuthSuccess(token)
      } catch (error) {
        throw error
      }
    },
    [handleAuthSuccess]
  )

  const signup = useCallback(
    async (email: string, password: string) => {
      try {
        await registerUser(email, password)
        const { token } = await loginUser(email, password)
        handleAuthSuccess(token)
      } catch (error) {
        throw error
      }
    },
    [handleAuthSuccess]
  )

  const logout = useCallback(() => {
    localStorage.removeItem(LS_KEY)
    setToken(null)
    setUser(null)
    toast({
      title: "Logged out",
      description: "You have successfully logged out.",
    })
  }, [toast])

  const value = useMemo(() => ({ user, token, login, signup, logout }), [user, token, login, signup, logout])

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
