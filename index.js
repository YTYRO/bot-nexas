const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, SlashCommandBuilder } = require('discord.js');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ] 
});

const RATING_CHANNEL_ID = '1544823060580794520';

client.once('clientReady', async () => {
    console.log(`🚀 Ticket & Embed Dashboard is live at port ${port}`);
    console.log(`Logged in as ${client.user.tag}`);

    const rateCommand = new SlashCommandBuilder()
        .setName('rate')
        .setDescription('إنشاء تقييم جديد للخدمة');

    client.guilds.cache.forEach(async guild => {
        try {
            await guild.commands.create(rateCommand);
            console.log(`✅ Registered /rate command in guild: ${guild.name}`);
        } catch (error) {
            console.error(`❌ Failed to register command in ${guild.name}:`, error);
        }
    });
});
