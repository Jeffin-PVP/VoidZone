const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const WarningManager =
    require("../../managers/WarningManager");


module.exports = {

    ephemeral: true,


    data: new SlashCommandBuilder()

        .setName("warninfo")

        .setDescription("Mostra os detalhes de uma advertência.")

        .addIntegerOption(option =>
            option
                .setName("id")
                .setDescription("ID da advertência.")
                .setRequired(true)
                .setMinValue(1)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ModerateMembers
        ),


    async execute(interaction) {

        const warningId =
            interaction.options.getInteger("id");


        const warning =
            WarningManager.getById(warningId);


        /*
         * Verifica se o warn existe.
         */
        if (!warning) {

            const embed =
                new EmbedBuilder()

                    .setColor("#ED4245")

                    .setTitle("❌ Advertência não encontrada")

                    .setDescription(
                        `Não existe nenhuma advertência com o ID **#${warningId}**.`
                    )

                    .setTimestamp()

                    .setFooter({
                        text: "VoidZone • Warns"
                    });


            await interaction.editReply({

                embeds: [embed]

            });

            return;

        }


        /*
         * IMPORTANTE:
         *
         * O ID sozinho não é suficiente.
         *
         * Também verificamos o guild_id para
         * impedir que um moderador consulte
         * um warn de outro servidor.
         */
        if (
            warning.guild_id
            !== interaction.guild.id
        ) {

            const embed =
                new EmbedBuilder()

                    .setColor("#ED4245")

                    .setTitle("❌ Advertência não encontrada")

                    .setDescription(
                        "Essa advertência não pertence a este servidor."
                    )

                    .setTimestamp()

                    .setFooter({
                        text: "VoidZone • Warns"
                    });


            await interaction.editReply({

                embeds: [embed]

            });

            return;

        }


        /*
         * Busca o usuário.
         */
        let user;

        try {

            user =
                await interaction.client.users.fetch(
                    warning.user_id
                );

        } catch {

            user = null;

        }


        /*
         * Busca o moderador.
         */
        let moderator;

        try {

            moderator =
                await interaction.client.users.fetch(
                    warning.moderator_id
                );

        } catch {

            moderator = null;

        }


        const userName =
            user
                ? `${user.tag}\n\`${user.id}\``
                : `Usuário desconhecido\n\`${warning.user_id}\``;


        const moderatorName =
            moderator
                ? `${moderator.tag}\n\`${moderator.id}\``
                : `Moderador desconhecido\n\`${warning.moderator_id}\``;


        const date =
            `<t:${Math.floor(
                warning.created_at / 1000
            )}:F>`;


        const relativeDate =
            `<t:${Math.floor(
                warning.created_at / 1000
            )}:R>`;


        const embed =
            new EmbedBuilder()

                .setColor("#FEE75C")

                .setTitle(
                    `⚠️ Advertência #${warning.id}`
                )

                .setThumbnail(
                    user
                        ? user.displayAvatarURL({
                            size: 256
                        })
                        : null
                )

                .addFields(

                    {
                        name: "👤 Usuário",
                        value: userName,
                        inline: true
                    },

                    {
                        name: "🛡️ Moderador",
                        value: moderatorName,
                        inline: true
                    },

                    {
                        name: "🆔 ID da advertência",
                        value: `#${warning.id}`,
                        inline: true
                    },

                    {
                        name: "📝 Motivo",
                        value: warning.reason,
                        inline: false
                    },

                    {
                        name: "📅 Aplicada em",
                        value: date,
                        inline: true
                    },

                    {
                        name: "⏱️ Há",
                        value: relativeDate,
                        inline: true
                    }

                )

                .setTimestamp(
                    new Date(warning.created_at)
                )

                .setFooter({
                    text: "VoidZone • Sistema de Advertências"
                });


        await interaction.editReply({

            embeds: [embed]

        });

    }

};