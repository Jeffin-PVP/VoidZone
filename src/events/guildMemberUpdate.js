const { Events } = require("discord.js");

const LogManager = require("../managers/LogManager");

module.exports = {

    name: Events.GuildMemberUpdate,

    async execute(oldMember, newMember) {

        /*
         * =====================================================
         * APELIDO ALTERADO
         * =====================================================
         */

        if (oldMember.nickname !== newMember.nickname) {

            try {

                await LogManager.memberNicknameUpdate(
                    oldMember,
                    newMember
                );

            } catch (error) {

                console.error(
                    "❌ Erro ao registrar alteração de apelido:",
                    error
                );

            }

        }


        /*
         * =====================================================
         * CARGO ADICIONADO
         * =====================================================
         */

        const addedRoles =
            newMember.roles.cache.filter(
                role =>
                    !oldMember.roles.cache.has(role.id)
            );


        for (const role of addedRoles.values()) {

            try {

                await LogManager.memberRoleAdd(
                    newMember,
                    role
                );

            } catch (error) {

                console.error(
                    "❌ Erro ao registrar cargo adicionado:",
                    error
                );

            }

        }


        /*
         * =====================================================
         * CARGO REMOVIDO
         * =====================================================
         */

        const removedRoles =
            oldMember.roles.cache.filter(
                role =>
                    !newMember.roles.cache.has(role.id)
            );


        for (const role of removedRoles.values()) {

            try {

                await LogManager.memberRoleRemove(
                    newMember,
                    role
                );

            } catch (error) {

                console.error(
                    "❌ Erro ao registrar cargo removido:",
                    error
                );

            }

        }

    }

};