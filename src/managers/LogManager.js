const {
    WebhookClient,
    EmbedBuilder
} = require("discord.js");

const GuildManager = require("./GuildManager");

class LogManager {

    static async getWebhook(guild) {

        const channelId =
            GuildManager.getLogChannel(guild.id);

        if (!channelId) {
            return null;
        }

        const channel =
            guild.channels.cache.get(channelId);

        if (!channel) {
            return null;
        }

        try {

            const webhooks =
                await channel.fetchWebhooks();

            let webhook =
                webhooks.find(
                    webhook =>
                        webhook.owner?.id === guild.client.user.id
                );

            if (!webhook) {

                webhook =
                    await channel.createWebhook({
                        name: "VoidZone Logs",
                        avatar: guild.client.user.displayAvatarURL()
                    });

            }

            return new WebhookClient({
                id: webhook.id,
                token: webhook.token
            });

        } catch (error) {

            console.error(
                "❌ Erro ao obter webhook de logs:",
                error
            );

            return null;

        }

    }


    static async send(guild, embed) {

        const webhook =
            await this.getWebhook(guild);

        if (!webhook) {
            return;
        }

        try {

            await webhook.send({
                username: "VoidZone Logs",
                avatarURL:
                    guild.client.user.displayAvatarURL(),
                embeds: [embed]
            });

        } catch (error) {

            console.error(
                "❌ Erro ao enviar log:",
                error
            );

        }

    }


    static async memberJoin(member) {

        const createdTimestamp =
            Math.floor(
                member.user.createdTimestamp / 1000
            );

        const joinedTimestamp =
            member.joinedTimestamp
                ? Math.floor(member.joinedTimestamp / 1000)
                : Math.floor(Date.now() / 1000);


        const embed = new EmbedBuilder()

            .setColor("#57F287")

            .setTitle("📥 Membro entrou")

            .setDescription(
                `${member.user} entrou no servidor.`
            )

            .setThumbnail(
                member.user.displayAvatarURL({
                    size: 512
                })
            )

            .addFields(

                {
                    name: "👤 Identidade",

                    value:
                        `**Usuário:** ${member.user.tag}\n` +
                        `**ID:** \`${member.id}\`\n` +
                        `**Bot:** ${member.user.bot ? "Sim" : "Não"}`,

                    inline: true
                },

                {
                    name: "📅 Conta",

                    value:
                        `**Criada em:** <t:${createdTimestamp}:F>\n` +
                        `**Idade:** <t:${createdTimestamp}:R>`,

                    inline: true
                },

                {
                    name: "📥 Entrada",

                    value:
                        `**Entrou em:** <t:${joinedTimestamp}:F>\n` +
                        `**Horário:** <t:${joinedTimestamp}:T>`,

                    inline: false
                },

                {
                    name: "👥 Servidor",

                    value:
                        `**Membros:** ${member.guild.memberCount}\n` +
                        `**Servidor:** ${member.guild.name}`,

                    inline: true
                },

                {
                    name: "🎭 Cargos",

                    value:
                        member.roles.cache
                            .filter(role => role.id !== member.guild.id)
                            .map(role => role.toString())
                            .slice(0, 10)
                            .join(", ") || "Nenhum",

                    inline: true
                }

            )

            .setTimestamp()

            .setFooter({
                text: "VoidZone Logs • Entrada"
            });


        await this.send(
            member.guild,
            embed
        );

    }


    static async memberLeave(member) {

        const createdTimestamp =
            Math.floor(
                member.user.createdTimestamp / 1000
            );


        const leftTimestamp =
            Math.floor(Date.now() / 1000);


        const joinedTimestamp =
            member.joinedTimestamp
                ? Math.floor(member.joinedTimestamp / 1000)
                : null;


        let duration = "Desconhecido";


        if (joinedTimestamp) {

            const difference =
                Date.now() -
                (joinedTimestamp * 1000);


            const seconds =
                Math.floor(
                    difference / 1000
                );


            const days =
                Math.floor(
                    seconds / 86400
                );

            const hours =
                Math.floor(
                    (seconds % 86400) / 3600
                );

            const minutes =
                Math.floor(
                    (seconds % 3600) / 60
                );


            duration =
                `${days}d ${hours}h ${minutes}min`;

        }


        const embed = new EmbedBuilder()

            .setColor("#ED4245")

            .setTitle("📤 Membro saiu")

            .setDescription(
                `${member.user.tag} saiu do servidor.`
            )

            .setThumbnail(
                member.user.displayAvatarURL({
                    size: 512
                })
            )

            .addFields(

                {
                    name: "👤 Identidade",

                    value:
                        `**Usuário:** ${member.user.tag}\n` +
                        `**ID:** \`${member.id}\`\n` +
                        `**Bot:** ${member.user.bot ? "Sim" : "Não"}`,

                    inline: true
                },

                {
                    name: "📅 Conta",

                    value:
                        `**Criada em:** <t:${createdTimestamp}:F>\n` +
                        `**Idade:** <t:${createdTimestamp}:R>`,

                    inline: true
                },

                {
                    name: "📤 Saída",

                    value:
                        `**Saiu em:** <t:${leftTimestamp}:F>\n` +
                        `**Horário:** <t:${leftTimestamp}:T>`,

                    inline: false
                },

                {
                    name: "⏱️ Permanência",

                    value:
                        duration,

                    inline: true
                },

                {
                    name: "👥 Servidor",

                    value:
                        `**Membros restantes:** ${member.guild.memberCount}\n` +
                        `**Servidor:** ${member.guild.name}`,

                    inline: true
                },

                {
                    name: "🎭 Cargos",

                    value:
                        member.roles.cache
                            .filter(role => role.id !== member.guild.id)
                            .map(role => role.toString())
                            .slice(0, 10)
                            .join(", ") || "Nenhum",

                    inline: false
                }

            )

            .setTimestamp()

            .setFooter({
                text: "VoidZone Logs • Saída"
            });


        await this.send(
            member.guild,
            embed
        );

    }

    static async moderation({
        guild,
        action,
        target,
        moderator,
        reason,
        color,
        icon
    }) {

        const embed = new EmbedBuilder()

            .setColor(color)

            .setTitle(`${icon} ${action}`)

            .setThumbnail(
                target.displayAvatarURL({
                    size: 512
                })
            )

            .addFields(

                {
                    name: "👤 Usuário afetado",
                    value:
                        `${target.tag}\n` +
                        `\`${target.id}\``,
                    inline: true
                },

                {
                    name: "🛡️ Moderador",
                    value:
                        `${moderator.tag}\n` +
                        `\`${moderator.id}\``,
                    inline: true
                },

                {
                    name: "📝 Motivo",
                    value:
                        reason || "Nenhum motivo informado.",
                    inline: false
                }

            )

            .setTimestamp()

            .setFooter({
                text: `VoidZone Logs • ${action}`
            });


        await this.send(
            guild,
            embed
        );

    }

    static async memberBan({
        guild,
        target,
        moderator,
        reason
    }) {

        await this.moderation({

            guild,

            action: "BAN",

            icon: "🔨",

            color: "#ED4245",

            target,

            moderator,

            reason

        });

    }


    static async memberKick({
        guild,
        target,
        moderator,
        reason
    }) {

        await this.moderation({

            guild,

            action: "KICK",

            icon: "👢",

            color: "#FEE75C",

            target,

            moderator,

            reason

        });

    }


    static async memberTimeout({
        guild,
        target,
        moderator,
        reason,
        duration
    }) {

        await this.moderation({

            guild,

            action: "TIMEOUT",

            icon: "⏳",

            color: "#FEE75C",

            target,

            moderator,

            reason: `${reason}\n\n⏱️ Duração: ${duration}`

        });

    }


    static async memberUntimeout({
        guild,
        target,
        moderator,
        reason
    }) {

        await this.moderation({

            guild,

            action: "UNTIMEOUT",

            icon: "🔓",

            color: "#57F287",

            target,

            moderator,

            reason

        });

    }

    static async messageClear({
        guild,
        channel,
        moderator,
        amount
    }) {

        const embed = new EmbedBuilder()

            .setColor("#5865F2")

            .setTitle("🧹 MENSAGENS APAGADAS")

            .addFields(

                {
                    name: "🛡️ Moderador",
                    value:
                        `${moderator.tag}\n` +
                        `\`${moderator.id}\``,
                    inline: true
                },

                {
                    name: "📢 Canal",
                    value:
                        `${channel}\n` +
                        `\`${channel.id}\``,
                    inline: true
                },

                {
                    name: "🗑️ Quantidade",
                    value:
                        `${amount} mensagem(ns)`,
                    inline: true
                }

            )

            .setTimestamp()

            .setFooter({
                text: "VoidZone Logs • Clear"
            });


        await this.send(
            guild,
            embed
        );

    }

    static async channelLock({
        guild,
        channel,
        moderator,
        reason
    }) {

        const embed = new EmbedBuilder()

            .setColor("#ED4245")

            .setTitle("🔒 CANAL BLOQUEADO")

            .addFields(

                {
                    name: "📢 Canal",
                    value:
                        `${channel}\n` +
                        `\`${channel.id}\``,
                    inline: true
                },

                {
                    name: "🛡️ Moderador",
                    value:
                        `${moderator.tag}\n` +
                        `\`${moderator.id}\``,
                    inline: true
                },

                {
                    name: "📝 Motivo",
                    value:
                        reason,
                    inline: false
                }

            )

            .setTimestamp()

            .setFooter({
                text: "VoidZone Logs • Lock"
            });


        await this.send(
            guild,
            embed
        );

    }


    static async channelUnlock({
        guild,
        channel,
        moderator,
        reason
    }) {

        const embed = new EmbedBuilder()

            .setColor("#57F287")

            .setTitle("🔓 CANAL DESBLOQUEADO")

            .addFields(

                {
                    name: "📢 Canal",
                    value:
                        `${channel}\n` +
                        `\`${channel.id}\``,
                    inline: true
                },

                {
                    name: "🛡️ Moderador",
                    value:
                        `${moderator.tag}\n` +
                        `\`${moderator.id}\``,
                    inline: true
                },

                {
                    name: "📝 Motivo",
                    value:
                        reason,
                    inline: false
                }

            )

            .setTimestamp()

            .setFooter({
                text: "VoidZone Logs • Unlock"
            });


        await this.send(
            guild,
            embed
        );

    }

}

module.exports = LogManager;