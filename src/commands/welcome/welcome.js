const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");


const WelcomeManager =
    require("../../managers/WelcomeManager");


module.exports = {

    data:

        new SlashCommandBuilder()

            .setName("welcome")

            .setDescription(
                "Configura o sistema de boas-vindas."
            )


            /*
             * =================================================
             * SETUP
             * =================================================
             */

            .addSubcommand(
                subcommand =>

                    subcommand

                        .setName("setup")

                        .setDescription(
                            "Configura o canal de boas-vindas."
                        )
            )


            /*
             * =================================================
             * ATIVAR
             * =================================================
             */

            .addSubcommand(
                subcommand =>

                    subcommand

                        .setName("ativar")

                        .setDescription(
                            "Ativa as mensagens de boas-vindas."
                        )
            )


            /*
             * =================================================
             * DESATIVAR
             * =================================================
             */

            .addSubcommand(
                subcommand =>

                    subcommand

                        .setName("desativar")

                        .setDescription(
                            "Desativa as mensagens de boas-vindas."
                        )
            )


            .setDefaultMemberPermissions(
                PermissionFlagsBits.ManageGuild
            ),


    async execute(interaction) {

        const subcommand =
            interaction.options.getSubcommand();


        /*
         * =====================================================
         * SETUP
         * =====================================================
         */

        if (
            subcommand === "setup"
        ) {

            const WelcomeInteractionHandler =
                require("../../handlers/WelcomeInteractionHandler");


            return WelcomeInteractionHandler.startSetup(
                interaction
            );

        }


        /*
         * =====================================================
         * ATIVAR
         * =====================================================
         */

        if (
            subcommand === "ativar"
        ) {

            const config =
                WelcomeManager.getConfig(
                    interaction.guild.id
                );


            if (!config) {

                const response = {

                    content:
                        "❌ O sistema de boas-vindas ainda não foi configurado.\n\n" +
                        "Use `/welcome setup` primeiro."

                };


                if (
                    interaction.replied ||
                    interaction.deferred
                ) {

                    await interaction.editReply(
                        response
                    );

                } else {

                    await interaction.reply(
                        response
                    );

                }


                return true;

            }


            WelcomeManager.enable(
                interaction.guild.id
            );


            const embed =
                new EmbedBuilder()

                    .setTitle(
                        "✅ Boas-vindas ativadas"
                    )

                    .setDescription(

                        "As mensagens de boas-vindas foram ativadas novamente.\n\n" +

                        `📢 **Canal:** <#${config.channel_id}>`

                    )

                    .setColor(
                        "#57F287"
                    );


            const response = {

                embeds: [
                    embed
                ]

            };


            /*
             * Se o interactionCreate já respondeu,
             * editamos a resposta existente.
             */

            if (
                interaction.replied ||
                interaction.deferred
            ) {

                await interaction.editReply(
                    response
                );

            } else {

                await interaction.reply(
                    response
                );

            }


            return true;

        }


        /*
         * =====================================================
         * DESATIVAR
         * =====================================================
         */

        if (
            subcommand === "desativar"
        ) {

            const config =
                WelcomeManager.getConfig(
                    interaction.guild.id
                );


            if (!config) {

                const response = {

                    content:
                        "❌ O sistema de boas-vindas ainda não foi configurado.\n\n" +
                        "Use `/welcome setup` primeiro."

                };


                if (
                    interaction.replied ||
                    interaction.deferred
                ) {

                    await interaction.editReply(
                        response
                    );

                } else {

                    await interaction.reply(
                        response
                    );

                }


                return true;

            }


            WelcomeManager.disable(
                interaction.guild.id
            );


            const embed =
                new EmbedBuilder()

                    .setTitle(
                        "🔕 Boas-vindas desativadas"
                    )

                    .setDescription(

                        "As mensagens de boas-vindas foram desativadas.\n\n" +

                        `📢 O canal configurado continua sendo <#${config.channel_id}>.\n\n` +

                        "Você pode ativá-las novamente usando `/welcome ativar`."

                    )

                    .setColor(
                        "#ED4245"
                    );


            const response = {

                embeds: [
                    embed
                ]

            };


            /*
             * Se o interactionCreate já respondeu,
             * editamos a resposta existente.
             */

            if (
                interaction.replied ||
                interaction.deferred
            ) {

                await interaction.editReply(
                    response
                );

            } else {

                await interaction.reply(
                    response
                );

            }


            return true;

        }


        return true;

    }

};