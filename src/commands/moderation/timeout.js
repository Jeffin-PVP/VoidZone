const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const ModerationManager =
    require("../../managers/ModerationManager");

const EmbedManager =
    require("../../utils/EmbedManager");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("timeout")

        .setDescription("Coloca um usuário em timeout.")

        .addUserOption(option =>
            option
                .setName("usuario")
                .setDescription("Usuário que receberá o timeout.")
                .setRequired(true)
        )

        .addIntegerOption(option =>
            option
                .setName("duracao")
                .setDescription("Duração do timeout em minutos.")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(40320)
        )

        .addStringOption(option =>
            option
                .setName("motivo")
                .setDescription("Motivo do timeout.")
                .setRequired(false)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ModerateMembers
        ),


    async execute(interaction) {

        const target =
            interaction.options.getUser("usuario");

        const duration =
            interaction.options.getInteger("duracao");

        const reason =
            interaction.options.getString("motivo")
            || "Nenhum motivo informado.";


        const member =
            await interaction.guild.members
                .fetch(target.id)
                .catch(() => null);


        if (!member) {

            await interaction.editReply({

                embeds: [
                    EmbedManager.error(
                        "Esse usuário não está no servidor."
                    )
                ]

            });

            return;

        }


        if (!member.moderatable) {

            await interaction.editReply({

                embeds: [
                    EmbedManager.error(
                        "Não posso aplicar timeout nesse usuário. " +
                        "Verifique a hierarquia de cargos."
                    )
                ]

            });

            return;

        }


        try {

            await ModerationManager.timeout(
                member,
                duration * 60 * 1000,
                reason
            );


            await interaction.editReply({

                embeds: [

                    EmbedManager.success(
                        `**${target.tag}** recebeu timeout por ` +
                        `**${duration} minuto(s)**.\n\n` +
                        `📝 Motivo: ${reason}`
                    )

                ]

            });

        } catch (error) {

            console.error(
                "❌ Erro ao aplicar timeout:",
                error
            );


            await interaction.editReply({

                embeds: [
                    EmbedManager.error(
                        "Não foi possível aplicar o timeout."
                    )
                ]

            });

        }

    }

};