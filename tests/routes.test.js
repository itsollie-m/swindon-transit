require("dotenv").config();

const test = require("node:test");
const assert = require("node:assert/strict");

const { pool } = require("../src/database");
const { getRoutes } = require("../src/services/timetableService");

test("All 58 routes are returned", async () => {
    const routes = await getRoutes();

    assert.equal(routes.length, 58);
});

test("Every route has a route number", async () => {
    const routes = await getRoutes();

    for (const route of routes) {
        assert.ok(route.number);
    }
});

test("Every route has a journey count", async () => {
    const routes = await getRoutes();

    for (const route of routes) {
        assert.ok(Number.isInteger(route.journeyCount));
        assert.ok(route.journeyCount >= 0);
    }
});

test("Route 16 is included in the results", async () => {
    const routes = await getRoutes();

    const route16 = routes.find(
        route => route.number === "16"
    );

    assert.ok(route16);
    assert.equal(route16.id, "TDTR:16");
});

test("Route numbers are unique", async () => {
    const routes = await getRoutes();

    const routeNumbers = routes.map(route => route.number);

    assert.equal(
        new Set(routeNumbers).size,
        routeNumbers.length
    );
});

test.after(async () => {
    await pool.end();
});
