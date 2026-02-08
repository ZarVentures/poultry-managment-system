"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit2, Trash2, Lock, LockOpen, Shield, ArrowUpDown, ArrowUp, ArrowDown, Search, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: "admin" | "operator"
  status: "active" | "inactive"
  joinDate: string
  lastLogin: string
  locked?: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [mounted, setMounted] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewingUser, setViewingUser] = useState<User | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [detailsFilter, setDetailsFilter] = useState<"all" | "active" | "admin" | "operator" | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchFilter, setShowSearchFilter] = useState(false)
  const [formData, setFormData] = useState<{
    name: string
    email: string
    phone: string
    role: "admin" | "operator"
    status: "active" | "inactive"
  }>({
    name: "",
    email: "",
    phone: "",
    role: "operator",
    status: "active",
  })

  useEffect(() => {
    setMounted(true)
    // Check if user is admin - only admins can access this page
    const currentUser = localStorage.getItem("user")
    if (!currentUser) {
      window.location.href = "/"
      return
    }
    const user = JSON.parse(currentUser)
    if (user.role !== "admin") {
      alert("Only administrators can access user management")
      window.location.href = "/dashboard"
      return
    }

    const saved = localStorage.getItem("users")
    if (saved) {
      const parsed = JSON.parse(saved)
      // Add phone and locked fields for backward compatibility
      const usersWithFields = parsed.map((user: User) => ({
        ...user,
        phone: user.phone || "",
        locked: user.locked || false,
      }))
      setUsers(usersWithFields)
      // Update localStorage with new fields
      localStorage.setItem("users", JSON.stringify(usersWithFields))
    } else {
      setUsers([])
    }
  }, [])

  const handleSave = () => {
    if (!formData.name || !formData.phone) {
      alert("Please fill all required fields (Name and Phone)")
      return
    }

    // Check if email already exists (when creating new user and email is provided)
    if (formData.email) {
      if (!editingId) {
        const emailExists = users.some((u) => u.email.toLowerCase() === formData.email.toLowerCase())
        if (emailExists) {
          alert("Email already exists. Please use a different email.")
          return
        }
      } else {
        // When editing, check if email exists for another user
        const emailExists = users.some(
          (u) => u.id !== editingId && u.email.toLowerCase() === formData.email.toLowerCase(),
        )
        if (emailExists) {
          alert("Email already exists. Please use a different email.")
          return
        }
      }
    }

    // Check if phone already exists
    if (!editingId) {
      const phoneExists = users.some((u) => u.phone === formData.phone)
      if (phoneExists) {
        alert("Phone number already exists. Please use a different phone number.")
        return
      }
    } else {
      // When editing, check if phone exists for another user
      const phoneExists = users.some((u) => u.id !== editingId && u.phone === formData.phone)
      if (phoneExists) {
        alert("Phone number already exists. Please use a different phone number.")
        return
      }
    }

    const updatedUsers = editingId
      ? users.map((user) =>
          user.id === editingId
            ? {
                ...user,
                name: formData.name,
                email: formData.email || "",
                phone: formData.phone,
                role: formData.role,
                status: formData.status,
              }
            : user,
        )
      : [
          ...users,
          {
            id: Date.now().toString(),
            name: formData.name,
            email: formData.email || "",
            phone: formData.phone,
            role: formData.role,
            status: formData.status,
            joinDate: new Date().toISOString().split("T")[0],
            lastLogin: "Never",
            locked: false,
          },
        ]
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))
    resetForm()
    setShowDialog(false)
  }

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", role: "operator", status: "active" })
    setEditingId(null)
  }

  const handleEdit = (user: User) => {
    setEditingId(user.id)
    setFormData({
      name: user.name,
      email: user.email || "",
      phone: user.phone || "",
      role: user.role as "admin" | "operator" | "staff",
      status: user.status as "active" | "inactive",
    })
    setShowDialog(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      const updated = users.filter((user) => user.id !== id)
      setUsers(updated)
      localStorage.setItem("users", JSON.stringify(updated))
    }
  }

  const handleView = (user: User) => {
    setViewingUser(user)
    setShowViewDialog(true)
  }

  const handleViewDetails = (filter: "all" | "active" | "admin" | "operator") => {
    setDetailsFilter(filter)
    setShowDetailsDialog(true)
  }

  const getFilteredUsers = () => {
    if (!detailsFilter) return []
    switch (detailsFilter) {
      case "all":
        return users
      case "active":
        return users.filter((u) => u.status === "active")
      case "admin":
        return users.filter((u) => u.role === "admin")
      case "operator":
        return users.filter((u) => u.role === "operator")
      default:
        return []
    }
  }

  const getFilterTitle = () => {
    switch (detailsFilter) {
      case "all":
        return "All Users"
      case "active":
        return "Active Users"
      case "admin":
        return "Administrators"
      case "operator":
        return "Operators"
      default:
        return "Users"
    }
  }

  const handleSort = () => {
    if (sortOrder === null) {
      setSortOrder("asc")
    } else if (sortOrder === "asc") {
      setSortOrder("desc")
    } else {
      setSortOrder(null)
    }
  }

  const getFilteredAndSortedUsers = () => {
    let filtered = users

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          (user.phone && user.phone.toLowerCase().includes(query)),
      )
    }

    // Apply sorting
    if (sortOrder) {
      filtered = [...filtered].sort((a, b) => {
        const nameA = a.name.toLowerCase()
        const nameB = b.name.toLowerCase()
        if (sortOrder === "asc") {
          return nameA.localeCompare(nameB)
        } else {
          return nameB.localeCompare(nameA)
        }
      })
    }

    return filtered
  }

  const handleLock = (user: User) => {
    // Check if current user is admin
    const currentUser = localStorage.getItem("user")
    if (!currentUser) {
      alert("You must be logged in to perform this action")
      return
    }
    const currentUserData = JSON.parse(currentUser)
    if (currentUserData.role !== "admin") {
      alert("Only administrators can lock/unlock users")
      return
    }

    // Prevent locking admin users
    if (user.role === "admin") {
      alert("Admin users cannot be locked")
      return
    }

    // Prevent locking yourself
    if (user.email.toLowerCase() === currentUserData.email.toLowerCase()) {
      alert("You cannot lock your own account")
      return
    }

    const updated = users.map((u) =>
      u.id === user.id
        ? {
            ...u,
            locked: !u.locked,
          }
        : u,
    )
    setUsers(updated)
    localStorage.setItem("users", JSON.stringify(updated))
    
    // If user is currently logged in and gets locked, log them out immediately
    if (!user.locked) {
      const loggedInUser = localStorage.getItem("user")
      if (loggedInUser) {
        const loggedInUserData = JSON.parse(loggedInUser)
        if (loggedInUserData.email.toLowerCase() === user.email.toLowerCase()) {
          localStorage.removeItem("user")
          alert("Your account has been locked. You have been logged out.")
          window.location.href = "/"
          return
        }
      }
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "operator":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  const rolePermissions: { [key: string]: string[] } = {
    admin: ["All features", "User management", "System settings", "Reports & analytics"],
    operator: ["Godown management", "Purchase management", "Sales management", "Expense tracking", "Mortality management"],
  }

  if (!mounted) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage staff accounts and permissions</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2" size={20} />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit User" : "Add New User"}</DialogTitle>
                <DialogDescription>Create or update user account</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@azizpoultry.com (optional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number *</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="operator">Operator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSave} className="w-full">
                  {editingId ? "Update" : "Add"} User
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{users.length}</div>
              <button
                onClick={() => handleViewDetails("all")}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                View details
              </button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{users.filter((u) => u.status === "active").length}</div>
              <button
                onClick={() => handleViewDetails("active")}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                View details
              </button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Administrators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{users.filter((u) => u.role === "admin").length}</div>
              <button
                onClick={() => handleViewDetails("admin")}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                View details
              </button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Operators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{users.filter((u) => u.role === "operator").length}</div>
              <button
                onClick={() => handleViewDetails("operator")}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                View details
              </button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>User Accounts</CardTitle>
                <CardDescription>Manage all user accounts and permissions</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {showSearchFilter && (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search by name or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSearchQuery("")
                        setShowSearchFilter(false)
                      }}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                )}
                {!showSearchFilter && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSearchFilter(true)}
                  >
                    <Search className="mr-2" size={16} />
                    Filter
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 lg:px-3"
                        onClick={handleSort}
                      >
                        Name
                        {sortOrder === null && <ArrowUpDown className="ml-2 h-4 w-4" />}
                        {sortOrder === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
                        {sortOrder === "desc" && <ArrowDown className="ml-2 h-4 w-4" />}
                      </Button>
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredAndSortedUsers().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        {searchQuery ? "No users found matching your search." : "No users added yet. Click \"Add User\" to get started."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredAndSortedUsers().map((user) => (
                    <TableRow 
                      key={user.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleView(user)}
                    >
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.email || "N/A"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.phone || "N/A"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.status)}`}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                          {user.locked && (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              Locked
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.joinDate}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.lastLogin}</TableCell>
                      <TableCell className="text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                        {user.role !== "admin" ? (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleLock(user)}
                            title={user.locked ? "Unlock user" : "Lock user"}
                            className={user.locked ? "text-red-600 hover:text-red-700" : ""}
                          >
                            {user.locked ? <Lock size={16} /> : <LockOpen size={16} />}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="icon"
                            disabled
                            title="Admin users cannot be locked"
                            className="opacity-50 cursor-not-allowed"
                          >
                            <LockOpen size={16} />
                          </Button>
                        )}
                        <Button variant="outline" size="icon" onClick={() => handleEdit(user)}>
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDelete(user.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>Features available for each role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(rolePermissions).map(([role, permissions]) => (
                <div key={role} className="p-4 border rounded-lg">
                  <h3
                    className={`font-bold mb-3 flex items-center gap-2 ${getRoleColor(role)} rounded px-2 py-1 inline-block`}
                  >
                    <Shield size={16} />
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </h3>
                  <ul className="space-y-2">
                    {permissions.map((perm, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        {perm}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>View complete user information</DialogDescription>
            </DialogHeader>
            {viewingUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Name</Label>
                    <div className="text-sm font-medium">{viewingUser.name}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Email</Label>
                    <div className="text-sm font-medium">{viewingUser.email || "N/A"}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Phone</Label>
                    <div className="text-sm font-medium">{viewingUser.phone || "N/A"}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Role</Label>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleColor(viewingUser.role)}`}>
                        {viewingUser.role.charAt(0).toUpperCase() + viewingUser.role.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Status</Label>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(viewingUser.status)}`}>
                        {viewingUser.status.charAt(0).toUpperCase() + viewingUser.status.slice(1)}
                      </span>
                      {viewingUser.locked && (
                        <span className="ml-2 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Join Date</Label>
                    <div className="text-sm font-medium">{viewingUser.joinDate}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Last Login</Label>
                    <div className="text-sm font-medium">{viewingUser.lastLogin}</div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{getFilterTitle()}</DialogTitle>
              <DialogDescription>View all {getFilterTitle().toLowerCase()} in the system</DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Last Login</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredUsers().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No users found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      getFilteredUsers().map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{user.email || "N/A"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{user.phone || "N/A"}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.status)}`}>
                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                              </span>
                              {user.locked && (
                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                  Locked
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{user.joinDate}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{user.lastLogin}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
