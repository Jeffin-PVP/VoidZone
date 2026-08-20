const DatabaseManager =
    require("../database/DatabaseManager");


class WelcomeManager {


    /*
     * =====================================================
     * BUSCAR CONFIGURAÇÃO
     * =====================================================
     */

    static getConfig(guildId) {

        return DatabaseManager
            .prepare(`

                SELECT *

                FROM welcome_settings

                WHERE guild_id = ?

            `)
            .get(guildId);

    }


    /*
     * =====================================================
     * SALVAR CONFIGURAÇÃO
     * =====================================================
     */

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
                        excluded.channel_id,

                    enabled =
                        1

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
     * ATIVAR / DESATIVAR
     * =====================================================
     */

    static setEnabled(
        guildId,
        enabled
    ) {

        DatabaseManager
            .prepare(`

                UPDATE welcome_settings

                SET enabled = ?

                WHERE guild_id = ?

            `)
            .run(

                enabled ? 1 : 0,
                guildId

            );


        return this.getConfig(
            guildId
        );

    }


    /*
     * =====================================================
     * REMOVER CONFIGURAÇÃO
     * =====================================================
     */

    static deleteConfig(
        guildId
    ) {

        return DatabaseManager
            .prepare(`

                DELETE FROM welcome_settings

                WHERE guild_id = ?

            `)
            .run(guildId);

    }


    /*
     * =====================================================
     * VERIFICAR CONFIGURAÇÃO
     * =====================================================
     */

    static isConfigured(
        guildId
    ) {

        return !!this.getConfig(
            guildId
        );

    }

}


module.exports =
    WelcomeManager;