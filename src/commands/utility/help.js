const {
    SlashCommandBuilder
} = require("discord.js");

const EmbedManager = require("../../utils/EmbedManager");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("help")

        .setDescription("Veja os comandos disponíveis do VoidZone."),


    async execute(interaction) {

        const embed = EmbedManager.voidzone()

            .setTitle("🌌 VoidZone — Central de Comandos")

            .setDescription(
                "Bem-vindo ao **VoidZone**!\n\n" +
                "Seu universo de jogos, diversão e comunidade no Discord."
            )

            .addFields(

                {
                    name: "🎮 Games",
                    value:
                        "`/perfil`\n" +
                        "`/ranking`\n" +
                        "`/conquistas`",
                    inline: true
                },

                {
                    name: "💰 Economia",
                    value:
                        "`/saldo`\n" +
                        "`/daily`\n" +
                        "`/work`",
                    inline: true
                },

                {
                    name: "🛡️ Moderação",
                    value:
                        "`/ban`\n" +
                        "`/kick`\n" +
                        "`/timeout`",
                    inline: true
                },

                {
                    name: "🎟️ Suporte",
                    value:
                        "`/ticket`\n" +
                        "`/reportar`",
                    inline: true
                },

                {
                    name: "🔧 Utilidades",
                    value:
                        "`/ping`\n" +
                        "`/botinfo`\n" +
                        "`/serverinfo`",
                    inline: true
                }

            )

            .setFooter({
                text: "VoidZone • Seu universo de jogos"
            });


        await interaction.editReply({
            embeds: [embed]
        });

    }

};