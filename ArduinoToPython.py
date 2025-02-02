import serial
import time
import csv

def get_values_from_arduino():
    # Set up serial communication (adjust with the correct port)
    ser = serial.Serial('/dev/cu.usbserial-0001', 115200)  # Adjust with your port
    time.sleep(2)  # Wait for Arduino to initialize

    while True:
        try:
            # Read a line from the Arduino and decode it
            data = ser.readline().decode('utf-8').strip()
            print("current data value: " + data)
            
            # If data is valid, process it
            if data:
                values = data.split(",")  # Split the line by commas

                # Convert values to floats
                # avgRaw = float(values[0])  # Raw ADC value
                # sum_value = float(values[1])  # Accumulated sum
                # measuredVoltage_mV = float(values[2])  # Measured voltage
                # coilVoltage_mV = float(values[3])  # Coil voltage

               # Read the current first line (if it exists)
                new_value = 0
                try:
                    with open('tile-monitor/stats.csv', 'r', newline='') as csvfile:
                        reader = csv.reader(csvfile)
                        rows = list(reader)

                    # Check if the first line exists and update the first line value
                    if rows:
                        current_value = float(rows[0][0])  # Assuming the first value in the first row is a number
                        print("current value: " +  str(current_value))
                        new_value = current_value + float(data)  # Add sum_value to the current first line value
                        print("new value: " +  str(new_value))
                        rows[0][0] = float(new_value)  # Update the first value in the row
                except FileNotFoundError:
                    # If the file doesn't exist yet, initialize with the sum_value
                    rows = [[float(data)]]

                # Write the updated value back to the file
                with open('tile-monitor/stats.csv', 'w', newline='') as csvfile:
                    writer = csv.writer(csvfile)
                    writer.writerows(rows)  # Write all rows (including the updated first row)





                try:
                    with open('tile-monitor/statsLong.csv', 'a', newline='') as csvfile:  # Open in append mode
                        writer = csv.writer(csvfile)
                        writer.writerow([float(data)])  # Wrap float(data) in a list  # Append sum_value as a new line
                except Exception as e:
                    print(f"Error writing to file: {e}")

                # Write the updated value back to the file
                with open('tile-monitor/statsLong.csv', 'a', newline='') as csvfile:
                    writer = csv.writer(csvfile)
                  

                # Return the values if needed
                return new_value
            else:
                print("No valid data received.")
        except ValueError:
            # Handle any case where conversion fails
            print("Error parsing data.")
        time.sleep(0.1)

for i in range(10):
    get_values_from_arduino()

# Example usage
# avgRaw, sum_value, measuredVoltage_mV, coilVoltage_mV = get_values_from_arduino()