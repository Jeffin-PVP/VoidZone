const database = require("./DatabaseManager");


function migrate() {

    /*
     * Tabelas principais
     */
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

            mod_log_channel_id TEXT,

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

        CREATE TABLE IF NOT EXISTS lockdown_channels (

            guild_id TEXT NOT NULL,

            channel_id TEXT NOT NULL,

            PRIMARY KEY (
                guild_id,
                channel_id
            )

        );

        CREATE TABLE IF NOT EXISTS lockdown_permissions (

            guild_id TEXT NOT NULL,

            channel_id TEXT NOT NULL,

            permissions TEXT NOT NULL,

            PRIMARY KEY (
                guild_id,
                channel_id
            )

        );

    `);


    /*
     * =====================================================
     * MIGRATIONS DE ESTRUTURA
     * =====================================================
     *
     * O CREATE TABLE IF NOT EXISTS acima não altera
     * tabelas que já existem.
     *
     * Por isso verificamos se a coluna já existe antes
     * de adicioná-la.
     */


    const columns = database
        .prepare(`
            PRAGMA table_info(guild_settings)
        `)
        .all();


    const hasModLogChannel =
        columns.some(
            column =>
                column.name === "mod_log_channel_id"
        );


    if (!hasModLogChannel) {

        database.exec(`
            ALTER TABLE guild_settings
            ADD COLUMN mod_log_channel_id TEXT
        `);


        console.log(
            "🔄 Coluna mod_log_channel_id adicionada."
        );

    }




    console.log(
        "📦 Migrations executadas."
    );

}


module.exports = migrate;