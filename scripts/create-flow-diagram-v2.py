"""
Enhanced script to create flow diagrams from Excel requirements document
Creates user flow diagrams based on screen names and logical connections
"""

import sys
import os
import pandas as pd
from pathlib import Path
import re

def read_excel_file(file_path):
    """Read Excel file and return all sheets as a dictionary"""
    try:
        excel_file = pd.ExcelFile(file_path)
        sheets_data = {}
        
        for sheet_name in excel_file.sheet_names:
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            sheets_data[sheet_name] = df
        
        return sheets_data
    except Exception as e:
        print(f"Error reading Excel file: {e}")
        return None

def extract_screens_from_requirements(df):
    """Extract unique screen names from requirements document"""
    screens = []
    
    # Look for screen names in the 'Screen Name' column
    if 'Screen Name' in df.columns:
        for idx, row in df.iterrows():
            screen_name = row.get('Screen Name', '')
            if pd.notna(screen_name) and str(screen_name).strip():
                screen_name_clean = str(screen_name).strip()
                if screen_name_clean and screen_name_clean.lower() != 'nan':
                    screens.append(screen_name_clean)
    
    # Remove duplicates while preserving order
    seen = set()
    unique_screens = []
    for screen in screens:
        if screen not in seen:
            seen.add(screen)
            unique_screens.append(screen)
    
    return unique_screens

def create_user_flow_diagram(screens, output_file):
    """Create a user flow diagram based on screen names"""
    
    # Define logical flow connections
    flow_map = {
        'User Authentication System': ['Dashboard Overview'],
        'Dashboard Overview': ['Inventory Management', 'Purchase Management', 'Sales Management', 'Expense Management', 'Reports', 'User Management'],
        'Inventory Management': ['Purchase Management', 'Sales Management'],
        'Purchase Management': ['Inventory Management', 'Expense Management'],
        'Sales Management': ['Inventory Management', 'Reports'],
        'Expense Management': ['Reports'],
        'Reports': ['Dashboard Overview'],
        'User Management': ['Dashboard Overview'],
    }
    
    mermaid_code = "```mermaid\nflowchart TD\n"
    
    # Add start node
    mermaid_code += "    Start([Start]) --> Login[User Authentication System]\n"
    mermaid_code += "    Login --> Dashboard{Dashboard Overview}\n\n"
    
    # Add main screens
    main_screens = ['Inventory Management', 'Purchase Management', 'Sales Management', 
                    'Expense Management', 'Reports', 'User Management']
    
    for screen in main_screens:
        if screen in screens:
            screen_id = screen.replace(' ', '_').replace('-', '_')
            mermaid_code += f"    Dashboard --> {screen_id}[\"{screen}\"]\n"
    
    # Add connections between screens
    connections = [
        ('Inventory_Management', 'Purchase_Management'),
        ('Inventory_Management', 'Sales_Management'),
        ('Purchase_Management', 'Expense_Management'),
        ('Sales_Management', 'Reports'),
        ('Expense_Management', 'Reports'),
        ('Reports', 'Dashboard'),
    ]
    
    for source, target in connections:
        if source.replace('_', ' ') in screens or target.replace('_', ' ') in screens:
            mermaid_code += f"    {source} --> {target}\n"
    
    # Add return to dashboard
    mermaid_code += "\n    Reports --> Dashboard\n"
    mermaid_code += "    User_Management --> Dashboard\n"
    
    mermaid_code += "\n    style Start fill:#228B22,stroke:#166534,stroke-width:2px,color:#fff\n"
    mermaid_code += "    style Login fill:#3b82f6,stroke:#1e40af,stroke-width:2px,color:#fff\n"
    mermaid_code += "    style Dashboard fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff\n"
    mermaid_code += "```"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(mermaid_code)
    
    print(f"Mermaid flow diagram created: {output_file}")
    return mermaid_code

def create_detailed_flow_diagram(screens, sheets_data, output_file):
    """Create a detailed HTML flow diagram with all screens"""
    
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Flow Diagram - Aziz Poultry</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            background: linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%);
            margin: 0;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 {
            color: #228B22;
            border-bottom: 3px solid #228B22;
            padding-bottom: 15px;
            margin-bottom: 30px;
        }
        h2 {
            color: #323232;
            margin-top: 40px;
            margin-bottom: 20px;
        }
        .mermaid {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        .screens-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .screen-card {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #228B22;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .screen-card h3 {
            margin: 0 0 10px 0;
            color: #228B22;
            font-size: 16px;
        }
        .data-table {
            margin-top: 30px;
            overflow-x: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 14px;
        }
        th, td {
            border: 1px solid #e5e7eb;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #228B22;
            color: white;
            font-weight: 600;
        }
        tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .info-box {
            background: #dbeafe;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🐔 Aziz Poultry Farm Management System - User Flow Diagram</h1>
        
        <div class="info-box">
            <strong>Total Screens Identified:</strong> """ + str(len(screens)) + """
        </div>
        
        <h2>User Flow Diagram</h2>
        <div class="mermaid">
"""
    
    # Create comprehensive flow diagram
    mermaid_code = "flowchart TD\n"
    
    # Start and Login
    mermaid_code += "    Start([User Starts]) --> Login[User Authentication System]\n"
    mermaid_code += "    Login --> Dashboard{Dashboard Overview}\n\n"
    
    # Main modules
    modules = {
        'Inventory Management': ['View Inventory', 'Add Item', 'Update Stock', 'Low Stock Alerts'],
        'Purchase Management': ['View Orders', 'Create Order', 'Track Delivery', 'Supplier Management'],
        'Sales Management': ['Record Sale', 'View Sales', 'Customer Management', 'Payment Tracking'],
        'Expense Management': ['Record Expense', 'View Expenses', 'Category Analysis'],
        'Reports': ['Financial Reports', 'Sales Reports', 'Expense Reports', 'Profit Analysis'],
        'User Management': ['View Users', 'Add User', 'Manage Roles', 'Permissions'],
    }
    
    # Add modules
    for module, sub_features in modules.items():
        if any(s in screens for s in [module] + sub_features):
            module_id = module.replace(' ', '_').replace('-', '_')
            mermaid_code += f"    Dashboard --> {module_id}[\"{module}\"]\n"
    
    # Add connections
    mermaid_code += "\n    Inventory_Management --> Purchase_Management\n"
    mermaid_code += "    Inventory_Management --> Sales_Management\n"
    mermaid_code += "    Purchase_Management --> Expense_Management\n"
    mermaid_code += "    Sales_Management --> Reports\n"
    mermaid_code += "    Expense_Management --> Reports\n"
    mermaid_code += "    Reports --> Dashboard\n"
    mermaid_code += "    User_Management --> Dashboard\n"
    
    # Styling
    mermaid_code += "\n    style Start fill:#228B22,stroke:#166534,stroke-width:3px,color:#fff\n"
    mermaid_code += "    style Login fill:#3b82f6,stroke:#1e40af,stroke-width:2px,color:#fff\n"
    mermaid_code += "    style Dashboard fill:#10b981,stroke:#059669,stroke-width:3px,color:#fff\n"
    mermaid_code += "    style Inventory_Management fill:#fef3c7,stroke:#f59e0b,stroke-width:2px\n"
    mermaid_code += "    style Purchase_Management fill:#dbeafe,stroke:#3b82f6,stroke-width:2px\n"
    mermaid_code += "    style Sales_Management fill:#dcfce7,stroke:#10b981,stroke-width:2px\n"
    mermaid_code += "    style Expense_Management fill:#fee2e2,stroke:#ef4444,stroke-width:2px\n"
    mermaid_code += "    style Reports fill:#e9d5ff,stroke:#a855f7,stroke-width:2px\n"
    mermaid_code += "    style User_Management fill:#f3e8ff,stroke:#9333ea,stroke-width:2px\n"
    
    html_content += mermaid_code
    html_content += """        </div>
        
        <h2>Identified Screens</h2>
        <div class="screens-list">
"""
    
    # Add screen cards
    for screen in screens:
        html_content += f"""            <div class="screen-card">
                <h3>{screen}</h3>
            </div>
"""
    
    html_content += """        </div>
        
        <h2>Source Data</h2>
"""
    
    # Add data tables
    for sheet_name, df in sheets_data.items():
        html_content += f"<h3>{sheet_name}</h3>\n"
        html_content += df.to_html(classes='data-table', table_id=f'table-{sheet_name.replace(" ", "-")}', escape=False, index=False)
        html_content += "<br><br>\n"
    
    html_content += """    </div>
    
    <script>
        mermaid.initialize({ 
            startOnLoad: true, 
            theme: 'default',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            }
        });
    </script>
</body>
</html>"""
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"HTML flow diagram created: {output_file}")
    return html_content

def main():
    excel_files = [
        "docs/Requirment Document .xlsx",
        "Documentss/Requirment Document .xlsx",
    ]
    
    excel_path = None
    for path in excel_files:
        if os.path.exists(path):
            excel_path = path
            break
    
    if not excel_path:
        print("Excel file not found.")
        return
    
    print(f"Reading Excel file: {excel_path}\n")
    
    sheets_data = read_excel_file(excel_path)
    if not sheets_data:
        print("Failed to read Excel file.")
        return
    
    # Extract screens from requirements
    req_df = sheets_data.get('Requirment Document', pd.DataFrame())
    screens = extract_screens_from_requirements(req_df)
    
    print(f"\nFound {len(screens)} unique screens:")
    for i, screen in enumerate(screens, 1):
        print(f"  {i}. {screen}")
    
    # Create output directory
    output_dir = Path("docs/flow-diagrams")
    output_dir.mkdir(exist_ok=True)
    
    # Create flow diagrams
    mermaid_file = output_dir / "user-flow-diagram.mmd"
    create_user_flow_diagram(screens, mermaid_file)
    
    html_file = output_dir / "user-flow-diagram.html"
    create_detailed_flow_diagram(screens, sheets_data, html_file)
    
    print(f"\n✅ Flow diagrams created successfully!")
    print(f"   - Mermaid file: {mermaid_file}")
    print(f"   - HTML file: {html_file}")
    print(f"\nOpen {html_file} in your browser to view the interactive diagram!")

if __name__ == "__main__":
    main()

