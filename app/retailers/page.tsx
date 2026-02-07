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

interface Retailer {
  id: string
  shopName: string
  ownerName: string
  email: string
  phone: string
  address: string
  totalPurchases: number
  lastOrder: string
  joinDate: string
  status: "active" | "inactive"
}

export default function RetailersPage() {
  const [retailers, setRetailers] = useState<Retailer[]>([])
  const [mounted, setMounted] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewingRetailer, setViewingRetailer] = useState<Retailer | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    shopName: "",
    ownerName: "",
    phone: "",
    address: "",
    joinDate: new Date().toISOString().split("T")[0],
    status: "active" as "active" | "inactive",
  })

  useEffect(() => {
    setMounted(true)
    const savedRetailers = localStorage.getItem("retailers")
    if (savedRetailers) {
      const parsed = JSON.parse(savedRetailers)
      // Add status and joinDate fields for backward compatibility
      const retailersWithStatus = parsed.map((retailer: Retailer) => ({
        ...retailer,
        status: retailer.status || "active",
        joinDate: retailer.joinDate || new Date().toISOString().split("T")[0],
      }))
      setRetailers(retailersWithStatus)
      // Update localStorage with new fields
      localStorage.setItem("retailers", JSON.stringify(retailersWithStatus))
    } else {
      setRetailers([])
    }
  }, [])

  const handleSave = () => {
    if (!formData.shopName || !formData.ownerName || !formData.phone) {
      alert("Please fill all required fields")
      return
    }

    if (editingId) {
      const updated = retailers.map((retailer) =>
        retailer.id === editingId
          ? {
              ...retailer,
              shopName: formData.shopName,
              ownerName: formData.ownerName,
              phone: formData.phone,
              address: formData.address,
              joinDate: formData.joinDate,
              status: formData.status,
            }
          : retailer,
      )
      setRetailers(updated)
      localStorage.setItem("retailers", JSON.stringify(updated))
    } else {
      const newRetailer: Retailer = {
        id: Date.now().toString(),
        shopName: formData.shopName,
        ownerName: formData.ownerName,
        email: "", // Keep for backward compatibility
        phone: formData.phone,
        address: formData.address,
        totalPurchases: 0,
        lastOrder: new Date().toISOString().split("T")[0],
        joinDate: formData.joinDate,
        status: formData.status,
      }
      const updated = [...retailers, newRetailer]
      setRetailers(updated)
      localStorage.setItem("retailers", JSON.stringify(updated))
    }

    resetForm()
    setShowDialog(false)
  }

  const resetForm = () => {
    setFormData({
      shopName: "",
      ownerName: "",
      phone: "",
      address: "",
      joinDate: new Date().toISOString().split("T")[0],
      status: "active" as "active" | "inactive",
    })
    setEditingId(null)
  }

  const handleEdit = (retailer: Retailer) => {
    setEditingId(retailer.id)
    setFormData({
      shopName: retailer.shopName,
      ownerName: retailer.ownerName,
      phone: retailer.phone,
      address: retailer.address,
      joinDate: retailer.joinDate || new Date().toISOString().split("T")[0],
      status: retailer.status || "active",
    })
    setShowDialog(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this retailer?")) {
      const updated = retailers.filter((retailer) => retailer.id !== id)
      setRetailers(updated)
      localStorage.setItem("retailers", JSON.stringify(updated))
    }
  }

  const handleView = (retailer: Retailer) => {
    setViewingRetailer(retailer)
    setShowViewDialog(true)
  }

  if (!mounted) return null

  return (
    <DashboardLayout>
    <div className="space-y-6">
        <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold">Retailers Management</h1>
            <p className="text-muted-foreground">Manage all retailers and their information</p>
        </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2" size={20} />
                Add Retailer
        </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Retailer" : "Add New Retailer"}</DialogTitle>
                <DialogDescription>Enter retailer details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Shop Name *</Label>
                  <Input
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                      placeholder="Shop name"
                  />
                </div>
                  <div className="space-y-2">
                    <Label>Owner Name *</Label>
                  <Input
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      placeholder="Owner name"
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
                      placeholder="Shop address"
                  />
                </div>
              </div>
                <Button onClick={handleSave} className="w-full">
                  {editingId ? "Update" : "Add"} Retailer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Retailers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{retailers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Active Retailers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {retailers.filter((r) => (r.status || "active") === "active").length}
              </div>
          </CardContent>
        </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Deactive Retailers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {retailers.filter((r) => (r.status || "active") === "inactive").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Retailers List</CardTitle>
            <CardDescription>View and manage all retailers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shop Name</TableHead>
                    <TableHead>Owner Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {retailers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No retailers added yet. Click "Add Retailer" to get started.
                      </TableCell>
                    </TableRow>
        ) : (
          retailers.map((retailer) => (
                      <TableRow 
                        key={retailer.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleView(retailer)}
                      >
                        <TableCell className="font-medium">{retailer.shopName}</TableCell>
                        <TableCell>{retailer.ownerName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{retailer.phone}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{retailer.address || "N/A"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{retailer.joinDate || "N/A"}</TableCell>
                        <TableCell className="text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="icon" onClick={() => handleEdit(retailer)}>
                            <Edit2 size={16} />
                    </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDelete(retailer.id)}>
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
              <DialogTitle>Retailer Details</DialogTitle>
              <DialogDescription>View complete retailer information</DialogDescription>
            </DialogHeader>
            {viewingRetailer && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Shop Name</Label>
                    <div className="text-sm font-medium">{viewingRetailer.shopName}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Owner Name</Label>
                    <div className="text-sm font-medium">{viewingRetailer.ownerName}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Phone</Label>
                    <div className="text-sm font-medium">{viewingRetailer.phone}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Join Date</Label>
                    <div className="text-sm font-medium">{viewingRetailer.joinDate || "N/A"}</div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-muted-foreground">Address</Label>
                    <div className="text-sm font-medium">{viewingRetailer.address || "N/A"}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Status</Label>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        viewingRetailer.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {viewingRetailer.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
