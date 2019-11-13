#!/usr/bin/env node

const fs = require('fs')
const mqtt = require('mqtt')
const os = require('os')

const CAfile = [fs.readFileSync("./ca.crt")];
const hostname = os.hostname()
const broker = "mqtt"
const user = "lanoctopus"
const password = "lanoctopus"
const port = 8884

let client  = mqtt.connect({
  clientId: 'lanoctopus',
  host: broker,
  port: port,
  username: user,
  password: password,
  ca: CAfile,
  // to receive messages when offline and qos > 1
  clean: false,
  will: {
    topic: 'computers/turnedoff/lanoctopus',
    payload: 'offline',
    qos: 2,
    retain: false
  },
  protocol: "mqtts",
  // protocolId: 'MQIsdp',
  // secureProtocol: 'TLSv1_method',
  // protocolId: 'MQIsdp',
  // protocolVersion: 3
})
 
client.on('connect', function () {
  console.log(`Connected to mosquitto mqqt broker ${broker}`)
  client.publish("computers/turnedon/lanoctopus", payload="online", qos=2)
  // subscribe to listem to commands
  console.log(`Subscribing to computers topics`)
  client.subscribe('computers/#', qos=2)
})
 
client.on('message', function (topic, message) {
  // message is Buffer
  console.log(`received data for topic: ${topic} payload: ${message.toString()}`)
})