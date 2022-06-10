const Client = require('./base/Client');
const config = require('./config.test.json');
require('./base/Prototypes');
require('dotenv/config');

const client = new Client({ config });

client.login(process.env.TOKEN);

client.loadEvents();
client.loadCommands();
client.loadButtons();
client.loadSelectMenus();