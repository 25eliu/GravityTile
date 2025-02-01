import subprocess

def get_voltage_from_arduino():
    try:
        #print("Running ArduinoToPython.py...")
        # Run ArduinoToPython.py and capture its output
        result = subprocess.run(['python3', 'ArduinoToPython.py'], capture_output=True, text=True)
        
        #print("Subprocess finished.")
        # Check if we received any output
        if result.stdout.strip():
            #print(f"Raw output: {result.stdout.strip()}")
            voltage = result.stdout.strip()  # Remove any leading/trailing whitespace
            return voltage
        else:
            print("No output from ArduinoToPython.py")
            return None  # If no output, return None
    except Exception as e:
        print(f"Error running subprocess: {e}")
        return None

# Get the voltage and print it
voltage = get_voltage_from_arduino()
if voltage:
    print(f"Received Voltage: {voltage} V")
else:
    print("No voltage received.")

