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
    const allRoutes = readGtfsFile(zip, "routes.txt");
    const allStops = readGtfsFile(zip, "stops.txt");
    const allTrips = readGtfsFile(zip, "trips.txt");
    const allStopTimes = readGtfsFile(zip, "stop_times.txt");

    const routes = allRoutes.filter(
        route => route.agency_id === "TDTR"
    );

    const routeIds = new Set(routes.map(route => route.route_id));

    const trips = allTrips.filter(
        trip => routeIds.has(trip.route_id)
    );

    const tripIds = new Set(trips.map(trip => trip.trip_id));

    const stopTimes = allStopTimes.filter(
        time => tripIds.has(time.trip_id)
    );

    const stopIds = new Set(stopTimes.map(time => time.stop_id));

    const stops = allStops.filter(
        stop => stopIds.has(stop.stop_id)
    );

    return {
        agencies: agencies.filter(agency => agency.agency_id === "TDTR"),
        routes,
        stops,
        trips,
        stopTimes
    };
}

module.exports = { importGtfs };
