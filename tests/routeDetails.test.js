require("dotenv").config();

const test = require("node:test");
const assert = require("node:assert/strict");

const { pool } = require("../src/database");
const { getRouteDetails } = require("../src/services/timetableService");

test("Route 16 details can be retrieved", async () => {
    const route = await getRouteDetails("16");

    assert.ok(route);
    assert.equal(route.number, "16");
});

test("Route 16 has the correct route ID", async () => {
    const route = await getRouteDetails("16");

    assert.equal(route.id, "TDTR:16");
});

test("Route 16 has scheduled journeys", async () => {
    const route = await getRouteDetails("16");

    assert.ok(route.journeyCount > 0);
});

test("Route 16 serves Blunsdon and Town Centre", async () => {
    const route = await getRouteDetails("16");

    assert.ok(route.destinations.includes("Blunsdon"));
    assert.ok(route.destinations.includes("Town Centre"));
});

test("Unknown route returns null", async () => {
    const route = await getRouteDetails("999999");

    assert.equal(route, null);
});

test.after(async () => {
    await pool.end();
});
