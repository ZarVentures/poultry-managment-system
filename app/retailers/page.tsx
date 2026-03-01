"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit2, Trash2, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { retailersApi, type Retailer as ApiRetailer } from "@/lib/api"
import { toast } from "sonner"

export default function RetailersPage() {
  const [retailers, setRetailers] = useState<ApiRetailer[]>([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    phone: "",
    email: "",
    address: "",
    status: "active" as "active" | "inactive",
    notes: "",
  })

  useEffect(() => {
    setMounted(true)
    fetchRetailers()
  }, [])

  const fetchRetailers = async () => {
    try {
      setLoading(true)
      const data = await retailersApi.getAll()
      setRetailers(data)
    } catch (error: any) {
      console.error("Failed to fetch retailers:", error)
      toast.error("Failed to load retailers")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      ownerName: "",
      phone: "",
      email: "",
      address: "",
      status: "active",
      notes: "",
    })
    setEditingId(null)
  }

  const handleEdit = (retailer: ApiRetailer) => {
    setFormData({
      name: retailer.name,
      ownerName: retailer.ownerName || "",
      phone: retailer.phone,
      email: retailer.email || "",
      address: retailer.address || "",
      status: retailer.status,
      notes: retailer.notes || "",
    })
    setEditingId(retailer.id)
    setShowDialog(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.phone) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      setLoading(true)
      
      if (editingId) {
        await retailersApi.update(editingId, {
          name: formData.name,
          ownerName: formData.ownerName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          status: formData.status,
          notes: formData.notes,
        })
        toast.success("Retailer updated successfully")
      } else {
        await retailersApi.create({
          name: formData.name,
          ownerName: formData.ownerName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          status: formData.status,
          notes: formData.notes,
        })
        toast.success("Retailer created successfully")
      }

      await fetchRetailers()
      resetForm()
      setShowDialog(false)
    } catch (error: any) {
      console.error('Failed to save retailer:', error)
      toast.error(editingId ? "Failed to update retailer" : "Failed to create retailer")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this retailer?")) return

    try {
      setLoading(true)
      await retailersApi.delete(id)
      toast.success("Retailer deleted successfully")
      await fetchRetailers()
    } catch (error: any) {
      console.error('Failed to delete retailer:', error)
      toast.error("Failed to delete retailer")
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Retailers</h1>
            <p className="text-muted-foreground">Manage your retail customers</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2" size={20} />
                New Retailer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Retailer" : "New Retailer"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Shop Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Shop name"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Owner Name</Label>
                    <Input
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      placeholder="Owner name"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone *</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Phone number"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email address"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Address"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    disabled={loading}
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

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes"
                    rows={3}
                    disabled={loading}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1" disabled={loading}>
                    {loading ? "Saving..." : editingId ? "Update" : "Create"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowDialog(false)} disabled={loading}>
                    <X size={20} />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Retailers List</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && retailers.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : retailers.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No retailers found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shop Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {retailers.map((retailer) => (
                    <TableRow key={retailer.id}>
                      <TableCell className="font-medium">{retailer.name}</TableCell>
                      <TableCell>{retailer.ownerName || "-"}</TableCell>
                      <TableCell>{retailer.phone}</TableCell>
                      <TableCell>{retailer.email || "-"}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            retailer.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {retailer.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(retailer)}>
                            <Edit2 size={16} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(retailer.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
