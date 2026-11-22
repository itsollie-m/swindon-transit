
const AdmZip = require("adm-zip");
const { parse } = require("csv-parse/sync");

function readGtfsFile(zip, filename, optional = false) {
    const entry = zip.getEntry(filename);

    if (!entry) {
        if (optional) return [];
        throw new Error(`Missing GTFS file: ${filename}`);
    }

    return parse(entry.getData().toString("utf8"), {
        columns: true,
        skip_empty_lines: true,
        bom: true,
        relax_column_count: true
    });
}

function clean(value) {
    return value === undefined || value === "" ? null : value;
}

function gtfsDate(value) {
    if (!value) return null;

    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function importGtfs(zipPath) {
    const zip = new AdmZip(zipPath);

    const allAgencies = readGtfsFile(zip, "agency.txt");
    const allRoutes = readGtfsFile(zip, "routes.txt");
    const allStops = readGtfsFile(zip, "stops.txt");
    const allTrips = readGtfsFile(zip, "trips.txt");
    const allStopTimes = readGtfsFile(zip, "stop_times.txt");
    const allCalendar = readGtfsFile(zip, "calendar.txt", true);
    const allCalendarDates = readGtfsFile(zip, "calendar_dates.txt", true);
    const allShapes = readGtfsFile(zip, "shapes.txt", true);

    const agencyId = process.env.GTFS_AGENCY_ID || "TDTR";

    const agencies = allAgencies.filter(
        agency => agency.agency_id === agencyId
    );

    const routes = allRoutes.filter(
        route => route.agency_id === agencyId
    );

    const routeIds = new Set(routes.map(route => route.route_id));

    const trips = allTrips.filter(
        trip => routeIds.has(trip.route_id)
    );

    const tripIds = new Set(trips.map(trip => trip.trip_id));
    const serviceIds = new Set(trips.map(trip => trip.service_id));
    const shapeIds = new Set(
        trips.map(trip => trip.shape_id).filter(Boolean)
    );

    const stopTimes = allStopTimes.filter(
        time => tripIds.has(time.trip_id)
    );

    const stopIds = new Set(stopTimes.map(time => time.stop_id));

    const stops = allStops.filter(
        stop => stopIds.has(stop.stop_id)
    );

    const calendar = allCalendar
        .filter(service => serviceIds.has(service.service_id))
        .map(service => ({
            ...service,
            start_date: gtfsDate(service.start_date),
            end_date: gtfsDate(service.end_date)
        }));

    const calendarDates = allCalendarDates
        .filter(date => serviceIds.has(date.service_id))
        .map(date => ({
            ...date,
            date: gtfsDate(date.date)
        }));

    const shapes = allShapes.filter(
        shape => shapeIds.has(shape.shape_id)
    );

    return {
        agencies,
        routes,
        stops,
        trips,
        stopTimes,
        calendar,
        calendarDates,
        shapes
    };
}

module.exports = { importGtfs };
