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
import { Plus, Edit2, Trash2, Download, Printer, X, Paperclip, File, Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DateRangeFilter } from "@/components/date-range-filter"
import { useDateFilter } from "@/contexts/date-filter-context"

interface Expense {
  id: string
  expenseOwner: string
  date: string
  category: string
  description: string
  amount: number
  paymentMethod: string
  notes: string
  receipt?: string
  attachment?: {
    name: string
    type: string
    data: string // base64 data URL
  }
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [mounted, setMounted] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false)
  const [viewingAttachment, setViewingAttachment] = useState<{ name: string; type: string; data: string } | null>(null)
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>(undefined)
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({
    expenseOwner: "",
    date: new Date().toISOString().split("T")[0],
    category: "feed",
    description: "",
    amount: "",
    paymentMethod: "cash",
    notes: "",
    attachment: null as File | null,
  })
  const [attachmentPreview, setAttachmentPreview] = useState<{
    name: string
    type: string
    data: string
  } | null>(null)
  const { startDate, endDate } = useDateFilter()

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("expenses")
    if (saved) {
      setExpenses(JSON.parse(saved))
    } else {
      setExpenses([])
    }
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    ]
    
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid file type: Word (.doc, .docx), Image (.jpg, .jpeg, .png, .gif), or PDF (.pdf)')
      return
    }

    if (file.size > maxSize) {
      alert('File size must be less than 10MB')
      return
    }

    // Convert file to base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setAttachmentPreview({
        name: file.name,
        type: file.type,
        data: base64String,
      })
      setFormData({ ...formData, attachment: file })
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAttachment = () => {
    setAttachmentPreview(null)
    setFormData({ ...formData, attachment: null })
  }

  const handleSave = async () => {
    if (!formData.description || !formData.amount) {
      alert("Please fill all required fields")
      return
    }

    let updatedExpenses: Expense[]
    const attachmentData = attachmentPreview || (editingId && expenses.find(e => e.id === editingId)?.attachment)

    if (editingId) {
      updatedExpenses = expenses.map((expense) =>
        expense.id === editingId
          ? {
              ...expense,
              expenseOwner: formData.expenseOwner,
              date: formData.date,
              category: formData.category,
              description: formData.description,
              amount: Number.parseFloat(formData.amount),
              paymentMethod: formData.paymentMethod,
              notes: formData.notes,
              attachment: attachmentData || undefined,
            }
          : expense,
      )
    } else {
      updatedExpenses = [
        ...expenses,
        {
          id: Date.now().toString(),
          expenseOwner: formData.expenseOwner,
          date: formData.date,
          category: formData.category,
          description: formData.description,
          amount: Number.parseFloat(formData.amount),
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
          attachment: attachmentData || undefined,
        },
      ]
    }

    setExpenses(updatedExpenses)
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses))
    resetForm()
    setShowDialog(false)
  }

  const resetForm = () => {
    setFormData({
      expenseOwner: "",
      date: new Date().toISOString().split("T")[0],
      category: "feed",
      description: "",
      amount: "",
      paymentMethod: "cash",
      notes: "",
      attachment: null,
    })
    setAttachmentPreview(null)
    setEditingId(null)
  }

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id)
    setFormData({
      expenseOwner: expense.expenseOwner || "",
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      paymentMethod: expense.paymentMethod,
      notes: expense.notes,
      attachment: null,
    })
    setAttachmentPreview(expense.attachment || null)
    setShowDialog(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      const updated = expenses.filter((expense) => expense.id !== id)
      setExpenses(updated)
      localStorage.setItem("expenses", JSON.stringify(updated))
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

  // Filter expenses based on date range and search
  const filteredExpenses = useMemo(() => {
    let filtered = expenses

    // Apply date range filter (from date range picker in Expense List section)
    if (dateRangeStart && dateRangeEnd) {
      const start = new Date(dateRangeStart)
      const end = new Date(dateRangeEnd)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)

      filtered = filtered.filter((expense) => {
        const expenseDate = new Date(expense.date)
        expenseDate.setHours(0, 0, 0, 0)
        return expenseDate >= start && expenseDate <= end
      })
    }

    // Also apply global date filter if set (from context)
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)

      filtered = filtered.filter((expense) => {
        const expenseDate = new Date(expense.date)
        expenseDate.setHours(0, 0, 0, 0)
        return expenseDate >= start && expenseDate <= end
      })
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (expense) =>
          (expense.expenseOwner || "").toLowerCase().includes(query) ||
          (expense.description || "").toLowerCase().includes(query) ||
          (expense.category || "").toLowerCase().includes(query),
      )
    }

    return filtered
  }, [expenses, dateRangeStart, dateRangeEnd, startDate, endDate, searchQuery])

  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    setDateRangeStart(start)
    setDateRangeEnd(end)
  }

  const handleDownloadPDF = () => {
    const filtered = filteredExpenses
    
    // Create a printable HTML content
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Expenses Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header { margin-bottom: 20px; }
            .date-range { margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Expenses List Report</h1>
            ${dateRangeStart && dateRangeEnd ? `<div class="date-range"><strong>Date Range:</strong> ${dateRangeStart.toLocaleDateString()} - ${dateRangeEnd.toLocaleDateString()}</div>` : ''}
            <div><strong>Total Records:</strong> ${filtered.length}</div>
            <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Expense Owner</th>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Payment Method</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(expense => `
                <tr>
                  <td>${expense.expenseOwner || "N/A"}</td>
                  <td>${expense.date}</td>
                  <td>${expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}</td>
                  <td>${expense.description}</td>
                  <td>₹${expense.amount.toLocaleString()}</td>
                  <td>${expense.paymentMethod.charAt(0).toUpperCase() + expense.paymentMethod.slice(1)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    // Create blob and download
    const blob = new Blob([printContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `expenses-report-${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handlePrintReport = () => {
    const filtered = filteredExpenses
    
    // Create a printable HTML content
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Expenses Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header { margin-bottom: 20px; }
            .date-range { margin-bottom: 10px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Expenses List Report</h1>
            ${dateRangeStart && dateRangeEnd ? `<div class="date-range"><strong>Date Range:</strong> ${dateRangeStart.toLocaleDateString()} - ${dateRangeEnd.toLocaleDateString()}</div>` : ''}
            <div><strong>Total Records:</strong> ${filtered.length}</div>
            <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Expense Owner</th>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Payment Method</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(expense => `
                <tr>
                  <td>${expense.expenseOwner || "N/A"}</td>
                  <td>${expense.date}</td>
                  <td>${expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}</td>
                  <td>${expense.description}</td>
                  <td>₹${expense.amount.toLocaleString()}</td>
                  <td>${expense.paymentMethod.charAt(0).toUpperCase() + expense.paymentMethod.slice(1)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    // Open new window and print
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.onload = () => {
        printWindow.print()
      }
    }
  }

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

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
                Add New Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>{editingId ? "Edit Expense" : "Add New Expense"}</DialogTitle>
                <DialogDescription>Enter expense details</DialogDescription>
              </DialogHeader>
              <div className="overflow-y-auto flex-1 pr-2 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Expense Owner</Label>
                    <Input
                      value={formData.expenseOwner}
                      onChange={(e) => setFormData({ ...formData, expenseOwner: e.target.value })}
                      placeholder="Enter expense owner name"
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm">Date</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="h-9">
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

                  <div className="space-y-1.5">
                    <Label className="text-sm">Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What was this expense for?"
                    className="h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">Payment Method</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="card">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes"
                    rows={2}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">Attachment</Label>
                  <Input
                    type="file"
                    accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.gif,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="cursor-pointer h-9 text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Accepted: Word, Images, PDF. Max: 10MB
                  </p>
                  {attachmentPreview && (
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                      <Paperclip size={14} className="text-muted-foreground" />
                      <span className="text-xs flex-1 truncate">{attachmentPreview.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveAttachment}
                        className="h-6 w-6"
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 pt-3 border-t">
                <Button onClick={handleSave} className="w-full">
                  {editingId ? "Update" : "Save"} Expense
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expense (rs)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{totalExpenses.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Expense By Category</CardTitle>
              <CardDescription>Expenses breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { key: "feed", label: "Feed" },
                  { key: "labor", label: "Labour" },
                  { key: "medicine", label: "Medicine" },
                  { key: "equipment", label: "Equipment" },
                  { key: "maintenance", label: "Maintenance" },
                  { key: "transportation", label: "Transportation" },
                ].map(({ key, label }) => {
                  const categoryAmount = filteredExpenses
                    .filter((e) => e.category === key)
                    .reduce((sum, e) => sum + e.amount, 0)
                  
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{categoryEmojis[key] || "📋"}</span>
                        <span className="font-medium">{label}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">₹{categoryAmount.toLocaleString()}</div>
                        {totalExpenses > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {((categoryAmount / totalExpenses) * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>All Expenses</CardTitle>
                <CardDescription>Complete list of all expenses</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <DateRangeFilter
                  startDate={dateRangeStart}
                  endDate={dateRangeEnd}
                  onDateRangeChange={handleDateRangeChange}
                />
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium whitespace-nowrap">Filter:</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search by owner, description, or category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-[200px]"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSearchQuery("")}
                        className="h-10 w-10"
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                >
                  <Download className="mr-2" size={16} />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintReport}
                >
                  <Printer className="mr-2" size={16} />
                  Print Report
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Expense Owner</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Attachment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        {searchQuery || (dateRangeStart && dateRangeEnd) ? "No expenses found matching your filters." : "No expenses found. Click \"Add New Expense\" to get started."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((expense) => (
                        <TableRow 
                          key={expense.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => {
                            setViewingExpense(expense)
                            setShowViewDialog(true)
                          }}
                        >
                          <TableCell>{expense.expenseOwner || "N/A"}</TableCell>
                          <TableCell>{expense.date}</TableCell>
                          <TableCell className="capitalize">{expense.category}</TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell className="font-medium">₹{expense.amount}</TableCell>
                          <TableCell className="capitalize">{expense.paymentMethod}</TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            {expense.attachment ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setViewingAttachment(expense.attachment!)
                                  setShowAttachmentDialog(true)
                                }}
                                title="View attachment"
                              >
                                <Paperclip size={16} className="text-blue-600" />
                              </Button>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
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
                    <Label className="text-muted-foreground">Expense Owner</Label>
                    <div className="text-sm font-medium">{viewingExpense.expenseOwner || "N/A"}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Date</Label>
                    <div className="text-sm font-medium">{viewingExpense.date}</div>
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
                    <div className="text-sm font-medium capitalize">{viewingExpense.paymentMethod}</div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-muted-foreground">Notes</Label>
                    <div className="text-sm font-medium">{viewingExpense.notes || "N/A"}</div>
                  </div>
                  {viewingExpense.attachment && (
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-muted-foreground">Attachment</Label>
                      <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                        <File size={16} className="text-muted-foreground" />
                        <span className="text-sm flex-1 truncate">{viewingExpense.attachment.name}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = viewingExpense.attachment!.data
                            link.download = viewingExpense.attachment!.name
                            link.click()
                          }}
                        >
                          <Download size={14} className="mr-1" />
                          Download
                        </Button>
                        {viewingExpense.attachment.type.startsWith('image/') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newWindow = window.open()
                              if (newWindow) {
                                newWindow.document.write(`<img src="${viewingExpense.attachment!.data}" style="max-width: 100%; height: auto;" />`)
                              }
                            }}
                          >
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Attachment View Dialog */}
        <Dialog open={showAttachmentDialog} onOpenChange={setShowAttachmentDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <DialogTitle>Attachment</DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAttachmentDialog(false)}
                  className="h-6 w-6"
                >
                  <X size={16} />
                </Button>
              </div>
              {viewingAttachment && (
                <DialogDescription className="truncate">{viewingAttachment.name}</DialogDescription>
              )}
            </DialogHeader>
            {viewingAttachment && (
              <div className="flex-1 overflow-auto">
                {viewingAttachment.type.startsWith('image/') ? (
                  <div className="flex items-center justify-center p-4">
                    <img
                      src={viewingAttachment.data}
                      alt={viewingAttachment.name}
                      className="max-w-full max-h-[70vh] object-contain rounded-md"
                    />
                  </div>
                ) : viewingAttachment.type === 'application/pdf' ? (
                  <div className="w-full h-[70vh]">
                    <iframe
                      src={viewingAttachment.data}
                      className="w-full h-full border rounded-md"
                      title={viewingAttachment.name}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 space-y-4">
                    <File size={64} className="text-muted-foreground" />
                    <div className="text-center">
                      <p className="font-medium mb-2">{viewingAttachment.name}</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        This file type cannot be previewed. Please download to view.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = viewingAttachment.data
                          link.download = viewingAttachment.name
                          link.click()
                        }}
                      >
                        <Download size={16} className="mr-2" />
                        Download File
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex-shrink-0 pt-4 border-t flex justify-end gap-2">
              {viewingAttachment && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = viewingAttachment.data
                    link.download = viewingAttachment.name
                    link.click()
                  }}
                >
                  <Download size={16} className="mr-2" />
                  Download
                </Button>
              )}
              <Button onClick={() => setShowAttachmentDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
