const DatabaseManager =
    require("../database/DatabaseManager");


class TicketManager {


    /*
     * =====================================================
     * BUSCAR CONFIGURAÇÃO
     * =====================================================
     */

    static getConfig(guildId) {

        return DatabaseManager
            .prepare(`

                SELECT *

                FROM ticket_settings

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

        panelChannelId,

        categoryId,

        supportRoleId

    ) {

        DatabaseManager
            .prepare(`

                INSERT INTO ticket_settings (

                    guild_id,

                    panel_channel_id,

                    category_id,

                    support_role_id

                )

                VALUES (?, ?, ?, ?)

                ON CONFLICT(guild_id)

                DO UPDATE SET

                    panel_channel_id =
                        excluded.panel_channel_id,

                    category_id =
                        excluded.category_id,

                    support_role_id =
                        excluded.support_role_id

            `)
            .run(

                guildId,

                panelChannelId,

                categoryId,

                supportRoleId

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

                DELETE FROM ticket_settings

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
    TicketManager;