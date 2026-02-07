"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "operator"
  status: "active" | "inactive"
  password?: string
  locked?: boolean
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("admin@azizpoultry.com")
  const [password, setPassword] = useState("demo123")
  const [error, setError] = useState("")

  // Initialize default users if not exists
  useEffect(() => {
    const users = localStorage.getItem("users")
    if (!users) {
      const defaultUsers: any[] = [
        {
          id: "1",
          name: "Admin User",
          email: "admin@azizpoultry.com",
          phone: "+1234567890",
          role: "admin",
          status: "active",
          password: "demo123",
          joinDate: new Date().toISOString().split("T")[0],
          lastLogin: "Never",
          locked: false,
        },
        {
          id: "2",
          name: "Operator One",
          email: "operator@azizpoultry.com",
          phone: "+1234567891",
          role: "operator",
          status: "active",
          password: "demo123",
          joinDate: new Date().toISOString().split("T")[0],
          lastLogin: "Never",
          locked: false,
        },
      ]
      localStorage.setItem("users", JSON.stringify(defaultUsers))
    }
  }, [])


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Get users from localStorage
    const usersData = localStorage.getItem("users")
    if (!usersData) {
      setError("No users found. Please contact administrator.")
      setIsLoading(false)
      return
    }

    const users: User[] = JSON.parse(usersData)
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.status === "active",
    )

    if (!user) {
      setError("Invalid email or user is inactive")
      setIsLoading(false)
      return
    }

    // Check if user is locked
    if (user.locked) {
      setError("Your account has been locked. Please contact administrator.")
      setIsLoading(false)
      return
    }

    // Check password - accept "demo123" or user's actual password
    if (password !== "demo123" && user.password && password !== user.password) {
      setError("Invalid password")
      setIsLoading(false)
      return
    }
    
    // If user has no password set, accept "demo123" or require one to be entered
    if (!user.password && !password) {
      setError("Password is required")
      setIsLoading(false)
      return
    }

    // Update last login date for this user
    const updatedUsers = users.map((u) =>
      u.id === user.id
        ? {
            ...u,
            lastLogin: new Date().toISOString().split("T")[0],
          }
        : u,
    )
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    // Store logged in user (without password)
    const { password: _, ...userWithoutPassword } = user
    localStorage.setItem(
      "user",
      JSON.stringify({
        email: user.email,
        role: user.role,
        name: user.name,
      }),
    )

    setTimeout(() => {
      window.location.href = "/dashboard"
    }, 500)
  }

  const handleDemoLogin = () => {
    setIsLoading(true)
    setError("")
    
    // Use admin credentials for demo
    const usersData = localStorage.getItem("users")
    if (usersData) {
      const users: User[] = JSON.parse(usersData)
      const adminUser = users.find((u) => u.role === "admin" && u.status === "active")
      
      if (adminUser) {
        // Update last login date for this user
        const updatedUsers = users.map((u) =>
          u.id === adminUser.id
            ? {
                ...u,
                lastLogin: new Date().toISOString().split("T")[0],
              }
            : u,
        )
        localStorage.setItem("users", JSON.stringify(updatedUsers))

        const { password: _, ...userWithoutPassword } = adminUser
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: adminUser.email,
            role: adminUser.role,
            name: adminUser.name,
          }),
        )
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 500)
        return
      }
    }

    setError("Invalid credentials")
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">🐔</div>
            <CardTitle className="text-2xl">Aziz Poultry</CardTitle>
            <CardDescription>Farm Management System</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@azizpoultry.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-slate-800 rounded-lg text-sm text-muted-foreground">
            <p className="font-semibold mb-2">Demo Credentials:</p>
            <p className="mb-1">Admin: admin@azizpoultry.com / demo123</p>
            <p>Operator: operator@azizpoultry.com / demo123</p>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
