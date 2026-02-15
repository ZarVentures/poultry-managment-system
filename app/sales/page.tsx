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
import { api, Sale } from "@/lib/api"
import { toast } from "sonner"

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewingSale, setViewingSale] = useState<Sale | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    customerName: "",
    saleDate: new Date().toISOString().split("T")[0],
    productType: "eggs" as "eggs" | "meat" | "chicks" | "other",
    quantity: "",
    unitPrice: "",
    paymentStatus: "pending" as "paid" | "pending" | "partial",
    amountReceived: "",
    notes: "",
  })
  const { startDate, endDate } = useDateFilter()

  useEffect(() => {
    setMounted(true)
    loadSales()
  }, [])

  const loadSales = async () => {
    try {
      setLoading(true)
      const data = await api.getSales()
      setSales(data)
    } catch (error) {
      console.error("Error loading sales:", error)
      toast.error("Failed to load sales")
      setSales([])
    } finally {
      setLoading(false)
    }
  }
    date: new Date().toISOString().split("T")[0],
    quantity: "",
    unitPrice: "",
    paymentStatus: "pending",
    notes: "",
  })
  const { startDate, endDate } = useDateFilter()

  useEffect(() => {
    setMounted(true)
    loadSales()
  }, [])

  const loadSales = async () => {
    try {
      setLoading(true)
      const data = await api.getSales()
      setSales(data)
    } catch (error) {
      console.error("Error loading sales:", error)
      toast.error("Failed to load sales")
      setSales([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.customerName || !formData.quantity || !formData.unitPrice) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      const saleData = {
        customerName: formData.customerName,
        saleDate: formData.saleDate,
        productType: formData.productType,
        quantity: parseInt(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice),
        paymentStatus: formData.paymentStatus,
        amountReceived: formData.paymentStatus === "paid" 
          ? parseInt(formData.quantity) * parseFloat(formData.unitPrice) 
          : parseFloat(formData.amountReceived || "0"),
        notes: formData.notes,
      }

      if (editingId) {
        await api.updateSale(editingId, saleData)
        toast.success("Sale updated successfully")
      } else {
        await api.createSale(saleData)
        toast.success("Sale recorded successfully")
      }

      await loadSales()
      resetForm()
      setShowDialog(false)
    } catch (error) {
      console.error("Error saving sale:", error)
      toast.error("Failed to save sale")
    }
  }

  const resetForm = () => {
    setFormData({
      customerName: "",
      saleDate: new Date().toISOString().split("T")[0],
      productType: "eggs" as "eggs" | "meat" | "chicks" | "other",
      quantity: "",
      unitPrice: "",
      paymentStatus: "pending" as "paid" | "pending" | "partial",
      amountReceived: "",
      notes: "",
    })
    setEditingId(null)
  }

  const handleEdit = (sale: Sale) => {
    setEditingId(sale.id)
    setFormData({
      customerName: sale.customerName,
      saleDate: sale.saleDate,
      productType: sale.productType,
      quantity: sale.quantity.toString(),
      unitPrice: sale.unitPrice.toString(),
      paymentStatus: sale.paymentStatus,
      amountReceived: sale.amountReceived.toString(),
      notes: sale.notes || "",
    })
    setShowDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this sale?")) {
      try {
        await api.deleteSale(id)
        toast.success("Sale deleted successfully")
        await loadSales()
      } catch (error) {
        console.error("Error deleting sale:", error)
        toast.error("Failed to delete sale")
      }
    }
  }
    }
  }

  const resetForm = () => {
    setFormData({
      customer: "",
      date: new Date().toISOString().split("T")[0],
      quantity: "",
      unitPrice: "",
      paymentStatus: "pending" as "paid" | "pending" | "partial",
      notes: "",
    })
    setEditingId(null)
  }

  const handleEdit = (sale: Sale) => {
    setEditingId(sale.id)
    setFormData({
      customer: sale.customerName,
      date: sale.saleDate,
      quantity: sale.quantity.toString(),
      unitPrice: sale.unitPrice.toString(),
      paymentStatus: sale.paymentStatus as "paid" | "pending" | "partial",
      notes: sale.notes || "",
    })
    setShowDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this sale?")) {
      try {
        await api.deleteSale(id)
        toast.success("Sale deleted successfully")
        await loadSales()
      } catch (error) {
        console.error("Error deleting sale:", error)
        toast.error("Failed to delete sale")
      }
    }
  }

  const handleView = (sale: Sale) => {
    setViewingSale(sale)
    setShowViewDialog(true)
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "partial":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Filter sales based on date range
  const filteredSales = useMemo(() => {
    if (!startDate || !endDate) return sales

    return sales.filter((sale) => {
      const saleDate = new Date(sale.saleDate)
      const start = new Date(startDate)
      const end = new Date(endDate)
      // Set time to start/end of day for proper comparison
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      saleDate.setHours(0, 0, 0, 0)

      return saleDate >= start && saleDate <= end
    })
  }, [sales, startDate, endDate])

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0)
  const paidRevenue = filteredSales.filter((s) => s.paymentStatus === "paid").reduce((sum, s) => sum + s.totalAmount, 0)

  if (!mounted) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Sales Tracking</h1>
            <p className="text-muted-foreground">Record and manage customer sales</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2" size={20} />
                Record Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Sale" : "Record New Sale"}</DialogTitle>
                <DialogDescription>Enter sale details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Customer Name</Label>
                    <Input
                      value={formData.customer}
                      onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                      placeholder="Customer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sale Date</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Status</Label>
                    <Select
                      value={formData.paymentStatus}
                      onValueChange={(value: any) => setFormData({ ...formData, paymentStatus: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Amount</Label>
                    <Input
                      type="number"
                      disabled
                      value={
                        formData.quantity && formData.unitPrice
                          ? (Number.parseInt(formData.quantity) * Number.parseFloat(formData.unitPrice)).toFixed(2)
                          : ""
                      }
                      placeholder="0.00"
                    />
                  </div>
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
                  {editingId ? "Update" : "Record"} Sale
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? "..." : filteredSales.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{loading ? "..." : totalRevenue}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Amount Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">₹{loading ? "..." : paidRevenue}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sales Records</CardTitle>
            <CardDescription>View and manage all sales transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        Loading sales...
                      </TableCell>
                    </TableRow>
                  ) : filteredSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No sales found. Click "Record Sale" to add one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSales.map((sale) => (
                      <TableRow 
                        key={sale.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleView(sale)}
                      >
                        <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                        <TableCell>{sale.customerName}</TableCell>
                        <TableCell>{sale.saleDate}</TableCell>
                        <TableCell className="capitalize">{sale.productType}</TableCell>
                        <TableCell>{sale.quantity}</TableCell>
                        <TableCell>₹{sale.totalAmount}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(sale.paymentStatus)}`}
                          >
                            {sale.paymentStatus.charAt(0).toUpperCase() + sale.paymentStatus.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="icon" onClick={() => handleEdit(sale)}>
                            <Edit2 size={16} />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDelete(sale.id)}>
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
              <DialogTitle>Sale Details</DialogTitle>
              <DialogDescription>View complete sale information</DialogDescription>
            </DialogHeader>
            {viewingSale && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Invoice Number</Label>
                    <div className="text-sm font-medium">{viewingSale.invoiceNumber}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Customer</Label>
                    <div className="text-sm font-medium">{viewingSale.customerName}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Date</Label>
                    <div className="text-sm font-medium">{viewingSale.saleDate}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Product Type</Label>
                    <div className="text-sm font-medium capitalize">{viewingSale.productType || "N/A"}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Quantity</Label>
                    <div className="text-sm font-medium">{viewingSale.quantity}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Unit Price</Label>
                    <div className="text-sm font-medium">₹{viewingSale.unitPrice}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Total Amount</Label>
                    <div className="text-sm font-medium">₹{viewingSale.totalAmount}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Payment Status</Label>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(viewingSale.paymentStatus)}`}>
                        {viewingSale.paymentStatus.charAt(0).toUpperCase() + viewingSale.paymentStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                  {viewingSale.notes && (
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-muted-foreground">Notes</Label>
                      <div className="text-sm font-medium">{viewingSale.notes}</div>
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
