'use strict';

/*******************************************************************************
 * this test inspired by Aedes and Ponte project, a work by Matteo Collina
 *    Matteo Collina - https://github.com/eclipse/ponte
 *******************************************************************************/
var mqtt = require('mqtt')
var aedes = require('aedes')()
var authBroker = require('../lib/authbroker')
var expect = require('expect.js')

describe('Test against MQTT server', function () {
    var username = 'mahdi'
    let clientId = 'mqtt'
    var password = 'password'
    var wrongPassword = 'wrong'
    var topic = 'mahdi/lamp'
    var anotherAllowedTopic = 'mohammad/fan'
    const port = 1883


    var envAuth = {
        auth: {
            realm: "tokenRealmTest",
            "auth-server-url": "http://localhost:8080/auth",
            "ssl-required": "external",
            resource: "admin-cli",
            "public-client": true,
            "confidential-port": 0,
        },
        jwt: {
            salt: 'salt', //salt by pbkdf2 method
            digest: 'sha512',
            // size of the generated hash
            hashBytes: 64,
            // larger salt means hashed passwords are more resistant to rainbow table, but
            // you get diminishing returns pretty fast
            saltBytes: 16,
            // more iterations means an attacker has to take longer to brute force an
            // individual password, so larger is better. however, larger also means longer
            // to hash the password. tune so that hashing the password takes about a
            // second
            iterations: 10
        },
        wildCard: {
            wildcardOne: '+',
            wildcardSome: '#',
            separator: '/'
        },
        adapters: {
            mqtt: {
                limitW: 50,
                limitMPM: 10
            }
        }
    }

    before(function (done) {
        var authbroker = new authBroker(envAuth)

        aedes.authenticate = authbroker.authenticateWithCredentials()
        aedes.authorizeSubscribe = authbroker.authorizeSubscribe()
        aedes.authorizePublish = authbroker.authorizePublish()

        const server = require('net').createServer(aedes.handle)

        server.listen(port, function () {
            console.log('server listening on port', port)
            done()
        })

    })

    /*
    afterEach(function (done) {
        instance.close(done)

    })
    */


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
                //console.log(topic + ' ; ' + payload)
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
                //console.log(topic + ' ; ' + payload)
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
            //console.log(error)
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