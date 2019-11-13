#!/usr/bin/env node

const fs = require('fs')
const mqtt = require('mqtt')
const os = require('os')
const si = require('systeminformation');


const CAfile = [fs.readFileSync("./ca.crt")];
const hostname = os.hostname()
const broker = "mqtt"
const user = "lanoctopus"
const password = "lanoctopus"
const port = 8884

let client  = mqtt.connect({
  clientId: 'server',
  host: broker,
  port: port,
  username: user,
  password: password,
  ca: CAfile,
  protocol: "mqtts",
  protocolId: 'MQIsdp',
  secureProtocol: 'TLSv1_method',
  protocolId: 'MQIsdp',
  protocolVersion: 3
})
 
client.on('connect', function () {
  console.log(`Connected to mosquitto mqqt broker ${broker}`)
  // subscribe to listem to commands
  console.log(`Subscribing to topic commands on computer ${hostname}`)
  client.subscribe('computers/commands/#')
})
 
client.on('message', function (topic, message) {
  // message is Buffer
  let computer = null
  let re = /computers\/commands\/([\w-]+)/
  computer =  topic.match(re)[1]
  if (computer === hostname) {
    switch (message.toString()) {
      case 'turnoff':
        console.log('Received command to shutdown')
        break
      case 'getsysteminfo':
        console.log('Received command to get system info and publish it')
        si.cpu()
          .then(data => {
            console.log(data)
            client.publish(`computers/systeminfo/${hostname}`, JSON.stringify(data))
          })
          .catch(error => console.log(error))
        break
    }
  }
})