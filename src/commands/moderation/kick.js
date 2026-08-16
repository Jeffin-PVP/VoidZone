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

        .setName("kick")

        .setDescription("Expulsa um usuário do servidor.")

        .addUserOption(option =>
            option
                .setName("usuario")
                .setDescription("Usuário que será expulso.")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("motivo")
                .setDescription("Motivo da expulsão.")
                .setRequired(false)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.KickMembers
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


        if (!member.kickable) {

            await interaction.editReply({

                embeds: [
                    EmbedManager.error(
                        "Não posso expulsar esse usuário. " +
                        "Verifique a hierarquia de cargos."
                    )
                ]

            });

            return;

        }


        try {

            await ModerationManager.kick(
                member,
                reason
            );


            await interaction.editReply({

                embeds: [

                    EmbedManager.success(
                        `**${target.tag}** foi expulso do servidor.\n\n` +
                        `📝 Motivo: ${reason}`
                    )

                ]

            });

        } catch (error) {

            console.error(
                "❌ Erro ao expulsar usuário:",
                error
            );


            await interaction.editReply({

                embeds: [
                    EmbedManager.error(
                        "Não foi possível expulsar esse usuário."
                    )
                ]

            });

        }

    }

};