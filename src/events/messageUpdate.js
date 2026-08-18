const { Events } = require("discord.js");

const LogManager = require("../managers/LogManager");

module.exports = {

    name: Events.MessageUpdate,

    async execute(oldMessage, newMessage) {

        if (!newMessage.guild) {
            return;
        }

        if (newMessage.author?.bot) {
            return;
        }

        if (oldMessage.content === newMessage.content) {
            return;
        }

        await LogManager.messageUpdate(
            oldMessage,
            newMessage
        );

    }

};