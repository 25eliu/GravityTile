import requests
import time
import csv
from text import log_to_csv, send_text_if_condition

# ✅ Backend API URL
SERVER_URL = "http://localhost:3001/api/log-tile"
CSV_FILE = "statsLong.csv"

def monitor_csv():
    """Continuously checks for new lines with nonzero first column values."""
    last_triggered_value = 0  # ✅ Track last triggered value to prevent duplicate triggers

    try:
        with open(CSV_FILE, mode='r', newline='') as file:
            file.seek(0, 2)  # ✅ Move to end of file, so we only check new lines

            while True:
                line = file.readline().strip()
                
                if not line:
                    time.sleep(1)  # ✅ Wait and check again
                    continue

                values = line.split(",")  # ✅ Split CSV row by comma
                
                if len(values) >= 1:
                    try:
                        first_value = values[0].strip().replace('"', '')  # ✅ Remove extra quotes
                        first_value = float(first_value)  # ✅ Convert first column to float
                        
                        if first_value >= 0.65 and first_value != last_triggered_value:
                            print(f"🚀 Detected new nonzero value: {first_value}, triggering Tile #1")
                            test_log_tile(1)  # ✅ Simulate Tile #1 activation
                            last_triggered_value = first_value  # ✅ Prevent duplicate triggers
                        
                    except ValueError:
                        print(f"⚠ Invalid numeric value in CSV (after stripping): {values[0]}")
    
    except FileNotFoundError:
        print(f"❌ Error: {CSV_FILE} not found. Make sure the file exists and is being updated.")

def test_log_tile(tile_number):
    """Logs a tile activation event to the backend and CSV."""
    print(f"🔵 Simulating tile activation for tile {tile_number}...")

    # ✅ Log locally
    log_to_csv(tile_number)

    # ✅ Send data to backend so UI updates
    try:
        response = requests.post(SERVER_URL, json={"tile": tile_number})
        if response.status_code == 200:
            print(f"✅ Tile {tile_number} logged successfully!")
        else:
            print(f"❌ Failed to log tile {tile_number}: {response.text}")
    except Exception as e:
        print(f"Error sending request: {e}")

if __name__ == "__main__":
    print("🔄 Monitoring CSV for new nonzero values in the first column...")
    monitor_csv()
