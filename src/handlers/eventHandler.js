const fs = require("fs");
const path = require("path");

function eventHandler(client) {

    const eventsPath = path.join(
        __dirname,
        "../events"
    );

    const files = fs
        .readdirSync(eventsPath)
        .filter(file => file.endsWith(".js"));

    for (const file of files) {

        const event = require(
            path.join(eventsPath, file)
        );

        if (!event.name || !event.execute) {

            console.warn(
                `⚠️ Evento inválido: ${file}`
            );

            continue;

        }

        if (event.once) {

            client.once(
                event.name,
                (...args) => event.execute(...args)
            );

        } else {

            client.on(
                event.name,
                (...args) => event.execute(...args)
            );

        }

        console.log(
            `⚡ Evento carregado: ${event.name}`
        );

    }

}

module.exports = eventHandler;