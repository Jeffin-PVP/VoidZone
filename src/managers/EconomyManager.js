const database =
    require("../database/DatabaseManager");


class EconomyManager {


    /*
     * =====================================================
     * BUSCAR USUÁRIO
     * =====================================================
     */

    static get(
        userId,
        guildId
    ) {

        return database
            .prepare(`

                SELECT *

                FROM users

                WHERE id = ?
                AND guild_id = ?

            `)
            .get(
                userId,
                guildId
            );

    }


    /*
     * =====================================================
     * CRIAR / BUSCAR USUÁRIO
     * =====================================================
     */

    static getOrCreate(
        userId,
        guildId,
        username
    ) {

        let user =
            this.get(
                userId,
                guildId
            );


        if (user) {

            return user;

        }


        database
            .prepare(`

                INSERT INTO users (

                    id,
                    guild_id,
                    username,
                    coins,
                    bank_coins,
                    xp,
                    level,
                    created_at

                )

                VALUES (?, ?, ?, 0, 0, 0, 1, ?)

            `)
            .run(

                userId,
                guildId,
                username,
                Date.now()

            );


        return this.get(
            userId,
            guildId
        );

    }


    /*
     * =====================================================
     * ATUALIZAR NOME
     * =====================================================
     */

    static updateUsername(
        userId,
        guildId,
        username
    ) {

        database
            .prepare(`

                UPDATE users

                SET username = ?

                WHERE id = ?
                AND guild_id = ?

            `)
            .run(

                username,
                userId,
                guildId

            );

    }


    /*
     * =====================================================
     * DEPOSITAR
     * =====================================================
     */

    static deposit(
        userId,
        guildId,
        amount
    ) {

        if (
            !Number.isInteger(amount) ||
            amount <= 0
        ) {

            return {
                success: false,
                reason: "invalid_amount"
            };

        }


        const user =
            this.getOrCreate(
                userId,
                guildId,
                null
            );


        if (
            user.coins < amount
        ) {

            return {
                success: false,
                reason: "insufficient_wallet",
                user
            };

        }


        database.exec("BEGIN");


        try {

            database
                .prepare(`

                    UPDATE users

                    SET

                        coins = coins - ?,

                        bank_coins =
                            bank_coins + ?

                    WHERE id = ?
                    AND guild_id = ?

                `)
                .run(

                    amount,
                    amount,
                    userId,
                    guildId

                );


            this.addTransaction(

                guildId,
                userId,
                "deposit",

                amount,

                "Depósito no banco"

            );


            database.exec("COMMIT");


        } catch (error) {

            database.exec("ROLLBACK");

            throw error;

        }


        return {
            success: true,
            user: this.get(
                userId,
                guildId
            )
        };

    }


    /*
     * =====================================================
     * SACAR
     * =====================================================
     */

    static withdraw(
        userId,
        guildId,
        amount
    ) {

        if (
            !Number.isInteger(amount) ||
            amount <= 0
        ) {

            return {
                success: false,
                reason: "invalid_amount"
            };

        }


        const user =
            this.getOrCreate(
                userId,
                guildId,
                null
            );


        if (
            user.bank_coins < amount
        ) {

            return {
                success: false,
                reason: "insufficient_bank",
                user
            };

        }


        database.exec("BEGIN");


        try {

            database
                .prepare(`

                    UPDATE users

                    SET

                        bank_coins =
                            bank_coins - ?,

                        coins =
                            coins + ?

                    WHERE id = ?
                    AND guild_id = ?

                `)
                .run(

                    amount,
                    amount,
                    userId,
                    guildId

                );


            this.addTransaction(

                guildId,
                userId,
                "withdraw",

                amount,

                "Saque do banco"

            );


            database.exec("COMMIT");


        } catch (error) {

            database.exec("ROLLBACK");

            throw error;

        }


        return {
            success: true,
            user: this.get(
                userId,
                guildId
            )
        };

    }


    /*
     * =====================================================
     * TRANSFERIR
     * =====================================================
     */

    static transfer(
        fromUserId,
        toUserId,
        guildId,
        amount
    ) {

        if (
            !Number.isInteger(amount) ||
            amount <= 0
        ) {

            return {
                success: false,
                reason: "invalid_amount"
            };

        }


        if (
            fromUserId === toUserId
        ) {

            return {
                success: false,
                reason: "self_transfer"
            };

        }


        const sender =
            this.getOrCreate(
                fromUserId,
                guildId,
                null
            );


        const receiver =
            this.getOrCreate(
                toUserId,
                guildId,
                null
            );


        if (
            sender.coins < amount
        ) {

            return {
                success: false,
                reason: "insufficient_wallet"
            };

        }


        database.exec("BEGIN");


        try {

            database
                .prepare(`

                    UPDATE users

                    SET coins = coins - ?

                    WHERE id = ?
                    AND guild_id = ?

                `)
                .run(

                    amount,
                    fromUserId,
                    guildId

                );


            database
                .prepare(`

                    UPDATE users

                    SET coins = coins + ?

                    WHERE id = ?
                    AND guild_id = ?

                `)
                .run(

                    amount,
                    toUserId,
                    guildId

                );


            this.addTransaction(

                guildId,
                fromUserId,
                "transfer_sent",

                amount,

                `Transferência para ${toUserId}`

            );


            this.addTransaction(

                guildId,
                toUserId,
                "transfer_received",

                amount,

                `Transferência recebida de ${fromUserId}`

            );


            database.exec("COMMIT");


        } catch (error) {

            database.exec("ROLLBACK");

            throw error;

        }


        return {
            success: true,

            sender: this.get(
                fromUserId,
                guildId
            ),

            receiver: this.get(
                toUserId,
                guildId
            )

        };

    }


    /*
     * =====================================================
     * ADICIONAR MOEDAS
     * =====================================================
     */

    static addCoins(
        userId,
        guildId,
        amount,
        description = "Recompensa"
    ) {

        if (
            !Number.isInteger(amount) ||
            amount <= 0
        ) {

            return false;

        }


        this.getOrCreate(
            userId,
            guildId,
            null
        );


        database
            .prepare(`

                UPDATE users

                SET coins = coins + ?

                WHERE id = ?
                AND guild_id = ?

            `)
            .run(

                amount,
                userId,
                guildId

            );


        this.addTransaction(

            guildId,
            userId,
            "income",

            amount,
            description

        );


        return true;

    }


    /*
     * =====================================================
     * REMOVER MOEDAS
     * =====================================================
     */

    static removeCoins(
        userId,
        guildId,
        amount,
        description = "Remoção de moedas"
    ) {

        if (
            !Number.isInteger(amount) ||
            amount <= 0
        ) {

            return false;

        }


        const user =
            this.getOrCreate(
                userId,
                guildId,
                null
            );


        if (
            user.coins < amount
        ) {

            return false;

        }


        database
            .prepare(`

                UPDATE users

                SET coins = coins - ?

                WHERE id = ?
                AND guild_id = ?

            `)
            .run(

                amount,
                userId,
                guildId

            );


        this.addTransaction(

            guildId,
            userId,
            "expense",

            amount,
            description

        );


        return true;

    }


    /*
     * =====================================================
     * REGISTRAR TRANSAÇÃO
     * =====================================================
     */

    static addTransaction(

        guildId,
        userId,
        type,
        amount,
        description

    ) {

        database
            .prepare(`

                INSERT INTO transactions (

                    guild_id,
                    user_id,
                    type,
                    amount,
                    description,
                    created_at

                )

                VALUES (?, ?, ?, ?, ?, ?)

            `)
            .run(

                guildId,
                userId,
                type,
                amount,
                description,
                Date.now()

            );

    }


    /*
     * =====================================================
     * HISTÓRICO
     * =====================================================
     */

    static getTransactions(
        userId,
        guildId,
        limit = 10
    ) {

        return database
            .prepare(`

                SELECT *

                FROM transactions

                WHERE user_id = ?
                AND guild_id = ?

                ORDER BY created_at DESC

                LIMIT ?

            `)
            .all(

                userId,
                guildId,
                limit

            );

    }

}


module.exports =
    EconomyManager;