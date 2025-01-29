#!/bin/bash

# Variables
IP_ADDRESS="192.168.1.10"       # Replace with the target device's IP address
COMMUNITY_STRING="public"      # Replace with the appropriate SNMP community string
OUTPUT_FILE="snmpwalk_output.txt"  # Output file to save the SNMP walk data
SNMP_VERSION="2c"              # SNMP version to use (e.g., 1, 2c, 3)
OID=".1"                       # OID to start the walk; .1 retrieves the entire MIB

# Perform SNMP walk and save output to file
snmpwalk -v "$SNMP_VERSION" -Cc -c "$COMMUNITY_STRING" "$IP_ADDRESS" "$OID" > "$OUTPUT_FILE"

# Check if the snmpwalk command was successful
if [ $? -eq 0 ]; then
    echo "SNMP walk completed successfully. Output saved to $OUTPUT_FILE."
else
    echo "SNMP walk failed. Please check your parameters and try again."
fi
