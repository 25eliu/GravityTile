import sys
import csv
import datetime
import os
import base64
# from google.oauth2.credentials import Credentials
# from google_auth_oauthlib.flow import InstalledAppFlow
# from google.auth.transport.requests import Request
# from googleapiclient.discovery import build

# If modifying these SCOPES, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def get_credentials():
    """Get valid user credentials."""
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    return creds

def send_email_via_gmail_api(recipient_email, tile):
    """Send an email using the Gmail API."""
    creds = get_credentials()
    service = build('gmail', 'v1', credentials=creds)

    # Create the email message
    message = f"From: mateohacks@gmail.com\nTo: {recipient_email}\nSubject: SMS Notification\n\nTile {tile} activated!"
    raw = base64.urlsafe_b64encode(message.encode('utf-8')).decode('utf-8')
    body = {'raw': raw}

    try:
        service.users().messages().send(userId='me', body=body).execute()
        print(f"Email sent to {recipient_email}!")
    except Exception as e:
        print(f"Failed to send email: {e}")

def send_text_if_condition(condition, recipient_email, tile):
    if condition:
        send_email_via_gmail_api(recipient_email, tile)

def log_to_csv(tile):
    """Logs the tile activation with a standardized timestamp format."""
    timestamp = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"  # ✅ Match JS format
    filename = "tile_log.csv"

    try:
        with open(filename, mode="a", newline="") as file:
            writer = csv.writer(file)
            writer.writerow([timestamp, tile])  # ✅ Always logs as ISO 8601
        print(f"Logged tile {tile} at {timestamp}")
    except Exception as e:
        print(f"Failed to log data: {e}")
# if __name__ == "__main__":
#     if len(sys.argv) > 1:
#         try:
#             tile_number = int(sys.argv[1])  # ✅ Read tile number from command line argument
#             #log_to_csv(tile_number)  # ✅ Log correct tile number
#             send_text_if_condition(True, "6502798516@vtext.com", tile_number)  # ✅ Send email with correct tile number
#         except ValueError:
#             print("Invalid tile number argument.")
#     else:
#         print("No tile number provided.")
