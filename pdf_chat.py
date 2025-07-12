import os
import sys
from pathlib import Path
import openai
import PyPDF2
from io import StringIO
import tkinter as tk
from tkinter import filedialog, messagebox
from dotenv import load_dotenv
import logging

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# # Initialize OpenAI client with environment variable
client = openai.OpenAI(
    api_key=os.getenv('VITE_OPENAI_API_KEY')
)

class PDFChatBot:
    def __init__(self):
        try:
            # Use OpenAI API instead of GitHub Models
            self.client = openai_client
            self.pdf_content = ""
            self.pdf_name = ""
            logger.info("✅ OpenAI client initialized successfully for PDF chat")
        except Exception as e:
            logger.error(f"❌ Failed to initialize OpenAI client: {e}")
            raise ValueError("Failed to initialize OpenAI client")
        
    def list_pdfs(self, directory="."):
        """List all PDF files in the given directory"""
        pdf_files = []
        for file in Path(directory).glob("*.pdf"):
            pdf_files.append(file)
        return pdf_files
    
    def extract_pdf_text(self, pdf_path):
        """Extract text content from PDF file"""
        try:
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except Exception as e:
            print(f"Error reading PDF: {e}")
            return None
    
    def select_pdf_with_dialog(self):
        """Use tkinter file dialog to select PDF file"""
        try:
            # Create root window but hide it
            root = tk.Tk()
            root.withdraw()  # Hide the root window
            root.attributes('-topmost', True)  # Bring dialog to front
            
            # Open file dialog
            pdf_path = filedialog.askopenfilename(
                title="Select a PDF file",
                filetypes=[("PDF files", "*.pdf"), ("All files", "*.*")],
                initialdir=os.getcwd()
            )
            
            # Destroy the root window
            root.destroy()
            
            if not pdf_path:
                print("No file selected.")
                return False
                
            return pdf_path
            
        except Exception as e:
            print(f"Error opening file dialog: {e}")
            return False
    
    def select_pdf(self):
        """Allow user to select a PDF file using GUI dialog or terminal"""
        print("Looking for PDF files in current directory...")
        pdf_files = self.list_pdfs()
        
        # If PDFs found in current directory, offer choice
        if pdf_files:
            print(f"Found {len(pdf_files)} PDF file(s) in current directory:")
            for pdf in pdf_files:
                print(f"  - {pdf.name}")
            
            choice = input("\nSelect option:\n1. Use file dialog to browse for PDF\n2. Select from current directory\nEnter choice (1 or 2): ").strip()
            
            if choice == "2":
                if len(pdf_files) == 1:
                    selected_pdf = pdf_files[0]
                    print(f"Selected: {selected_pdf.name}")
                else:
                    print("\nAvailable PDF files:")
                    for i, pdf in enumerate(pdf_files, 1):
                        print(f"{i}. {pdf.name}")
                    
                    try:
                        file_choice = int(input("\nSelect PDF (enter number): ")) - 1
                        if file_choice < 0 or file_choice >= len(pdf_files):
                            print("Invalid selection!")
                            return False
                        selected_pdf = pdf_files[file_choice]
                    except ValueError:
                        print("Please enter a valid number!")
                        return False
                
                pdf_path = str(selected_pdf)
            else:
                # Use file dialog
                print("Opening file dialog...")
                pdf_path = self.select_pdf_with_dialog()
                if not pdf_path:
                    return False
        else:
            # No PDFs in current directory, use file dialog
            print("No PDF files found in current directory.")
            print("Opening file dialog to select PDF...")
            pdf_path = self.select_pdf_with_dialog()
            if not pdf_path:
                return False
        
        # Extract text from selected PDF
        pdf_name = os.path.basename(pdf_path)
        print(f"Loading PDF: {pdf_name}...")
        self.pdf_content = self.extract_pdf_text(pdf_path)
        
        if self.pdf_content:
            self.pdf_name = pdf_name
            print(f"Successfully loaded PDF content ({len(self.pdf_content)} characters)")
            print(f"PDF Path: {pdf_path}")
            return True
        else:
            print("Failed to extract text from PDF!")
            return False
    
    def chat_with_gpt(self, user_query):
        """Send query to GPT-4o with PDF context"""
        try:
            # Prepare the prompt with PDF context
            system_prompt = f"""You are a helpful assistant that answers questions about the content of a PDF document. 
            The PDF document is titled: {self.pdf_name}
            
            Here is the content of the PDF:
            {self.pdf_content[:15000]}...  # Limiting to avoid token limits
            
            Please answer questions based on this PDF content. If the answer is not in the PDF, please say so."""
            
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_query}
                ],
                max_tokens=1000,
                temperature=0.7
            )
            
            if response and response.choices and len(response.choices) > 0:
                return response.choices[0].message.content
            else:
                return "Sorry, I couldn't generate a response. Please try again."
            
        except Exception as e:
            return f"Error communicating with GPT: {e}"
    
    def start_chat(self):
        """Main chat loop"""
        print("\n" + "="*50)
        print("PDF Chat with GPT-4o")
        print("="*50)
        
        # Select PDF
        if not self.select_pdf():
            print("No PDF selected. Exiting...")
            return
        
        print(f"\nPDF loaded: {self.pdf_name}")
        print("You can now ask questions about the PDF content.")
        print("Type 'quit' or 'exit' to end the chat.")
        print("Type 'change-pdf' to select a different PDF.")
        print("-" * 50)
        
        while True:
            try:
                user_input = input("\nYou: ").strip()
                
                if user_input.lower() in ['quit', 'exit']:
                    print("Goodbye!")
                    break
                
                if user_input.lower() == 'change-pdf':
                    if self.select_pdf():
                        print(f"Switched to PDF: {self.pdf_name}")
                    continue
                
                if not user_input:
                    print("Please enter a question.")
                    continue
                
                print("GPT is thinking...")
                response = self.chat_with_gpt(user_input)
                print(f"\nGPT: {response}")
                
            except KeyboardInterrupt:
                print("\nGoodbye!")
                break
            except Exception as e:
                print(f"An error occurred: {e}")

    def process_selected_pdf(self, pdf_path):
        """Process a PDF file selected from Main.py"""
        # Extract text from the provided PDF path
        pdf_name = os.path.basename(pdf_path)
        print(f"Loading PDF: {pdf_name}...")
        self.pdf_content = self.extract_pdf_text(pdf_path)
        
        if self.pdf_content:
            self.pdf_name = pdf_name
            print(f"Successfully loaded PDF content ({len(self.pdf_content)} characters)")
            print(f"PDF Path: {pdf_path}")
            
            # Start the chat interface
            print(f"\nPDF loaded: {self.pdf_name}")
            print("You can now ask questions about the PDF content.")
            print("Type 'quit' or 'exit' to end the chat.")
            print("-" * 50)
            
            while True:
                try:
                    user_input = input("\nYou: ").strip()
                    
                    if user_input.lower() in ['quit', 'exit']:
                        print("Goodbye!")
                        break
                    
                    if not user_input:
                        print("Please enter a question.")
                        continue
                    
                    print("GPT is thinking...")
                    response = self.chat_with_gpt(user_input)
                    print(f"\nGPT: {response}")
                    
                except KeyboardInterrupt:
                    print("\nGoodbye!")
                    break
                except Exception as e:
                    print(f"An error occurred: {e}")
        else:
            print("Failed to extract text from PDF!")

def main():
    """Main function"""
    bot = PDFChatBot()
    bot.start_chat()

if __name__ == "__main__":
    main()
