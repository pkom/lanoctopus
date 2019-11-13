To install client:
    1. Client lanoctopus needs next python3 dependencies on clients, install with distro package manager:
        1. python3-paho-mqtt -> to access mosquitto mqtt broker
        2 .python3-netifaces -> to get network info from clients

    2. Put Certificate autorithy ca-crt into /usr/local/bin/lanoctopus. This certificate has been used to sign the mqtt certificate server, using 'mqtt' as the name.

    3. Put /client/python/lanoctupus-client-log.py into /usr/local/bin with execute permission to listen for commands.

    4. Put /client/lanoctopus-login.sh in /etc/profile.d with execution permission to grab user's login.

    5. Put /client/lanoctopos-logout.sh in /etc/bash.bash_logout with execution permission to grab user's logout.

    6. Install as service in client /client/python/lanoctopus-client.py.
        1. Put /client/python/lanoctopus-client.service in /etc/systemd/system with execution permission.
        2. Put /client/python/lanoctopus-client.py in /usr/local/bin/lanoctopus with execution permission.
        3. Start lanoctopus-client with systemctl start lanoctopus-client.
        4. Enable lanoctopus-client to run on boot with systemctl enable lanoctopus-client.
        5. See logs with journalctl -u lanoctopus-client.



To install the server:

    1. Server needs next python3 dependencies on server, install with distro package manager:
        1. python3-paho-mqtt -> to access mosquitto mqtt broker
        2. python3-netifaces -> optional on server
        3. python3-pymongo -> to access mongodb database

    2. Put Certificate autorithy ca-crt into /usr/local/bin/lanoctopus. This certificate has been used to sign the mqtt certificate server, using 'mqtt' as the name.

    3. Install as service in server /client/python/lanoctopus-server.py.
        1. Put /server/python/lanoctopus-server.service in /etc/systemd/system with execution permission.
        2. Put /server/python/lanoctopus-server.py in /usr/local/bin/lanoctopus with execution permission.
        3. Start lanoctopus-server with systemctl start lanoctopus-server.
        4. Enable lanoctopus-server to run on boot with systemctl enable lanoctopus-server.
        5. See logs with journalctl -u lanoctopus-server.

Services needed:
    1. Mosquitto broker installed on a machine with tls and user authentication, my configuration is focused on TLS and user authentication, you can change users/password and/or certificates, but remember to change credentials on code:
        1. Folder /etc/mosquitto/certs contains:
            1. CA's ca.crt certificate and ca.key (not needed) 
            2. Server's mqtt.crt and mqtt.key certificates.
        2. Folder /etc/mosquitto
            1. File mosquitto.conf, contains:

                # Place your local configuration in /etc/mosquitto/conf.d/
                #
                # A full description of the configuration file is at
                # /usr/share/doc/mosquitto/examples/mosquitto.conf.example

                pid_file /var/run/mosquitto.pid

                persistence true
                persistence_location /var/lib/mosquitto/

                log_dest file /var/log/mosquitto/mosquitto.log

                #log_type debug

                include_dir /etc/mosquitto/conf.d
            
            2. File password created using the utility "mosquitto_pass" (check doc) for user lanoctopus password lanoctopus, or other if we want set up our secure policy.

            3. Folder /etc/mosquitto/conf.d, contains file default.conf. This file sets up our mqtt server. The content could be:

                allow_anonymous false
                password_file /etc/mosquitto/passwd

                listener 1883 localhost

                listener 8883

                listener 8884
                cafile /etc/mosquitto/certs/ca.crt
                keyfile /etc/mosquitto/certs/mqtt.key
                certfile /etc/mosquitto/certs/mqtt.crt

                listener 8083
                protocol websockets
                cafile /etc/mosquitto/certs/ca.crt
                keyfile /etc/mosquitto/certs/mqtt.key
                certfile /etc/mosquitto/certs/mqtt.crt

            4. Before we can see several "listeners" on different ports and protocols.

    2. MongoDB installed on server where mosquitto is installed.
        
        1. Install mongodb using distro package manager: apt install mongodb-server
        2. Set Up:
            1. File /etc/mongodb.conf.
            2. Refer to mongodb doc to create users to access "lanoctopus" database. These credentials must be used on server code to be able to connect to mongodb.

    3. Instructions to set up a CA and certificate's server, our configuration doesn't need client certificates:
        1. Create CA key
            openssl genrsa -des3 -out ca.key 2048
        2. Create CA certificate
            openssl req -new -x509 -days 3650 -key ca.key -out ca.crt
        3. Create lanoctopus server key
            openssl genrsa -out mqtt.key 2048  
        4. Create certificate sign request for mqtt server, note use fqdn as server hostname
            openssl req -new -out mqtt.csr -key mqtt.key
        5. Sign and generate server certificate
            openssl x509 -req -in mqtt.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out mqtt.crt -days 3650
        6. Create a client key
            openssl genrsa -out client.key 2048
        7. Create certificate sign request for client, note use fqdn ad client hostname
            openssl req -new -out client.csr -key client.key
        8. Sign and generate client certificate
            openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out client.crt -days 3650	
        9. Create client certificates as we need