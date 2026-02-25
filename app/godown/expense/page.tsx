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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangeFilter } from "@/components/date-range-filter"
import { useDateFilter } from "@/contexts/date-filter-context"

interface GodownExpense {
  id: string
  date: string
  category: string
  description: string
  amount: number
  paymentMethod: string
  notes: string
}

const categories = ["feed", "labor", "medicine", "equipment", "maintenance", "transportation", "other"]

export default function GodownExpensePage() {
  const [expenses, setExpenses] = useState<GodownExpense[]>([])
  const [mounted, setMounted] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewingExpense, setViewingExpense] = useState<GodownExpense | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>(undefined)
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "feed",
    description: "",
    amount: "",
    paymentMethod: "cash",
    notes: "",
  })
  const { startDate, endDate } = useDateFilter()

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("godownExpense")
    if (saved) setExpenses(JSON.parse(saved))
    else setExpenses([])
  }, [])

  const handleSave = () => {
    if (!formData.date || !formData.description || !formData.amount) {
      alert("Please fill required fields (Date, Description, Amount)")
      return
    }
    const expense: GodownExpense = {
      id: editingId || Date.now().toString(),
      date: formData.date,
      category: formData.category,
      description: formData.description,
      amount: Number.parseFloat(formData.amount) || 0,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
    }
    const updated = editingId ? expenses.map((e) => (e.id === editingId ? expense : e)) : [...expenses, expense]
    setExpenses(updated)
    localStorage.setItem("godownExpense", JSON.stringify(updated))
    resetForm()
    setShowDialog(false)
  }

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      category: "feed",
      description: "",
      amount: "",
      paymentMethod: "cash",
      notes: "",
    })
    setEditingId(null)
  }

  const handleEdit = (expense: GodownExpense) => {
    setEditingId(expense.id)
    setFormData({
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      paymentMethod: expense.paymentMethod,
      notes: expense.notes,
    })
    setShowDialog(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Delete this expense?")) {
      const updated = expenses.filter((e) => e.id !== id)
      setExpenses(updated)
      localStorage.setItem("godownExpense", JSON.stringify(updated))
    }
  }

  const handleView = (expense: GodownExpense) => {
    setViewingExpense(expense)
    setShowViewDialog(true)
  }

  const filteredExpenses = useMemo(() => {
    let list = expenses
    if (dateRangeStart && dateRangeEnd) {
      const start = new Date(dateRangeStart)
      const end = new Date(dateRangeEnd)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      list = list.filter((e) => {
        const d = new Date(e.date)
        return d >= start && d <= end
      })
    }
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      list = list.filter((e) => {
        const d = new Date(e.date)
        return d >= start && d <= end
      })
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      )
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [expenses, dateRangeStart, dateRangeEnd, startDate, endDate, searchQuery])

  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    setDateRangeStart(start)
    setDateRangeEnd(end)
  }

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

  if (!mounted) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Godown Expense</h1>
            <p className="text-muted-foreground">Track expenses at godown</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2" size={20} />
                Add New Godown Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Godown Expense" : "Add New Godown Expense"}</DialogTitle>
                <DialogDescription>Enter expense details</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Description *</Label>
                  <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="What was this expense for?" />
                </div>
                <div className="space-y-2">
                  <Label>Amount *</Label>
                  <Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={formData.paymentMethod} onValueChange={(v) => setFormData({ ...formData, paymentMethod: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                    </SelectContent>
                  </Select>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Godown Expense (₹)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{totalAmount.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Godown Expenses</CardTitle>
                <CardDescription>List of all godown expenses</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <DateRangeFilter startDate={dateRangeStart} endDate={dateRangeEnd} onDateRangeChange={handleDateRangeChange} />
                <Input placeholder="Search by description or category..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-[200px]" />
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
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No godown expenses found.</TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <TableRow key={expense.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleView(expense)}>
                        <TableCell>{expense.date}</TableCell>
                        <TableCell className="capitalize">{expense.category}</TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell className="font-medium">₹{expense.amount.toLocaleString()}</TableCell>
                        <TableCell className="capitalize">{expense.paymentMethod}</TableCell>
                        <TableCell className="text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="icon" onClick={() => handleEdit(expense)}><Edit2 size={16} /></Button>
                          <Button variant="outline" size="icon" onClick={() => handleView(expense)}><Eye size={16} /></Button>
                          <Button variant="outline" size="icon" onClick={() => handleDelete(expense.id)}><Trash2 size={16} /></Button>
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
            <DialogHeader><DialogTitle>Godown Expense Details</DialogTitle></DialogHeader>
            {viewingExpense && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-muted-foreground">Date</div><div className="font-medium">{viewingExpense.date}</div>
                <div className="text-muted-foreground">Category</div><div className="capitalize">{viewingExpense.category}</div>
                <div className="text-muted-foreground">Description</div><div>{viewingExpense.description}</div>
                <div className="text-muted-foreground">Amount</div><div className="font-medium">₹{viewingExpense.amount.toLocaleString()}</div>
                <div className="text-muted-foreground">Payment Method</div><div className="capitalize">{viewingExpense.paymentMethod}</div>
                {viewingExpense.notes && (<><div className="text-muted-foreground col-span-2">Notes</div><div className="col-span-2">{viewingExpense.notes}</div></>)}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
