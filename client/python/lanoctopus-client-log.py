#!/usr/bin/env python3

# get parameter 'in' to login or 'out' to logout

import paho.mqtt.client as paho
import paho.mqtt.publish as publish
import getpass
import socket
import sys
import logging
import os


scriptDirectory = os.path.dirname(os.path.realpath(__file__))
certfile = os.path.join(scriptDirectory, 'certs', 'ca.crt')

# logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger('lanoctopus-client-log')


try:
    broker = os.environ['broker_server']
except:
    broker = 'mqtt'
hostname = socket.gethostname()
try:
    user = os.environ['broker_user']
except:
    user = 'lanoctopus'
try:
    password = os.environ['broker_password']
except:
    password = 'lanoctopus'
try:    
    port = int(os.environ['broker_port'])
except:
    port = 8884 

userloggedin = getpass.getuser()

logger.debug("Hostname: {}".format(hostname))
logger.debug("Userloggedin: {}".format(userloggedin))

logger.debug('Accessing CA certificate on {}'.format(certfile))
if not os.path.exists(certfile):
    logger.error("Certificate authority not found")
    sys.exit(2)

if len(sys.argv) > 1:
    try:
        publish.single(f'computers/log{sys.argv[1]}/{hostname}', payload=userloggedin, qos=2, retain=False, hostname=broker,
            port=port, keepalive=60, will=None, auth={'username': user, 'password': password},
            tls={'ca_certs': certfile}, protocol=paho.MQTTv311, transport="tcp")           
    except Exception as e:
        #logger.error(f'Error publishing on broker: {str(e)}')
        exit(1)

exit(0)
