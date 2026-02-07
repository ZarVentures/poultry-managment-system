"use client"

import { useState, useEffect, useMemo } from "react"
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
import { Plus, Edit2, Trash2, Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDateFilter } from "@/contexts/date-filter-context"

interface Farmer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  birdCount: number
  joinDate: string
}

interface PurchaseOrder {
  id: string
  orderNumber: string
  supplier: string
  date: string
  description: string
  birdQuantity: number
  cageQuantity: number
  unitCost: number
  totalValue: number
  status: "pending" | "picked up" | "cancel"
  notes: string
}

export default function PurchasesPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [mounted, setMounted] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewingOrder, setViewingOrder] = useState<PurchaseOrder | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<{
    supplier: string
    date: string
    description: string
    birdQuantity: string
    cageQuantity: string
    unitCost: string
    status: "pending" | "picked up" | "cancel"
    notes: string
  }>({
    supplier: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    birdQuantity: "",
    cageQuantity: "",
    unitCost: "",
    status: "pending",
    notes: "",
  })
  const { startDate, endDate } = useDateFilter()

  useEffect(() => {
    setMounted(true)
    
    // Load farmers for supplier dropdown
    const savedFarmers = localStorage.getItem("farmers")
    if (savedFarmers) {
      setFarmers(JSON.parse(savedFarmers))
    } else {
      // Default farmers if none exist
      setFarmers([
        {
          id: "1",
          name: "Ahmed Khan",
          email: "ahmed@example.com",
          phone: "+91 98765 43210",
          address: "Village A, District X",
          birdCount: 0,
          joinDate: "2024-01-15",
        },
        {
          id: "2",
          name: "Mohammed Ali",
          email: "mohammed@example.com",
          phone: "+91 98765 43211",
          address: "Village B, District Y",
          birdCount: 0,
          joinDate: "2024-02-20",
        },
      ])
    }

    // Fetch purchase orders from API
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/purchases")
      const result = await response.json()

      if (result.success) {
        // Convert database IDs to strings for compatibility
        const formattedOrders = result.data.map((order: any) => ({
          ...order,
          id: order.id.toString(),
        }))
        setOrders(formattedOrders)
      } else {
        console.error("Error fetching purchases:", result.error)
        setOrders([])
      }
    } catch (error) {
      console.error("Error fetching purchases:", error)
      setOrders([])
    }
  }

  // Calculate total value automatically
  const totalValue = useMemo(() => {
    const birds = Number.parseFloat(formData.birdQuantity) || 0
    const cost = Number.parseFloat(formData.unitCost) || 0
    return birds * cost
  }, [formData.birdQuantity, formData.unitCost])

  const handleSave = async () => {
    if (!formData.supplier || !formData.description || !formData.birdQuantity || !formData.unitCost) {
      alert("Please fill all required fields")
      return
    }

    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supplier: formData.supplier,
          date: formData.date,
          description: formData.description,
          birdQuantity: formData.birdQuantity,
          cageQuantity: formData.cageQuantity || 0,
          unitCost: formData.unitCost,
          status: formData.status,
          notes: formData.notes,
        }),
      })

      const result = await response.json()

      if (result.success) {
        resetForm()
        setShowDialog(false)
        // Refresh the orders list
        fetchOrders()
      } else {
        alert(`Error: ${result.message || result.error}`)
      }
    } catch (error) {
      console.error("Error saving purchase order:", error)
      alert("Failed to save purchase order")
    }
  }

  const resetForm = () => {
    setFormData({
      supplier: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      birdQuantity: "",
      cageQuantity: "",
      unitCost: "",
      status: "pending",
      notes: "",
    })
    setEditingId(null)
  }

  const handleEdit = (order: PurchaseOrder) => {
    setEditingId(order.id)
    setFormData({
      supplier: order.supplier,
      date: order.date,
      description: order.description,
      birdQuantity: order.birdQuantity.toString(),
      cageQuantity: order.cageQuantity.toString(),
      unitCost: order.unitCost.toString(),
      status: order.status,
      notes: order.notes,
    })
    setShowDialog(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      const updated = orders.filter((order) => order.id !== id)
      setOrders(updated)
      localStorage.setItem("purchases", JSON.stringify(updated))
    }
  }

  const handleView = (order: PurchaseOrder) => {
    setViewingOrder(order)
    setShowViewDialog(true)
  }

  // Filter orders based on date range
  const filteredOrders = useMemo(() => {
    if (!startDate || !endDate) return orders

    return orders.filter((order) => {
      const orderDate = new Date(order.date)
      const start = new Date(startDate)
      const end = new Date(endDate)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      orderDate.setHours(0, 0, 0, 0)

      return orderDate >= start && orderDate <= end
    })
  }, [orders, startDate, endDate])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "picked up":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "cancel":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatStatus = (status: string) => {
    return status === "picked up" ? "Picked Up" : status.charAt(0).toUpperCase() + status.slice(1)
  }

  if (!mounted) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Purchase Orders</h1>
            <p className="text-muted-foreground">Manage supplier orders and deliveries</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2" size={20} />
                New Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Order" : "Create Purchase Order"}</DialogTitle>
                <DialogDescription>Enter order details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Supplier Name *</Label>
                    <Select
                      value={formData.supplier}
                      onValueChange={(value) => setFormData({ ...formData, supplier: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {farmers.length === 0 ? (
                          <SelectItem value="" disabled>No farmers available. Add farmers first.</SelectItem>
                        ) : (
                          farmers.map((farmer) => (
                            <SelectItem key={farmer.id} value={farmer.name}>
                              {farmer.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Order Date *</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="picked up">Picked Up</SelectItem>
                        <SelectItem value="cancel">Cancel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Item description"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Bird Quantity *</Label>
                    <Input
                      type="number"
                      value={formData.birdQuantity}
                      onChange={(e) => setFormData({ ...formData, birdQuantity: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cage Quantity</Label>
                    <Input
                      type="number"
                      value={formData.cageQuantity}
                      onChange={(e) => setFormData({ ...formData, cageQuantity: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit Cost *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.unitCost}
                      onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Total Value</Label>
                  <Input
                    type="text"
                    value={`₹${totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    readOnly
                    className="bg-muted font-semibold"
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-calculated: Bird Quantity × Unit Cost
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes"
                  />
                </div>

                <Button onClick={handleSave} className="w-full">
                  {editingId ? "Update" : "Create"} Order
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{filteredOrders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{filteredOrders.filter((o) => o.status === "pending").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{filteredOrders.reduce((sum, o) => sum + o.totalValue, 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Purchase Orders</CardTitle>
            <CardDescription>View and manage all purchase orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Bird Qty</TableHead>
                    <TableHead>Cage Qty</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        No purchase orders found. Click "New Order" to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow 
                        key={order.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleView(order)}
                      >
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{order.supplier}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>{order.description}</TableCell>
                        <TableCell>{order.birdQuantity.toLocaleString()}</TableCell>
                        <TableCell>{order.cageQuantity.toLocaleString()}</TableCell>
                        <TableCell className="font-semibold">₹{order.totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}
                          >
                            {formatStatus(order.status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="icon" onClick={() => handleEdit(order)}>
                            <Edit2 size={16} />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDelete(order.id)}>
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
              <DialogTitle>Purchase Order Details</DialogTitle>
              <DialogDescription>View complete purchase order information</DialogDescription>
            </DialogHeader>
            {viewingOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Order Number</Label>
                    <div className="text-sm font-medium">{viewingOrder.orderNumber}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Supplier</Label>
                    <div className="text-sm font-medium">{viewingOrder.supplier}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Date</Label>
                    <div className="text-sm font-medium">{viewingOrder.date}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Status</Label>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(viewingOrder.status)}`}>
                        {formatStatus(viewingOrder.status)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Bird Quantity</Label>
                    <div className="text-sm font-medium">{viewingOrder.birdQuantity.toLocaleString()}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Cage Quantity</Label>
                    <div className="text-sm font-medium">{viewingOrder.cageQuantity.toLocaleString()}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Unit Cost</Label>
                    <div className="text-sm font-medium">₹{viewingOrder.unitCost.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Total Value</Label>
                    <div className="text-sm font-medium font-semibold">₹{viewingOrder.totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                  {viewingOrder.description && (
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-muted-foreground">Description</Label>
                      <div className="text-sm font-medium">{viewingOrder.description}</div>
                    </div>
                  )}
                  {viewingOrder.notes && (
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-muted-foreground">Notes</Label>
                      <div className="text-sm font-medium">{viewingOrder.notes}</div>
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
