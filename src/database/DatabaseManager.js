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

        this.db = new Database(databasePath);

        this.db.pragma("journal_mode = WAL");

        console.log("🗄️ Banco de dados conectado.");

    }


    exec(sql) {

        return this.db.exec(sql);

    }


    prepare(sql) {

        return this.db.prepare(sql);

    }


    get(sql, params = []) {

        return this.db
            .prepare(sql)
            .get(...params);

    }


    all(sql, params = []) {

        return this.db
            .prepare(sql)
            .all(...params);

    }


    run(sql, params = []) {

        return this.db
            .prepare(sql)
            .run(...params);

    }


    close() {

        this.db.close();

        console.log("🗄️ Banco de dados fechado.");

    }

}


module.exports = new DatabaseManager();