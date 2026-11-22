
const AdmZip = require("adm-zip");
const { parse } = require("csv-parse/sync");

function readGtfsFile(zip, filename) {
    const entry = zip.getEntry(filename);

    if (!entry) {
        throw new Error(`Missing GTFS file: ${filename}`);
    }

    return parse(entry.getData().toString("utf8"), {
        columns: true,
        skip_empty_lines: true,
        bom: true,
        relax_column_count: true
    });
}

function importGtfs(zipPath) {
    const zip = new AdmZip(zipPath);

    const agencies = readGtfsFile(zip, "agency.txt");
    const routes = readGtfsFile(zip, "routes.txt");
    const stops = readGtfsFile(zip, "stops.txt");
    const trips = readGtfsFile(zip, "trips.txt");
    const stopTimes = readGtfsFile(zip, "stop_times.txt");

    return {
        agencies,
        routes: routes.filter(route => route.agency_id === "TDTR"),
        stops,
        trips,
        stopTimes
    };
}

module.exports = { importGtfs };
