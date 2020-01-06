echo Hello!
echo started run.sh
node v
npm v

while ! ping -c1 192.168.2.3 &>/dev/null; do echo "Ping Fail - `date`"; done ; echo "Host Found - `date`" ; node index.js

# Attempt to give variables to JavaScipt:
options=/data/options.json

node index.js $options
