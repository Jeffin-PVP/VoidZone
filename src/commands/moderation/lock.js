const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags
} = require("discord.js");

const EmbedManager =
    require("../../utils/EmbedManager");

const LogManager =
    require("../../managers/LogManager");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("clear")

        .setDescription("Apaga mensagens deste canal.")

        .addIntegerOption(option =>
            option
                .setName("quantidade")
                .setDescription("Quantidade de mensagens a apagar.")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageMessages
        ),


    async execute(interaction) {

        const amount =
            interaction.options.getInteger("quantidade");


        const channel =
            interaction.channel;


        if (!channel.isTextBased()) {

            await interaction.followUp({

                embeds: [
                    EmbedManager.error(
                        "Este comando só pode ser usado em canais de texto."
                    )
                ],

                flags: MessageFlags.Ephemeral

            });

            return;

        }


        try {

            const messages =
                await channel.bulkDelete(
                    amount,
                    true
                );


            const deleted =
                messages.size;


            /*
             * IMPORTANTE:
             *
             * Não usamos editReply() aqui.
             *
             * O bulkDelete pode ter apagado
             * a mensagem original da interação.
             */

            await interaction.followUp({

                embeds: [

                    EmbedManager.success(
                        `🧹 Foram apagadas **${deleted} mensagem(ns)**.`
                    )

                ],

                flags: MessageFlags.Ephemeral

            });


            await LogManager.messageClear({

                guild:
                    interaction.guild,

                channel,

                moderator:
                    interaction.user,

                amount:
                    deleted

            });


        } catch (error) {

            console.error(
                "❌ Erro ao limpar mensagens:",
                error
            );


            try {

                await interaction.followUp({

                    embeds: [
                        EmbedManager.error(
                            "Não foi possível apagar as mensagens."
                        )
                    ],

                    flags: MessageFlags.Ephemeral

                });

            } catch (responseError) {

                console.error(
                    "❌ Não foi possível responder à interação:",
                    responseError
                );

            }

        }

    }

};