const {
    Events,
    AuditLogEvent
} = require("discord.js");

const LogManager =
    require("../managers/LogManager");

module.exports = {

    name: Events.GuildMemberUpdate,

    async execute(oldMember, newMember) {

        try {

            const oldTimeout =
                oldMember.communicationDisabledUntilTimestamp;

            const newTimeout =
                newMember.communicationDisabledUntilTimestamp;


            // ⏳ TIMEOUT APLICADO
            if (
                !oldTimeout &&
                newTimeout
            ) {

                await new Promise(resolve =>
                    setTimeout(resolve, 500)
                );


                const logs =
                    await newMember.guild.fetchAuditLogs({
                        type: AuditLogEvent.MemberUpdate,
                        limit: 10
                    });


                const entry =
                    logs.entries.find(entry =>

                        entry.target?.id ===
                        newMember.id &&

                        Date.now() -
                        entry.createdTimestamp <
                        5000

                    );


                await LogManager.memberTimeout({

                    guild:
                        newMember.guild,

                    target:
                        newMember.user,

                    moderator:
                        entry?.executor ||
                        newMember.guild.client.user,

                    reason:
                        entry?.reason ||
                        "Nenhum motivo informado.",

                    duration:
                        formatDuration(
                            newTimeout -
                            Date.now()
                        )

                });

            }


            // 🔓 TIMEOUT REMOVIDO
            if (
                oldTimeout &&
                !newTimeout
            ) {

                await new Promise(resolve =>
                    setTimeout(resolve, 500)
                );


                const logs =
                    await newMember.guild.fetchAuditLogs({
                        type: AuditLogEvent.MemberUpdate,
                        limit: 10
                    });


                const entry =
                    logs.entries.find(entry =>

                        entry.target?.id ===
                        newMember.id &&

                        Date.now() -
                        entry.createdTimestamp <
                        5000

                    );


                await LogManager.memberUntimeout({

                    guild:
                        newMember.guild,

                    target:
                        newMember.user,

                    moderator:
                        entry?.executor ||
                        newMember.guild.client.user,

                    reason:
                        entry?.reason ||
                        "Nenhum motivo informado."

                });

            }

        } catch (error) {

            console.error(
                "❌ Erro ao registrar alteração de membro:",
                error
            );

        }

    }

};


function formatDuration(milliseconds) {

    const totalMinutes =
        Math.max(
            1,
            Math.ceil(
                milliseconds / 60000
            )
        );


    const days =
        Math.floor(
            totalMinutes / 1440
        );


    const hours =
        Math.floor(
            (totalMinutes % 1440) / 60
        );


    const minutes =
        totalMinutes % 60;


    if (days > 0) {

        return `${days}d ${hours}h ${minutes}min`;

    }


    if (hours > 0) {

        return `${hours}h ${minutes}min`;

    }


    return `${minutes}min`;

}