/**
 * MIB from https://mibs.observium.org/mib/FS-NMS-POE-MIB/
 */

const snmp = require("net-snmp");

// Target device details
const targetIP = "192.168.1.10"; // Change this to the IP of your SNMP device
const communityString = "public"; // Change this as per your SNMP community string
const version = snmp.Version2c; // Adjust SNMP version if needed

// Create a session with the target SNMP agent
const session = snmp.createSession(targetIP, communityString, { version: version });

// Base OID for the powerEtherTable
const baseOid = "1.3.6.1.4.1.52642.2.236.1";

// Fetch the entire powerEtherTable
session.table(baseOid, function (error, table) {
    console.log(table);
    console.log('-----------------------------');
    if (error) {
        console.error("Failed to fetch table:", error);
    } else {
        // Iterate through the table entries
        Object.keys(table).forEach((index) => {
            const entry = table[index];
            console.log(`Entry Index: ${index}`);
            console.log(`ifIndex: ${entry[1]}`);
            console.log(`ifDescr: ${entry[2]}`);
            console.log(`ifPethPortControlAbility: ${entry[3]}`);
            console.log(`ifPethPortMaxPower: ${entry[4]}`);
            console.log(`ifPethPortConsumptionPower: ${entry[5]}`);
            console.log('------');
        });
    }

    // Close the SNMP session
    session.close();
});

// Handle SNMP trapping
session.on("error", (err) => {
    console.error("SNMP session error:", err);
});
