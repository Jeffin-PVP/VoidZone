const database = require("../database/DatabaseManager");


class GuildManager {


    /**
     * Busca as configurações do servidor.
     */
    static get(guildId) {

        return database.get(
            `
            SELECT *
            FROM guild_settings
            WHERE guild_id = ?
            `,
            [guildId]
        );

    }


    /**
     * Cria as configurações do servidor.
     */
    static create(guild) {

        const existing = this.get(guild.id);

        if (existing) {
            return existing;
        }


        database.run(
            `
            INSERT INTO guild_settings (
                guild_id,
                prefix,
                log_channel_id,
                mod_log_channel_id,
                created_at
            )

            VALUES (?, ?, ?, ?, ?)
            `,
            [
                guild.id,
                "/",
                null,
                null,
                Date.now()
            ]
        );


        return this.get(guild.id);

    }


    /**
     * Busca as configurações.
     * Se não existirem, cria.
     */
    static getOrCreate(guild) {

        let settings =
            this.get(guild.id);


        if (!settings) {

            settings =
                this.create(guild);

        }


        return settings;

    }


    /**
     * Define o canal de logs normais.
     */
    static setLogChannel(
        guildId,
        channelId
    ) {

        database.run(
            `
            UPDATE guild_settings

            SET log_channel_id = ?

            WHERE guild_id = ?
            `,
            [
                channelId,
                guildId
            ]
        );

    }


    /**
     * Obtém o canal de logs normais.
     */
    static getLogChannel(guildId) {

        const settings =
            this.get(guildId);


        return (
            settings?.log_channel_id ||
            null
        );

    }


    /**
     * Define o canal de logs de moderação.
     */
    static setModLogChannel(
        guildId,
        channelId
    ) {

        database.run(
            `
            UPDATE guild_settings

            SET mod_log_channel_id = ?

            WHERE guild_id = ?
            `,
            [
                channelId,
                guildId
            ]
        );

    }


    /**
     * Obtém o canal de logs de moderação.
     */
    static getModLogChannel(guildId) {

        const settings =
            this.get(guildId);


        return (
            settings?.mod_log_channel_id ||
            null
        );

    }

}


module.exports = GuildManager;