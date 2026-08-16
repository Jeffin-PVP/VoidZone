const { Events } = require("discord.js");

const GuildManager = require("../managers/GuildManager");
const LogManager = require("../managers/LogManager");

module.exports = {

    name: Events.GuildMemberAdd,

    async execute(member) {

        try {

            GuildManager.getOrCreate(
                member.guild
            );

            await LogManager.memberJoin(
                member
            );

        } catch (error) {

            console.error(
                "❌ Erro ao registrar entrada de membro:",
                error
            );

        }

    }

};