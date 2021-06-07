'use strict'

var authBroker = require('@borokero/borokero-auth')
const debug = require('debug')('borokero-iot-mqtt')
const mqemitter = require('mqemitter-mongodb')
const mongoPersistence = require('aedes-persistence-mongodb')

const MONGO_URL = process.env.MONGO_URL
const port = process.env.MQTT_PORT
const envAuth = {
    auth: {
        realm: process.env.REALM,
        "auth-server-url": process.env.AUTH_SERVER_URL,
        "ssl-required": process.env.SSL_REQUIRED,
        resource: process.env.RESOURCE,
        "public-client": process.env.PUBLIC_CLIENT,
        "confidential-port": process.env.CONFIDENTIAL_PORT,
    }
}

const aedes = require('aedes')({
    mq: mqemitter({
      url: MONGO_URL
    }),
    persistence: mongoPersistence({
      url: MONGO_URL,
      // Optional ttl settings
      ttl: {
        packets: 300, // Number of seconds
        subscriptions: 300
      }
    })
  })

var authbroker = new authBroker(envAuth)

aedes.authenticate = authbroker.authenticateWithCredentials()
aedes.authorizeSubscribe = authbroker.authorizeSubscribe()
aedes.authorizePublish = authbroker.authorizePublish()

const server = require('net').createServer(aedes.handle)

server.listen(port, function () {
    console.log('Aedes listening on port:', port)
})

aedes.on('subscribe', function (subscriptions, client) {
    debug('MQTT client \x1b[32m' + (client ? client.id : client) +
        '\x1b[0m subscribed to topics: ' + subscriptions.map(s => s.topic).join('\n'), 'from broker', aedes.id)
})

aedes.on('unsubscribe', function (subscriptions, client) {
    debug('MQTT client \x1b[32m' + (client ? client.id : client) +
        '\x1b[0m unsubscribed to topics: ' + subscriptions.join('\n'), 'from broker', aedes.id)
})

// fired when a client connects
aedes.on('client', function (client) {
    debug('Client Connected: \x1b[33m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id)
})

// fired when a client disconnects
aedes.on('clientDisconnect', function (client) {
    debug('Client Disconnected: \x1b[31m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id)
})

// fired when a message is published
aedes.on('publish', async function (packet, client) {
    debug('Client \x1b[31m' + (client ? client.id : 'BROKER_' + aedes.id) + '\x1b[0m has published', packet.payload.toString(), 'on', packet.topic, 'to broker', aedes.id)
})

aedes.on('clientError', function (client, err) {
    debug('client error', client.id, err.message, err.stack)
})

aedes.on('connectionError', function (client, err) {
    debug('client error', client, err.message, err.stack)
})