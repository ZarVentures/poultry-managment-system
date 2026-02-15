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
import { Plus, Edit2, Trash2, AlertTriangle, Package, TrendingDown, Search, X } from "lucide-react"
import { api, InventoryItem } from "@/lib/api"
import { toast } from "sonner"
import { useDateFilter } from "@/contexts/date-filter-context"

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchFilter, setShowSearchFilter] = useState(false)
  const [filterType, setFilterType] = useState<string>("all")
  const [formData, setFormData] = useState({
    itemType: "feed",
    itemName: "",
    quantity: "",
    unit: "kg",
    minimumStockLevel: "",
    currentStockLevel: "",
    notes: "",
  })
  const { startDate, endDate } = useDateFilter()

  useEffect(() => {
    setMounted(true)
    loadInventory()
  }, [])

  const loadInventory = async () => {
    try {
      setLoading(true)
      const data = await api.getInventoryItems()
      setItems(data)
    } catch (error) {
      console.error("Error loading inventory:", error)
      toast.error("Failed to load inventory")
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.itemName || !formData.quantity || !formData.minimumStockLevel || !formData.currentStockLevel) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      const itemData = {
        itemType: formData.itemType,
        itemName: formData.itemName,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        minimumStockLevel: parseFloat(formData.minimumStockLevel),
        currentStockLevel: parseFloat(formData.currentStockLevel),
        notes: formData.notes,
      }

      if (editingId) {
        await api.updateInventoryItem(editingId, itemData)
        toast.success("Inventory item updated successfully")
      } else {
        await api.createInventoryItem(itemData)
        toast.success("Inventory item added successfully")
      }

      await loadInventory()
      resetForm()
      setShowDialog(false)
    } catch (error) {
      console.error("Error saving inventory item:", error)
      toast.error("Failed to save inventory item")
    }
  }

  const resetForm = () => {
    setFormData({
      itemType: "feed",
      itemName: "",
      quantity: "",
      unit: "kg",
      minimumStockLevel: "",
      currentStockLevel: "",
      notes: "",
    })
    setEditingId(null)
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id)
    setFormData({
      itemType: item.itemType,
      itemName: item.itemName,
      quantity: item.quantity.toString(),
      unit: item.unit,
      minimumStockLevel: item.minimumStockLevel.toString(),
      currentStockLevel: item.currentStockLevel.toString(),
      notes: item.notes || "",
    })
    setShowDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this inventory item?")) {
      try {
        await api.deleteInventoryItem(id)
        toast.success("Inventory item deleted successfully")
        await loadInventory()
      } catch (error) {
        console.error("Error deleting inventory item:", error)
        toast.error("Failed to delete inventory item")
      }
    }
  }

  const handleView = (item: InventoryItem) => {
    setViewingItem(item)
    setShowViewDialog(true)
  }

  const isLowStock = (item: InventoryItem) => {
    return item.currentStockLevel <= item.minimumStockLevel
  }

  const getFilteredItems = () => {
    let filtered = items

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(item => item.itemType === filterType)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        item =>
          item.itemName.toLowerCase().includes(query) ||
          item.itemType.toLowerCase().includes(query)
      )
    }

    return filtered
  }

  const lowStockItems = items.filter(isLowStock)
  const filteredItems = getFilteredItems()

  if (!mounted) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Inventory Management</h1>
            <p className="text-muted-foreground">Track stock levels and manage inventory items</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2" size={20} />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Inventory Item" : "Add New Inventory Item"}</DialogTitle>
                <DialogDescription>Enter item details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Item Type *</Label>
                    <Select
                      value={formData.itemType}
                      onValueChange={(value) => setFormData({ ...formData, itemType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="feed">Feed</SelectItem>
                        <SelectItem value="medicine">Medicine</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="supplies">Supplies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Item Name *</Label>
                    <Input
                      value={formData.itemName}
                      onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                      placeholder="Item name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit *</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => setFormData({ ...formData, unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="liters">Liters</SelectItem>
                        <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                        <SelectItem value="bags">Bags</SelectItem>
                        <SelectItem value="bottles">Bottles</SelectItem>
                        <SelectItem value="doses">Doses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Stock Level *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.minimumStockLevel}
                      onChange={(e) => setFormData({ ...formData, minimumStockLevel: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Stock Level *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.currentStockLevel}
                      onChange={(e) => setFormData({ ...formData, currentStockLevel: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes about this item"
                      rows={3}
                    />
                  </div>
                </div>
                <Button onClick={handleSave} className="w-full">
                  {editingId ? "Update" : "Add"} Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package size={16} />
                Total Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? "..." : items.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" />
                Low Stock Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {loading ? "..." : lowStockItems.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown size={16} />
                Feed Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? "..." : items.filter(i => i.itemType === "feed").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Medicine Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? "..." : items.filter(i => i.itemType === "medicine").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {lowStockItems.length > 0 && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardHeader>
              <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle size={20} />
                Low Stock Alert
              </CardTitle>
              <CardDescription className="text-red-600 dark:text-red-300">
                {lowStockItems.length} item(s) are at or below minimum stock level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-white dark:bg-gray-900 rounded">
                    <div>
                      <p className="font-medium">{item.itemName}</p>
                      <p className="text-sm text-muted-foreground capitalize">{item.itemType}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">
                        {item.currentStockLevel} {item.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Min: {item.minimumStockLevel} {item.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Inventory Items</CardTitle>
                <CardDescription>View and manage all inventory items</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="feed">Feed</SelectItem>
                    <SelectItem value="medicine">Medicine</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="supplies">Supplies</SelectItem>
                  </SelectContent>
                </Select>
                {showSearchFilter && (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSearchQuery("")
                        setShowSearchFilter(false)
                      }}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                )}
                {!showSearchFilter && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSearchFilter(true)}
                  >
                    <Search className="mr-2" size={16} />
                    Search
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Min Stock</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Loading inventory...
                      </TableCell>
                    </TableRow>
                  ) : filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        {searchQuery || filterType !== "all" 
                          ? "No items found matching your filters." 
                          : "No inventory items yet. Click \"Add Item\" to get started."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow
                        key={item.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleView(item)}
                      >
                        <TableCell className="font-medium">{item.itemName}</TableCell>
                        <TableCell className="capitalize">{item.itemType}</TableCell>
                        <TableCell className={isLowStock(item) ? "text-red-600 font-bold" : ""}>
                          {item.currentStockLevel}
                        </TableCell>
                        <TableCell>{item.minimumStockLevel}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>
                          {isLowStock(item) ? (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 flex items-center gap-1 w-fit">
                              <AlertTriangle size={12} />
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              In Stock
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="icon" onClick={() => handleEdit(item)}>
                            <Edit2 size={16} />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDelete(item.id)}>
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
              <DialogTitle>Inventory Item Details</DialogTitle>
              <DialogDescription>View complete item information</DialogDescription>
            </DialogHeader>
            {viewingItem && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Item Name</Label>
                    <div className="text-sm font-medium">{viewingItem.itemName}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Type</Label>
                    <div className="text-sm font-medium capitalize">{viewingItem.itemType}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Quantity</Label>
                    <div className="text-sm font-medium">{viewingItem.quantity} {viewingItem.unit}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Unit</Label>
                    <div className="text-sm font-medium">{viewingItem.unit}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Current Stock Level</Label>
                    <div className={`text-sm font-medium ${isLowStock(viewingItem) ? "text-red-600 font-bold" : ""}`}>
                      {viewingItem.currentStockLevel} {viewingItem.unit}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Minimum Stock Level</Label>
                    <div className="text-sm font-medium">{viewingItem.minimumStockLevel} {viewingItem.unit}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Status</Label>
                    <div>
                      {isLowStock(viewingItem) ? (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 flex items-center gap-1 w-fit">
                          <AlertTriangle size={12} />
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Last Updated</Label>
                    <div className="text-sm font-medium">
                      {viewingItem.lastUpdated ? new Date(viewingItem.lastUpdated).toLocaleString() : "N/A"}
                    </div>
                  </div>
                  {viewingItem.notes && (
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-muted-foreground">Notes</Label>
                      <div className="text-sm font-medium whitespace-pre-wrap">{viewingItem.notes}</div>
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
