MANUALLY
========
Copy /client/python/lanoctopus-client.service file into the /lib/systemd/system/lanoctopus-client.service

Start it with systemctl start lanoctopus-client

Enable it to run on boot with systemctl enable lanoctopus-client

See logs with journalctl -u lanoctopus-client


PUPPET
======
1. Copy folder xubuntu_lanoctopus_client into puppet server in /etc/puppet/modules
2. Install dependencies
3. Assign module to computer on clase_especifica.pp
4. TODO install dependencies on module class