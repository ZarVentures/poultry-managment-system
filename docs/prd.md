# Aziz Poultry Farm Management System Product Requirements Document (PRD)

## Goals and Background Context

### Goals

- Enable comprehensive farm management through a unified digital platform
- Provide real-time visibility into inventory, sales, purchases, and expenses
- Automate financial tracking and reporting to support data-driven decision making
- Streamline operations for poultry farm managers and staff
- Support multi-user access with role-based permissions
- Enable date-range filtering across all financial and inventory modules for flexible reporting
- Display all financial values in Indian Rupees (₹) for local market alignment

### Background Context

Poultry farming operations require meticulous tracking of multiple interconnected aspects: bird inventory, feed and supply stock levels, purchase orders from suppliers, sales transactions to customers, and operational expenses. Traditional manual record-keeping methods are error-prone, time-consuming, and lack real-time visibility into farm performance metrics.

The Aziz Poultry Farm Management System addresses these challenges by providing a comprehensive web-based platform that centralizes all farm operations data. The system enables farm managers to track inventory levels with automated low-stock alerts, manage supplier relationships through purchase order workflows, record and monitor sales transactions, categorize and analyze expenses, and generate financial reports with visual analytics.

The application has been developed as a modern Next.js web application with a focus on user experience, data persistence through browser storage, and responsive design that works across devices. The system supports role-based access control, allowing different user types (admin, manager, staff) to access appropriate features based on their responsibilities.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2024-12-23 | v1.0 | Initial PRD creation documenting implemented features | PM Agent |

## Requirements

### Functional Requirements

FR1: User Authentication System
- The system shall provide a login page with email and password authentication
- The system shall support demo credentials for quick access (admin@azizpoultry.com / demo123)
- The system shall store user session information in browser localStorage
- The system shall redirect unauthenticated users to the login page

FR2: Dashboard Overview
- The system shall display key performance indicators (KPIs) including total birds, revenue (MTD), expenses (MTD), and net profit (MTD)
- The system shall display revenue trends chart showing monthly revenue by product type (eggs and meat)
- The system shall display expense breakdown pie chart showing distribution of expenses by category
- All currency values shall be displayed in Indian Rupees (₹)

FR3: Inventory Management
- The system shall allow users to add, edit, and delete inventory items
- The system shall track inventory items with type, quantity, unit, minimum stock level, and last updated date
- The system shall display low stock alerts for items at or below minimum stock levels
- The system shall support date range filtering to view inventory updates within a specific period
- The system shall persist inventory data in browser localStorage

FR4: Purchase Order Management
- The system shall allow users to create, edit, and delete purchase orders
- Each purchase order shall include order number, supplier name, order date, due date, items (description, quantity, unit cost), status (pending/received/cancelled), total amount, and notes
- The system shall automatically calculate total order amount based on item quantity and unit cost
- The system shall support date range filtering to view purchase orders within a specific period
- The system shall display summary statistics: total orders, pending orders count, and total value
- All amounts shall be displayed in Indian Rupees (₹)

FR5: Sales Tracking
- The system shall allow users to record, edit, and delete sales transactions
- Each sale shall include invoice number, customer name, sale date, product type (eggs/meat/chicks/other), quantity, unit price, total amount, payment status (paid/pending/partial), and notes
- The system shall automatically calculate total amount based on quantity and unit price
- The system shall support date range filtering to view sales within a specific period
- The system shall display summary statistics: total sales count, total revenue, and amount received
- All amounts shall be displayed in Indian Rupees (₹)

FR6: Expense Management
- The system shall allow users to record, edit, and delete expense transactions
- Each expense shall include date, category (feed/labor/medicine/utilities/equipment/maintenance/transportation/other), description, amount, payment method (cash/bank/check/card), and notes
- The system shall support date range filtering to view expenses within a specific period
- The system shall display summary statistics: total expenses, monthly expenses, and average expense
- The system shall provide category breakdown analysis showing expenses by category with percentages
- The system shall display recent expenses list
- All amounts shall be displayed in Indian Rupees (₹)

FR7: Financial Reports
- The system shall display comprehensive financial reports with monthly revenue vs expenses comparison
- The system shall display monthly net profit trends
- The system shall show expense distribution by category (pie chart)
- The system shall display sales performance analysis by product type
- The system shall provide key performance indicators: revenue per month, expense per month, profit per month, and ROI
- All currency values shall be displayed in Indian Rupees (₹)

FR8: Master Data Management
- The system shall allow users to manage farmer master data (farmers page)
- The system shall allow users to manage retailer master data (retailers page)
- Master data entries shall support CRUD operations (Create, Read, Update, Delete)

FR9: User Management
- The system shall allow administrators to add, edit, and delete user accounts
- Each user account shall include name, role (admin/manager/staff), status (active/inactive), join date, and last login
- The system shall display user statistics: total users, active users count, and administrators count
- The system shall display role permissions information for each role type

FR10: Date Range Filtering
- The system shall provide a calendar-based date range selector in the header for applicable pages
- The date filter shall be available on Inventory, Purchases, Sales, and Expenses pages
- The date filter shall persist across page navigation using browser localStorage
- When a date range is selected, all data on the current page shall be filtered to show only records within the selected date range
- Statistics and summaries shall automatically update based on filtered data

FR11: Settings Management
- The system shall provide a settings page for system configuration
- Settings shall include currency selection (with INR/₹ as default)

FR12: Responsive Dashboard Layout
- The system shall provide a collapsible sidebar navigation menu
- The sidebar shall display navigation links for all main modules
- The system shall display user information and role in the header
- The system shall provide logout functionality

### Non-Functional Requirements

NFR1: Technology Stack
- The application shall be built using Next.js 16 with React 19
- The application shall use TypeScript for type safety
- The application shall use Tailwind CSS for styling
- The application shall use shadcn/ui component library for UI components
- The application shall use Recharts for data visualization

NFR2: Data Persistence
- The application shall use browser localStorage for data persistence
- All data (inventory, purchases, sales, expenses, users) shall persist across browser sessions
- Date filter preferences shall persist across page navigation

NFR3: User Experience
- The application shall provide a modern, intuitive user interface
- The application shall support dark mode and light mode themes
- The application shall be responsive and work on desktop and mobile devices
- The application shall provide visual feedback for user actions (loading states, confirmations)

NFR4: Performance
- The application shall load pages within 2 seconds on standard broadband connections
- The application shall handle filtering operations without noticeable lag
- Charts and visualizations shall render smoothly

NFR5: Browser Compatibility
- The application shall support modern browsers (Chrome, Firefox, Safari, Edge)
- The application shall require JavaScript to be enabled
- The application shall require localStorage support

NFR6: Currency Display
- All monetary values throughout the application shall be displayed in Indian Rupees (₹)
- Currency formatting shall be consistent across all modules

NFR7: Accessibility
- The application shall use semantic HTML elements
- The application shall support keyboard navigation
- UI components shall follow accessibility best practices

## User Interface Design Goals

### Overall UX Vision

The Aziz Poultry Farm Management System provides a clean, professional interface designed for daily operational use. The design emphasizes clarity, efficiency, and quick access to critical information. The dashboard-centric approach allows users to quickly assess farm performance at a glance, while dedicated modules provide detailed management capabilities for specific operational areas.

### Key Interaction Paradigms

- **Dashboard-First Navigation**: Users land on a comprehensive dashboard showing KPIs and trends
- **Module-Based Organization**: Each major function (Inventory, Purchases, Sales, Expenses) has its own dedicated page
- **Contextual Filtering**: Date range filters appear in the header when relevant, allowing users to analyze specific time periods
- **Inline Editing**: Users can add, edit, and delete records directly from list views using modal dialogs
- **Visual Analytics**: Charts and graphs provide at-a-glance insights into farm performance

### Core Screens and Views

1. **Login Screen**: Simple authentication interface with demo credentials option
2. **Dashboard**: Main overview with KPIs, revenue trends, and expense breakdown charts
3. **Inventory Management**: List view with add/edit dialogs, low stock alerts, and date filtering
4. **Purchase Orders**: Table view with order management, status tracking, and date filtering
5. **Sales Tracking**: Sales records table with revenue analytics and date filtering
6. **Expense Management**: Expense tracking with category breakdown, recent expenses, and date filtering
7. **Financial Reports**: Comprehensive analytics with multiple chart types and KPI cards
8. **Farmers Management**: Master data management for farmers
9. **Retailers Management**: Master data management for retailers
10. **User Management**: User account administration with role management
11. **Settings**: System configuration and preferences

### Accessibility: WCAG AA

The application follows WCAG AA accessibility standards with semantic HTML, proper ARIA labels, keyboard navigation support, and sufficient color contrast.

### Branding

The application uses a green and blue color scheme reflecting agricultural and professional themes. The logo features a chicken emoji (🐔) and the brand name "Aziz Poultry" prominently displayed.

### Target Device and Platforms: Web Responsive

The application is designed as a responsive web application that works on desktop, tablet, and mobile devices. The layout adapts to different screen sizes with a collapsible sidebar and responsive grid layouts.

## Technical Assumptions

### Repository Structure: Monorepo

The project uses a single repository structure with all frontend code organized in a Next.js application structure.

### Service Architecture: Monolith (Frontend-Only)

The application is a client-side application using Next.js with all data stored in browser localStorage. There is no backend server - all operations are performed client-side. This is a single-page application architecture with client-side routing.

### Testing Requirements: Manual Testing

The application currently relies on manual testing. No automated test suite is implemented. Testing is performed through manual user interaction and browser-based validation.

### Additional Technical Assumptions and Requests

- The application uses Next.js App Router architecture
- React Context API is used for state management (date filter context)
- Date handling uses the `date-fns` library
- Chart rendering uses Recharts library
- Form validation uses React Hook Form with Zod schemas
- UI components are from shadcn/ui library built on Radix UI primitives
- The application uses Tailwind CSS v4 for styling
- Dark mode support is provided through next-themes library
- All data persistence is handled through browser localStorage (no backend API)
- The application runs on port 3002 by default (configurable)

## Epic List

Epic 1: Foundation & Authentication
Establish user authentication system, dashboard layout, and core navigation infrastructure enabling secure access to farm management features.

Epic 2: Core Business Operations - Inventory & Purchases
Implement inventory tracking with low stock alerts and purchase order management system for supplier relationship management.

Epic 3: Financial Operations - Sales & Expenses
Enable sales transaction recording and expense tracking with categorization, supporting revenue and cost management workflows.

Epic 4: Analytics & Reporting
Provide comprehensive financial reporting with visual analytics, charts, and key performance indicators for data-driven decision making.

Epic 5: Master Data & Administration
Implement master data management for farmers and retailers, along with user administration and system settings.

Epic 6: Advanced Filtering & Localization
Add date range filtering capabilities across financial modules and implement Indian Rupee currency display throughout the application.

## Epic 1: Foundation & Authentication

**Expanded Goal**: Establish the foundational infrastructure for the farm management system, including secure user authentication, responsive dashboard layout with sidebar navigation, and core routing structure. This epic delivers the entry point and navigation framework that enables all subsequent modules, ensuring users can securely access the system and navigate between different functional areas.

### Story 1.1: User Authentication System

As a farm manager,
I want to log in to the system with my credentials,
so that I can securely access farm management features.

**Acceptance Criteria:**
1. Login page displays email and password input fields
2. System validates user credentials and stores session in localStorage
3. Demo credentials (admin@azizpoultry.com / demo123) provide quick access
4. Unauthenticated users are redirected to login page
5. Authenticated users are redirected to dashboard after login
6. User session persists across page refreshes
7. Logout functionality clears session and redirects to login

### Story 1.2: Dashboard Layout & Navigation

As a system user,
I want a consistent navigation structure with sidebar menu,
so that I can easily access all modules of the farm management system.

**Acceptance Criteria:**
1. Dashboard layout component provides collapsible sidebar navigation
2. Sidebar displays all main module links (Dashboard, Inventory, Purchases, Sales, Expenses, Reports)
3. Sidebar displays master entries submenu (Farmers, Retailers)
4. Sidebar displays user management and settings links
5. Header displays current user email and role
6. Header includes logout button
7. Layout is responsive and adapts to different screen sizes
8. Active page is visually indicated in navigation

### Story 1.3: Dashboard Overview Page

As a farm manager,
I want to see key performance indicators and visual analytics on the dashboard,
so that I can quickly assess farm performance at a glance.

**Acceptance Criteria:**
1. Dashboard displays four KPI cards: Total Birds, Revenue (MTD), Expenses (MTD), Net Profit (MTD)
2. Revenue trends chart shows monthly revenue by product type (eggs and meat) as line chart
3. Expense breakdown pie chart displays distribution of expenses by category
4. All currency values are displayed in Indian Rupees (₹)
5. Charts are interactive with tooltips showing detailed values
6. Dashboard loads data from localStorage or displays sample data
7. Page is responsive and works on mobile devices

## Epic 2: Core Business Operations - Inventory & Purchases

**Expanded Goal**: Enable comprehensive inventory management with real-time stock tracking and automated alerts, combined with purchase order management for supplier relationship management. This epic delivers the core operational capabilities that allow farm managers to maintain optimal inventory levels and manage supplier orders efficiently.

### Story 2.1: Inventory Management System

As a farm manager,
I want to track inventory items (birds, feed, supplies) with quantities and minimum stock levels,
so that I can maintain optimal stock levels and prevent shortages.

**Acceptance Criteria:**
1. Inventory page displays list of all inventory items in a table
2. Users can add new inventory items with type, quantity, unit, and minimum stock level
3. Users can edit existing inventory items
4. Users can delete inventory items with confirmation
5. System displays low stock alerts for items at or below minimum stock level
6. Each inventory item shows last updated date
7. Inventory data persists in localStorage
8. Table displays item type, quantity, unit, min stock, status (In Stock/Low Stock), last updated, and actions

### Story 2.2: Purchase Order Management

As a farm manager,
I want to create and manage purchase orders from suppliers,
so that I can track orders, deliveries, and supplier relationships.

**Acceptance Criteria:**
1. Purchases page displays list of all purchase orders in a table
2. Users can create new purchase orders with supplier name, order date, due date, items (description, quantity, unit cost), status, and notes
3. System automatically calculates total order amount
4. Users can edit existing purchase orders
5. Users can delete purchase orders with confirmation
6. Order status can be: pending, received, or cancelled
7. System displays summary statistics: total orders count, pending orders count, total value
8. All amounts are displayed in Indian Rupees (₹)
9. Purchase order data persists in localStorage
10. Table displays order number, supplier, order date, due date, amount, status, and actions

### Story 2.3: Date Range Filtering for Inventory and Purchases

As a farm manager,
I want to filter inventory updates and purchase orders by date range,
so that I can analyze data for specific time periods.

**Acceptance Criteria:**
1. Date range filter appears in header on Inventory and Purchases pages
2. Filter uses calendar-based date range selector
3. When date range is selected, inventory shows only items updated within the range
4. When date range is selected, purchases show only orders within the date range
5. Filter persists across page navigation
6. Statistics automatically update based on filtered data
7. Users can clear the date filter to show all data

## Epic 3: Financial Operations - Sales & Expenses

**Expanded Goal**: Enable comprehensive sales transaction recording and expense tracking with categorization and analytics. This epic delivers the financial management capabilities that allow farm managers to track revenue, monitor expenses by category, and understand profitability through detailed financial data.

### Story 3.1: Sales Transaction Management

As a farm manager,
I want to record sales transactions with customer details and product information,
so that I can track revenue and monitor customer relationships.

**Acceptance Criteria:**
1. Sales page displays list of all sales transactions in a table
2. Users can create new sales with customer name, sale date, product type (eggs/meat/chicks/other), quantity, unit price, payment status, and notes
3. System automatically generates invoice numbers (INV-001, INV-002, etc.)
4. System automatically calculates total amount from quantity and unit price
5. Users can edit existing sales transactions
6. Users can delete sales transactions with confirmation
7. Payment status can be: paid, pending, or partial
8. System displays summary statistics: total sales count, total revenue, amount received
9. All amounts are displayed in Indian Rupees (₹)
10. Sales data persists in localStorage
11. Table displays invoice number, customer, date, product, quantity, amount, payment status, and actions

### Story 3.2: Expense Tracking and Categorization

As a farm manager,
I want to record and categorize expenses,
so that I can track costs and analyze spending patterns by category.

**Acceptance Criteria:**
1. Expenses page displays list of all expenses in a table
2. Users can create new expenses with date, category, description, amount, payment method, and notes
3. Expense categories include: feed, labor, medicine, utilities, equipment, maintenance, transportation, other
4. Payment methods include: cash, bank transfer, check, credit card
5. Users can edit existing expenses
6. Users can delete expenses with confirmation
7. System displays summary statistics: total expenses, monthly expenses, average expense
8. System provides category breakdown showing expenses by category with amounts and percentages
9. System displays recent expenses list (last 5)
10. All amounts are displayed in Indian Rupees (₹)
11. Expense data persists in localStorage
12. Table displays date, category, description, amount, payment method, and actions

### Story 3.3: Date Range Filtering for Sales and Expenses

As a farm manager,
I want to filter sales and expenses by date range,
so that I can analyze financial performance for specific periods.

**Acceptance Criteria:**
1. Date range filter appears in header on Sales and Expenses pages
2. Filter uses calendar-based date range selector
3. When date range is selected, sales show only transactions within the range
4. When date range is selected, expenses show only transactions within the range
5. Filter persists across page navigation
6. Statistics and summaries automatically update based on filtered data
7. Category breakdown updates based on filtered expenses
8. Users can clear the date filter to show all data

## Epic 4: Analytics & Reporting

**Expanded Goal**: Provide comprehensive financial reporting with visual analytics, charts, and key performance indicators that enable data-driven decision making. This epic delivers the analytical capabilities that transform raw operational data into actionable insights for farm management.

### Story 4.1: Financial Reports Dashboard

As a farm manager,
I want to view comprehensive financial reports with visual analytics,
so that I can make data-driven decisions about farm operations.

**Acceptance Criteria:**
1. Reports page displays key financial metrics: Total Revenue (6M), Total Expenses (6M), Total Profit (6M), Average Monthly Profit
2. Monthly Revenue vs Expenses bar chart shows comparison over 6 months
3. Monthly Net Profit line chart shows profitability trends
4. Expense Distribution pie chart shows breakdown by category
5. Sales Performance line chart shows product type analysis (eggs vs meat)
6. KPI cards display: Revenue Per Month, Expense Per Month, Profit Per Month, ROI percentage
7. All currency values are displayed in Indian Rupees (₹)
8. Charts are interactive with tooltips
9. Reports use sample data or data from localStorage if available

## Epic 5: Master Data & Administration

**Expanded Goal**: Enable management of master data entities (farmers and retailers) and provide user administration capabilities for system access control. This epic delivers the administrative functions that support relationship management and system user management.

### Story 5.1: Farmers Master Data Management

As a farm manager,
I want to manage farmer master data,
so that I can maintain records of farmers associated with the farm operations.

**Acceptance Criteria:**
1. Farmers page displays list of farmers
2. Users can add, edit, and delete farmer records
3. Farmer data persists in localStorage
4. Page follows consistent UI patterns with other master data pages

### Story 5.2: Retailers Master Data Management

As a farm manager,
I want to manage retailer master data,
so that I can maintain records of retailers who purchase farm products.

**Acceptance Criteria:**
1. Retailers page displays list of retailers
2. Users can add, edit, and delete retailer records
3. Retailer data includes contact information and purchase history
4. Retailer data persists in localStorage
5. Page follows consistent UI patterns with other master data pages

### Story 5.3: User Management System

As a system administrator,
I want to manage user accounts and roles,
so that I can control access to system features based on user responsibilities.

**Acceptance Criteria:**
1. Users page displays list of all user accounts in a table
2. Administrators can add new users with name, role (admin/manager/staff), and status (active/inactive)
3. Administrators can edit existing user accounts
4. Administrators can delete user accounts with confirmation
5. System displays user statistics: total users, active users count, administrators count
6. System displays role permissions information showing features available to each role
7. User data persists in localStorage
8. Table displays name, role, status, join date, last login, and actions
9. Email field is not displayed in the user management interface (removed per requirements)

### Story 5.4: System Settings

As a system administrator,
I want to configure system settings,
so that I can customize the application behavior and preferences.

**Acceptance Criteria:**
1. Settings page provides configuration options
2. Settings include currency selection (with INR/₹ as default)
3. Settings data persists in localStorage
4. Settings changes apply across the application

## Epic 6: Advanced Filtering & Localization

**Expanded Goal**: Enhance data analysis capabilities with persistent date range filtering across financial modules and ensure consistent Indian Rupee currency display throughout the application. This epic delivers improved usability for financial analysis and proper localization for the Indian market.

### Story 6.1: Global Date Range Filter Context

As a farm manager,
I want date range filters to persist across page navigation,
so that I can maintain my analysis context while exploring different modules.

**Acceptance Criteria:**
1. Date range filter state is managed through React Context API
2. Selected date range persists in browser localStorage
3. Date range is restored when user navigates between pages
4. Filter appears in header on Inventory, Purchases, Sales, and Expenses pages
5. Filter state is shared across all applicable pages
6. Users can clear the filter to reset to showing all data

### Story 6.2: Indian Rupee Currency Display

As a farm manager in India,
I want all currency values displayed in Indian Rupees,
so that financial data is presented in the local currency format.

**Acceptance Criteria:**
1. All currency values throughout the application display Indian Rupee symbol (₹)
2. Dashboard KPIs show amounts in ₹
3. Sales module displays revenue and amounts in ₹
4. Purchases module displays order amounts in ₹
5. Expenses module displays expense amounts in ₹
6. Reports module displays all financial metrics in ₹
7. Chart tooltips display currency values in ₹
8. Currency formatting is consistent across all modules

## Checklist Results Report

_This section will be populated after running the PM checklist._

## Next Steps

### UX Expert Prompt

Create a comprehensive UX design specification for the Aziz Poultry Farm Management System based on this PRD. Focus on user flows, interaction patterns, and visual design guidelines that support the functional requirements outlined above.

### Architect Prompt

Design the technical architecture for the Aziz Poultry Farm Management System based on this PRD. The system is currently implemented as a Next.js frontend-only application with localStorage persistence. Document the current architecture, identify areas for improvement, and propose any enhancements needed to support the requirements.

