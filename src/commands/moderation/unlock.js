const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const EmbedManager =
    require("../../utils/EmbedManager");

const LogManager =
    require("../../managers/LogManager");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("unlock")

        .setDescription("Desbloqueia o canal para membros.")

        .addStringOption(option =>
            option
                .setName("motivo")
                .setDescription("Motivo do desbloqueio.")
                .setRequired(false)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageChannels
        ),


    async execute(interaction) {

        const channel =
            interaction.channel;


        const reason =
            interaction.options.getString("motivo")
            || "Nenhum motivo informado.";


        try {

            await channel.permissionOverwrites.edit(
                interaction.guild.roles.everyone,
                {
                    SendMessages: null
                }
            );


            await interaction.editReply({

                embeds: [

                    EmbedManager.success(
                        `🔓 Este canal foi desbloqueado.\n\n` +
                        `📝 Motivo: ${reason}`
                    )

                ]

            });


            await LogManager.channelUnlock({

                guild:
                    interaction.guild,

                channel,

                moderator:
                    interaction.user,

                reason

            });


        } catch (error) {

            console.error(
                "❌ Erro ao desbloquear canal:",
                error
            );


            await interaction.editReply({

                embeds: [
                    EmbedManager.error(
                        "Não foi possível desbloquear este canal."
                    )
                ]

            });

        }

    }

};