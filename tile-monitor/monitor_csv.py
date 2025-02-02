import requests
import time
import csv
from text import log_to_csv, send_text_if_condition  # Import functions directly

# ✅ Backend API URL
SERVER_URL = "http://localhost:3001/api/log-tile"
CSV_FILE = "statsLong.csv"  # Change this to the actual CSV file you want to monitor

def read_latest_value():
    """Reads the most recent number from the CSV file."""
    try:
        with open(CSV_FILE, mode='r', newline='') as file:
            reader = list(csv.reader(file))
            if not reader:
                return 0  # ✅ If file is empty, return 0
            last_row = reader[-1]  # ✅ Get the last row
            last_value = float(last_row[-1])  # ✅ Convert last value to float
            return last_value
    except Exception as e:
        print(f"❌ Error reading CSV: {e}")
        return 0  # Default to 0 if there's an error

def test_log_tile(tile_number):
    """Logs a tile activation event to the backend and CSV."""
    print(f"Simulating tile activation for tile {tile_number}...")

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

def test_send_text(tile_number):
    """Triggers SMS/Email notification."""
    recipient_email = "6502798516@vtext.com"  # Change this to your carrier email
    print(f"Triggering SMS/Email for tile {tile_number} to {recipient_email}...")

    # ✅ Call `send_text_if_condition` to send the message
    send_text_if_condition(True, recipient_email, tile_number)
    print(f"✅ Notification sent for tile {tile_number}.")

def monitor_csv():
    """Continuously checks for a nonzero value and logs Tile #1 when detected."""
    last_triggered_value = 0  # ✅ Keeps track of last triggered value to prevent spam

    while True:
        latest_value = read_latest_value()

        if latest_value != 0 and latest_value != last_triggered_value:
            print(f"🚀 Detected nonzero value: {latest_value}, triggering Tile #1")
            test_log_tile(1)  # ✅ Simulate Tile #1 activation
            #test_send_text(1)  # ✅ Send alert
            last_triggered_value = latest_value  # ✅ Prevents duplicate triggering

        time.sleep(5)  # ✅ Check every 5 seconds

if __name__ == "__main__":
    print("🔄 Monitoring CSV for nonzero values...")
    monitor_csv()
