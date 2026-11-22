require("dotenv").config();

const test = require("node:test");
const assert = require("node:assert/strict");

const { pool } = require("../src/database");
const { getDepartures } = require("../src/services/timetableService");

const abbeyStadiumStops = [
    "4680SWA01169",
    "4680SWA01170"
];

test("Departures can be retrieved for the first Abbey Stadium stop", async () => {
    const departures = await getDepartures(
        abbeyStadiumStops[0]
    );

    assert.ok(Array.isArray(departures));
});

test("Departures can be retrieved for the second Abbey Stadium stop", async () => {
    const departures = await getDepartures(
        abbeyStadiumStops[1]
    );

    assert.ok(Array.isArray(departures));
});

test("Departure results contain the expected fields", async () => {
    const departures = await getDepartures(
        abbeyStadiumStops[0]
    );

    for (const departure of departures) {
        assert.ok(departure.tripId);
        assert.ok(departure.departureTime);
    }
});

test("Unknown stop ID returns no departures", async () => {
    const departures = await getDepartures(
        "NON_EXISTENT_STOP"
    );

    assert.deepEqual(departures, []);
});

test.after(async () => {
    await pool.end();
});
