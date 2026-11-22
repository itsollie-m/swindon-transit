const { testConnection } = require("./index");

async function main() {
    try {
        await testConnection();
    } catch {
        process.exitCode = 1;
    }
}

main();
