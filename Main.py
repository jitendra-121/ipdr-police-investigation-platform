import os
import sys
import tkinter as tk
from tkinter import filedialog, messagebox
from pathlib import Path
import mimetypes

class FileSelector:
    def __init__(self):
        self.selected_files = []
        self.file_types = {}
        
    def detect_file_type(self, file_path):
        """Detect file type based on extension and MIME type"""
        file_extension = Path(file_path).suffix.lower()
        mime_type, _ = mimetypes.guess_type(file_path)
        
        # Map extensions to file types
        type_mapping = {
            '.pdf': 'pdf',
            '.csv': 'csv',
            '.xlsx': 'excel',
            '.xls': 'excel',
            '.docx': 'word',
            '.doc': 'word'
        }
        
        return type_mapping.get(file_extension, 'unknown')
    
    def select_files_with_dialog(self):
        """Use tkinter file dialog to select multiple supported files"""
        try:
            # Create root window but hide it
            root = tk.Tk()
            root.withdraw()
            root.attributes('-topmost', True)
            
            # Open file dialog with multiple selection enabled
            file_paths = filedialog.askopenfilenames(
                title="Select files to process",
                filetypes=[
                    ("All Supported", "*.pdf;*.csv;*.xlsx;*.xls;*.docx;*.doc"),
                    ("PDF files", "*.pdf"),
                    ("CSV files", "*.csv"),
                    ("Excel files", "*.xlsx;*.xls"),
                    ("Word files", "*.docx;*.doc"),
                    ("All files", "*.*")
                ],
                initialdir=os.getcwd()
            )
            
            # Destroy the root window
            root.destroy()
            
            if not file_paths:
                print("No files selected.")
                return []
                
            return list(file_paths)
            
        except Exception as e:
            print(f"Error opening file dialog: {e}")
            return []
    
    def select_files(self):
        """Main method to select files and determine their types"""
        print("\n" + "="*70)
        print("🚀 DYNAMIC FILE PROCESSOR WITH SUPABASE INTEGRATION")
        print("="*70)
        print("\nSupported file types:")
        print("  📄 PDF files (.pdf) - Interactive chat with GPT-4")
        print("  📊 CSV files (.csv) - Auto-detect schema & insert to Supabase")
        print("  📈 Excel files (.xlsx, .xls) - Auto-detect schema & insert to Supabase")
        print("  📝 Word files (.docx, .doc) - Extract tables & insert to Supabase")
        print("-"*70)
        print("🗄️  Available Supabase Tables:")
        print("   • bank_details    • crd           • ipdr")
        print("   • sms_header      • tower_dumps   • true_caller")
        print("   • subscriber")
        print("-"*70)
        
        # Check for files in current directory
        supported_extensions = ['.pdf', '.csv', '.xlsx', '.xls', '.docx', '.doc']
        local_files = []
        
        for ext in supported_extensions:
            local_files.extend(Path('.').glob(f'*{ext}'))
        
        if local_files:
            print(f"\nFound {len(local_files)} supported file(s) in current directory:")
            for file in local_files[:10]:  # Show max 10 files
                file_type = self.detect_file_type(str(file)).upper()
                print(f"  - {file.name} ({file_type})")
            if len(local_files) > 10:
                print(f"  ... and {len(local_files) - 10} more files")
            
            choice = input("\nSelect option:\n1. Browse for files\n2. Select from current directory\nEnter choice (1 or 2): ").strip()
            
            if choice == "2":
                print("\nAvailable files:")
                for i, file in enumerate(local_files, 1):
                    file_type = self.detect_file_type(str(file)).upper()
                    print(f"{i}. {file.name} ({file_type})")
                
                try:
                    # Allow multiple selections from local files
                    file_choices = input("\nSelect files (enter numbers separated by commas): ").strip()
                    selected_indices = [int(idx.strip()) - 1 for idx in file_choices.split(',')]
                    
                    # Validate all indices
                    valid_indices = [idx for idx in selected_indices if 0 <= idx < len(local_files)]
                    
                    if valid_indices:
                        self.selected_files = [str(local_files[idx]) for idx in valid_indices]
                    else:
                        print("No valid selections!")
                        return False
                except ValueError:
                    print("Please enter valid numbers separated by commas!")
                    return False
            else:
                self.selected_files = self.select_files_with_dialog()
        else:
            print("\nNo supported files found in current directory.")
            print("Opening file browser...")
            self.selected_files = self.select_files_with_dialog()
        
        if self.selected_files:
            # Detect file types for all selected files
            for file_path in self.selected_files:
                self.file_types[file_path] = self.detect_file_type(file_path)
            
            print(f"\n✅ Selected {len(self.selected_files)} file(s):")
            for file_path in self.selected_files:
                print(f"  - {os.path.basename(file_path)} ({self.file_types[file_path].upper()})")
            return True
        
        return False
    
    def process_files(self):
        """Process all selected files"""
        if not self.selected_files:
            print("No files selected!")
            return
        
        total_files = len(self.selected_files)
        processed_count = 0
        
        for i, file_path in enumerate(self.selected_files, 1):
            file_type = self.file_types.get(file_path)
            if not file_type:
                print(f"❌ Unknown file type for {os.path.basename(file_path)}")
                continue
                
            print(f"\n[{i}/{total_files}] 🔄 Processing {os.path.basename(file_path)} ({file_type.upper()})...")
            
            if file_type == 'pdf':
                # Import and use pdf_chat module
                try:
                    from pdf_chat import PDFChatBot
                    bot = PDFChatBot()
                    # Pass the selected file directly to the bot
                    bot.process_selected_pdf(file_path)
                    processed_count += 1
                except ImportError:
                    print("❌ Error: pdf_chat.py not found!")
                except Exception as e:
                    print(f"❌ Error processing PDF: {e}")
                    
            elif file_type in ['csv', 'excel', 'word']:
                # Import and use files module with Supabase integration
                try:
                    from files import FileProcessor
                    processor = FileProcessor(verbose=False)  # Non-verbose mode
                    
                    result = processor.process_file_with_supabase(file_path, file_type)
                    
                    if result:
                        # Handle different result types
                        if isinstance(result, dict):
                            if 'status' in result:
                                # Database operation completed - message already shown
                                processed_count += 1
                            else:
                                # Regular JSON data (Word documents, etc.)
                                print(f"📄 Data extracted but not suitable for database insertion")
                                save_choice = input("💾 Save extracted data to JSON file? (y/n): ").strip().lower()
                                if save_choice == 'y':
                                    output_name = Path(file_path).stem + "_extracted.json"
                                    with open(output_name, 'w', encoding='utf-8') as f:
                                        import json
                                        json.dump(result, f, indent=2, ensure_ascii=False)
                                    print(f"✅ Data saved to: {output_name}")
                                processed_count += 1
                        
                        elif isinstance(result, list):
                            # Direct JSON array
                            print(f"📊 Data extracted but no matching table schema found")
                            save_choice = input("💾 Save extracted data to JSON file? (y/n): ").strip().lower()
                            if save_choice == 'y':
                                output_name = Path(file_path).stem + "_extracted.json"
                                with open(output_name, 'w', encoding='utf-8') as f:
                                    import json
                                    json.dump(result, f, indent=2, ensure_ascii=False)
                                print(f"✅ Data saved to: {output_name}")
                            processed_count += 1
                    else:
                        print(f"❌ Failed to process file: {os.path.basename(file_path)}")
                            
                except ImportError as e:
                    print(f"❌ Error: Required module not found - {e}")
                except Exception as e:
                    print(f"❌ Error processing file: {e}")
            else:
                print(f"❌ Unsupported file type: {file_type}")
        
        print(f"\n✅ Processed {processed_count} out of {total_files} files")

def main():
    """Main entry point"""
    while True:
        selector = FileSelector()
        
        if selector.select_files():
            selector.process_files()
        else:
            print("\n❌ No files selected.")
        
        # Ask if user wants to process more files
        print("\n" + "="*70)
        another = input("🔄 Process more files? (y/n): ").strip().lower()
        if another != 'y':
            print("\n👋 Goodbye!")
            break

if __name__ == "__main__":
    main() 