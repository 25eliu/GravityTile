import requests
import time
from text import log_to_csv, send_text_if_condition  # Import functions directly

# ✅ Backend API URL
SERVER_URL = "http://localhost:3001/api/log-tile"

def test_log_tile(tile_number):
    """Sends a tile activation request to the backend and logs to CSV."""
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

if __name__ == "__main__":
    tile_number = int(input("Enter tile number to test: "))

    # ✅ Run both functions
    test_log_tile(tile_number)  # Log the tile activation
    time.sleep(2)  # Delay before sending notification
    test_send_text(tile_number)  # Trigger SMS/email
