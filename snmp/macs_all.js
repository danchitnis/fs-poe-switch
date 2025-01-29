const snmp = require("net-snmp");
const fs = require("fs");

// SNMP Configuration for multiple switches
const switches = [
    { name: "A", ip: "192.168.1.10", community: "public", excludedPorts: [24] },
    { name: "B", ip: "192.168.1.11", community: "public", excludedPorts: [22, 24] }
];

const MAC_OID_BASE = "1.3.6.1.2.1.17.4.3.1.1";
const PORT_OID_BASE = "1.3.6.1.2.1.17.4.3.1.2";

function createSNMPSession(ip, community) {
    return snmp.createSession(ip, community);
}

function fetchSNMPData(session, oid) {
    return new Promise((resolve, reject) => {
        let varbindsArray = [];
        session.subtree(
            oid,
            {},
            (varbinds) => {
                varbindsArray = varbindsArray.concat(varbinds);
            },
            (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(varbindsArray);
                }
            }
        );
    });
}

function formatMacAddress(hexString) {
    return hexString
        .replace(/ /g, ":")
        .toUpperCase();
}

async function fetchSwitchData(switchConfig) {
    const session = createSNMPSession(switchConfig.ip, switchConfig.community);
    try {
        const macData = await fetchSNMPData(session, MAC_OID_BASE);
        const portData = await fetchSNMPData(session, PORT_OID_BASE);

        const macDict = {};
        const portDict = {};

        // Build MAC and Port dictionaries
        macData.forEach(varbind => {
            const oid = varbind.oid.split('.').slice(-6).join('.');
            macDict[oid] = formatMacAddress(varbind.value.toString("hex").match(/../g).join(" "));
        });

        portData.forEach(varbind => {
            const oid = varbind.oid.split('.').slice(-6).join('.');
            portDict[oid] = varbind.value;
        });

        // Build the final Port-MAC dictionary for the switch
        const portMacDictionary = {};
        for (const [oid, mac] of Object.entries(macDict)) {
            const port = portDict[oid];
            if (!switchConfig.excludedPorts.includes(port)) {
                portMacDictionary[port] = mac;
            }
        }

        return { name: switchConfig.name, data: portMacDictionary };

    } catch (error) {
        console.error(`Error fetching SNMP data for ${switchConfig.name}:`, error);
        return { name: switchConfig.name, data: {} };
    } finally {
        session.close();
    }
}

async function main() {
    const combinedDictionary = {};
    const csvLines = ["Port,MAC Address"];

    for (const switchConfig of switches) {
        const switchData = await fetchSwitchData(switchConfig);
        combinedDictionary[switchData.name] = switchData.data;

        // Prepare CSV lines
        for (const [port, mac] of Object.entries(switchData.data)) {
            csvLines.push(`${switchData.name}${port},${mac}`);
        }
    }

    console.log("Combined Port-MAC Dictionary:", combinedDictionary);

    // Save to CSV file
    fs.writeFileSync("port_mac.csv", csvLines.join("\n"));
    console.log("Data saved to port_mac_dictionary.csv");
}

main();
