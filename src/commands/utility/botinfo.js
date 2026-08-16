const {
    SlashCommandBuilder
} = require("discord.js");

const EmbedManager = require("../../utils/EmbedManager");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("botinfo")

        .setDescription("Veja informações sobre o VoidZone."),


    async execute(interaction) {

        const client = interaction.client;

        const uptime = process.uptime();

        const days = Math.floor(
            uptime / 86400
        );

        const hours = Math.floor(
            uptime / 3600
        ) % 24;

        const minutes = Math.floor(
            uptime / 60
        ) % 60;

        const seconds = Math.floor(
            uptime
        ) % 60;


        const embed = EmbedManager.voidzone()

            .setTitle("🌌 VoidZone")

            .setThumbnail(
                client.user.displayAvatarURL({
                    size: 1024
                })
            )

            .setDescription(
                "**Seu universo de jogos no Discord.**"
            )

            .addFields(

                {
                    name: "🤖 Bot",
                    value: client.user.tag,
                    inline: true
                },

                {
                    name: "🆔 ID",
                    value: client.user.id,
                    inline: true
                },

                {
                    name: "🌐 Servidores",
                    value: `${client.guilds.cache.size}`,
                    inline: true
                },

                {
                    name: "👥 Usuários",
                    value: `${client.users.cache.size}`,
                    inline: true
                },

                {
                    name: "🏓 Ping",
                    value: `${client.ws.ping}ms`,
                    inline: true
                },

                {
                    name: "⏱️ Uptime",
                    value:
                        `${days}d ${hours}h ${minutes}m ${seconds}s`,
                    inline: true
                },

                {
                    name: "⚙️ Tecnologia",
                    value:
                        `Node.js ${process.versions.node}\n` +
                        `Discord.js ${require("discord.js").version}\n` +
                        `SQLite`,
                    inline: false
                }

            )

            .setFooter({
                text: "VoidZone • Desenvolvido para a comunidade"
            });


        await interaction.editReply({
            embeds: [embed]
        });

    }

};