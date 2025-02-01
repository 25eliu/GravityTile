import serial
import time

# Set up serial communication (change 'COM3' to your Arduino's port)
# For macOS, it might look like '/dev/ttyUSB0' or '/dev/tty.usbmodemXXXX'
# For Windows, it could be something like 'COM3' or 'COM4'

ser = serial.Serial('/dev/tty.usbserial-0001', 9600)  # Adjust with the correct port
time.sleep(2)  # Wait for Arduino to initialize

# Read data from Arduino once
try:
    voltage_data = ser.readline().decode('utf-8').strip()
    
    # Convert the string to float (in case the Arduino sends valid voltage)
    voltage = float(voltage_data)
    print(f"{voltage}")

except ValueError:
    # Handle the case where data is not a valid float
    print("Invalid data received.")

# Close the serial connection
ser.close()