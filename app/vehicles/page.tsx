"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit2, Trash2, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { vehiclesApi, type Vehicle as ApiVehicle } from "@/lib/api"
import { toast } from "sonner"

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<ApiVehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    vehicleNumber: "",
    vehicleType: "",
    driverName: "",
    phone: "",
    ownerName: "",
    address: "",
    totalCapacity: "",
    petrolTankCapacity: "",
    mileage: "",
    joinDate: new Date().toISOString().split("T")[0],
    status: "active" as "active" | "inactive",
    note: "",
  })

  useEffect(() => {
    setMounted(true)
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const data = await vehiclesApi.getAll()
      setVehicles(data)
    } catch (error: any) {
      console.error("Failed to fetch vehicles:", error)
      toast.error("Failed to load vehicles")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      vehicleNumber: "",
      vehicleType: "",
      driverName: "",
      phone: "",
      ownerName: "",
      address: "",
      totalCapacity: "",
      petrolTankCapacity: "",
      mileage: "",
      joinDate: new Date().toISOString().split("T")[0],
      status: "active",
      note: "",
    })
    setEditingId(null)
  }

  const handleEdit = (vehicle: ApiVehicle) => {
    setFormData({
      vehicleNumber: vehicle.vehicleNumber,
      vehicleType: vehicle.vehicleType,
      driverName: vehicle.driverName,
      phone: vehicle.phone,
      ownerName: vehicle.ownerName || "",
      address: vehicle.address || "",
      totalCapacity: vehicle.totalCapacity || "",
      petrolTankCapacity: vehicle.petrolTankCapacity || "",
      mileage: vehicle.mileage || "",
      joinDate: vehicle.joinDate,
      status: vehicle.status,
      note: vehicle.note || "",
    })
    setEditingId(vehicle.id)
    setShowDialog(true)
  }

  const handleSave = async () => {
    if (!formData.vehicleNumber || !formData.vehicleType || !formData.driverName || !formData.phone) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      setLoading(true)

      if (editingId) {
        await vehiclesApi.update(editingId, formData)
        toast.success("Vehicle updated successfully")
      } else {
        await vehiclesApi.create(formData)
        toast.success("Vehicle created successfully")
      }

      await fetchVehicles()
      resetForm()
      setShowDialog(false)
    } catch (error: any) {
      console.error("Failed to save vehicle:", error)
      toast.error(editingId ? "Failed to update vehicle" : "Failed to create vehicle")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return

    try {
      setLoading(true)
      await vehiclesApi.delete(id)
      toast.success("Vehicle deleted successfully")
      await fetchVehicles()
    } catch (error: any) {
      console.error("Failed to delete vehicle:", error)
      toast.error("Failed to delete vehicle")
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
            <h1 className="text-3xl font-bold">Vehicles</h1>
            <p className="text-muted-foreground">Manage your fleet vehicles</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2" size={20} />
                New Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Vehicle" : "New Vehicle"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vehicle Number *</Label>
                    <Input
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                      placeholder="Vehicle number"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vehicle Type *</Label>
                    <Select
                      value={formData.vehicleType}
                      onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Truck">Truck</SelectItem>
                        <SelectItem value="Mini Truck">Mini Truck</SelectItem>
                        <SelectItem value="Pickup Van">Pickup Van</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Driver Name *</Label>
                    <Input
                      value={formData.driverName}
                      onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                      placeholder="Driver name"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone *</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Phone number"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Owner Name</Label>
                    <Input
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      placeholder="Owner name"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Join Date *</Label>
                    <Input
                      type="date"
                      value={formData.joinDate}
                      onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Address"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Total Capacity</Label>
                    <Input
                      value={formData.totalCapacity}
                      onChange={(e) => setFormData({ ...formData, totalCapacity: e.target.value })}
                      placeholder="Capacity"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Petrol Tank</Label>
                    <Input
                      value={formData.petrolTankCapacity}
                      onChange={(e) => setFormData({ ...formData, petrolTankCapacity: e.target.value })}
                      placeholder="Tank capacity"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mileage</Label>
                    <Input
                      value={formData.mileage}
                      onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                      placeholder="Mileage"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
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
            <CardTitle>Vehicles List</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && vehicles.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : vehicles.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No vehicles found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle No</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.vehicleNumber}</TableCell>
                      <TableCell>{vehicle.vehicleType}</TableCell>
                      <TableCell>{vehicle.driverName}</TableCell>
                      <TableCell>{vehicle.phone}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            vehicle.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {vehicle.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(vehicle)}>
                            <Edit2 size={16} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(vehicle.id)}>
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
