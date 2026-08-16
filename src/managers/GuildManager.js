const database = require("../database/DatabaseManager");

class GuildManager {

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
                created_at
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                guild.id,
                "/",
                null,
                Date.now()
            ]
        );

        return this.get(guild.id);

    }


    static getOrCreate(guild) {

        let settings = this.get(guild.id);

        if (!settings) {

            settings = this.create(guild);

        }

        return settings;

    }


    static setLogChannel(guildId, channelId) {

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


    static getLogChannel(guildId) {

        const settings = this.get(guildId);

        return settings?.log_channel_id || null;

    }

}

module.exports = GuildManager;