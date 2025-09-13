"use client"

import { useState } from "react"
import { useAuth } from "./auth-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AuthDialog() {
  const { user, login, signup, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    try {
      if (mode === "login") {
        await login(email, password)
      } else {
        await signup(email, password)
      }
      setOpen(false) // Close dialog on success
    } catch (error: any) {
      setError(error.message || "Please check your credentials and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if(!isOpen) {
      setMode("login")
      setEmail("")
      setPassword("")
      setError(null)
    }
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm">Signed in as {user.email}</span>
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Login</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-balance">
            {mode === "login" ? "Login to your account" : "Create a new account"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {error && (
            <div className="bg-destructive/15 p-3 rounded-md text-sm text-destructive">
              <p>{error}</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Loading..." : mode === "login" ? "Login" : "Sign up"}
            </Button>
            <Button
              variant="link"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              disabled={isLoading}
            >
              {mode === "login" ? "Create an account" : "Have an account? Login"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

