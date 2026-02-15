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
import { api, Expense } from "@/lib/api"
import { toast } from "sonner"

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
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
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    try {
      setLoading(true)
      const data = await api.getExpenses()
      setExpenses(data)
    } catch (error) {
      console.error("Error loading expenses:", error)
      toast.error("Failed to load expenses")
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.description || !formData.amount) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      const expenseData = {
        expenseDate: formData.date,
        category: formData.category as "feed" | "labor" | "medicine" | "utilities" | "equipment" | "maintenance" | "transportation" | "other",
        description: formData.description,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod as "cash" | "bank_transfer" | "check" | "credit_card",
        notes: formData.notes,
      }

      if (editingId) {
        await api.updateExpense(editingId, expenseData)
        toast.success("Expense updated successfully")
      } else {
        await api.createExpense(expenseData)
        toast.success("Expense recorded successfully")
      }

      await loadExpenses()
      resetForm()
      setShowDialog(false)
    } catch (error) {
      console.error("Error saving expense:", error)
      toast.error("Failed to save expense")
    }
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

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id)
    setFormData({
      date: expense.expenseDate,
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      paymentMethod: expense.paymentMethod,
      notes: expense.notes || "",
    })
    setShowDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await api.deleteExpense(id)
        toast.success("Expense deleted successfully")
        await loadExpenses()
      } catch (error) {
        console.error("Error deleting expense:", error)
        toast.error("Failed to delete expense")
      }
    }
  }

  const categories = ["feed", "labor", "medicine", "equipment", "maintenance", "transportation", "other"]
  const categoryEmojis: { [key: string]: string } = {
    feed: "🌾",
    labor: "👷",
    medicine: "💊",
    equipment: "🔧",
    maintenance: "🔨",
    transportation: "🚚",
    other: "📋",
  }

  // Filter expenses based on date range
  const filteredExpenses = useMemo(() => {
    if (!startDate || !endDate) return expenses

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.expenseDate)
      const start = new Date(startDate)
      const end = new Date(endDate)
      // Set time to start/end of day for proper comparison
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      expenseDate.setHours(0, 0, 0, 0)

      return expenseDate >= start && expenseDate <= end
    })
  }, [expenses, startDate, endDate])

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
  const categoryBreakdown = categories.map((cat) => ({
    category: cat,
    amount: filteredExpenses.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amount, 0),
  }))

  if (!mounted) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Expenses & Financial Tracking</h1>
            <p className="text-muted-foreground">Track all farm expenses and costs</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2" size={20} />
                Record Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Expense" : "Record New Expense"}</DialogTitle>
                <DialogDescription>Enter expense details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {categoryEmojis[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What was this expense for?"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                      </SelectContent>
                    </Select>
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
                  {editingId ? "Update" : "Record"} Expense
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{loading ? "..." : totalExpenses}</div>
              <p className="text-xs text-muted-foreground mt-1">{loading ? "..." : filteredExpenses.length} transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ₹
                {loading ? "..." : filteredExpenses
                  .filter((e) => {
                    const expenseDate = new Date(e.expenseDate)
                    const now = new Date()
                    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
                  })
                  .reduce((sum, e) => sum + e.amount, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ₹{loading ? "..." : (filteredExpenses.length > 0 ? (totalExpenses / filteredExpenses.length).toFixed(2) : 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Total expenses by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryBreakdown
                  .filter((item) => item.amount > 0)
                  .sort((a, b) => b.amount - a.amount)
                  .map((item) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{categoryEmojis[item.category]}</span>
                        <span className="capitalize font-medium">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">₹{item.amount}</div>
                        <div className="text-xs text-muted-foreground">
                          {((item.amount / totalExpenses) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>Latest expense transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="text-center text-muted-foreground py-4">Loading recent expenses...</div>
                ) : (
                  filteredExpenses
                    .sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime())
                    .slice(0, 5)
                    .map((expense) => (
                      <div key={expense.id} className="flex justify-between items-start pb-3 border-b last:border-b-0">
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            <span>{categoryEmojis[expense.category]}</span>
                            {expense.description}
                          </p>
                          <p className="text-xs text-muted-foreground">{expense.expenseDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{expense.amount}</p>
                          <p className="text-xs text-muted-foreground capitalize">{expense.paymentMethod.replace('_', ' ')}</p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Expenses</CardTitle>
            <CardDescription>Complete list of all expenses</CardDescription>
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
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Loading expenses...
                      </TableCell>
                    </TableRow>
                  ) : filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No expenses found. Click "Record Expense" to add one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses
                      .sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime())
                      .map((expense) => (
                        <TableRow 
                          key={expense.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => {
                            setViewingExpense(expense)
                            setShowViewDialog(true)
                          }}
                        >
                          <TableCell>{expense.expenseDate}</TableCell>
                          <TableCell className="capitalize">{expense.category}</TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell className="font-medium">₹{expense.amount}</TableCell>
                          <TableCell className="capitalize">{expense.paymentMethod.replace('_', ' ')}</TableCell>
                          <TableCell className="text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                            <Button variant="outline" size="icon" onClick={() => handleEdit(expense)}>
                              <Edit2 size={16} />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleDelete(expense.id)}>
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
              <DialogTitle>Expense Details</DialogTitle>
              <DialogDescription>View complete expense information</DialogDescription>
            </DialogHeader>
            {viewingExpense && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Date</Label>
                    <div className="text-sm font-medium">{viewingExpense.expenseDate}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Category</Label>
                    <div className="text-sm font-medium capitalize">{viewingExpense.category}</div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-muted-foreground">Description</Label>
                    <div className="text-sm font-medium">{viewingExpense.description}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Amount</Label>
                    <div className="text-sm font-medium font-semibold">₹{viewingExpense.amount}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Payment Method</Label>
                    <div className="text-sm font-medium capitalize">{viewingExpense.paymentMethod.replace('_', ' ')}</div>
                  </div>
                  {viewingExpense.notes && (
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-muted-foreground">Notes</Label>
                      <div className="text-sm font-medium">{viewingExpense.notes}</div>
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
