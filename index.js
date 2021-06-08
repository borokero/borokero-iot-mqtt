'use strict'

const borokero = require('./lib/broker')
const debug = require('debug')

const options = {
  mqtt: {
    port: 1883
  },
  db: {
    url: process.env.MONGO_URL,
    // Optional ttl settings
    ttl: {
      packets: process.env.MONGO_TTL_PACKETS, // Number of seconds
      subscriptions: process.env.MONGO_TTL_SUB
    }
  },
  envAuth: {
    auth: {
      realm: process.env.REALM,
      "auth-server-url": process.env.AUTH_SERVER_URL,
      "ssl-required": process.env.SSL_REQUIRED,
      resource: process.env.RESOURCE,
      "public-client": process.env.PUBLIC_CLIENT,
      "confidential-port": process.env.CONFIDENTIAL_PORT,
    }
  }
}

const broker = new borokero(options)
broker.build()
debug('Broker is setuped')