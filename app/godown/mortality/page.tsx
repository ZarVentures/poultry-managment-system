"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DatePicker } from "@/components/ui/date-picker"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit2, Trash2, X } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { godownApi, type GodownMortality } from "@/lib/api"
import { toast } from "sonner"

export default function GodownMortalityPage() {
  const [mortalities, setMortalities] = useState<GodownMortality[]>([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    mortalityDate: new Date().toISOString().split("T")[0],
    quantity: "",
    unit: "pcs",
    reason: "",
    notes: "",
  })

  useEffect(() => {
    setMounted(true)
    fetchMortalities()
  }, [])

  const fetchMortalities = async () => {
    try {
      setLoading(true)
      const data = await godownApi.mortality.getAll()
      setMortalities(data)
    } catch (error: any) {
      console.error("Failed to fetch mortalities:", error)
      toast.error("Failed to load mortality records")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      mortalityDate: new Date().toISOString().split("T")[0],
      quantity: "",
      unit: "pcs",
      reason: "",
      notes: "",
    })
    setEditingId(null)
  }

  const handleEdit = (mortality: GodownMortality) => {
    setFormData({
      mortalityDate: mortality.mortalityDate,
      quantity: String(mortality.quantity),
      unit: mortality.unit,
      reason: mortality.reason || "",
      notes: mortality.notes || "",
    })
    setEditingId(mortality.id)
    setShowDialog(true)
  }

  const handleSave = async () => {
    if (!formData.quantity) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      setLoading(true)
      const mortalityData = {
        mortalityDate: formData.mortalityDate,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        reason: formData.reason,
        notes: formData.notes,
      }

      if (editingId) {
        await godownApi.mortality.update(editingId, mortalityData)
        toast.success("Mortality record updated successfully")
      } else {
        await godownApi.mortality.create(mortalityData)
        toast.success("Mortality record created successfully")
      }

      await fetchMortalities()
      resetForm()
      setShowDialog(false)
    } catch (error: any) {
      console.error("Failed to save mortality:", error)
      toast.error(error.message || "Failed to save mortality record")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mortality record?")) return

    try {
      setLoading(true)
      await godownApi.mortality.delete(id)
      toast.success("Mortality record deleted successfully")
      await fetchMortalities()
    } catch (error: any) {
      console.error("Failed to delete mortality:", error)
      toast.error("Failed to delete mortality record")
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Godown Mortality</h1>
            <p className="text-muted-foreground">Track mortality in godown</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2" size={20} />
                New Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" aria-describedby="dialog-description">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Mortality Record" : "New Mortality Record"}</DialogTitle>
                <p id="dialog-description" className="sr-only">
                  {editingId ? "Edit godown mortality record" : "Create a new godown mortality record"}
                </p>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <DatePicker
                    value={formData.mortalityDate}
                    onChange={(date) => setFormData({ ...formData, mortalityDate: date })}
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="0"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="pcs, kg"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Input
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Reason for mortality"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes"
                    rows={3}
                    disabled={loading}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1" disabled={loading}>
                    {loading ? "Saving..." : editingId ? "Update" : "Create"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowDialog(false)} disabled={loading}>
                    <X size={20} />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mortality Records</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && mortalities.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : mortalities.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No mortality records found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mortalities.map((mortality) => (
                    <TableRow key={mortality.id}>
                      <TableCell>{new Date(mortality.mortalityDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {mortality.quantity} {mortality.unit}
                      </TableCell>
                      <TableCell>{mortality.reason || "-"}</TableCell>
                      <TableCell>{mortality.notes || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(mortality)}>
                            <Edit2 size={16} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(mortality.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
