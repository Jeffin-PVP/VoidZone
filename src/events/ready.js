const { Events } = require("discord.js");

module.exports = {

    name: Events.ClientReady,

    once: true,

    execute(client) {

        console.log("");
        console.log("=================================");
        console.log("🌌 VOIDZONE ONLINE");
        console.log("=================================");
        console.log(`🤖 Bot: ${client.user.tag}`);
        console.log(`🆔 ID: ${client.user.id}`);
        console.log(`🌐 Servidores: ${client.guilds.cache.size}`);
        console.log("=================================");
        console.log("");

        client.user.setPresence({

            activities: [
                {
                    name: "seu universo de jogos",
                    type: 0
                }
            ],

            status: "online"

        });

    }

};