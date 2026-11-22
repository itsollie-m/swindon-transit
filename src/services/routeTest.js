require("dotenv").config();

const { pool } = require("../database");
const { getRoutes } = require("./timetableService");

async function main() {
    try {
        console.log("================================");
        console.log("       SWINDON TRANSIT");
        console.log("       ROUTE TEST");
        console.log("================================\n");

        const routes = await getRoutes();

        console.log(`Found ${routes.length} routes.\n`);

        for (const route of routes) {
            console.log("--------------------------------");
            console.log(`Route: ${route.number || route.id}`);
            console.log(`Name: ${route.name || "Not provided"}`);
            console.log(`Journeys: ${route.journeyCount}`);
            console.log("Destinations:");

            for (const destination of route.destinations) {
                console.log(`  - ${destination}`);
            }
        }
    } catch (error) {
        console.error("Route test failed:", error);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

main();
