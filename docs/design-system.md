# Aziz Poultry Farm Management System - Design System

## Overview

This document provides comprehensive design specifications for the Aziz Poultry Farm Management System, including design tokens, component specifications, and screen layouts that can be used to recreate the design in Figma.

## Design Tokens

### Color Palette

#### Primary Colors
- **Primary Green**: `#228B22` (RGB: 34, 139, 34) - Main brand color, used for primary actions and highlights
- **Accent Blue**: `#0064C8` (RGB: 0, 100, 200) - Secondary accent color for charts and secondary elements
- **Success Green**: `#10b981` (RGB: 16, 185, 129) - Success states, positive metrics
- **Warning Yellow**: `#f59e0b` (RGB: 245, 158, 11) - Warning states, pending items
- **Error Red**: `#ef4444` (RGB: 239, 68, 68) - Error states, low stock alerts

#### Neutral Colors
- **Dark Text**: `#323232` (RGB: 50, 50, 50) - Primary text color
- **Light Text**: `#646464` (RGB: 100, 100, 100) - Secondary/muted text
- **Border**: `#e5e7eb` (RGB: 229, 231, 235) - Border and divider color
- **Background**: `#ffffff` (RGB: 255, 255, 255) - Main background
- **Card Background**: `#ffffff` (RGB: 255, 255, 255) - Card and surface background

#### Status Colors
- **Active/In Stock**: `#10b981` (Green)
- **Pending**: `#f59e0b` (Yellow)
- **Low Stock/Cancelled**: `#ef4444` (Red)
- **Partial**: `#3b82f6` (Blue)

#### Chart Colors
- **Eggs Revenue**: `#10b981` (Green)
- **Meat Revenue**: `#3b82f6` (Blue)
- **Feed Expense**: `#10b981` (Green)
- **Labor Expense**: `#3b82f6` (Blue)
- **Medicine Expense**: `#f59e0b` (Yellow)
- **Other Expense**: `#ef4444` (Red)

### Typography

#### Font Family
- **Primary**: System font stack (Geist Sans)
- **Mono**: Geist Mono (for code/data)

#### Font Sizes
- **Display Large**: 54px / 3.375rem - Page titles
- **Display Medium**: 48px / 3rem - Section titles
- **Heading 1**: 36px / 2.25rem - Page headings
- **Heading 2**: 32px / 2rem - Section headings
- **Heading 3**: 28px / 1.75rem - Subsection headings
- **Heading 4**: 24px / 1.5rem - Card titles
- **Body Large**: 18px / 1.125rem - Body text (large)
- **Body**: 16px / 1rem - Default body text
- **Body Small**: 14px / 0.875rem - Secondary text
- **Caption**: 12px / 0.75rem - Labels, captions

#### Font Weights
- **Bold**: 700 - Headings, emphasis
- **Semibold**: 600 - Subheadings, labels
- **Medium**: 500 - Button text, important info
- **Regular**: 400 - Body text
- **Normal**: 400 - Default

#### Line Heights
- **Tight**: 1.2 - Headings
- **Normal**: 1.5 - Body text
- **Relaxed**: 1.75 - Long form content

### Spacing System

Based on 4px base unit:
- **xs**: 4px (0.25rem)
- **sm**: 8px (0.5rem)
- **md**: 12px (0.75rem)
- **base**: 16px (1rem)
- **lg**: 24px (1.5rem)
- **xl**: 32px (2rem)
- **2xl**: 48px (3rem)
- **3xl**: 64px (4rem)

### Border Radius

- **none**: 0px
- **sm**: 4px (0.25rem) - Small elements
- **md**: 6px (0.375rem) - Default
- **lg**: 8px (0.5rem) - Cards, modals
- **xl**: 12px (0.75rem) - Large containers
- **full**: 9999px - Pills, badges

### Shadows

- **sm**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- **md**: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
- **lg**: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`
- **xl**: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`

### Layout

#### Grid System
- **Container Max Width**: 1280px
- **Grid Columns**: 12 columns
- **Gutter**: 24px (1.5rem)
- **Breakpoints**:
  - Mobile: 0-640px
  - Tablet: 641-1024px
  - Desktop: 1025px+

#### Sidebar
- **Width (Expanded)**: 256px (16rem)
- **Width (Collapsed)**: 80px (5rem)
- **Background**: Dark sidebar color
- **Transition**: 300ms ease

#### Header
- **Height**: 64px (4rem)
- **Padding**: 24px horizontal (1.5rem)

## Component Specifications

### Buttons

#### Primary Button
- **Background**: Primary Green (#228B22)
- **Text Color**: White (#ffffff)
- **Padding**: 12px 24px (0.75rem 1.5rem)
- **Border Radius**: 6px (0.375rem)
- **Font Size**: 16px (1rem)
- **Font Weight**: 500 (Medium)
- **Hover**: Darker green (#1e7a1e)
- **Disabled**: 50% opacity

#### Secondary Button (Outline)
- **Background**: Transparent
- **Border**: 1px solid Border color (#e5e7eb)
- **Text Color**: Dark Text (#323232)
- **Padding**: 12px 24px (0.75rem 1.5rem)
- **Border Radius**: 6px (0.375rem)
- **Hover**: Light gray background (#f9fafb)

#### Icon Button
- **Size**: 40px × 40px (2.5rem × 2.5rem)
- **Border Radius**: 6px (0.375rem)
- **Icon Size**: 16px (1rem)

### Cards

#### Standard Card
- **Background**: White (#ffffff)
- **Border**: 1px solid Border color (#e5e7eb)
- **Border Radius**: 8px (0.5rem)
- **Padding**: 24px (1.5rem)
- **Shadow**: md shadow
- **Spacing**: 24px gap between cards (1.5rem)

#### Card Header
- **Padding Bottom**: 12px (0.75rem)
- **Border Bottom**: 1px solid Border color (optional)
- **Title Font Size**: 18px (1.125rem)
- **Title Font Weight**: 600 (Semibold)
- **Description Font Size**: 14px (0.875rem)
- **Description Color**: Light Text (#646464)

### Tables

#### Table Container
- **Width**: 100%
- **Border**: 1px solid Border color (#e5e7eb)
- **Border Radius**: 8px (0.5rem)
- **Overflow**: Horizontal scroll on mobile

#### Table Header
- **Background**: Light gray (#f9fafb)
- **Font Weight**: 600 (Semibold)
- **Font Size**: 14px (0.875rem)
- **Padding**: 12px 16px (0.75rem 1rem)
- **Text Color**: Dark Text (#323232)
- **Border Bottom**: 1px solid Border color

#### Table Row
- **Padding**: 12px 16px (0.75rem 1rem)
- **Border Bottom**: 1px solid Border color
- **Hover**: Light gray background (#f9fafb)

#### Table Cell
- **Font Size**: 14px (0.875rem)
- **Padding**: 12px 16px (0.75rem 1rem)
- **Vertical Alignment**: Middle

### Forms

#### Input Field
- **Height**: 40px (2.5rem)
- **Padding**: 12px 16px (0.75rem 1rem)
- **Border**: 1px solid Border color (#e5e7eb)
- **Border Radius**: 6px (0.375rem)
- **Font Size**: 16px (1rem)
- **Focus**: 2px solid Primary Green outline
- **Background**: White (#ffffff)

#### Label
- **Font Size**: 14px (0.875rem)
- **Font Weight**: 500 (Medium)
- **Color**: Dark Text (#323232)
- **Margin Bottom**: 8px (0.5rem)

#### Select Dropdown
- **Height**: 40px (2.5rem)
- **Padding**: 12px 16px (0.75rem 1rem)
- **Border**: 1px solid Border color (#e5e7eb)
- **Border Radius**: 6px (0.375rem)
- **Background**: White (#ffffff)

### Badges/Status Indicators

#### Status Badge
- **Padding**: 4px 12px (0.25rem 0.75rem)
- **Border Radius**: 9999px (full)
- **Font Size**: 12px (0.75rem)
- **Font Weight**: 600 (Semibold)
- **Text Transform**: Capitalize

#### Status Colors:
- **In Stock/Active**: Green background (#dcfce7), Green text (#166534)
- **Low Stock/Cancelled**: Red background (#fee2e2), Red text (#991b1b)
- **Pending**: Yellow background (#fef3c7), Yellow text (#92400e)
- **Partial**: Blue background (#dbeafe), Blue text (#1e40af)

### Modals/Dialogs

#### Modal Container
- **Max Width**: 600px (37.5rem) - Standard
- **Max Width**: 800px (50rem) - Large
- **Background**: White (#ffffff)
- **Border Radius**: 12px (0.75rem)
- **Padding**: 24px (1.5rem)
- **Shadow**: xl shadow
- **Backdrop**: rgba(0, 0, 0, 0.5) overlay

#### Modal Header
- **Padding Bottom**: 16px (1rem)
- **Title Font Size**: 20px (1.25rem)
- **Title Font Weight**: 600 (Semibold)
- **Description Font Size**: 14px (0.875rem)
- **Description Color**: Light Text (#646464)

### Charts

#### Chart Container
- **Height**: 320px (20rem) - Standard
- **Padding**: 16px (1rem)
- **Background**: White (#ffffff)

#### Chart Colors:
- **Line Charts**: Primary Green (#228B22), Accent Blue (#0064C8)
- **Bar Charts**: Primary Green (#228B22), Error Red (#ef4444)
- **Pie Charts**: Feed (#10b981), Labor (#3b82f6), Medicine (#f59e0b), Other (#ef4444)

### KPI Cards

#### KPI Card
- **Padding**: 24px (1.5rem)
- **Background**: White (#ffffff)
- **Border**: 1px solid Border color (#e5e7eb)
- **Border Radius**: 8px (0.5rem)

#### KPI Value
- **Font Size**: 48px (3rem)
- **Font Weight**: 700 (Bold)
- **Color**: Dark Text (#323232)

#### KPI Label
- **Font Size**: 14px (0.875rem)
- **Font Weight**: 500 (Medium)
- **Color**: Light Text (#646464)
- **Margin Bottom**: 8px (0.5rem)

#### KPI Subtext
- **Font Size**: 12px (0.75rem)
- **Color**: Light Text (#646464)
- **Margin Top**: 4px (0.25rem)

## Screen Layouts

### Login Screen

**Layout:**
- Centered card on gradient background
- Card width: 448px (28rem)
- Card padding: 24px (1.5rem)

**Background:**
- Gradient: from-green-50 to-blue-50 (light mode)
- Gradient: from-slate-900 to-slate-800 (dark mode)

**Elements:**
- Logo: Chicken emoji (🐔) - 64px (4rem)
- Title: "Aziz Poultry" - 32px (2rem), Bold
- Subtitle: "Farm Management System" - 14px (0.875rem), Muted
- Form fields: Email and Password inputs
- Primary button: "Login" - Full width
- Secondary button: "Quick Demo Access" - Full width
- Demo credentials card: Light blue background (#dbeafe)

### Dashboard Layout

**Structure:**
- Sidebar (left): 256px width when expanded, 80px when collapsed
- Main content area: Remaining width
- Header (top): 64px height

**Sidebar:**
- Background: Dark sidebar color
- Logo area: Top section with logo and collapse button
- Navigation: List of links with icons
- User section: Bottom section with logout

**Header:**
- Background: Card background color
- Left: Welcome message with user email
- Right: Date filter (when applicable) and user role

**Main Content:**
- Container: Max width 1280px, centered
- Padding: 24px (1.5rem)
- Grid: Responsive grid for cards

### Dashboard Page

**Layout:**
- Page title: "Dashboard" - 36px (2.25rem), Bold
- Subtitle: Description text - 16px (1rem), Muted
- KPI Cards Grid: 4 columns on desktop, 2 on tablet, 1 on mobile
- Charts Grid: 2 columns on desktop, 1 on mobile

**KPI Cards:**
- Total Birds: Number display
- Revenue (MTD): Currency in ₹
- Expenses (MTD): Currency in ₹
- Net Profit (MTD): Currency in ₹, Green color

**Charts:**
- Revenue Trends: Line chart, 320px height
- Expense Breakdown: Pie chart, 320px height

### Inventory Page

**Layout:**
- Header: Title and "Add Item" button
- Low Stock Alert Card: Yellow background, if applicable
- Inventory Table: Full width

**Table Columns:**
1. Item Type (font-medium)
2. Quantity
3. Unit
4. Min Stock
5. Status (badge)
6. Last Updated (muted text)
7. Actions (icon buttons)

### Purchases/Sales/Expenses Pages

**Layout:**
- Header: Title and "New" button
- Summary Cards: 3 KPI cards in a row
- Data Table: Full width with actions

**Summary Cards:**
- Total count/value
- Status-specific counts
- Total value in ₹

### Reports Page

**Layout:**
- Header: Title with Filter and Export buttons
- KPI Cards: 4 cards in a row
- Charts Grid: 2×2 grid of charts
- KPI Section: 4 cards in a row

## Responsive Breakpoints

### Mobile (< 640px)
- Single column layout
- Collapsed sidebar (icon-only)
- Stacked cards
- Horizontal scroll for tables
- Full-width buttons

### Tablet (641px - 1024px)
- 2-column grid for cards
- Expanded sidebar
- Scrollable tables
- Adjusted chart sizes

### Desktop (> 1024px)
- 3-4 column grids
- Full sidebar
- All features visible
- Optimal chart sizes

## Dark Mode Support

All components support dark mode with:
- Dark backgrounds: slate-900, slate-800
- Light text: white, light gray
- Adjusted border colors
- Maintained contrast ratios

## Icon System

Using Lucide React icons:
- **Size**: 16px (1rem) - Small
- **Size**: 20px (1.25rem) - Standard
- **Size**: 24px (1.5rem) - Large
- **Color**: Inherit from parent or use status colors

## Animation & Transitions

- **Sidebar Toggle**: 300ms ease transition
- **Modal Open/Close**: 200ms fade + scale
- **Button Hover**: 150ms color transition
- **Page Transitions**: Instant (SPA)

## Accessibility

- **Color Contrast**: WCAG AA compliant
- **Focus States**: 2px outline on interactive elements
- **Keyboard Navigation**: Full support
- **Screen Readers**: Semantic HTML, ARIA labels
- **Touch Targets**: Minimum 44×44px

