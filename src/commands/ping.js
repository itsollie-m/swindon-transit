const {
    SlashCommandBuilder,
    EmbedBuilder,
    MessageFlags
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("View Swindon Transit's system diagnostics.")
        .setIntegrationTypes([1])
        .setContexts([0, 1, 2]),

    async execute(interaction) {
        const client = interaction.client;

        // DIAGNOSTICS
        const now = Date.now();
        const interactionLatency = now - interaction.createdTimestamp;
        const gatewayLatency = client.ws.ping;

        const uptime = Math.floor(process.uptime());
        const startedAt = Math.floor((now - uptime * 1000) / 1000);

        const memory = (
            process.memoryUsage().heapUsed / 1024 / 1024
        ).toFixed(1);

        const logoURL = "https://cdn.olliem.dev/assets/swindon-transit/logos/transit-square.png";

        // RESPONSE STATUS
        let status;
        let colour;
        let indicator;

        if (interactionLatency < 100) {
            status = "Excellent";
            colour = 0x2ECC71;
            indicator = "🟢";
        } else if (interactionLatency < 200) {
            status = "Moderate";
            colour = 0xF1C40F;
            indicator = "🟡";
        } else {
            status = "Slow";
            colour = 0xE74C3C;
            indicator = "🔴";
        }

        // FORMAT UPTIME
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = uptime % 60;

        const formattedUptime = [
            hours > 0 ? `${hours}h` : null,
            minutes > 0 ? `${minutes}m` : null,
            `${seconds}s`
        ].filter(Boolean).join(" ");

        const embed = new EmbedBuilder()
            .setTitle("🏓 Pong!")
            .setColor(7909721)
            .addFields(
                {
                    name: "Service Status",
                    value: `${indicator} ${status}`,
                    inline: true
                },
                {
                    name: "Performance",
                    value: `**Interaction Latency:** ${interactionLatency}ms\n**Gateway Latency:** ${gatewayLatency >= 0 ? `${Math.round(gatewayLatency)}ms` : "Unavailable"}`,
                    inline: true
                },
                {
                    name: "Runtime",
                    value: `**Process Uptime:** ${formattedUptime}\n**Started:** <t:${startedAt}:R>\n**Heap Memory Usage:** ${memory} MB`
                }
            )
            .setFooter({
                text: "System Diagnostics",
                iconURL: logoURL
            })
            .setTimestamp(now);

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral
        });
    }
};
