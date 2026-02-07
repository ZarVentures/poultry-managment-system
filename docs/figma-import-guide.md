# Figma Import Guide - Aziz Poultry Design System

This guide explains how to import the design tokens and recreate the Aziz Poultry Farm Management System design in Figma.

## Method 1: Using Figma Tokens Plugin (Recommended)

### Step 1: Install Figma Tokens Plugin
1. Open Figma
2. Go to Plugins → Browse all plugins
3. Search for "Figma Tokens" or "Tokens Studio"
4. Install the plugin

### Step 2: Import Design Tokens
1. Open your Figma file
2. Go to Plugins → Figma Tokens
3. Click "Import" or "Sync"
4. Select `design-tokens.json` from the `docs` folder
5. The tokens will be imported as design tokens in Figma

### Step 3: Apply Tokens to Your Design
- Use the tokens for colors, typography, spacing, etc.
- Tokens will be available in the design tokens panel

## Method 2: Manual Recreation Using Design System Document

Use `design-system.md` as a reference to manually recreate the design in Figma.

### Step 1: Set Up Your Figma File
1. Create a new Figma file: "Aziz Poultry Design System"
2. Create pages:
   - Design Tokens
   - Components
   - Screens
   - Prototype

### Step 2: Create Color Styles
1. Go to Design → Color Styles
2. Create color styles based on the color palette in `design-system.md`:
   - Primary Green: #228B22
   - Accent Blue: #0064C8
   - Success: #10b981
   - Warning: #f59e0b
   - Error: #ef4444
   - Text Primary: #323232
   - Text Secondary: #646464
   - Background: #ffffff
   - Border: #e5e7eb

### Step 3: Create Text Styles
1. Go to Design → Text Styles
2. Create text styles for each typography level:
   - Display Large: 54px, Bold
   - Display Medium: 48px, Bold
   - Heading 1: 36px, Bold
   - Heading 2: 32px, Bold
   - Heading 3: 28px, Semibold
   - Heading 4: 24px, Semibold
   - Body Large: 18px, Regular
   - Body: 16px, Regular
   - Body Small: 14px, Regular
   - Caption: 12px, Regular

### Step 4: Create Component Library

#### Buttons
- **Primary Button**: Green background (#228B22), white text, 40px height, 12px padding, 6px border radius
- **Secondary Button**: Transparent, border, 40px height
- **Icon Button**: 40×40px square

#### Cards
- White background, 1px border (#e5e7eb), 8px border radius, 24px padding, shadow (md)

#### Input Fields
- 40px height, 12px padding, 1px border, 6px border radius, white background

#### Tables
- Header: Light gray background (#f9fafb), 14px semibold text
- Rows: White background, hover state with light gray
- Cells: 12px padding, 14px text

#### Badges
- Rounded pill shape (9999px radius), 4px vertical padding, 12px horizontal padding
- Status colors: Green (active), Yellow (pending), Red (error), Blue (partial)

### Step 5: Create Screen Frames

#### Frame Sizes
- **Desktop**: 1920×1080px
- **Tablet**: 1024×768px
- **Mobile**: 375×667px

#### Login Screen
1. Create frame: 1920×1080px
2. Background: Gradient (green-50 to blue-50)
3. Center card: 448px width, white background, 24px padding
4. Add logo (🐔 emoji or image), title, form fields, buttons

#### Dashboard Layout
1. Create frame: 1920×1080px
2. Sidebar: 256px width, dark background, navigation items
3. Main area: Remaining width, white background
4. Header: 64px height, user info and filters
5. Content: Grid layout with KPI cards and charts

#### Page Templates
Create frames for each page:
- Dashboard
- Inventory
- Purchases
- Sales
- Expenses
- Reports
- Farmers
- Retailers
- Users
- Settings

### Step 6: Create Component Variants

#### Button Variants
- Primary (default, hover, disabled)
- Secondary (default, hover, disabled)
- Icon (default, hover)

#### Status Badge Variants
- Active/In Stock (green)
- Pending (yellow)
- Low Stock/Error (red)
- Partial (blue)

#### Card Variants
- Standard card
- KPI card
- Alert card (yellow background)

### Step 7: Set Up Auto Layout

Use Figma Auto Layout for:
- Button groups
- Card content
- Table rows
- Form fields
- Navigation items

### Step 8: Create Prototype Connections

1. Link login button to dashboard
2. Link sidebar navigation items to respective pages
3. Link "Add" buttons to modal dialogs
4. Link table row actions to edit/delete flows

## Method 3: Using Figma Variables (Figma 2023+)

### Step 1: Create Variables
1. Go to Design → Variables
2. Create color variables from `design-tokens.json`
3. Create spacing variables
4. Create typography variables

### Step 2: Apply Variables
- Use variables instead of hardcoded values
- Variables can be changed globally

## Screen Specifications Reference

### Login Screen
- **Layout**: Centered card on gradient
- **Card Size**: 448×600px (approximate)
- **Elements**: Logo, title, form (2 inputs), 2 buttons, demo credentials card

### Dashboard
- **Layout**: Sidebar + Main content
- **Sidebar**: 256px width, dark background
- **KPI Cards**: 4 cards in a row (desktop), 2×2 grid (tablet), stacked (mobile)
- **Charts**: 2 charts side by side (desktop), stacked (mobile)

### Data Tables
- **Columns**: Vary by page (6-8 columns typical)
- **Row Height**: 48px minimum
- **Actions Column**: Right-aligned, icon buttons

### Modals/Dialogs
- **Standard**: 600px max width
- **Large**: 800px max width
- **Padding**: 24px
- **Backdrop**: 50% black overlay

## Component Specifications Summary

### Spacing System
- Use 4px base unit
- Common spacing: 8px, 12px, 16px, 24px, 32px, 48px

### Border Radius
- Small elements: 4px
- Default: 6px
- Cards/Modals: 8px
- Large containers: 12px
- Pills/Badges: 9999px (full)

### Shadows
- Small: Subtle elevation
- Medium: Cards
- Large: Modals
- Extra Large: Overlays

## Tips for Figma Recreation

1. **Use Components**: Create reusable components for buttons, cards, inputs
2. **Auto Layout**: Use Auto Layout for responsive designs
3. **Constraints**: Set proper constraints for responsive behavior
4. **Variants**: Create variants for different states (hover, active, disabled)
5. **Styles**: Use text and color styles consistently
6. **Grids**: Set up 12-column grid for layouts
7. **Frames**: Use proper frame sizes for different breakpoints
8. **Prototyping**: Add interactions for user flows

## Export Assets

After creating the design:
1. Export icons and images as SVG/PNG
2. Export color palette as CSS variables
3. Export typography as CSS
4. Create style guide document

## Next Steps

1. Import tokens using Figma Tokens plugin
2. Create component library
3. Build screen layouts
4. Add interactions/prototyping
5. Share with team for feedback
6. Export assets for development

