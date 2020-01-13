#!/usr/bin/env node

const log = require('yalm');
const Mqtt = require('mqtt');
const eNet = require('node-enet-api');
const config = require('./config.js');
const haconfig = require('./config.json')
const pkg = require('./package.json');

// Declare variables
let mqtt;
var mqttConnected = false;
var enetConnected = false;
var enetAddress;
var gw;

// Start script with info logs
log.setLevel(config.verbosity);
log.info(pkg.name + ' ' + haconfig.version + ' starting');

// // Retrieve options from HASSIO
// var options = process.argv[2]; //value will be "time that is passed from bash file"
// log.info("Received variable:",options);
//
// // TODO: read variables from json
// var mqtt_ip = options.mqtt_ip
// var log_level = options.log_level
// log.info("mqtt_ip: " + mqtt_ip + " log_level: " + log_level)


// Not functional: gateway discovery
// // Find gateway
// var discover = new eNet.discover();
// log.info("Discovering eNet Gateways ...");
//
// // Greate gateway when found
// discover.on('discover', function(gws) {
//     log.info('New gateway: ' + JSON.stringify(gws));
//     gw = eNet.gateway(gws);
// });

// // Handle discover response from eNet API
// discover.discover(function(err, gws) {
//     if (err) console.error('error: ' + err);
//     else if (gws.length == 0) {
//       log.error('No gateways disovered')
//       //process.exit()
//     }
//     log.info('All discovered gateways: ' + JSON.stringify(gws));
//     discovered();
// });


// Manually connect to gateway
gw = eNet.gateway({host: config.enet_ip});

// TODO: check if a gateway has been found

discovered();

// Process discovered gateway
function discovered()
{
    // Connect to the discovered gateway
    enetAddress = gw.host;
    log.info (enetAddress);
    gw.idleTimeout = 600000;
    gw.connect();

    // Get gateway version
    log.info("Requesting gateway version.");
    gw.getVersion(function(err, res) {
        if (err) log.error("error: " + err);
        else log.debug("command succeeded: \n" + JSON.stringify(res));
        enetConnected = true;
    });

    // Get channel info
    log.info("Requesting Channel Info");
    gw.getChannelInfo(function(err, res) {
        if (err) log.error("error: " + err);
        else log.debug("command succeeded: \n" + JSON.stringify(res));
    });

    // Get project listStyleType
    log.info("Requesting Project List");
    gw.getProjectList(function(err, res) {
        if (err) log.error("error: " + err);
        else log.debug("command succeeded: \n" + JSON.stringify(res));
    });

    // Trying to get all data from signed in channels
    gw.client.on('data', function(data) {
        this.data += data;

        log.debug('this.data looks like: ' + this.data)
        var arr = this.data.split("\r\n\r\n");
        log.debug('split data (arr) looks like: ' + arr)

        this.data = arr[arr.length-1];
        log.debug('updated this.data looks like: ' + this.data)

        for (var i = 0; i < arr.length-1; ++i) { //TODO: on first connection to the gateway, an error is thrown
            try{
				//log.debug("loggin easy stuff. Arr length:" + arr.length)
				//log.debug("array content at this i" + i + arr[i])
                var json=JSON.parse(arr[i]);
                log.debug('generated json looks like: ' + json)
                //publish dimmer and switch states on mqtt
                if (!(json.VALUES === undefined)){
                    //log.info("Gateway:" + JSON.stringify(json));
					log.info("Publishing updated info from gateway")
                    for (var i = 0; i < json.VALUES.length; i++){
                        mqttPublish('enet/get/dimmmer/'+json.VALUES[i].NUMBER  , json.VALUES[i].VALUE, {retain: config.mqttRetain});
                        mqttPublish('enet/get/switch/'+json.VALUES[i].NUMBER  , json.VALUES[i].STATE, {retain: config.mqttRetain});
                    }
                }
            }
            catch(e){
                log.error(e);
            }
        }
    }.bind(this));

    // Sign in to channels if connection to enet is lost
    gw.client.on('close', function() {
        signIn(config.channelArray);
    });

    // Sign in every 5 minutes
    (function(){
        signIn(config.channelArray);
        setTimeout(arguments.callee, 300000);
    })();


    // Connect to mqtt
    log.info('mqtt trying to connect', config.mqttUrl);

    mqtt = Mqtt.connect(config.mqttUrl, {
        clientId: config.name + '_' + Math.random().toString(16).substr(2, 8),
        will: {topic: config.name + '/connected', payload: '0', retain: (config.mqttRetain)},
        rejectUnauthorized: !config.insecure
    });

	// Log mqtt connection succeeded
    mqtt.on('connect', () => {
        mqttConnected = true;
        log.info('mqtt connected', config.mqttUrl);
        mqtt.publish(config.name + '/connected', enetConnected ? '2' : '1', {retain: config.mqttRetain});
        log.info('mqtt subscribe', config.name + '/set/#');
	      mqtt.subscribe(config.name + '/set/#');
    });

	// On mqtt connection closed
    mqtt.on('close', () => {
        if (mqttConnected) {
            mqttConnected = false;
            log.info('mqtt closed ' + config.mqttUrl);
        }
    });

	// Log mqtt errors
    mqtt.on('error', err => {
        log.error('mqtt', err.toString());
    });

	// Log mqtt server offline
    mqtt.on('offline', () => {
        log.error('mqtt offline');
    });

	// Log reconnect attempts
    mqtt.on('reconnect', () => {
        log.info('mqtt reconnect');
    });

	// On a new message on the MQTT topic, call value on gateway
    mqtt.on('message', (topic, payload) => {
		log.info("New MQTT message found on " + topic)
        payload = payload.toString();
        log.debug('mqtt <', topic, payload);

        if (payload.indexOf('{') !== -1) {
            try {
                payload = JSON.parse(payload);
            } catch (err) {
                log.error(err.toString());
            }
        } else if (payload === 'false') {
            payload = false;
        } else if (payload === 'true') {
            payload = true;
        } else if (!isNaN(payload)) {
            payload = parseFloat(payload);
        }
        const [, method, type, name, datapoint] = topic.split('/');

        switch (method) {
            case 'set':
                switch (type) {
                    case 'dimmer':
                        setValue(type, name, payload);
                        break;
                    case 'switch':
                        switch(payload) {
                            case 'ON':
                                setValue(type, name, 100);
                                break;
                            case 'OFF':
                                setValue(type, name, 0);
                                break;
                            default:
                            log.error('unknown type', type);
                        }
                        break;
                    default:
                        log.error('unknown type', type);
                }
                break;
            default:
                log.error('unknown method', method);
        }
    });
}

// Function to set a value on the gateway
function setValue(type, name, payload) {
    gw.setValueDim(name, payload, function(err, res) {
        if (err) log.error("error: " + err);
        else {
            log.info("Channel command succeeded: \n" + JSON.stringify(res));
        }
    });
};

// Function to sign in to gateway
function signIn(name) {
    gw.signIn(name, function(err, res) {
    if (err) log.error("sign in error: " + err);
    else log.info("sign in succeeded: \n" + JSON.stringify(res));
    });
};

// Function to publish state to mqtt
function mqttPublish(topic, payload, options) {
    if (!payload) {
        payload = '';
    } else if (typeof payload !== 'string') {
        payload = JSON.stringify(payload);
    }
    log.debug('mqtt >', topic, payload);
    mqtt.publish(topic, payload, options);
};
