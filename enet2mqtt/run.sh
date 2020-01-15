#!/bin/bash
set -e

# Try stuff that should work
node -v 
npm -v 
# Retrieving options variables 
CONFIG_PATH=/data/options.json 
ENET_IP="$(jq --raw-output '.enet_ip' $CONFIG_PATH)" 
MQTT_IP="$(jq --raw-output '.mqtt_ip' $CONFIG_PATH)" 
LOG_LEVEL="$(jq --raw-output '.log_level' $CONFIG_PATH)" 
echo eNet IP is: $ENET_IP 
echo MQTT IP is: $MQTT_IP 
echo Log level is: $LOG_LEVEL 
echo starting node application 
node index.js -m $MQTT_IP -v $LOG_LEVEL 