const database = require("../database/DatabaseManager");

class UserManager {

    static create(user, guildId) {

        const existing = this.get(user.id, guildId);

        if (existing) {
            return existing;
        }

        const now = Date.now();

        database.run(
            `
            INSERT INTO users (
                id,
                guild_id,
                username,
                coins,
                xp,
                level,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                user.id,
                guildId,
                user.username,
                0,
                0,
                1,
                now
            ]
        );

        return this.get(user.id, guildId);
    }


    static get(userId, guildId) {

        return database.get(
            `
            SELECT *
            FROM users
            WHERE id = ?
            AND guild_id = ?
            `,
            [
                userId,
                guildId
            ]
        );
    }


    static getOrCreate(user, guildId) {

        let profile = this.get(
            user.id,
            guildId
        );

        if (!profile) {

            profile = this.create(
                user,
                guildId
            );

        }

        return profile;
    }


    static updateUsername(user) {

        database.run(
            `
            UPDATE users
            SET username = ?
            WHERE id = ?
            `,
            [
                user.username,
                user.id
            ]
        );

    }


    static addXP(userId, guildId, amount) {

        database.run(
            `
            UPDATE users
            SET xp = xp + ?
            WHERE id = ?
            AND guild_id = ?
            `,
            [
                amount,
                userId,
                guildId
            ]
        );

    }


    static addCoins(userId, guildId, amount) {

        database.run(
            `
            UPDATE users
            SET coins = coins + ?
            WHERE id = ?
            AND guild_id = ?
            `,
            [
                amount,
                userId,
                guildId
            ]
        );

    }

}

module.exports = UserManager;