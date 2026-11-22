require("dotenv").config();

const test = require("node:test");
const assert = require("node:assert/strict");

const { pool } = require("../src/database");
const { closePool } = require("../src/database");
const { getRouteDetails, getRouteTimetable } =
    require("../src/services/timetableService");

test("Route 16 exists", async () => {
    const route = await getRouteDetails("16");

    assert.ok(route, "Route 16 should exist");
    assert.equal(route.number, "16");
});

test("Route 16 has weekday journeys", async () => {
    const timetable = await getRouteTimetable("16", "weekdays");

    assert.ok(timetable.journeys.length > 0);
});

test("Route 16 has Saturday journeys", async () => {
    const timetable = await getRouteTimetable("16", "saturdays");

    assert.ok(timetable.journeys.length > 0);
});

test("Route 16 does not run on Sundays", async () => {
    const timetable = await getRouteTimetable("16", "sundays");

    assert.equal(timetable.journeys.length, 0);
});

test("Route 1 has Sunday journeys", async () => {
    const timetable = await getRouteTimetable("1", "sundays");

    assert.ok(timetable.journeys.length > 0);
});

test("Invalid timetable type is rejected", async () => {
    await assert.rejects(
        getRouteTimetable("16", "invalid"),
        /Invalid timetable type/
    );
});

test.after(async () => {
    await closePool();
});