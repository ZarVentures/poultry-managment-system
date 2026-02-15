// Utility functions for exporting data to CSV and JSON

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
) {
  if (data.length === 0) {
    throw new Error('No data to export')
  }

  // Determine columns
  const cols = columns || Object.keys(data[0]).map(key => ({ key, label: key }))

  // Create CSV header
  const header = cols.map(col => col.label).join(',')

  // Create CSV rows
  const rows = data.map(row => {
    return cols.map(col => {
      const value = row[col.key]
      // Handle different value types
      if (value === null || value === undefined) return ''
      if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains comma or newline
        const escaped = value.replace(/"/g, '""')
        return escaped.includes(',') || escaped.includes('\n') ? `"${escaped}"` : escaped
      }
      if (value instanceof Date) {
        return value.toISOString()
      }
      return String(value)
    }).join(',')
  })

  // Combine header and rows
  const csv = [header, ...rows].join('\n')

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToJSON<T>(data: T[], filename: string) {
  if (data.length === 0) {
    throw new Error('No data to export')
  }

  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.json`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function formatDateForExport(date: string | Date | undefined | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

export function formatCurrencyForExport(amount: number | undefined | null): string {
  if (amount === null || amount === undefined) return '0'
  return amount.toFixed(2)
}

// Export presets for common data types
export const exportPresets = {
  farmers: {
    columns: [
      { key: 'name' as const, label: 'Name' },
      { key: 'phone' as const, label: 'Phone' },
      { key: 'email' as const, label: 'Email' },
      { key: 'address' as const, label: 'Address' },
      { key: 'notes' as const, label: 'Notes' },
      { key: 'createdAt' as const, label: 'Created Date' },
    ]
  },
  retailers: {
    columns: [
      { key: 'name' as const, label: 'Shop Name' },
      { key: 'ownerName' as const, label: 'Owner Name' },
      { key: 'phone' as const, label: 'Phone' },
      { key: 'email' as const, label: 'Email' },
      { key: 'address' as const, label: 'Address' },
      { key: 'notes' as const, label: 'Notes' },
      { key: 'createdAt' as const, label: 'Created Date' },
    ]
  },
  sales: {
    columns: [
      { key: 'invoiceNumber' as const, label: 'Invoice #' },
      { key: 'customerName' as const, label: 'Customer' },
      { key: 'saleDate' as const, label: 'Date' },
      { key: 'productType' as const, label: 'Product' },
      { key: 'quantity' as const, label: 'Quantity' },
      { key: 'unitPrice' as const, label: 'Unit Price' },
      { key: 'totalAmount' as const, label: 'Total Amount' },
      { key: 'paymentStatus' as const, label: 'Payment Status' },
      { key: 'amountReceived' as const, label: 'Amount Received' },
    ]
  },
  expenses: {
    columns: [
      { key: 'expenseDate' as const, label: 'Date' },
      { key: 'category' as const, label: 'Category' },
      { key: 'description' as const, label: 'Description' },
      { key: 'amount' as const, label: 'Amount' },
      { key: 'paymentMethod' as const, label: 'Payment Method' },
      { key: 'notes' as const, label: 'Notes' },
    ]
  },
  purchases: {
    columns: [
      { key: 'orderNumber' as const, label: 'Order #' },
      { key: 'supplierName' as const, label: 'Supplier' },
      { key: 'orderDate' as const, label: 'Order Date' },
      { key: 'dueDate' as const, label: 'Due Date' },
      { key: 'status' as const, label: 'Status' },
      { key: 'totalAmount' as const, label: 'Total Amount' },
      { key: 'notes' as const, label: 'Notes' },
    ]
  },
  inventory: {
    columns: [
      { key: 'itemType' as const, label: 'Type' },
      { key: 'itemName' as const, label: 'Item Name' },
      { key: 'quantity' as const, label: 'Quantity' },
      { key: 'unit' as const, label: 'Unit' },
      { key: 'minimumStockLevel' as const, label: 'Min Stock' },
      { key: 'currentStockLevel' as const, label: 'Current Stock' },
      { key: 'notes' as const, label: 'Notes' },
    ]
  },
  users: {
    columns: [
      { key: 'name' as const, label: 'Name' },
      { key: 'email' as const, label: 'Email' },
      { key: 'role' as const, label: 'Role' },
      { key: 'status' as const, label: 'Status' },
      { key: 'joinDate' as const, label: 'Join Date' },
      { key: 'lastLogin' as const, label: 'Last Login' },
    ]
  },
  vehicles: {
    columns: [
      { key: 'vehicleNumber' as const, label: 'Vehicle Number' },
      { key: 'vehicleType' as const, label: 'Type' },
      { key: 'driverName' as const, label: 'Driver' },
      { key: 'phone' as const, label: 'Phone' },
      { key: 'ownerName' as const, label: 'Owner' },
      { key: 'totalCapacity' as const, label: 'Capacity' },
      { key: 'status' as const, label: 'Status' },
      { key: 'joinDate' as const, label: 'Join Date' },
    ]
  },
}
