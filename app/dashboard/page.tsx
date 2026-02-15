"use client"

import { useState, useEffect, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { format, startOfMonth, eachMonthOfInterval, startOfYear } from "date-fns"
import { api, DashboardKPIs, Sale, Expense } from "@/lib/api"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const [recentSales, setRecentSales] = useState<Sale[]>([])
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([])
  const [revenueByProduct, setRevenueByProduct] = useState<Array<{ productType: string; revenue: number; count: number }>>([])
  const [expensesByCategory, setExpensesByCategory] = useState<Array<{ category: string; amount: number; count: number }>>([])

  useEffect(() => {
    setMounted(true)
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load all dashboard data in parallel
      const [
        kpisData,
        salesData,
        expensesData,
        revenueData,
        expenseCategoryData
      ] = await Promise.all([
        api.getDashboardKPIs(),
        api.getRecentSales(10),
        api.getRecentExpenses(10),
        api.getRevenueByProductType(),
        api.getExpensesByCategory2()
      ])

      setKpis(kpisData)
      setRecentSales(salesData)
      setRecentExpenses(expensesData)
      setRevenueByProduct(revenueData)
      setExpensesByCategory(expenseCategoryData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Generate monthly trend data for the last 6 months
  const monthlyTrendData = useMemo(() => {
    if (!kpis || !recentSales || !recentExpenses) return []
    
    const months = eachMonthOfInterval({
      start: startOfYear(new Date()),
      end: new Date(),
    }).slice(-6) // Last 6 months

    // For now, we'll use simplified data since we don't have historical monthly data from API
    // In a real implementation, you'd have separate endpoints for monthly trends
    return months.map((month) => ({
      month: format(month, "MMM"),
      Purchase: 0, // Would need historical purchase data
      Sale: 0,     // Would need historical sales data  
      Expense: 0,  // Would need historical expense data
    }))
  }, [kpis, recentSales, recentExpenses])

  if (!mounted) return null

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your poultry farm management system</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{kpis?.totalRevenue.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {kpis?.period ? `From ${format(new Date(kpis.period.startDate), "MMM d")} to ${format(new Date(kpis.period.endDate), "MMM d")}` : 'Current period'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpis?.totalSales.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {kpis?.period ? `From ${format(new Date(kpis.period.startDate), "MMM d")} to ${format(new Date(kpis.period.endDate), "MMM d")}` : 'Current period'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{kpis?.totalExpenses.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {kpis?.period ? `From ${format(new Date(kpis.period.startDate), "MMM d")} to ${format(new Date(kpis.period.endDate), "MMM d")}` : 'Current period'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit/Loss</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${(kpis?.profit || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                {(kpis?.profit || 0) >= 0 ? "Profit" : "Loss"}
              </div>
              <div className={`text-2xl font-semibold mt-1 ${(kpis?.profit || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                ₹{Math.abs(kpis?.profit || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Active Vehicles: {kpis?.totalVehicles || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Monthly trends for Purchase, Sale, and Expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  Purchase: { label: "Purchase", color: "#ef4444" },
                  Sale: { label: "Sale", color: "#10b981" },
                  Expense: { label: "Expense", color: "#f59e0b" },
                }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{ backgroundColor: "rgba(0, 0, 0, 0.8)", border: "none", borderRadius: "8px" }}
                      formatter={(value: number) => `₹${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Purchase"
                      stroke="#ef4444"
                      name="Purchase"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Sale"
                      stroke="#10b981"
                      name="Sale"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Expense"
                      stroke="#f59e0b"
                      name="Expense"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Summary</CardTitle>
              <CardDescription>Current month financial overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm font-medium">Total Revenue</span>
                  <span className="text-lg font-bold text-green-600">₹{kpis?.totalRevenue.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="text-sm font-medium">Total Expenses</span>
                  <span className="text-lg font-bold text-red-600">₹{kpis?.totalExpenses.toLocaleString() || 0}</span>
                </div>
                <div className={`flex justify-between items-center p-4 rounded-lg border-2 ${
                  (kpis?.profit || 0) >= 0
                    ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                    : "bg-red-50 dark:bg-red-900/20 border-red-500"
                }`}>
                  <span className="text-base font-semibold">Net {(kpis?.profit || 0) >= 0 ? "Profit" : "Loss"}</span>
                  <span className={`text-2xl font-bold ${(kpis?.profit || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ₹{Math.abs(kpis?.profit || 0).toLocaleString()}
                  </span>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  <p>Total Sales: {kpis?.totalSales || 0}</p>
                  <p>Active Vehicles: {kpis?.totalVehicles || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
