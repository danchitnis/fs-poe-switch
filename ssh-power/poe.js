const { Client } = require('ssh2');

function fetchSshData(ipAddress) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        const config = {
            host: ipAddress,
            port: 22,
            username: 'admin',
            password: 'admin',
            algorithms: {
                serverHostKey: ['ssh-rsa', 'ssh-dss'],
            }
        };

        conn.on('ready', () => {
            //console.log('Client :: ready');
            conn.shell((err, stream) => {
                if (err) {
                    reject(err);
                    return;
                }

                let output = '';
                stream.on('data', (data) => {
                    output += data.toString();
                });

                stream.on('close', () => {
                    //console.log('Stream :: close');
                    conn.end();

                    const results = [];
                    output.split('\n').forEach(line => {
                        if (line.match(/g0\/\d/)) {
                            const match = line.match(/(\S+)\s+(\S+ mW)/);
                            if (match) {
                                results.push({ port: match[1], current_power: match[2] });
                            }
                        }
                    });
                    resolve(results);
                });

                // Send commands
                stream.write('enable\n');
                stream.write('show poe power\n');
                stream.write('exit\n');
                stream.write('exit\n');
            });
        })
            .on('error', (err) => {
                reject(err);
            });

        conn.connect(config);
    });
}

// Usage:
fetchSshData('192.168.1.10')
    .then(result => console.log(result))
    .catch(err => console.error(err));
