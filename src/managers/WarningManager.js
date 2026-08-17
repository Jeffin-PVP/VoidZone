const database = require("../database/DatabaseManager");


class WarningManager {

    /**
     * Adiciona uma advertência.
     */
    static add({
        guildId,
        userId,
        moderatorId,
        reason
    }) {

        const result = database.prepare(`
            INSERT INTO warnings (
                guild_id,
                user_id,
                moderator_id,
                reason,
                created_at
            )

            VALUES (?, ?, ?, ?, ?)
        `).run(
            guildId,
            userId,
            moderatorId,
            reason,
            Date.now()
        );


        return result.lastInsertRowid;

    }


    /**
     * Busca uma advertência específica.
     */
    static getById(id) {

        return database.prepare(`
            SELECT *
            FROM warnings
            WHERE id = ?
        `).get(id);

    }


    /**
     * Busca todos os warns de um usuário
     * dentro de um servidor.
     */
    static getUserWarnings(
        guildId,
        userId
    ) {

        return database.prepare(`
            SELECT *
            FROM warnings

            WHERE guild_id = ?
            AND user_id = ?

            ORDER BY created_at DESC
        `).all(
            guildId,
            userId
        );

    }


    /**
     * Busca todas as advertências de um servidor.
     */
    static getGuildWarnings(guildId) {

        return database.prepare(`
            SELECT *
            FROM warnings

            WHERE guild_id = ?

            ORDER BY created_at DESC
        `).all(
            guildId
        );

    }


    /**
     * Conta os warns de um usuário.
     */
    static count(
        guildId,
        userId
    ) {

        const result = database.prepare(`
            SELECT COUNT(*) AS total

            FROM warnings

            WHERE guild_id = ?
            AND user_id = ?
        `).get(
            guildId,
            userId
        );


        return result.total;

    }


    /**
     * Remove uma advertência específica.
     *
     * Retorna os dados do warn removido.
     *
     * Retorna null caso o warn não exista
     * ou não pertença ao servidor.
     */
    static remove(
        id,
        guildId
    ) {

        const warning = database.prepare(`
            SELECT *
            FROM warnings

            WHERE id = ?
            AND guild_id = ?
        `).get(
            id,
            guildId
        );


        if (!warning) {

            return null;

        }


        database.prepare(`
            DELETE FROM warnings

            WHERE id = ?
            AND guild_id = ?
        `).run(
            id,
            guildId
        );


        return warning;

    }


    /**
     * Remove todos os warns de um usuário
     * dentro de um servidor.
     */
    static clearUserWarnings(
        guildId,
        userId
    ) {

        const result = database.prepare(`
            DELETE FROM warnings

            WHERE guild_id = ?
            AND user_id = ?
        `).run(
            guildId,
            userId
        );


        return result.changes;

    }

}


module.exports = WarningManager;