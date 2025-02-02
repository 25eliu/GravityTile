import sys
import csv
import datetime
import yagmail
from twilio.rest import Client

def send_text_if_condition(condition, recipient_phone, tile):
    if condition:
        # Twilio credentials (replace with your actual Twilio credentials)
        ACCOUNT_SID = ""
        AUTH_TOKEN = ""
        TWILIO_PHONE_NUMBER = ""

        client = Client(ACCOUNT_SID, AUTH_TOKEN)

        try:
            msg = client.messages.create(
                body=tile,
                from_=TWILIO_PHONE_NUMBER,
                to=recipient_phone
            )
            print(f"Tile {tile} activated! Message sent successfully!")
        except Exception as e:
            print(f"Failed to send message: {e}")

def log_to_csv(tile):
    timestamp = datetime.datetime.now().isoformat() + "Z"  # Ensure consistent UTC format
    filename = "tile-monitor/tile_log.csv"

    try:
        with open(filename, mode="a", newline="") as file:
            writer = csv.writer(file)
            writer.writerow([timestamp, tile])  # Always logs as ISO 8601
        print(f"Logged tile {tile} at {timestamp}")
    except Exception as e:
        print(f"Failed to log data: {e}")
if __name__ == "__main__":
    tile_number = 50
    #log_to_csv(tile_number)
    send_text_if_condition(True,  "+16504305628", tile_number)
