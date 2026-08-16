const { EmbedBuilder } = require("discord.js");

class EmbedManager {

    static base() {

        return new EmbedBuilder()
            .setColor("#7B2CFF")
            .setTimestamp();

    }


    static success(description) {

        return this.base()
            .setColor("#57F287")
            .setDescription(`✅ ${description}`);

    }


    static error(description) {

        return this.base()
            .setColor("#ED4245")
            .setDescription(`❌ ${description}`);

    }


    static info(description) {

        return this.base()
            .setColor("#5865F2")
            .setDescription(`ℹ️ ${description}`);

    }


    static warning(description) {

        return this.base()
            .setColor("#FEE75C")
            .setDescription(`⚠️ ${description}`);

    }


    static voidzone() {

        return this.base()
            .setTitle("🌌 VoidZone");

    }

}

module.exports = EmbedManager;