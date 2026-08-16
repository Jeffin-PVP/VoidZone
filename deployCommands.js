require("dotenv").config();

const {
    REST,
    Routes
} = require("discord.js");

const fs = require("fs");
const path = require("path");


const commands = [];

const commandsPath = path.join(
    __dirname,
    "src/commands"
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

        if (!command.data) {
            continue;
        }

        commands.push(
            command.data.toJSON()
        );

    }

}


const rest = new REST({
    version: "10"
}).setToken(process.env.TOKEN);


async function deploy() {

    try {

        console.log(
            `🔄 Registrando ${commands.length} comando(s)...`
        );


        if (process.env.GUILD_ID) {

            await rest.put(

                Routes.applicationGuildCommands(
                    process.env.CLIENT_ID,
                    process.env.GUILD_ID
                ),

                {
                    body: commands
                }

            );

            console.log(
                "✅ Comandos registrados no servidor de testes."
            );

        } else {

            await rest.put(

                Routes.applicationCommands(
                    process.env.CLIENT_ID
                ),

                {
                    body: commands
                }

            );

            console.log(
                "✅ Comandos globais registrados."
            );

        }

    } catch (error) {

        console.error(
            "❌ Erro ao registrar comandos:",
            error
        );

    }

}


deploy();