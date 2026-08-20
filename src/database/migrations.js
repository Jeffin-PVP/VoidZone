const database = require("./DatabaseManager");


function migrate() {

    /*
     * =====================================================
     * TABELAS PRINCIPAIS
     * =====================================================
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

            lockdown_enabled INTEGER DEFAULT 0,

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


        /*
         * Canais que devem continuar acessíveis
         * durante o lockdown.
         */

        CREATE TABLE IF NOT EXISTS lockdown_channels (

            guild_id TEXT NOT NULL,

            channel_id TEXT NOT NULL,

            PRIMARY KEY (
                guild_id,
                channel_id
            )

        );


        /*
         * Permissões originais dos canais
         * antes do lockdown.
         */

        CREATE TABLE IF NOT EXISTS lockdown_permissions (

            guild_id TEXT NOT NULL,

            channel_id TEXT NOT NULL,

            permissions TEXT NOT NULL,

            PRIMARY KEY (
                guild_id,
                channel_id
            )

        );


        /*
         * =================================================
         * CONFIGURAÇÃO DO SISTEMA DE TICKETS
         * =================================================
         */

        CREATE TABLE IF NOT EXISTS ticket_settings (

            guild_id TEXT PRIMARY KEY,

            panel_channel_id TEXT NOT NULL,

            category_id TEXT NOT NULL,

            support_role_id TEXT NOT NULL,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP

        );


        /*
         * =================================================
         * CONFIGURAÇÃO DO SISTEMA DE BOAS VINDAS
         * =================================================
         */


        CREATE TABLE IF NOT EXISTS welcome_settings (

            guild_id TEXT PRIMARY KEY,

            channel_id TEXT NOT NULL,

            enabled INTEGER DEFAULT 1,

            created_at INTEGER NOT NULL

        );


    `);


    /*
     * =====================================================
     * MIGRAÇÕES DE ESTRUTURA
     * =====================================================
     *
     * CREATE TABLE IF NOT EXISTS não altera uma tabela
     * que já existe.
     *
     * Por isso verificamos individualmente se as colunas
     * necessárias já existem.
     */


    const columns = database
        .prepare(`
            PRAGMA table_info(guild_settings)
        `)
        .all();


    /*
     * =====================================================
     * mod_log_channel_id
     * =====================================================
     */

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


    /*
     * =====================================================
     * lockdown_enabled
     * =====================================================
     */

    const hasLockdownEnabled =
        columns.some(
            column =>
                column.name === "lockdown_enabled"
        );


    if (!hasLockdownEnabled) {

        database.exec(`
            ALTER TABLE guild_settings
            ADD COLUMN lockdown_enabled INTEGER DEFAULT 0
        `);


        console.log(
            "🔄 Coluna lockdown_enabled adicionada."
        );

    }


    /*
     * =====================================================
     * FINAL
     * =====================================================
     */

    console.log(
        "📦 Migrations executadas."
    );

}


module.exports = migrate;