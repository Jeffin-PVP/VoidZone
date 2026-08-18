const {
    WebhookClient,
    EmbedBuilder
} = require("discord.js");

const GuildManager = require("./GuildManager");


class LogManager {


    /**
     * Obtém/cria o webhook do canal de logs.
     *
     * type:
     * "normal"      -> canal de logs normais
     * "moderation"  -> canal de logs de moderação
     */
    static async getWebhook(guild, type = "normal") {

        const channelId =
            type === "moderation"
                ? GuildManager.getModLogChannel(guild.id)
                : GuildManager.getLogChannel(guild.id);


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

                        name:
                            type === "moderation"
                                ? "VoidZone ModLogs"
                                : "VoidZone Logs",

                        avatar:
                            guild.client.user.displayAvatarURL()

                    });

            }


            return new WebhookClient({

                id:
                    webhook.id,

                token:
                    webhook.token

            });


        } catch (error) {

            console.error(
                "❌ Erro ao obter webhook de logs:",
                error
            );

            return null;

        }

    }


    /**
     * Envia um embed para o canal correspondente.
     *
     * type:
     * "normal"      -> logs normais
     * "moderation"  -> logs de moderação
     */
    static async send(
        guild,
        embed,
        type = "normal"
    ) {

        const webhook =
            await this.getWebhook(
                guild,
                type
            );


        if (!webhook) {
            return;
        }


        try {

            await webhook.send({

                username:
                    type === "moderation"
                        ? "VoidZone ModLogs"
                        : "VoidZone Logs",

                avatarURL:
                    guild.client.user.displayAvatarURL(),

                embeds: [
                    embed
                ]

            });


        } catch (error) {

            console.error(
                "❌ Erro ao enviar log:",
                error
            );

        }

    }


    /**
     * =====================================================
     * LOGS NORMAIS
     * =====================================================
     */


    /**
     * Membro entrou no servidor.
     */
    static async memberJoin(member) {

        const createdTimestamp =
            Math.floor(
                member.user.createdTimestamp / 1000
            );


        const joinedTimestamp =
            member.joinedTimestamp
                ? Math.floor(member.joinedTimestamp / 1000)
                : Math.floor(Date.now() / 1000);


        const embed =
            new EmbedBuilder()

                .setColor("#57F287")

                .setTitle(
                    "📥 Membro entrou"
                )

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
                                .filter(
                                    role =>
                                        role.id !== member.guild.id
                                )
                                .map(
                                    role =>
                                        role.toString()
                                )
                                .slice(0, 10)
                                .join(", ") ||
                            "Nenhum",

                        inline: true
                    }

                )

                .setTimestamp()

                .setFooter({
                    text:
                        "VoidZone Logs • Entrada"
                });


        await this.send(
            member.guild,
            embed,
            "normal"
        );

    }


    /**
     * Membro saiu do servidor.
     */
    static async memberLeave(member) {

        const createdTimestamp =
            Math.floor(
                member.user.createdTimestamp / 1000
            );


        const leftTimestamp =
            Math.floor(Date.now() / 1000);


        const joinedTimestamp =
            member.joinedTimestamp
                ? Math.floor(
                    member.joinedTimestamp / 1000
                )
                : null;


        let duration =
            "Desconhecido";


        if (joinedTimestamp) {

            const difference =
                Date.now() -
                (
                    joinedTimestamp *
                    1000
                );


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


        const embed =
            new EmbedBuilder()

                .setColor("#ED4245")

                .setTitle(
                    "📤 Membro saiu"
                )

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
                                .filter(
                                    role =>
                                        role.id !== member.guild.id
                                )
                                .map(
                                    role =>
                                        role.toString()
                                )
                                .slice(0, 10)
                                .join(", ") ||
                            "Nenhum",

                        inline: false
                    }

                )

                .setTimestamp()

                .setFooter({
                    text:
                        "VoidZone Logs • Saída"
                });


        await this.send(
            member.guild,
            embed,
            "normal"
        );

    }


    /**
     * =====================================================
     * LOGS DE MODERAÇÃO
     * =====================================================
     */


    /**
     * Log genérico de moderação.
     */
    static async moderation({

        guild,
        action,
        target,
        moderator,
        reason,
        color,
        icon

    }) {

        const embed =
            new EmbedBuilder()

                .setColor(color)

                .setTitle(
                    `${icon} ${action}`
                )

                .setThumbnail(
                    target.displayAvatarURL({
                        size: 512
                    })
                )

                .addFields(

                    {
                        name:
                            "👤 Usuário afetado",

                        value:
                            `${target.tag}\n` +
                            `\`${target.id}\``,

                        inline: true
                    },

                    {
                        name:
                            "🛡️ Moderador",

                        value:
                            `${moderator.tag}\n` +
                            `\`${moderator.id}\``,

                        inline: true
                    },

                    {
                        name:
                            "📝 Motivo",

                        value:
                            reason ||
                            "Nenhum motivo informado.",

                        inline: false
                    }

                )

                .setTimestamp()

                .setFooter({
                    text:
                        `VoidZone ModLogs • ${action}`
                });


        await this.send(
            guild,
            embed,
            "moderation"
        );

    }


    /**
     * BAN
     */
    static async memberBan({

        guild,
        target,
        moderator,
        reason

    }) {

        await this.moderation({

            guild,

            action:
                "BAN",

            icon:
                "🔨",

            color:
                "#ED4245",

            target,

            moderator,

            reason

        });

    }


    /**
     * KICK
     */
    static async memberKick({

        guild,
        target,
        moderator,
        reason

    }) {

        await this.moderation({

            guild,

            action:
                "KICK",

            icon:
                "👢",

            color:
                "#FEE75C",

            target,

            moderator,

            reason

        });

    }


    /**
     * TIMEOUT
     */
    static async memberTimeout({

        guild,
        target,
        moderator,
        reason,
        duration

    }) {

        await this.moderation({

            guild,

            action:
                "TIMEOUT",

            icon:
                "⏳",

            color:
                "#FEE75C",

            target,

            moderator,

            reason:
                `${reason}\n\n⏱️ Duração: ${duration}`

        });

    }


    /**
     * UNTIMEOUT
     */
    static async memberUntimeout({

        guild,
        target,
        moderator,
        reason

    }) {

        await this.moderation({

            guild,

            action:
                "UNTIMEOUT",

            icon:
                "🔓",

            color:
                "#57F287",

            target,

            moderator,

            reason

        });

    }


    /**
     * CLEAR
     */
    static async messageClear({

        guild,
        channel,
        moderator,
        amount

    }) {

        const embed =
            new EmbedBuilder()

                .setColor("#5865F2")

                .setTitle(
                    "🧹 MENSAGENS APAGADAS"
                )

                .addFields(

                    {
                        name:
                            "🛡️ Moderador",

                        value:
                            `${moderator.tag}\n` +
                            `\`${moderator.id}\``,

                        inline: true
                    },

                    {
                        name:
                            "📢 Canal",

                        value:
                            `${channel}\n` +
                            `\`${channel.id}\``,

                        inline: true
                    },

                    {
                        name:
                            "🗑️ Quantidade",

                        value:
                            `${amount} mensagem(ns)`,

                        inline: true
                    }

                )

                .setTimestamp()

                .setFooter({
                    text:
                        "VoidZone ModLogs • Clear"
                });


        await this.send(
            guild,
            embed,
            "moderation"
        );

    }


    /**
     * LOCK
     */
    static async channelLock({

        guild,
        channel,
        moderator,
        reason

    }) {

        const embed =
            new EmbedBuilder()

                .setColor("#ED4245")

                .setTitle(
                    "🔒 CANAL BLOQUEADO"
                )

                .addFields(

                    {
                        name:
                            "📢 Canal",

                        value:
                            `${channel}\n` +
                            `\`${channel.id}\``,

                        inline: true
                    },

                    {
                        name:
                            "🛡️ Moderador",

                        value:
                            `${moderator.tag}\n` +
                            `\`${moderator.id}\``,

                        inline: true
                    },

                    {
                        name:
                            "📝 Motivo",

                        value:
                            reason,

                        inline: false
                    }

                )

                .setTimestamp()

                .setFooter({
                    text:
                        "VoidZone ModLogs • Lock"
                });


        await this.send(
            guild,
            embed,
            "moderation"
        );

    }


    /**
     * UNLOCK
     */
    static async channelUnlock({

        guild,
        channel,
        moderator,
        reason

    }) {

        const embed =
            new EmbedBuilder()

                .setColor("#57F287")

                .setTitle(
                    "🔓 CANAL DESBLOQUEADO"
                )

                .addFields(

                    {
                        name:
                            "📢 Canal",

                        value:
                            `${channel}\n` +
                            `\`${channel.id}\``,

                        inline: true
                    },

                    {
                        name:
                            "🛡️ Moderador",

                        value:
                            `${moderator.tag}\n` +
                            `\`${moderator.id}\``,

                        inline: true
                    },

                    {
                        name:
                            "📝 Motivo",

                        value:
                            reason,

                        inline: false
                    }

                )

                .setTimestamp()

                .setFooter({
                    text:
                        "VoidZone ModLogs • Unlock"
                });


        await this.send(
            guild,
            embed,
            "moderation"
        );

    }


    /**
     * WARN
     */
    static async warning({

        guild,
        user,
        moderator,
        reason,
        warningId,
        total

    }) {

        const embed =
            new EmbedBuilder()

                .setColor("#FEE75C")

                .setTitle(
                    "⚠️ ADVERTÊNCIA APLICADA"
                )

                .setThumbnail(
                    user.displayAvatarURL({
                        size: 256
                    })
                )

                .addFields(

                    {
                        name:
                            "👤 Usuário",

                        value:
                            `${user.tag}\n` +
                            `\`${user.id}\``,

                        inline: true
                    },

                    {
                        name:
                            "🛡️ Moderador",

                        value:
                            `${moderator.tag}\n` +
                            `\`${moderator.id}\``,

                        inline: true
                    },

                    {
                        name:
                            "🔢 Advertência",

                        value:
                            `#${warningId}\n` +
                            `Total: ${total}`,

                        inline: true
                    },

                    {
                        name:
                            "📝 Motivo",

                        value:
                            reason,

                        inline: false
                    }

                )

                .setTimestamp()

                .setFooter({
                    text:
                        "VoidZone ModLogs • Warn"
                });


        await this.send(
            guild,
            embed,
            "moderation"
        );

    }


    /**
     * UNWARN
     */
    static async warningRemoved({

        guild,
        user,
        moderator,
        warning,
        remaining

    }) {

        const embed =
            new EmbedBuilder()

                .setColor("#57F287")

                .setTitle(
                    "🗑️ ADVERTÊNCIA REMOVIDA"
                )

                .setThumbnail(

                    user

                        ? user.displayAvatarURL({
                            size: 256
                        })

                        : null

                )

                .addFields(

                    {
                        name:
                            "👤 Usuário",

                        value:

                            user

                                ? `${user.tag}\n\`${user.id}\``

                                : `ID: \`${warning.user_id}\``,

                        inline: true
                    },

                    {
                        name:
                            "🛡️ Moderador",

                        value:
                            `${moderator.tag}\n` +
                            `\`${moderator.id}\``,

                        inline: true
                    },

                    {
                        name:
                            "🔢 Advertência",

                        value:
                            `#${warning.id}`,

                        inline: true
                    },

                    {
                        name:
                            "📝 Motivo original",

                        value:
                            warning.reason ||
                            "Nenhum motivo informado.",

                        inline: false
                    },

                    {
                        name:
                            "📊 Warns restantes",

                        value:
                            `${remaining}`,

                        inline: true
                    }

                )

                .setTimestamp()

                .setFooter({
                    text:
                        "VoidZone ModLogs • Unwarn"
                });


        await this.send(
            guild,
            embed,
            "moderation"
        );

    }


    /**
     * CLEAR WARNS
     */
    static async warningsCleared({

        guild,
        user,
        moderator,
        removed

    }) {

        const embed =
            new EmbedBuilder()

                .setColor("#ED4245")

                .setTitle(
                    "🗑️ TODOS OS WARNS REMOVIDOS"
                )

                .setThumbnail(

                    user

                        ? user.displayAvatarURL({
                            size: 256
                        })

                        : null

                )

                .addFields(

                    {
                        name:
                            "👤 Usuário",

                        value:

                            user

                                ? `${user.tag}\n\`${user.id}\``

                                : "Usuário desconhecido",

                        inline: true
                    },

                    {
                        name:
                            "🛡️ Moderador",

                        value:
                            `${moderator.tag}\n` +
                            `\`${moderator.id}\``,

                        inline: true
                    },

                    {
                        name:
                            "🗑️ Advertências removidas",

                        value:
                            `${removed}`,

                        inline: true
                    }

                )

                .setTimestamp()

                .setFooter({
                    text:
                        "VoidZone ModLogs • Clear Warns"
                });


        await this.send(
            guild,
            embed,
            "moderation"
        );

    }

    /**
 * =====================================================
 * LOGS DE MENSAGENS
 * =====================================================
 */

    /**
     * Mensagem apagada.
     */
    static async messageDelete(message) {

        const content =
            message.content?.trim() ||
            "*Conteúdo não disponível.*";


        const embed =
            new EmbedBuilder()

                .setColor("#ED4245")

                .setTitle(
                    "🗑️ MENSAGEM APAGADA"
                )

                .setThumbnail(
                    message.author?.displayAvatarURL({
                        size: 256
                    }) || null
                )

                .addFields(

                    {
                        name: "👤 Autor",

                        value:
                            message.author
                                ? `${message.author.tag}\n\`${message.author.id}\``
                                : "Autor desconhecido",

                        inline: true
                    },

                    {
                        name: "📢 Canal",

                        value:
                            `${message.channel}\n\`${message.channel.id}\``,

                        inline: true
                    },

                    {
                        name: "📅 Enviada",

                        value:
                            message.createdTimestamp
                                ? `<t:${Math.floor(
                                    message.createdTimestamp / 1000
                                )}:F>`
                                : "Desconhecido",

                        inline: false
                    },

                    {
                        name: "💬 Conteúdo",

                        value:
                            content.length > 1024
                                ? `${content.slice(0, 1021)}...`
                                : content,

                        inline: false
                    }

                );


        if (message.attachments?.size) {

            embed.addFields({

                name: "📎 Anexos",

                value:
                    message.attachments
                        .map(
                            attachment =>
                                `[${attachment.name}](${attachment.url})`
                        )
                        .join("\n")
                        .slice(0, 1024)

            });

        }


        embed

            .setTimestamp()

            .setFooter({
                text:
                    "VoidZone Logs • Mensagem apagada"
            });


        await this.send(
            message.guild,
            embed,
            "normal"
        );

    }


    /**
     * Mensagem editada.
     */
    static async messageUpdate(
        oldMessage,
        newMessage
    ) {

        const oldContent =
            oldMessage.content?.trim() ||
            "*Conteúdo não disponível.*";


        const newContent =
            newMessage.content?.trim() ||
            "*Conteúdo não disponível.*";


        const embed =
            new EmbedBuilder()

                .setColor("#FEE75C")

                .setTitle(
                    "✏️ MENSAGEM EDITADA"
                )

                .setThumbnail(
                    newMessage.author?.displayAvatarURL({
                        size: 256
                    }) || null
                )

                .addFields(

                    {
                        name: "👤 Autor",

                        value:
                            newMessage.author
                                ? `${newMessage.author.tag}\n\`${newMessage.author.id}\``
                                : "Autor desconhecido",

                        inline: true
                    },

                    {
                        name: "📢 Canal",

                        value:
                            `${newMessage.channel}\n\`${newMessage.channel.id}\``,

                        inline: true
                    },

                    {
                        name: "🕐 Editada",

                        value:
                            `<t:${Math.floor(
                                Date.now() / 1000
                            )}:F>`,

                        inline: false
                    },

                    {
                        name: "📝 Antes",

                        value:
                            oldContent.length > 1024
                                ? `${oldContent.slice(0, 1021)}...`
                                : oldContent,

                        inline: false
                    },

                    {
                        name: "✏️ Depois",

                        value:
                            newContent.length > 1024
                                ? `${newContent.slice(0, 1021)}...`
                                : newContent,

                        inline: false
                    }

                );


        if (newMessage.url) {

            embed.addFields({

                name: "🔗 Mensagem",

                value:
                    `[Ir para a mensagem](${newMessage.url})`

            });

        }


        embed

            .setTimestamp()

            .setFooter({
                text:
                    "VoidZone Logs • Mensagem editada"
            });


        await this.send(
            newMessage.guild,
            embed,
            "normal"
        );

    }

    static async memberNicknameUpdate(
        oldMember,
        newMember
    ) {

        const oldNickname =
            oldMember.nickname || oldMember.user.username;

        const newNickname =
            newMember.nickname || newMember.user.username;


        const embed =
            new EmbedBuilder()

                .setColor("#5865F2")

                .setTitle(
                    "🏷️ APELIDO ALTERADO"
                )

                .setThumbnail(
                    newMember.user.displayAvatarURL({
                        size: 256
                    })
                )

                .addFields(

                    {
                        name: "👤 Membro",

                        value:
                            `${newMember.user.tag}\n\`${newMember.id}\``,

                        inline: true
                    },

                    {
                        name: "📢 Canal",

                        value:
                            "Alteração de membro",

                        inline: true
                    },

                    {
                        name: "⬅️ Antes",

                        value:
                            oldNickname,

                        inline: false
                    },

                    {
                        name: "➡️ Depois",

                        value:
                            newNickname,

                        inline: false
                    }

                )

                .setTimestamp()

                .setFooter({
                    text:
                        "VoidZone Logs • Apelido alterado"
                });


        await this.send(
            newMember.guild,
            embed,
            "normal"
        );

    }

    static async memberRoleAdd(
        member,
        role
    ) {

        const embed =
            new EmbedBuilder()

                .setColor("#57F287")

                .setTitle(
                    "➕ CARGO ADICIONADO"
                )

                .setThumbnail(
                    member.user.displayAvatarURL({
                        size: 256
                    })
                )

                .addFields(

                    {
                        name: "👤 Membro",

                        value:
                            `${member.user.tag}\n\`${member.id}\``,

                        inline: true
                    },

                    {
                        name: "🎭 Cargo",

                        value:
                            `${role}\n\`${role.id}\``,

                        inline: true
                    },

                    {
                        name: "🕐 Horário",

                        value:
                            `<t:${Math.floor(
                                Date.now() / 1000
                            )}:F>`,

                        inline: false
                    }

                )

                .setTimestamp()

                .setFooter({
                    text:
                        "VoidZone Logs • Cargo adicionado"
                });


        await this.send(
            member.guild,
            embed,
            "normal"
        );

    }

    static async memberRoleRemove(
        member,
        role
    ) {

        const embed =
            new EmbedBuilder()

                .setColor("#ED4245")

                .setTitle(
                    "➖ CARGO REMOVIDO"
                )

                .setThumbnail(
                    member.user.displayAvatarURL({
                        size: 256
                    })
                )

                .addFields(

                    {
                        name: "👤 Membro",

                        value:
                            `${member.user.tag}\n\`${member.id}\``,

                        inline: true
                    },

                    {
                        name: "🎭 Cargo",

                        value:
                            `${role}\n\`${role.id}\``,

                        inline: true
                    },

                    {
                        name: "🕐 Horário",

                        value:
                            `<t:${Math.floor(
                                Date.now() / 1000
                            )}:F>`,

                        inline: false
                    }

                )

                .setTimestamp()

                .setFooter({
                    text:
                        "VoidZone Logs • Cargo removido"
                });


        await this.send(
            member.guild,
            embed,
            "normal"
        );

    }

}


module.exports = LogManager;