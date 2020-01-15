#!/bin/bash

# Try stuff that should work
echo Shell script started
echo Node version:
node -v 
echo NPM version:
npm -v 

# Retrieving options variables 
CONFIG_PATH=/data/options.json 
ENET_IP="$(jq --raw-output '.enet_ip' $CONFIG_PATH)" 
MQTT_IP="$(jq --raw-output '.mqtt_ip' $CONFIG_PATH)" 
LOG_LEVEL="$(jq --raw-output '.log_level' $CONFIG_PATH)" 


echo Starting node application 
node index.js -e $ENET_IP -m $MQTT_IP -v $LOG_LEVEL 