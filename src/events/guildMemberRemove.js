const {
    Events,
    AuditLogEvent
} = require("discord.js");

const LogManager =
    require("../managers/LogManager");

module.exports = {

    name: Events.GuildMemberRemove,

    async execute(member) {

        try {

            const guild = member.guild;

            // Pequeno atraso para garantir que
            // o Audit Log tenha sido atualizado.
            await new Promise(resolve =>
                setTimeout(resolve, 1000)
            );


            const auditLogs =
                await guild.fetchAuditLogs({
                    limit: 10
                });


            const entry =
                auditLogs.entries.find(entry => {

                    return (

                        entry.target?.id === member.id &&

                        Date.now() -
                        entry.createdTimestamp <
                        5000

                    );

                });


            if (entry) {

                // 🔨 BAN
                if (
                    entry.action ===
                    AuditLogEvent.MemberBanAdd
                ) {

                    await LogManager.memberBan({

                        guild,

                        target: member.user,

                        moderator:
                            entry.executor,

                        reason:
                            entry.reason ||
                            "Nenhum motivo informado."

                    });

                    return;

                }


                // 👢 KICK
                if (
                    entry.action ===
                    AuditLogEvent.MemberKick
                ) {

                    await LogManager.memberKick({

                        guild,

                        target: member.user,

                        moderator:
                            entry.executor,

                        reason:
                            entry.reason ||
                            "Nenhum motivo informado."

                    });

                    return;

                }

            }


            // 📤 Saída normal
            await LogManager.memberLeave(
                member
            );


        } catch (error) {

            console.error(
                "❌ Erro ao identificar saída do membro:",
                error
            );

            // Se não conseguirmos consultar o Audit Log,
            // registramos como saída normal.
            await LogManager.memberLeave(
                member
            );

        }

    }

};