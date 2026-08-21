const {
    Events,
    MessageFlags,
    ChannelType
} = require("discord.js");

const LockdownManager =
    require("../managers/LockdownManager");

const GuildManager =
    require("../managers/GuildManager");

const EmbedManager =
    require("../utils/EmbedManager");

const EmbedInteractionHandlerModule =
    require("../handlers/EmbedInteractionHandler");

const EmbedInteractionHandler =
    EmbedInteractionHandlerModule.default ??
    EmbedInteractionHandlerModule.EmbedInteractionHandler ??
    EmbedInteractionHandlerModule;

const TicketInteractionHandler =
    require("../handlers/TicketInteractionHandler");

const WelcomeInteractionHandler =
    require("../handlers/WelcomeInteractionHandler");


module.exports = {

    name: Events.InteractionCreate,


    async execute(interaction) {



        if (
            interaction.isButton() ||
            interaction.isChannelSelectMenu() ||
            interaction.isRoleSelectMenu()
        ) {

            const handled =
                await TicketInteractionHandler.handle(
                    interaction
                );

            if (handled) {
                return;
            }

        }


        if (
            await WelcomeInteractionHandler.handle(
                interaction
            )
        ) {

            return;

        }


        const id = interaction.customId;

        if (id === "welcome_setup_channel") {
            return WelcomeInteractionHandler.handle(interaction);
        }



        /*
        * =====================================================
         * INTERAÇÕES DO SISTEMA DE EMBEDS
         * =====================================================
         */

        if (
            interaction.isButton() ||
            interaction.isModalSubmit() ||
            interaction.isChannelSelectMenu() ||
            interaction.isStringSelectMenu()
        ) {

            if (
                typeof EmbedInteractionHandler.handle !== "function"
            ) {

                console.error(
                    "❌ EmbedInteractionHandler não possui o método handle()."
                );

                console.error(
                    "Export carregado:",
                    EmbedInteractionHandler
                );

                return;

            }


            const handled =
                await EmbedInteractionHandler.handle(
                    interaction
                );


            if (handled) {
                return;
            }

        }


        /*
         * =====================================================
         * BOTÕES
         * =====================================================
         */


        if (id === "ticket_open") {

            return this.createTicket(
                interaction
            );

        }


        if (id === "ticket_close") {

            return this.confirmCloseTicket(
                interaction
            );

        }


        if (id === "ticket_close_confirm") {

            return this.closeTicket(
                interaction
            );

        }


        if (id === "ticket_close_cancel") {

            return this.cancelCloseTicket(
                interaction
            );

        }


        if (interaction.isButton()) {

            try {

                /*
                 * =================================================
                 * CANCELAR LOCKDOWN
                 * =================================================
                 */

                if (
                    interaction.customId.startsWith(
                        "lockdown_cancel_"
                    )
                ) {

                    await interaction.update({

                        embeds: [

                            EmbedManager.info(
                                "❌ Ativação do lockdown cancelada."
                            )

                        ],

                        components: []

                    });

                    return;

                }


                /*
                 * =================================================
                 * CANCELAR UNLOCKDOWN
                 * =================================================
                 */

                if (
                    interaction.customId.startsWith(
                        "unlockdown_cancel_"
                    )
                ) {

                    await interaction.update({

                        embeds: [

                            EmbedManager.info(
                                "❌ Desativação do lockdown cancelada."
                            )

                        ],

                        components: []

                    });

                    return;

                }


                /*
                 * =================================================
                 * CONFIRMAR LOCKDOWN
                 * =================================================
                 */

                if (
                    interaction.customId.startsWith(
                        "lockdown_confirm_"
                    )
                ) {

                    await interaction.deferUpdate();


                    const guild =
                        interaction.guild;


                    if (
                        GuildManager.isLockdownEnabled(
                            guild.id
                        )
                    ) {

                        await interaction.editReply({

                            embeds: [

                                EmbedManager.error(
                                    "🔒 O servidor já está em lockdown."
                                )

                            ],

                            components: []

                        });

                        return;

                    }


                    /*
                     * Canais liberados.
                     */

                    const allowedChannelIds =
                        new Set(
                            LockdownManager
                                .getAllowedChannelIds(
                                    guild.id
                                )
                        );


                    /*
                     * Seleciona todos os canais,
                     * exceto categorias e canais liberados.
                     */

                    const channels =
                        guild.channels.cache.filter(

                            channel =>

                                channel.type !==
                                ChannelType.GuildCategory &&

                                !allowedChannelIds.has(
                                    channel.id
                                )

                        );


                    const everyoneRole =
                        guild.roles.everyone;


                    let affectedChannels = 0;


                    /*
                     * =================================================
                     * ATIVA LOCKDOWN
                     * =================================================
                     */

                    for (
                        const channel
                        of channels.values()
                    ) {

                        try {

                            const overwrite =
                                channel
                                    .permissionOverwrites
                                    .cache
                                    .get(
                                        everyoneRole.id
                                    );


                            /*
                             * Salva o estado original.
                             */

                            LockdownManager
                                .saveChannelPermissions(

                                    guild.id,

                                    channel.id,

                                    {

                                        exists:
                                            !!overwrite,

                                        allow:
                                            overwrite
                                                ? overwrite
                                                    .allow
                                                    .bitfield
                                                    .toString()
                                                : "0",

                                        deny:
                                            overwrite
                                                ? overwrite
                                                    .deny
                                                    .bitfield
                                                    .toString()
                                                : "0"

                                    }

                                );


                            /*
                             * Altera somente ViewChannel.
                             */

                            await channel
                                .permissionOverwrites
                                .edit(

                                    everyoneRole.id,

                                    {
                                        ViewChannel: false
                                    }

                                );


                            affectedChannels++;


                        } catch (error) {

                            console.error(
                                `❌ Erro ao bloquear ${channel.name}:`,
                                error
                            );

                        }

                    }


                    /*
                     * Só ativa se conseguiu bloquear
                     * pelo menos um canal.
                     */

                    if (
                        affectedChannels > 0
                    ) {

                        GuildManager.setLockdown(
                            guild.id,
                            true
                        );

                    }


                    await interaction.editReply({

                        embeds: [

                            EmbedManager.error(

                                `🔒 **LOCKDOWN ATIVADO**\n\n` +

                                `O servidor entrou em modo de emergência.\n\n` +

                                `🔒 Canais bloqueados: **${affectedChannels}**\n` +

                                `📢 Canais liberados: **${allowedChannelIds.size}**\n\n` +

                                `Os canais de emergência continuam acessíveis.`

                            )

                        ],

                        components: []

                    });


                    return;

                }


                /*
                 * =================================================
                 * CONFIRMAR UNLOCKDOWN
                 * =================================================
                 */

                if (
                    interaction.customId.startsWith(
                        "unlockdown_confirm_"
                    )
                ) {

                    await interaction.deferUpdate();


                    const guild =
                        interaction.guild;


                    if (
                        !GuildManager.isLockdownEnabled(
                            guild.id
                        )
                    ) {

                        await interaction.editReply({

                            embeds: [

                                EmbedManager.info(
                                    "🔓 O servidor não está em lockdown."
                                )

                            ],

                            components: []

                        });

                        return;

                    }


                    const everyoneRole =
                        guild.roles.everyone;


                    /*
                     * Busca os canais que possuem
                     * backup das permissões.
                     */

                    const savedChannels =
                        guild.channels.cache.filter(

                            channel => {

                                if (
                                    channel.type ===
                                    ChannelType.GuildCategory
                                ) {

                                    return false;

                                }


                                return (
                                    LockdownManager
                                        .getChannelPermissions(
                                            guild.id,
                                            channel.id
                                        ) !== null
                                );

                            }

                        );


                    let restoredChannels = 0;
                    let failedChannels = 0;


                    /*
                     * =================================================
                     * RESTAURAÇÃO
                     * =================================================
                     */

                    for (
                        const channel
                        of savedChannels.values()
                    ) {

                        try {

                            const saved =
                                LockdownManager
                                    .getChannelPermissions(
                                        guild.id,
                                        channel.id
                                    );


                            if (!saved) {
                                continue;
                            }


                            /*
                             * Remove o overwrite criado/modificado
                             * pelo lockdown.
                             */

                            try {

                                await channel
                                    .permissionOverwrites
                                    .delete(

                                        everyoneRole.id,

                                        "Removendo bloqueio do lockdown"

                                    );

                            } catch (error) {

                                /*
                                 * Não havia overwrite.
                                 */

                            }


                            /*
                             * Se existia um overwrite antes,
                             * recria o estado original.
                             */

                            if (
                                saved.exists
                            ) {

                                const allow =
                                    BigInt(
                                        saved.allow || "0"
                                    );


                                const deny =
                                    BigInt(
                                        saved.deny || "0"
                                    );


                                await channel
                                    .permissionOverwrites
                                    .create(

                                        everyoneRole.id,

                                        {

                                            allow,
                                            deny

                                        },

                                        {

                                            reason:
                                                "Restaurando permissões originais após lockdown"

                                        }

                                    );

                            }


                            /*
                             * Remove o backup.
                             */

                            LockdownManager
                                .removeChannelPermissions(
                                    guild.id,
                                    channel.id
                                );


                            restoredChannels++;


                        } catch (error) {

                            failedChannels++;


                            console.error(

                                `❌ Erro ao restaurar #${channel.name}:`,

                                error

                            );

                        }

                    }


                    /*
                     * Se algum canal falhou,
                     * mantém o lockdown ativo.
                     */

                    if (
                        failedChannels > 0
                    ) {

                        await interaction.editReply({

                            embeds: [

                                EmbedManager.error(

                                    `⚠️ **RESTAURAÇÃO INCOMPLETA**\n\n` +

                                    `Alguns canais não puderam ser restaurados.\n\n` +

                                    `♻️ Restaurados: **${restoredChannels}**\n` +

                                    `❌ Com erro: **${failedChannels}**\n\n` +

                                    `O lockdown continua marcado como **ativo**.`

                                )

                            ],

                            components: []

                        });

                        return;

                    }


                    /*
                     * Limpa os backups restantes.
                     */

                    LockdownManager
                        .clearSavedPermissions(
                            guild.id
                        );


                    /*
                     * Desativa o estado oficial.
                     */

                    GuildManager.setLockdown(
                        guild.id,
                        false
                    );


                    await interaction.editReply({

                        embeds: [

                            EmbedManager.success(

                                `🔓 **LOCKDOWN DESATIVADO**\n\n` +

                                `O acesso normal ao servidor foi restaurado.\n\n` +

                                `♻️ Canais restaurados: **${restoredChannels}**\n\n` +

                                `Todos os canais voltaram às permissões anteriores ao lockdown.`

                            )

                        ],

                        components: []

                    });


                    return;

                }

            } catch (error) {

                console.error(
                    "❌ Erro ao processar botão:",
                    error
                );


                try {

                    if (
                        interaction.deferred ||
                        interaction.replied
                    ) {

                        await interaction.editReply({

                            embeds: [

                                EmbedManager.error(
                                    "Ocorreu um erro ao processar esta ação."
                                )

                            ],

                            components: []

                        });

                    } else {

                        await interaction.reply({

                            content:
                                "❌ Ocorreu um erro ao processar esta ação.",

                            flags:
                                MessageFlags.Ephemeral

                        });

                    }

                } catch (replyError) {

                    console.error(
                        "❌ Não foi possível responder ao botão:",
                        replyError
                    );

                }

            }


            return;

        }


        /*
         * =====================================================
         * SLASH COMMANDS
         * =====================================================
         */

        if (
            !interaction.isChatInputCommand()
        ) {

            return;

        }


        const command =
            interaction.client.commands.get(
                interaction.commandName
            );


        if (!command) {

            console.warn(
                `⚠️ Comando não encontrado: ${interaction.commandName}`
            );

            return;

        }


        try {

            /*
             * =================================================
             * DEFER
             * =================================================
             *
             * O /embed precisa ser ephemeral.
             */

            if (
                interaction.commandName === "embed"
            ) {

                await interaction.deferReply({

                    flags:
                        MessageFlags.Ephemeral

                });

            } else {

                await interaction.deferReply();

            }


            /*
             * Executa o comando.
             */

            await command.execute(
                interaction
            );


        } catch (error) {

            console.error(
                `❌ Erro no comando ${interaction.commandName}:`,
                error
            );


            try {

                if (
                    interaction.deferred
                ) {

                    await interaction.editReply({

                        content:
                            "❌ Ocorreu um erro ao executar este comando."

                    });

                } else if (
                    !interaction.replied
                ) {

                    await interaction.reply({

                        content:
                            "❌ Ocorreu um erro ao executar este comando.",

                        flags:
                            MessageFlags.Ephemeral

                    });

                }

            } catch (replyError) {

                console.error(
                    "❌ Não foi possível responder à interação:",
                    replyError
                );

            }

        }

    }

};