const database = require("../database/DatabaseManager");


class LockdownManager {


    /**
     * =====================================================
     * CANAIS LIBERADOS DURANTE O LOCKDOWN
     * =====================================================
     */


    /**
     * Adiciona um canal à lista de canais liberados.
     */
    static addChannel(
        guildId,
        channelId
    ) {

        const result = database.run(
            `
            INSERT OR IGNORE INTO lockdown_channels (
                guild_id,
                channel_id
            )

            VALUES (?, ?)
            `,
            [
                guildId,
                channelId
            ]
        );


        return result.changes > 0;

    }


    /**
     * Remove um canal da lista.
     */
    static removeChannel(
        guildId,
        channelId
    ) {

        const result = database.run(
            `
            DELETE FROM lockdown_channels

            WHERE guild_id = ?
            AND channel_id = ?
            `,
            [
                guildId,
                channelId
            ]
        );


        return result.changes > 0;

    }


    /**
     * Verifica se um canal está liberado.
     */
    static isAllowedChannel(
        guildId,
        channelId
    ) {

        const result = database.get(
            `
            SELECT channel_id

            FROM lockdown_channels

            WHERE guild_id = ?
            AND channel_id = ?
            `,
            [
                guildId,
                channelId
            ]
        );


        return !!result;

    }


    /**
     * Retorna todos os canais liberados.
     */
    static getAllowedChannels(
        guildId
    ) {

        return database.all(
            `
            SELECT channel_id

            FROM lockdown_channels

            WHERE guild_id = ?
            `,
            [
                guildId
            ]
        );

    }


    /**
     * Retorna apenas os IDs dos canais.
     */
    static getAllowedChannelIds(
        guildId
    ) {

        return this
            .getAllowedChannels(guildId)
            .map(
                channel =>
                    channel.channel_id
            );

    }


    /**
     * Remove todos os canais configurados.
     */
    static clearChannels(
        guildId
    ) {

        const result = database.run(
            `
            DELETE FROM lockdown_channels

            WHERE guild_id = ?
            `,
            [
                guildId
            ]
        );


        return result.changes;

    }

    /**
 * =====================================================
 * PERMISSÕES DO LOCKDOWN
 * =====================================================
 */

    /**
     * Salva as permissões originais de um canal.
     */
    static saveChannelPermissions(
        guildId,
        channelId,
        permissions
    ) {

        database.run(
            `
        INSERT OR REPLACE INTO lockdown_permissions (
            guild_id,
            channel_id,
            permissions
        )

        VALUES (?, ?, ?)
        `,
            [
                guildId,
                channelId,
                JSON.stringify(permissions)
            ]
        );

    }


    /**
     * Obtém as permissões salvas de um canal.
     */
    static getChannelPermissions(
        guildId,
        channelId
    ) {

        const result =
            database.get(
                `
            SELECT permissions

            FROM lockdown_permissions

            WHERE guild_id = ?
            AND channel_id = ?
            `,
                [
                    guildId,
                    channelId
                ]
            );


        if (!result) {
            return null;
        }


        return JSON.parse(
            result.permissions
        );

    }


    /**
     * Remove as permissões salvas de um canal.
     */
    static removeChannelPermissions(
        guildId,
        channelId
    ) {

        database.run(
            `
        DELETE FROM lockdown_permissions

        WHERE guild_id = ?
        AND channel_id = ?
        `,
            [
                guildId,
                channelId
            ]
        );

    }


    /**
     * Remove todas as permissões salvas
     * do servidor.
     */
    static clearSavedPermissions(
        guildId
    ) {

        database.run(
            `
        DELETE FROM lockdown_permissions

        WHERE guild_id = ?
        `,
            [
                guildId
            ]
        );

    }

    /**
 * =====================================================
 * ESTADO DO LOCKDOWN
 * =====================================================
 */

    static isActive(guildId) {

        const result = database.get(
            `
        SELECT COUNT(*) AS total

        FROM lockdown_permissions

        WHERE guild_id = ?
        `,
            [guildId]
        );

        return result.total > 0;

    }


    /**
     * Salva as permissões atuais de um canal.
     */
    static saveChannelPermissions(
        guildId,
        channelId,
        permissions
    ) {

        database.run(
            `
        INSERT OR REPLACE INTO lockdown_permissions (
            guild_id,
            channel_id,
            permissions
        )

        VALUES (?, ?, ?)
        `,
            [
                guildId,
                channelId,
                JSON.stringify(permissions)
            ]
        );

    }


    /**
     * Obtém as permissões salvas.
     */
    static getChannelPermissions(
        guildId,
        channelId
    ) {

        const result = database.get(
            `
        SELECT permissions

        FROM lockdown_permissions

        WHERE guild_id = ?
        AND channel_id = ?
        `,
            [
                guildId,
                channelId
            ]
        );

        if (!result) {
            return null;
        }

        return JSON.parse(
            result.permissions
        );

    }


    /**
     * Remove as permissões salvas.
     */
    static removeChannelPermissions(
        guildId,
        channelId
    ) {

        database.run(
            `
        DELETE FROM lockdown_permissions

        WHERE guild_id = ?
        AND channel_id = ?
        `,
            [
                guildId,
                channelId
            ]
        );

    }


    /**
     * Limpa todo o estado salvo do lockdown.
     */
    static clearSavedPermissions(
        guildId
    ) {

        database.run(
            `
        DELETE FROM lockdown_permissions

        WHERE guild_id = ?
        `,
            [guildId]
        );

    }


}


module.exports = LockdownManager;