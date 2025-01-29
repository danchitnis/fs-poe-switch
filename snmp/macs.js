const snmp = require("net-snmp");

// SNMP Configuration
const TARGET_IP = "192.168.1.10";
const COMMUNITY = "public";
const MAC_OID_BASE = "1.3.6.1.2.1.17.4.3.1.1";
const PORT_OID_BASE = "1.3.6.1.2.1.17.4.3.1.2";

// Ports to ignore
const EXCLUDED_PORTS = [24]; // Add more ports as needed

// Create an SNMP session
const session = snmp.createSession(TARGET_IP, COMMUNITY);

function fetchSNMPData(oid) {
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

async function main() {
    try {
        // Fetch MAC and Port OIDs
        const macData = await fetchSNMPData(MAC_OID_BASE);
        const portData = await fetchSNMPData(PORT_OID_BASE);

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

        // Build the final Port-MAC dictionary
        const portMacDictionary = {};
        for (const [oid, mac] of Object.entries(macDict)) {
            const port = portDict[oid];
            if (!EXCLUDED_PORTS.includes(port)) {
                portMacDictionary[port] = mac;
            }
        }

        console.log("Port-MAC Dictionary:", portMacDictionary);
    } catch (error) {
        console.error("Error fetching SNMP data:", error);
    } finally {
        session.close();
    }
}

main();
