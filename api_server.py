import os
import shutil
import tempfile
from pathlib import Path
from typing import List
import mimetypes
import json

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Import the existing processing modules
from pdf_chat import PDFChatBot
from files import FileProcessor

app = FastAPI(title="Digital Evidence Platform API", version="1.0.0")

# Add CORS middleware to allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3003", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    
    async def process_single_file(self, file_path: str, file_type: str):
        """Process a single file based on its type"""
        try:
            if file_type == 'pdf':
                # Process PDF with pdf_chat module
                bot = PDFChatBot()
                result = bot.process_selected_pdf(file_path)
                return {
                    "status": "success",
                    "type": "pdf",
                    "message": "PDF processed successfully. You can now chat with this document.",
                    "file_path": file_path
                }
                
            elif file_type in ['csv', 'excel', 'word']:
                # Process with files module and Supabase integration
                processor = FileProcessor(verbose=False)
                result = processor.process_file_with_supabase(file_path, file_type)
                
                if result:
                    if isinstance(result, dict) and 'status' in result:
                        return {
                            "status": "success",
                            "type": file_type,
                            "message": f"File processed and data inserted into Supabase successfully",
                            "result": result
                        }
                    else:
                        # Data extracted but not suitable for database insertion
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

# Initialize the processor
file_processor = FileProcessorAPI()

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {"message": "Digital Evidence Platform API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

@app.post("/upload-files/")
async def upload_files(background_tasks: BackgroundTasks, files: List[UploadFile] = File(...)):
    """
    Upload and process multiple files
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    
    results = []
    processed_files = []
    
    for file in files:
        if not file.filename:
            continue
            
        # Check if file type is supported
        file_extension = Path(file.filename).suffix.lower()
        if file_extension not in file_processor.supported_extensions:
            results.append({
                "filename": file.filename,
                "status": "error",
                "message": f"Unsupported file type: {file_extension}"
            })
            continue
        
        # Create temporary file
        temp_dir = tempfile.mkdtemp()
        temp_file_path = os.path.join(temp_dir, file.filename)
        
        try:
            # Save uploaded file to temporary location
            with open(temp_file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Detect file type
            file_type = file_processor.detect_file_type(temp_file_path)
            
            # Process the file
            result = await file_processor.process_single_file(temp_file_path, file_type)
            result["filename"] = file.filename
            result["size"] = str(os.path.getsize(temp_file_path))
            
            results.append(result)
            processed_files.append(temp_file_path)
            
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "message": f"Error processing file: {str(e)}"
            })
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                try:
                    os.remove(temp_file_path)
                    os.rmdir(temp_dir)
                except:
                    pass
    
    # Summary
    successful = len([r for r in results if r.get("status") == "success"])
    total = len(results)
    
    return {
        "message": f"Processed {successful} out of {total} files successfully",
        "total_files": total,
        "successful_files": successful,
        "results": results
    }

@app.post("/upload-single-file/")
async def upload_single_file(file: UploadFile = File(...)):
    """
    Upload and process a single file
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Check if file type is supported
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in file_processor.supported_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type: {file_extension}. Supported types: {', '.join(file_processor.supported_extensions)}"
        )
    
    # Create temporary file
    temp_dir = tempfile.mkdtemp()
    temp_file_path = os.path.join(temp_dir, file.filename)
    
    try:
        # Save uploaded file to temporary location
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Detect file type
        file_type = file_processor.detect_file_type(temp_file_path)
        
        # Process the file
        result = await file_processor.process_single_file(temp_file_path, file_type)
        result["filename"] = file.filename
        result["size"] = str(os.path.getsize(temp_file_path))
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
    finally:
        # Clean up temporary file
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
                os.rmdir(temp_dir)
            except:
                pass

@app.get("/supported-formats/")
async def get_supported_formats():
    """
    Get list of supported file formats
    """
    return {
        "supported_extensions": file_processor.supported_extensions,
        "file_types": {
            "pdf": "PDF documents - Interactive chat with GPT-4",
            "csv": "CSV files - Auto-detect schema & insert to Supabase",
            "excel": "Excel files (.xlsx, .xls) - Auto-detect schema & insert to Supabase",
            "word": "Word files (.docx, .doc) - Extract tables & insert to Supabase"
        },
        "supabase_tables": [
            "bank_details", "crd", "ipdr", "sms_header", 
            "tower_dumps", "true_caller", "subscriber"
        ]
    }

if __name__ == "__main__":
    print("🚀 Starting Digital Evidence Platform API Server...")
    print("📄 Supported file types: PDF, CSV, Excel, Word")
    print("🗄️  Supabase integration enabled")
    print("🔗 API will be available at http://localhost:8000")
    print("📖 API documentation at http://localhost:8000/docs")
    
    uvicorn.run(
        "api_server:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    ) 