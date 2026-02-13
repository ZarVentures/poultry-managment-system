"use client"

import { useState, useEffect, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Search, X, Download, Printer } from "lucide-react"
import { DateRangeFilter } from "@/components/date-range-filter"

interface Vehicle {
  id: string
  vehicleNumber: string
  vehicleType: string
  driverName: string
  phone: string
  ownerName?: string
  address?: string
  totalCapacity: string
  petrolTankCapacity: string
  mileage: string
  joinDate: string
  status: "active" | "inactive"
  note?: string
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [mounted, setMounted] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>(undefined)
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>(undefined)
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
    const savedVehicles = localStorage.getItem("vehicles")
    if (savedVehicles) {
      const parsed = JSON.parse(savedVehicles)
      // Add new fields for backward compatibility
      const vehiclesWithFields = parsed.map((vehicle: Vehicle) => ({
        ...vehicle,
        status: vehicle.status || "active",
        totalCapacity: vehicle.totalCapacity || vehicle.capacity || "",
        petrolTankCapacity: vehicle.petrolTankCapacity || "",
        mileage: vehicle.mileage || "",
      }))
      setVehicles(vehiclesWithFields)
      // Update localStorage with new fields
      localStorage.setItem("vehicles", JSON.stringify(vehiclesWithFields))
    } else {
      setVehicles([])
    }
  }, [])

  const handleSave = () => {
    if (!formData.vehicleNumber || !formData.vehicleType || !formData.driverName || !formData.phone) {
      alert("Please fill all required fields")
      return
    }

    if (editingId) {
      const updated = vehicles.map((vehicle) =>
        vehicle.id === editingId
          ? {
              ...vehicle,
              vehicleNumber: formData.vehicleNumber,
              vehicleType: formData.vehicleType,
              driverName: formData.driverName,
              phone: formData.phone,
              ownerName: formData.ownerName,
              address: formData.address,
              totalCapacity: formData.totalCapacity,
              petrolTankCapacity: formData.petrolTankCapacity,
              mileage: formData.mileage,
              joinDate: formData.joinDate,
              status: formData.status,
              note: formData.note,
            }
          : vehicle,
      )
      setVehicles(updated)
      localStorage.setItem("vehicles", JSON.stringify(updated))
    } else {
      const newVehicle: Vehicle = {
        id: Date.now().toString(),
        vehicleNumber: formData.vehicleNumber,
        vehicleType: formData.vehicleType,
        driverName: formData.driverName,
        phone: formData.phone,
        ownerName: formData.ownerName,
        address: formData.address,
        totalCapacity: formData.totalCapacity,
        petrolTankCapacity: formData.petrolTankCapacity,
        mileage: formData.mileage,
        joinDate: formData.joinDate,
        status: formData.status,
        note: formData.note,
      }
      const updated = [...vehicles, newVehicle]
      setVehicles(updated)
      localStorage.setItem("vehicles", JSON.stringify(updated))
    }

    resetForm()
    setShowDialog(false)
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
      status: "active" as "active" | "inactive",
      note: "",
    })
    setEditingId(null)
  }

  const handleEdit = (vehicle: Vehicle) => {
    setEditingId(vehicle.id)
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
      joinDate: vehicle.joinDate || new Date().toISOString().split("T")[0],
      status: vehicle.status || "active",
      note: vehicle.note || "",
    })
    setShowDialog(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      const updated = vehicles.filter((vehicle) => vehicle.id !== id)
      setVehicles(updated)
      localStorage.setItem("vehicles", JSON.stringify(updated))
    }
  }

  const handleView = (vehicle: Vehicle) => {
    setViewingVehicle(vehicle)
    setShowViewDialog(true)
  }

  const handleSort = () => {
    if (sortOrder === null) {
      setSortOrder("asc")
    } else if (sortOrder === "asc") {
      setSortOrder("desc")
    } else {
      setSortOrder(null)
    }
  }

  const getFilteredAndSortedVehicles = () => {
    let filtered = vehicles

    // Apply date range filter
    if (dateRangeStart && dateRangeEnd) {
      const start = new Date(dateRangeStart)
      const end = new Date(dateRangeEnd)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)

      filtered = filtered.filter((vehicle) => {
        if (!vehicle.joinDate) return false
        const joinDate = new Date(vehicle.joinDate)
        joinDate.setHours(0, 0, 0, 0)
        return joinDate >= start && joinDate <= end
      })
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.driverName.toLowerCase().includes(query) ||
          vehicle.vehicleNumber.toLowerCase().includes(query),
      )
    }

    // Apply sorting
    if (sortOrder) {
      filtered = [...filtered].sort((a, b) => {
        const nameA = a.driverName.toLowerCase()
        const nameB = b.driverName.toLowerCase()
        if (sortOrder === "asc") {
          return nameA.localeCompare(nameB)
        } else {
          return nameB.localeCompare(nameA)
        }
      })
    }

    return filtered
  }

  const filteredVehicles = useMemo(() => getFilteredAndSortedVehicles(), [vehicles, dateRangeStart, dateRangeEnd, searchQuery, sortOrder])

  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    setDateRangeStart(start)
    setDateRangeEnd(end)
  }

  const handleDownloadPDF = () => {
    const filtered = getFilteredAndSortedVehicles()
    
    // Create a printable HTML content
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vehicles Report</title>
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
            <h1>Vehicles List Report</h1>
            ${dateRangeStart && dateRangeEnd ? `<div class="date-range"><strong>Date Range:</strong> ${dateRangeStart.toLocaleDateString()} - ${dateRangeEnd.toLocaleDateString()}</div>` : ''}
            <div><strong>Total Vehicles:</strong> ${filtered.length}</div>
            <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Vehicle No</th>
                <th>Vehicle Type</th>
                <th>Owner Name</th>
                <th>Driver Name</th>
                <th>Phone</th>
                <th>Join Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(vehicle => `
                <tr>
                  <td>${vehicle.vehicleNumber}</td>
                  <td>${vehicle.vehicleType}</td>
                  <td>${vehicle.ownerName || "N/A"}</td>
                  <td>${vehicle.driverName}</td>
                  <td>${vehicle.phone}</td>
                  <td>${vehicle.joinDate || "N/A"}</td>
                  <td>${(vehicle.status || "active") === "active" ? "Active" : "Inactive"}</td>
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

  const handlePrintReport = () => {
    const filtered = getFilteredAndSortedVehicles()
    
    // Create a printable HTML content
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vehicles Report</title>
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
            <h1>Vehicles List Report</h1>
            ${dateRangeStart && dateRangeEnd ? `<div class="date-range"><strong>Date Range:</strong> ${dateRangeStart.toLocaleDateString()} - ${dateRangeEnd.toLocaleDateString()}</div>` : ''}
            <div><strong>Total Vehicles:</strong> ${filtered.length}</div>
            <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Vehicle No</th>
                <th>Vehicle Type</th>
                <th>Owner Name</th>
                <th>Driver Name</th>
                <th>Phone</th>
                <th>Join Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(vehicle => `
                <tr>
                  <td>${vehicle.vehicleNumber}</td>
                  <td>${vehicle.vehicleType}</td>
                  <td>${vehicle.ownerName || "N/A"}</td>
                  <td>${vehicle.driverName}</td>
                  <td>${vehicle.phone}</td>
                  <td>${vehicle.joinDate || "N/A"}</td>
                  <td>${(vehicle.status || "active") === "active" ? "Active" : "Inactive"}</td>
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

  if (!mounted) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Vehicles Management</h1>
            <p className="text-muted-foreground">Manage all vehicles and their information</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2" size={20} />
                Add New Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
                <DialogDescription>Enter vehicle details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vehicle Number *</Label>
                    <Input
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                      placeholder="Vehicle registration number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vehicle Type *</Label>
                    <Select
                      value={formData.vehicleType}
                      onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Truck">Truck</SelectItem>
                        <SelectItem value="Mini Truck">Mini Truck</SelectItem>
                        <SelectItem value="Pickup Van">Pickup Van</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Driver Name *</Label>
                    <Input
                      value={formData.driverName}
                      onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                      placeholder="Driver name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone *</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Join Date *</Label>
                    <Input
                      type="date"
                      value={formData.joinDate}
                      onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
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
                    <Label>Total Cage Capacity</Label>
                    <Select
                      value={formData.totalCapacity}
                      onValueChange={(value) => setFormData({ ...formData, totalCapacity: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select cage capacity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="42">42</SelectItem>
                        <SelectItem value="130">130</SelectItem>
                        <SelectItem value="240">240</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Petrol Tank Capacity</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.petrolTankCapacity}
                      onChange={(e) => setFormData({ ...formData, petrolTankCapacity: e.target.value })}
                      placeholder="Tank capacity (liters)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Owner Name</Label>
                    <Input
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      placeholder="Owner name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Vehicle address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mileage</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.mileage}
                      onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                      placeholder="Mileage (km/liter)"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="Additional notes about the vehicle"
                      rows={3}
                    />
                  </div>
                </div>
                <Button onClick={handleSave} className="w-full">
                  {editingId ? "Update" : "Add"} Vehicle
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Vehicles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-3">{vehicles.length}</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Truck:</span>
                  <span className="font-medium">{vehicles.filter((v) => v.vehicleType === "Truck").length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mini Truck:</span>
                  <span className="font-medium">{vehicles.filter((v) => v.vehicleType === "Mini Truck").length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pickup Van:</span>
                  <span className="font-medium">{vehicles.filter((v) => v.vehicleType === "Pickup Van").length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Vehicles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-3">
                {vehicles.filter((v) => (v.status || "active") === "active").length}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Truck:</span>
                  <span className="font-medium">
                    {vehicles.filter((v) => v.vehicleType === "Truck" && (v.status || "active") === "active").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mini Truck:</span>
                  <span className="font-medium">
                    {vehicles.filter((v) => v.vehicleType === "Mini Truck" && (v.status || "active") === "active").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pickup Van:</span>
                  <span className="font-medium">
                    {vehicles.filter((v) => v.vehicleType === "Pickup Van" && (v.status || "active") === "active").length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inactive Vehicles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-3">
                {vehicles.filter((v) => (v.status || "active") === "inactive").length}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Truck:</span>
                  <span className="font-medium">
                    {vehicles.filter((v) => v.vehicleType === "Truck" && (v.status || "active") === "inactive").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mini Truck:</span>
                  <span className="font-medium">
                    {vehicles.filter((v) => v.vehicleType === "Mini Truck" && (v.status || "active") === "inactive").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pickup Van:</span>
                  <span className="font-medium">
                    {vehicles.filter((v) => v.vehicleType === "Pickup Van" && (v.status || "active") === "inactive").length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Vehicles List</CardTitle>
                <CardDescription>View and manage all vehicles</CardDescription>
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
                      placeholder="Search by driver name or vehicle number..."
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
                    <TableHead>Vehicle No</TableHead>
                    <TableHead>Vehicle Type</TableHead>
                    <TableHead>Owner Name</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 lg:px-3"
                        onClick={handleSort}
                      >
                        Driver Name
                        {sortOrder === null && <ArrowUpDown className="ml-2 h-4 w-4" />}
                        {sortOrder === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
                        {sortOrder === "desc" && <ArrowDown className="ml-2 h-4 w-4" />}
                      </Button>
                    </TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        {searchQuery || (dateRangeStart && dateRangeEnd) ? "No vehicles found matching your filters." : "No vehicles added yet. Click \"Add New Vehicle\" to get started."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVehicles.map((vehicle) => (
                      <TableRow 
                        key={vehicle.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleView(vehicle)}
                      >
                        <TableCell className="font-medium">{vehicle.vehicleNumber}</TableCell>
                        <TableCell>{vehicle.vehicleType}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{vehicle.ownerName || "N/A"}</TableCell>
                        <TableCell>{vehicle.driverName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{vehicle.phone}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{vehicle.joinDate}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              vehicle.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {vehicle.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="icon" onClick={() => handleEdit(vehicle)}>
                            <Edit2 size={16} />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDelete(vehicle.id)}>
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
              <DialogTitle>Vehicle Details</DialogTitle>
              <DialogDescription>View complete vehicle information</DialogDescription>
            </DialogHeader>
            {viewingVehicle && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Vehicle Number</Label>
                    <div className="text-sm font-medium">{viewingVehicle.vehicleNumber}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Vehicle Type</Label>
                    <div className="text-sm font-medium">{viewingVehicle.vehicleType}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Driver Name</Label>
                    <div className="text-sm font-medium">{viewingVehicle.driverName}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Phone</Label>
                    <div className="text-sm font-medium">{viewingVehicle.phone}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Owner Name</Label>
                    <div className="text-sm font-medium">{viewingVehicle.ownerName || "N/A"}</div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-muted-foreground">Address</Label>
                    <div className="text-sm font-medium">{viewingVehicle.address || "N/A"}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Total Cage Capacity</Label>
                    <div className="text-sm font-medium">{viewingVehicle.totalCapacity || "N/A"}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Petrol Tank Capacity</Label>
                    <div className="text-sm font-medium">{viewingVehicle.petrolTankCapacity || "N/A"}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Mileage</Label>
                    <div className="text-sm font-medium">{viewingVehicle.mileage || "N/A"}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Join Date</Label>
                    <div className="text-sm font-medium">{viewingVehicle.joinDate}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Status</Label>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        viewingVehicle.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {viewingVehicle.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  {viewingVehicle.note && (
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-muted-foreground">Notes</Label>
                      <div className="text-sm font-medium whitespace-pre-wrap">{viewingVehicle.note}</div>
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

