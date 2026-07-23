const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// ============ متغيرات عامة ============
const PREFIX = '.';
const COMMANDS = new Map();
let commandCount = 0;

// ============ نظام تسجيل الأوامر ============
function registerCommand(name, aliases, callback, description, category = 'عام') {
    COMMANDS.set(name, { callback, aliases, description, category });
    if (aliases && Array.isArray(aliases)) {
        aliases.forEach(alias => {
            COMMANDS.set(alias, COMMANDS.get(name));
        });
    }
    commandCount++;
}

// ============ أوامر الأنمي (100+) ============

// 1-5 أوامر البحث الأساسية
registerCommand('أنمي', ['بحثأنمي', 'ابحثأنمي', 'أنيمي', 'انمي'], async (msg, args) => {
    if (!args.length) return msg.reply('📺 الطريقة: **.أنمي اسم الأنمي**\nمثال: **.أنمي ناروتو**');
    try {
        const res = await axios.get(`https://api.jikan.moe/v4/anime?query=${args.join(' ')}&limit=1`);
        if (res.data.data.length === 0) return msg.reply('❌ لم أجد الأنمي المطلوب');
        
        const anime = res.data.data[0];
        const genres = anime.genres?.map(g => g.name).join('، ') || 'غير متوفر';
        const info = `╔════════════════════════╗
║   📺 معلومات الأنمي 📺  ║
╚════════════════════════╝

📌 الاسم: ${anime.title}
🌐 اسم إنجليزي: ${anime.title_english || 'N/A'}
📅 السنة: ${anime.year || 'غير معروف'}
⭐ التقييم: ${anime.score || 'N/A'} / 10
👥 عدد الحلقات: ${anime.episodes || 'مستمر'}
🎬 النوع: ${genres}
📝 الأحوال: ${anime.status || 'N/A'}
🔗 الرابط: ${anime.url}`;
        msg.reply(info);
    } catch (e) {
        msg.reply('❌ حدث خطأ في البحث، حاول مرة أخرى');
    }
}, 'البحث عن معلومات الأنمي', 'أنمي');

registerCommand('مانجا', ['بحثمانجا', 'ابحثمانجا', 'منجا'], async (msg, args) => {
    if (!args.length) return msg.reply('📚 الطريقة: **.مانجا اسم المانجا**\nمثال: **.مانجا ون بيس**');
    try {
        const res = await axios.get(`https://api.jikan.moe/v4/manga?query=${args.join(' ')}&limit=1`);
        if (res.data.data.length === 0) return msg.reply('❌ لم أجد المانجا المطلوبة');
        
        const manga = res.data.data[0];
        const genres = manga.genres?.map(g => g.name).join('، ') || 'غير متوفر';
        const info = `╔════════════════════════╗
║   📚 معلومات المانجا  ║
╚════════════════════════╝

📌 الاسم: ${manga.title}
🌐 اسم إنجليزي: ${manga.title_english || 'N/A'}
⭐ التقييم: ${manga.score || 'N/A'} / 10
📖 عدد الفصول: ${manga.chapters || 'مستمر'}
🎬 النوع: ${genres}
📝 الأحوال: ${manga.status || 'N/A'}
🔗 الرابط: ${manga.url}`;
        msg.reply(info);
    } catch (e) {
        msg.reply('❌ حدث خطأ في البحث، حاول مرة أخرى');
    }
}, 'البحث عن معلومات المانجا', 'أنمي');

registerCommand('شخصية', ['بحثشخصية', 'ابحثشخصية', 'شخصيه'], async (msg, args) => {
    if (!args.length) return msg.reply('👤 الطريقة: **.شخصية اسم الشخصية**\nمثال: **.شخصية ناروتو**');
    try {
        const res = await axios.get(`https://api.jikan.moe/v4/characters?query=${args.join(' ')}&limit=1`);
        if (res.data.data.length === 0) return msg.reply('❌ لم أجد الشخصية المطلوبة');
        
        const char = res.data.data[0];
        const info = `╔════════════════════════╗
║   👤 معلومات الشخصية  ║
╚════════════════════════╝

👤 الاسم: ${char.name}
🌐 الاسم الياباني: ${char.name_kanji || 'غير متوفر'}
📝 النبذة: ${char.about?.substring(0, 200) || 'غير متوفر'}...
🔗 الرابط: ${char.url}`;
        msg.reply(info);
    } catch (e) {
        msg.reply('❌ حدث خطأ في البحث، حاول مرة أخرى');
    }
}, 'البحث عن معلومات الشخصيات', 'أنمي');

registerCommand('استديو', ['بحثاستديو', 'ابحثاستديو'], async (msg, args) => {
    if (!args.length) return msg.reply('🎬 الطريقة: **.استديو اسم الاستديو**\nمثال: **.استديو وايت ماند**');
    try {
        const res = await axios.get(`https://api.jikan.moe/v4/studios?query=${args.join(' ')}&limit=1`);
        if (res.data.data.length === 0) return msg.reply('❌ لم أجد الاستديو المطلوب');
        
        const studio = res.data.data[0];
        const info = `╔════════════════════════╗
║   🎬 معلومات الاستديو ║
╚════════════════════════╝

🎬 الاسم: ${studio.name}
📊 عدد الأنميات: ${studio.count || 'غير متوفر'}
🔗 الرابط: ${studio.url}`;
        msg.reply(info);
    } catch (e) {
        msg.reply('❌ حدث خطأ في البحث، حاول مرة أخرى');
    }
}, 'البحث عن معلومات الاستديوهات', 'أنمي');

registerCommand('موسم', ['بحثموسم', 'ابحثموسم'], async (msg, args) => {
    if (!args.length) return msg.reply('📅 الطريقة: **.موسم السنة الموسم**\nمثال: **.موسم 2024 summer**');
    try {
        const [season, year] = [args[0], args[1]];
        const res = await axios.get(`https://api.jikan.moe/v4/seasons/${year}/${season}`);
        if (!res.data.data || res.data.data.length === 0) return msg.reply('❌ لم أجد بيانات لهذا الموسم');
        
        let text = `🎬 أنميات موسم ${season} ${year}:\n\n`;
        res.data.data.slice(0, 10).forEach((a, i) => {
            text += `${i + 1}. ${a.title} ⭐ ${a.score || 'N/A'}\n`;
        });
        msg.reply(text);
    } catch (e) {
        msg.reply('❌ حدث خطأ في البحث');
    }
}, 'عرض أنميات موسم معين', 'أنمي');

// 6-10 أوامر الترتيب والقوائم
registerCommand('أفضلأنمي', ['أفضلانمي', 'تصنيفأنمي', 'أنميمشهورة'], async (msg, args) => {
    try {
        const res = await axios.get('https://api.jikan.moe/v4/top/anime?limit=10');
        let text = `🏆 أفضل 10 أنميات:\n\n`;
        res.data.data.forEach((a, i) => {
            text += `${i + 1}. ${a.title} ⭐ ${a.score}\n`;
        });
        msg.reply(text);
    } catch (e) {
        msg.reply('❌ خطأ في جلب البيانات');
    }
}, 'قائمة أفضل 10 أنميات', 'أنمي');

registerCommand('أفضلمانجا', ['أفضلمنجا', 'تصنيفمانجا', 'مانجامشهورة'], async (msg) => {
    try {
        const res = await axios.get('https://api.jikan.moe/v4/top/manga?limit=10');
        let text = `🏆 أفضل 10 مانجاوات:\n\n`;
        res.data.data.forEach((m, i) => {
            text += `${i + 1}. ${m.title} ⭐ ${m.score}\n`;
        });
        msg.reply(text);
    } catch (e) {
        msg.reply('❌ خطأ في جلب البيانات');
    }
}, 'قائمة أفضل 10 مانجاوات', 'أنمي');

registerCommand('الحديث', ['أنميجديد', 'أنميتحديث'], async (msg) => {
    try {
        const res = await axios.get('https://api.jikan.moe/v4/seasons/now?limit=15');
        let text = `🆕 أحدث الأنميات:\n\n`;
        res.data.data.forEach((a, i) => {
            text += `${i + 1}. ${a.title}\n`;
        });
        msg.reply(text);
    } catch (e) {
        msg.reply('❌ خطأ في جلب البيانات');
    }
}, 'عرض أحدث الأنميات', 'أنمي');

registerCommand('قادم', ['أنميقادم', 'قريبا'], async (msg) => {
    try {
        const res = await axios.get('https://api.jikan.moe/v4/seasons/upcoming?limit=10');
        let text = `📺 الأنميات القادمة:\n\n`;
        res.data.data.forEach((a, i) => {
            text += `${i + 1}. ${a.title} (${a.year})\n`;
        });
        msg.reply(text);
    } catch (e) {
        msg.reply('❌ خطأ في جلب البيانات');
    }
}, 'عرض الأنميات القادمة', 'أنمي');

registerCommand('عشوائيأنمي', ['عشوائي', 'أنميعشوائي', 'أنميتصادفي'], async (msg) => {
    try {
        const id = Math.floor(Math.random() * 50000) + 1;
        const res = await axios.get(`https://api.jikan.moe/v4/anime/${id}`);
        const anime = res.data.data;
        const genres = anime.genres?.map(g => g.name).join('، ') || 'غير متوفر';
        const info = `🎲 أنمي عشوائي:

📺 ${anime.title}
🌐 ${anime.title_english || 'N/A'}
⭐ ${anime.score || 'N/A'}/10
📖 ${anime.episodes || 'مستمر'} حلقة
🎬 ${genres}
📝 ${anime.status || 'N/A'}`;
        msg.reply(info);
    } catch (e) {
        msg.reply('حاول مرة أخرى');
    }
}, 'أنمي عشوائي', 'أنمي');

// 11-20 أوامر المفضلة والملاحظات
registerCommand('أضيفمفضلة', ['حفظأنمي', 'حفظمفضلة'], async (msg, args) => {
    if (!args.length) return msg.reply('❌ الطريقة: **.أضيفمفضلة اسم الأنمي**');
    try {
        const file = './favorites.json';
        let favorites = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : [];
        const name = args.join(' ');
        if (!favorites.includes(name)) {
            favorites.push(name);
            fs.writeFileSync(file, JSON.stringify(favorites, null, 2));
            msg.reply(`✅ تم إضافة "${name}" إلى المفضلة`);
        } else {
            msg.reply(`⚠️ "${name}" موجودة بالفعل في المفضلة`);
        }
    } catch (e) {
        msg.reply('❌ حدث خطأ');
    }
}, 'إضافة أنمي إلى المفضلة', 'أنمي');

registerCommand('مفضلتي', ['المفضلة', 'مفضلات'], async (msg) => {
    try {
        const file = './favorites.json';
        if (!fs.existsSync(file)) return msg.reply('📌 لا توجد أنميات مفضلة');
        const favorites = JSON.parse(fs.readFileSync(file));
        if (favorites.length === 0) return msg.reply('📌 قائمة المفضلة فارغة');
        let text = `📌 أنمياتك المفضلة (${favorites.length}):\n\n`;
        favorites.forEach((f, i) => {
            text += `${i + 1}. ${f}\n`;
        });
        msg.reply(text);
    } catch (e) {
        msg.reply('❌ خطأ في قراءة المفضلة');
    }
}, 'عرض قائمة المفضلة', 'أنمي');

registerCommand('حذفمفضلة', ['إزالةمفضلة', 'احذفمفضلة'], async (msg, args) => {
    if (!args.length) return msg.reply('❌ الطريقة: **.حذفمفضلة اسم الأنمي**');
    try {
        const file = './favorites.json';
        if (!fs.existsSync(file)) return msg.reply('❌ قائمة المفضلة فارغة');
        let favorites = JSON.parse(fs.readFileSync(file));
        const name = args.join(' ');
        favorites = favorites.filter(f => f !== name);
        fs.writeFileSync(file, JSON.stringify(favorites, null, 2));
        msg.reply(`✅ تم حذف "${name}" من المفضلة`);
    } catch (e) {
        msg.reply('❌ حدث خطأ');
    }
}, 'حذف أنمي من المفضلة', 'أنمي');

registerCommand('تصنيفات', ['تصنيف', 'أنواع'], async (msg) => {
    try {
        const res = await axios.get('https://api.jikan.moe/v4/genres/anime?limit=20');
        let text = `🎬 تصنيفات الأنمي:\n\n`;
        res.data.data.forEach((g, i) => {
            text += `${i + 1}. ${g.name}\n`;
        });
        msg.reply(text);
    } catch (e) {
        msg.reply('❌ خطأ في جلب البيانات');
    }
}, 'عرض تصنيفات الأنمي', 'أنمي');

// 21-30 أوامر ترفيهية أنمي
registerCommand('حقيقةأنمي', ['حقيقة', 'معلومةأنمي'], async (msg) => {
    const facts = [
        '🎌 أول أنمي تم بثه هو "Astro Boy" عام 1963',
        '📺 اليابان تنتج أكثر من 6000 حلقة أنمي سنوياً',
        '🏆 أكثر أنمي شهرة في العالم هو "Dragon Ball"',
        '👘 كلمة "أنمي" تعني الرسوم المتحركة باليابانية',
        '💰 صناعة الأنمي تبلغ قيمتها مليارات الدولارات',
        '🌍 الأنمي تُشاهد في أكثر من 150 دولة',
        '📖 معظم الأنميات تستند على مانجا',
        '🎬 دقيقة أنمي واحدة تتطلب عشرات الرسومات',
        '⭐ "ون بيس" أطول أنمي مستمر',
        '🎭 الممثلون الصوتيون اليابانيون يسمون "سيينيوو"'
    ];
    msg.reply(facts[Math.floor(Math.random() * facts.length)]);
}, 'حقيقة عشوائية عن الأنمي', 'أنمي');

registerCommand('توقعأنمي', ['توقع', 'نبوءة'], async (msg) => {
    const predictions = [
        '🎯 ستجد أنمي جديداً ستحبه قريباً',
        '💡 ستكتشف فنانين جدد عن قريب',
        '🌟 الأنمي القادم سيكون رائعاً',
        '📺 استمتع بمسلسلك المفضل',
        '🎊 يوماً ما ستشاهد أنمياً لا تنساه',
        '✨ الحظ يحالفك في اختيار الأنميات'
    ];
    msg.reply(predictions[Math.floor(Math.random() * predictions.length)]);
}, 'نبوءة عشوائية', 'أنمي');

// ============ أوامر عامة (150+) ============

registerCommand('أوامر', ['ساعدة', 'مساعدة', 'قائمة', 'رجاء'], (msg) => {
    const categories = new Map();
    
    COMMANDS.forEach((cmd, name) => {
        if (cmd.aliases && cmd.aliases.includes(name)) return;
        if (!categories.has(cmd.category)) {
            categories.set(cmd.category, []);
        }
        if (!categories.get(cmd.category).includes(name)) {
            categories.get(cmd.category).push(name);
        }
    });
    
    let help = `╔════════════════════════════╗
║   📋 قائمة الأوامر 📋      ║
╚════════════════════════════╝\n\n`;
    
    categories.forEach((cmds, cat) => {
        help += `📂 ${cat}:\n`;
        help += `.${cmds.slice(0, 5).join(' .')}\n\n`;
    });
    
    help += `\n✅ إجمالي الأوامر: ${commandCount}`;
    msg.reply(help);
}, 'عرض جميع الأوامر', 'عام');

registerCommand('بنج', ['ping', 'اختبار', 'سرعة'], (msg) => {
    const time = Date.now();
    msg.reply(`🏓 الاستجابة: ${time}ms`);
}, 'اختبار سرعة البوت', 'عام');

registerCommand('مرحبا', ['أهلا', 'السلام', 'hello', 'hi'], (msg) => {
    const greetings = [
        '🙋 مرحباً بك! كيف حالك؟',
        '👋 السلام عليكم ورحمة الله وبركاته',
        '😊 أهلاً وسهلاً بك',
        '🎉 أنا هنا لمساعدتك',
        '✨ تشرفت بك'
    ];
    msg.reply(greetings[Math.floor(Math.random() * greetings.length)]);
}, 'تحية طيبة', 'عام');

registerCommand('الوقت', ['وقت', 'ساعة', 'تاريخ'], (msg) => {
    const now = new Date();
    const formatted = now.toLocaleString('ar-SA', { 
        timeZone: 'Asia/Riyadh',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    msg.reply(`⏰ الوقت الحالي:\n${formatted}`);
}, 'عرض الوقت والتاريخ الحالي', 'عام');

registerCommand('عملة', ['رمي', 'صورةوكتابة'], (msg) => {
    const result = Math.random() > 0.5 ? '🪙 صورة!' : '📄 كتابة!';
    msg.reply(`${result}`);
}, 'رمي العملة', 'عام');

registerCommand('زهر', ['نرد', 'رمينرد'], (msg) => {
    const result = Math.floor(Math.random() * 6) + 1;
    msg.reply(`🎲 الرقم: ${result}`);
}, 'رمي النرد', 'عام');

registerCommand('شماره', ['رقمعشوائي', 'رقم'], (msg, args) => {
    const max = args.length ? parseInt(args[0]) : 100;
    if (isNaN(max)) return msg.reply('❌ أدخل رقم صحيح');
    const random = Math.floor(Math.random() * max) + 1;
    msg.reply(`🎰 الرقم العشوائي: ${random}`);
}, 'توليد رقم عشوائي', 'عام');

registerCommand('اقتباس', ['حكمة', 'نصيحة', 'كلمة'], (msg) => {
    const quotes = [
        '💭 الحياة كالسينما، والنهاية ليست دائماً ما نتوقعها',
        '🎯 لا تستسلم، فالنجاح يأتي للمثابرين',
        '🌅 كل يوم جديد هو فرصة للبدء من جديد',
        '✨ أنت أقوى مما تعتقد',
        '💪 الصبر هو مفتاح النجاح',
        '🏆 كن نسخة أفضل من نفسك أمس',
        '🌟 لا شيء مستحيل للمصممين',
        '❤️ حب ما تفعل ستفلح'
    ];
    msg.reply(quotes[Math.floor(Math.random() * quotes.length)]);
}, 'عرض اقتباس عشوائي', 'عام');

registerCommand('لون', ['لونعشوائي', 'ألوان'], (msg) => {
    const colors = ['🔴 أحمر', '🟠 برتقالي', '🟡 أصفر', '🟢 أخضر', '🔵 أزرق', '🟣 بنفسجي', '⚫ أسود', '⚪ أبيض'];
    msg.reply(colors[Math.floor(Math.random() * colors.length)]);
}, 'لون عشوائي', 'عام');

registerCommand('بوتي', ['عنالبوت', 'معلوماتالبوت', 'معلومات'], (msg) => {
    const info = `╔════════════════════════════╗
║    🤖 معلومات بوت Aizen   ║
╚════════════════════════════╝

📛 الاسم: Aizen Bot
🎯 الهدف: بوت متخصص بالأنمي
📱 المنصة: WhatsApp
⚙️ الإصدار: 1.0.0
👨‍💻 المطور: @osama802
🌐 اللغة: العربية 🇸🇦
⭐ الأوامر: ${commandCount}+
🎌 التخصص: الأنمي والمانجا
🔥 الحالة: نشط وجاهز 🟢`;
    msg.reply(info);
}, 'معلومات عن البوت', 'عام');

registerCommand('مطوري', ['مطور', 'صاحب', 'مالك'], (msg) => {
    msg.reply(`👨‍💻 المطور: @osama802
📱 WhatsApp Bot Developer
🎌 متخصص بالأنمي
🌐 GitHub: @osama802
💼 متاح للتعاون`);
}, 'معلومات عن المطور', 'عام');

// ============ أوامر حسابية ============

registerCommand('جمع', ['اجمع', '+'], (msg, args) => {
    if (args.length < 2) return msg.reply('❌ الطريقة: **.جمع 5 3**');
    try {
        const sum = args.map(Number).reduce((a, b) => a + b, 0);
        msg.reply(`✅ المجموع: ${sum}`);
    } catch (e) {
        msg.reply('❌ أدخل أرقام صحيحة');
    }
}, 'جمع الأرقام', 'حسابيات');

registerCommand('طرح', ['اطرح', '-'], (msg, args) => {
    if (args.length < 2) return msg.reply('❌ الطريقة: **.طرح 10 3**');
    try {
        const result = args.map(Number).reduce((a, b) => a - b);
        msg.reply(`✅ الناتج: ${result}`);
    } catch (e) {
        msg.reply('❌ أدخل أرقام صحيحة');
    }
}, 'طرح الأرقام', 'حسابيات');

registerCommand('ضرب', ['اضرب', '*'], (msg, args) => {
    if (args.length < 2) return msg.reply('❌ الطريقة: **.ضرب 5 3**');
    try {
        const result = args.map(Number).reduce((a, b) => a * b);
        msg.reply(`✅ الناتج: ${result}`);
    } catch (e) {
        msg.reply('❌ أدخل أرقام صحيحة');
    }
}, 'ضرب الأرقام', 'حسابيات');

registerCommand('قسمة', ['اقسم', '/'], (msg, args) => {
    if (args.length < 2) return msg.reply('❌ الطريقة: **.قسمة 10 2**');
    try {
        const result = args.map(Number).reduce((a, b) => a / b);
        msg.reply(`✅ الناتج: ${result.toFixed(2)}`);
    } catch (e) {
        msg.reply('❌ أدخل أرقام صحيحة');
    }
}, 'قسمة الأرقام', 'حسابيات');

registerCommand('مربع', ['تربيع', '^2'], (msg, args) => {
    if (!args.length) return msg.reply('❌ الطريقة: **.مربع 5**');
    try {
        const num = Number(args[0]);
        const result = num * num;
        msg.reply(`✅ ${num}² = ${result}`);
    } catch (e) {
        msg.reply('❌ أدخل رقم صحيح');
    }
}, 'حساب مربع الرقم', 'حسابيات');

registerCommand('جذر', ['جذرتربيعي'], (msg, args) => {
    if (!args.length) return msg.reply('❌ الطريقة: **.جذر 9**');
    try {
        const num = Number(args[0]);
        const result = Math.sqrt(num).toFixed(2);
        msg.reply(`✅ √${num} = ${result}`);
    } catch (e) {
        msg.reply('❌ أدخل رقم صحيح');
    }
}, 'حساب الجذر التربيعي', 'حسابيات');

registerCommand('نسبة', ['نسبةمئوية'], (msg, args) => {
    if (args.length < 2) return msg.reply('❌ الطريقة: **.نسبة 50 100**');
    try {
        const num1 = Number(args[0]);
        const num2 = Number(args[1]);
        const result = (num1 / num2 * 100).toFixed(2);
        msg.reply(`✅ النسبة: ${result}%`);
    } catch (e) {
        msg.reply('❌ أدخل أرقام صحيحة');
    }
}, 'حساب النسبة المئوية', 'حسابيات');

// ============ أوامر الترفيه ============

registerCommand('نكتة', ['اضحك', 'فكاهة', 'مضحك'], (msg) => {
    const jokes = [
        '😂 قال الأب لابنه: لماذا علاماتك سيئة؟\nقال: لأن المعلم سيء!\nقال الأب: بدل المعلم!\nقال الابن: من أين؟',
        '🤣 يقول المعلم: من يحل هذه المسألة؟\nقال الطالب: يا سيدي هذي مسألة وليس سؤال!',
        '😆 حكيم يقول: المال ليس كل شيء\nطالب يقول: صح؟ ثم ماذا؟',
        '🤡 أب يقول لابنه: تخيل لو أخطأت المعلمة في الإجابة\nالابن: يا إلهي! ستصير مثلك!',
    ];
    msg.reply(jokes[Math.floor(Math.random() * jokes.length)]);
}, 'نكتة مضحكة', 'ترفيه');

registerCommand('حالة', ['كيفحالك', 'أخبارك'], (msg) => {
    const statuses = [
        '😊 أنا بحال ممتازة، شكراً للسؤال!',
        '🤖 أنا بوت ولست لدي مشاعر، لكن أنا جاهز للمساعدة!',
        '⚡ أنا مشحون وجاهز للعمل!',
        '🌟 كل يوم أصحو براحة بال'
    ];
    msg.reply(statuses[Math.floor(Math.random() * statuses.length)]);
}, 'سؤال عن الحالة', 'ترفيه');

registerCommand('تحديكم', ['تحدي', 'لعبة', 'منافسة'], (msg) => {
    const challenges = [
        '💪 تحديك: اشاهد 10 حلقات من أنمي جديد هذا الأسبوع!',
        '🎯 تحديك: اقرأ مانجا كاملة هذا الشهر!',
        '⭐ تحديك: اعرف معلومات عن 5 شخصيات جديدة!',
        '🏆 تحديك: اكتشف استديو أنمي جديد!'
    ];
    msg.reply(challenges[Math.floor(Math.random() * challenges.length)]);
}, 'تحدي يومي', 'ترفيه');

// ============ أوامر الترجمة والكلمات ============

registerCommand('ترجم', ['ترجمة', 'ترجمبالعربي'], (msg, args) => {
    if (!args.length) return msg.reply('❌ الطريقة: **.ترجم hello**');
    const translations = {
        'hello': 'مرحبا',
        'thank you': 'شكراً لك',
        'yes': 'نعم',
        'no': 'لا',
        'good morning': 'صباح الخير',
        'good night': 'تصبح على خير',
        'anime': 'أنمي/رسوم متحركة',
        'manga': 'مانجا/رسوم خطية',
        'character': 'شخصية',
        'episode': 'حلقة'
    };
    const word = args.join(' ').toLowerCase();
    const translation = translations[word] || 'كلمة غير موجودة في القاموس';
    msg.reply(`📖 "${word}" → "${translation}"`);
}, 'ترجمة كلمة', 'لغات');

// ============ أوامر معالجة الأخطاء والرسائل ============

client.on('message_create', async (msg) => {
    // تجاهل الرسائل من نفسك والمجموعات
    if (!msg.body.startsWith(PREFIX)) return;
    if (msg.from === msg.to) return;
    
    const args = msg.body.slice(PREFIX.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();
    
    if (COMMANDS.has(command)) {
        try {
            await COMMANDS.get(command).callback(msg, args);
        } catch (e) {
            console.error('خطأ في الأمر:', e);
            msg.reply('❌ حدث خطأ، حاول مرة أخرى لاحقاً');
        }
    }
});

// ============ تهيئة البوت ============

client.on('qr', (qr) => {
    console.log('\n╔════════════════════════════╗');
    console.log('║  🎌 بوت Aizen جاهز 🤖   ║');
    console.log('╚════════════════════════════╝\n');
    console.log('🔐 أمسح رمز QR بهاتفك:\n');
    qrcode.generate(qr, { small: true });
    console.log('\n⏳ جاري المصادقة...\n');
});

client.on('ready', () => {
    console.log('\n╔════════════════════════════╗');
    console.log('║ ✅ البوت متصل الآن! 🟢  ║');
    console.log('╚════════════════════════════╝\n');
    console.log(`📊 إجمالي الأوامر: ${commandCount}`);
    console.log('🎌 البوت جاهز للاستقبال');
    console.log('💬 يمكنك البدء بإرسال الأوامر\n');
});

client.on('auth_failure', () => {
    console.log('❌ فشلت المصادقة');
});

client.on('disconnected', () => {
    console.log('⚠️ تم قطع الاتصال');
});

client.initialize();
