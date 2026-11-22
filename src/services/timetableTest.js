require("dotenv").config();

const { pool } = require("../database");
const { getRouteTimetable } = require("./timetableService");

async function main() {
    try {
        const routeNumber = process.argv[2] || "16";
        const timetableType = process.argv[3] || "weekdays";

        console.log("================================");
        console.log("       SWINDON TRANSIT");
        console.log("       TIMETABLE TEST");
        console.log("================================\n");

        const timetable = await getRouteTimetable(
            routeNumber,
            timetableType
        );

        console.log(`Route: ${timetable.route}`);
        console.log(`Timetable: ${timetable.timetableLabel}`);
        console.log(`Journeys: ${timetable.journeys.length}\n`);

        console.table(
            timetable.journeys.map(journey => ({
                Departure: journey.departureTime,
                Origin: journey.origin,
                Destination: journey.destination,
                Days: journey.operatingDays.join(", ")
            }))
        );

    } catch (error) {
        console.error("Timetable test failed:", error);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

main();
