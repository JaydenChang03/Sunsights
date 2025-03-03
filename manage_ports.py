import os
import subprocess
import sys
import time
import psutil
import signal

def find_process_by_port(port):
    """Find and return process using the specified port."""
    try:
        # Windows specific command to find process using port
        result = subprocess.check_output(f'netstat -ano | findstr :{port}', shell=True)
        if result:
            # Get PID from the last column
            pid = result.decode().strip().split()[-1]
            return int(pid)
    except subprocess.CalledProcessError:
        return None

def kill_process_on_port(port):
    """Kill any process using the specified port."""
    pid = find_process_by_port(port)
    if pid:
        try:
            process = psutil.Process(pid)
            process.terminate()
            # Wait for the process to terminate
            process.wait(timeout=5)
            print(f"Successfully terminated process on port {port}")
        except (psutil.NoSuchProcess, psutil.TimeoutExpired):
            print(f"Failed to terminate process on port {port}")
    else:
        print(f"No process found using port {port}")

def start_backend():
    """Start the backend server."""
    backend_port = 5000
    kill_process_on_port(backend_port)
    print(f"Starting backend on port {backend_port}...")
    backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
    subprocess.Popen([sys.executable, "app.py"], 
                    cwd=backend_dir)

def start_frontend():
    """Start the frontend server."""
    frontend_port = 3000
    kill_process_on_port(frontend_port)
    print(f"Starting frontend on port {frontend_port}...")
    # Assuming you're using npm for frontend
    subprocess.Popen(["npm", "start"], 
                    cwd=os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend"))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python manage_ports.py [backend|frontend|all]")
        sys.exit(1)

    command = sys.argv[1].lower()
    
    if command == "backend":
        start_backend()
    elif command == "frontend":
        start_frontend()
    elif command == "all":
        start_backend()
        time.sleep(2)  # Wait a bit before starting frontend
        start_frontend()
    else:
        print("Invalid command. Use 'backend', 'frontend', or 'all'")
