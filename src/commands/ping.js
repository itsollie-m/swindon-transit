const {
    SlashCommandBuilder,
    EmbedBuilder,
    MessageFlags,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("View Swindon Transit's system diagnostics.")
        .setIntegrationTypes([1])
        .setContexts([0, 1, 2]),

    async execute(interaction) {
        const client = interaction.client;
        const logoURL = "https://cdn.olliem.dev/assets/swindon-transit/logos/transit-square.png";
        const customId = `ping-refresh:${interaction.user.id}`;
        const disableDelay = 2 * 60 * 1000;
        let disableTimeout;
        let refreshDisabled = false;
        let lastInteractionLatency = Date.now() - interaction.createdTimestamp;

        const restartDisableTimer = () => {
            if (disableTimeout) clearTimeout(disableTimeout);

            disableTimeout = setTimeout(async () => {
                refreshDisabled = true;
                try {
                    await interaction.editReply(
                        buildResponse(lastInteractionLatency, true)
                    );
                } catch (error) {
                    console.error("Unable to disable the ping refresh button:", error);
                }
            }, disableDelay);
        };

        const buildResponse = (interactionLatency, refreshDisabled = false) => {
            const now = Date.now();
            const gatewayLatency = client.ws.ping;
            const uptime = Math.floor(process.uptime());
            const startedAt = Math.floor((now - uptime * 1000) / 1000);
            const memory = (
                process.memoryUsage().heapUsed / 1024 / 1024
            ).toFixed(1);

            let status;
            let colour;
            let indicator;

            if (interactionLatency < 100) {
                status = "Excellent";
                colour = 7909721;
                indicator = "🟢";
            } else if (interactionLatency < 200) {
                status = "Moderate";
                colour = 16632664;
                indicator = "🟡";
            } else {
                status = "Slow";
                colour = 14495300;
                indicator = "🔴";
            }

            const embed = new EmbedBuilder()
                .setTitle("🏓 Pong!")
                .setColor(colour)
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
                        value: `**Started:** <t:${startedAt}:R>\n**Heap Memory Usage:** ${memory} MB`
                    }
                )
                .setFooter({
                    text: "System Diagnostics",
                    iconURL: logoURL
                })
                .setTimestamp(now);

            const refreshButton = new ButtonBuilder()
                .setCustomId(customId)
                .setLabel("Refresh")
                .setEmoji("🔄")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(refreshDisabled);

            const row = new ActionRowBuilder().addComponents(refreshButton);

            return {
                embeds: [embed],
                components: [row]
            };
        };

        await interaction.reply({
            ...buildResponse(lastInteractionLatency),
            flags: MessageFlags.Ephemeral,
            withResponse: true
        });

        const message = await interaction.fetchReply();
        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 24 * 60 * 60 * 1000
        });

        collector.on("collect", async (buttonInteraction) => {
            if (buttonInteraction.customId !== customId) return;

            if (buttonInteraction.user.id !== interaction.user.id) {
                await buttonInteraction.reply({
                    content: "Only the person who ran `/ping` can refresh this.",
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            if (refreshDisabled) {
                await buttonInteraction.reply({
                    content: "This refresh button has expired. Run `/ping` again.",
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            refreshDisabled = false;
            lastInteractionLatency = Date.now() - buttonInteraction.createdTimestamp;
            await buttonInteraction.update(
                buildResponse(lastInteractionLatency, false)
            );
            restartDisableTimer();
        });
    }
};
