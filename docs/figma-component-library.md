# Figma Component Library - Aziz Poultry

Complete component specifications for recreating the UI component library in Figma.

## Base Components

### 1. Button - Primary

**Structure:**
- Frame: Auto Layout (Horizontal), 8px gap
- Background: Primary Green (#228B22)
- Text: White, 16px, Medium weight
- Padding: 12px 24px
- Border Radius: 6px
- Height: 40px

**Variants:**
- Default
- Hover (darker green: #1e7a1e)
- Disabled (50% opacity)
- Loading (with spinner)

**States:**
- Normal
- Hover
- Active
- Disabled
- Loading

### 2. Button - Secondary (Outline)

**Structure:**
- Frame: Auto Layout (Horizontal), 8px gap
- Background: Transparent
- Border: 1px solid #e5e7eb
- Text: Dark (#323232), 16px, Medium weight
- Padding: 12px 24px
- Border Radius: 6px
- Height: 40px

**Variants:**
- Default
- Hover (light gray background: #f9fafb)

### 3. Button - Icon

**Structure:**
- Frame: 40×40px square
- Background: Transparent
- Border: 1px solid #e5e7eb (on hover)
- Icon: 16px, centered
- Border Radius: 6px

**Variants:**
- Default
- Hover (border appears)

### 4. Input Field

**Structure:**
- Frame: Auto Layout (Vertical), 8px gap
- Label: 14px, Medium weight, Dark text
- Input Container:
  - Height: 40px
  - Padding: 12px 16px
  - Border: 1px solid #e5e7eb
  - Border Radius: 6px
  - Background: White
  - Text: 16px, Regular
- Focus State: 2px solid Primary Green outline

**Variants:**
- Default
- Focus
- Error (red border)
- Disabled (grayed out)

### 5. Select Dropdown

**Structure:**
- Frame: Auto Layout (Horizontal), 8px gap
- Height: 40px
- Padding: 12px 16px
- Border: 1px solid #e5e7eb
- Border Radius: 6px
- Background: White
- Text: 16px, Regular
- Icon: Chevron down, 16px, right-aligned

**Variants:**
- Default
- Open (with dropdown menu)
- Disabled

### 6. Card

**Structure:**
- Frame: Auto Layout (Vertical), 16px gap
- Background: White
- Border: 1px solid #e5e7eb
- Border Radius: 8px
- Padding: 24px
- Shadow: Medium shadow

**Variants:**
- Standard
- KPI Card (no padding, different layout)
- Alert Card (colored background)

### 7. Card Header

**Structure:**
- Frame: Auto Layout (Vertical), 4px gap
- Title: 18px, Semibold, Dark text
- Description: 14px, Regular, Muted text
- Padding Bottom: 12px
- Optional: Border bottom (1px, #e5e7eb)

### 8. Table

**Structure:**
- Frame: Auto Layout (Vertical)
- Border: 1px solid #e5e7eb
- Border Radius: 8px
- Overflow: Hidden

### 9. Table Header

**Structure:**
- Frame: Auto Layout (Horizontal)
- Background: Light gray (#f9fafb)
- Padding: 12px 16px
- Text: 14px, Semibold, Dark text
- Border Bottom: 1px solid #e5e7eb

### 10. Table Row

**Structure:**
- Frame: Auto Layout (Horizontal)
- Background: White
- Padding: 12px 16px
- Border Bottom: 1px solid #e5e7eb
- Hover: Light gray background (#f9fafb)

### 11. Table Cell

**Structure:**
- Frame: Auto Layout (Horizontal), 8px gap
- Padding: 12px 16px
- Text: 14px, Regular
- Alignment: Left (default), Right (for numbers/actions)

### 12. Badge / Status Indicator

**Structure:**
- Frame: Auto Layout (Horizontal), 4px gap
- Padding: 4px 12px
- Border Radius: 9999px (full)
- Text: 12px, Semibold, Capitalize

**Variants:**
- Active/In Stock: Green background (#dcfce7), Green text (#166534)
- Pending: Yellow background (#fef3c7), Yellow text (#92400e)
- Low Stock/Error: Red background (#fee2e2), Red text (#991b1b)
- Partial: Blue background (#dbeafe), Blue text (#1e40af)

### 13. Modal / Dialog

**Structure:**
- Backdrop: 50% black overlay, full screen
- Container:
  - Max Width: 600px (standard), 800px (large)
  - Background: White
  - Border Radius: 12px
  - Padding: 24px
  - Shadow: Extra large shadow
  - Centered on screen

**Variants:**
- Standard (600px)
- Large (800px)
- Full Screen (mobile)

### 14. Modal Header

**Structure:**
- Frame: Auto Layout (Vertical), 4px gap
- Title: 20px, Semibold, Dark text
- Description: 14px, Regular, Muted text
- Padding Bottom: 16px

### 15. KPI Card

**Structure:**
- Frame: Auto Layout (Vertical), 8px gap
- Background: White
- Border: 1px solid #e5e7eb
- Border Radius: 8px
- Padding: 24px

**Content:**
- Label: 14px, Medium weight, Muted text
- Value: 48px, Bold, Dark text
- Subtext: 12px, Regular, Muted text (optional)

**Variants:**
- Standard
- Highlighted (colored background for profit/metrics)

### 16. Chart Container

**Structure:**
- Frame: Auto Layout (Vertical), 16px gap
- Background: White
- Padding: 16px
- Height: 320px (standard)

**Content:**
- Title: 18px, Semibold
- Description: 14px, Muted
- Chart Area: Remaining space

### 17. Sidebar Navigation

**Structure:**
- Frame: Auto Layout (Vertical), 8px gap
- Width: 256px (expanded), 80px (collapsed)
- Background: Dark sidebar color
- Padding: 24px

**Variants:**
- Expanded (with labels)
- Collapsed (icons only)

### 18. Navigation Link

**Structure:**
- Frame: Auto Layout (Horizontal), 8px gap
- Icon: 20px
- Label: 16px, Regular (hidden when collapsed)
- Padding: 12px
- Border Radius: 6px
- Hover: Light background

**Variants:**
- Default
- Active (highlighted)
- Hover

### 19. Date Range Filter

**Structure:**
- Frame: Auto Layout (Horizontal), 8px gap
- Label: "Date Range:", 14px, Medium
- Button:
  - Width: 300px
  - Height: 40px
  - Border: 1px solid #e5e7eb
  - Border Radius: 6px
  - Icon: Calendar, 16px
  - Text: 16px, Regular

**Popover:**
- Calendar: 2 months side-by-side
- Clear Button: Ghost style, X icon

### 20. Alert Card

**Structure:**
- Frame: Auto Layout (Vertical), 12px gap
- Background: Yellow (#fef3c7) or Red (#fee2e2)
- Border: 1px solid (matching color)
- Border Radius: 8px
- Padding: 16px

**Content:**
- Icon: Alert circle, 20px
- Title: 18px, Semibold
- List: Items with descriptions

**Variants:**
- Warning (yellow)
- Error (red)

## Composite Components

### 21. Form Field Group

**Structure:**
- Frame: Auto Layout (Vertical), 8px gap
- Label: 14px, Medium
- Input: Input component
- Error Message: 12px, Red (optional, conditional)

### 22. Form Section

**Structure:**
- Frame: Auto Layout (Vertical), 16px gap
- Title: 18px, Semibold (optional)
- Fields: Multiple form field groups

### 23. Action Bar

**Structure:**
- Frame: Auto Layout (Horizontal), 8px gap
- Alignment: Right
- Buttons: Primary + Secondary (optional)

### 24. Data Table with Actions

**Structure:**
- Table Component
- Actions Column: 3 icon buttons, 8px spacing
- Icons: View, Edit, Delete

### 25. Summary Statistics Row

**Structure:**
- Frame: Auto Layout (Horizontal), 16px gap
- 3-4 KPI Cards in a row
- Equal width distribution

## Layout Components

### 26. Page Container

**Structure:**
- Frame: Auto Layout (Vertical), 24px gap
- Max Width: 1280px
- Padding: 24px
- Centered

### 27. Grid Layout

**Structure:**
- Frame: Auto Layout (Wrap)
- Gap: 16px
- Columns: Responsive (4 desktop, 2 tablet, 1 mobile)

### 28. Two-Column Layout

**Structure:**
- Frame: Auto Layout (Horizontal), 24px gap
- Equal width columns
- Stack on mobile

## Icon Set

Using Lucide React icons, 16px, 20px, 24px sizes:
- Home, Package, ShoppingCart, TrendingUp, BarChart3
- Users, Settings, LogOut, Menu, X
- Plus, Edit2, Trash2, Eye, Shield
- Calendar, AlertCircle, Check, X
- Mail, Phone, MapPin, DollarSign

## Component Naming Convention

Format: `Component/Type/Variant/State`

Examples:
- `Button/Primary/Default`
- `Button/Primary/Hover`
- `Badge/Status/Active`
- `Card/KPI/Standard`
- `Table/Row/Default`
- `Table/Row/Hover`

## Component Organization in Figma

### Pages Structure:
1. **Design Tokens**: Colors, Typography, Spacing
2. **Base Components**: Buttons, Inputs, Cards, etc.
3. **Composite Components**: Form groups, Action bars, etc.
4. **Layout Components**: Grids, Containers, etc.
5. **Screens**: Complete page layouts
6. **Prototypes**: Interactive flows

### Component Hierarchy:
- Base (atoms)
- Composite (molecules)
- Layout (organisms)
- Screens (templates)

## Usage Guidelines

1. **Always use components**: Don't create one-off elements
2. **Use variants**: Create variants for different states
3. **Auto Layout**: Use Auto Layout for responsive behavior
4. **Constraints**: Set proper constraints for resizing
5. **Styles**: Apply text and color styles consistently
6. **Naming**: Follow naming convention strictly
7. **Documentation**: Add descriptions to components

