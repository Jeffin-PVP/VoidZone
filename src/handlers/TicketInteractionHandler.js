const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ChannelType,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");


const TicketManager =
    require("../managers/TicketManager");


/*
 * Configurações temporárias do setup.
 *
 * userId -> {
 *     panelChannelId,
 *     categoryId,
 *     supportRoleId
 * }
 */

const setupSessions = new Map();


class TicketInteractionHandler {


    /*
     * =====================================================
     * HANDLER PRINCIPAL
     * =====================================================
     */

    static async handle(interaction) {

        if (
            !interaction.isButton() &&
            !interaction.isChannelSelectMenu() &&
            !interaction.isRoleSelectMenu()
        ) {

            return false;

        }


        const id =
            interaction.customId;


        /*
         * =================================================
         * CANAL DO PAINEL
         * =================================================
         */

        if (
            id === "ticket_setup_panel_channel"
        ) {

            return this.handlePanelChannel(
                interaction
            );

        }


        /*
         * =================================================
         * CATEGORIA
         * =================================================
         */

        if (
            id === "ticket_setup_category"
        ) {

            return this.handleCategory(
                interaction
            );

        }


        /*
         * =================================================
         * CARGO DE SUPORTE
         * =================================================
         */

        if (
            id === "ticket_setup_support_role"
        ) {

            return this.handleSupportRole(
                interaction
            );

        }


        /*
         * =================================================
         * CANCELAR SETUP
         * =================================================
         */

        if (
            id === "ticket_setup_cancel"
        ) {

            setupSessions.delete(
                interaction.user.id
            );


            await interaction.update({

                embeds: [

                    new EmbedBuilder()

                        .setTitle(
                            "❌ Configuração cancelada"
                        )

                        .setDescription(
                            "O sistema de tickets não foi configurado."
                        )

                        .setColor(
                            "#ED4245"
                        )

                ],

                components: []

            });


            return true;

        }


        /*
         * =================================================
         * CONFIRMAR SETUP
         * =================================================
         */

        if (
            id === "ticket_setup_confirm"
        ) {

            return this.confirmSetup(
                interaction
            );

        }


        /*
         * =================================================
         * ABRIR TICKET
         * =================================================
         */

        if (
            id === "ticket_open"
        ) {

            return this.createTicket(
                interaction
            );

        }

        /*
         * =================================================
         * CONFIRMAR FECHAMENTO
         * =================================================
         */

        if (id === "ticket_close_confirm") {

            return this.closeTicket(
                interaction
            );

        }


        /*
         * =================================================
         * CANCELAR FECHAMENTO
         * =================================================
         */

        if (id === "ticket_close_cancel") {

            return this.cancelCloseTicket(
                interaction
            );

        }


        /*
         * =================================================
         * FECHAR TICKET
         * =================================================
        */

        if (id === "ticket_close") {

            return this.confirmCloseTicket(
                interaction
            );

        }

        return false;

    }


    /*
     * =====================================================
     * CANAL DO PAINEL
     * =====================================================
     */

    static async handlePanelChannel(
        interaction
    ) {

        const panelChannelId =
            interaction.values[0];


        setupSessions.set(

            interaction.user.id,

            {

                panelChannelId,

                categoryId: null,

                supportRoleId: null

            }

        );


        const embed =
            new EmbedBuilder()

                .setTitle(
                    "🎫 Configuração de Tickets"
                )

                .setDescription(

                    "📢 Canal do painel selecionado.\n\n" +

                    "Agora escolha a **categoria onde os tickets serão criados**."

                )

                .setColor(
                    "#5865F2"
                );


        const categorySelect =

            new ChannelSelectMenuBuilder()

                .setCustomId(
                    "ticket_setup_category"
                )

                .setPlaceholder(
                    "📁 Escolha a categoria"
                )

                .setChannelTypes(
                    ChannelType.GuildCategory
                )

                .setMinValues(1)

                .setMaxValues(1);


        const cancelButton =

            new ButtonBuilder()

                .setCustomId(
                    "ticket_setup_cancel"
                )

                .setLabel(
                    "Cancelar"
                )

                .setEmoji(
                    "❌"
                )

                .setStyle(
                    ButtonStyle.Danger
                );


        await interaction.update({

            embeds: [
                embed
            ],

            components: [

                new ActionRowBuilder()
                    .addComponents(
                        categorySelect
                    ),

                new ActionRowBuilder()
                    .addComponents(
                        cancelButton
                    )

            ]

        });


        return true;

    }


    /*
     * =====================================================
     * CATEGORIA
     * =====================================================
     */

    static async handleCategory(
        interaction
    ) {

        const session =
            setupSessions.get(
                interaction.user.id
            );


        if (!session) {

            await interaction.reply({

                content:
                    "❌ Essa configuração expirou. Execute `/ticket setup` novamente.",

                ephemeral: true

            });


            return true;

        }


        session.categoryId =
            interaction.values[0];


        const embed =
            new EmbedBuilder()

                .setTitle(
                    "🎫 Configuração de Tickets"
                )

                .setDescription(

                    "📢 Canal do painel selecionado.\n" +

                    "📁 Categoria selecionada.\n\n" +

                    "Agora escolha o **cargo responsável pelos tickets**."

                )

                .setColor(
                    "#5865F2"
                );


        const roleSelect =

            new RoleSelectMenuBuilder()

                .setCustomId(
                    "ticket_setup_support_role"
                )

                .setPlaceholder(
                    "🛡️ Escolha o cargo de suporte"
                )

                .setMinValues(1)

                .setMaxValues(1);


        const cancelButton =

            new ButtonBuilder()

                .setCustomId(
                    "ticket_setup_cancel"
                )

                .setLabel(
                    "Cancelar"
                )

                .setEmoji(
                    "❌"
                )

                .setStyle(
                    ButtonStyle.Danger
                );


        await interaction.update({

            embeds: [
                embed
            ],

            components: [

                new ActionRowBuilder()
                    .addComponents(
                        roleSelect
                    ),

                new ActionRowBuilder()
                    .addComponents(
                        cancelButton
                    )

            ]

        });


        return true;

    }


    /*
     * =====================================================
     * CARGO DE SUPORTE
     * =====================================================
     */

    static async handleSupportRole(
        interaction
    ) {

        const session =
            setupSessions.get(
                interaction.user.id
            );


        if (!session) {

            await interaction.reply({

                content:
                    "❌ Essa configuração expirou. Execute `/ticket setup` novamente.",

                ephemeral: true

            });


            return true;

        }


        session.supportRoleId =
            interaction.values[0];


        const embed =
            new EmbedBuilder()

                .setTitle(
                    "✅ Configuração pronta"
                )

                .setDescription(

                    "O sistema de tickets está pronto para ser configurado.\n\n" +

                    `📢 **Canal:** <#${session.panelChannelId}>\n` +

                    `📁 **Categoria:** <#${session.categoryId}>\n` +

                    `🛡️ **Suporte:** <@&${session.supportRoleId}>`

                )

                .setColor(
                    "#57F287"
                );


        const confirmButton =

            new ButtonBuilder()

                .setCustomId(
                    "ticket_setup_confirm"
                )

                .setLabel(
                    "Confirmar"
                )

                .setEmoji(
                    "✅"
                )

                .setStyle(
                    ButtonStyle.Success
                );


        const cancelButton =

            new ButtonBuilder()

                .setCustomId(
                    "ticket_setup_cancel"
                )

                .setLabel(
                    "Cancelar"
                )

                .setEmoji(
                    "❌"
                )

                .setStyle(
                    ButtonStyle.Danger
                );


        await interaction.update({

            embeds: [
                embed
            ],

            components: [

                new ActionRowBuilder()
                    .addComponents(

                        confirmButton,

                        cancelButton

                    )

            ]

        });


        return true;

    }


    /*
     * =====================================================
     * CONFIRMAR SETUP
     * =====================================================
     */

    static async confirmSetup(
        interaction
    ) {

        const session =
            setupSessions.get(
                interaction.user.id
            );


        if (!session) {

            await interaction.reply({

                content:
                    "❌ Essa configuração expirou. Execute `/ticket setup` novamente.",

                ephemeral: true

            });


            return true;

        }


        /*
         * =================================================
         * VALIDAÇÃO
         * =================================================
         */

        const panelChannel =
            interaction.guild.channels.cache.get(
                session.panelChannelId
            );


        const category =
            interaction.guild.channels.cache.get(
                session.categoryId
            );


        const supportRole =
            interaction.guild.roles.cache.get(
                session.supportRoleId
            );


        if (!panelChannel) {

            await interaction.update({

                embeds: [

                    new EmbedBuilder()

                        .setTitle(
                            "❌ Canal inválido"
                        )

                        .setDescription(
                            "O canal selecionado não existe mais."
                        )

                        .setColor(
                            "#ED4245"
                        )

                ],

                components: []

            });


            setupSessions.delete(
                interaction.user.id
            );


            return true;

        }


        if (
            !category ||
            category.type !== ChannelType.GuildCategory
        ) {

            await interaction.update({

                embeds: [

                    new EmbedBuilder()

                        .setTitle(
                            "❌ Categoria inválida"
                        )

                        .setDescription(
                            "A categoria selecionada não existe mais ou não é uma categoria."
                        )

                        .setColor(
                            "#ED4245"
                        )

                ],

                components: []

            });


            setupSessions.delete(
                interaction.user.id
            );


            return true;

        }


        if (!supportRole) {

            await interaction.update({

                embeds: [

                    new EmbedBuilder()

                        .setTitle(
                            "❌ Cargo inválido"
                        )

                        .setDescription(
                            "O cargo de suporte selecionado não existe mais."
                        )

                        .setColor(
                            "#ED4245"
                        )

                ],

                components: []

            });


            setupSessions.delete(
                interaction.user.id
            );


            return true;

        }


        /*
         * =================================================
         * SALVA NO BANCO
         * =================================================
         */

        TicketManager.saveConfig(

            interaction.guild.id,

            session.panelChannelId,

            session.categoryId,

            session.supportRoleId

        );


        /*
         * =================================================
         * PAINEL DE TICKETS
         * =================================================
         */

        const panelEmbed =
            new EmbedBuilder()

                .setTitle(
                    "🎫 Central de Atendimento"
                )

                .setDescription(

                    "Precisa de ajuda?\n\n" +

                    "Clique no botão abaixo para abrir um ticket.\n\n" +

                    "📌 **Como funciona?**\n" +

                    "• Clique em **Abrir Ticket**\n" +

                    "• Um canal privado será criado\n" +

                    "• Nossa equipe poderá atender você\n" +

                    "• Quando terminar, o ticket poderá ser fechado"

                )

                .setColor(
                    "#5865F2"
                );


        const button =
            new ButtonBuilder()

                .setCustomId(
                    "ticket_open"
                )

                .setLabel(
                    "Abrir Ticket"
                )

                .setEmoji(
                    "🎫"
                )

                .setStyle(
                    ButtonStyle.Success
                );


        try {

            await panelChannel.send({

                embeds: [
                    panelEmbed
                ],

                components: [

                    new ActionRowBuilder()
                        .addComponents(
                            button
                        )

                ]

            });


        } catch (error) {

            console.error(
                "❌ Erro ao enviar painel de tickets:",
                error
            );


            await interaction.update({

                embeds: [

                    new EmbedBuilder()

                        .setTitle(
                            "❌ Erro"
                        )

                        .setDescription(
                            "Não consegui enviar o painel no canal selecionado."
                        )

                        .setColor(
                            "#ED4245"
                        )

                ],

                components: []

            });


            return true;

        }


        /*
         * =================================================
         * FINALIZA
         * =================================================
         */

        setupSessions.delete(
            interaction.user.id
        );


        await interaction.update({

            embeds: [

                new EmbedBuilder()

                    .setTitle(
                        "✅ Sistema configurado!"
                    )

                    .setDescription(

                        "O sistema de tickets foi configurado com sucesso.\n\n" +

                        `📢 **Painel:** <#${session.panelChannelId}>\n` +

                        `📁 **Categoria:** <#${session.categoryId}>\n` +

                        `🛡️ **Suporte:** <@&${session.supportRoleId}>`

                    )

                    .setColor(
                        "#57F287"
                    )

            ],

            components: []

        });


        return true;

    }



    /*
     * =====================================================
     * ABRIR TICKET
     * =====================================================
     */

    static async createTicket(interaction) {

        const guild =
            interaction.guild;

        const user =
            interaction.user;


        const config =
            TicketManager.getConfig(
                guild.id
            );


        if (!config) {

            await interaction.reply({

                content:
                    "❌ O sistema de tickets ainda não foi configurado.",

                ephemeral: true

            });

            return true;

        }


        /*
         * =================================================
         * NOME DO TICKET
         * =================================================
         */

        const ticketName =
            `ticket-${user.username
                .toLowerCase()
                .replace(/[^a-z0-9-_]/g, "")
                .slice(0, 80)}`;


        /*
         * =================================================
         * VERIFICA SE JÁ POSSUI TICKET
         * =================================================
         */

        const existingChannel =
            guild.channels.cache.find(

                channel =>

                    channel.name === ticketName &&

                    channel.parentId ===
                    config.category_id

            );


        if (existingChannel) {

            await interaction.reply({

                content:
                    `❌ Você já possui um ticket aberto: ${existingChannel}`,

                ephemeral: true

            });

            return true;

        }


        /*
         * =================================================
         * PERMISSÕES
         * =================================================
         */

        const permissionOverwrites = [

            {
                id:
                    guild.roles.everyone.id,

                deny: [

                    PermissionFlagsBits.ViewChannel

                ]

            },

            {
                id:
                    user.id,

                allow: [

                    PermissionFlagsBits.ViewChannel,

                    PermissionFlagsBits.SendMessages,

                    PermissionFlagsBits.ReadMessageHistory

                ]

            },

            {
                id:
                    config.support_role_id,

                allow: [

                    PermissionFlagsBits.ViewChannel,

                    PermissionFlagsBits.SendMessages,

                    PermissionFlagsBits.ReadMessageHistory

                ]

            },

            {
                id:
                    guild.members.me.id,

                allow: [

                    PermissionFlagsBits.ViewChannel,

                    PermissionFlagsBits.SendMessages,

                    PermissionFlagsBits.ReadMessageHistory,

                    PermissionFlagsBits.ManageChannels

                ]

            }

        ];


        try {

            /*
             * =============================================
             * CRIA O CANAL
             * =============================================
             */

            const channel =
                await guild.channels.create({

                    name:
                        ticketName,

                    type:
                        ChannelType.GuildText,

                    parent:
                        config.category_id,

                    permissionOverwrites

                });


            /*
             * =============================================
             * EMBED INICIAL
             * =============================================
             */

            const embed =
                new EmbedBuilder()

                    .setColor(
                        "#5865F2"
                    )

                    .setTitle(
                        "🎫 Ticket aberto"
                    )

                    .setDescription(

                        `Olá ${user}!\n\n` +

                        "Explique seu problema ou dúvida " +
                        "e aguarde a equipe de suporte.\n\n" +

                        "Quando terminar o atendimento, " +
                        "utilize o botão abaixo para fechar o ticket."

                    )

                    .setFooter({

                        text:
                            `Ticket de ${user.tag}`

                    })

                    .setTimestamp();


            /*
             * =============================================
             * BOTÃO FECHAR
             * =============================================
             */

            const closeButton =
                new ButtonBuilder()

                    .setCustomId(
                        "ticket_close"
                    )

                    .setLabel(
                        "Fechar Ticket"
                    )

                    .setEmoji(
                        "🔒"
                    )

                    .setStyle(
                        ButtonStyle.Danger
                    );


            const row =
                new ActionRowBuilder()
                    .addComponents(
                        closeButton
                    );


            /*
             * =============================================
             * ENVIA MENSAGEM INICIAL
             * =============================================
             */

            await channel.send({

                content:
                    `${user} <@&${config.support_role_id}>`,

                embeds: [

                    embed

                ],

                components: [

                    row

                ]

            });


            /*
             * =============================================
             * AVISA O USUÁRIO
             * =============================================
             */

            await interaction.reply({

                content:
                    `✅ Ticket criado com sucesso: ${channel}`,

                ephemeral: true

            });


            return true;

        } catch (error) {

            console.error(
                "❌ Erro ao criar ticket:",
                error
            );


            await interaction.reply({

                content:
                    "❌ Não consegui criar o ticket. Verifique as permissões do bot.",

                ephemeral: true

            });


            return true;

        }

    }


    /*
     * =====================================================
     * PEDIR CONFIRMAÇÃO DE FECHAMENTO
     * =====================================================
     */

    static async confirmCloseTicket(
        interaction
    ) {

        const confirmButton =
            new ButtonBuilder()

                .setCustomId(
                    "ticket_close_confirm"
                )

                .setLabel(
                    "Confirmar fechamento"
                )

                .setEmoji(
                    "✅"
                )

                .setStyle(
                    ButtonStyle.Danger
                );


        const cancelButton =
            new ButtonBuilder()

                .setCustomId(
                    "ticket_close_cancel"
                )

                .setLabel(
                    "Cancelar"
                )

                .setEmoji(
                    "❌"
                )

                .setStyle(
                    ButtonStyle.Secondary
                );


        const row =
            new ActionRowBuilder()
                .addComponents(

                    confirmButton,

                    cancelButton

                );


        await interaction.reply({

            content:
                "⚠️ **Tem certeza que deseja fechar este ticket?**\n\n" +
                "O atendimento será encerrado.",

            components: [

                row

            ]

        });


        return true;

    }


    /*
     * =====================================================
     * CANCELAR FECHAMENTO
     * =====================================================
     */

    static async cancelCloseTicket(
        interaction
    ) {

        await interaction.update({

            content:
                "✅ Fechamento cancelado. O ticket continua aberto.",

            components: []

        });


        return true;

    }


    /*
     * =====================================================
     * FECHAR TICKET
     * =====================================================
     */

    static async closeTicket(
        interaction
    ) {

        const channel =
            interaction.channel;


        if (
            !channel.name.startsWith(
                "ticket-"
            )
        ) {

            await interaction.reply({

                content:
                    "❌ Este canal não é um ticket.",

                ephemeral: true

            });

            return true;

        }


        await interaction.update({

            content:
                "🔒 Fechando ticket...",

            components: []

        });


        setTimeout(

            async () => {

                try {

                    await channel.delete();

                } catch (error) {

                    console.error(
                        "❌ Erro ao fechar ticket:",
                        error
                    );

                }

            },

            1500

        );


        return true;

    }

}

module.exports =
    TicketInteractionHandler;