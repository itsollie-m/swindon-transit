require("dotenv").config();

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    enableKeepAlive: true
});

async function testConnection() {
    let connection;

    try {
        connection = await pool.getConnection();

        const [rows] = await connection.query(
            "SELECT DATABASE() AS database_name, VERSION() AS mysql_version"
        );

        console.log("Database connection successful!");
        console.log("Database:", rows[0].database_name);
        console.log("MySQL version:", rows[0].mysql_version);

    } catch (error) {
        console.error("Database connection failed:", error.message);
        throw error;

    } finally {
        connection?.release();
    }
}

module.exports = {
    pool,
    testConnection
};
