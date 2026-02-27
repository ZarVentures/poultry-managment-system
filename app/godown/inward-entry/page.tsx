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

interface Vehicle {
  id: string
  vehicleNumber: string
  vehicleType: string
  driverName: string
  phone: string
  status: "active" | "inactive"
}

interface GodownInwardEntry {
  id: string
  date: string
  purchaseInvoiceNo: string
  sourceVehicleNo: string
  driverName: string
  birdType: string
  numberOfCages: number
  numberOfBirds: number
  totalWeight: number
  mortality: number
  transferNote: string
}

export default function GodownInwardEntryPage() {
  const [entries, setEntries] = useState<GodownInwardEntry[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [mounted, setMounted] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewingEntry, setViewingEntry] = useState<GodownInwardEntry | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>(undefined)
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    purchaseInvoiceNo: "",
    sourceVehicleNo: "",
    driverName: "",
    birdType: "",
    numberOfCages: "",
    numberOfBirds: "",
    totalWeight: "",
    mortality: "",
    transferNote: "",
  })
  const { startDate, endDate } = useDateFilter()

  const totalBirds = useMemo(() => {
    return Number.parseInt(formData.numberOfBirds) || 0
  }, [formData.numberOfBirds])

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("godownInwardEntry")
    if (saved) {
      setEntries(JSON.parse(saved))
    } else {
      setEntries([])
    }

    const savedVehicles = localStorage.getItem("vehicles")
    if (savedVehicles) {
      try {
        const parsed: Vehicle[] = JSON.parse(savedVehicles)
        setVehicles(parsed.filter((v) => v.status === "active"))
      } catch {
        setVehicles([])
      }
    }
  }, [])

  const handleSave = () => {
    if (!formData.date || !formData.purchaseInvoiceNo || !formData.sourceVehicleNo) {
      alert("Please fill required fields (Date, Purchase Invoice No, Source Vehicle No)")
      return
    }

    const entry: GodownInwardEntry = {
      id: editingId || Date.now().toString(),
      date: formData.date,
      purchaseInvoiceNo: formData.purchaseInvoiceNo,
      sourceVehicleNo: formData.sourceVehicleNo,
      driverName: formData.driverName,
      birdType: formData.birdType,
      numberOfCages: Number.parseInt(formData.numberOfCages) || 0,
      numberOfBirds: Number.parseInt(formData.numberOfBirds) || 0,
      totalWeight: Number.parseFloat(formData.totalWeight) || 0,
      mortality: Number.parseInt(formData.mortality) || 0,
      transferNote: formData.transferNote,
    }

    const updated = editingId ? entries.map((e) => (e.id === editingId ? entry : e)) : [...entries, entry]
    setEntries(updated)
    localStorage.setItem("godownInwardEntry", JSON.stringify(updated))
    resetForm()
    setShowDialog(false)
  }

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      purchaseInvoiceNo: "",
      sourceVehicleNo: "",
      driverName: "",
      birdType: "",
      numberOfCages: "",
      numberOfBirds: "",
      totalWeight: "",
      mortality: "",
      transferNote: "",
    })
    setEditingId(null)
  }

  const handleEdit = (entry: GodownInwardEntry) => {
    setEditingId(entry.id)
    setFormData({
      date: entry.date,
      purchaseInvoiceNo: entry.purchaseInvoiceNo,
      sourceVehicleNo: entry.sourceVehicleNo,
      driverName: entry.driverName,
      birdType: entry.birdType,
      numberOfCages: entry.numberOfCages.toString(),
      numberOfBirds: entry.numberOfBirds.toString(),
      totalWeight: entry.totalWeight.toString(),
      mortality: entry.mortality ? entry.mortality.toString() : "",
      transferNote: entry.transferNote,
    })
    setShowDialog(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Delete this inward entry?")) {
      const updated = entries.filter((e) => e.id !== id)
      setEntries(updated)
      localStorage.setItem("godownInwardEntry", JSON.stringify(updated))
    }
  }

  const handleView = (entry: GodownInwardEntry) => {
    setViewingEntry(entry)
    setShowViewDialog(true)
  }

  const filteredEntries = useMemo(() => {
    let list = entries
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
          e.purchaseInvoiceNo.toLowerCase().includes(q) ||
          e.sourceVehicleNo.toLowerCase().includes(q) ||
          e.driverName.toLowerCase().includes(q) ||
          e.birdType.toLowerCase().includes(q),
      )
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [entries, dateRangeStart, dateRangeEnd, startDate, endDate, searchQuery])

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
            <h1 className="text-3xl font-bold">Godown Inward Entry</h1>
            <p className="text-muted-foreground">Record stock received into godown</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2" size={20} />
                Add New Inward Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Inward Entry" : "Add New Inward Entry"}</DialogTitle>
                <DialogDescription>Enter inward entry details</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Purchase Invoice No</Label>
                  <Input
                    value={formData.purchaseInvoiceNo}
                    onChange={(e) => setFormData({ ...formData, purchaseInvoiceNo: e.target.value })}
                    placeholder="Enter purchase invoice number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Source Vehicle No</Label>
                  <Select
                    value={formData.sourceVehicleNo}
                    onValueChange={(value) => {
                      const vehicle = vehicles.find((v) => v.vehicleNumber === value)
                      setFormData({
                        ...formData,
                        sourceVehicleNo: value,
                        driverName: vehicle?.driverName || formData.driverName,
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.length === 0 ? (
                        <SelectItem value="" disabled>
                          No active vehicles found
                        </SelectItem>
                      ) : (
                        vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.vehicleNumber}>
                            {vehicle.vehicleNumber}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Driver Name</Label>
                  <Select
                    value={formData.driverName}
                    onValueChange={(value) => setFormData({ ...formData, driverName: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.length === 0 ? (
                        <SelectItem value="" disabled>
                          No drivers found
                        </SelectItem>
                      ) : (
                        vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.driverName}>
                            {vehicle.driverName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Bird Type</Label>
                  <Select
                    value={formData.birdType}
                    onValueChange={(value) => setFormData({ ...formData, birdType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bird type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Broiler">Broiler</SelectItem>
                      <SelectItem value="Layer">Layer</SelectItem>
                      <SelectItem value="Desi">Desi</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>No of Cages</Label>
                  <Input
                    type="number"
                    value={formData.numberOfCages}
                    onChange={(e) => setFormData({ ...formData, numberOfCages: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>No of Bird (Qty)</Label>
                  <Input
                    type="number"
                    value={formData.numberOfBirds}
                    onChange={(e) => setFormData({ ...formData, numberOfBirds: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Weight</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.totalWeight}
                    onChange={(e) => setFormData({ ...formData, totalWeight: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mortality (if any)</Label>
                  <Input
                    type="number"
                    value={formData.mortality}
                    onChange={(e) => setFormData({ ...formData, mortality: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Transfer Note</Label>
                  <Input
                    value={formData.transferNote}
                    onChange={(e) => setFormData({ ...formData, transferNote: e.target.value })}
                    placeholder="Any transfer notes"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-muted-foreground">
                  Total Birds: <span className="font-medium">{totalBirds || 0}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>{editingId ? "Update" : "Save"}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Inward Entries</CardTitle>
                <CardDescription>List of all godown inward entries</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <DateRangeFilter
                  startDate={dateRangeStart}
                  endDate={dateRangeEnd}
                  onDateRangeChange={handleDateRangeChange}
                />
                <Input
                  placeholder="Search by invoice, vehicle, driver, bird type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[260px]"
                />
                {searchQuery && (
                  <Button variant="ghost" size="icon" onClick={() => setSearchQuery("")}>
                    <X size={16} />
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="mr-2" size={16} />
                  Print
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Purchase Invoice No</TableHead>
                    <TableHead>Source Vehicle No</TableHead>
                    <TableHead>Driver Name</TableHead>
                    <TableHead>Bird Type</TableHead>
                    <TableHead>No of Cages</TableHead>
                    <TableHead>No of Bird (Qty)</TableHead>
                    <TableHead>Total Weight</TableHead>
                    <TableHead>Mortality (if any)</TableHead>
                    <TableHead>Transfer Note</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                        No inward entries found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEntries.map((entry) => (
                      <TableRow
                        key={entry.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleView(entry)}
                      >
                        <TableCell>{entry.date}</TableCell>
                        <TableCell className="font-medium">{entry.purchaseInvoiceNo || "—"}</TableCell>
                        <TableCell>{entry.sourceVehicleNo || "—"}</TableCell>
                        <TableCell>{entry.driverName || "—"}</TableCell>
                        <TableCell>{entry.birdType || "—"}</TableCell>
                        <TableCell>{entry.numberOfCages || 0}</TableCell>
                        <TableCell>{entry.numberOfBirds || 0}</TableCell>
                        <TableCell>{entry.totalWeight || 0}</TableCell>
                        <TableCell>{entry.mortality || 0}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={entry.transferNote}>
                          {entry.transferNote || "—"}
                        </TableCell>
                        <TableCell
                          className="text-right space-x-2"
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                        >
                          <Button variant="outline" size="icon" onClick={() => handleEdit(entry)}>
                            <Edit2 size={16} />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleView(entry)}>
                            <Eye size={16} />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDelete(entry.id)}>
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

        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Inward Entry Details</DialogTitle>
            </DialogHeader>
            {viewingEntry && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-muted-foreground">Date</div>
                <div className="font-medium">{viewingEntry.date}</div>
                <div className="text-muted-foreground">Purchase Invoice No</div>
                <div>{viewingEntry.purchaseInvoiceNo || "—"}</div>
                <div className="text-muted-foreground">Source Vehicle No</div>
                <div>{viewingEntry.sourceVehicleNo || "—"}</div>
                <div className="text-muted-foreground">Driver Name</div>
                <div>{viewingEntry.driverName || "—"}</div>
                <div className="text-muted-foreground">Bird Type</div>
                <div>{viewingEntry.birdType || "—"}</div>
                <div className="text-muted-foreground">No of Cages</div>
                <div>{viewingEntry.numberOfCages || 0}</div>
                <div className="text-muted-foreground">No of Bird (Qty)</div>
                <div>{viewingEntry.numberOfBirds || 0}</div>
                <div className="text-muted-foreground">Total Weight</div>
                <div>{viewingEntry.totalWeight || 0}</div>
                <div className="text-muted-foreground">Mortality (if any)</div>
                <div>{viewingEntry.mortality || 0}</div>
                {viewingEntry.transferNote && (
                  <>
                    <div className="text-muted-foreground col-span-2">Transfer Note</div>
                    <div className="col-span-2">{viewingEntry.transferNote}</div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
