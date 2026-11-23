const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
    intents: []
});

module.exports = client;