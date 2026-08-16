const fs = require("fs");
const path = require("path");

function commandHandler(client) {

    const commandsPath = path.join(
        __dirname,
        "../commands"
    );

    const categories = fs.readdirSync(commandsPath);

    for (const category of categories) {

        const categoryPath = path.join(
            commandsPath,
            category
        );

        if (!fs.statSync(categoryPath).isDirectory()) {
            continue;
        }

        const files = fs
            .readdirSync(categoryPath)
            .filter(file => file.endsWith(".js"));

        for (const file of files) {

            const command = require(
                path.join(categoryPath, file)
            );

            if (!command.data || !command.execute) {

                console.warn(
                    `⚠️ Comando inválido: ${file}`
                );

                continue;

            }

            client.commands.set(
                command.data.name,
                command
            );

            console.log(
                `📌 Comando carregado: ${command.data.name}`
            );

        }

    }

}

module.exports = commandHandler;