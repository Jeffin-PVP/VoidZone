const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelSelectMenuBuilder,
    MessageFlags
} = require("discord.js");


const EmbedSessionManager =
    require("../../managers/EmbedSessionManager");


const EmbedPreview =
    require("../../utils/EmbedPreview");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("embed")

        .setDescription(
            "Abre o editor de embeds."
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageMessages
        ),


    async execute(interaction) {


        /*
         * =====================================================
         * RESPOSTA EPHEMERAL
         * =====================================================
         *
         * O interactionCreate normalmente já fez
         * deferReply(). Como precisamos que o editor
         * seja privado, essa resposta precisa ser
         * ephemeral desde o início.
         */

        if (!interaction.deferred && !interaction.replied) {

            await interaction.deferReply({
                flags: MessageFlags.Ephemeral
            });

        }


        /*
         * =====================================================
         * VERIFICA SESSÃO EXISTENTE
         * =====================================================
         */

        if (
            EmbedSessionManager.has(
                interaction.user.id
            )
        ) {

            await interaction.editReply({

                content:
                    "⚠️ Você já possui um editor de embed aberto.",

                embeds: [],

                components: []

            });

            return;

        }


        /*
         * =====================================================
         * CRIA SESSÃO
         * =====================================================
         */

        const session =
            EmbedSessionManager.create(

                interaction.user.id,

                interaction.guild.id,

                interaction.channel.id

            );


        /*
         * =====================================================
         * BOTÕES — INFORMAÇÕES
         * =====================================================
         */

        const row1 =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            "embed_edit_info"
                        )
                        .setLabel(
                            "Informações"
                        )
                        .setEmoji("📝")
                        .setStyle(
                            ButtonStyle.Primary
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            "embed_edit_color"
                        )
                        .setLabel(
                            "Cor"
                        )
                        .setEmoji("🎨")
                        .setStyle(
                            ButtonStyle.Secondary
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            "embed_edit_author"
                        )
                        .setLabel(
                            "Autor"
                        )
                        .setEmoji("👤")
                        .setStyle(
                            ButtonStyle.Secondary
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            "embed_edit_footer"
                        )
                        .setLabel(
                            "Rodapé"
                        )
                        .setEmoji("📋")
                        .setStyle(
                            ButtonStyle.Secondary
                        )

                );


        /*
         * =====================================================
         * BOTÕES — IMAGENS / FIELDS / TIMESTAMP
         * =====================================================
         */

        const row2 =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            "embed_edit_images"
                        )
                        .setLabel(
                            "Imagens"
                        )
                        .setEmoji("🖼️")
                        .setStyle(
                            ButtonStyle.Secondary
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            "embed_fields"
                        )
                        .setLabel(
                            "Fields"
                        )
                        .setEmoji("📑")
                        .setStyle(
                            ButtonStyle.Secondary
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            "embed_toggle_timestamp"
                        )
                        .setLabel(
                            "Timestamp"
                        )
                        .setEmoji("🕐")
                        .setStyle(
                            ButtonStyle.Secondary
                        )

                );


        /*
         * =====================================================
         * BOTÕES — ENVIAR / CANCELAR
         * =====================================================
         */

        const row3 =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            "embed_send"
                        )
                        .setLabel(
                            "Enviar"
                        )
                        .setEmoji("📨")
                        .setStyle(
                            ButtonStyle.Success
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            "embed_cancel"
                        )
                        .setLabel(
                            "Cancelar"
                        )
                        .setEmoji("❌")
                        .setStyle(
                            ButtonStyle.Danger
                        )

                );


        /*
         * =====================================================
         * SELEÇÃO DE CANAL
         * =====================================================
         */

        const channelSelect =
            new ChannelSelectMenuBuilder()

                .setCustomId(
                    "embed_select_channel"
                )

                .setPlaceholder(
                    "📢 Escolha o canal onde o embed será enviado"
                )

                .setChannelTypes(
                    ChannelType.GuildText
                )

                .setMinValues(1)

                .setMaxValues(1);


        const channelRow =
            new ActionRowBuilder()
                .addComponents(
                    channelSelect
                );


        /*
         * =====================================================
         * PREVIEW
         * =====================================================
         */

        const embed =
            EmbedPreview.build(
                session
            );


        /*
         * =====================================================
         * ENVIA O EDITOR
         * =====================================================
         */

        await interaction.editReply({

            content:
                "## 📦 Editor de Embed\n\n" +
                "Configure o embed usando os controles abaixo.\n" +
                "🔒 Este editor é visível somente para você.",

            embeds: [
                embed
            ],

            components: [
                row1,
                row2,
                row3,
                channelRow
            ]

        });

    }

};