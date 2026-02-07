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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit2, Trash2 } from "lucide-react"

interface Farmer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  birdCount: number
  joinDate: string
  status: "active" | "inactive"
}

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [mounted, setMounted] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    joinDate: new Date().toISOString().split("T")[0],
    status: "active" as "active" | "inactive",
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
            <CardTitle>Farmers List</CardTitle>
            <CardDescription>View and manage all farmers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {farmers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No farmers added yet. Click "Add Farmer" to get started.
                      </TableCell>
                    </TableRow>
        ) : (
          farmers.map((farmer) => (
                      <TableRow key={farmer.id}>
                        <TableCell className="font-medium">{farmer.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{farmer.phone}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{farmer.address || "N/A"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{farmer.joinDate}</TableCell>
                        <TableCell className="text-right space-x-2">
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
      </div>
    </DashboardLayout>
  )
}
