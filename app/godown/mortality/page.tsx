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

interface GodownMortality {
  id: string
  date: string
  referenceNo: string
  cageId: string
  numberOfBirdsDied: number
  cause: string
  notes: string
}

export default function GodownMortalityPage() {
  const [records, setRecords] = useState<GodownMortality[]>([])
  const [mounted, setMounted] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewingRecord, setViewingRecord] = useState<GodownMortality | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>(undefined)
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    referenceNo: "",
    cageId: "",
    numberOfBirdsDied: "",
    cause: "",
    notes: "",
  })
  const { startDate, endDate } = useDateFilter()

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("godownMortality")
    if (saved) setRecords(JSON.parse(saved))
    else setRecords([])
  }, [])

  const handleSave = () => {
    if (!formData.date || !formData.cageId || !formData.numberOfBirdsDied) {
      alert("Please fill required fields (Date, Cage ID, Number of Birds Died)")
      return
    }
    const entry: GodownMortality = {
      id: editingId || Date.now().toString(),
      date: formData.date,
      referenceNo: formData.referenceNo,
      cageId: formData.cageId,
      numberOfBirdsDied: Number.parseInt(formData.numberOfBirdsDied) || 0,
      cause: formData.cause,
      notes: formData.notes,
    }
    const updated = editingId ? records.map((r) => (r.id === editingId ? entry : r)) : [...records, entry]
    setRecords(updated)
    localStorage.setItem("godownMortality", JSON.stringify(updated))
    resetForm()
    setShowDialog(false)
  }

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      referenceNo: "",
      cageId: "",
      numberOfBirdsDied: "",
      cause: "",
      notes: "",
    })
    setEditingId(null)
  }

  const handleEdit = (record: GodownMortality) => {
    setEditingId(record.id)
    setFormData({
      date: record.date,
      referenceNo: record.referenceNo,
      cageId: record.cageId,
      numberOfBirdsDied: record.numberOfBirdsDied.toString(),
      cause: record.cause,
      notes: record.notes,
    })
    setShowDialog(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Delete this mortality record?")) {
      const updated = records.filter((r) => r.id !== id)
      setRecords(updated)
      localStorage.setItem("godownMortality", JSON.stringify(updated))
    }
  }

  const handleView = (record: GodownMortality) => {
    setViewingRecord(record)
    setShowViewDialog(true)
  }

  const filteredRecords = useMemo(() => {
    let list = records
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
        (r) =>
          r.referenceNo.toLowerCase().includes(q) ||
          r.cageId.toLowerCase().includes(q) ||
          r.cause.toLowerCase().includes(q)
      )
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [records, dateRangeStart, dateRangeEnd, startDate, endDate, searchQuery])

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
            <h1 className="text-3xl font-bold">Godown Mortality</h1>
            <p className="text-muted-foreground">Record bird mortality at godown</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2" size={20} />
                Add New Godown Mortality
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Mortality Record" : "Add New Godown Mortality"}</DialogTitle>
                <DialogDescription>Enter mortality details</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Reference No</Label>
                  <Input value={formData.referenceNo} onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })} placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label>Cage ID *</Label>
                  <Input value={formData.cageId} onChange={(e) => setFormData({ ...formData, cageId: e.target.value })} placeholder="Cage identifier" />
                </div>
                <div className="space-y-2">
                  <Label>Number of Birds Died *</Label>
                  <Input type="number" value={formData.numberOfBirdsDied} onChange={(e) => setFormData({ ...formData, numberOfBirdsDied: e.target.value })} placeholder="0" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Cause of Death</Label>
                  <Input value={formData.cause} onChange={(e) => setFormData({ ...formData, cause: e.target.value })} placeholder="Cause" />
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
                <CardTitle>Godown Mortality Records</CardTitle>
                <CardDescription>List of mortality records at godown</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <DateRangeFilter startDate={dateRangeStart} endDate={dateRangeEnd} onDateRangeChange={handleDateRangeChange} />
                <Input placeholder="Search by reference, cage, cause..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-[200px]" />
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
                    <TableHead>Reference No</TableHead>
                    <TableHead>Cage ID</TableHead>
                    <TableHead>Birds Died</TableHead>
                    <TableHead>Cause</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No mortality records found.</TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleView(record)}>
                        <TableCell>{record.date}</TableCell>
                        <TableCell className="font-medium">{record.referenceNo || "—"}</TableCell>
                        <TableCell>{record.cageId}</TableCell>
                        <TableCell>{record.numberOfBirdsDied}</TableCell>
                        <TableCell>{record.cause || "—"}</TableCell>
                        <TableCell className="text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="icon" onClick={() => handleEdit(record)}><Edit2 size={16} /></Button>
                          <Button variant="outline" size="icon" onClick={() => handleView(record)}><Eye size={16} /></Button>
                          <Button variant="outline" size="icon" onClick={() => handleDelete(record.id)}><Trash2 size={16} /></Button>
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
            <DialogHeader><DialogTitle>Mortality Record Details</DialogTitle></DialogHeader>
            {viewingRecord && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-muted-foreground">Date</div><div className="font-medium">{viewingRecord.date}</div>
                <div className="text-muted-foreground">Reference No</div><div>{viewingRecord.referenceNo || "—"}</div>
                <div className="text-muted-foreground">Cage ID</div><div>{viewingRecord.cageId}</div>
                <div className="text-muted-foreground">Number of Birds Died</div><div>{viewingRecord.numberOfBirdsDied}</div>
                <div className="text-muted-foreground">Cause</div><div>{viewingRecord.cause || "—"}</div>
                {viewingRecord.notes && (<><div className="text-muted-foreground col-span-2">Notes</div><div className="col-span-2">{viewingRecord.notes}</div></>)}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
