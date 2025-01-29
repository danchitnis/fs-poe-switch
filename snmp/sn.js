const snmp = require("net-snmp");

// Replace these with your target device's details
const target = "192.168.1.10"; // The SNMP agent's IP address
const community = "public"; // Community string (default is "public")
const oid = "1.3.6.1.4.1.52642.2.4.2.1.5.192.168.1.100"; // The OID to query

// Create an SNMP session
const session = snmp.createSession(target, community);

// Perform an SNMP GET request
session.get([oid], (error, varbinds) => {
    if (error) {
        console.error("Error:", error.message);
    } else {
        // varbinds is an array of varbind objects
        for (const vb of varbinds) {
            if (snmp.isVarbindError(vb)) {
                console.error("Error in varbind:", snmp.varbindError(vb));
            } else {
                console.log("OID:", vb.oid);
                console.log("Value:", vb.value); // vb.value contains the raw value
                console.log("Hex Value:", vb.value.toString("hex").toUpperCase());
                const readableString = vb.value.toString("utf8"); // UTF-8 encoding
                console.log("String Value:", readableString);

            }
        }
    }

    // Close the session
    session.close();
});
