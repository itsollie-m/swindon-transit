const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");

const { importGtfs } = require("../src/import/gtfsImporter");

const gtfsFile = path.join(__dirname, "../data/timetable.zip");
const data = importGtfs(gtfsFile);

test("GTFS feed contains routes", () => {
    assert.ok(Array.isArray(data.routes));
    assert.ok(data.routes.length > 0);
});

test("GTFS feed contains stops", () => {
    assert.ok(Array.isArray(data.stops));
    assert.ok(data.stops.length > 0);
});

test("GTFS feed contains trips", () => {
    assert.ok(Array.isArray(data.trips));
    assert.ok(data.trips.length > 0);
});

test("GTFS feed contains stop times", () => {
    assert.ok(Array.isArray(data.stopTimes));
    assert.ok(data.stopTimes.length > 0);
});

test("GTFS feed contains the expected route count", () => {
    assert.equal(data.routes.length, 58);
});
