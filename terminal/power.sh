#!/usr/bin/expect

# Set variables
set timeout 20
set ip "192.168.1.10"
set user "admin"
set password "admin"

# Comment out the following line to enable debugging
log_user 0

# Start the SSH session and suppress default output
spawn ssh -o HostKeyAlgorithms=ssh-rsa,ssh-dss -o PubkeyAcceptedKeyTypes=ssh-rsa,ssh-dss $user@$ip

# Wait for password prompt and send the password
expect "password:"
send "$password\r"

# Wait for the device to give a normal prompt
expect "Switch>"
send "enable\r"

# Wait for the device to enter enable mode
expect "Switch#"
send "show poe power\r"

# Wait for the end of the command output
expect "Switch#"

# Capture the output
set output $expect_out(buffer)

# Exit the switch
send "exit\r"
expect "Switch>"
send "exit\r"

# Close the session
expect eof

# Process the captured output to JSON only
foreach line [split $output "\n"] {
    if {[regexp {g0/\d} $line]} {
        regexp {(\S+)\s+(\S+ mW)} $line -> port power
        puts [format "{\"port\": \"%s\", \"current_power\": \"%s\"}" $port $power]
    }
}
