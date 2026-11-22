require("dotenv").config();

const { pool } = require("../database");
const { getRouteDetails } = require("./timetableService");

async function main() {
    try {
        const routeNumber = process.argv[2] || "16";

        console.log("================================");
        console.log("       SWINDON TRANSIT");
        console.log("       ROUTE DETAILS TEST");
        console.log("================================\n");

        const route = await getRouteDetails(routeNumber);

        if (!route) {
            console.log(`Route ${routeNumber} was not found.`);
            return;
        }

        console.log(`Route: ${route.number}`);
        console.log(`Name: ${route.name || "Not provided"}`);
        console.log(`Route ID: ${route.id}`);
        console.log(`Operator: TDTR`);
        console.log(`Scheduled journeys: ${route.journeyCount}`);
        console.log(`Colour: #${route.colour || "Not provided"}`);
        console.log("\nDestinations:");

        for (const destination of route.destinations) {
            console.log(`  - ${destination}`);
        }

    } catch (error) {
        console.error("Route details test failed:", error);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

main();
