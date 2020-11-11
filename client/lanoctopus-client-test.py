#!/usr/bin/env python
import datetime
import time
import socket
import json
import platform
import subprocess
import logging
import os
import sys

import paho.mqtt.client as mqtt
import netifaces
import getpass

from command import *


class Computer:
    def __init__(self, name):
        self.name = name

    def get_system_info(self):
        logger.debug('Getting System Info')
        return getSystemInfo()

    def get_user_logged_in(self):
        logger.debug('Getting User Logged In')
        return getUserLoggedIn()


class ComputerCommandProcessor:
    commands_topic = ""
    processed_commands_topic = ""
    active_instance = None

    def __init__(self, name, computer):
        self.name = name
        self.computer = computer
        ComputerCommandProcessor.commands_topic = f'computers/commands/{self.name}'
        ComputerCommandProcessor.processed_commands_topic = f'computers/processedcommands/{self.name}'
        self.client = mqtt.Client(protocol=mqtt.MQTTv311)
        self.client.enable_logger(logger)
        ComputerCommandProcessor.active_instance = self
        self.client.on_connect = ComputerCommandProcessor.on_connect
        self.client.on_message = ComputerCommandProcessor.on_message
        self.client.username_pw_set(user, password)
        self.client.tls_set(certfile)
        self.client.will_set(f'computers/status/{self.name}', 'offline', 2, False)
        self.client.connect(broker, port, 60)

    @staticmethod
    def on_connect(client, userdata, flags, rc):
        logger.info(f'Connected to mosquitto MQTT broker with result code {str(rc)}')
        client.publish(f'computers/status/{ComputerCommandProcessor.active_instance.name}', payload="online", qos=2)
        client.subscribe(ComputerCommandProcessor.commands_topic, qos=2)
        client.publish(
            topic=ComputerCommandProcessor.processed_commands_topic,
            payload=f'{ComputerCommandProcessor.active_instance.name} is listening to messages'
        )
    @staticmethod
    def on_message(client, userdata, msg):
        logger.debug(f'Incoming message ... {msg.topic}')
        logger.debug(f'Commands Topic ... {ComputerCommandProcessor.commands_topic}')

        if msg.topic == ComputerCommandProcessor.commands_topic:
            payload_string = msg.payload.decode('utf-8')
            logger.debug("Received the following message: {0}".format(payload_string))
            try:
                message_dictionary = json.loads(payload_string)

                if COMMAND_KEY in message_dictionary:
                    command = message_dictionary[COMMAND_KEY]
                    computer = ComputerCommandProcessor.active_instance.computer
                    is_command_processed = False
                    output = ''
                    if command == CMD_GET_SYSTEM_INFO:
                        output = computer.get_system_info()
                        is_command_processed = True
                    elif command == CMD_GET_USER_LOGGED_IN: 
                        output = computer.get_user_logged_in()
                        is_command_processed = True

                    if is_command_processed:
                        message_dictionary['OUTPUT'] = output
                        ComputerCommandProcessor.active_instance.publish_response_message(
                            message_dictionary)
                    else:
                        logger.error("The message includes an unknown command.")
            except ValueError:
                # msg is not a dictionary
                # No JSON object could be decoded
                logger.error("The message doesn't include a valid command.")

    def publish_response_message(self, message):
        response_message = json.dumps({
            SUCCESFULLY_PROCESSED_COMMAND_KEY:
                message[COMMAND_KEY],
            'OUTPUT': message['OUTPUT'] })
        result = self.client.publish(
            topic=self.__class__.processed_commands_topic,
            payload=response_message)
        return result

    def process_commands(self):
        self.client.loop()

#
# Function to connect to broker
#
# def try_connect_to_broker(client):
#     logger.info(f'Trying to connect to mosquitto {broker}')
#     connOK=False
#     while(connOK == False):
#         try:
#             client.connect(broker, port, 60)
#             connOK = True
#         except Exception as e:
#             connOK = False
#             logger.error(f'Trouble connecting mqtt broker: {str(e)}')
#         time.sleep(2)

#
# Subscribes to messages via mosquitto MQTT broker
# in order to listen and execute commands from lanoctopus administrator 
#

# def on_connected(client, userdata, flags, rc):
#     logger.info(f'Connected to mosquitto MQTT broker with result code {str(rc)}')
#     client.publish(f'computers/{hostname}/status', payload="online", qos=2)
#     client.subscribe(f'computers/{hostname}/commands', qos=2)

# def on_disconnected(client,userdata,rc):
#     logger.warning("Disconnected from mosquitto MQTT broker")
#     try_connect_to_broker(client)

# def on_message(client, userdata, msg):
#     logger.debug(f'{str(datetime.datetime.now())} : {msg.topic} {msg.payload}')
#     command = str(msg.payload, 'utf-8')
    
#     if command == "getsysteminfo":
#         # get system info and publish data
#         logger.debug('Receiving systeminfo command request')
#         try:
#             client.publish(f'computers/{hostname}/systeminfo', payload=json.dumps(getSystemInfo()), qos=2)
#         except Exception as e:
#             logger.error(f'Error publishing systeminfo: {str(e)}')
#     else:
#         logger.debug(f'Received command: {command}')

def getUserLoggedIn():
    info = {}
    info["user"] = getpass.getuser()
    return info

def getSystemInfo():
    info = {}
    info["system"] = platform.uname().system
    info["node"] = platform.uname().node
    info["release"] = platform.uname().release
    info["version"] = platform.uname().version
    info["machine"] = platform.uname().machine
    info["processor"] = platform.uname().processor
    #info["distro"] = platform.linux_distribution()
    #info["supported_dists"] = platform._supported_dists
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


''' while(True):
    try:
        # create mqtt client with client_id and clean_session to True
        client = mqtt.Client()
        client.on_connect = on_connected
        client.on_disconnect = on_disconnected
        client.on_message = on_message
        client.username_pw_set(user, password)
        client.tls_set(certfile)
        client.will_set(f'computers/{hostname}/status', 'offline', 2, False)
        try_connect_to_broker(client)
        client.loop_forever()
    except Exception as e:
        logger.error(f'Failed connection to MQTT broker: {str(e)}')
    time.sleep(10)
 '''


if __name__ == "__main__":
    currentFolder = os.path.dirname(os.path.realpath(__file__))
    certfile = os.path.join(currentFolder, 'certs', 'ca.crt')

    # logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger('lanoctopus-client')

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

    logger.debug(f'Hostname: {hostname}')
    logger.debug(f'Accessing CA certificate on {certfile}')
    if not os.path.exists(certfile):
        logger.error("Certificate authority not found")
        sys.exit(2)

    computer = Computer(hostname)
    computer_command_processor = ComputerCommandProcessor(hostname, computer)
    while True:
        # Process messages and the commands every 1 second
        computer_command_processor.process_commands()
        logger.debug("Listening for commands")
        time.sleep(1)