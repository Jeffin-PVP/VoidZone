const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const EmbedManager =
    require("../../utils/EmbedManager");

const LogManager =
    require("../../managers/LogManager");


module.exports = {

    ephemeral: true,


    data: new SlashCommandBuilder()

        .setName("lock")

        .setDescription("Bloqueia o canal para membros.")

        .addStringOption(option =>
            option
                .setName("motivo")
                .setDescription("Motivo do bloqueio.")
                .setRequired(false)
                .setMaxLength(500)
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

            await channel.permissionOverwrites.edit(

                interaction.guild.roles.everyone,

                {
                    SendMessages: false
                }

            );


            await interaction.editReply({

                embeds: [

                    EmbedManager.success(

                        `🔒 Este canal foi bloqueado.\n\n` +

                        `📝 **Motivo:** ${reason}`

                    )

                ]

            });


            await LogManager.channelLock({

                guild:
                    interaction.guild,

                channel,

                moderator:
                    interaction.user,

                reason

            });


        } catch (error) {

            console.error(
                "❌ Erro ao bloquear canal:",
                error
            );


            try {

                await interaction.editReply({

                    embeds: [

                        EmbedManager.error(
                            "Não foi possível bloquear este canal."
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