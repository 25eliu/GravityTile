import csv
import datetime
from twilio.rest import Client

#Sends a text message if the condition is met.
def send_text_if_condition(condition, message, recipient_phone, tile):
    
    if condition:
        # Twilio credentials (replace with your actual credentials)
        ACCOUNT_SID = "AC4b13aed550887f329eb5bef1b6666601"
        AUTH_TOKEN = "9d41aa40924dc37c5b3a3c532511536a"
        TWILIO_PHONE_NUMBER = "+18777343994"

        client = Client(ACCOUNT_SID, AUTH_TOKEN)

        try:
            message = client.messages.create(
                body=message,
                from_=TWILIO_PHONE_NUMBER,
                to=recipient_phone
            )
            print(f"Message sent successfully! SID: {message.sid}")
            # Log tile number and timestamp
            log_to_csv(tile)
        except Exception as e:
            print(f"Failed to send message: {e}")


# Function to log tile number and timestamp to a CSV file
def log_to_csv(tile):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    filename = "tile_log.csv"

    try:
        with open(filename, mode="a", newline="") as file:
            writer = csv.writer(file)
            # Write header if file is empty
            if file.tell() == 0:
                writer.writerow(["Timestamp", "Tile"])
            writer.writerow([timestamp, tile])
        print(f"Logged tile {tile} at {timestamp}")
    except Exception as e:
        print(f"Failed to log data: {e}")

