require("dotenv").config();

const client = require("./discord/client");
const { loadCommands } = require("./discord/commandHandler");
const { loadEvents } = require("./discord/eventHandler");

async function start() {
    try {
        console.log("================================");
        console.log("       SWINDON TRANSIT");
        console.log("================================");

        // Load application commands
        await loadCommands(client);

        // Register Discord events
        loadEvents(client);

        // Connect to Discord
        await client.login(process.env.DISCORD_TOKEN);

    } catch (error) {
        console.error("Failed to start Swindon Transit:", error);
        process.exitCode = 1;
    }
}

start();
