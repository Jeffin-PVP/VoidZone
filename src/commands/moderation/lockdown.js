const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");


const LockdownManager =
    require("../../managers/LockdownManager");


const GuildManager =
    require("../../managers/GuildManager");


const EmbedManager =
    require("../../utils/EmbedManager");



module.exports = {

    data: new SlashCommandBuilder()

        .setName("lockdown")

        .setDescription(
            "Gerencia o modo de emergência do servidor."
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        )


        /*
         * =====================================================
         * CONFIG
         * =====================================================
         */

        .addSubcommand(subcommand =>

            subcommand

                .setName("config")

                .setDescription(
                    "Configura os canais liberados durante o lockdown."
                )

                .addStringOption(option =>

                    option

                        .setName("acao")

                        .setDescription(
                            "Ação que deseja realizar."
                        )

                        .setRequired(true)

                        .addChoices(

                            {
                                name: "➕ Adicionar canal",
                                value: "adicionar"
                            },

                            {
                                name: "➖ Remover canal",
                                value: "remover"
                            },

                            {
                                name: "📋 Listar canais",
                                value: "listar"
                            }

                        )

                )

                .addChannelOption(option =>

                    option

                        .setName("canal")

                        .setDescription(
                            "Canal que será configurado."
                        )

                        .setRequired(false)

                )

        )


        /*
         * =====================================================
         * ATIVAR
         * =====================================================
         */

        .addSubcommand(subcommand =>

            subcommand

                .setName("ativar")

                .setDescription(
                    "Ativa o lockdown do servidor."
                )

        )


        /*
         * =====================================================
         * DESATIVAR
         * =====================================================
         */

        .addSubcommand(subcommand =>

            subcommand

                .setName("desativar")

                .setDescription(
                    "Desativa o lockdown e restaura as permissões."
                )

        ),


    async execute(interaction) {

        const subcommand =
            interaction.options.getSubcommand();


        const guild =
            interaction.guild;


        /*
         * =====================================================
         * CONFIG
         * =====================================================
         */

        if (subcommand === "config") {

            const acao =
                interaction.options.getString("acao");


            const channel =
                interaction.options.getChannel("canal");


            /*
             * =============================================
             * ADICIONAR CANAL
             * =============================================
             */

            if (acao === "adicionar") {

                if (!channel) {

                    await interaction.editReply({

                        embeds: [

                            EmbedManager.error(
                                "Você precisa selecionar um canal."
                            )

                        ]

                    });

                    return;

                }


                const added =
                    LockdownManager.addChannel(
                        guild.id,
                        channel.id
                    );


                if (!added) {

                    await interaction.editReply({

                        embeds: [

                            EmbedManager.error(
                                `O canal ${channel} já está configurado.`
                            )

                        ]

                    });

                    return;

                }


                await interaction.editReply({

                    embeds: [

                        EmbedManager.success(
                            `📢 ${channel} permanecerá visível durante o lockdown.`
                        )

                    ]

                });

                return;

            }


            /*
             * =============================================
             * REMOVER CANAL
             * =============================================
             */

            if (acao === "remover") {

                if (!channel) {

                    await interaction.editReply({

                        embeds: [

                            EmbedManager.error(
                                "Você precisa selecionar um canal."
                            )

                        ]

                    });

                    return;

                }


                const removed =
                    LockdownManager.removeChannel(
                        guild.id,
                        channel.id
                    );


                if (!removed) {

                    await interaction.editReply({

                        embeds: [

                            EmbedManager.error(
                                `O canal ${channel} não está configurado.`
                            )

                        ]

                    });

                    return;

                }


                await interaction.editReply({

                    embeds: [

                        EmbedManager.success(
                            `📢 ${channel} foi removido dos canais liberados.`
                        )

                    ]

                });

                return;

            }


            /*
             * =============================================
             * LISTAR CANAIS
             * =============================================
             */

            if (acao === "listar") {

                const channels =
                    LockdownManager
                        .getAllowedChannelIds(
                            guild.id
                        );


                if (!channels.length) {

                    await interaction.editReply({

                        embeds: [

                            EmbedManager.info(
                                "Nenhum canal está configurado para permanecer visível durante o lockdown."
                            )

                        ]

                    });

                    return;

                }


                const list =
                    channels
                        .map(id => {

                            const channel =
                                guild.channels.cache.get(
                                    id
                                );


                            return channel
                                ? `📢 ${channel}`
                                : `⚠️ \`${id}\``;

                        })
                        .join("\n");


                await interaction.editReply({

                    embeds: [

                        EmbedManager.info(
                            `### 🔒 Canais liberados\n\n${list}\n\n**Total:** ${channels.length}`
                        )

                    ]

                });

                return;

            }

        }


        /*
         * =====================================================
         * ATIVAR LOCKDOWN
         * =====================================================
         */

        if (subcommand === "ativar") {


            /*
             * Verifica o estado oficial no banco.
             */

            if (
                GuildManager.isLockdownEnabled(
                    guild.id
                )
            ) {

                await interaction.editReply({

                    embeds: [

                        EmbedManager.error(
                            "🔒 O lockdown já está ativo."
                        )

                    ]

                });

                return;

            }


            /*
             * Canais que permanecerão visíveis.
             */

            const allowedChannels =
                new Set(
                    LockdownManager
                        .getAllowedChannelIds(
                            guild.id
                        )
                );


            /*
             * Canais que serão afetados.
             *
             * Ignoramos apenas categorias.
             *
             * Isso inclui:
             *
             * - Texto
             * - Fórum
             * - Voz
             * - Stage
             *
             * O bloqueio será feito pelo ViewChannel
             * no interactionCreate.
             */

            const channels =
                guild.channels.cache.filter(

                    channel =>

                        channel.type !==
                            ChannelType.GuildCategory &&

                        !allowedChannels.has(
                            channel.id
                        )

                );


            if (!channels.size) {

                await interaction.editReply({

                    embeds: [

                        EmbedManager.error(
                            "Não existem canais para bloquear."
                        )

                    ]

                });

                return;

            }


            /*
             * =============================================
             * CONFIRMAÇÃO
             * =============================================
             */

            const row =
                new ActionRowBuilder()
                    .addComponents(


                        new ButtonBuilder()

                            .setCustomId(
                                `lockdown_confirm_${guild.id}`
                            )

                            .setLabel(
                                "Ativar Lockdown"
                            )

                            .setEmoji("🔒")

                            .setStyle(
                                ButtonStyle.Danger
                            ),


                        new ButtonBuilder()

                            .setCustomId(
                                `lockdown_cancel_${guild.id}`
                            )

                            .setLabel(
                                "Cancelar"
                            )

                            .setStyle(
                                ButtonStyle.Secondary
                            )

                    );


            await interaction.editReply({

                embeds: [

                    EmbedManager.error(

                        `⚠️ **ATENÇÃO**\n\n` +

                        `Você está prestes a bloquear ` +
                        `**${channels.size} canais**.\n\n` +

                        `Os membros comuns não poderão ` +
                        `visualizar esses canais durante ` +
                        `o lockdown.\n\n` +

                        `📢 Os canais configurados como ` +
                        `canais de emergência continuarão ` +
                        `visíveis.`

                    )

                ],

                components: [
                    row
                ]

            });

            return;

        }


        /*
         * =====================================================
         * DESATIVAR LOCKDOWN
         * =====================================================
         */

        if (subcommand === "desativar") {


            /*
             * Verifica o estado oficial no banco.
             */

            if (
                !GuildManager.isLockdownEnabled(
                    guild.id
                )
            ) {

                await interaction.editReply({

                    embeds: [

                        EmbedManager.error(
                            "🔓 O lockdown não está ativo."
                        )

                    ]

                });

                return;

            }


            /*
             * =============================================
             * CONFIRMAÇÃO
             * =============================================
             */

            const row =
                new ActionRowBuilder()
                    .addComponents(


                        new ButtonBuilder()

                            .setCustomId(
                                `unlockdown_confirm_${guild.id}`
                            )

                            .setLabel(
                                "Desativar Lockdown"
                            )

                            .setEmoji("🔓")

                            .setStyle(
                                ButtonStyle.Success
                            ),


                        new ButtonBuilder()

                            .setCustomId(
                                `unlockdown_cancel_${guild.id}`
                            )

                            .setLabel(
                                "Cancelar"
                            )

                            .setStyle(
                                ButtonStyle.Secondary
                            )

                    );


            await interaction.editReply({

                embeds: [

                    EmbedManager.success(

                        `⚠️ **DESATIVAR LOCKDOWN?**\n\n` +

                        `As permissões originais dos canais ` +
                        `serão restauradas.`

                    )

                ],

                components: [
                    row
                ]

            });

        }

    }

};