# Screen Specifications - Aziz Poultry Farm Management System

Detailed specifications for each screen in the application, ready for Figma recreation.

## 1. Login Screen

### Layout
- **Container**: Full viewport (1920×1080px recommended)
- **Background**: Gradient from `#f0fdf4` (green-50) to `#eff6ff` (blue-50)
- **Card**: Centered, 448px width, white background, rounded corners (8px)

### Elements (Top to Bottom)
1. **Logo**: 🐔 emoji, 64px size, centered
2. **Title**: "Aziz Poultry", 32px, Bold, Dark text
3. **Subtitle**: "Farm Management System", 14px, Muted text
4. **Email Input**: Full width, 40px height, label "Email"
5. **Password Input**: Full width, 40px height, label "Password"
6. **Login Button**: Primary green, full width, 40px height
7. **Divider**: Horizontal line, 1px, light gray
8. **Quick Demo Button**: Outline style, full width
9. **Demo Credentials Card**: Light blue background (#dbeafe), 12px padding, rounded corners

### Spacing
- Card padding: 24px
- Element spacing: 16px vertical
- Button spacing: 12px vertical

## 2. Dashboard Layout (Base)

### Structure
- **Sidebar**: 256px width (expanded), 80px (collapsed), dark background
- **Header**: 64px height, white background, border bottom
- **Main Content**: Remaining space, white background, 24px padding

### Sidebar Components
- **Logo Section**: Top, 64px height, logo + collapse button
- **Navigation**: List of links with icons, 20px icon size
- **Master Entries**: Collapsible section with sub-items
- **User Section**: Bottom, logout button

### Header Components
- **Left**: Welcome text with user email (14px, muted)
- **Right**: Date filter (when applicable) + user role (14px, muted)

## 3. Dashboard Page

### Layout Grid
- **Page Header**: Title (36px) + subtitle (16px, muted)
- **KPI Cards**: 4 columns (desktop), 2 columns (tablet), 1 column (mobile)
- **Charts**: 2 columns (desktop), 1 column (mobile)

### KPI Cards
Each card:
- **Header**: Label (14px, muted, medium weight)
- **Value**: Large number (48px, bold)
- **Subtext**: Small text (12px, muted)
- **Size**: Equal width, 120px height minimum

### Charts
- **Revenue Trends**: Line chart, 320px height
- **Expense Breakdown**: Pie chart, 320px height
- **Padding**: 16px inside chart container

## 4. Inventory Management Page

### Layout
- **Header**: Title + "Add Item" button (right-aligned)
- **Alert Card** (conditional): Yellow background, warning icon, list of low stock items
- **Table**: Full width, scrollable

### Table Structure
Columns (left to right):
1. Item Type (font-medium, 14px)
2. Quantity (14px)
3. Unit (14px)
4. Min Stock (14px)
5. Status (badge, 12px)
6. Last Updated (14px, muted)
7. Actions (icon buttons, right-aligned)

### Table Styling
- **Header**: Light gray background (#f9fafb), semibold text
- **Rows**: White background, hover: light gray
- **Row Height**: 48px minimum
- **Cell Padding**: 12px horizontal, 12px vertical

## 5. Purchase Orders Page

### Layout
- **Header**: Title + "New Order" button
- **Summary Cards**: 3 cards in a row
- **Table**: Full width

### Summary Cards
1. **Total Orders**: Count number (48px)
2. **Pending Orders**: Count number (48px)
3. **Total Value**: Currency in ₹ (48px)

### Table Structure
Columns:
1. Order # (font-medium)
2. Supplier
3. Order Date
4. Due Date
5. Amount (₹)
6. Status (badge)
7. Actions (icons)

## 6. Sales Tracking Page

### Layout
- **Header**: Title + "Record Sale" button
- **Summary Cards**: 3 cards
- **Table**: Full width

### Summary Cards
1. **Total Sales**: Count
2. **Total Revenue**: ₹ amount
3. **Amount Received**: ₹ amount (green color)

### Table Structure
Columns:
1. Invoice # (font-medium)
2. Customer
3. Date
4. Product (capitalized)
5. Quantity
6. Amount (₹)
7. Payment Status (badge)
8. Actions

## 7. Expense Management Page

### Layout
- **Header**: Title + "Record Expense" button
- **Summary Cards**: 3 cards
- **Two-Column Grid**: Category breakdown (left) + Recent expenses (right)
- **Table**: Full width

### Summary Cards
1. **Total Expenses**: ₹ amount
2. **This Month**: ₹ amount
3. **Average Expense**: ₹ amount

### Category Breakdown Card
- **Title**: "Category Breakdown"
- **Items**: List with emoji, category name, amount (₹), percentage
- **Sorting**: Highest to lowest amount

### Recent Expenses Card
- **Title**: "Recent Expenses"
- **Items**: Last 5 expenses
- **Layout**: Description + date (left), amount (₹) + payment method (right)

## 8. Financial Reports Page

### Layout
- **Header**: Title + Filter button + Export button
- **KPI Cards**: 4 cards in a row
- **Charts Grid**: 2×2 grid
- **KPI Section**: 4 cards in a row

### KPI Cards (Top Row)
1. Total Revenue (6M): ₹ amount
2. Total Expenses (6M): ₹ amount + average
3. Total Profit (6M): ₹ amount (green) + margin %
4. Average Monthly Profit: ₹ amount

### Charts
1. **Monthly Revenue vs Expenses**: Bar chart, 320px height
2. **Monthly Net Profit**: Line chart, 320px height
3. **Expense Distribution**: Pie chart, 320px height
4. **Sales Performance**: Line chart, 320px height

### KPI Cards (Bottom Row)
1. Revenue Per Month: ₹ amount (blue background)
2. Expense Per Month: ₹ amount (red background)
3. Profit Per Month: ₹ amount (green background)
4. ROI: Percentage (purple background)

## 9. Farmers Management Page

### Layout
- **Header**: Title + "Add Farmer" button
- **Content**: Card-based grid or table layout
- **Cards**: Farmer information cards (if card layout)

### Card Structure (if used)
- Farmer name (heading)
- Contact information
- Purchase history
- Actions (edit, delete)

## 10. Retailers Management Page

### Layout
- **Header**: Title + "Add Retailer" button
- **Content**: Card-based grid or table layout
- **Cards**: Retailer information cards

### Card Structure (if used)
- Retailer name (heading)
- Owner name
- Contact information (email, phone, address)
- Purchase statistics
- Actions (edit, delete)

## 11. User Management Page

### Layout
- **Header**: Title + "Add User" button
- **Summary Cards**: 3 cards
- **Table**: Full width
- **Role Permissions**: 3-column grid

### Summary Cards
1. **Total Users**: Count
2. **Active Users**: Count
3. **Administrators**: Count

### Table Structure
Columns:
1. Name (font-medium)
2. Role (badge)
3. Status (badge)
4. Join Date
5. Last Login
6. Actions (shield, edit, delete icons)

### Role Permissions Section
- **Layout**: 3 cards in a row
- **Each Card**: Role name (badge), list of permissions with checkmarks

## 12. Settings Page

### Layout
- **Header**: Title
- **Tabs**: General, Display, etc.
- **Form Sections**: Grouped settings
- **Save Button**: Primary button

### Settings Sections
- Currency selection (dropdown)
- Theme preferences
- Other system configurations

## Common Patterns

### Modal/Dialog Structure
- **Backdrop**: 50% black overlay
- **Container**: White background, 600px max width (standard), 800px (large)
- **Padding**: 24px
- **Border Radius**: 12px
- **Shadow**: Extra large shadow

### Form Layout
- **Fields**: Stacked vertically, 16px spacing
- **Labels**: Above inputs, 14px, medium weight
- **Inputs**: Full width, 40px height
- **Buttons**: Full width, bottom-aligned

### Status Badges
- **Size**: Auto width, 24px height
- **Padding**: 4px vertical, 12px horizontal
- **Border Radius**: 9999px (pill shape)
- **Font**: 12px, semibold, capitalize

### Action Buttons (Table)
- **Group**: 3 icon buttons, 8px spacing
- **Size**: 32×32px
- **Icons**: 16px size
- **Alignment**: Right-aligned in actions column

## Responsive Behavior

### Mobile (< 640px)
- Sidebar: Collapsed (icon-only)
- Cards: Single column, full width
- Tables: Horizontal scroll
- Charts: Full width, reduced height
- Buttons: Full width

### Tablet (641-1024px)
- Sidebar: Expanded
- Cards: 2 columns
- Tables: Scrollable
- Charts: 2 columns, adjusted height

### Desktop (> 1024px)
- Sidebar: Expanded
- Cards: 3-4 columns
- Tables: Full display
- Charts: Optimal sizes, side-by-side

## Date Range Filter Component

### Location
- Header, right side (when applicable)

### Structure
- **Label**: "Date Range:" (14px, medium)
- **Button**: 300px width, outline style, calendar icon
- **Popover**: Calendar component, 2 months side-by-side
- **Clear Button**: Ghost style, X icon

### States
- **Empty**: "Select date range" (muted text)
- **Selected**: "MMM dd, yyyy - MMM dd, yyyy"
- **Popover Open**: Calendar visible with range selection

