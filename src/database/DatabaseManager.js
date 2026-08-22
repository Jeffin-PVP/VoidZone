const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");


class DatabaseManager {


    constructor() {

        const databaseDirectory = path.join(
            __dirname,
            "../../database"
        );


        // Garante que a pasta database exista
        fs.mkdirSync(databaseDirectory, {
            recursive: true
        });


        const databasePath = path.join(
            databaseDirectory,
            "voidzone.db"
        );


        this.db =
            new Database(
                databasePath
            );


        this.db.pragma(
            "journal_mode = WAL"
        );


        console.log(
            "🗄️ Banco de dados conectado."
        );

    }


    /*
     * =====================================================
     * EXECUTAR SQL
     * =====================================================
     */

    exec(sql) {

        return this.db.exec(
            sql
        );

    }


    /*
     * =====================================================
     * PREPARE
     * =====================================================
     */

    prepare(sql) {

        return this.db.prepare(
            sql
        );

    }


    /*
     * =====================================================
     * GET
     * =====================================================
     */

    get(
        sql,
        params = []
    ) {

        return this.db
            .prepare(sql)
            .get(...params);

    }


    /*
     * =====================================================
     * ALL
     * =====================================================
     */

    all(
        sql,
        params = []
    ) {

        return this.db
            .prepare(sql)
            .all(...params);

    }


    /*
     * =====================================================
     * RUN
     * =====================================================
     */

    run(
        sql,
        params = []
    ) {

        return this.db
            .prepare(sql)
            .run(...params);

    }


    /*
     * =====================================================
     * TRANSACTION
     * =====================================================
     *
     * Permite executar várias operações no banco
     * como uma única transação.
     *
     * Se alguma operação falhar, tudo é revertido.
     */

    transaction(callback) {

        const transaction =
            this.db.transaction(
                callback
            );


        return transaction();

    }


    /*
     * =====================================================
     * FECHAR BANCO
     * =====================================================
     */

    close() {

        this.db.close();


        console.log(
            "🗄️ Banco de dados fechado."
        );

    }

}


module.exports =
    new DatabaseManager();