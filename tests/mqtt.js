'use strict';

/*******************************************************************************
 * this test inspired by Aedes and Ponte project, a work by Matteo Collina
 *    Matteo Collina - https://github.com/eclipse/ponte
 *******************************************************************************/

require('dotenv').config({
    path: '.env.sample'
})
var mqtt = require('mqtt')
var Broker = require('../lib/broker')
const {
    describe,
    it
} = require('mocha')
var expect = require('expect.js')

var username = 'mahdi'
let clientId = 'mqtt'
var password = 'password'
var wrongPassword = 'wrong'
var topic = 'mahdi/lamp'
var anotherAllowedTopic = 'mohammad/fan'
const port = process.env.MQTT_PORT

const options = {
    mqtt: {
        port: process.env.MQTT_PORT
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
var broker = new Broker(options)


describe('Test against MQTT server', function () {

    before(function (done) {
        broker.build(done)
    })


    after(function (done) {
        broker.close(done)
    })


    function connect(options) {
        return mqtt.connect('mqtt://localhost', options)
    }


    it('should allow a client to publish and subscribe with allowed locally topics', function (done) {

        let options = {
            port: port,
            clientId: clientId,
            username: username,
            password: password,
            clean: true,
            protocolId: 'MQIsdp',
            protocolVersion: 3
        }

        let client = connect(options)
        client
            .subscribe(topic)
            .publish(topic, 'world')
            .on('message', function (topicname, payload) {
                expect(topicname).to.eql(topic)
                expect(payload.toString()).to.eql('world')
                done()
            })
    })

    it('should allow a client to publish and subscribe with shared topic', function (done) {

        let options = {
            port: port,
            clientId: clientId,
            username: username,
            password: password,
            clean: true,
            protocolId: 'MQIsdp',
            protocolVersion: 3
        }

        let client = connect(options)
        client
            .subscribe(anotherAllowedTopic)
            .publish(anotherAllowedTopic, 'world')
            .on('message', function (topicname, payload) {
                expect(topicname).to.eql(anotherAllowedTopic)
                expect(payload.toString()).to.eql('world')
                done()
            })
    })


    it('should support wildcards in mqtt', function (done) {

        let option = {
            port: port,
            clientId: clientId,
            username: username,
            password: password,
            clean: true,
            protocolId: 'MQIsdp',
            protocolVersion: 3
        }

        let client = connect(option)
        client
            .subscribe('hadi/#')
            .publish(topic, 'hello')
            .on('message', function (topicname, payload) {
                console.log(topicname)
                console.log(payload.toString())
                expect(topicname).to.eql(topic)
                expect(payload.toString()).to.eql('hello')
            })
        client.end()
        done()
    })


    it('should throw a connection error if there is an unauthorized', function (done) {
        let client = mqtt.connect('mqtt://localhost:' + port, {
            clientId: "logger",
            username: 'hadi',
            password: wrongPassword
        })
        client.on('connect', function () {
            client.end()
            done(new Error('Expected connection error'))
        })
        client.on('error', function (error) {
            client.end()
            expect(error.message).to.eql('Connection refused: Not authorized')
            done()
        })
    })


    it('should denny the subscription when an unauthorized subscribe is attempted', function (done) {

        let client = mqtt.connect('mqtt://localhost:' + port, {
            clientId: clientId,
            username: username,
            password: password
        })
        client.subscribe('unauthorizedSubscribe', function (err, subscribes) {

            //if (err) throw (err)
            client.end()
            expect(subscribes[0].topic).to.eql('unauthorizedSubscribe')
            done()
        })
    })


    it('should close the connection if an unauthorized publish is attempted', function (done) {

        let client = mqtt.connect('mqtt://localhost:' + port, {
            clientId: clientId,
            username: username,
            password: password
        })
        var error
        client.on('message', function () {
            error = new Error('Expected connection close')
            client.end()
        })
        var closeListener = function () {
            client.removeListener('close', closeListener)
            if (error) {
                //console.log(error)
                done(error)
            } else {
                client.end()
                done()
            }
        }
        client.on('close', closeListener)
        client.subscribe('ali/#')
            .publish('ali/unauthorizedPublish', 'world')
    })

})