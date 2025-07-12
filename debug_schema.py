import sys
from pathlib import Path
import pandas as pd
from schema_mapper import SchemaMapper
from files import FileProcessor

def debug_schema_matching(file_path):
    """Debug schema matching for a specific file"""
    file_extension = Path(file_path).suffix.lower()
    
    # Determine file type
    if file_extension == '.csv':
        file_type = 'csv'
    elif file_extension in ['.xlsx', '.xls']:
        file_type = 'excel'
    elif file_extension in ['.docx', '.doc']:
        file_type = 'word'
    else:
        print(f"Unsupported file type: {file_extension}")
        return
    
    # Process file
    processor = FileProcessor(verbose=True)
    data = processor.process_file(file_path, file_type)
    
    if not data:
        print("❌ Failed to extract data from file")
        return
    
    # Handle multi-sheet Excel files
    if isinstance(data, dict) and file_type == 'excel':
        print("📊 Multi-sheet Excel detected")
        sheet_names = list(data.keys())
        
        print(f"Available sheets: {', '.join(sheet_names)}")
        if len(sheet_names) > 1:
            sheet_idx = int(input(f"Select sheet to analyze (1-{len(sheet_names)}): ")) - 1
            if 0 <= sheet_idx < len(sheet_names):
                sheet_name = sheet_names[sheet_idx]
                sheet_data = data[sheet_name]
                print(f"\nAnalyzing sheet: {sheet_name}")
                analyze_data(sheet_data, processor.schema_mapper)
            else:
                print("Invalid selection!")
        else:
            # Only one sheet
            sheet_name = sheet_names[0]
            sheet_data = data[sheet_name]
            print(f"\nAnalyzing sheet: {sheet_name}")
            analyze_data(sheet_data, processor.schema_mapper)
    
    # Handle single data structure (CSV, single Excel sheet, Word tables)
    elif isinstance(data, list):
        analyze_data(data, processor.schema_mapper)
    else:
        print("❌ Unsupported data structure for analysis")

def analyze_data(data, schema_mapper):
    """Analyze data structure and match against schemas"""
    if not data or not isinstance(data, list):
        print("❌ No valid data to analyze")
        return
    
    print(f"\n📊 Analyzing data structure ({len(data)} records)...")
    
    # Show sample data
    print("\n📋 Sample Data (first record):")
    sample = data[0]
    for key, value in sample.items():
        print(f"   • {key}: {type(value).__name__} = {value}")
    
    # Analyze data structure
    data_structure = schema_mapper.analyze_data_structure(data)
    print(f"\n📋 Columns: {', '.join(data_structure['columns'])}")
    
    # Show available tables
    print("\n📋 Available tables:")
    for table_name in sorted(schema_mapper.table_schemas.keys()):
        required_cols = schema_mapper.table_schemas[table_name]["required_columns"]
        print(f"   • {table_name} (required: {', '.join(required_cols)})")
    
    # Calculate match scores for all tables
    print("\n📊 Match scores for all tables:")
    all_scores = {}
    for table_name in schema_mapper.table_schemas.keys():
        score = schema_mapper._calculate_match_score(
            data_structure["columns"], 
            data_structure, 
            schema_mapper.table_schemas[table_name]
        )
        all_scores[table_name] = score
    
    # Sort by score descending and display
    for table_name, score in sorted(all_scores.items(), key=lambda x: x[1], reverse=True):
        print(f"   • {table_name}: {score:.2f}" + (" ✓" if score >= 0.6 else " ✗"))
    
    # Get best match
    best_match = max(all_scores.items(), key=lambda x: x[1])
    best_table, best_score = best_match
    
    print(f"\n🏆 Best match: {best_table} (score: {best_score:.2f})")
    
    # If best score is above threshold, validate data
    if best_score >= 0.6:
        print(f"\n✅ Match found: '{best_table}' with confidence {best_score:.2f}")
        
        # Show column mapping
        schema = schema_mapper.table_schemas[best_table]
        column_mapping = schema_mapper._get_column_mapping(data_structure["columns"], schema)
        
        print("\n📋 Column Mapping:")
        for data_col, schema_col in column_mapping.items():
            print(f"   • {data_col} -> {schema_col}")
        
        # Validate data
        is_valid, validation_errors = schema_mapper.validate_data_for_table(data, best_table)
        
        if is_valid:
            print("\n✅ Data is valid for this table")
        else:
            print("\n❌ Data validation failed:")
            for error in validation_errors:
                print(f"   • {error}")
    else:
        print(f"\n❌ No match found (best score {best_score:.2f} < threshold 0.6)")
        
        # Suggest how to improve matching
        print("\n💡 Suggestions to improve matching:")
        print("   1. Check column names against required columns")
        print("   2. Add relevant keywords to column names")
        print("   3. Update schema_mapper.py with new aliases")
        print("   4. Lower the threshold (currently 0.6)")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
        debug_schema_matching(file_path)
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
            debug_schema_matching(file_path)
        else:
            print("No file selected.") 