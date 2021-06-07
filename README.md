# Authentication and Authorization Module for Brokers

[![Build Status](https://travis-ci.com/borokero/borokero-iot-mqtt.svg)](https://travis-ci.com/borokero/borokero-iot-mqtt)

Borokero MQTT Broker based on NodeJS for IoT or Internet of Things. This repo is under development.


##  Getting Started

* If you want to run a test locally, clone this repo.

``` bash
git clone https://github.com/borokero/borokero-iot-mqtt
cd borokero-iot-mqtt
npm install
npm run test
```
It runs tests. You should attention broker needs to configure keycloak. Scripts start-server.sh and stop-server.sh help to start and stop [Keycloak](https://www.keycloak.org/) server with a demo realm. It configs keycloak by demo clients and users and needs docker command.


### How Using it
customize environment variables, change .sample.env file name to .env and edit parameters. Deafualt value will loaded if .env files is not existence in current path.


## Contributing

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/dwyl/esta/issues)

Anyone with interest in or experience with the following technologies are encouraged to join the project.

## Authors / Contributors

* [Hadi Mahdavi](https://twitter.com/kamerdack)



## Credits / Inspiration

* Matteo Collina for Mosca, Aedes, Ponte (https://github.com/mcollina/mosca)


## Copyright

MIT - Copyright (c) 2019 ioKloud
