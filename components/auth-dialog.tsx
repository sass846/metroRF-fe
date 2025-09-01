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
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{mode === "login" ? "Login" : "Sign up"}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-balance">
            {mode === "login" ? "Login to continue" : "Create an account"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="flex items-center justify-between">
            <Button
              onClick={async () => {
                if (mode === "login") await login(email, password)
                else await signup(email, password)
                setOpen(false)
              }}
            >
              {mode === "login" ? "Login" : "Sign up"}
            </Button>
            <Button variant="link" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
              {mode === "login" ? "Create account" : "Have an account? Login"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
