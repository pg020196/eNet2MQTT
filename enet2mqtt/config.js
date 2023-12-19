const pkg = require('./package.json');

module.exports = require('yargs')
    .env('ENET2MQTT')
    .usage(pkg.name + ' ' + pkg.version + '\n' + pkg.description + '\n\nUsage: $0 [options]')
    .describe('verbosity', 'possible values: "error", "warn", "info", "debug"')
    .describe('name', 'instance name. used as mqtt client id and as prefix for connected topic')
    .describe('mqtt_url', 'mqtt broker url.')
    .describe('enet_ip', 'eNet Mobile Gate IP.')
    .describe('help', 'show help')
    .describe('channelArray', 'Array with channels to monitor, [ch1, ch2, ..]')
    .describe('mqtt-retain', 'enable/disable retain flag for mqtt messages')
    .describe('mqtt_username', 'username for mqtt broker')
    .describe('mqtt_password', 'password for mqtt broker')
    .alias({
        h: 'help',
        m: 'mqtt_ip',
        e: 'enet_ip',
        n: 'name',
        v: 'log_level',
        c: 'channelArray',
        u: 'mqtt_username',
        p: 'mqtt_password'
    })
    .boolean('mqtt-retain')
    .default({
        'mqtt_ip': '192.168.2.18',
        'enet_ip': '192.168.2.2',
        'name': 'enet',
        'log_level': 'info',
        'mqtt-retain': true,
        'channelArray': [16, 17, 18, 19, 20],
        'mqtt_username': '',
        'mqtt_password': ''
    })
    .version()
    .help('help')
    .argv;
