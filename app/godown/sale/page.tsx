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
import { Plus, Edit2, Trash2, Printer, X, Eye } from "lucide-react"
import { DateRangeFilter } from "@/components/date-range-filter"
import { useDateFilter } from "@/contexts/date-filter-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface GodownSale {
  id: string
  saleDate: string
  saleInvoiceNo: string
  shopName: string
  saleMode: string
  salePayment: string
  notes: string
  birdType: string
  numberOfBirds: number
  ratePerKg: number
  totalWeight: number
  totalAmount: number
  totalInvoice: number
  creditBalance: number
  outstandingPayment: number
  paymentMode: string
  totalPaymentReceived: number
  balanceAmount: number
}

export default function GodownSalePage() {
  const [sales, setSales] = useState<GodownSale[]>([])
  const [mounted, setMounted] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewingSale, setViewingSale] = useState<GodownSale | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>(undefined)
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({
    saleDate: new Date().toISOString().split("T")[0],
    saleInvoiceNo: "",
    shopName: "",
    saleMode: "From Godown",
    salePayment: "Paid",
    notes: "",
    birdType: "",
    numberOfBirds: "",
    ratePerKg: "",
    averageWeight: "",
    creditBalance: "",
    paymentMode: "",
    totalPaymentReceived: "",
  })
  const { startDate, endDate } = useDateFilter()

  // Section 2: Auto-calculated
  const totalWeight = useMemo(() => {
    const birds = Number.parseFloat(formData.numberOfBirds) || 0
    const avg = Number.parseFloat(formData.averageWeight) || 0
    return birds * avg
  }, [formData.numberOfBirds, formData.averageWeight])

  const totalAmount = useMemo(() => {
    const weight = totalWeight
    const rate = Number.parseFloat(formData.ratePerKg) || 0
    return weight * rate
  }, [totalWeight, formData.ratePerKg])

  // Section 4: Auto-calculated
  const totalInvoice = useMemo(() => totalAmount, [totalAmount])

  const creditBalance = Number.parseFloat(formData.creditBalance) || 0

  const outstandingPayment = useMemo(() => {
    return Math.max(0, totalInvoice - (Number.parseFloat(formData.totalPaymentReceived) || 0))
  }, [totalInvoice, formData.totalPaymentReceived])

  const totalPaymentReceived = Number.parseFloat(formData.totalPaymentReceived) || 0

  const balanceAmount = useMemo(() => {
    return Math.max(0, totalInvoice - totalPaymentReceived)
  }, [totalInvoice, totalPaymentReceived])

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("godownSale")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSales(Array.isArray(parsed) ? parsed : [])
      } catch {
        setSales([])
      }
    } else setSales([])
  }, [])

  const handleSave = () => {
    if (!formData.saleDate || !formData.saleInvoiceNo || !formData.shopName) {
      alert("Please fill required fields (Date, Sale Invoice No, Shop Name)")
      return
    }
    const sale: GodownSale = {
      id: editingId || Date.now().toString(),
      saleDate: formData.saleDate,
      saleInvoiceNo: formData.saleInvoiceNo,
      shopName: formData.shopName,
      saleMode: formData.saleMode,
      salePayment: formData.salePayment,
      notes: formData.notes,
      birdType: formData.birdType,
      numberOfBirds: Number.parseFloat(formData.numberOfBirds) || 0,
      ratePerKg: Number.parseFloat(formData.ratePerKg) || 0,
      totalWeight,
      totalAmount,
      totalInvoice,
      creditBalance,
      outstandingPayment,
      paymentMode: formData.paymentMode,
      totalPaymentReceived,
      balanceAmount,
    }
    const updated = editingId ? sales.map((s) => (s.id === editingId ? sale : s)) : [...sales, sale]
    setSales(updated)
    localStorage.setItem("godownSale", JSON.stringify(updated))
    resetForm()
    setShowDialog(false)
  }

  const resetForm = () => {
    setFormData({
      saleDate: new Date().toISOString().split("T")[0],
      saleInvoiceNo: "",
      shopName: "",
      saleMode: "From Godown",
      salePayment: "Paid",
      notes: "",
      birdType: "",
      numberOfBirds: "",
      ratePerKg: "",
      averageWeight: "",
      creditBalance: "",
      paymentMode: "",
      totalPaymentReceived: "",
    })
    setEditingId(null)
  }

  const handleEdit = (sale: GodownSale) => {
    setEditingId(sale.id)
    setFormData({
      saleDate: sale.saleDate,
      saleInvoiceNo: sale.saleInvoiceNo,
      shopName: sale.shopName,
      saleMode: sale.saleMode || "From Godown",
      salePayment: sale.salePayment || "Paid",
      notes: sale.notes || "",
      birdType: sale.birdType || "",
      numberOfBirds: sale.numberOfBirds?.toString() || "",
      ratePerKg: sale.ratePerKg?.toString() || "",
      averageWeight: sale.totalWeight && sale.numberOfBirds ? (sale.totalWeight / sale.numberOfBirds).toFixed(2) : "",
      creditBalance: sale.creditBalance?.toString() || "",
      paymentMode: sale.paymentMode || "",
      totalPaymentReceived: sale.totalPaymentReceived?.toString() || "",
    })
    setShowDialog(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Delete this godown sale?")) {
      const updated = sales.filter((s) => s.id !== id)
      setSales(updated)
      localStorage.setItem("godownSale", JSON.stringify(updated))
    }
  }

  const handleView = (sale: GodownSale) => {
    setViewingSale(sale)
    setShowViewDialog(true)
  }

  const filteredSales = useMemo(() => {
    let list = sales
    if (dateRangeStart && dateRangeEnd) {
      const start = new Date(dateRangeStart)
      const end = new Date(dateRangeEnd)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      list = list.filter((e) => {
        const d = new Date(e.saleDate)
        return d >= start && d <= end
      })
    }
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      list = list.filter((e) => {
        const d = new Date(e.saleDate)
        return d >= start && d <= end
      })
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (s) =>
          (s.saleInvoiceNo || "").toLowerCase().includes(q) ||
          (s.shopName || "").toLowerCase().includes(q)
      )
    }
    return list.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
  }, [sales, dateRangeStart, dateRangeEnd, startDate, endDate, searchQuery])

  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    setDateRangeStart(start)
    setDateRangeEnd(end)
  }

  if (!mounted) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Godown Sale</h1>
            <p className="text-muted-foreground">Record sales from godown</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2" size={20} />
                Add New Godown Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Godown Sale" : "Add New Godown Sale"}</DialogTitle>
                <DialogDescription>Enter sale details</DialogDescription>
              </DialogHeader>

              {/* Section 1: Header Information */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Section 1: Header Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Sale Invoice No. *</Label>
                      <Input
                        value={formData.saleInvoiceNo}
                        onChange={(e) => setFormData({ ...formData, saleInvoiceNo: e.target.value })}
                        placeholder="Enter sale invoice number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Shop Name *</Label>
                      <Input
                        value={formData.shopName}
                        onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                        placeholder="Shop name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sale Mode</Label>
                      <Select value={formData.saleMode} onValueChange={(v) => setFormData({ ...formData, saleMode: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="From Gadi">From Gadi</SelectItem>
                          <SelectItem value="From Godown">From Godown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Sale Payment</Label>
                      <Select value={formData.salePayment} onValueChange={(v) => setFormData({ ...formData, salePayment: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Credit">Credit</SelectItem>
                          <SelectItem value="Partial Payment">Partial Payment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Notes</Label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Optional notes"
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section 2: Bird Details */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Section 2: Bird Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Bird Type</Label>
                      <Select value={formData.birdType} onValueChange={(v) => setFormData({ ...formData, birdType: v })}>
                        <SelectTrigger><SelectValue placeholder="Select bird type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Broiler">Broiler</SelectItem>
                          <SelectItem value="Layer">Layer</SelectItem>
                          <SelectItem value="Desi">Desi</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Number of Birds</Label>
                      <Input
                        type="number"
                        value={formData.numberOfBirds}
                        onChange={(e) => setFormData({ ...formData, numberOfBirds: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Rate per Kg</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.ratePerKg}
                        onChange={(e) => setFormData({ ...formData, ratePerKg: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Avg Weight (kg) per bird</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.averageWeight}
                        onChange={(e) => setFormData({ ...formData, averageWeight: e.target.value })}
                        placeholder="For total weight"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Total Weight</Label>
                      <Input readOnly className="bg-muted font-medium" value={totalWeight ? `${totalWeight} Kg` : ""} />
                    </div>
                    <div className="space-y-2">
                      <Label>Total Amount</Label>
                      <Input readOnly className="bg-muted font-medium" value={totalAmount ? `₹${totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ""} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section 4: Payment */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Section 4: Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Total Invoice</Label>
                      <Input readOnly className="bg-muted font-medium" value={totalInvoice ? `₹${totalInvoice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ""} />
                    </div>
                    <div className="space-y-2">
                      <Label>Credit Balance</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.creditBalance}
                        onChange={(e) => setFormData({ ...formData, creditBalance: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Outstanding Payment</Label>
                      <Input readOnly className="bg-muted font-medium" value={outstandingPayment ? `₹${outstandingPayment.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ""} />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Mode</Label>
                      <Select value={formData.paymentMode} onValueChange={(v) => setFormData({ ...formData, paymentMode: v })}>
                        <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Bank">Bank Transfer</SelectItem>
                          <SelectItem value="Check">Check</SelectItem>
                          <SelectItem value="Card">Card</SelectItem>
                          <SelectItem value="UPI">UPI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Total payment Received</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.totalPaymentReceived}
                        onChange={(e) => setFormData({ ...formData, totalPaymentReceived: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Balance Amount</Label>
                      <Input readOnly className="bg-muted font-medium" value={balanceAmount ? `₹${balanceAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ""} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button onClick={handleSave}>{editingId ? "Update" : "Save"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Godown Sales</CardTitle>
                <CardDescription>List of all godown sales</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <DateRangeFilter startDate={dateRangeStart} endDate={dateRangeEnd} onDateRangeChange={handleDateRangeChange} />
                <Input placeholder="Search by invoice, shop..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-[200px]" />
                {searchQuery && <Button variant="ghost" size="icon" onClick={() => setSearchQuery("")}><X size={16} /></Button>}
                <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="mr-2" size={16} />Print</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sale Date</TableHead>
                    <TableHead>Sale Invoice No.</TableHead>
                    <TableHead>Shop Name</TableHead>
                    <TableHead>Sale Mode</TableHead>
                    <TableHead>Sale Payment</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Total Received</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">No godown sales found.</TableCell>
                    </TableRow>
                  ) : (
                    filteredSales.map((sale) => (
                      <TableRow key={sale.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleView(sale)}>
                        <TableCell>{sale.saleDate}</TableCell>
                        <TableCell className="font-medium">{sale.saleInvoiceNo || "—"}</TableCell>
                        <TableCell>{sale.shopName || "—"}</TableCell>
                        <TableCell>{sale.saleMode || "—"}</TableCell>
                        <TableCell>{sale.salePayment || "—"}</TableCell>
                        <TableCell>₹{(sale.totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>₹{(sale.totalPaymentReceived || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>₹{(sale.balanceAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="icon" onClick={() => handleEdit(sale)}><Edit2 size={16} /></Button>
                          <Button variant="outline" size="icon" onClick={() => handleView(sale)}><Eye size={16} /></Button>
                          <Button variant="outline" size="icon" onClick={() => handleDelete(sale.id)}><Trash2 size={16} /></Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Godown Sale Details</DialogTitle></DialogHeader>
            {viewingSale && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-muted-foreground">Sale Date</div><div className="font-medium">{viewingSale.saleDate}</div>
                <div className="text-muted-foreground">Sale Invoice No.</div><div className="font-medium">{viewingSale.saleInvoiceNo || "—"}</div>
                <div className="text-muted-foreground">Shop Name</div><div>{viewingSale.shopName || "—"}</div>
                <div className="text-muted-foreground">Sale Mode</div><div>{viewingSale.saleMode || "—"}</div>
                <div className="text-muted-foreground">Sale Payment</div><div>{viewingSale.salePayment || "—"}</div>
                <div className="text-muted-foreground">Bird Type</div><div>{viewingSale.birdType || "—"}</div>
                <div className="text-muted-foreground">Number of Birds</div><div>{viewingSale.numberOfBirds ?? "—"}</div>
                <div className="text-muted-foreground">Rate per Kg</div><div>₹{(viewingSale.ratePerKg ?? 0).toLocaleString()}</div>
                <div className="text-muted-foreground">Total Weight</div><div>{viewingSale.totalWeight ?? 0} Kg</div>
                <div className="text-muted-foreground">Total Amount</div><div className="font-medium">₹{(viewingSale.totalAmount ?? 0).toLocaleString()}</div>
                <div className="text-muted-foreground">Total Invoice</div><div>₹{(viewingSale.totalInvoice ?? 0).toLocaleString()}</div>
                <div className="text-muted-foreground">Credit Balance</div><div>₹{(viewingSale.creditBalance ?? 0).toLocaleString()}</div>
                <div className="text-muted-foreground">Outstanding Payment</div><div>₹{(viewingSale.outstandingPayment ?? 0).toLocaleString()}</div>
                <div className="text-muted-foreground">Payment Mode</div><div>{viewingSale.paymentMode || "—"}</div>
                <div className="text-muted-foreground">Total payment Received</div><div>₹{(viewingSale.totalPaymentReceived ?? 0).toLocaleString()}</div>
                <div className="text-muted-foreground">Balance Amount</div><div className="font-medium">₹{(viewingSale.balanceAmount ?? 0).toLocaleString()}</div>
                {viewingSale.notes && (<><div className="text-muted-foreground col-span-2">Notes</div><div className="col-span-2">{viewingSale.notes}</div></>)}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
