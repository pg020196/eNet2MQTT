#!/bin/bash

# Try stuff that should work
echo Shell script started

# Retrieving options variables
CONFIG_PATH=/data/options.json
ENET_IP="$(jq --raw-output '.enet_ip' $CONFIG_PATH)"
MQTT_IP="$(jq --raw-output '.mqtt_ip' $CONFIG_PATH)"
LOG_LEVEL="$(jq --raw-output '.log_level' $CONFIG_PATH)"
MQTT_USERNAME="$(jq --raw-output '.mqtt_username' $CONFIG_PATH)"
MQTT_PASSWORD="$(jq --raw-output '.mqtt_password' $CONFIG_PATH)"
ENET_CHANNELARRAY="$(jq --raw-output '.enet_channel_array' $CONFIG_PATH)"


echo Starting node application
node index.js -e $ENET_IP -m $MQTT_IP -v $LOG_LEVEL -u $MQTT_USERNAME -p $MQTT_PASSWORD -c $ENET_CHANNELARRAY
