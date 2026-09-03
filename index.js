const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, SlashCommandBuilder } = require('discord.js');
const express = require('express');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent 
    ] 
});

// ID روم التقييمات
const RATING_CHANNEL_ID = '1544823060580794520';

// تسجيل أمر rate لكل سيرفر فوراً عند اشتغال البوت
client.once('ready', async () => {
    console.log(`🚀 Ticket & Embed Dashboard is live at http://localhost:${port}`);
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

// صفحة لوحة التحكم الاحترافية مع نظام التذاكر
app.get('/', (req, res) => {
    let guildOptions = '<option value="">-- اختر السيرفر والروم أولاً --</option>';
    client.guilds.cache.forEach(guild => {
        guild.channels.cache.filter(c => c.isTextBased()).forEach(channel => {
            guildOptions += `<option value="${channel.id}">[${guild.name}] #${channel.name}</option>`;
        });
    });

    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>NEXAS STORE - Dashboard & Tickets</title>
            <style>
                body { background-color: #0f172a; color: #f8fafc; font-family: Tahoma, sans-serif; margin: 0; padding: 20px; display: flex; justify-content: center; }
                .wrapper { display: flex; gap: 20px; width: 1100px; max-width: 100%; }
                .panel { background-color: #1e293b; padding: 20px; border-radius: 12px; flex: 1.2; box-shadow: 0 4px 20px rgba(0,0,0,0.5); max-height: 90vh; overflow-y: auto; }
                .preview-box { background-color: #1e293b; padding: 20px; border-radius: 12px; flex: 0.8; height: fit-content; position: sticky; top: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
                h2, h3 { color: #38bdf8; text-align: center; margin-top: 0; }
                label { display: block; margin-top: 10px; font-size: 13px; color: #cbd5e1; }
                input[type="text"], input[type="color"], select, textarea { width: 100%; background-color: #0f172a; color: #fff; border: 1px solid #334155; border-radius: 6px; padding: 8px; font-size: 13px; margin-top: 4px; box-sizing: border-box; }
                textarea { height: 80px; resize: none; }
                .row { display: flex; gap: 10px; }
                .row > div { flex: 1; }
                button { background-color: #6366f1; color: white; border: none; padding: 12px; font-size: 15px; border-radius: 6px; cursor: pointer; width: 100%; font-weight: bold; margin-top: 20px; }
                button:hover { background-color: #4f46e5; }
                
                .discord-embed { background: #2f3136; border-left: 4px solid #5865F2; padding: 12px; border-radius: 4px; font-family: sans-serif; margin-top: 10px; font-size: 14px; }
                .d-title { font-weight: bold; color: #fff; margin-bottom: 6px; font-size: 15px; }
                .d-desc { color: #dcddde; font-size: 13px; white-space: pre-wrap; margin-bottom: 8px; }
                .d-footer { font-size: 11px; color: #b9bbbe; margin-top: 8px; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="panel">
                    <h2>🚀 لوحة تحكم المتجر والتذاكر</h2>
                    <form action="/send" method="POST">
                        
                        <label>📌 اختر الروم في السيرفر لإرسال رسالة المتجر:</label>
                        <select name="channelId" required>
                            ${guildOptions}
                        </select>

                        <label>📝 Title (العنوان):</label>
                        <input type="text" name="title" id="inp-title" placeholder="عنوان الرسالة" value="NEXAS STORE 🚀">

                        <label>📄 Description (المحتوى):</label>
                        <textarea name="description" id="inp-desc" placeholder="اكتب تفاصيل المنتجات...">اضغط على الزر بالأسفل لفتح تذكرة أو استخدم أمر /rate للتقييم 👇</textarea>

                        <div class="row">
                            <div>
                                <label>🎨 لون الـ Embed:</label>
                                <input type="color" name="color" id="inp-color" value="#5865F2" style="height: 38px; cursor: pointer;">
                            </div>
                            <div>
                                <label>🖼️ Image URL (اختياري):</label>
                                <input type="text" name="image" placeholder="رابط صورة">
                            </div>
                        </div>

                        <label>📌 Footer Text:</label>
                        <input type="text" name="footer" id="inp-footer" placeholder="حقوق المتجر" value="NEXAS Store Team">

                        <h3 style="margin-top: 15px; font-size: 14px; text-align: right;">🎫 نظام التذاكر</h3>
                        <label>
                            <input type="checkbox" name="addTicketButton" value="yes" checked> إرفاق زر "فتح تذكرة 🎫" تلقائياً مع الرسالة
                        </label>

                        <button type="submit">🚀 إرسال الرسالة مع زر التذاكر للسيرفر</button>
                    </form>
                </div>

                <div class="preview-box">
                    <h3>👀 معاينة حية (Live Preview)</h3>
                    <div class="discord-embed">
                        <div class="d-title">NEXAS STORE 🚀</div>
                        <div class="d-desc">اضغط على الزر بالأسفل لفتح تذكرة أو استخدم أمر /rate للتقييم 👇</div>
                        <div class="d-footer">NEXAS Store Team</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
});

// استقبال طلب الإرسال من لوحة التحكم
app.post('/send', async (req, res) => {
    const { channelId, title, description, color, image, footer, addTicketButton } = req.body;
    
    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel) return res.send('❌ الروم غير موجود!');

        const embed = new EmbedBuilder()
            .setTitle(title || 'NEXAS STORE')
            .setDescription(description || '')
            .setColor(color || '#5865F2')
            .setFooter({ text: footer || 'NEXAS Store' });

        if (image) embed.setImage(image);

        const components = [];
        if (addTicketButton === 'yes') {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('open_ticket')
                    .setLabel('فتح تذكرة 🎫')
                    .setStyle(ButtonStyle.Primary)
            );
            components.push(row);
        }

        await channel.send({ embeds: [embed], components });
        res.send('<h2>✅ تم إرسال الرسالة بنجاح للسيرفر! <a href="/">العودة للوحة التحكم</a></h2>');
    } catch (error) {
        console.error(error);
        res.send('❌ حدث خطأ أثناء إرسال الرسالة.');
    }
});

// التفاعل مع الأزرار والتذاكر وأوامر السلاش
client.on('interactionCreate', async interaction => {
    if (interaction.isButton() && interaction.customId === 'open_ticket') {
        try {
            const guild = interaction.guild;
            const ticketChannel = await guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    },
                ],
            });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('إغلاق التذكرة 🔒')
                    .setStyle(ButtonStyle.Danger)
            );

            await ticketChannel.send({
                content: `مرحباً ${interaction.user}, تم فتح تذكرتك بنجاح! سيتم الرد عليك قريباً.`,
                components: [row]
            });

            await interaction.reply({ content: `✅ تم إنشاء تذكرتك بنجاح: ${ticketChannel}`, ephemeral: true });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: '❌حدث خطأ أثناء إنشاء التذكرة.', ephemeral: true });
        }
    }

    if (interaction.isButton() && interaction.customId === 'close_ticket') {
        await interaction.reply({ content: '🔒 سيتم إغلاق التذكرة خلال 5 ثوانٍ...' });
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }

    if (interaction.isChatInputCommand() && interaction.commandName === 'rate') {
        const modal = new ModalBuilder()
            .setCustomId('rating_modal')
            .setTitle('تقييم خدمات متجر NEXAS');

        const ratingInput = new TextInputBuilder()
            .setCustomId('rating_stars')
            .setLabel('قيمنا من 1 إلى 5 نجوم ⭐')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('مثال: 5')
            .setRequired(true);

        const commentInput = new TextInputBuilder()
            .setCustomId('rating_comment')
            .setLabel('ملاحظاتك أو رأيك بالخدمة 💬')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('اكتب رأيك هنا بكل إيجابية أو نقد بناء...')
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(ratingInput),
            new ActionRowBuilder().addComponents(commentInput)
        );

        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'rating_modal') {
        const stars = interaction.fields.getTextInputValue('rating_stars');
        const comment = interaction.fields.getTextInputValue('rating_comment') || 'لا يوجد تعليق';

        const embed = new EmbedBuilder()
            .setTitle('⭐ تقييم جديد للخدمة')
            .setColor('#fbbf24')
            .addFields(
                { name: '👤 صاحب التقييم:', value: `${interaction.user} (${interaction.user.tag})`, inline: false },
                { name: '🌟 التقييم:', value: `${stars} نجوم`, inline: true },
                { name: '💬 الملاحظات:', value: comment, inline: false }
            )
            .setTimestamp();

        try {
            const ratingChannel = await client.channels.fetch(RATING_CHANNEL_ID);
            if (ratingChannel) {
                await ratingChannel.send({ embeds: [embed] });
            }
        } catch (err) {
            console.error('خطأ في إرسال التقييم:', err);
        }

        await interaction.reply({ content: 'شكراً لك! تم إرسال تقييمك بنجاح ❤️', ephemeral: true });
    }
});

// تشغيل السيرفر والبوت بالاعتماد على متغير البيئة الآمن
app.listen(port, () => {
    console.log(`Express server running on port ${port}`);
});

client.login(process.env.DISCORD_TOKEN);



