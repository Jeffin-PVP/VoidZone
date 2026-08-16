const {
    SlashCommandBuilder
} = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("ping")

        .setDescription("Verifica a latência do VoidZone."),


    async execute(interaction) {

        const latency = interaction.client.ws.ping;

        await interaction.editReply(
            `🏓 Pong! **${latency}ms**`
        );

    }

};