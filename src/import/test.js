const path = require('path');
const { importGtfs } = require('./gtfsImporter');

const data = importGtfs(
    path.join(__dirname, '../../data/timetable.zip')
)

console.log("GTFS import test")
console.log("----------------")
console.log("Routes:", data.routes.length)
console.log("Stops:", data.stops.length)
console.log("Trips:", data.trips.length)
console.log("Stop times:", data.stopTimes.length)