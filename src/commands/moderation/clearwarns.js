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


const LogManager =
    require("../../managers/LogManager");


module.exports = {

    ephemeral: true,


    data: new SlashCommandBuilder()

        .setName("clearwarns")

        .setDescription(
            "Remove todas as advertências de um usuário."
        )

        .addUserOption(option =>
            option

                .setName("usuario")

                .setDescription(
                    "Usuário que terá as advertências removidas."
                )

                .setRequired(true)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ModerateMembers
        ),


    async execute(interaction) {

        const user =
            interaction.options.getUser("usuario");


        /*
         * Busca os warns atuais.
         */
        const warnings =
            WarningManager.getUserWarnings(

                interaction.guild.id,

                user.id

            );


        /*
         * Nenhum warn.
         */
        if (warnings.length === 0) {

            const embed =
                new EmbedBuilder()

                    .setColor("#57F287")

                    .setTitle(
                        "ℹ️ Nenhuma advertência encontrada"
                    )

                    .setDescription(

                        `${user} não possui nenhuma advertência neste servidor.`

                    )

                    .setTimestamp()

                    .setFooter({

                        text:
                            "VoidZone • Warns"

                    });


            await interaction.editReply({

                embeds: [embed]

            });

            return;

        }


        /*
         * Confirmação.
         */
        const embed =
            new EmbedBuilder()

                .setColor("#FEE75C")

                .setTitle(
                    "⚠️ Confirmar limpeza de advertências"
                )

                .setDescription(

                    `Você está prestes a remover **TODAS** as advertências de ${user}.\n\n` +

                    `📊 **Advertências encontradas:** ${warnings.length}\n\n` +

                    `⚠️ Esta ação não poderá ser desfeita pelo bot.`

                )

                .setTimestamp()

                .setFooter({

                    text:
                        "VoidZone • Sistema de Advertências"

                });


        const row =
            new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                        .setCustomId(
                            `clearwarns_confirm_${interaction.id}`
                        )

                        .setLabel("Confirmar")

                        .setEmoji("✅")

                        .setStyle(
                            ButtonStyle.Danger
                        ),


                    new ButtonBuilder()

                        .setCustomId(
                            `clearwarns_cancel_${interaction.id}`
                        )

                        .setLabel("Cancelar")

                        .setEmoji("❌")

                        .setStyle(
                            ButtonStyle.Secondary
                        )

                );


        await interaction.editReply({

            embeds: [embed],

            components: [row]

        });


        const message =
            await interaction.fetchReply();


        const collector =
            message.createMessageComponentCollector({

                time: 30000

            });


        collector.on(
            "collect",
            async buttonInteraction => {

                /*
                 * Somente quem executou
                 * o comando pode confirmar.
                 */
                if (
                    buttonInteraction.user.id
                    !== interaction.user.id
                ) {

                    await buttonInteraction.reply({

                        content:
                            "❌ Apenas o moderador que executou este comando pode confirmar esta ação.",

                        ephemeral: true

                    });

                    return;

                }


                /*
                 * CANCELAR
                 */
                if (
                    buttonInteraction.customId
                    === `clearwarns_cancel_${interaction.id}`
                ) {

                    const cancelledEmbed =
                        new EmbedBuilder()

                            .setColor("#95A5A6")

                            .setTitle(
                                "❌ Limpeza cancelada"
                            )

                            .setDescription(

                                `As advertências de ${user} não foram alteradas.`

                            )

                            .setTimestamp()

                            .setFooter({

                                text:
                                    "VoidZone • Warns"

                            });


                    await buttonInteraction.update({

                        embeds: [
                            cancelledEmbed
                        ],

                        components: []

                    });


                    collector.stop(
                        "cancelled"
                    );

                    return;

                }


                /*
                 * CONFIRMAR
                 */
                if (
                    buttonInteraction.customId
                    === `clearwarns_confirm_${interaction.id}`
                ) {

                    try {

                        /*
                         * Remove todos os warns.
                         */
                        const removed =
                            WarningManager.clearUserWarnings(

                                interaction.guild.id,

                                user.id

                            );


                        const successEmbed =
                            new EmbedBuilder()

                                .setColor("#57F287")

                                .setTitle(
                                    "✅ Advertências removidas"
                                )

                                .setDescription(

                                    `Todas as advertências de ${user} foram removidas.`

                                )

                                .addFields({

                                    name:
                                        "🗑️ Advertências removidas",

                                    value:
                                        `${removed}`,

                                    inline: true

                                })

                                .setTimestamp()

                                .setFooter({

                                    text:
                                        "VoidZone • Warns"

                                });


                        await buttonInteraction.update({

                            embeds: [
                                successEmbed
                            ],

                            components: []

                        });


                        /*
                         * Registra no log.
                         */
                        try {

                            await LogManager.warningsCleared({

                                guild:
                                    interaction.guild,

                                user,

                                moderator:
                                    interaction.user,

                                removed

                            });

                        } catch (logError) {

                            console.error(
                                "❌ Erro ao registrar limpeza dos warns:",
                                logError
                            );

                        }


                        collector.stop(
                            "confirmed"
                        );

                    } catch (error) {

                        console.error(
                            "❌ Erro ao limpar warns:",
                            error
                        );


                        await buttonInteraction.update({

                            content:
                                "❌ Não foi possível remover as advertências.",

                            embeds: [],

                            components: []

                        });


                        collector.stop(
                            "error"
                        );

                    }

                }

            }
        );


        /*
         * Expiração da confirmação.
         */
        collector.on(
            "end",
            async (collected, reason) => {

                if (
                    reason !== "time"
                ) {

                    return;

                }


                try {

                    const expiredEmbed =
                        new EmbedBuilder()

                            .setColor("#95A5A6")

                            .setTitle(
                                "⏱️ Confirmação expirada"
                            )

                            .setDescription(

                                "A confirmação demorou demais e a ação foi cancelada."

                            )

                            .setTimestamp()

                            .setFooter({

                                text:
                                    "VoidZone • Warns"

                            });


                    await interaction.editReply({

                        embeds: [
                            expiredEmbed
                        ],

                        components: []

                    });

                } catch (error) {

                    console.error(
                        "❌ Erro ao finalizar clearwarns:",
                        error
                    );

                }

            }
        );

    }

};