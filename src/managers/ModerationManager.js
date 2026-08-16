class ModerationManager {

    static async ban(member, reason = "Nenhum motivo informado.") {

        if (!member.bannable) {
            throw new Error(
                "Não é possível banir este usuário."
            );
        }

        await member.ban({
            reason
        });

    }


    static async kick(member, reason = "Nenhum motivo informado.") {

        if (!member.kickable) {
            throw new Error(
                "Não é possível expulsar este usuário."
            );
        }

        await member.kick(
            reason
        );

    }


    static async timeout(
        member,
        duration,
        reason = "Nenhum motivo informado."
    ) {

        if (!member.moderatable) {
            throw new Error(
                "Não é possível aplicar timeout neste usuário."
            );
        }

        await member.timeout(
            duration,
            reason
        );

    }


    static async removeTimeout(
        member,
        reason = "Timeout removido."
    ) {

        if (!member.moderatable) {
            throw new Error(
                "Não é possível remover o timeout deste usuário."
            );
        }

        await member.timeout(
            null,
            reason
        );

    }


    static async unban(guild, userId, reason) {

        await guild.members.unban(
            userId,
            reason
        );

    }

}

module.exports = ModerationManager;