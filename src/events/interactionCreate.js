module.exports = {
    name: "interactionCreate",

    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(
            interaction.commandName
        );

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(
                `Command error (${interaction.commandName}):`,
                error
            );

            const response = {
                content: "Something went wrong while processing that command.",
                ephemeral: true
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(response);
            } else {
                await interaction.reply(response);
            }
        }
    }
};