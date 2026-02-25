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

interface GodownSale {
  id: string
  saleDate: string
  invoiceNo: string
  customerName: string
  cageId: string
  numberOfBirds: number
  ratePerKg: number
  amount: number
  notes: string
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
    invoiceNo: "",
    customerName: "",
    cageId: "",
    numberOfBirds: "",
    ratePerKg: "",
    notes: "",
  })
  const { startDate, endDate } = useDateFilter()

  const amount = useMemo(() => {
    const birds = Number.parseFloat(formData.numberOfBirds) || 0
    const rate = Number.parseFloat(formData.ratePerKg) || 0
    return birds * rate
  }, [formData.numberOfBirds, formData.ratePerKg])

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("godownSale")
    if (saved) setSales(JSON.parse(saved))
    else setSales([])
  }, [])

  const handleSave = () => {
    if (!formData.saleDate || !formData.invoiceNo || !formData.cageId) {
      alert("Please fill required fields (Date, Invoice No, Cage ID)")
      return
    }
    const numBirds = Number.parseInt(formData.numberOfBirds) || 0
    const rate = Number.parseFloat(formData.ratePerKg) || 0
    const sale: GodownSale = {
      id: editingId || Date.now().toString(),
      saleDate: formData.saleDate,
      invoiceNo: formData.invoiceNo,
      customerName: formData.customerName,
      cageId: formData.cageId,
      numberOfBirds: numBirds,
      ratePerKg: rate,
      amount: numBirds * rate,
      notes: formData.notes,
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
      invoiceNo: "",
      customerName: "",
      cageId: "",
      numberOfBirds: "",
      ratePerKg: "",
      notes: "",
    })
    setEditingId(null)
  }

  const handleEdit = (sale: GodownSale) => {
    setEditingId(sale.id)
    setFormData({
      saleDate: sale.saleDate,
      invoiceNo: sale.invoiceNo,
      customerName: sale.customerName,
      cageId: sale.cageId,
      numberOfBirds: sale.numberOfBirds.toString(),
      ratePerKg: sale.ratePerKg.toString(),
      notes: sale.notes,
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
          s.invoiceNo.toLowerCase().includes(q) ||
          s.customerName.toLowerCase().includes(q) ||
          s.cageId.toLowerCase().includes(q)
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sale Date *</Label>
                  <Input type="date" value={formData.saleDate} onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Invoice No *</Label>
                  <Input value={formData.invoiceNo} onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })} placeholder="Invoice number" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Customer Name</Label>
                  <Input value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} placeholder="Customer / retailer" />
                </div>
                <div className="space-y-2">
                  <Label>Cage ID *</Label>
                  <Input value={formData.cageId} onChange={(e) => setFormData({ ...formData, cageId: e.target.value })} placeholder="Cage identifier" />
                </div>
                <div className="space-y-2">
                  <Label>Number of Birds</Label>
                  <Input type="number" value={formData.numberOfBirds} onChange={(e) => setFormData({ ...formData, numberOfBirds: e.target.value })} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Rate per Kg</Label>
                  <Input type="number" step="0.01" value={formData.ratePerKg} onChange={(e) => setFormData({ ...formData, ratePerKg: e.target.value })} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input readOnly className="bg-muted" value={amount ? `₹${amount.toLocaleString()}` : ""} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Notes</Label>
                  <Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Optional notes" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
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
                <Input placeholder="Search by invoice, customer, cage..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-[200px]" />
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
                    <TableHead>Invoice No</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Cage ID</TableHead>
                    <TableHead>Birds</TableHead>
                    <TableHead>Rate/Kg</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">No godown sales found.</TableCell>
                    </TableRow>
                  ) : (
                    filteredSales.map((sale) => (
                      <TableRow key={sale.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleView(sale)}>
                        <TableCell>{sale.saleDate}</TableCell>
                        <TableCell className="font-medium">{sale.invoiceNo}</TableCell>
                        <TableCell>{sale.customerName || "—"}</TableCell>
                        <TableCell>{sale.cageId}</TableCell>
                        <TableCell>{sale.numberOfBirds}</TableCell>
                        <TableCell>₹{sale.ratePerKg.toLocaleString()}</TableCell>
                        <TableCell>₹{sale.amount.toLocaleString()}</TableCell>
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
                <div className="text-muted-foreground">Invoice No</div><div className="font-medium">{viewingSale.invoiceNo}</div>
                <div className="text-muted-foreground">Customer</div><div>{viewingSale.customerName || "—"}</div>
                <div className="text-muted-foreground">Cage ID</div><div>{viewingSale.cageId}</div>
                <div className="text-muted-foreground">Number of Birds</div><div>{viewingSale.numberOfBirds}</div>
                <div className="text-muted-foreground">Rate per Kg</div><div>₹{viewingSale.ratePerKg.toLocaleString()}</div>
                <div className="text-muted-foreground">Amount</div><div className="font-medium">₹{viewingSale.amount.toLocaleString()}</div>
                {viewingSale.notes && (<><div className="text-muted-foreground col-span-2">Notes</div><div className="col-span-2">{viewingSale.notes}</div></>)}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
