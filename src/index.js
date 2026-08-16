require("dotenv").config();

const {
    Client,
    Collection,
    GatewayIntentBits
} = require("discord.js");

const migrate = require("./database/migrations");

const commandHandler = require("./handlers/commandHandler");
const eventHandler = require("./handlers/eventHandler");


if (!process.env.TOKEN) {

    console.error("❌ TOKEN não encontrado no .env");

    process.exit(1);

}


migrate();


const client = new Client({

    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]

});


client.commands = new Collection();


commandHandler(client);
eventHandler(client);


client.login(process.env.TOKEN);