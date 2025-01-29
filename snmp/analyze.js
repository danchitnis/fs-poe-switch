const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

// Function to normalize MAC addresses for consistent comparison
function normalizeMac(mac) {
    return mac.toLowerCase().replace(/[:-]/g, '');
}

// Function to read and parse CSV file
function readCSV(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });
}

// Function to write data to CSV file
function writeCSV(filePath, data) {
    const csvContent = stringify(data, {
        header: true,
        columns: ['Port', 'MAC Address', 'IP']
    });
    fs.writeFileSync(filePath, csvContent);
}

// Main function to analyze port-IP mappings
async function analyzePortIpMappings(portMacFile, ipMacFile, outputFile) {
    try {
        // Read both CSV files
        const portMacData = readCSV(portMacFile);
        const ipMacData = readCSV(ipMacFile);

        // Create MAC-to-IP mapping
        const macToIp = {};
        ipMacData.forEach(row => {
            const normalizedMac = normalizeMac(row['MAC']);
            macToIp[normalizedMac] = row['IP'];
        });

        // Analyze port data and prepare combined data
        const portsWithIp = [];
        const portsMissingIp = [];
        const combinedData = [];

        portMacData.forEach(row => {
            const port = row['Port'];
            const mac = row['MAC Address'];
            const normalizedMac = normalizeMac(mac);
            const ip = macToIp[normalizedMac];

            // Add to combined data
            combinedData.push({
                'Port': port,
                'MAC Address': mac,
                'IP': ip || ''  // Use empty string if IP is not found
            });

            // Add to respective arrays for reporting
            if (ip) {
                portsWithIp.push({ port, ip, mac });
            } else {
                portsMissingIp.push({ port, mac });
            }
        });

        // Save combined data to CSV
        writeCSV(outputFile, combinedData);

        // Print results
        console.log('\nPorts with IP addresses:');
        console.log('----------------------');
        portsWithIp.forEach(({ port, ip, mac }) => {
            console.log(`Port ${port}: IP ${ip} (MAC: ${mac})`);
        });

        console.log('\nPorts missing IP addresses:');
        console.log('-------------------------');
        portsMissingIp.forEach(({ port, mac }) => {
            console.log(`Port ${port} (MAC: ${mac})`);
        });

        // Print summary
        console.log('\nSummary:');
        console.log('--------');
        console.log(`Total ports: ${portMacData.length}`);
        console.log(`Ports with IP: ${portsWithIp.length}`);
        console.log(`Ports missing IP: ${portsMissingIp.length}`);
        console.log(`\nCombined data saved to: ${outputFile}`);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Usage example
const portMacFile = 'port_mac.csv';
const ipMacFile = 'ip_mac.csv';
const outputFile = 'port_mac_ip.csv';

analyzePortIpMappings(portMacFile, ipMacFile, outputFile);