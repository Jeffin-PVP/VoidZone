const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelSelectMenuBuilder,
    ChannelType,
    EmbedBuilder
} = require("discord.js");


const WelcomeManager =
    require("../managers/WelcomeManager");


const setupSessions =
    new Map();


class WelcomeInteractionHandler {


    /*
     * =====================================================
     * INICIAR SETUP
     * =====================================================
     */

    static async startSetup(
        interaction
    ) {

        const embed =
            new EmbedBuilder()

                .setTitle(
                    "🎉 Configuração de Boas-vindas"
                )

                .setDescription(

                    "Configure o sistema de boas-vindas.\n\n" +

                    "Escolha o canal onde as mensagens " +
                    "de novos membros serão enviadas."

                )

                .setColor(
                    "#5865F2"
                );


        const channelSelect =
            new ChannelSelectMenuBuilder()

                .setCustomId(
                    "welcome_setup_channel"
                )

                .setPlaceholder(
                    "📢 Escolha o canal"
                )

                .setChannelTypes(
                    ChannelType.GuildText
                )

                .setMinValues(1)

                .setMaxValues(1);


        const cancelButton =
            new ButtonBuilder()

                .setCustomId(
                    "welcome_setup_cancel"
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


        await interaction.reply({

            embeds: [
                embed
            ],

            components: [

                new ActionRowBuilder()
                    .addComponents(
                        channelSelect
                    ),

                new ActionRowBuilder()
                    .addComponents(
                        cancelButton
                    )

            ],

            ephemeral: true

        });


        return true;

    }


    /*
     * =====================================================
     * HANDLER PRINCIPAL
     * =====================================================
     */

    static async handle(
        interaction
    ) {

        if (
            !interaction.isButton() &&
            !interaction.isChannelSelectMenu()
        ) {

            return false;

        }


        const id =
            interaction.customId;


        /*
         * =================================================
         * SELECIONAR CANAL
         * =================================================
         */

        if (
            id === "welcome_setup_channel"
        ) {

            return this.handleChannelSelect(
                interaction
            );

        }


        /*
         * =================================================
         * CANCELAR
         * =================================================
         */

        if (
            id === "welcome_setup_cancel"
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
                            "O sistema de boas-vindas não foi alterado."
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
         * CONFIRMAR
         * =================================================
         */

        if (
            id === "welcome_setup_confirm"
        ) {

            return this.confirmSetup(
                interaction
            );

        }


        return false;

    }


    /*
     * =====================================================
     * SELECIONAR CANAL
     * =====================================================
     */

    static async handleChannelSelect(
        interaction
    ) {

        const channelId =
            interaction.values[0];


        setupSessions.set(

            interaction.user.id,

            {

                guildId:
                    interaction.guild.id,

                channelId

            }

        );


        const channel =
            interaction.guild.channels.cache.get(
                channelId
            );


        const embed =
            new EmbedBuilder()

                .setTitle(
                    "🎉 Configuração de Boas-vindas"
                )

                .setDescription(

                    "A configuração está pronta.\n\n" +

                    `📢 **Canal:** ${channel}\n\n` +

                    "Novos membros receberão a mensagem " +
                    "de boas-vindas nesse canal."

                )

                .setColor(
                    "#57F287"
                );


        const confirmButton =
            new ButtonBuilder()

                .setCustomId(
                    "welcome_setup_confirm"
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
                    "welcome_setup_cancel"
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
                    "❌ Essa configuração expirou. Execute `/welcome setup` novamente.",

                ephemeral: true

            });


            return true;

        }


        const channel =
            interaction.guild.channels.cache.get(
                session.channelId
            );


        if (!channel) {

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


        /*
         * =================================================
         * SALVAR NO BANCO
         * =================================================
         */

        WelcomeManager.saveConfig(

            interaction.guild.id,

            session.channelId

        );


        setupSessions.delete(
            interaction.user.id
        );


        /*
         * =================================================
         * FINAL
         * =================================================
         */

        await interaction.update({

            embeds: [

                new EmbedBuilder()

                    .setTitle(
                        "✅ Sistema configurado!"
                    )

                    .setDescription(

                        "O sistema de boas-vindas foi configurado com sucesso.\n\n" +

                        `📢 **Canal:** ${channel}`

                    )

                    .setColor(
                        "#57F287"
                    )

            ],

            components: []

        });


        return true;

    }

}


module.exports =
    WelcomeInteractionHandler;