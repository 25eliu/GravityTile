import sys
import csv
import datetime
from twilio.rest import Client

def send_text_if_condition(condition, message, recipient_phone, tile):
    log_to_csv(tile)
    # if condition:
    #     ACCOUNT_SID = "AC4b13aed550887f329eb5bef1b6666601"
    #     AUTH_TOKEN = "9d41aa40924dc37c5b3a3c532511536a"
    #     TWILIO_PHONE_NUMBER = "+18777343994"

    #     client = Client(ACCOUNT_SID, AUTH_TOKEN)

    #     try:
    #         msg = client.messages.create(
    #             body=message,
    #             from_=TWILIO_PHONE_NUMBER,
    #             to=recipient_phone
    #         )
    #         print(f"Message sent successfully! SID: {msg.sid}")
    #     except Exception as e:
    #         print(f"Failed to send message: {e}")

def log_to_csv(tile):
    timestamp = datetime.datetime.now().isoformat() + "Z"  # Ensure consistent UTC format
    filename = "tile_log.csv"

    try:
        with open(filename, mode="a", newline="") as file:
            writer = csv.writer(file)
            writer.writerow([timestamp, tile])  # Always logs as ISO 8601
        print(f"Logged tile {tile} at {timestamp}")
    except Exception as e:
        print(f"Failed to log data: {e}")
if __name__ == "__main__":
    tile_number = int(sys.argv[1])
    send_text_if_condition(True, f"Tile {tile_number} activated!", "+16504305628", tile_number)
