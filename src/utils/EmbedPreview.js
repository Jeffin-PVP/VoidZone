const {
    EmbedBuilder
} = require("discord.js");


class EmbedPreview {


    static build(session) {

        const embed =
            new EmbedBuilder()
                .setColor(
                    session.color || "#5865F2"
                );


        if (session.title) {

            embed.setTitle(
                session.title
            );

        }


        if (session.description) {

            embed.setDescription(
                session.description
            );

        }


        if (session.author) {

            embed.setAuthor({

                name:
                    session.author.name,

                ...(session.author.iconURL
                    ? {
                        iconURL:
                            session.author.iconURL
                    }
                    : {}),

                ...(session.author.url
                    ? {
                        url:
                            session.author.url
                    }
                    : {})

            });

        }


        if (session.footer) {

            embed.setFooter({

                text:
                    session.footer.text,

                ...(session.footer.iconURL
                    ? {
                        iconURL:
                            session.footer.iconURL
                    }
                    : {})

            });

        }


        if (session.thumbnail) {

            embed.setThumbnail(
                session.thumbnail
            );

        }


        if (session.image) {

            embed.setImage(
                session.image
            );

        }


        if (session.timestamp) {

            embed.setTimestamp();

        }


        if (
            session.fields &&
            session.fields.length
        ) {

            embed.addFields(
                session.fields
            );

        }


        return embed;

    }

}


module.exports =
    EmbedPreview;