module.exports = {
    name: "ready",
    once: true,

    execute(client) {
        console.log("--------------------------------");
        console.log(`Ready! Logged in as ${client.user.tag}`);
        console.log("Swindon Transit is online!");
        console.log("--------------------------------");
    }
};
