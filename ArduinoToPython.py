import serial
import time

def get_values_from_arduino():
    # Set up serial communication (adjust with the correct port)
    ser = serial.Serial('/dev/cu.usbserial-0001', 115200)  # Use /dev/cu.* instead of /dev/tty.*  # Adjust with your port
    time.sleep(2)  # Wait for Arduino to initialize

    while True:
        try:
            # Read a line from the Arduino and decode it
            data = ser.readline().decode('utf-8').strip()
            #data = "4, 400, 43, 123"
            
            # If data is valid, process it
            if data:
                values = data.split(",")  # Split the line by commas

                # Convert values to floats
                avgRaw = float(values[0])  # Raw ADC value
                sum_value = float(values[1])  # Accumulated sum
                measuredVoltage_mV = float(values[2])  # Measured voltage
                coilVoltage_mV = float(values[3])  # Coil voltage

                # Return or print the values as needed
                return avgRaw, sum_value, measuredVoltage_mV, coilVoltage_mV
            else:
                print("No valid data received.")
        except ValueError:
            # Handle any case where conversion fails
            print("Error parsing data.")
        time.sleep(0.1)

# Example usage
avgRaw, sum_value, measuredVoltage_mV, coilVoltage_mV = get_values_from_arduino()
print(f"Raw ADC: {avgRaw}")
print(f"Accumulated Sum: {sum_value}")
print(f"Measured Voltage: {measuredVoltage_mV} mV")
print(f"Coil Voltage: {coilVoltage_mV} mV")

# import serial
# import time

# # Replace with the Bluetooth serial port of your device
# bluetooth_port = "/dev/cu.usbserial-0001"  # For Mac/Linux
# # bluetooth_port = "COM5"  # For Windows (Change COM5 to your actual port)

# try:
#     ser = serial.Serial(bluetooth_port, 9600, timeout=1)  # Match baud rate of Arduino
#     time.sleep(2)  # Allow time for connection

#     while True:
#         data = ser.readline().decode('utf-8').strip()  # Read Bluetooth data
#         if data:
#             print(f"Received: {data}")  # Print received data
# except serial.SerialException as e:
#     print(f"Error: {e}")
# except KeyboardInterrupt:
#     print("Exiting...")
# finally:
#     if ser:
#         ser.close()