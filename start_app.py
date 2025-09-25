#!/usr/bin/env python3
"""
Startup script for the Biodiversity Dashboard
This script will start both the backend API and frontend development server
"""

import subprocess
import sys
import os
import time
import signal
import threading
from pathlib import Path

def run_backend():
    """Start the FastAPI backend server"""
    print("🚀 Starting backend server...")
    backend_dir = Path("backend")
    os.chdir(backend_dir)
    
    # Activate virtual environment and run backend
    if sys.platform == "win32":
        cmd = ["..\\venv\\Scripts\\python.exe", "main.py"]
    else:
        cmd = ["../venv/bin/python", "main.py"]
    
    try:
        subprocess.run(cmd, check=True)
    except KeyboardInterrupt:
        print("\n🛑 Backend server stopped")
    except Exception as e:
        print(f"❌ Error starting backend: {e}")

def run_frontend():
    """Start the React frontend development server"""
    print("🎨 Starting frontend server...")
    frontend_dir = Path("frontend")
    os.chdir(frontend_dir)
    
    # Install dependencies if needed
    if not Path("node_modules").exists():
        print("📦 Installing frontend dependencies...")
        subprocess.run(["npm", "install"], check=True)
    
    # Start development server
    try:
        subprocess.run(["npm", "start"], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Frontend server stopped")
    except Exception as e:
        print(f"❌ Error starting frontend: {e}")

def main():
    """Main function to start both servers"""
    print("🌱 Biodiversity Dashboard")
    print("=" * 50)
    
    # Check if data exists
    if not Path("data/species_poland.csv").exists():
        print("📊 Creating sample data...")
        subprocess.run([sys.executable, "scripts/download_data.py"], check=True)
    
    # Start backend in a separate thread
    backend_thread = threading.Thread(target=run_backend, daemon=True)
    backend_thread.start()
    
    # Wait a moment for backend to start
    time.sleep(3)
    
    # Start frontend
    try:
        run_frontend()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down servers...")
        sys.exit(0)

if __name__ == "__main__":
    main()
