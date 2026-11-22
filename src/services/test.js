require("dotenv").config();

const { pool } = require("../database");

const {
    searchStops,
    getDepartures
} = require("./timetableService");

async function main() {
    try {
        console.log("================================");
        console.log("       SWINDON TRANSIT");
        console.log("       SERVICE TEST");
        console.log("================================\n");

        // Search for stops
        console.log("Searching for Abbey Stadium...\n");

        const stops = await searchStops("Abbey Stadium");

        console.dir(stops, { depth: null });

        if (!stops.length) {
            console.log("No matching stops found.");
            return;
        }

        // Retrieve departures from each physical stop
        for (const location of stops[0].locations) {
            console.log(`\nDepartures from ${location.id}:`);

            const departures = await getDepartures(location.id);

            if (!departures.length) {
                console.log("No upcoming departures found.");
                continue;
            }

            console.table(departures);
        }

    } catch (error) {
        console.error("Test failed:", error.message);
        process.exitCode = 1;

    } finally {
        await pool.end();
    }
}

main();
