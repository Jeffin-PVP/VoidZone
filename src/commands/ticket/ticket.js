const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
    ActionRowBuilder,
    ChannelSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");


module.exports = {

    data:

        new SlashCommandBuilder()

            .setName("ticket")

            .setDescription(
                "Sistema de tickets."
            )

            .setDefaultMemberPermissions(
                PermissionFlagsBits.ManageChannels
            )

            .addSubcommand(
                subcommand =>

                    subcommand

                        .setName("setup")

                        .setDescription(
                            "Configura o sistema de tickets."
                        )

            ),


    async execute(interaction) {

        const subcommand =
            interaction.options.getSubcommand();


        if (
            subcommand !== "setup"
        ) {

            return;

        }


        /*
         * =====================================================
         * EMBED DO SETUP
         * =====================================================
         */

        const embed =
            new EmbedBuilder()

                .setTitle(
                    "🎫 Configuração do Sistema de Tickets"
                )

                .setDescription(

                    "Vamos configurar o sistema de tickets.\n\n" +

                    "Primeiro, escolha o **canal onde o painel de tickets será enviado**."

                )

                .setColor(
                    "#5865F2"
                );


        /*
         * =====================================================
         * SELETOR DE CANAL
         * =====================================================
         */

        const channelSelect =

            new ChannelSelectMenuBuilder()

                .setCustomId(
                    "ticket_setup_panel_channel"
                )

                .setPlaceholder(
                    "📢 Escolha o canal do painel"
                )

                .setChannelTypes(
                    ChannelType.GuildText
                )

                .setMinValues(1)

                .setMaxValues(1);


        const row =

            new ActionRowBuilder()

                .addComponents(
                    channelSelect
                );


        await interaction.editReply({

            embeds: [
                embed
            ],

            components: [
                row
            ]

        });

    }

};