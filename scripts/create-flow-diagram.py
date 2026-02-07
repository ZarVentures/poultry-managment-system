"""
Script to read Excel file and create a flow diagram
Supports multiple formats: Mermaid (markdown), Graphviz (DOT), and HTML visualization
"""

import sys
import os
import pandas as pd
from pathlib import Path

def read_excel_file(file_path):
    """Read Excel file and return all sheets as a dictionary"""
    try:
        # Read all sheets
        excel_file = pd.ExcelFile(file_path)
        sheets_data = {}
        
        print(f"Found {len(excel_file.sheet_names)} sheet(s): {excel_file.sheet_names}")
        
        for sheet_name in excel_file.sheet_names:
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            sheets_data[sheet_name] = df
            print(f"\nSheet: {sheet_name}")
            print(f"  Rows: {len(df)}, Columns: {len(df.columns)}")
            print(f"  Columns: {list(df.columns)}")
            print(f"  First few rows:")
            print(df.head().to_string())
            print("-" * 80)
        
        return sheets_data
    except Exception as e:
        print(f"Error reading Excel file: {e}")
        return None

def create_mermaid_flow_diagram(sheets_data, output_file):
    """Create a Mermaid flow diagram from Excel data"""
    mermaid_code = "```mermaid\nflowchart TD\n"
    
    # Try to identify flow relationships from the data
    for sheet_name, df in sheets_data.items():
        if df.empty:
            continue
            
        # Add sheet as a subgraph
        mermaid_code += f"    subgraph {sheet_name.replace(' ', '_')}[\"{sheet_name}\"]\n"
        
        # Process rows - assume first column is node name, others are connections
        for idx, row in df.iterrows():
            if pd.notna(row.iloc[0]):  # First column as node name
                node_name = str(row.iloc[0]).replace(' ', '_').replace('-', '_')
                node_label = str(row.iloc[0])
                
                # Add node
                mermaid_code += f"        {node_name}[\"{node_label}\"]\n"
                
                # Check for connections in other columns
                for col_idx in range(1, len(row)):
                    if pd.notna(row.iloc[col_idx]):
                        target = str(row.iloc[col_idx]).replace(' ', '_').replace('-', '_')
                        mermaid_code += f"        {node_name} --> {target}\n"
        
        mermaid_code += "    end\n\n"
    
    mermaid_code += "```"
    
    # Write to file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(mermaid_code)
    
    print(f"\nMermaid diagram created: {output_file}")
    return mermaid_code

def create_detailed_flow_diagram(sheets_data, output_file):
    """Create a more detailed HTML flow diagram"""
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flow Diagram</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #228B22;
            padding-bottom: 10px;
        }
        .mermaid {
            text-align: center;
            margin: 20px 0;
        }
        .data-table {
            margin-top: 30px;
            overflow-x: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #228B22;
            color: white;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Flow Diagram - Aziz Poultry Farm Management System</h1>
        <div class="mermaid">
"""
    
    # Generate Mermaid diagram
    mermaid_code = "flowchart TD\n"
    
    for sheet_name, df in sheets_data.items():
        if df.empty:
            continue
        
        mermaid_code += f"    subgraph {sheet_name.replace(' ', '_').replace('-', '_')}[\"{sheet_name}\"]\n"
        
        nodes = set()
        connections = []
        
        for idx, row in df.iterrows():
            if pd.notna(row.iloc[0]):
                source = str(row.iloc[0]).strip()
                if source:
                    node_id = source.replace(' ', '_').replace('-', '_').replace('(', '').replace(')', '')
                    nodes.add((node_id, source))
                    
                    # Check for connections
                    for col_idx in range(1, len(row)):
                        if pd.notna(row.iloc[col_idx]):
                            target = str(row.iloc[col_idx]).strip()
                            if target:
                                target_id = target.replace(' ', '_').replace('-', '_').replace('(', '').replace(')', '')
                                connections.append((node_id, target_id))
                                nodes.add((target_id, target))
        
        # Add nodes
        for node_id, node_label in nodes:
            mermaid_code += f"        {node_id}[\"{node_label}\"]\n"
        
        # Add connections
        for source, target in connections:
            mermaid_code += f"        {source} --> {target}\n"
        
        mermaid_code += "    end\n\n"
    
    html_content += mermaid_code
    html_content += """        </div>
        
        <div class="data-table">
            <h2>Source Data</h2>
"""
    
    # Add data tables
    for sheet_name, df in sheets_data.items():
        html_content += f"<h3>{sheet_name}</h3>\n"
        html_content += df.to_html(classes='data-table', table_id=f'table-{sheet_name.replace(" ", "-")}', escape=False)
        html_content += "<br><br>\n"
    
    html_content += """        </div>
    </div>
    
    <script>
        mermaid.initialize({ startOnLoad: true, theme: 'default' });
    </script>
</body>
</html>"""
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"\nHTML flow diagram created: {output_file}")
    return html_content

def main():
    # Find Excel file
    excel_files = [
        "docs/Requirment Document .xlsx",
        "Documentss/Requirment Document .xlsx",
        "docs/Requirement Document.xlsx"
    ]
    
    excel_path = None
    for path in excel_files:
        if os.path.exists(path):
            excel_path = path
            break
    
    if not excel_path:
        print("Excel file not found. Please provide the path to your Excel file.")
        print("Looking for files in:")
        for path in excel_files:
            print(f"  - {path}")
        return
    
    print(f"Reading Excel file: {excel_path}\n")
    
    # Read Excel file
    sheets_data = read_excel_file(excel_path)
    
    if not sheets_data:
        print("Failed to read Excel file.")
        return
    
    # Create output directory
    output_dir = Path("docs/flow-diagrams")
    output_dir.mkdir(exist_ok=True)
    
    # Create Mermaid markdown file
    mermaid_file = output_dir / "flow-diagram.mmd"
    create_mermaid_flow_diagram(sheets_data, mermaid_file)
    
    # Create HTML visualization
    html_file = output_dir / "flow-diagram.html"
    create_detailed_flow_diagram(sheets_data, html_file)
    
    print(f"\n✅ Flow diagrams created successfully!")
    print(f"   - Mermaid file: {mermaid_file}")
    print(f"   - HTML file: {html_file}")
    print(f"\nYou can:")
    print(f"   1. Open {html_file} in a browser to view the diagram")
    print(f"   2. Use the Mermaid file in Markdown or Mermaid Live Editor")
    print(f"   3. Import the Mermaid code into tools like Draw.io, Notion, or GitHub")

if __name__ == "__main__":
    main()

