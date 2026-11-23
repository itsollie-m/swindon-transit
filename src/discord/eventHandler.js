const fs = require("node:fs");
const path = require("node:path");

function loadEvents(client) {
    const eventsPath = path.join(__dirname, "../events");
    const eventFiles = fs.readdirSync(eventsPath)
        .filter(file => file.endsWith(".js"));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if (!event.name || !event.execute) {
            console.warn(`Skipping invalid event: ${file}`);
            continue;
        }

        const handler = (...args) => event.execute(...args);

        if (event.once) {
            client.once(event.name, handler);
        } else {
            client.on(event.name, handler);
        }
    }

    console.log(`Loaded ${eventFiles.length} events.`);
}

module.exports = { loadEvents };