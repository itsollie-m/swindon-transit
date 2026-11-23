require("dotenv").config();

const test = require("node:test");
const assert = require("node:assert/strict");

const { pool } = require("../src/database");
const {
    getJourneyDetails
} = require("../src/services/timetableService");

const tripId = "TDTR:16:015MFTDTR:I:14";

test("Route 16 journey can be retrieved", async () => {
    const journey = await getJourneyDetails(tripId);

    assert.ok(journey);
    assert.equal(journey.tripId, tripId);
});

test("Journey contains correct route information", async () => {
    const journey = await getJourneyDetails(tripId);

    assert.equal(journey.route.number, "16");
    assert.equal(journey.destination, "Town Centre");
});

test("Journey contains origin and final stop", async () => {
    const journey = await getJourneyDetails(tripId);

    assert.equal(journey.origin, "Blunsdon, The Cold Harbour");
    assert.ok(journey.finalStop);
});

test("Journey contains all stops in sequence", async () => {
    const journey = await getJourneyDetails(tripId);

    assert.ok(journey.totalStops > 0);
    assert.equal(journey.stops.length, journey.totalStops);

    for (let i = 1; i < journey.stops.length; i++) {
        assert.ok(
            journey.stops[i].sequence >
            journey.stops[i - 1].sequence
        );
    }
});

test("Every stop contains its scheduled times and location", async () => {
    const journey = await getJourneyDetails(tripId);

    for (const stop of journey.stops) {
        assert.ok(stop.id);
        assert.ok(stop.name);
        assert.ok(stop.arrivalTime);
        assert.ok(stop.departureTime);
        assert.ok(Number.isFinite(stop.latitude));
        assert.ok(Number.isFinite(stop.longitude));
    }
});

test("Unknown journey returns null", async () => {
    const journey = await getJourneyDetails("NON_EXISTENT_TRIP");

    assert.equal(journey, null);
});

test("Missing journey ID is rejected", async () => {
    await assert.rejects(
        getJourneyDetails(""),
        /A trip ID is required/
    );
});

test.after(async () => {
    await pool.end();
});

test("Non-existent or invalid journey IDs are handled correctly", async () => {
    await assert.rejects(
        getJourneyDetails(""),
        /A trip ID is required/
    );

    await assert.rejects(
        getJourneyDetails("   "),
        /A trip ID is required/
    );
});
