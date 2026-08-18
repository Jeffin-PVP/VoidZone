const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    StringSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    ChannelType
} = require("discord.js");


const EmbedSessionManager =
    require("../managers/EmbedSessionManager");


const EmbedPreview =
    require("../utils/EmbedPreview");


class EmbedInteractionHandler {


    static async handle(interaction) {

        if (
            !interaction.isButton() &&
            !interaction.isModalSubmit() &&
            !interaction.isChannelSelectMenu() &&
            !interaction.isStringSelectMenu()
        ) {

            return false;

        }


        const session =
            EmbedSessionManager.get(
                interaction.user.id
            );


        if (!session) {

            if (
                interaction.isButton() ||
                interaction.isChannelSelectMenu() ||
                interaction.isStringSelectMenu()
            ) {

                await interaction.reply({

                    content:
                        "❌ Essa sessão de embed não existe mais.",

                    ephemeral: true

                });

            }

            return true;

        }


        /*
         * =====================================================
         * CHANNEL SELECT
         * =====================================================
         */

        if (
            interaction.isChannelSelectMenu()
        ) {

            return this.handleChannelSelect(
                interaction
            );

        }


        /*
         * =====================================================
         * STRING SELECT
         * =====================================================
         */

        if (
            interaction.isStringSelectMenu()
        ) {

            return this.handleStringSelect(
                interaction
            );

        }


        /*
         * =====================================================
         * BOTÕES
         * =====================================================
         */

        if (
            interaction.isButton()
        ) {

            return this.handleButton(
                interaction,
                session
            );

        }


        /*
         * =====================================================
         * MODAIS
         * =====================================================
         */

        if (
            interaction.isModalSubmit()
        ) {

            return this.handleModal(
                interaction,
                session
            );

        }


        return false;

    }


    /*
     * =====================================================
     * CHANNEL SELECT
     * =====================================================
     */

    static async handleChannelSelect(
        interaction
    ) {

        const channelId =
            interaction.values[0];


        EmbedSessionManager.update(

            interaction.user.id,

            {
                channelId
            }

        );


        await this.updateEditor(
            interaction
        );


        return true;

    }


    /*
     * =====================================================
     * BOTÕES
     * =====================================================
     */

    static async handleButton(
        interaction,
        session
    ) {

        const id =
            interaction.customId;


        /*
         * =====================================================
         * INFORMAÇÕES
         * =====================================================
         */

        if (
            id === "embed_edit_info"
        ) {

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        "embed_modal_info"
                    )
                    .setTitle(
                        "Informações do Embed"
                    );


            const title =
                new TextInputBuilder()
                    .setCustomId(
                        "embed_title"
                    )
                    .setLabel(
                        "Título"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(false)
                    .setMaxLength(256)
                    .setValue(
                        session.title || ""
                    );


            const description =
                new TextInputBuilder()
                    .setCustomId(
                        "embed_description"
                    )
                    .setLabel(
                        "Descrição"
                    )
                    .setStyle(
                        TextInputStyle.Paragraph
                    )
                    .setRequired(true)
                    .setMaxLength(4000)
                    .setValue(
                        session.description || ""
                    );


            modal.addComponents(

                new ActionRowBuilder()
                    .addComponents(
                        title
                    ),

                new ActionRowBuilder()
                    .addComponents(
                        description
                    )

            );


            await interaction.showModal(
                modal
            );


            return true;

        }


        /*
         * =====================================================
         * COR
         * =====================================================
         */

        if (
            id === "embed_edit_color"
        ) {

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        "embed_modal_color"
                    )
                    .setTitle(
                        "Cor do Embed"
                    );


            const color =
                new TextInputBuilder()
                    .setCustomId(
                        "embed_color"
                    )
                    .setLabel(
                        "Cor hexadecimal"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true)
                    .setMaxLength(7)
                    .setValue(
                        session.color || "#5865F2"
                    );


            modal.addComponents(

                new ActionRowBuilder()
                    .addComponents(
                        color
                    )

            );


            await interaction.showModal(
                modal
            );


            return true;

        }


        /*
         * =====================================================
         * AUTOR
         * =====================================================
         */

        if (
            id === "embed_edit_author"
        ) {

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        "embed_modal_author"
                    )
                    .setTitle(
                        "Autor"
                    );


            const name =
                new TextInputBuilder()
                    .setCustomId(
                        "embed_author_name"
                    )
                    .setLabel(
                        "Nome"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true)
                    .setMaxLength(256)
                    .setValue(
                        session.author?.name || ""
                    );


            const icon =
                new TextInputBuilder()
                    .setCustomId(
                        "embed_author_icon"
                    )
                    .setLabel(
                        "URL do ícone"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(false)
                    .setValue(
                        session.author?.iconURL || ""
                    );


            const url =
                new TextInputBuilder()
                    .setCustomId(
                        "embed_author_url"
                    )
                    .setLabel(
                        "URL"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(false)
                    .setValue(
                        session.author?.url || ""
                    );


            modal.addComponents(

                new ActionRowBuilder()
                    .addComponents(
                        name
                    ),

                new ActionRowBuilder()
                    .addComponents(
                        icon
                    ),

                new ActionRowBuilder()
                    .addComponents(
                        url
                    )

            );


            await interaction.showModal(
                modal
            );


            return true;

        }


        /*
         * =====================================================
         * RODAPÉ
         * =====================================================
         */

        if (
            id === "embed_edit_footer"
        ) {

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        "embed_modal_footer"
                    )
                    .setTitle(
                        "Rodapé"
                    );


            const text =
                new TextInputBuilder()
                    .setCustomId(
                        "embed_footer_text"
                    )
                    .setLabel(
                        "Texto"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true)
                    .setMaxLength(2048)
                    .setValue(
                        session.footer?.text || ""
                    );


            const icon =
                new TextInputBuilder()
                    .setCustomId(
                        "embed_footer_icon"
                    )
                    .setLabel(
                        "URL do ícone"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(false)
                    .setValue(
                        session.footer?.iconURL || ""
                    );


            modal.addComponents(

                new ActionRowBuilder()
                    .addComponents(
                        text
                    ),

                new ActionRowBuilder()
                    .addComponents(
                        icon
                    )

            );


            await interaction.showModal(
                modal
            );


            return true;

        }


        /*
         * =====================================================
         * IMAGENS
         * =====================================================
         */

        if (
            id === "embed_edit_images"
        ) {

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        "embed_modal_images"
                    )
                    .setTitle(
                        "Imagens"
                    );


            const thumbnail =
                new TextInputBuilder()
                    .setCustomId(
                        "embed_thumbnail"
                    )
                    .setLabel(
                        "Thumbnail"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(false)
                    .setValue(
                        session.thumbnail || ""
                    );


            const image =
                new TextInputBuilder()
                    .setCustomId(
                        "embed_image"
                    )
                    .setLabel(
                        "Imagem principal"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(false)
                    .setValue(
                        session.image || ""
                    );


            modal.addComponents(

                new ActionRowBuilder()
                    .addComponents(
                        thumbnail
                    ),

                new ActionRowBuilder()
                    .addComponents(
                        image
                    )

            );


            await interaction.showModal(
                modal
            );


            return true;

        }


        /*
         * =====================================================
         * FIELDS
         * =====================================================
         */

        if (
            id === "embed_fields"
        ) {

            await this.showFieldsPanel(
                interaction,
                session
            );


            return true;

        }


        /*
         * =====================================================
         * TIMESTAMP
         * =====================================================
         */

        if (
            id === "embed_toggle_timestamp"
        ) {

            EmbedSessionManager.update(

                interaction.user.id,

                {
                    timestamp:
                        !session.timestamp
                }

            );


            await this.updateEditor(
                interaction
            );


            return true;

        }


        /*
         * =====================================================
         * ENVIAR
         * =====================================================
         */

        if (
            id === "embed_send"
        ) {

            const channel =
                interaction.guild.channels.cache.get(
                    session.channelId
                );


            if (!channel) {

                await interaction.reply({

                    content:
                        "❌ Selecione um canal antes de enviar.",

                    ephemeral: true

                });


                return true;

            }


            const me =
                interaction.guild.members.me;


            if (
                !channel
                    .permissionsFor(me)
                    ?.has("SendMessages")
            ) {

                await interaction.reply({

                    content:
                        "❌ Não tenho permissão para enviar mensagens nesse canal.",

                    ephemeral: true

                });


                return true;

            }


            const embed =
                EmbedPreview.build(
                    session
                );


            try {

                await channel.send({

                    embeds: [
                        embed
                    ]

                });


                EmbedSessionManager.delete(
                    interaction.user.id
                );


                await interaction.update({

                    content:
                        `✅ Embed enviado em ${channel}.`,

                    embeds: [],

                    components: []

                });


            } catch (error) {

                console.error(
                    "❌ Erro ao enviar embed:",
                    error
                );


                await interaction.reply({

                    content:
                        "❌ Não consegui enviar o embed nesse canal.",

                    ephemeral: true

                });

            }


            return true;

        }


        /*
         * =====================================================
         * CANCELAR
         * =====================================================
         */

        if (
            id === "embed_cancel"
        ) {

            EmbedSessionManager.delete(
                interaction.user.id
            );


            await interaction.update({

                content:
                    "❌ Editor de embed cancelado.",

                embeds: [],

                components: []

            });


            return true;

        }


        /*
         * =====================================================
         * FIELD: ADICIONAR
         * =====================================================
         */

        if (
            id === "embed_field_add"
        ) {

            await this.showFieldModal(
                interaction
            );


            return true;

        }


        /*
         * =====================================================
         * FIELD: EDITAR
         * =====================================================
         */

        if (
            id === "embed_field_edit"
        ) {

            if (!session.fields.length) {

                await interaction.reply({

                    content:
                        "❌ Não existem fields para editar.",

                    ephemeral: true

                });


                return true;

            }


            const menu =
                new StringSelectMenuBuilder()

                    .setCustomId(
                        "embed_field_edit_select"
                    )

                    .setPlaceholder(
                        "✏️ Selecione o field que deseja editar"
                    );


            menu.addOptions(

                session.fields.map(
                    (field, index) => ({

                        label:
                            field.name
                                .slice(0, 100),

                        description:
                            `Field #${index + 1}`,

                        value:
                            String(index)

                    })
                )

            );


            await interaction.update({

                content:
                    "✏️ Selecione o field que deseja editar.",

                embeds: [],

                components: [

                    new ActionRowBuilder()
                        .addComponents(
                            menu
                        )

                ]

            });


            return true;

        }


        /*
         * =====================================================
         * FIELD: VOLTAR
         * =====================================================
         */

        if (
            id === "embed_fields_back"
        ) {

            await this.updateEditor(
                interaction
            );


            return true;

        }


        /*
         * =====================================================
         * FIELD: REMOVER
         * =====================================================
         */

        if (
            id === "embed_field_remove"
        ) {

            if (!session.fields.length) {

                await interaction.reply({

                    content:
                        "❌ Não existem fields para remover.",

                    ephemeral: true

                });


                return true;

            }


            const menu =
                new StringSelectMenuBuilder()

                    .setCustomId(
                        "embed_field_remove_select"
                    )

                    .setPlaceholder(
                        "🗑️ Selecione o field"
                    );


            menu.addOptions(

                session.fields.map(
                    (field, index) => ({

                        label:
                            field.name
                                .slice(0, 100),

                        description:
                            `Field #${index + 1}`,

                        value:
                            String(index)

                    })
                )

            );


            await interaction.update({

                content:
                    "🗑️ Selecione o field que deseja remover.",

                embeds: [],

                components: [

                    new ActionRowBuilder()
                        .addComponents(
                            menu
                        )

                ]

            });


            return true;

        }


        return false;

    }


    /*
     * =====================================================
     * PAINEL DE FIELDS
     * =====================================================
     */

    static async showFieldsPanel(
        interaction,
        session
    ) {

        const fieldsText =
            session.fields.length

                ? session.fields
                    .map(
                        (field, index) =>
                            `**${index + 1}. ${field.name}**\n` +
                            `${field.value}\n` +
                            `Inline: ${field.inline ? "Sim" : "Não"}`
                    )
                    .join("\n\n")

                : "Nenhum field adicionado.";


        const row =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            "embed_field_add"
                        )
                        .setLabel(
                            "Adicionar"
                        )
                        .setEmoji("➕")
                        .setStyle(
                            ButtonStyle.Success
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            "embed_field_edit"
                        )
                        .setLabel(
                            "Editar"
                        )
                        .setEmoji("✏️")
                        .setStyle(
                            ButtonStyle.Primary
                        )
                        .setDisabled(
                            !session.fields.length
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            "embed_field_remove"
                        )
                        .setLabel(
                            "Remover"
                        )
                        .setEmoji("🗑️")
                        .setStyle(
                            ButtonStyle.Danger
                        )
                        .setDisabled(
                            !session.fields.length
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            "embed_fields_back"
                        )
                        .setLabel(
                            "Voltar"
                        )
                        .setEmoji("↩️")
                        .setStyle(
                            ButtonStyle.Secondary
                        )

                );


        await interaction.update({

            content:
                `## 📑 Fields\n\n${fieldsText}`,

            embeds: [],

            components: [
                row
            ]

        });

    }


    /*
     * =====================================================
     * MODAL DE ADICIONAR FIELD
     * =====================================================
     */

    static async showFieldModal(
        interaction
    ) {

        const modal =
            new ModalBuilder()
                .setCustomId(
                    "embed_modal_field_add"
                )
                .setTitle(
                    "Adicionar Field"
                );


        const name =
            new TextInputBuilder()
                .setCustomId(
                    "field_name"
                )
                .setLabel(
                    "Nome"
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true)
                .setMaxLength(256);


        const value =
            new TextInputBuilder()
                .setCustomId(
                    "field_value"
                )
                .setLabel(
                    "Valor"
                )
                .setStyle(
                    TextInputStyle.Paragraph
                )
                .setRequired(true)
                .setMaxLength(1024);


        const inline =
            new TextInputBuilder()
                .setCustomId(
                    "field_inline"
                )
                .setLabel(
                    "Inline? Digite sim ou não"
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true)
                .setMaxLength(3)
                .setValue(
                    "não"
                );


        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(
                    name
                ),

            new ActionRowBuilder()
                .addComponents(
                    value
                ),

            new ActionRowBuilder()
                .addComponents(
                    inline
                )

        );


        await interaction.showModal(
            modal
        );

    }


    /*
     * =====================================================
     * MODAL DE EDITAR FIELD
     * =====================================================
     */

    static async showFieldEditModal(
        interaction,
        field,
        index
    ) {

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `embed_modal_field_edit_${index}`
                )
                .setTitle(
                    "Editar Field"
                );


        const name =
            new TextInputBuilder()
                .setCustomId(
                    "field_name"
                )
                .setLabel(
                    "Nome"
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true)
                .setMaxLength(256)
                .setValue(
                    field.name || ""
                );


        const value =
            new TextInputBuilder()
                .setCustomId(
                    "field_value"
                )
                .setLabel(
                    "Valor"
                )
                .setStyle(
                    TextInputStyle.Paragraph
                )
                .setRequired(true)
                .setMaxLength(1024)
                .setValue(
                    field.value || ""
                );


        const inline =
            new TextInputBuilder()
                .setCustomId(
                    "field_inline"
                )
                .setLabel(
                    "Inline? Digite sim ou não"
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true)
                .setMaxLength(3)
                .setValue(
                    field.inline
                        ? "sim"
                        : "não"
                );


        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(
                    name
                ),

            new ActionRowBuilder()
                .addComponents(
                    value
                ),

            new ActionRowBuilder()
                .addComponents(
                    inline
                )

        );


        await interaction.showModal(
            modal
        );

    }


    /*
     * =====================================================
     * SELECTS
     * =====================================================
     */

    static async handleStringSelect(
        interaction
    ) {

        /*
         * =================================================
         * EDITAR FIELD
         * =================================================
         */

        if (
            interaction.customId ===
            "embed_field_edit_select"
        ) {

            const index =
                Number(
                    interaction.values[0]
                );


            const session =
                EmbedSessionManager.get(
                    interaction.user.id
                );


            const field =
                session?.fields?.[index];


            if (!field) {

                await interaction.reply({

                    content:
                        "❌ Esse field não existe mais.",

                    ephemeral: true

                });


                return true;

            }


            await this.showFieldEditModal(

                interaction,

                field,

                index

            );


            return true;

        }


        /*
         * =================================================
         * REMOVER FIELD
         * =================================================
         */

        if (
            interaction.customId ===
            "embed_field_remove_select"
        ) {

            const index =
                Number(
                    interaction.values[0]
                );


            const removed =
                EmbedSessionManager.removeField(

                    interaction.user.id,

                    index

                );


            if (!removed) {

                await interaction.reply({

                    content:
                        "❌ Esse field não existe mais.",

                    ephemeral: true

                });


                return true;

            }


            const session =
                EmbedSessionManager.get(
                    interaction.user.id
                );


            await this.showFieldsPanel(
                interaction,
                session
            );


            return true;

        }


        return false;

    }


    /*
     * =====================================================
     * MODAIS
     * =====================================================
     */

    static async handleModal(
        interaction,
        session
    ) {

        const id =
            interaction.customId;


        /*
         * =====================================================
         * INFORMAÇÕES
         * =====================================================
         */

        if (
            id === "embed_modal_info"
        ) {

            EmbedSessionManager.update(

                interaction.user.id,

                {

                    title:
                        interaction.fields
                            .getTextInputValue(
                                "embed_title"
                            ) || null,

                    description:
                        interaction.fields
                            .getTextInputValue(
                                "embed_description"
                            )

                }

            );


            await this.updateEditor(
                interaction
            );


            return true;

        }


        /*
         * =====================================================
         * COR
         * =====================================================
         */

        if (
            id === "embed_modal_color"
        ) {

            const color =
                interaction.fields
                    .getTextInputValue(
                        "embed_color"
                    )
                    .trim();


            if (
                !/^#[0-9A-Fa-f]{6}$/.test(
                    color
                )
            ) {

                await interaction.reply({

                    content:
                        "❌ Cor inválida. Use, por exemplo, `#5865F2`.",

                    ephemeral: true

                });


                return true;

            }


            EmbedSessionManager.update(

                interaction.user.id,

                {
                    color
                }

            );


            await this.updateEditor(
                interaction
            );


            return true;

        }


        /*
         * =====================================================
         * AUTOR
         * =====================================================
         */

        if (
            id === "embed_modal_author"
        ) {

            EmbedSessionManager.update(

                interaction.user.id,

                {

                    author: {

                        name:
                            interaction.fields
                                .getTextInputValue(
                                    "embed_author_name"
                                ),

                        iconURL:
                            interaction.fields
                                .getTextInputValue(
                                    "embed_author_icon"
                                ) || null,

                        url:
                            interaction.fields
                                .getTextInputValue(
                                    "embed_author_url"
                                ) || null

                    }

                }

            );


            await this.updateEditor(
                interaction
            );


            return true;

        }


        /*
         * =====================================================
         * RODAPÉ
         * =====================================================
         */

        if (
            id === "embed_modal_footer"
        ) {

            EmbedSessionManager.update(

                interaction.user.id,

                {

                    footer: {

                        text:
                            interaction.fields
                                .getTextInputValue(
                                    "embed_footer_text"
                                ),

                        iconURL:
                            interaction.fields
                                .getTextInputValue(
                                    "embed_footer_icon"
                                ) || null

                    }

                }

            );


            await this.updateEditor(
                interaction
            );


            return true;

        }


        /*
         * =====================================================
         * IMAGENS
         * =====================================================
         */

        if (
            id === "embed_modal_images"
        ) {

            EmbedSessionManager.update(

                interaction.user.id,

                {

                    thumbnail:
                        interaction.fields
                            .getTextInputValue(
                                "embed_thumbnail"
                            ) || null,

                    image:
                        interaction.fields
                            .getTextInputValue(
                                "embed_image"
                            ) || null

                }

            );


            await this.updateEditor(
                interaction
            );


            return true;

        }


        /*
         * =====================================================
         * ADICIONAR FIELD
         * =====================================================
         */

        if (
            id === "embed_modal_field_add"
        ) {

            const name =
                interaction.fields
                    .getTextInputValue(
                        "field_name"
                    );


            const value =
                interaction.fields
                    .getTextInputValue(
                        "field_value"
                    );


            const inlineValue =
                interaction.fields
                    .getTextInputValue(
                        "field_inline"
                    )
                    .toLowerCase()
                    .trim();


            const inline =
                inlineValue === "sim";


            EmbedSessionManager.addField(

                interaction.user.id,

                {

                    name,

                    value,

                    inline

                }

            );


            await this.updateEditor(
                interaction
            );


            return true;

        }


        /*
         * =====================================================
         * EDITAR FIELD
         * =====================================================
         */

        if (
            id.startsWith(
                "embed_modal_field_edit_"
            )
        ) {

            const index =
                Number(
                    id.replace(
                        "embed_modal_field_edit_",
                        ""
                    )
                );


            const sessionAtual =
                EmbedSessionManager.get(
                    interaction.user.id
                );


            if (
                !sessionAtual ||
                !sessionAtual.fields[index]
            ) {

                await interaction.reply({

                    content:
                        "❌ Esse field não existe mais.",

                    ephemeral: true

                });


                return true;

            }


            const name =
                interaction.fields
                    .getTextInputValue(
                        "field_name"
                    );


            const value =
                interaction.fields
                    .getTextInputValue(
                        "field_value"
                    );


            const inlineValue =
                interaction.fields
                    .getTextInputValue(
                        "field_inline"
                    )
                    .toLowerCase()
                    .trim();


            const inline =
                inlineValue === "sim";


            sessionAtual.fields[index] = {

                name,

                value,

                inline

            };


            EmbedSessionManager.update(

                interaction.user.id,

                {

                    fields:
                        sessionAtual.fields

                }

            );


            await this.updateEditor(
                interaction
            );


            return true;

        }


        return false;

    }


    /*
     * =====================================================
     * ATUALIZAR EDITOR
     * =====================================================
     */

    static async updateEditor(
        interaction
    ) {

        const session =
            EmbedSessionManager.get(
                interaction.user.id
            );


        if (!session) {
            return;
        }


        const embed =
            EmbedPreview.build(
                session
            );


        /*
         * =====================================================
         * LINHA 1
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
         * LINHA 2
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
                            `Fields (${session.fields.length})`
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
                            session.timestamp
                                ? "Timestamp: ON"
                                : "Timestamp"
                        )
                        .setEmoji("🕐")
                        .setStyle(
                            session.timestamp
                                ? ButtonStyle.Success
                                : ButtonStyle.Secondary
                        )

                );


        /*
         * =====================================================
         * LINHA 3
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
         * SELETOR DE CANAL
         * =====================================================
         */

        const channelSelect =
            new ChannelSelectMenuBuilder()

                .setCustomId(
                    "embed_select_channel"
                )

                .setPlaceholder(
                    "📢 Escolha o canal"
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
         * ATUALIZA O EDITOR
         * =====================================================
         */

        const channelText =
            session.channelId

                ? `<#${session.channelId}>`

                : "Nenhum selecionado";


        await interaction.update({

            content:
                "## 📦 Editor de Embed\n\n" +

                "Configure o embed usando os controles abaixo.\n" +

                `📢 Canal: ${channelText}`,

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

}


module.exports =
    EmbedInteractionHandler;