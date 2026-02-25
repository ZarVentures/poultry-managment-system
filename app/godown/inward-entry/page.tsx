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

interface GodownInwardEntry {
  id: string
  entryDate: string
  referenceNo: string
  source: string
  cageId: string
  numberOfBirds: number
  weightKg: number
  ratePerKg: number
  amount: number
  notes: string
}

export default function GodownInwardEntryPage() {
  const [entries, setEntries] = useState<GodownInwardEntry[]>([])
  const [mounted, setMounted] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewingEntry, setViewingEntry] = useState<GodownInwardEntry | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>(undefined)
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({
    entryDate: new Date().toISOString().split("T")[0],
    referenceNo: "",
    source: "",
    cageId: "",
    numberOfBirds: "",
    weightKg: "",
    ratePerKg: "",
    notes: "",
  })
  const { startDate, endDate } = useDateFilter()

  const amount = useMemo(() => {
    const weight = Number.parseFloat(formData.weightKg) || 0
    const rate = Number.parseFloat(formData.ratePerKg) || 0
    return weight * rate
  }, [formData.weightKg, formData.ratePerKg])

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("godownInwardEntry")
    if (saved) setEntries(JSON.parse(saved))
    else setEntries([])
  }, [])

  const handleSave = () => {
    if (!formData.entryDate || !formData.referenceNo || !formData.cageId) {
      alert("Please fill required fields (Date, Reference No, Cage ID)")
      return
    }
    const numBirds = Number.parseInt(formData.numberOfBirds) || 0
    const weight = Number.parseFloat(formData.weightKg) || 0
    const rate = Number.parseFloat(formData.ratePerKg) || 0
    const entry: GodownInwardEntry = {
      id: editingId || Date.now().toString(),
      entryDate: formData.entryDate,
      referenceNo: formData.referenceNo,
      source: formData.source,
      cageId: formData.cageId,
      numberOfBirds: numBirds,
      weightKg: weight,
      ratePerKg: rate,
      amount: weight * rate,
      notes: formData.notes,
    }
    const updated = editingId
      ? entries.map((e) => (e.id === editingId ? entry : e))
      : [...entries, entry]
    setEntries(updated)
    localStorage.setItem("godownInwardEntry", JSON.stringify(updated))
    resetForm()
    setShowDialog(false)
  }

  const resetForm = () => {
    setFormData({
      entryDate: new Date().toISOString().split("T")[0],
      referenceNo: "",
      source: "",
      cageId: "",
      numberOfBirds: "",
      weightKg: "",
      ratePerKg: "",
      notes: "",
    })
    setEditingId(null)
  }

  const handleEdit = (entry: GodownInwardEntry) => {
    setEditingId(entry.id)
    setFormData({
      entryDate: entry.entryDate,
      referenceNo: entry.referenceNo,
      source: entry.source,
      cageId: entry.cageId,
      numberOfBirds: entry.numberOfBirds.toString(),
      weightKg: entry.weightKg.toString(),
      ratePerKg: entry.ratePerKg.toString(),
      notes: entry.notes,
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
        const d = new Date(e.entryDate)
        return d >= start && d <= end
      })
    }
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      list = list.filter((e) => {
        const d = new Date(e.entryDate)
        return d >= start && d <= end
      })
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (e) =>
          e.referenceNo.toLowerCase().includes(q) ||
          e.source.toLowerCase().includes(q) ||
          e.cageId.toLowerCase().includes(q)
      )
    }
    return list.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
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
                  <Label>Entry Date *</Label>
                  <Input
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reference No *</Label>
                  <Input
                    value={formData.referenceNo}
                    onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                    placeholder="Chalan / GR No"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Input
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="From where"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cage ID *</Label>
                  <Input
                    value={formData.cageId}
                    onChange={(e) => setFormData({ ...formData, cageId: e.target.value })}
                    placeholder="Cage identifier"
                  />
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
                  <Label>Weight (Kg)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
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
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input readOnly className="bg-muted" value={amount ? `₹${amount.toLocaleString()}` : ""} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Notes</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Optional notes"
                  />
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
                <CardTitle>Inward Entries</CardTitle>
                <CardDescription>List of all godown inward entries</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <DateRangeFilter startDate={dateRangeStart} endDate={dateRangeEnd} onDateRangeChange={handleDateRangeChange} />
                <Input
                  placeholder="Search by reference, source, cage..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[200px]"
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
                    <TableHead>Entry Date</TableHead>
                    <TableHead>Reference No</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Cage ID</TableHead>
                    <TableHead>Birds</TableHead>
                    <TableHead>Weight (Kg)</TableHead>
                    <TableHead>Rate/Kg</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        No inward entries found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEntries.map((entry) => (
                      <TableRow key={entry.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleView(entry)}>
                        <TableCell>{entry.entryDate}</TableCell>
                        <TableCell className="font-medium">{entry.referenceNo}</TableCell>
                        <TableCell>{entry.source || "—"}</TableCell>
                        <TableCell>{entry.cageId}</TableCell>
                        <TableCell>{entry.numberOfBirds}</TableCell>
                        <TableCell>{entry.weightKg}</TableCell>
                        <TableCell>₹{entry.ratePerKg.toLocaleString()}</TableCell>
                        <TableCell>₹{entry.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="icon" onClick={() => handleEdit(entry)}><Edit2 size={16} /></Button>
                          <Button variant="outline" size="icon" onClick={() => handleView(entry)}><Eye size={16} /></Button>
                          <Button variant="outline" size="icon" onClick={() => handleDelete(entry.id)}><Trash2 size={16} /></Button>
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
                <div className="text-muted-foreground">Entry Date</div><div className="font-medium">{viewingEntry.entryDate}</div>
                <div className="text-muted-foreground">Reference No</div><div className="font-medium">{viewingEntry.referenceNo}</div>
                <div className="text-muted-foreground">Source</div><div>{viewingEntry.source || "—"}</div>
                <div className="text-muted-foreground">Cage ID</div><div>{viewingEntry.cageId}</div>
                <div className="text-muted-foreground">Number of Birds</div><div>{viewingEntry.numberOfBirds}</div>
                <div className="text-muted-foreground">Weight (Kg)</div><div>{viewingEntry.weightKg}</div>
                <div className="text-muted-foreground">Rate per Kg</div><div>₹{viewingEntry.ratePerKg.toLocaleString()}</div>
                <div className="text-muted-foreground">Amount</div><div className="font-medium">₹{viewingEntry.amount.toLocaleString()}</div>
                {viewingEntry.notes && (<><div className="text-muted-foreground col-span-2">Notes</div><div className="col-span-2">{viewingEntry.notes}</div></>)}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
