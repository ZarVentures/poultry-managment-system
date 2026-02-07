"use client"

import { useState, useEffect, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DateRangeFilter } from "@/components/date-range-filter"
import { Download, Loader2 } from "lucide-react"
import { parseISO, isWithinInterval } from "date-fns"

interface Sale {
  id: string
  invoiceNumber: string
  customer: string
  date: string
  productType: string
  quantity: number
  unitPrice: number
  totalAmount: number
  paymentStatus: string
  notes: string
}

interface Expense {
  id: string
  date: string
  category: string
  description: string
  amount: number
  paymentMethod: string
  notes: string
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
  status: string
  notes: string
  totalAmount?: number
}

type ReportType = "profit-loss" | "gross-profit" | "expense-breakdown" | "batch-profit" | "farm-profit" | "customer-sales"

interface ReportData {
  profitLoss?: {
    totalSales: number
    totalPurchases: number
    totalExpenses: number
    netProfit: number
  }
  grossProfit?: {
    totalSales: number
    totalPurchaseCost: number
    grossProfit: number
    grossProfitPercentage: number
  }
  expenseBreakdown?: Array<{
    category: string
    amount: number
  }>
  batchProfit?: Array<{
    batchName: string
    sales: number
    purchase: number
    expenses: number
    netProfit: number
  }>
  farmProfit?: Array<{
    farmName: string
    sales: number
    purchase: number
    expenses: number
    netProfit: number
  }>
  customerSales?: Array<{
    customerName: string
    totalSales: number
    numberOfOrders: number
  }>
}

export default function BusinessReportsPage() {
  const [mounted, setMounted] = useState(false)
  const [sales, setSales] = useState<Sale[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([])
  
  // Report state
  const [activeReport, setActiveReport] = useState<ReportType>("profit-loss")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [selectedBatch, setSelectedBatch] = useState<string>("")
  const [selectedFarm, setSelectedFarm] = useState<string>("")
  const [selectedCustomer, setSelectedCustomer] = useState<string>("")
  
  // Report data and UI state
  const [reportData, setReportData] = useState<ReportData>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    
    // Load sales from localStorage
    const salesData = localStorage.getItem("sales")
    if (salesData) {
      try {
        setSales(JSON.parse(salesData))
      } catch (e) {
        console.error("Error parsing sales:", e)
      }
    }

    // Load expenses from localStorage
    const expensesData = localStorage.getItem("expenses")
    if (expensesData) {
      try {
        setExpenses(JSON.parse(expensesData))
      } catch (e) {
        console.error("Error parsing expenses:", e)
      }
    }

    // Fetch purchases from API
    const fetchPurchases = async () => {
      try {
        const response = await fetch("/api/purchases")
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            const formattedPurchases = result.data.map((p: any) => ({
              ...p,
              id: p.id.toString(),
            }))
            setPurchases(formattedPurchases)
          }
        }
      } catch (error) {
        console.error("Error fetching purchases:", error)
      }
    }

    fetchPurchases()
  }, [])

  const handleDateRangeChange = (from: Date | undefined, to: Date | undefined) => {
    setStartDate(from)
    setEndDate(to)
  }

  // Filter data based on date range
  const getFilteredData = () => {
    let filteredSales = sales
    let filteredExpenses = expenses
    let filteredPurchases = purchases

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)

      filteredSales = sales.filter((s) => {
        if (!s || !s.date) return false
        try {
          const saleDate = parseISO(s.date)
          saleDate.setHours(0, 0, 0, 0)
          return saleDate >= start && saleDate <= end
        } catch (e) {
          return false
        }
      })

      filteredExpenses = expenses.filter((e) => {
        if (!e || !e.date) return false
        try {
          const expenseDate = parseISO(e.date)
          expenseDate.setHours(0, 0, 0, 0)
          return expenseDate >= start && expenseDate <= end
        } catch (e) {
          return false
        }
      })

      filteredPurchases = purchases.filter((p) => {
        if (!p || !p.date) return false
        try {
          const purchaseDate = parseISO(p.date)
          purchaseDate.setHours(0, 0, 0, 0)
          return purchaseDate >= start && purchaseDate <= end
        } catch (e) {
          return false
        }
      })
    }

    return { filteredSales, filteredExpenses, filteredPurchases }
  }

  // Generate Profit & Loss Report
  const generateProfitLossReport = async () => {
    if (!startDate || !endDate) {
      setError("Start Date and End Date are required for Profit & Loss report")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      const { filteredSales, filteredExpenses, filteredPurchases } = getFilteredData()

      const totalSales = filteredSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0)
      const totalPurchases = filteredPurchases.reduce((sum, p) => sum + (p.totalValue || p.totalAmount || 0), 0)
      const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
      const netProfit = totalSales - totalPurchases - totalExpenses

      setReportData({
        profitLoss: {
          totalSales,
          totalPurchases,
          totalExpenses,
          netProfit,
        },
      })
    } catch (err) {
      setError("Failed to generate Profit & Loss report")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Generate Gross Profit Report
  const generateGrossProfitReport = async () => {
    setLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const { filteredSales, filteredPurchases } = getFilteredData()

      const totalSales = filteredSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0)
      const totalPurchaseCost = filteredPurchases.reduce((sum, p) => sum + (p.totalValue || p.totalAmount || 0), 0)
      const grossProfit = totalSales - totalPurchaseCost
      const grossProfitPercentage = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0

      setReportData({
        grossProfit: {
          totalSales,
          totalPurchaseCost,
          grossProfit,
          grossProfitPercentage,
        },
      })
    } catch (err) {
      setError("Failed to generate Gross Profit report")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Generate Expense Breakdown Report
  const generateExpenseBreakdownReport = async () => {
    setLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const { filteredExpenses } = getFilteredData()

      const categoryTotals: { [key: string]: number } = {}
      filteredExpenses.forEach((expense) => {
        const category = expense.category || "other"
        categoryTotals[category] = (categoryTotals[category] || 0) + (expense.amount || 0)
      })

      const expenseBreakdown = Object.entries(categoryTotals)
        .map(([category, amount]) => ({
          category: category.charAt(0).toUpperCase() + category.slice(1),
          amount,
        }))
        .sort((a, b) => b.amount - a.amount)

      setReportData({ expenseBreakdown })
    } catch (err) {
      setError("Failed to generate Expense Breakdown report")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Generate Batch-wise Profit Report
  const generateBatchProfitReport = async () => {
    setLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Mock batch data - In production, this would come from API
      // For now, we'll create batches based on purchase orders
      const { filteredSales, filteredExpenses, filteredPurchases } = getFilteredData()

      const batchMap: { [key: string]: { sales: number; purchase: number; expenses: number } } = {}

      // Group purchases by order number (as batch identifier)
      filteredPurchases.forEach((purchase) => {
        const batchName = purchase.orderNumber || `Batch-${purchase.id}`
        if (!batchMap[batchName]) {
          batchMap[batchName] = { sales: 0, purchase: 0, expenses: 0 }
        }
        batchMap[batchName].purchase += purchase.totalValue || purchase.totalAmount || 0
      })

      // Allocate expenses proportionally (simplified - in production, expenses should be linked to batches)
      const totalPurchases = filteredPurchases.reduce((sum, p) => sum + (p.totalValue || p.totalAmount || 0), 0)
      filteredExpenses.forEach((expense) => {
        // Distribute expenses across batches proportionally
        Object.keys(batchMap).forEach((batchName) => {
          const batchPurchase = batchMap[batchName].purchase
          if (totalPurchases > 0) {
            batchMap[batchName].expenses += (expense.amount * batchPurchase) / totalPurchases
          }
        })
      })

      // Sales are not directly linked to batches in current data structure
      // In production, sales should have batch reference
      // For now, we'll show purchase and expenses only

      const batchProfit = Object.entries(batchMap).map(([batchName, data]) => ({
        batchName,
        sales: data.sales,
        purchase: data.purchase,
        expenses: data.expenses,
        netProfit: data.sales - data.purchase - data.expenses,
      }))

      setReportData({ batchProfit })
    } catch (err) {
      setError("Failed to generate Batch-wise Profit report")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Generate Farm-wise Profit Report
  const generateFarmProfitReport = async () => {
    setLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Mock farm data - In production, this would come from API
      // For now, we'll use suppliers from purchases as farms
      const { filteredSales, filteredExpenses, filteredPurchases } = getFilteredData()

      const farmMap: { [key: string]: { sales: number; purchase: number; expenses: number } } = {}

      // Group purchases by supplier (as farm identifier)
      filteredPurchases.forEach((purchase) => {
        const farmName = purchase.supplier || "Unknown Farm"
        if (!farmMap[farmName]) {
          farmMap[farmName] = { sales: 0, purchase: 0, expenses: 0 }
        }
        farmMap[farmName].purchase += purchase.totalValue || purchase.totalAmount || 0
      })

      // Allocate expenses proportionally
      const totalPurchases = filteredPurchases.reduce((sum, p) => sum + (p.totalValue || p.totalAmount || 0), 0)
      filteredExpenses.forEach((expense) => {
        Object.keys(farmMap).forEach((farmName) => {
          const farmPurchase = farmMap[farmName].purchase
          if (totalPurchases > 0) {
            farmMap[farmName].expenses += (expense.amount * farmPurchase) / totalPurchases
          }
        })
      })

      const farmProfit = Object.entries(farmMap).map(([farmName, data]) => ({
        farmName,
        sales: data.sales,
        purchase: data.purchase,
        expenses: data.expenses,
        netProfit: data.sales - data.purchase - data.expenses,
      }))

      setReportData({ farmProfit })
    } catch (err) {
      setError("Failed to generate Farm-wise Profit report")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Generate Customer-wise Sales Report
  const generateCustomerSalesReport = async () => {
    setLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const { filteredSales } = getFilteredData()

      const customerMap: { [key: string]: { totalSales: number; numberOfOrders: number } } = {}

      filteredSales.forEach((sale) => {
        const customerName = sale.customer || "Unknown Customer"
        if (!customerMap[customerName]) {
          customerMap[customerName] = { totalSales: 0, numberOfOrders: 0 }
        }
        customerMap[customerName].totalSales += sale.totalAmount || 0
        customerMap[customerName].numberOfOrders += 1
      })

      const customerSales = Object.entries(customerMap)
        .map(([customerName, data]) => ({
          customerName,
          totalSales: data.totalSales,
          numberOfOrders: data.numberOfOrders,
        }))
        .sort((a, b) => b.totalSales - a.totalSales)

      setReportData({ customerSales })
    } catch (err) {
      setError("Failed to generate Customer-wise Sales report")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Handle report generation based on active report
  const handleGenerateReport = () => {
    switch (activeReport) {
      case "profit-loss":
        generateProfitLossReport()
        break
      case "gross-profit":
        generateGrossProfitReport()
        break
      case "expense-breakdown":
        generateExpenseBreakdownReport()
        break
      case "batch-profit":
        generateBatchProfitReport()
        break
      case "farm-profit":
        generateFarmProfitReport()
        break
      case "customer-sales":
        generateCustomerSalesReport()
        break
    }
  }

  // Auto-generate report when switching tabs (except profit-loss which requires dates)
  useEffect(() => {
    if (mounted && activeReport !== "profit-loss") {
      handleGenerateReport()
    }
  }, [activeReport, startDate, endDate, selectedBatch, selectedFarm, selectedCustomer])

  if (!mounted) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Business Reports</h1>
            <p className="text-muted-foreground">Comprehensive business analytics and insights</p>
          </div>
            <Button>
              <Download className="mr-2" size={20} />
              Export Report
            </Button>
          </div>

        {/* Report Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { id: "profit-loss" as ReportType, label: "Profit & Loss" },
            { id: "gross-profit" as ReportType, label: "Gross Profit" },
            { id: "expense-breakdown" as ReportType, label: "Expense Breakdown" },
            { id: "batch-profit" as ReportType, label: "Batch-wise Profit" },
            { id: "farm-profit" as ReportType, label: "Farm-wise Profit" },
            { id: "customer-sales" as ReportType, label: "Customer-wise Sales" },
          ].map((report) => (
            <Button
              key={report.id}
              variant={activeReport === report.id ? "default" : "outline"}
              className={`h-auto py-4 ${activeReport === report.id ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => setActiveReport(report.id)}
            >
              {report.label}
            </Button>
          ))}
        </div>

        {/* Report Filters */}
          <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range - Required for Profit & Loss, Optional for others */}
              <div className="space-y-2">
                <Label>Date Range</Label>
                <DateRangeFilter
                  startDate={startDate}
                  endDate={endDate}
                  onDateRangeChange={handleDateRangeChange}
                />
              </div>

              {/* Batch Filter - Only for Batch-wise Profit */}
              {activeReport === "batch-profit" && (
                <div className="space-y-2">
                  <Label>Batch</Label>
                  <Select value={selectedBatch || "all"} onValueChange={(value) => setSelectedBatch(value === "all" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Batches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Batches</SelectItem>
                      {/* In production, fetch batches from API */}
                      {purchases.map((p) => (
                        <SelectItem key={p.id} value={p.orderNumber || p.id}>
                          {p.orderNumber || `Batch-${p.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Farm Filter - Only for Farm-wise Profit */}
              {activeReport === "farm-profit" && (
                <div className="space-y-2">
                  <Label>Farm</Label>
                  <Select value={selectedFarm || "all"} onValueChange={(value) => setSelectedFarm(value === "all" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Farms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Farms</SelectItem>
                      {/* In production, fetch farms from API */}
                      {Array.from(new Set(purchases.map((p) => p.supplier))).map((farm) => (
                        <SelectItem key={farm} value={farm}>
                          {farm}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Customer Filter - Only for Customer-wise Sales */}
              {activeReport === "customer-sales" && (
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select value={selectedCustomer || "all"} onValueChange={(value) => setSelectedCustomer(value === "all" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Customers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers</SelectItem>
                      {Array.from(new Set(sales.map((s) => s.customer))).map((customer) => (
                        <SelectItem key={customer} value={customer}>
                          {customer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Generate Button - Required for Profit & Loss */}
              {activeReport === "profit-loss" && (
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button
                    onClick={handleGenerateReport}
                    disabled={!startDate || !endDate || loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Report"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="border-red-500">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Report Results */}
        {loading && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading report data...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && activeReport === "profit-loss" && reportData.profitLoss && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{reportData.profitLoss.totalSales.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{reportData.profitLoss.totalPurchases.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{reportData.profitLoss.totalExpenses.toLocaleString()}</div>
              </CardContent>
            </Card>
          <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit / Loss</CardTitle>
            </CardHeader>
            <CardContent>
                <div
                  className={`text-3xl font-bold ${
                    reportData.profitLoss.netProfit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ₹{reportData.profitLoss.netProfit.toLocaleString()}
                </div>
            </CardContent>
          </Card>
          </div>
        )}

        {!loading && activeReport === "gross-profit" && reportData.grossProfit && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{reportData.grossProfit.totalSales.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Purchase Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{reportData.grossProfit.totalPurchaseCost.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Gross Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-3xl font-bold ${
                    reportData.grossProfit.grossProfit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ₹{reportData.grossProfit.grossProfit.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Gross Profit %</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{reportData.grossProfit.grossProfitPercentage.toFixed(2)}%</div>
            </CardContent>
          </Card>
        </div>
        )}

        {!loading && activeReport === "expense-breakdown" && reportData.expenseBreakdown && (
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Expense Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.expenseBreakdown.length > 0 ? (
                      <>
                        {reportData.expenseBreakdown.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.category}</TableCell>
                            <TableCell className="text-right">₹{item.amount.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-bold bg-muted">
                          <TableCell>Total</TableCell>
                          <TableCell className="text-right">
                            ₹{reportData.expenseBreakdown.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      </>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                          No expense data found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && activeReport === "batch-profit" && reportData.batchProfit && (
          <Card>
            <CardHeader>
              <CardTitle>Batch-wise Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch Name</TableHead>
                      <TableHead className="text-right">Sales</TableHead>
                      <TableHead className="text-right">Purchase</TableHead>
                      <TableHead className="text-right">Expenses</TableHead>
                      <TableHead className="text-right">Net Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.batchProfit.length > 0 ? (
                      reportData.batchProfit.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.batchName}</TableCell>
                          <TableCell className="text-right">₹{item.sales.toLocaleString()}</TableCell>
                          <TableCell className="text-right">₹{item.purchase.toLocaleString()}</TableCell>
                          <TableCell className="text-right">₹{item.expenses.toLocaleString()}</TableCell>
                          <TableCell
                            className={`text-right font-bold ${
                              item.netProfit >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            ₹{item.netProfit.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No batch data found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && activeReport === "farm-profit" && reportData.farmProfit && (
          <Card>
            <CardHeader>
              <CardTitle>Farm-wise Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Farm Name</TableHead>
                      <TableHead className="text-right">Sales</TableHead>
                      <TableHead className="text-right">Purchase</TableHead>
                      <TableHead className="text-right">Expenses</TableHead>
                      <TableHead className="text-right">Net Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.farmProfit.length > 0 ? (
                      reportData.farmProfit.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.farmName}</TableCell>
                          <TableCell className="text-right">₹{item.sales.toLocaleString()}</TableCell>
                          <TableCell className="text-right">₹{item.purchase.toLocaleString()}</TableCell>
                          <TableCell className="text-right">₹{item.expenses.toLocaleString()}</TableCell>
                          <TableCell
                            className={`text-right font-bold ${
                              item.netProfit >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            ₹{item.netProfit.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No farm data found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && activeReport === "customer-sales" && reportData.customerSales && (
          <Card>
            <CardHeader>
              <CardTitle>Customer-wise Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer Name</TableHead>
                      <TableHead className="text-right">Total Sales</TableHead>
                      <TableHead className="text-right">Number of Orders</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.customerSales.length > 0 ? (
                      reportData.customerSales.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.customerName}</TableCell>
                          <TableCell className="text-right">₹{item.totalSales.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{item.numberOfOrders}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No customer data found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Data Message */}
        {!loading &&
          !error &&
          ((activeReport === "profit-loss" && !reportData.profitLoss) ||
            (activeReport === "gross-profit" && !reportData.grossProfit) ||
            (activeReport === "expense-breakdown" && !reportData.expenseBreakdown) ||
            (activeReport === "batch-profit" && !reportData.batchProfit) ||
            (activeReport === "farm-profit" && !reportData.farmProfit) ||
            (activeReport === "customer-sales" && !reportData.customerSales)) && (
        <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  {activeReport === "profit-loss"
                    ? "Select date range and click 'Generate Report' to view Profit & Loss report"
                    : "No data found. Please adjust filters and try again."}
                </p>
          </CardContent>
        </Card>
          )}
      </div>
    </DashboardLayout>
  )
}
