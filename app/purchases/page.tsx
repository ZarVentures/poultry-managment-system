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
import { purchasesApi, farmersApi, type PurchaseOrder as ApiPurchaseOrder, type Farmer } from "@/lib/api"
import { toast } from "sonner"

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<ApiPurchaseOrder[]>([])
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    orderNumber: "",
    supplierName: "",
    orderDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    status: "pending" as "pending" | "received" | "cancelled",
    notes: "",
    items: [{ itemName: "", quantity: "", unit: "", unitPrice: "" }],
  })

  useEffect(() => {
    setMounted(true)
    fetchPurchases()
    fetchFarmers()
  }, [])

  const fetchPurchases = async () => {
    try {
      setLoading(true)
      const data = await purchasesApi.getAll()
      setPurchases(data)
    } catch (error: any) {
      console.error("Failed to fetch purchases:", error)
      toast.error("Failed to load purchases")
    } finally {
      setLoading(false)
    }
  }

  const fetchFarmers = async () => {
    try {
      const data = await farmersApi.getAll()
      setFarmers(data)
    } catch (error) {
      console.error("Failed to fetch farmers:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      orderNumber: "",
      supplierName: "",
      orderDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      status: "pending",
      notes: "",
      items: [{ itemName: "", quantity: "", unit: "", unitPrice: "" }],
    })
    setEditingId(null)
  }

  const handleEdit = (purchase: ApiPurchaseOrder) => {
    setFormData({
      orderNumber: purchase.orderNumber,
      supplierName: purchase.supplierName,
      orderDate: purchase.orderDate,
      dueDate: purchase.dueDate || "",
      status: purchase.status,
      notes: purchase.notes || "",
      items: purchase.items.map(item => ({
        itemName: item.itemName,
        quantity: String(item.quantity),
        unit: item.unit,
        unitPrice: String(item.unitPrice),
      })),
    })
    setEditingId(purchase.id)
    setShowDialog(true)
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { itemName: "", quantity: "", unit: "", unitPrice: "" }],
    })
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0
      const unitPrice = parseFloat(item.unitPrice) || 0
      return sum + (quantity * unitPrice)
    }, 0).toFixed(2)
  }

  const handleSave = async () => {
    if (!formData.orderNumber || !formData.supplierName || formData.items.length === 0) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      setLoading(true)
      const items = formData.items.map(item => ({
        itemName: item.itemName,
        quantity: parseFloat(item.quantity),
        unit: item.unit,
        unitPrice: parseFloat(item.unitPrice),
        totalPrice: parseFloat(item.quantity) * parseFloat(item.unitPrice),
      }))

      const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0)

      const purchaseData = {
        orderNumber: formData.orderNumber,
        supplierName: formData.supplierName,
        orderDate: formData.orderDate,
        dueDate: formData.dueDate || undefined,
        status: formData.status,
        totalAmount,
        notes: formData.notes,
        items,
      }

      if (editingId) {
        await purchasesApi.update(editingId, purchaseData)
        toast.success("Purchase order updated successfully")
      } else {
        await purchasesApi.create(purchaseData)
        toast.success("Purchase order created successfully")
      }

      await fetchPurchases()
      resetForm()
      setShowDialog(false)
    } catch (error: any) {
      console.error("Failed to save purchase:", error)
      toast.error(error.message || "Failed to save purchase order")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this purchase order?")) return

    try {
      setLoading(true)
      await purchasesApi.delete(id)
      toast.success("Purchase order deleted successfully")
      await fetchPurchases()
    } catch (error: any) {
      console.error("Failed to delete purchase:", error)
      toast.error("Failed to delete purchase order")
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
            <h1 className="text-3xl font-bold">Purchase Orders</h1>
            <p className="text-muted-foreground">Manage your purchase orders</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2" size={20} />
                New Purchase Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="dialog-description">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Purchase Order" : "New Purchase Order"}</DialogTitle>
                <p id="dialog-description" className="sr-only">
                  {editingId ? "Edit purchase order details" : "Create a new purchase order"}
                </p>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Order Number *</Label>
                    <Input
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                      placeholder="PO-001"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Supplier Name *</Label>
                    <Input
                      value={formData.supplierName}
                      onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                      placeholder="Supplier name"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Order Date *</Label>
                    <Input
                      type="date"
                      value={formData.orderDate}
                      onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                      disabled={loading}
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
                    <Label>Items *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Plus size={16} className="mr-1" /> Add Item
                    </Button>
                  </div>
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-5 gap-2 items-end">
                      <Input
                        placeholder="Item name"
                        value={item.itemName}
                        onChange={(e) => updateItem(index, "itemName", e.target.value)}
                        disabled={loading}
                      />
                      <Input
                        type="number"
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                        disabled={loading}
                      />
                      <Input
                        placeholder="Unit"
                        value={item.unit}
                        onChange={(e) => updateItem(index, "unit", e.target.value)}
                        disabled={loading}
                      />
                      <Input
                        type="number"
                        placeholder="Unit Price"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={formData.items.length === 1 || loading}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <div className="text-lg font-semibold">
                    Total: ${calculateTotal()}
                  </div>
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
            <CardTitle>Purchase Orders List</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && purchases.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : purchases.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No purchase orders found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>{purchase.orderNumber}</TableCell>
                      <TableCell>{purchase.supplierName}</TableCell>
                      <TableCell>{new Date(purchase.orderDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {purchase.dueDate ? new Date(purchase.dueDate).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>${Number(purchase.totalAmount).toFixed(2)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            purchase.status === "received"
                              ? "bg-green-100 text-green-800"
                              : purchase.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {purchase.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(purchase)}>
                            <Edit2 size={16} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(purchase.id)}>
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
