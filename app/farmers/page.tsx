"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Search, X } from "lucide-react"

interface Farmer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  birdCount: number
  joinDate: string
  status: "active" | "inactive"
  note?: string
}

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [mounted, setMounted] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewingFarmer, setViewingFarmer] = useState<Farmer | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchFilter, setShowSearchFilter] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    joinDate: new Date().toISOString().split("T")[0],
    status: "active" as "active" | "inactive",
    note: "",
  })

  useEffect(() => {
    setMounted(true)
    const savedFarmers = localStorage.getItem("farmers")
    if (savedFarmers) {
      const parsed = JSON.parse(savedFarmers)
      // Add status field for backward compatibility
      const farmersWithStatus = parsed.map((farmer: Farmer) => ({
        ...farmer,
        status: farmer.status || "active",
      }))
      setFarmers(farmersWithStatus)
      // Update localStorage with status field
      localStorage.setItem("farmers", JSON.stringify(farmersWithStatus))
    } else {
      setFarmers([])
    }
  }, [])

  const handleSave = () => {
    if (!formData.name || !formData.phone) {
      alert("Please fill all required fields")
      return
    }

    if (editingId) {
      const updated = farmers.map((farmer) =>
        farmer.id === editingId
          ? {
              ...farmer,
              name: formData.name,
              phone: formData.phone,
              address: formData.address,
              joinDate: formData.joinDate,
              status: formData.status,
              note: formData.note,
            }
          : farmer,
      )
      setFarmers(updated)
      localStorage.setItem("farmers", JSON.stringify(updated))
    } else {
      const newFarmer: Farmer = {
        id: Date.now().toString(),
        name: formData.name,
        email: "", // Keep for backward compatibility
        phone: formData.phone,
        address: formData.address,
        birdCount: 0, // Keep for backward compatibility
        joinDate: formData.joinDate,
        status: formData.status,
        note: formData.note,
      }
      const updated = [...farmers, newFarmer]
      setFarmers(updated)
      localStorage.setItem("farmers", JSON.stringify(updated))
    }

    resetForm()
    setShowDialog(false)
    }

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      address: "",
      joinDate: new Date().toISOString().split("T")[0],
      status: "active" as "active" | "inactive",
      note: "",
    })
    setEditingId(null)
  }

  const handleEdit = (farmer: Farmer) => {
    setEditingId(farmer.id)
    setFormData({
      name: farmer.name,
      phone: farmer.phone,
      address: farmer.address,
      joinDate: farmer.joinDate || new Date().toISOString().split("T")[0],
      status: farmer.status || "active",
      note: farmer.note || "",
    })
    setShowDialog(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this farmer?")) {
      const updated = farmers.filter((farmer) => farmer.id !== id)
      setFarmers(updated)
      localStorage.setItem("farmers", JSON.stringify(updated))
    }
  }

  const handleView = (farmer: Farmer) => {
    setViewingFarmer(farmer)
    setShowViewDialog(true)
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

  const getFilteredAndSortedFarmers = () => {
    let filtered = farmers

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (farmer) =>
          farmer.name.toLowerCase().includes(query) ||
          (farmer.phone && farmer.phone.toLowerCase().includes(query)),
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

  if (!mounted) return null

  return (
    <DashboardLayout>
    <div className="space-y-6">
        <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold">Farmers Management</h1>
            <p className="text-muted-foreground">Manage all farmers and their information</p>
        </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2" size={20} />
                Add Farmer
        </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Farmer" : "Add New Farmer"}</DialogTitle>
                <DialogDescription>Enter farmer details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Farmer name"
                  />
                </div>
                  <div className="space-y-2">
                    <Label>Phone *</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Phone number"
                  />
                </div>
                  <div className="space-y-2">
                    <Label>Join Date *</Label>
                  <Input
                      type="date"
                      value={formData.joinDate}
                      onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  />
                </div>
                  <div className="space-y-2">
                    <Label>Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
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
                  <div className="space-y-2 md:col-span-2">
                    <Label>Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Farm address"
                  />
                </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Note</Label>
                    <Textarea
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="Additional notes about the farmer"
                      rows={3}
                    />
                  </div>
              </div>
                <Button onClick={handleSave} className="w-full">
                  {editingId ? "Update" : "Add"} Farmer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Farmers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{farmers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Farmers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {farmers.filter((f) => (f.status || "active") === "active").length}
              </div>
          </CardContent>
        </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inactive Farmers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {farmers.filter((f) => (f.status || "active") === "inactive").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Farmers List</CardTitle>
                <CardDescription>View and manage all farmers</CardDescription>
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
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredAndSortedFarmers().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        {searchQuery ? "No farmers found matching your search." : "No farmers added yet. Click \"Add Farmer\" to get started."}
                      </TableCell>
                    </TableRow>
        ) : (
          getFilteredAndSortedFarmers().map((farmer) => (
                      <TableRow 
                        key={farmer.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleView(farmer)}
                      >
                        <TableCell className="font-medium">{farmer.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{farmer.phone}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{farmer.address || "N/A"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{farmer.joinDate}</TableCell>
                        <TableCell className="text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="icon" onClick={() => handleEdit(farmer)}>
                            <Edit2 size={16} />
                    </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDelete(farmer.id)}>
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

        {/* View Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Farmer Details</DialogTitle>
              <DialogDescription>View complete farmer information</DialogDescription>
            </DialogHeader>
            {viewingFarmer && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Name</Label>
                    <div className="text-sm font-medium">{viewingFarmer.name}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Phone</Label>
                    <div className="text-sm font-medium">{viewingFarmer.phone}</div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-muted-foreground">Address</Label>
                    <div className="text-sm font-medium">{viewingFarmer.address || "N/A"}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Join Date</Label>
                    <div className="text-sm font-medium">{viewingFarmer.joinDate}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Status</Label>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        viewingFarmer.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {viewingFarmer.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  {viewingFarmer.note && (
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-muted-foreground">Note</Label>
                      <div className="text-sm font-medium whitespace-pre-wrap">{viewingFarmer.note}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
