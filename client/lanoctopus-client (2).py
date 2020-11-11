#!/usr/bin/env python3
import os
import sys
import time
import logging
import socket
import json
import argparse
import platform
import subprocess

import paho.mqtt.client as mqtt
import netifaces


def getUserLoggedIn():
    info = []
    # get users logged in
    try:
        p = subprocess.Popen( ['who'], stdout=subprocess.PIPE )
        p.wait()
        lines = p.stdout.readlines()
        for line in lines:
            user = {}
            user['name'] = line.decode('utf-8').strip().split()[0]
            user['tty'] = line.decode('utf-8').strip().split()[1]
            user['date_since'] = line.decode('utf-8').strip().split()[2]
            user['time_since'] = line.decode('utf-8').strip().split()[3]
            user['display'] = line.decode('utf-8').strip().split()[4] if len(line) == 5 else ''
            info.append(user)
    except:
        info.append(["Trouble getting logged in users..."])
    return info

def getSystemInfo():
    info = {}
    info["system"] = platform.uname().system
    info["node"] = platform.uname().node
    info["release"] = platform.uname().release
    info["version"] = platform.uname().version
    info["machine"] = platform.uname().machine
    info["processor"] = platform.uname().processor
    info["distro"] = platform.linux_distribution()
    info["supported_dists"] = platform._supported_dists
    info["architecture"] = platform.architecture()
    
    if info["system"] == "Linux":   
        info["cpuinfo"] = []
        with open('/proc/cpuinfo') as f:
            for line in f:
                # Ignore the blank line separating the information between
                # details about two processing units
                if line.strip():
                    if line.rstrip('\n').startswith('model name'):
                        model_name = line.rstrip('\n').split(':')[1]
                        info["cpuinfo"].append(model_name)

        info["memory"] = {}
        meminfo = {}
        with open('/proc/meminfo') as f:
                for line in f:
                    meminfo[line.split(':')[0]] = line.split(':')[1].strip()
        info["memory"]["total"] = meminfo["MemTotal"]
        info["memory"]["free"] = meminfo["MemFree"]

        # uptime
        info["uptime"] = {}
        with open("/proc/uptime", "r") as f:
            uptime = f.read().split(" ")[0].strip()
        uptime = int(float(uptime))
        uptime_hours = uptime // 3600
        uptime_minutes = (uptime % 3600) // 60
        info["uptime"]["hours"] = uptime_hours
        info["uptime"]["minutes"] = uptime_minutes

        # Load
        with open("/proc/loadavg", "r") as f:
            average = f.read().strip()
        info["average"] = average

        # network info
        info["interfaces"] = [{interface: netifaces.ifaddresses(interface)} for interface in netifaces.interfaces()]

        # facters
        try:
            p = subprocess.Popen( ['facter'], stdout=subprocess.PIPE )
            p.wait()
            lines = p.stdout.readlines()
            facters = {}
            for line in lines:
                fact = line.decode('utf-8').strip().split(' => ')
                try:
                    if fact[1].startswith('{'):
                        fact[1] = fact[1].replace('=>', ':')
                        facters[fact[0]] = json.loads(fact[1])
                    else:
                        facters[fact[0]] = fact[1]
                except:
                    pass
            info["facters"] = facters
        except:
            info["facters"] = "Trouble getting facters, puppet not installed or any other issue..."

    return info


def on_connect(client, userdata, flags, rc):
    if rc==0:
        logger.info(f'Connected OK with RC {rc}')
        # we are online
        logger.info(f'Publishing we are online...')
        client.publish(f'computers/status/{hostname}', payload="online", qos=2)
        # we are listening to commands
        logger.info(f'Listening for commands...')
        client.subscribe(f'computers/commands/{hostname}', qos=2)

    else:
        logger.error(f'Bad connection with RC {rc}')

def on_disconnect(client, userdata, rc):
    logging.info(f'Disconnecting reason {str(rc)}')
   
def on_message(client, userdata, msg):
    logger.debug(f'Receiving message Topic: {msg.topic} Message: {msg.payload} Qos: {msg.qos}')
    # process payload 
    if msg.topic == f'computers/commands/{hostname}':
        payload_string = msg.payload.decode('utf-8')
        try:
            message_dictionary = json.loads(payload_string)
            if 'COMMAND' in message_dictionary:
                is_command_processed = False
                command = message_dictionary['COMMAND']
                output = ''
                logger.info(f'Receiving command {command}')
                if command == 'GET_SYSTEM_INFO':
                    output = getSystemInfo()
                    is_command_processed = True
                    logger.debug(f'Getting system info: {output}')
                    
                elif command == 'GET_USERS_LOGGED_IN': 
                    output = getUserLoggedIn()
                    is_command_processed = True
                    logger.debug(f'Getting user logged in: {output}')

                if is_command_processed:
                    message_response = {}
                    message_response['PROCESSEDCOMMAND'] = command
                    message_response['OUTPUT'] = output
                    logger.info(f'Publishing output for command {command}')
                    client.publish(f'computers/processedcommand/{hostname}', payload=json.dumps(message_response), qos=2)                    
                else:
                    logger.error(f'The message includes an unknown command: {command}')
        except ValueError:
            # msg is not a dictionary
            # No JSON object could be decoded
            logger.error(f"The message doesn't include a valid command: {payload_string}")
    else:
        logger.warning(f'Received a message we are not listening...')



if __name__ == "__main__":
    hostname = socket.gethostname()
    currentFolder = os.path.dirname(os.path.realpath(__file__))
    certfile = os.path.join(currentFolder, 'certs', 'ca.crt')

    logging.basicConfig(level=logging.WARNING)
    logger = logging.getLogger('lanoctopus-client')
    
    try:
        broker = os.environ['broker_server']
    except:
        broker = 'mqtt'
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

    parser = argparse.ArgumentParser()
    parser.add_argument("-d", "--debug", type=int, choices=[1, 2], help="increase output verbosity")
    parser.add_argument("-c", "--cafile", help="path to authority certificate")
    parser.add_argument("--hostname", help="host name to use")
    parser.add_argument("-b", "--broker", help="broker ip address or broker dns name")
    parser.add_argument("-p", "--port", type=int, help="broker port number")
    parser.add_argument("-u", "--user", help="username to connect broker")
    parser.add_argument("--password", help="broker port number")

    args = parser.parse_args()
    if args.debug == 1:
        logger.setLevel(logging.INFO)
    elif args.debug == 2:
        logger.setLevel(logging.DEBUG)

    if args.cafile:
        certfile = args.cafile
    if args.hostname:
        hostname = args.hostname
    if args.broker:
        broker = args.broker
    if args.port:
        port = args.port
    if args.user:
        user = args.user
    if args.password:
        password = args.password

    logger.debug(f'Hostname: {hostname}')
    logger.debug(f'Accessing CA certificate on {certfile}')
    logger.debug(f'Broker: {broker}')
    logger.debug(f'Port: {port}')

    if not os.path.exists(certfile):
        logger.error(f'Certificate authority not found {certfile}')
        sys.exit(2)

    client = mqtt.Client()
    client = mqtt.Client(protocol=mqtt.MQTTv311)
    client.enable_logger(logger)
    client.username_pw_set(username=user,password=password)
    client.tls_set(certfile)
    client.will_set(f'computers/status/{hostname}', 'offline', 2, False)
    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    client.on_message = on_message

    try:
        client.connect(broker, port)
    except:
        logger.error(f'Connection failed to broker {broker} port {port}...')
        sys.exit(1)

    client.loop_forever()
