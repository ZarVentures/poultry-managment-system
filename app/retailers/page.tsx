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
import { api, Retailer } from "@/lib/api"
import { toast } from "sonner"

interface RetailerFormData {
  name: string
  ownerName: string
  phone: string
  address: string
  notes: string
}

export default function RetailersPage() {
  const [retailers, setRetailers] = useState<Retailer[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewingRetailer, setViewingRetailer] = useState<Retailer | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchFilter, setShowSearchFilter] = useState(false)
  const [formData, setFormData] = useState<RetailerFormData>({
    name: "",
    ownerName: "",
    phone: "",
    address: "",
    notes: "",
  })

  useEffect(() => {
    setMounted(true)
    loadRetailers()
  }, [])

  const loadRetailers = async () => {
    try {
      setLoading(true)
      const data = await api.getRetailers()
      setRetailers(data)
    } catch (error) {
      console.error("Error loading retailers:", error)
      toast.error("Failed to load retailers")
      setRetailers([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.ownerName || !formData.phone) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      if (editingId) {
        await api.updateRetailer(editingId, formData)
        toast.success("Retailer updated successfully")
      } else {
        await api.createRetailer(formData)
        toast.success("Retailer added successfully")
      }
      
      await loadRetailers()
      resetForm()
      setShowDialog(false)
    } catch (error) {
      console.error("Error saving retailer:", error)
      toast.error("Failed to save retailer")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      ownerName: "",
      phone: "",
      address: "",
      notes: "",
    })
    setEditingId(null)
  }

  const handleEdit = (retailer: Retailer) => {
    setEditingId(retailer.id)
    setFormData({
      name: retailer.name,
      ownerName: retailer.ownerName || "",
      phone: retailer.phone || "",
      address: retailer.address || "",
      notes: retailer.notes || "",
    })
    setShowDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this retailer?")) {
      try {
        await api.deleteRetailer(id)
        toast.success("Retailer deleted successfully")
        await loadRetailers()
      } catch (error) {
        console.error("Error deleting retailer:", error)
        toast.error("Failed to delete retailer")
      }
    }
  }

  const handleView = (retailer: Retailer) => {
    setViewingRetailer(retailer)
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

  const getFilteredAndSortedRetailers = () => {
    let filtered = retailers

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (retailer) =>
          retailer.name.toLowerCase().includes(query) ||
          (retailer.ownerName && retailer.ownerName.toLowerCase().includes(query)) ||
          (retailer.phone && retailer.phone.toLowerCase().includes(query)),
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
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  <div className="space-y-2 md:col-span-2">
                    <Label>Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Shop address"
                  />
                </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes about the retailer"
                      rows={3}
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
              <div className="text-3xl font-bold">{loading ? "..." : retailers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Retailers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? "..." : retailers.length}
              </div>
          </CardContent>
        </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recent Additions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? "..." : retailers.filter(r => {
                  const createdDate = new Date(r.createdAt || "")
                  const thirtyDaysAgo = new Date()
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                  return createdDate > thirtyDaysAgo
                }).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Retailers List</CardTitle>
                <CardDescription>View and manage all retailers</CardDescription>
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
                        Shop Name
                        {sortOrder === null && <ArrowUpDown className="ml-2 h-4 w-4" />}
                        {sortOrder === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
                        {sortOrder === "desc" && <ArrowDown className="ml-2 h-4 w-4" />}
                      </Button>
                    </TableHead>
                    <TableHead>Owner Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Loading retailers...
                      </TableCell>
                    </TableRow>
                  ) : getFilteredAndSortedRetailers().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        {searchQuery ? "No retailers found matching your search." : "No retailers added yet. Click \"Add Retailer\" to get started."}
                      </TableCell>
                    </TableRow>
        ) : (
          getFilteredAndSortedRetailers().map((retailer) => (
                      <TableRow 
                        key={retailer.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleView(retailer)}
                      >
                        <TableCell className="font-medium">{retailer.name}</TableCell>
                        <TableCell>{retailer.ownerName || "N/A"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{retailer.phone || "N/A"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{retailer.address || "N/A"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {retailer.createdAt ? new Date(retailer.createdAt).toLocaleDateString() : "N/A"}
                        </TableCell>
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
                    <div className="text-sm font-medium">{viewingRetailer.name}</div>
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
                    <div className="text-sm font-medium">
                      {viewingRetailer.createdAt ? new Date(viewingRetailer.createdAt).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-muted-foreground">Address</Label>
                    <div className="text-sm font-medium">{viewingRetailer.address || "N/A"}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Status</Label>
                    <div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
                  {viewingRetailer.notes && (
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-muted-foreground">Notes</Label>
                      <div className="text-sm font-medium whitespace-pre-wrap">{viewingRetailer.notes}</div>
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
