const fs = require('fs');
const snmp = require('net-snmp');

// Target device details
const targetIP = "192.168.1.10";
const communityString = "public";
const version = snmp.Version2c;

// Base OID for the powerEtherTable
const baseOid = "1.3.6.1.4.1.52642.2.4.2";

// Function to convert Buffer to MAC address string
function bufferToMac(buffer) {
    return buffer.toString('hex')
        .match(/.{2}/g)
        .join(':')
        .toLowerCase();
}

// Process the data into IP-MAC pairs
function processData(data) {
    const ipMacPairs = {};

    for (const [ip, entry] of Object.entries(data)) {
        if (entry['2'] && Buffer.isBuffer(entry['2'])) {
            ipMacPairs[ip] = bufferToMac(entry['2']);
        }
    }

    return ipMacPairs;
}

// Save to CSV file
function saveToCSV(data, filename) {
    const csvContent = ['IP,MAC'];

    for (const [ip, mac] of Object.entries(data)) {
        csvContent.push(`${ip},${mac}`);
    }

    fs.writeFileSync(filename, csvContent.join('\n'));
}

// Create a session with the target SNMP agent
const session = snmp.createSession(targetIP, communityString, { version: version });

// Fetch and process SNMP data
session.table(baseOid, function (error, table) {
    if (error) {
        console.error("Failed to fetch SNMP table:", error);
    } else {
        console.log('Raw SNMP Data:');
        console.log(table);

        console.log('\nProcessing data into IP-MAC pairs...');
        const ipMacPairs = processData(table);

        console.log('\nIP-MAC Pairs:');
        console.log(ipMacPairs);

        // Save to CSV
        const outputFile = 'ip_mac.csv';
        saveToCSV(ipMacPairs, outputFile);
        console.log(`\nData saved to ${outputFile}`);
    }

    // Close the SNMP session
    session.close();
});

// Handle SNMP trapping
session.on("error", (err) => {
    console.error("SNMP session error:", err);
});