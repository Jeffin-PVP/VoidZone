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

        .setName("untimeout")

        .setDescription("Remove o timeout de um usuário.")

        .addUserOption(option =>
            option
                .setName("usuario")
                .setDescription("Usuário que terá o timeout removido.")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("motivo")
                .setDescription("Motivo da remoção.")
                .setRequired(false)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ModerateMembers
        ),


    async execute(interaction) {

        const target =
            interaction.options.getUser("usuario");

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
                        "Não posso remover o timeout desse usuário."
                    )
                ]

            });

            return;

        }


        try {

            await ModerationManager.removeTimeout(
                member,
                reason
            );


            await interaction.editReply({

                embeds: [

                    EmbedManager.success(
                        `O timeout de **${target.tag}** foi removido.\n\n` +
                        `📝 Motivo: ${reason}`
                    )

                ]

            });

        } catch (error) {

            console.error(
                "❌ Erro ao remover timeout:",
                error
            );


            await interaction.editReply({

                embeds: [
                    EmbedManager.error(
                        "Não foi possível remover o timeout."
                    )
                ]

            });

        }

    }

};