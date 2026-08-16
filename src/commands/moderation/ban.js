const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const ModerationManager =
    require("../../managers/ModerationManager");

const LogManager =
    require("../../managers/LogManager");

const EmbedManager =
    require("../../utils/EmbedManager");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("ban")

        .setDescription("Bane um usuário do servidor.")

        .addUserOption(option =>
            option
                .setName("usuario")
                .setDescription("Usuário que será banido.")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("motivo")
                .setDescription("Motivo do banimento.")
                .setRequired(false)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.BanMembers
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
                        "Não encontrei esse membro no servidor."
                    )
                ]

            });

            return;

        }


        if (!member.bannable) {

            await interaction.editReply({

                embeds: [
                    EmbedManager.error(
                        "Não posso banir esse usuário. " +
                        "Verifique a hierarquia de cargos e minhas permissões."
                    )
                ]

            });

            return;

        }


        try {

            await ModerationManager.ban(
                member,
                reason
            );


            await interaction.editReply({

                embeds: [

                    EmbedManager.success(
                        `**${target.tag}** foi banido do servidor.\n\n` +
                        `📝 Motivo: ${reason}`
                    )

                ]

            });

        } catch (error) {

            console.error(
                "❌ Erro ao banir usuário:",
                error
            );


            await interaction.editReply({

                embeds: [
                    EmbedManager.error(
                        "Não foi possível banir esse usuário."
                    )
                ]

            });

        }

    }

};