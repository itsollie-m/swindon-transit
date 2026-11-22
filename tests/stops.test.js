require("dotenv").config();

const test = require("node:test");
const assert = require("node:assert/strict");

const { pool } = require("../src/database");
const { searchStops } = require("../src/services/timetableService");

test("Abbey Stadium can be found", async () => {
    const results = await searchStops("Abbey Stadium");

    assert.ok(results.length > 0);
    assert.equal(results[0].name, "Abbey Stadium");
});

test("Abbey Stadium returns both physical locations", async () => {
    const results = await searchStops("Abbey Stadium");

    const abbeyStadium = results.find(
        stop => stop.name === "Abbey Stadium"
    );

    assert.ok(abbeyStadium);
    assert.equal(abbeyStadium.locations.length, 2);
});

test("Stop search returns location IDs", async () => {
    const results = await searchStops("Abbey Stadium");

    const abbeyStadium = results.find(
        stop => stop.name === "Abbey Stadium"
    );

    for (const location of abbeyStadium.locations) {
        assert.ok(location.id);
        assert.ok(Number.isFinite(location.latitude));
        assert.ok(Number.isFinite(location.longitude));
    }
});

test("Non-existent stop returns no results", async () => {
    const results = await searchStops(
        "This Stop Definitely Does Not Exist"
    );

    assert.deepEqual(results, []);
});

test.after(async () => {
    await pool.end();
});
