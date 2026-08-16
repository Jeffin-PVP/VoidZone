const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const EmbedManager =
    require("../../utils/EmbedManager");

const LogManager =
    require("../../managers/LogManager");


module.exports = {

    // A resposta do comando será ephemeral.
    // Isso impede que o bulkDelete apague a própria resposta.
    ephemeral: true,


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


        // Verifica se é um canal onde podemos apagar mensagens.
        if (!channel.isTextBased()) {

            await interaction.editReply({

                embeds: [

                    EmbedManager.error(
                        "Este comando só pode ser usado em canais de texto."
                    )

                ]

            });

            return;

        }


        try {

            // Apaga as mensagens.
            //
            // O segundo argumento (true) faz o Discord
            // ignorar mensagens com mais de 14 dias.
            const messages =
                await channel.bulkDelete(
                    amount,
                    true
                );


            const deleted =
                messages.size;


            // Como a resposta é ephemeral,
            // ela não será apagada pelo bulkDelete.
            await interaction.editReply({

                embeds: [

                    EmbedManager.success(
                        `🧹 Foram apagadas **${deleted} mensagem(ns)**.`
                    )

                ]

            });


            // Registra a ação no webhook de logs.
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


            // Tenta informar o moderador sobre o erro.
            try {

                await interaction.editReply({

                    embeds: [

                        EmbedManager.error(
                            "Não foi possível apagar as mensagens."
                        )

                    ]

                });

            } catch (replyError) {

                console.error(
                    "❌ Não foi possível responder à interação:",
                    replyError
                );

            }

        }

    }

};