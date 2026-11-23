require("dotenv").config();

const { REST, Routes } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

async function registerCommands() {
    const commandsPath = path.join(__dirname, "../commands");

    const commandFiles = fs.readdirSync(commandsPath)
        .filter(file => file.endsWith(".js"));

    const commands = commandFiles.map(file => {
        const command = require(path.join(commandsPath, file));
        return command.data.toJSON();
    });

    const rest = new REST({ version: "10" })
        .setToken(process.env.DISCORD_TOKEN);

    await rest.put(
        Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID),
        { body: commands }
    );

    console.log(`Successfully registered ${commands.length} commands.`);
}

registerCommands().catch(console.error);