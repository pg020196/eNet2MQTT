const pkg = require('./package.json');

module.exports = require('yargs')
    .env('ENET2MQTT')
    .usage(pkg.name + ' ' + pkg.version + '\n' + pkg.description + '\n\nUsage: $0 [options]')
    .describe('verbosity', 'possible values: "error", "warn", "info", "debug"')
    .describe('name', 'instance name. used as mqtt client id and as prefix for connected topic')
    .describe('mqtt_url', 'mqtt broker url.')
    .describe('mqtt_username', 'username for mqtt broker')
    .describe('mqtt_password', 'password for mqtt broker')
    .describe('mqtt_retain', 'enable/disable retain flag for mqtt messages')
    .describe('enet_ip', 'eNet Mobile Gate IP.')
    .describe('enet_channel_array', 'Array with channels to monitor, [ch1, ch2, ..]')
    .describe('help', 'show help')
    .alias({
        h: 'help',
        m: 'mqtt_ip',
        e: 'enet_ip',
        n: 'name',
        v: 'log_level',
        c: 'enet_channel_array',
        u: 'mqtt_username',
        p: 'mqtt_password',
    })
    .boolean('mqtt-retain')
    .default({
        'mqtt_ip': '127.0.0.1',
        'mqtt_username': '',
        'mqtt_password': '',
        'mqtt_retain': true,
        'enet_ip': '127.0.0.1',
        'enet_channel_array': '[16,17,18,19]',
        'name': 'enet',
        'log_level': 'info',
    })
    .version()
    .help('help')
    .argv;
