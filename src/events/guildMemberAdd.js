const { Events, EmbedBuilder } = require("discord.js");


const GuildManager =
    require("../managers/GuildManager");


const LogManager =
    require("../managers/LogManager");


const WelcomeManager =
    require("../managers/WelcomeManager");


module.exports = {

    name: Events.GuildMemberAdd,


    async execute(member) {

        try {

            /*
             * =================================================
             * REGISTRAR ENTRADA DO MEMBRO
             * =================================================
             */

            GuildManager.getOrCreate(
                member.guild
            );


            await LogManager.memberJoin(
                member
            );


            /*
             * =================================================
             * SISTEMA DE BOAS-VINDAS
             * =================================================
             */

            const welcomeConfig =
                WelcomeManager.getConfig(
                    member.guild.id
                );


            /*
             * Sistema não configurado
             */

            if (!welcomeConfig) {
                return;
            }


            /*
             * Sistema desativado
             */

            if (!welcomeConfig.enabled) {
                return;
            }


            /*
             * =================================================
             * BUSCAR CANAL
             * =================================================
             */

            const welcomeChannel =
                member.guild.channels.cache.get(
                    welcomeConfig.channel_id
                );


            if (!welcomeChannel) {

                console.log(
                    `⚠️ Canal de boas-vindas não encontrado no servidor ${member.guild.name}.`
                );

                return;

            }


            /*
             * =================================================
             * EMBED DE BOAS-VINDAS
             * =================================================
             */

            const embed =
                new EmbedBuilder()

                    .setTitle(
                        "🎉 Bem-vindo(a)!"
                    )

                    .setDescription(

                        `Olá ${member}! 👋\n\n` +

                        `Seja muito bem-vindo(a) ao **${member.guild.name}**!\n\n` +

                        "Esperamos que você se divirta por aqui. " +
                        "Leia as regras e aproveite o servidor! 🚀"

                    )

                    .setColor(
                        "#5865F2"
                    )

                    .setThumbnail(

                        member.user.displayAvatarURL({

                            extension: "png",

                            size: 256

                        })

                    )

                    .setFooter({

                        text:
                            `Membro #${member.guild.memberCount}`

                    })

                    .setTimestamp();


            /*
             * =================================================
             * ENVIAR BOAS-VINDAS
             * =================================================
             */

            await welcomeChannel.send({

                content:
                    `${member}`,

                embeds: [
                    embed
                ]

            });


            console.log(
                `🎉 Boas-vindas enviadas para ${member.user.tag}.`
            );


        } catch (error) {

            console.error(
                "❌ Erro ao processar entrada de membro:",
                error
            );

        }

    }

};