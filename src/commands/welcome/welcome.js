const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");


module.exports = {

    data:
        new SlashCommandBuilder()

            .setName("welcome")

            .setDescription(
                "Configura o sistema de boas-vindas."
            )

            .addSubcommand(
                subcommand =>
                    subcommand

                        .setName("setup")

                        .setDescription(
                            "Configura o canal de boas-vindas."
                        )
            )

            .setDefaultMemberPermissions(
                PermissionFlagsBits.ManageGuild
            ),


    async execute(interaction) {

        if (
            interaction.options
                .getSubcommand() === "setup"
        ) {

            /*
             * O painel de configuração será
             * criado pelo handler.
             */

            const WelcomeInteractionHandler =
                require("../handlers/WelcomeInteractionHandler");


            return WelcomeInteractionHandler.startSetup(
                interaction
            );

        }

    }

};