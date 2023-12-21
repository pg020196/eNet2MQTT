# eNet2MQTT
Bridge between Gira eNet Mobile Gate and MQTT. Can be run as node app or used as addon for Home Assistant.

## Setup

### MQTT Broker

Requires an mqtt broker, such as `Eclipse Mosquitto` message broker that implements the MQTT protocol.

### Local execution
- Install Node.js
- Run `npm install` in enet2mqtt directory to install all dependencies.
- Run `node index.js`. Use `-h` argument to show all available arguments.

### Configuration in Home Assistant

- Add the repository to Home Assistant and install the add-on
- In the configuration tab, the following options can be set:

| Options | Description | Example |
| - | - | - |
| mqtt_ip | IP address of your MQTT broker | 127.0.0.1 |
| mqtt_username | username to authenticate at your mtqq broker | username |
| mqtt_password | password to authenticate at your mtqq broker | password |
| enet_ip | IP address of your mobile gate | 192.168.1.2 |
| enet_channel_array | eNet channels that should be supervised. Channel ids start at 16 and are two digit numbers. Multiple channels can be separated by "," | e. g. "16" as a single channel or "16,17,18" as multiple channels. |
| log_level | Log level for console out | Can be one of trace,debug,info,notice,warning,error,fatal |

- Add your switches or dimmers as entities in your `configuration.yaml` file
- Exemplary configuration:
``` yaml
mqtt:
  light:
    - unique_id: ceiling01
      name: "Ceiling Lamp"
      state_topic: "enet/get/switch/16"
      command_topic: "enet/set/switch/16"
      on_command_type: brightness
      payload_on: "ON"
      payload_off: "OFF"
      brightness_state_topic: "enet/get/dimmer/16"
      brightness_command_topic: "enet/set/dimmer/16"
      brightness_scale: 100
```