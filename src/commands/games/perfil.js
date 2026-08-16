const {
    SlashCommandBuilder
} = require("discord.js");

const EmbedManager = require("../../utils/EmbedManager");
const UserManager = require("../../managers/UserManager");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("perfil")

        .setDescription("Veja o perfil de um jogador.")

        .addUserOption(option =>
            option
                .setName("usuario")
                .setDescription("Jogador que deseja consultar.")
                .setRequired(false)
        ),


    async execute(interaction) {

        const target =
            interaction.options.getUser("usuario")
            || interaction.user;


        const profile = UserManager.getOrCreate(
            target,
            interaction.guild.id
        );


        const embed = EmbedManager.voidzone()

            .setTitle(`👤 Perfil de ${target.username}`)

            .setThumbnail(
                target.displayAvatarURL({
                    size: 1024
                })
            )

            .addFields(

                {
                    name: "⭐ Nível",
                    value: `${profile.level}`,
                    inline: true
                },

                {
                    name: "✨ XP",
                    value: `${profile.xp}`,
                    inline: true
                },

                {
                    name: "💰 VoidCoins",
                    value: `${profile.coins}`,
                    inline: true
                },

                {
                    name: "🆔 ID",
                    value: target.id,
                    inline: false
                }

            )

            .setFooter({
                text: "VoidZone • Perfil do jogador"
            });


        await interaction.editReply({
            embeds: [embed]
        });

    }

};