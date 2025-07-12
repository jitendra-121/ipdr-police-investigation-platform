import pandas as pd
import sys
from pathlib import Path
import json
from datetime import datetime, date
import numpy as np

def clean_value_for_display(value):
    """Clean a value for display purposes"""
    if pd.isna(value) or value is None:
        return "NULL"
    elif isinstance(value, (datetime, pd.Timestamp)):
        return f"TIMESTAMP: {value.strftime('%Y-%m-%d %H:%M:%S')}"
    elif isinstance(value, date):
        return f"DATE: {value.strftime('%Y-%m-%d')}"
    elif isinstance(value, np.integer):
        return f"INTEGER: {int(value)}"
    elif isinstance(value, float) and value.is_integer():
        return f"INTEGER: {int(value)}"
    elif isinstance(value, float):
        return f"FLOAT: {value}"
    elif isinstance(value, str):
        return f"TEXT: '{value}'"
    else:
        return f"{type(value).__name__}: {value}"

def analyze_file(file_path):
    """Analyze a file and print its structure"""
    file_extension = Path(file_path).suffix.lower()
    
    try:
        if file_extension == '.csv':
            df = pd.read_csv(file_path)
        elif file_extension in ['.xlsx', '.xls']:
            # Check if it's a multi-sheet Excel file
            excel_file = pd.ExcelFile(file_path)
            sheet_names = excel_file.sheet_names
            
            if len(sheet_names) > 1:
                print(f"\n📊 Multi-sheet Excel file detected with {len(sheet_names)} sheets:")
                for i, sheet in enumerate(sheet_names):
                    print(f"  {i+1}. {sheet}")
                sheet_idx = int(input("\nSelect sheet to analyze (enter number): ")) - 1
                if 0 <= sheet_idx < len(sheet_names):
                    df = pd.read_excel(file_path, sheet_name=sheet_names[sheet_idx])
                    print(f"\nAnalyzing sheet: {sheet_names[sheet_idx]}")
                else:
                    print("Invalid selection!")
                    return
            else:
                df = pd.read_excel(file_path)
        else:
            print(f"Unsupported file type: {file_extension}")
            return
        
        # Basic info
        print(f"\n=== File Analysis: {Path(file_path).name} ===")
        print(f"Records: {len(df)}")
        print(f"Columns: {len(df.columns)}")
        
        # Column names and types
        print("\n=== Column Structure ===")
        for col in df.columns:
            # Get a sample non-null value if available
            sample_values = df[col].dropna().head(3).tolist()
            sample_str = ", ".join([clean_value_for_display(val) for val in sample_values[:3]]) if sample_values else "No non-null values"
            
            print(f"• {col}")
            print(f"  - Python type: {df[col].dtype}")
            print(f"  - Sample values: {sample_str}")
            print(f"  - Null count: {df[col].isna().sum()} ({df[col].isna().sum() / len(df) * 100:.1f}%)")
        
        # Generate recommended schema
        print("\n=== Recommended Schema ===")
        
        # For bank_details
        if any(col in df.columns for col in ['ac_no', 'tran_date', 'tran_id', 'dr_amt', 'cr_amt', 'balance']):
            print("\nRECOMMENDED SCHEMA FOR bank_details:")
            print("```sql")
            print("CREATE TABLE public.bank_details (")
            print("    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,")
            for col in df.columns:
                col_type = "text"  # Default
                
                # Check column name and data type
                if 'ac_no' in col.lower():
                    col_type = "bigint"
                elif any(date_term in col.lower() for date_term in ['date', 'time']):
                    if df[col].dtype == 'datetime64[ns]':
                        col_type = "timestamp with time zone"
                    else:
                        col_type = "date"
                elif any(amount_term in col.lower() for amount_term in ['amt', 'amount', 'dr_', 'cr_', 'balance']):
                    col_type = "numeric(15,2)"
                elif 'id' in col.lower() or 'tran_id' in col.lower():
                    col_type = "character varying(50)"
                
                print(f"    {col} {col_type} NOT NULL,")
            print("    CONSTRAINT bank_details_pkey PRIMARY KEY (id)")
            print(");")
            print("```")
        
        # For sms_header
        if any(col.lower() in ['header', 'message', 'text', 'sms', 'content'] for col in df.columns):
            print("\nRECOMMENDED SCHEMA FOR sms_header:")
            print("```sql")
            print("CREATE TABLE public.sms_header (")
            print("    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,")
            
            # Map columns to header and principal_entity_name
            header_col = None
            entity_col = None
            
            for col in df.columns:
                if col.lower() in ['header', 'message', 'text', 'sms', 'content']:
                    header_col = col
                elif col.lower() in ['entity', 'principal', 'sender', 'from', 'source']:
                    entity_col = col
            
            # If we found header column
            if header_col:
                print(f"    header text NULL,  -- Mapped from '{header_col}'")
            else:
                print("    header text NULL,  -- No matching column found")
                
            # If we found entity column
            if entity_col:
                print(f"    principal_entity_name text NULL,  -- Mapped from '{entity_col}'")
            else:
                print("    principal_entity_name text NULL,  -- No matching column found")
                
            print("    CONSTRAINT sms_header_pkey PRIMARY KEY (id)")
            print(");")
            print("```")
            
            # Suggest column mapping
            print("\nSUGGESTED COLUMN MAPPING:")
            for col in df.columns:
                if col.lower() in ['header', 'message', 'text', 'sms', 'content']:
                    print(f"'{col}' -> 'header'")
                elif col.lower() in ['entity', 'principal', 'sender', 'from', 'source']:
                    print(f"'{col}' -> 'principal_entity_name'")
                else:
                    print(f"'{col}' -> Not mapped (additional column)")
        
    except Exception as e:
        print(f"Error analyzing file: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
        analyze_file(file_path)
    else:
        # Ask user to select a file
        from tkinter import Tk, filedialog
        root = Tk()
        root.withdraw()
        file_path = filedialog.askopenfilename(
            title="Select a file to analyze",
            filetypes=[
                ("Data files", "*.csv;*.xlsx;*.xls"),
                ("CSV files", "*.csv"),
                ("Excel files", "*.xlsx;*.xls"),
                ("All files", "*.*")
            ]
        )
        root.destroy()
        
        if file_path:
            analyze_file(file_path)
        else:
            print("No file selected.") 