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
import { Plus, Edit2, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDateFilter } from "@/contexts/date-filter-context"
import { api, PurchaseOrder, Farmer } from "@/lib/api"
import { toast } from "sonner"

export default function PurchasesPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewingOrder, setViewingOrder] = useState<PurchaseOrder | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    supplierName: "",
    orderDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    status: "pending" as "pending" | "received" | "cancelled",
    notes: "",
    items: [{
      description: "",
      quantity: 0,
      unit: "pcs",
      unitCost: 0
    }]
  })
  const { startDate, endDate } = useDateFilter()

  useEffect(() => {
    setMounted(true)
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [ordersData, farmersData] = await Promise.all([
        api.getPurchaseOrders(),
        api.getFarmers()
      ])
      setOrders(ordersData)
      setFarmers(farmersData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load purchase orders")
      setOrders([])
      setFarmers([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.supplierName || formData.items.length === 0 || !formData.items[0].description) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      const orderData = {
        supplierName: formData.supplierName,
        orderDate: formData.orderDate,
        dueDate: formData.dueDate || undefined,
        status: formData.status,
        notes: formData.notes,
        items: formData.items.filter(item => item.description && item.quantity > 0)
      }

      if (editingId) {
        await api.updatePurchaseOrder(editingId, orderData)
        toast.success("Purchase order updated successfully")
      } else {
        await api.createPurchaseOrder(orderData)
        toast.success("Purchase order created successfully")
      }
      
      await loadData()
      resetForm()
      setShowDialog(false)
    } catch (error) {
      console.error("Error saving purchase order:", error)
      toast.error("Failed to save purchase order")
    }
  }

  const resetForm = () => {
    setFormData({
      supplierName: "",
      orderDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      status: "pending",
      notes: "",
      items: [{
        description: "",
        quantity: 0,
        unit: "pcs",
        unitCost: 0
      }]
    })
    setEditingId(null)
  }

  const handleEdit = (order: PurchaseOrder) => {
    setEditingId(order.id)
    setFormData({
      supplierName: order.supplierName,
      orderDate: order.orderDate,
      dueDate: order.dueDate || "",
      status: order.status,
      notes: order.notes || "",
      items: order.items.length > 0 ? order.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitCost: item.unitCost
      })) : [{
        description: "",
        quantity: 0,
        unit: "pcs",
        unitCost: 0
      }]
    })
    setShowDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this purchase order?")) {
      try {
        await api.deletePurchaseOrder(id)
        toast.success("Purchase order deleted successfully")
        await loadData()
      } catch (error) {
        console.error("Error deleting purchase order:", error)
        toast.error("Failed to delete purchase order")
      }
    }
  }

  const handleView = (order: PurchaseOrder) => {
    setViewingOrder(order)
    setShowViewDialog(true)
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 0, unit: "pcs", unitCost: 0 }]
    })
  }

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index)
      })
    }
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  // Filter orders based on date range
  const filteredOrders = useMemo(() => {
    if (!startDate || !endDate) return orders

    return orders.filter((order) => {
      const orderDate = new Date(order.orderDate)
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
      case "received":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalValue = useMemo(() => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)
  }, [formData.items])

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
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Order" : "Create Purchase Order"}</DialogTitle>
                <DialogDescription>Enter order details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Supplier Name *</Label>
                    <Select
                      value={formData.supplierName}
                      onValueChange={(value) => setFormData({ ...formData, supplierName: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {farmers.length === 0 ? (
                          <SelectItem value="" disabled>No farmers available</SelectItem>
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
                      value={formData.orderDate}
                      onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                        <SelectItem value="received">Received</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Order Items *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Plus size={16} className="mr-1" /> Add Item
                    </Button>
                  </div>
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded">
                      <div className="col-span-4 space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Unit</Label>
                        <Input
                          value={item.unit}
                          onChange={(e) => updateItem(index, 'unit', e.target.value)}
                          placeholder="pcs"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Unit Cost</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unitCost}
                          onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-between">
                        <div className="text-sm font-medium">
                          ₹{(item.quantity * item.unitCost).toFixed(2)}
                        </div>
                        {formData.items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Total Value</Label>
                  <Input
                    type="text"
                    value={`₹${totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    readOnly
                    className="bg-muted font-semibold text-lg"
                  />
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
              <div className="text-3xl font-bold">{loading ? "..." : filteredOrders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? "..." : filteredOrders.filter((o) => o.status === "pending").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? "..." : `₹${filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </div>
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
                    <TableHead>Due Date</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Loading purchase orders...
                      </TableCell>
                    </TableRow>
                  ) : filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
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
                        <TableCell>{order.supplierName}</TableCell>
                        <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                        <TableCell>{order.dueDate ? new Date(order.dueDate).toLocaleDateString() : "N/A"}</TableCell>
                        <TableCell className="font-semibold">
                          ₹{order.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                    <div className="text-sm font-medium">{viewingOrder.supplierName}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Order Date</Label>
                    <div className="text-sm font-medium">{new Date(viewingOrder.orderDate).toLocaleDateString()}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Due Date</Label>
                    <div className="text-sm font-medium">
                      {viewingOrder.dueDate ? new Date(viewingOrder.dueDate).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Status</Label>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(viewingOrder.status)}`}>
                        {viewingOrder.status.charAt(0).toUpperCase() + viewingOrder.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Total Amount</Label>
                    <div className="text-sm font-medium font-semibold">
                      ₹{viewingOrder.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Order Items</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Unit Cost</TableHead>
                          <TableHead className="text-right">Line Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewingOrder.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.unit}</TableCell>
                            <TableCell>₹{item.unitCost.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-medium">
                              ₹{(item.quantity * item.unitCost).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {viewingOrder.notes && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Notes</Label>
                    <div className="text-sm font-medium">{viewingOrder.notes}</div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
