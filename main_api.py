import os
import sys
from pathlib import Path
import mimetypes
import json

class FileProcessorAPI:
    def __init__(self):
        self.supported_extensions = ['.pdf', '.csv', '.xlsx', '.xls', '.docx', '.doc']
        
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
    
    def process_file(self, file_path):
        """Process a single file without user interaction"""
        if not os.path.exists(file_path):
            return {
                "status": "error",
                "message": f"File not found: {file_path}"
            }
        
        file_type = self.detect_file_type(file_path)
        if file_type == 'unknown':
            return {
                "status": "error",
                "message": f"Unsupported file type: {Path(file_path).suffix}"
            }
        
        print(f"🔄 Processing {os.path.basename(file_path)} ({file_type.upper()})...")
        
        try:
            if file_type == 'pdf':
                # Import and use pdf_chat module
                from pdf_chat import PDFChatBot
                bot = PDFChatBot()
                # Pass the selected file directly to the bot
                result = bot.process_selected_pdf(file_path)
                return {
                    "status": "success",
                    "type": "pdf",
                    "message": "PDF processed successfully. You can now chat with this document.",
                    "file_path": file_path
                }
                
            elif file_type in ['csv', 'excel', 'word']:
                # Import and use files module with Supabase integration
                from files import FileProcessor
                processor = FileProcessor(verbose=False)  # Non-verbose mode
                
                result = processor.process_file_with_supabase(file_path, file_type)
                
                if result:
                    # Handle different result types
                    if isinstance(result, dict):
                        if 'status' in result:
                            # Database operation completed
                            return {
                                "status": "success",
                                "type": file_type,
                                "message": "File processed and data inserted into Supabase successfully",
                                "result": result
                            }
                        else:
                            # Regular JSON data (Word documents, etc.)
                            output_name = Path(file_path).stem + "_extracted.json"
                            with open(output_name, 'w', encoding='utf-8') as f:
                                json.dump(result, f, indent=2, ensure_ascii=False)
                            return {
                                "status": "success",
                                "type": file_type,
                                "message": f"Data extracted and saved to {output_name}",
                                "extracted_file": output_name,
                                "result": result
                            }
                    
                    elif isinstance(result, list):
                        # Direct JSON array
                        output_name = Path(file_path).stem + "_extracted.json"
                        with open(output_name, 'w', encoding='utf-8') as f:
                            json.dump(result, f, indent=2, ensure_ascii=False)
                        return {
                            "status": "success",
                            "type": file_type,
                            "message": f"Data extracted and saved to {output_name}",
                            "extracted_file": output_name,
                            "result": result
                        }
                else:
                    return {
                        "status": "error",
                        "type": file_type,
                        "message": f"Failed to process file: {os.path.basename(file_path)}"
                    }
            else:
                return {
                    "status": "error",
                    "type": file_type,
                    "message": f"Unsupported file type: {file_type}"
                }
                
        except ImportError as e:
            return {
                "status": "error",
                "type": file_type,
                "message": f"Required module not found: {str(e)}"
            }
        except Exception as e:
            return {
                "status": "error",
                "type": file_type,
                "message": f"Error processing file: {str(e)}"
            }
    
    def process_multiple_files(self, file_paths):
        """Process multiple files and return results"""
        results = []
        successful = 0
        
        for file_path in file_paths:
            result = self.process_file(file_path)
            results.append({
                "file_path": file_path,
                "filename": os.path.basename(file_path),
                **result
            })
            
            if result["status"] == "success":
                successful += 1
                print(f"✅ {os.path.basename(file_path)} processed successfully")
            else:
                print(f"❌ {os.path.basename(file_path)}: {result['message']}")
        
        return {
            "total_files": len(file_paths),
            "successful_files": successful,
            "results": results
        }

def process_files_from_paths(file_paths):
    """
    Main function to process files from a list of file paths
    This replaces the interactive main() function
    """
    if not file_paths:
        return {
            "status": "error",
            "message": "No file paths provided"
        }
    
    processor = FileProcessorAPI()
    
    # Validate file paths
    valid_paths = []
    for path in file_paths:
        if os.path.exists(path):
            valid_paths.append(path)
        else:
            print(f"❌ File not found: {path}")
    
    if not valid_paths:
        return {
            "status": "error",
            "message": "No valid file paths found"
        }
    
    print(f"🚀 Processing {len(valid_paths)} file(s)...")
    result = processor.process_multiple_files(valid_paths)
    
    print(f"\n✅ Processed {result['successful_files']} out of {result['total_files']} files")
    return result

def main():
    """
    Command line interface for direct file processing
    Usage: python main_api.py file1.pdf file2.csv file3.xlsx
    """
    if len(sys.argv) < 2:
        print("Usage: python main_api.py <file1> [file2] [file3] ...")
        print("Example: python main_api.py document.pdf data.csv report.xlsx")
        return
    
    file_paths = sys.argv[1:]
    result = process_files_from_paths(file_paths)
    
    # Print results in JSON format for API consumption
    print("\n" + "="*50)
    print("PROCESSING RESULTS:")
    print("="*50)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main() 