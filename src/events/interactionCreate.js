const { Events, MessageFlags } = require("discord.js");

module.exports = {

    name: Events.InteractionCreate,

    async execute(interaction) {

        if (!interaction.isChatInputCommand()) {
            return;
        }

        const command = interaction.client.commands.get(
            interaction.commandName
        );

        if (!command) {

            console.warn(
                `⚠️ Comando não encontrado: ${interaction.commandName}`
            );

            return;
        }

        try {

            await interaction.deferReply({

                flags: command.ephemeral
                    ? MessageFlags.Ephemeral
                    : undefined

            });

            await command.execute(interaction);

        } catch (error) {

            console.error(
                `❌ Erro no comando ${interaction.commandName}:`,
                error
            );

            try {

                if (interaction.deferred) {

                    await interaction.editReply({

                        content:
                            "❌ Ocorreu um erro ao executar este comando."

                    });

                } else if (!interaction.replied) {

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