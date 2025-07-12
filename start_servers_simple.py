#!/usr/bin/env python3
"""
Simple server startup script - bypasses dependency checks
"""

import subprocess
import time
import signal
import sys
import os

processes = []

def start_server(name, command):
    """Start a server process"""
    print(f"🚀 Starting {name}...")
    
    try:
        process = subprocess.Popen(
            command,
            shell=True,
            cwd=".",
            env=os.environ.copy()
        )
        
        processes.append({
            'name': name,
            'process': process,
            'command': command
        })
        
        print(f"✅ {name} started with PID: {process.pid}")
        return process
        
    except Exception as e:
        print(f"❌ Failed to start {name}: {e}")
        return None

def stop_all_servers():
    """Stop all running servers"""
    print("🛑 Stopping all servers...")
    
    for server in processes:
        try:
            name = server['name']
            process = server['process']
            
            if process.poll() is None:  # Process is still running
                print(f"🛑 Stopping {name} (PID: {process.pid})...")
                process.terminate()
                
                # Wait for graceful shutdown
                try:
                    process.wait(timeout=5)
                    print(f"✅ {name} stopped gracefully")
                except subprocess.TimeoutExpired:
                    # Force kill if graceful shutdown fails
                    print(f"⚡ Force killing {name}...")
                    process.kill()
                    process.wait()
                    print(f"✅ {name} force stopped")
                    
        except Exception as e:
            print(f"❌ Error stopping {server['name']}: {e}")
    
    print("✅ All servers stopped")

def signal_handler(signum, frame):
    print("\n🛑 Received shutdown signal...")
    stop_all_servers()
    sys.exit(0)

def main():
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print("🎯 AGENTIC INVESTIGATION PLATFORM")
    print("=" * 50)
    print("🚀 Starting all servers...")
    print()
    
    try:
        # Start Agentic API Server (Port 8001)
        start_server(
            name="Agentic API", 
            command="./venv/bin/python3 -m uvicorn agentic_api:app --host 0.0.0.0 --port 8001 --reload"
        )
        
        # Wait a bit for the API server to start
        time.sleep(3)
        
        # Start Main API Server (Port 8000)
        start_server(
            name="Main API",
            command="./venv/bin/python3 api_server.py"
        )
        
        # Wait a bit for the main API to start
        time.sleep(3)
        
        # Start Frontend Development Server (Port 5173)
        start_server(
            name="Frontend",
            command="npm run dev"
        )
        
        # Wait a bit for frontend to start
        time.sleep(3)
        
        print("\n" + "=" * 50)
        print("🎉 ALL SERVERS STARTED SUCCESSFULLY!")
        print("=" * 50)
        print()
        print("📍 Server URLs:")
        print("   🌐 Frontend:     http://localhost:5173")
        print("   🤖 Agentic API:  http://localhost:8001")
        print("   📊 Main API:     http://localhost:8000")
        print()
        print("📋 Available Endpoints:")
        print("   🧠 Agentic Chat: http://localhost:8001/api/investigate")
        print("   📊 Health Check: http://localhost:8001/api/health")
        print("   📖 API Docs:     http://localhost:8001/docs")
        print()
        print("🔧 Usage:")
        print("   1. Open http://localhost:5173 in your browser")
        print("   2. Navigate to the Chat section")
        print("   3. Start asking investigation questions!")
        print()
        print("💡 Example Queries:")
        print("   • 'Analyze phone number 9876543210 for suspicious activity'")
        print("   • 'Track internet usage for user ID 12345 last week'")
        print("   • 'Find movement patterns between Mumbai and Delhi'")
        print()
        print("Press Ctrl+C to stop all servers")
        print("-" * 50)
        
        # Keep the main thread alive
        while True:
            time.sleep(1)
            
            # Check if any process has died
            for server in processes:
                if server['process'].poll() is not None:
                    print(f"⚠️ {server['name']} has stopped unexpectedly")
                    
    except KeyboardInterrupt:
        print("\n🛑 Keyboard interrupt received...")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return 1
    finally:
        stop_all_servers()
    
    return 0

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
