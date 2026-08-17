const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const WarningManager =
    require("../../managers/WarningManager");


const WARNINGS_PER_PAGE = 5;


module.exports = {

    ephemeral: true,


    data: new SlashCommandBuilder()

        .setName("warns")

        .setDescription("Consulta as advertências do servidor.")

        .addUserOption(option =>
            option
                .setName("usuario")
                .setDescription(
                    "Usuário específico para consultar."
                )
                .setRequired(false)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ModerateMembers
        ),


    async execute(interaction) {

        const user =
            interaction.options.getUser("usuario");


        let warnings;


        if (user) {

            warnings =
                WarningManager.getUserWarnings(
                    interaction.guild.id,
                    user.id
                );

        } else {

            warnings =
                WarningManager.getGuildWarnings(
                    interaction.guild.id
                );

        }


        if (warnings.length === 0) {

            const description = user

                ? `**${user.tag}** não possui nenhuma advertência.`

                : "Este servidor não possui nenhuma advertência.";


            const embed =
                new EmbedBuilder()

                    .setColor("#57F287")

                    .setTitle(
                        "⚠️ Histórico de Advertências"
                    )

                    .setDescription(description)

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
         * Função responsável por gerar
         * a página atual.
         */
        const createPage = async (page) => {

            const totalPages =
                Math.ceil(
                    warnings.length / WARNINGS_PER_PAGE
                );


            const start =
                page * WARNINGS_PER_PAGE;


            const currentWarnings =
                warnings.slice(
                    start,
                    start + WARNINGS_PER_PAGE
                );


            const embed =
                new EmbedBuilder()

                    .setColor("#FEE75C")

                    .setTitle(
                        user
                            ? `⚠️ Advertências de ${user.tag}`
                            : "⚠️ Advertências do Servidor"
                    )

                    .setDescription(
                        user
                            ? `Total: **${warnings.length}** advertência(s)`
                            : `Total no servidor: **${warnings.length}**`
                    )

                    .setTimestamp();


            for (const warning of currentWarnings) {

                const date =
                    `<t:${Math.floor(
                        warning.created_at / 1000
                    )}:f>`;


                let moderator;


                try {

                    moderator =
                        await interaction.client.users.fetch(
                            warning.moderator_id
                        );

                } catch {

                    moderator = null;

                }


                const moderatorName =
                    moderator
                        ? moderator.tag
                        : `ID: ${warning.moderator_id}`;


                embed.addFields({

                    name:
                        `⚠️ Warn #${warning.id}`,

                    value:
                        `👤 **Usuário:** <@${warning.user_id}>\n` +

                        `📝 **Motivo:** ${warning.reason}\n` +

                        `🛡️ **Moderador:** ${moderatorName}\n` +

                        `📅 **Data:** ${date}`

                });

            }


            embed.setFooter({

                text:
                    `VoidZone • Página ${page + 1}/${totalPages}`

            });


            /*
             * Botões
             */
            const row =
                new ActionRowBuilder();


            row.addComponents(

                new ButtonBuilder()

                    .setCustomId(
                        `warns_prev_${interaction.id}`
                    )

                    .setLabel("◀")

                    .setStyle(ButtonStyle.Secondary)

                    .setDisabled(
                        page === 0
                    ),


                new ButtonBuilder()

                    .setCustomId(
                        `warns_next_${interaction.id}`
                    )

                    .setLabel("▶")

                    .setStyle(ButtonStyle.Secondary)

                    .setDisabled(
                        page >= totalPages - 1
                    )

            );


            return {

                embeds: [embed],

                components: [row]

            };

        };


        let currentPage = 0;


        const message =
            await interaction.editReply(
                await createPage(currentPage)
            );


        /*
         * Se só existe uma página,
         * não precisamos ficar esperando
         * pelos botões.
         */
        if (warnings.length <= WARNINGS_PER_PAGE) {

            return;

        }


        const collector =
            message.createMessageComponentCollector({

                time: 120000

            });


        collector.on(
            "collect",
            async buttonInteraction => {

                /*
                 * Apenas quem executou /warns
                 * pode utilizar os botões.
                 */
                if (
                    buttonInteraction.user.id
                    !== interaction.user.id
                ) {

                    await buttonInteraction.reply({

                        content:
                            "❌ Apenas o moderador que executou este comando pode utilizar estes botões.",

                        ephemeral: true

                    });

                    return;

                }


                if (
                    buttonInteraction.customId
                    === `warns_prev_${interaction.id}`
                ) {

                    currentPage--;

                }


                if (
                    buttonInteraction.customId
                    === `warns_next_${interaction.id}`
                ) {

                    currentPage++;

                }


                await buttonInteraction.update(

                    await createPage(currentPage)

                );

            }
        );


        collector.on(
            "end",
            async () => {

                try {

                    const finalPage =
                        await createPage(currentPage);


                    finalPage.components[0]
                        .components
                        .forEach(button => {

                            button.setDisabled(true);

                        });


                    await interaction.editReply(
                        finalPage
                    );

                } catch (error) {

                    console.error(
                        "❌ Erro ao finalizar paginação:",
                        error
                    );

                }

            }
        );

    }

};