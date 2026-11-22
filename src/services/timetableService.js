const { pool } = require("../database");

// STOP SEARCH
async function searchStops(searchTerm, limit = 10) {
    if (!searchTerm || !searchTerm.trim()) return [];

    const term = `%${searchTerm.trim()}%`;

    const [rows] = await pool.execute(
        `SELECT stop_id, stop_name, stop_lat, stop_lon
         FROM stops
         WHERE stop_name LIKE ?
         ORDER BY stop_name, stop_id
         LIMIT ?`,
        [term, limit * 5]
    );

    const grouped = new Map();

    for (const stop of rows) {
        if (!grouped.has(stop.stop_name)) {
            grouped.set(stop.stop_name, {
                name: stop.stop_name,
                locations: []
            });
        }

        grouped.get(stop.stop_name).locations.push({
            id: stop.stop_id,
            latitude: Number(stop.stop_lat),
            longitude: Number(stop.stop_lon)
        });
    }

    return [...grouped.values()].slice(0, limit);
}

// ROUTE SEARCH
async function getRoutes() {
    const [rows] = await pool.execute(
        `SELECT
            r.route_id,
            r.route_short_name,
            r.route_long_name,
            r.route_color,
            r.route_text_color,
            COUNT(DISTINCT t.trip_id) AS journey_count,
            GROUP_CONCAT(
                DISTINCT t.trip_headsign
                ORDER BY t.trip_headsign
                SEPARATOR '|||'
            ) AS destinations
         FROM routes r
         LEFT JOIN trips t ON t.route_id = r.route_id
         GROUP BY
            r.route_id,
            r.route_short_name,
            r.route_long_name,
            r.route_color,
            r.route_text_color
         ORDER BY
            r.route_short_name,
            r.route_id`
    );

    return rows.map(row => ({
        id: row.route_id,
        number: row.route_short_name,
        name: row.route_long_name,
        colour: row.route_color,
        textColour: row.route_text_color,
        journeyCount: Number(row.journey_count),
        destinations: row.destinations
            ? row.destinations.split("|||")
            : []
    }));
}

async function getRouteDetails(routeNumber) {
    if (!routeNumber) {
        throw new Error("A route number is required.");
    }

    const [rows] = await pool.execute(
        `SELECT
            r.route_id,
            r.route_short_name,
            r.route_long_name,
            r.route_color,
            r.route_text_color,
            COUNT(DISTINCT t.trip_id) AS journey_count,
            GROUP_CONCAT(
                DISTINCT t.trip_headsign
                ORDER BY t.trip_headsign
                SEPARATOR '|||'
            ) AS destinations
         FROM routes r
         LEFT JOIN trips t ON t.route_id = r.route_id
         WHERE r.route_short_name = ?
         GROUP BY
            r.route_id,
            r.route_short_name,
            r.route_long_name,
            r.route_color,
            r.route_text_color`,
        [String(routeNumber)]
    );

    if (rows.length === 0) {
        return null;
    }

    const route = rows[0];

    return {
        id: route.route_id,
        number: route.route_short_name,
        name: route.route_long_name,
        colour: route.route_color,
        textColour: route.route_text_color,
        journeyCount: Number(route.journey_count),
        destinations: route.destinations
            ? route.destinations.split("|||")
            : []
    };
}

// DATE UTILITIES
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatGtfsTime(time) {
    if (!time) return null;

    const [hours, minutes] = time.split(":").map(Number);

    return [
        String(hours).padStart(2, "0"),
        String(minutes).padStart(2, "0")
    ].join(":");
}

function getCurrentGtfsTime(date) {
    return [
        String(date.getHours()).padStart(2, "0"),
        String(date.getMinutes()).padStart(2, "0"),
        String(date.getSeconds()).padStart(2, "0")
    ].join(":");
}

// CALENDAR
async function getActiveServices(date) {
    const dateString = formatDate(date);

    const weekdays = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
    ];

    const weekday = weekdays[date.getDay()];

    const [calendarRows] = await pool.execute(
        `SELECT service_id FROM calendar
         WHERE start_date <= ?
         AND end_date >= ?
         AND \`${weekday}\` = 1`,
        [dateString, dateString]
    );

    const activeServices = new Set(
        calendarRows.map(row => row.service_id)
    );

    const [exceptions] = await pool.execute(
        `SELECT service_id, exception_type
         FROM calendar_dates
         WHERE date = ?`,
        [dateString]
    );

    for (const exception of exceptions) {
        if (Number(exception.exception_type) === 1) {
            activeServices.add(exception.service_id);
        } else if (Number(exception.exception_type) === 2) {
            activeServices.delete(exception.service_id);
        }
    }

    return [...activeServices];
}

// DEPARTURES
async function getDepartures(stopId, options = {}) {
    if (!stopId) {
        throw new Error("A stop ID is required.");
    }

    const date = options.date || new Date();
    const fromTime = options.fromTime || getCurrentGtfsTime(date);
    const limit = Math.min(
        Math.max(Number(options.limit) || 20, 1),
        100
    );

    const activeServices = await getActiveServices(date);

    if (activeServices.length === 0) return [];

    const placeholders = activeServices.map(() => "?").join(", ");

    const [rows] = await pool.execute(
        `SELECT
            st.stop_id,
            st.arrival_time,
            st.departure_time,
            st.stop_sequence,
            t.trip_id,
            t.trip_headsign,
            t.direction_id,
            r.route_id,
            r.route_short_name,
            r.route_long_name,
            r.route_color,
            r.route_text_color
         FROM stop_times st
         JOIN trips t ON t.trip_id = st.trip_id
         JOIN routes r ON r.route_id = t.route_id
         WHERE st.stop_id = ?
         AND t.service_id IN (${placeholders})
         AND TIME_TO_SEC(st.departure_time) >= TIME_TO_SEC(?)
         ORDER BY TIME_TO_SEC(st.departure_time) ASC
         LIMIT ?`,
        [stopId, ...activeServices, fromTime, limit]
    );

    return rows.map(row => ({
        stopId: row.stop_id,
        tripId: row.trip_id,
        route: row.route_short_name,
        routeId: row.route_id,
        destination: row.trip_headsign,
        direction: row.direction_id,
        arrivalTime: formatGtfsTime(row.arrival_time),
        departureTime: formatGtfsTime(row.departure_time),
        routeColor: row.route_color,
        routeTextColor: row.route_text_color
    }));
}

module.exports = {
    searchStops,
    getRoutes,
    getRouteDetails,
    getActiveServices,
    getDepartures
};
