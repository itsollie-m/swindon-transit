require("dotenv").config();

const test = require("node:test");
const assert = require("node:assert/strict");

const { pool } = require("../src/database");

test("Database connection is successful", async () => {
    const [rows] = await pool.query("SELECT 1 AS result");

    assert.equal(rows[0].result, 1);
});

test("Correct database is selected", async () => {
    const [rows] = await pool.query(
        "SELECT DATABASE() AS database_name"
    );

    assert.equal(rows[0].database_name, process.env.DB_NAME);
});

test("Database version is available", async () => {
    const [rows] = await pool.query(
        "SELECT VERSION() AS version"
    );

    assert.ok(rows[0].version);
});

test.after(async () => {
    await pool.end();
});
