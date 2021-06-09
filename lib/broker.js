'use strict'

var authBroker = require('@borokero/borokero-auth')
const debug = require('debug')('borokero-iot-mqtt')
const mqemitter = require('mqemitter-mongodb')
const mongoPersistence = require('aedes-persistence-mongodb')

function borokero(options) {
    this.options = options
    this.aedes = require('aedes')({
        mq: mqemitter({
            url: options.db.url
        }),
        persistence: mongoPersistence({
            url: options.db.url,
            // Optional ttl settings
            ttl: {
                packets: options.db.ttl.packets, // Number of seconds
                subscriptions: options.db.ttl.subscriptions
            }
        })
    })
    var authbroker = new authBroker(options.envAuth)

    this.aedes.authenticate = authbroker.authenticateWithCredentials()
    this.aedes.authorizeSubscribe = authbroker.authorizeSubscribe()
    this.aedes.authorizePublish = authbroker.authorizePublish()

    this.aedes.on('subscribe', function (subscriptions, client) {
        debug('MQTT client \x1b[32m' + (client ? client.id : client) +
            '\x1b[0m subscribed to topics: ' + subscriptions.map(s => s.topic).join('\n'))
    })

    this.aedes.on('unsubscribe', function (subscriptions, client) {
        debug('MQTT client \x1b[32m' + (client ? client.id : client) +
            '\x1b[0m unsubscribed to topics: ' + subscriptions.join('\n'), 'from broker')
    })

    // fired when a client connects
    this.aedes.on('client', function (client) {
        debug('Client Connected: \x1b[33m' + (client ? client.id : client) + '\x1b[0m')
    })

    // fired when a client disconnects
    this.aedes.on('clientDisconnect', function (client) {
        debug('Client Disconnected: \x1b[31m' + (client ? client.id : client) + '\x1b[0m')
    })

    // fired when a message is published
    this.aedes.on('publish', async function (packet, client) {
        debug('Client \x1b[31m' + (client ? client.id : 'BROKER_') + '\x1b[0m has published', packet.payload.toString(), 'on', packet.topic)
    })

    this.aedes.on('clientError', function (client, err) {
        debug('client error', client.id, err.message, err.stack)
    })

    this.aedes.on('connectionError', function (client, err) {
        debug('client error', client, err.message, err.stack)
    })

}


borokero.prototype.build = function (done = noop) {
    var self = this

    const server = require('net').createServer(self.aedes.handle)

    server.listen(self.options.mqtt.port, function () {
        console.log('Aedes listening on port:', self.options.mqtt.port)
    })
    return done()
}

borokero.prototype.close = function (done = noop) {
    this.aedes.close(done)
}

function noop () {}

module.exports = borokero