const DatabaseManager =
    require("../database/DatabaseManager");


class WelcomeManager {


    static getConfig(guildId) {

        return DatabaseManager
            .prepare(`
                SELECT *
                FROM welcome_settings
                WHERE guild_id = ?
            `)
            .get(guildId);

    }


    static saveConfig(
        guildId,
        channelId
    ) {

        DatabaseManager
            .prepare(`

            INSERT INTO welcome_settings (

                guild_id,
                channel_id,
                enabled,
                created_at

            )

            VALUES (?, ?, 1, ?)

            ON CONFLICT(guild_id)

            DO UPDATE SET

                channel_id =
                    excluded.channel_id

        `)
            .run(

                guildId,
                channelId,

                Date.now()

            );


        return this.getConfig(
            guildId
        );

    }


    /*
     * =====================================================
     * ATIVAR
     * =====================================================
     */

    static enable(guildId) {

        return DatabaseManager
            .prepare(`

                UPDATE welcome_settings

                SET enabled = 1

                WHERE guild_id = ?

            `)
            .run(guildId);

    }


    /*
     * =====================================================
     * DESATIVAR
     * =====================================================
     */

    static disable(guildId) {

        return DatabaseManager
            .prepare(`

                UPDATE welcome_settings

                SET enabled = 0

                WHERE guild_id = ?

            `)
            .run(guildId);

    }


    /*
     * =====================================================
     * VERIFICAR SE ESTÁ ATIVO
     * =====================================================
     */

    static isEnabled(guildId) {

        const config =
            this.getConfig(guildId);

        return !!(
            config &&
            config.enabled === 1
        );

    }


    static deleteConfig(guildId) {

        return DatabaseManager
            .prepare(`

                DELETE FROM welcome_settings

                WHERE guild_id = ?

            `)
            .run(guildId);

    }


    static isConfigured(guildId) {

        return !!this.getConfig(
            guildId
        );

    }

}


module.exports =
    WelcomeManager;