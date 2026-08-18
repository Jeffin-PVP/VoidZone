const { Events } = require("discord.js");

const LogManager = require("../managers/LogManager");

module.exports = {

    name: Events.MessageDelete,

    async execute(message) {

        console.log("🗑️ messageDelete detectado!");

        console.log(
            "Servidor:",
            message.guild?.name
        );

        console.log(
            "Mensagem:",
            message.id
        );

        console.log(
            "Autor:",
            message.author?.tag
        );

        console.log(
            "Canal:",
            message.channel?.name
        );

        if (!message.guild) {
            console.log("⚠️ Mensagem sem guild.");
            return;
        }

        if (message.author?.bot) {
            console.log("🤖 Mensagem de bot ignorada.");
            return;
        }

        if (message.client.clearMessages?.has(message.id)) {
            console.log("🧹 Mensagem ignorada porque veio do clear.");
            return;
        }

        try {

            await LogManager.messageDelete(message);

            console.log(
                "✅ Log de mensagem apagada enviado."
            );

        } catch (error) {

            console.error(
                "❌ Erro no log de mensagem apagada:",
                error
            );

        }

    }

};