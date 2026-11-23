const fs = require("node:fs");
const path = require("node:path");

async function loadCommands(client) {
    const commandsPath = path.join(__dirname, "../commands");
    const commandFiles = fs.readdirSync(commandsPath)
        .filter(file => file.endsWith(".js"));

    client.commands = new Map();

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if (!command.data || !command.execute) {
            console.warn(`Skipping invalid command: ${file}`);
            continue;
        }

        client.commands.set(command.data.name, command);
    }

    console.log(`Loaded ${client.commands.size} commands.`);
}

module.exports = { loadCommands };