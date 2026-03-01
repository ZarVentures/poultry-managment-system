"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi } from "@/lib/api"
import { toast } from "sonner"

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("admin@azizpoultry.com")
  const [password, setPassword] = useState("admin123")
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await authApi.login(email, password)
      
      // Store token and user info
      localStorage.setItem('token', response.accessToken)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      toast.success('Login successful!')
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 500)
    } catch (error: any) {
      console.error('Login failed:', error)
      setError(error.message || "Invalid credentials")
      toast.error("Login failed: " + (error.message || "Invalid credentials"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">🐔</div>
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>Enter your credentials to access the Poultry Management System</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@azizpoultry.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-slate-800 rounded-lg text-sm text-muted-foreground">
            <p className="font-semibold mb-2">Default credentials:</p>
            <p className="mb-1">Email: admin@azizpoultry.com</p>
            <p>Password: admin123</p>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
