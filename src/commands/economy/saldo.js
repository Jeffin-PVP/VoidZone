const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


const EconomyManager =
    require("../../managers/EconomyManager");


module.exports = {

    data:

        new SlashCommandBuilder()

            .setName("saldo")

            .setDescription(
                "Veja seu saldo de moedas."
            ),


    async execute(interaction) {

        const user =
            EconomyManager.getOrCreate(

                interaction.user.id,

                interaction.guild.id,

                interaction.user.username

            );


        const embed =
            new EmbedBuilder()

                .setTitle("💰 Seu saldo")

                .setDescription(

                    `**${interaction.user.username}**, ` +
                    `você possui:\n\n` +

                    `💰 **${user.coins.toLocaleString("pt-BR")} moedas**`

                )

                .setColor("#FFD700")

                .setThumbnail(
                    interaction.user.displayAvatarURL({
                        dynamic: true
                    })
                );


        await interaction.editReply({

            embeds: [
                embed
            ]

        });

    }

};