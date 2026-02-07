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

interface Sale {
  id: string
  invoiceNumber: string
  customer: string
  date: string
  productType: string
  quantity: number
  unitPrice: number
  totalAmount: number
  paymentStatus: "paid" | "pending" | "partial"
  notes: string
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [mounted, setMounted] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewingSale, setViewingSale] = useState<Sale | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<{
    customer: string
    date: string
    quantity: string
    unitPrice: string
    paymentStatus: "paid" | "pending" | "partial"
    notes: string
  }>({
    customer: "",
    date: new Date().toISOString().split("T")[0],
    quantity: "",
    unitPrice: "",
    paymentStatus: "pending",
    notes: "",
  })
  const { startDate, endDate } = useDateFilter()

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("sales")
    if (saved) {
      setSales(JSON.parse(saved))
    } else {
      setSales([])
    }
  }, [])

  const handleSave = () => {
    if (!formData.customer || !formData.quantity || !formData.unitPrice) {
      alert("Please fill all required fields")
      return
    }

    const totalAmount = Number.parseInt(formData.quantity) * Number.parseFloat(formData.unitPrice)
    const invoiceNumber = editingId
      ? sales.find((s) => s.id === editingId)?.invoiceNumber
      : `INV-${String(sales.length + 1).padStart(3, "0")}`

    if (editingId) {
      setSales(
        sales.map((sale) =>
          sale.id === editingId
            ? {
                ...sale,
                customer: formData.customer,
                date: formData.date,
                productType: sale.productType || "", // Keep existing productType or empty
                quantity: Number.parseInt(formData.quantity),
                unitPrice: Number.parseFloat(formData.unitPrice),
                totalAmount,
                paymentStatus: formData.paymentStatus,
                notes: formData.notes,
              }
            : sale,
        ),
      )
    } else {
      setSales([
        ...sales,
        {
          id: Date.now().toString(),
          invoiceNumber: invoiceNumber || "",
          customer: formData.customer,
          date: formData.date,
          productType: "", // No product type for new records
          quantity: Number.parseInt(formData.quantity),
          unitPrice: Number.parseFloat(formData.unitPrice),
          totalAmount,
          paymentStatus: formData.paymentStatus,
          notes: formData.notes,
        },
      ])
    }

    localStorage.setItem("sales", JSON.stringify(sales))
    resetForm()
    setShowDialog(false)
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
      customer: sale.customer,
      date: sale.date,
      quantity: sale.quantity.toString(),
      unitPrice: sale.unitPrice.toString(),
      paymentStatus: sale.paymentStatus as "paid" | "pending" | "partial",
      notes: sale.notes,
    })
    setShowDialog(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this sale?")) {
      const updated = sales.filter((sale) => sale.id !== id)
      setSales(updated)
      localStorage.setItem("sales", JSON.stringify(updated))
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
      const saleDate = new Date(sale.date)
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
              <div className="text-3xl font-bold">{filteredSales.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{totalRevenue}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Amount Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">₹{paidRevenue}</div>
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
                  {filteredSales.map((sale) => (
                    <TableRow 
                      key={sale.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleView(sale)}
                    >
                      <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                      <TableCell>{sale.customer}</TableCell>
                      <TableCell>{sale.date}</TableCell>
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
                  ))}
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
                    <div className="text-sm font-medium">{viewingSale.customer}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Date</Label>
                    <div className="text-sm font-medium">{viewingSale.date}</div>
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
