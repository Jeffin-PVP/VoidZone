const database = require("./DatabaseManager");


function migrate() {

    database.exec(`

        CREATE TABLE IF NOT EXISTS guilds (

            id TEXT PRIMARY KEY,

            name TEXT,

            created_at INTEGER NOT NULL

        );


        CREATE TABLE IF NOT EXISTS users (

            id TEXT NOT NULL,

            guild_id TEXT NOT NULL,

            username TEXT,

            coins INTEGER DEFAULT 0,

            xp INTEGER DEFAULT 0,

            level INTEGER DEFAULT 1,

            created_at INTEGER NOT NULL,

            PRIMARY KEY (id, guild_id)

        );


        CREATE TABLE IF NOT EXISTS guild_settings (

            guild_id TEXT PRIMARY KEY,

            prefix TEXT DEFAULT '/',

            log_channel_id TEXT,

            created_at INTEGER NOT NULL

        );


        CREATE TABLE IF NOT EXISTS warnings (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            guild_id TEXT NOT NULL,

            user_id TEXT NOT NULL,

            moderator_id TEXT NOT NULL,

            reason TEXT NOT NULL,

            created_at INTEGER NOT NULL

        );

    `);


    console.log("📦 Migrations executadas.");

}


module.exports = migrate;