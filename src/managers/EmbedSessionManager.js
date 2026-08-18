const sessions = new Map();


class EmbedSessionManager {


    static create(userId, guildId, channelId) {

        const session = {

            userId,

            guildId,

            channelId,

            title: null,

            description:
                "Use os botões abaixo para configurar o embed.",

            color: "#5865F2",

            author: null,

            footer: null,

            thumbnail: null,

            image: null,

            timestamp: false,

            fields: []

        };


        sessions.set(
            userId,
            session
        );


        return session;

    }


    static get(userId) {

        return sessions.get(
            userId
        );

    }


    static update(userId, data) {

        const session =
            this.get(userId);


        if (!session) {
            return null;
        }


        Object.assign(
            session,
            data
        );


        return session;

    }


    static delete(userId) {

        return sessions.delete(
            userId
        );

    }


    static has(userId) {

        return sessions.has(
            userId
        );

    }


    static addField(userId, field) {

        const session =
            this.get(userId);


        if (!session) {
            return null;
        }


        session.fields.push(
            field
        );


        return field;

    }


    static updateField(
        userId,
        index,
        field
    ) {

        const session =
            this.get(userId);


        if (!session) {
            return null;
        }


        if (
            index < 0 ||
            index >= session.fields.length
        ) {

            return null;

        }


        session.fields[index] =
            field;


        return field;

    }


    static removeField(
        userId,
        index
    ) {

        const session =
            this.get(userId);


        if (!session) {
            return null;
        }


        if (
            index < 0 ||
            index >= session.fields.length
        ) {

            return null;

        }


        return session.fields.splice(
            index,
            1
        )[0];

    }

}


module.exports =
    EmbedSessionManager;