const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const GuildManager = require("../../managers/GuildManager");
const EmbedManager = require("../../utils/EmbedManager");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("setlogs")

        .setDescription(
            "Define o canal onde o VoidZone enviará os logs."
        )

        .addChannelOption(option =>
            option

                .setName("canal")

                .setDescription(
                    "Canal que será utilizado para os logs."
                )

                .setRequired(true)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        ),


    async execute(interaction) {

        const channel =
            interaction.options.getChannel("canal");


        if (!channel.isTextBased()) {

            await interaction.editReply({

                embeds: [

                    EmbedManager.error(
                        "O canal selecionado precisa ser um canal de texto."
                    )

                ]

            });

            return;

        }


        GuildManager.getOrCreate(
            interaction.guild
        );


        GuildManager.setLogChannel(
            interaction.guild.id,
            channel.id
        );


        await interaction.editReply({

            embeds: [

                EmbedManager.success(
                    `O canal ${channel} foi definido como canal de logs.`
                )

            ]

        });

    }

};