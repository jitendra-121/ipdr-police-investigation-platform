#!/usr/bin/env python3
"""
Startup script for IPDR Police Investigation Platform
Starts both FastAPI backend and React frontend servers
"""

import subprocess
import sys
import time
import os
import signal
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    # Check Python dependencies
    try:
        import fastapi
        import uvicorn
        print("✅ FastAPI dependencies found")
    except ImportError:
        print("❌ FastAPI dependencies missing. Installing...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    
    # Check if Node.js is available
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js found: {result.stdout.strip()}")
        else:
            print("❌ Node.js not found. Please install Node.js first.")
            return False
    except FileNotFoundError:
        print("❌ Node.js not found. Please install Node.js first.")
        return False
    
    # Check if npm dependencies are installed
    if not Path("node_modules").exists():
        print("📦 Installing npm dependencies...")
        subprocess.run(["npm", "install"])
    else:
        print("✅ npm dependencies found")
    
    return True

def start_fastapi_server():
    """Start the FastAPI backend server"""
    print("🚀 Starting FastAPI backend server...")
    
    # Start FastAPI server in background
    fastapi_process = subprocess.Popen([
        sys.executable, "api_server.py"
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    
    # Wait a moment for server to start
    time.sleep(3)
    
    # Check if server is running
    if fastapi_process.poll() is None:
        print("✅ FastAPI server started successfully on http://localhost:8000")
        return fastapi_process
    else:
        stdout, stderr = fastapi_process.communicate()
        print(f"❌ Failed to start FastAPI server")
        print(f"Error: {stderr}")
        return None

def start_react_server():
    """Start the React development server"""
    print("🚀 Starting React development server...")
    
    # Start React dev server
    react_process = subprocess.Popen([
        "npm", "run", "dev"
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    
    # Wait a moment for server to start
    time.sleep(5)
    
    # Check if server is running
    if react_process.poll() is None:
        print("✅ React development server started successfully")
        print("🌐 Frontend available at http://localhost:3000 or http://localhost:3001")
        return react_process
    else:
        stdout, stderr = react_process.communicate()
        print(f"❌ Failed to start React server")
        print(f"Error: {stderr}")
        return None

def main():
    """Main startup function"""
    print("="*60)
    print("🚀 IPDR POLICE INVESTIGATION PLATFORM STARTUP")
    print("="*60)
    
    # Check dependencies
    if not check_dependencies():
        print("❌ Dependency check failed. Please install missing dependencies.")
        return
    
    processes = []
    
    try:
        # Start FastAPI backend
        fastapi_process = start_fastapi_server()
        if fastapi_process:
            processes.append(fastapi_process)
        else:
            print("❌ Cannot start without backend server")
            return
        
        # Start React frontend
        react_process = start_react_server()
        if react_process:
            processes.append(react_process)
        else:
            print("❌ Cannot start without frontend server")
            return
        
        print("\n" + "="*60)
        print("🎉 ALL SERVERS STARTED SUCCESSFULLY!")
        print("="*60)
        print("📖 API Documentation: http://localhost:8000/docs")
        print("🌐 Frontend Application: http://localhost:3000")
        print("🗄️  Database: Neo4j integration enabled")
        print("🤖 AI: OpenAI integration enabled")
        print("\n💡 Upload files through the UI to process CDR/IPDR data")
        print("💬 Use the chat interface to query your database")
        print("\n⚠️  Press Ctrl+C to stop all servers")
        print("="*60)
        
        # Wait for user interrupt
        while True:
            time.sleep(1)
            
            # Check if any process has died
            for i, process in enumerate(processes):
                if process.poll() is not None:
                    print(f"\n❌ Process {i+1} has stopped unexpectedly")
                    break
    
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down servers...")
        
        # Terminate all processes
        for i, process in enumerate(processes):
            if process.poll() is None:
                print(f"🔄 Stopping process {i+1}...")
                process.terminate()
                
                # Wait for graceful shutdown
                try:
                    process.wait(timeout=5)
                    print(f"✅ Process {i+1} stopped gracefully")
                except subprocess.TimeoutExpired:
                    print(f"⚠️  Force killing process {i+1}...")
                    process.kill()
                    process.wait()
        
        print("👋 All servers stopped. Goodbye!")
    
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        
        # Cleanup processes
        for process in processes:
            if process.poll() is None:
                process.terminate()

if __name__ == "__main__":
    main() 