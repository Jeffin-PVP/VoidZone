const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");


const WarningManager =
    require("../../managers/WarningManager");


const EmbedManager =
    require("../../utils/EmbedManager");


const LogManager =
    require("../../managers/LogManager");


module.exports = {

    ephemeral: true,


    data: new SlashCommandBuilder()

        .setName("warn")

        .setDescription("Adverte um membro do servidor.")

        .addUserOption(option =>
            option
                .setName("usuario")
                .setDescription("Usuário que receberá a advertência.")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("motivo")
                .setDescription("Motivo da advertência.")
                .setRequired(true)
                .setMaxLength(500)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ModerateMembers
        ),


    async execute(interaction) {

        const user =
            interaction.options.getUser("usuario");


        const reason =
            interaction.options.getString("motivo");


        const member =
            interaction.guild.members.cache.get(
                user.id
            );


        // Impede advertir bots.
        if (user.bot) {

            await interaction.editReply({

                embeds: [

                    EmbedManager.error(
                        "Bots não podem receber advertências."
                    )

                ]

            });

            return;

        }


        // Verifica se o usuário ainda está no servidor.
        if (!member) {

            await interaction.editReply({

                embeds: [

                    EmbedManager.error(
                        "Esse usuário não está mais no servidor."
                    )

                ]

            });

            return;

        }


        // Impede que o moderador advirta a si mesmo.
        if (user.id === interaction.user.id) {

            await interaction.editReply({

                embeds: [

                    EmbedManager.error(
                        "Você não pode advertir a si mesmo."
                    )

                ]

            });

            return;

        }


        // Verifica hierarquia.
        if (
            interaction.member.roles.highest.position
            <= member.roles.highest.position
        ) {

            await interaction.editReply({

                embeds: [

                    EmbedManager.error(
                        "Você não pode advertir alguém com cargo igual ou superior ao seu."
                    )

                ]

            });

            return;

        }


        try {

            // Salva o warn no banco.
            const warningId =
                WarningManager.add({

                    guildId:
                        interaction.guild.id,

                    userId:
                        user.id,

                    moderatorId:
                        interaction.user.id,

                    reason

                });


            // Conta quantos warns o usuário possui.
            const total =
                WarningManager.count(

                    interaction.guild.id,

                    user.id

                );


            // Resposta para o moderador.
            await interaction.editReply({

                embeds: [

                    EmbedManager.success(

                        `⚠️ Advertência aplicada com sucesso!\n\n` +

                        `👤 **Usuário:** ${user}\n` +

                        `📝 **Motivo:** ${reason}\n\n` +

                        `🔢 **Total de advertências:** ${total}\n` +

                        `🆔 **ID:** #${warningId}`

                    )

                ]

            });


            // Registra no sistema de logs.
            await LogManager.warning({

                guild:
                    interaction.guild,

                user,

                moderator:
                    interaction.user,

                reason,

                warningId,

                total

            });


        } catch (error) {

            console.error(
                "❌ Erro ao aplicar warn:",
                error
            );


            await interaction.editReply({

                embeds: [

                    EmbedManager.error(
                        "Não foi possível aplicar a advertência."
                    )

                ]

            });

        }

    }

};