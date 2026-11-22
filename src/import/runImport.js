
require("dotenv").config();

const path = require("path");
const { pool } = require("../database");
const { importGtfs } = require("./gtfsImporter");

const TABLES = [
    {
        name: "agencies",
        columns: [
            "agency_id", "agency_name", "agency_url",
            "agency_timezone", "agency_lang", "agency_phone"
        ]
    },
    {
        name: "routes",
        columns: [
            "route_id", "agency_id", "route_short_name",
            "route_long_name", "route_desc", "route_type",
            "route_url", "route_color", "route_text_color"
        ]
    },
    {
        name: "stops",
        columns: [
            "stop_id", "stop_code", "stop_name", "stop_desc",
            "stop_lat", "stop_lon", "location_type",
            "parent_station", "stop_timezone", "wheelchair_boarding"
        ]
    },
    {
        name: "calendar",
        columns: [
            "service_id", "monday", "tuesday", "wednesday",
            "thursday", "friday", "saturday", "sunday",
            "start_date", "end_date"
        ]
    },
    {
        name: "calendar_dates",
        columns: ["service_id", "date", "exception_type"]
    },
    {
        name: "shapes",
        columns: [
            "shape_id", "shape_pt_lat", "shape_pt_lon",
            "shape_pt_sequence"
        ]
    },
    {
        name: "trips",
        columns: [
            "trip_id", "route_id", "service_id", "trip_headsign",
            "direction_id", "block_id", "shape_id",
            "wheelchair_accessible", "bikes_allowed"
        ]
    },
    {
        name: "stop_times",
        columns: [
            "trip_id", "arrival_time", "departure_time",
            "stop_id", "stop_sequence", "stop_headsign",
            "pickup_type", "drop_off_type", "timepoint"
        ]
    }
];

async function insertMany(connection, table, rows, columns) {
    if (!rows.length) {
        console.log(`  ${table}: 0 records`);
        return;
    }

    const batchSize = 500;
    const columnNames = columns.map(column => `\`${column}\``).join(", ");

    for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);

        const rowPlaceholder = `(${columns.map(() => "?").join(", ")})`;
        const placeholders = batch.map(() => rowPlaceholder).join(", ");

        const values = batch.flatMap(row =>
            columns.map(column => {
                const value = row[column];
                return value === undefined || value === "" ? null : value;
            })
        );

        const sql = `
            INSERT INTO \`${table}\` (${columnNames})
            VALUES ${placeholders}
        `;

        await connection.query(sql, values);
    }

    console.log(`  ${table}: ${rows.length.toLocaleString()} records`);
}

async function main() {
    const zipPath = path.resolve(
        process.env.GTFS_FILE || "./data/timetable.zip"
    );

    console.log("================================");
    console.log("       SWINDON TRANSIT");
    console.log("        GTFS IMPORT");
    console.log("================================");
    console.log("Reading timetable...");

    const data = importGtfs(zipPath);

    console.log("Timetable parsed successfully.");
    console.log(`Operator: ${process.env.GTFS_AGENCY_ID || "TDTR"}`);
    console.log("");

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        console.log("Clearing previous timetable data...");

        for (const table of [
            "stop_times",
            "trips",
            "routes",
            "stops",
            "calendar_dates",
            "calendar",
            "shapes",
            "agencies"
        ]) {
            await connection.query(`DELETE FROM \`${table}\``);
        }

        console.log("Importing timetable data...");

        for (const table of TABLES) {
            await insertMany(
                connection,
                table.name,
                data[
                    table.name === "calendar_dates" ? "calendarDates" :
                    table.name === "stop_times" ? "stopTimes" :
                    table.name === "calendar" ? "calendar" :
                    table.name
                ],
                table.columns
            );
        }

        await connection.commit();

        console.log("");
        console.log("================================");
        console.log("       IMPORT COMPLETE");
        console.log("================================");

    } catch (error) {
        await connection.rollback();
        console.error("Import failed. Changes rolled back.");
        throw error;

    } finally {
        connection.release();
        await pool.end();
    }
}

main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});
