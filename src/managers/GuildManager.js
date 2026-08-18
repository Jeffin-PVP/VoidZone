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
                lockdown_enabled,
                created_at
            )

            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                guild.id,
                "/",
                null,
                null,
                0,
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


    /**
     * Define o estado do lockdown.
     *
     * true  = lockdown ativo
     * false = lockdown desativado
     */
    static setLockdown(
        guildId,
        enabled
    ) {

        database.run(
            `
            UPDATE guild_settings

            SET lockdown_enabled = ?

            WHERE guild_id = ?
            `,
            [
                enabled ? 1 : 0,
                guildId
            ]
        );

    }


    /**
     * Verifica se o servidor está em lockdown.
     *
     * Retorna:
     * true  = ativo
     * false = desativado
     */
    static isLockdownEnabled(
        guildId
    ) {

        const settings =
            this.get(guildId);


        return Boolean(
            settings?.lockdown_enabled
        );

    }


}


module.exports = GuildManager;