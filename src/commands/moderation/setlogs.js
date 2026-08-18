const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType
} = require("discord.js");

const GuildManager = require("../../managers/GuildManager");
const EmbedManager = require("../../utils/EmbedManager");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("setlogs")

        .setDescription(
            "Define os canais de logs do VoidZone."
        )

        .addStringOption(option =>
            option

                .setName("tipo")

                .setDescription(
                    "Escolha qual tipo de log deseja configurar."
                )

                .setRequired(true)

                .addChoices(

                    {
                        name: "📋 Logs normais",
                        value: "normal"
                    },

                    {
                        name: "🛡️ Logs de moderação",
                        value: "moderacao"
                    }

                )
        )

        .addChannelOption(option =>
            option

                .setName("canal")

                .setDescription(
                    "Canal que será utilizado para os logs."
                )

                .addChannelTypes(
                    ChannelType.GuildText
                )

                .setRequired(true)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        ),


    async execute(interaction) {

        const tipo =
            interaction.options.getString("tipo");

        const channel =
            interaction.options.getChannel("canal");


        /*
         * Garante que as configurações
         * do servidor existam.
         */

        GuildManager.getOrCreate(
            interaction.guild
        );


        /*
         * Define o canal de acordo
         * com o tipo selecionado.
         */

        if (tipo === "normal") {

            GuildManager.setLogChannel(
                interaction.guild.id,
                channel.id
            );


            await interaction.editReply({

                embeds: [

                    EmbedManager.success(
                        `O canal ${channel} foi definido como **canal de logs normais**.`
                    )

                ]

            });

            return;

        }


        if (tipo === "moderacao") {

            GuildManager.setModLogChannel(
                interaction.guild.id,
                channel.id
            );


            await interaction.editReply({

                embeds: [

                    EmbedManager.success(
                        `O canal ${channel} foi definido como **canal de logs de moderação**.`
                    )

                ]

            });

            return;

        }


        await interaction.editReply({

            embeds: [

                EmbedManager.error(
                    "Tipo de log inválido."
                )

            ]

        });

    }

};