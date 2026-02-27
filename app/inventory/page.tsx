"use client"

import { useState, useEffect, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Bird, FileText, Calendar, AlertCircle, Percent } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const GODOWN_CAPACITY_KEY = "godownCapacity"
const DEFAULT_CAPACITY = 10000

interface GodownInwardEntry {
  id: string
  date: string
  purchaseInvoiceNo: string
  numberOfBirds: number
  [key: string]: unknown
}

interface GodownSale {
  id: string
  numberOfBirds: number
  [key: string]: unknown
}

interface GodownMortality {
  id: string
  numberOfBirdsDied: number
  [key: string]: unknown
}

interface LegacyGodownItem {
  noOfBirds: number
  [key: string]: unknown
}

export default function InventoryPage() {
  const [mounted, setMounted] = useState(false)
  const [inwardEntries, setInwardEntries] = useState<GodownInwardEntry[]>([])
  const [sales, setSales] = useState<GodownSale[]>([])
  const [mortalities, setMortalities] = useState<GodownMortality[]>([])
  const [legacyItems, setLegacyItems] = useState<LegacyGodownItem[]>([])
  const [capacity, setCapacity] = useState(DEFAULT_CAPACITY)
  const [capacityInput, setCapacityInput] = useState("")

  useEffect(() => {
    setMounted(true)
    const inward = localStorage.getItem("godownInwardEntry")
    if (inward) {
      try {
        setInwardEntries(Array.isArray(JSON.parse(inward)) ? JSON.parse(inward) : [])
      } catch {
        setInwardEntries([])
      }
    } else setInwardEntries([])

    const saleData = localStorage.getItem("godownSale")
    if (saleData) {
      try {
        setSales(Array.isArray(JSON.parse(saleData)) ? JSON.parse(saleData) : [])
      } catch {
        setSales([])
      }
    } else setSales([])

    const mortData = localStorage.getItem("godownMortality")
    if (mortData) {
      try {
        setMortalities(Array.isArray(JSON.parse(mortData)) ? JSON.parse(mortData) : [])
      } catch {
        setMortalities([])
      }
    } else setMortalities([])

    const godown = localStorage.getItem("godown")
    if (godown) {
      try {
        const parsed = JSON.parse(godown)
        setLegacyItems(Array.isArray(parsed) ? parsed : [])
      } catch {
        setLegacyItems([])
      }
    } else setLegacyItems([])

    const cap = localStorage.getItem(GODOWN_CAPACITY_KEY)
    if (cap) {
      const n = Number.parseInt(cap, 10)
      if (!Number.isNaN(n) && n > 0) {
        setCapacity(n)
        setCapacityInput(String(n))
      }
    } else {
      setCapacityInput(String(DEFAULT_CAPACITY))
    }
  }, [])

  const handleSaveCapacity = () => {
    const n = Number.parseInt(capacityInput, 10)
    if (Number.isNaN(n) || n < 0) return
    setCapacity(n)
    localStorage.setItem(GODOWN_CAPACITY_KEY, String(n))
  }

  const totalInwardBirds = useMemo(
    () =>
      inwardEntries.reduce((sum, e) => sum + (Number(e.numberOfBirds) || 0), 0) +
      legacyItems.reduce((sum, i) => sum + (Number(i.noOfBirds) || 0), 0),
    [inwardEntries, legacyItems]
  )

  const totalSoldBirds = useMemo(
    () => sales.reduce((sum, s) => sum + (Number(s.numberOfBirds) || 0), 0),
    [sales]
  )

  const totalMortality = useMemo(
    () => mortalities.reduce((sum, m) => sum + (Number(m.numberOfBirdsDied) || 0), 0),
    [mortalities]
  )

  const totalBirdsAvailable = useMemo(
    () => Math.max(0, totalInwardBirds - totalSoldBirds - totalMortality),
    [totalInwardBirds, totalSoldBirds, totalMortality]
  )

  const stockByInvoice = useMemo(() => {
    const map: Record<string, number> = {}
    inwardEntries.forEach((e) => {
      const inv = e.purchaseInvoiceNo?.trim() || "—"
      map[inv] = (map[inv] || 0) + (Number(e.numberOfBirds) || 0)
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [inwardEntries])

  const ageOfBirdsDays = useMemo(() => {
    if (inwardEntries.length === 0) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let totalDays = 0
    let count = 0
    inwardEntries.forEach((e) => {
      if (e.date) {
        const d = new Date(e.date)
        d.setHours(0, 0, 0, 0)
        totalDays += Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
        count += 1
      }
    })
    if (count === 0) return null
    return Math.round(totalDays / count)
  }, [inwardEntries])

  const capacityUtilizationPercent = useMemo(() => {
    if (capacity <= 0) return 0
    return Math.min(100, Math.round((totalBirdsAvailable / capacity) * 100))
  }, [totalBirdsAvailable, capacity])

  if (!mounted) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Godown Overview</h1>
          <p className="text-muted-foreground">Current status and capacity overview</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Godown Capacity</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{capacity.toLocaleString()}</div>
              <div className="flex gap-2 mt-2">
                <Input
                  type="number"
                  min={0}
                  value={capacityInput}
                  onChange={(e) => setCapacityInput(e.target.value)}
                  placeholder="Max birds"
                  className="h-8 text-sm"
                />
                <Button size="sm" className="h-8" onClick={handleSaveCapacity}>Set</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Birds Available</CardTitle>
              <Bird className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBirdsAvailable.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Inward − Sales − Mortality</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mortality</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMortality.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total birds died (godown mortality)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Age of Birds (Days in Godown)</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ageOfBirdsDays !== null ? `${ageOfBirdsDays} days` : "—"}
              </div>
              <p className="text-xs text-muted-foreground">Average days since inward entry</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Capacity Utilization</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{capacityUtilizationPercent}%</div>
              <p className="text-xs text-muted-foreground">
                {totalBirdsAvailable.toLocaleString()} / {capacity.toLocaleString()} birds
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Purchase Invoice No. wise stock
            </CardTitle>
            <CardDescription>Birds received per purchase invoice (from godown inward entries)</CardDescription>
          </CardHeader>
          <CardContent>
            {stockByInvoice.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No inward entries yet. Add entries from Godown Inward Entry.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {stockByInvoice.map(([invoiceNo, birds]) => (
                  <div
                    key={invoiceNo}
                    className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
                  >
                    <div className="text-xs font-medium text-muted-foreground truncate" title={invoiceNo}>
                      {invoiceNo || "—"}
                    </div>
                    <div className="text-xl font-bold mt-1">{Number(birds).toLocaleString()} birds</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
