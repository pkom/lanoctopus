#!/usr/bin/env python3
import os
import sys
import time
import re
import logging
import socket
import json
import argparse
import platform
import subprocess
import datetime

import mongoengine
import pymongo
import paho.mqtt.client as mqtt

from models import Computer


def on_connect(client, userdata, flags, rc):
    if rc==0:
        logger.info(f'Connected OK with RC {rc}')
        # we are listening to computers
        logger.info(f'Listening for publications...')
        logger.debug(f'userdata: {userdata}')
        client.subscribe('computers/status/#', qos=2)
        client.subscribe('computers/login/#', qos=2)
        client.subscribe('computers/logout/#', qos=2)
        client.subscribe('computers/processedcommand/#', qos=2)

    else:
        logger.error(f'Bad connection with RC {rc}')

def on_disconnect(client, userdata, rc):
    logging.info(f'Disconnecting reason {str(rc)}')

def publish_command(client, host, command):
    logger.info(f'Publishing command {command} for computer {host}')
    payload = { "COMMAND": command }
    client.publish(f'computers/commands/{host}', payload=json.dumps(payload), qos=2)
    return

def process_action(client, action, host, payload_string):
    try:
        computer = Computer.objects(name=host).first()
        if computer is None:
            logger.info(f'Registering new computer {host}')
            computer = Computer(name=host)
    except pymongo.errors.ConnectionFailure as e:
        logger.error(f'Error accessing mongoDB: {mongodb_uri} -> {e}')
    except pymongo.errors.ServerSelectionTimeoutError as e:
        logger.error(f'Error accessing mongoDB: {mongodb_uri} -> {e}')
    except Exception as e:
        logger.error(f'Error accessing mongoDB: {mongodb_uri} -> {e}')
    else:
        computer.save()
        logger.info(f'Computer {host} has been registered into database')
        if action == 'processedcommand':
            payload = json.loads(payload_string)
            if payload['PROCESSEDCOMMAND'] == 'GET_SYSTEM_INFO':                               
                computer.lastInfoDatetime = datetime.datetime.now()
                computer.systemInfo = payload['OUTPUT']
                computer.save()
            logger.info(f'Computer {host} has processed command {payload["PROCESSEDCOMMAND"]}')
        else:
            if computer.lastInfoDatetime is None or computer.updatedAt > computer.lastInfoDatetime + datetime.timedelta(days=30):
                publish_command(client=client, host=host, command='GET_SYSTEM_INFO')
    return

def on_message(client, userdata, msg):
    logger.debug(f'Receiving message Topic: {msg.topic} Message: {msg.payload} Qos: {msg.qos}')
    pattern = 'computers/(status|login|logout|processedcommand)/([a-zA-Z0-9-]+)'
    match = re.search(pattern, msg.topic)
    action = match.group(1)
    host = match.group(2)
    payload_string = msg.payload.decode('utf-8')
    payload_short = payload_string if action in ['status', 'login', 'logout'] else 'COMMAND'
    logger.info(f'action ---> {action} host ---> {host} payload ---> {payload_short}')
    process_action(client, action, host, payload_string)
    return

def connect_mongodb(mongodb_uri):
    mongoengine.connect(host=mongodb_uri, socketTimeoutMS=5000, connectTimeoutMS=5000, serverSelectionTimeoutMS=5000)


if __name__ == "__main__":
    hostname = socket.gethostname()
    currentFolder = os.path.dirname(os.path.realpath(__file__))
    certfile = os.path.join(currentFolder, 'certs', 'ca.crt')

    logging.basicConfig(level=logging.WARNING)
    logger = logging.getLogger('lanoctopus-server')
    
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
    try:    
        mongodb_uri = os.environ['mongodb_uri']
    except:
        mongodb_uri = 'mongodb://lanoctopus:lanoctopus@ibm:27017/lanoctopus'

    parser = argparse.ArgumentParser()
    parser.add_argument("-d", "--debug", type=int, choices=[1, 2], help="increase output verbosity")
    parser.add_argument("-c", "--cafile", help="path to authority certificate")
    parser.add_argument("--hostname", help="host name to use")
    parser.add_argument("-b", "--broker", help="broker ip address or broker dns name")
    parser.add_argument("-p", "--port", type=int, help="broker port number")
    parser.add_argument("-u", "--user", help="username to connect broker")
    parser.add_argument("-m", "--mongodb_uri", help="URI to connect mongoDB broker ('mongodb://user_name:password@host_name:port/database_name')")
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
    if args.mongodb_uri:
        mongodb_uri = args.mongodb_uri
    if args.password:
        password = args.password

    logger.debug(f'Hostname: {hostname}')
    logger.debug(f'Accessing CA certificate on {certfile}')
    logger.debug(f'Broker: {broker}')
    logger.debug(f'Port: {port}')
    logger.debug(f'Mongodb_uri: {mongodb_uri}')

    if not os.path.exists(certfile):
        logger.error(f'Certificate authority not found {certfile}')
        sys.exit(2)

    connect_mongodb(mongodb_uri)

    client = mqtt.Client()
    client = mqtt.Client(protocol=mqtt.MQTTv311)
    client.enable_logger(logger)
    client.username_pw_set(username=user,password=password)
    client.tls_set(certfile)
    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    client.on_message = on_message

    try:
        client.connect(broker, port)
    except:
        logger.error(f'Connection failed to broker {broker} port {port}...')
        sys.exit(1)

    client.loop_forever()
