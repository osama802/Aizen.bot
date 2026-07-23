# 📱 دليل تثبيت وتشغيل بوت Aizen على Termux

## 🎯 المتطلبات الأساسية

- هاتف بنظام **Android**
- تطبيق **Termux** (تحميل من F-Droid)
- رقم هاتف واتساب نشط
- اتصال إنترنت مستقر

---

## ✅ خطوات التثبيت (خطوة بخطوة)

### الخطوة 1️⃣: تثبيت Termux

```bash
# 1. افتح F-Droid من هاتفك
# 2. ابحث عن "Termux"
# 3. اضغط تثبيت
# 4. افتح التطبيق بعد التثبيت
```

**تحميل مباشر:**
- [F-Droid](https://f-droid.org/packages/com.termux/)
- أو من متجر GitHub Releases

---

### الخطوة 2️⃣: تحديث Termux

عند فتح Termux لأول مرة، اكتب:

```bash
apt update
apt upgrade -y
```

اضغط `Enter` وانتظر حتى ينتهي التحديث.

---

### الخطوة 3️⃣: تثبيت المتطلبات الأساسية

```bash
# تثبيت Node.js و NPM
apt install -y nodejs npm

# تثبيت Git
apt install -y git

# التحقق من التثبيت
node --version
npm --version
```

---

### الخطوة 4️⃣: نسخ المشروع

#### الطريقة الأولى (استخدام Git):

```bash
# انسخ المستودع
git clone https://github.com/osama802/Aizen.bot.git

# ادخل مجلد المشروع
cd Aizen.bot

# تثبيت التبعيات
npm install
```

#### الطريقة الثانية (بدون Git):

```bash
# إنشاء مجلد المشروع
mkdir Aizen.bot
cd Aizen.bot

# تثبيت المكتبات مباشرة
npm install whatsapp-web.js qrcode-terminal dotenv axios cheerio fs-extra
```

---

### الخطوة 5️⃣: تشغيل البوت

```bash
# من داخل مجلد Aizen.bot
node index.js
```

**ستظهر رسالة مثل هذه:**

```
╔════════════════════════════╗
║   🎌 بوت Aizen جاهز 🤖   ║
╚════════════════════════════╝

🔐 أمسح رمز QR بهاتفك:
[سيظهر QR Code هنا]

⏳ جاري المصادقة...
```

---

## 🔐 ربط الهاتف برقم الواتساب

### طريقة الربط الأساسية (QR Code)

1. **الخطوة 1: تشغيل البوت**
   ```bash
   node index.js
   ```

2. **الخطوة 2: مسح QR Code**
   - افتح **WhatsApp** من هاتفك
   - اذهب إلى **الإعدادات** ⚙️
   - اختر **الأجهزة المرتبطة** 🔗
   - اضغط **ربط جهاز** 
   - **أمسح رمز QR** الذي يظهر في Termux بكاميرا هاتفك

3. **الخطوة 3: الانتظار**
   - انتظر حتى تظهر الرسالة:
   ```
   ╔════════════════════════════╗
   ║  ✅ البوت متصل الآن! 🟢   ║
   ╚════════════════════════════╝
   ```

---

## 🔑 ربط متقدم باستخدام رقم الهاتف

### طريقة 1: استخدام Selenium (الطريقة الموصى بها)

**تثبيت المكتبات الإضافية:**

```bash
npm install selenium-webdriver
apt install -y chromium
```

**إنشاء ملف `phone-login.js`:**

```javascript
const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// عند الحاجة لإدخال رقم الهاتف
client.on('qr', (qr) => {
    console.log('🔐 أمسح QR Code:');
    QRCode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ تم الربط بنجاح!');
    console.log('📱 رقم الهاتف المرتبط:', client.info.phone.number);
});

client.initialize();
```

**التشغيل:**
```bash
node phone-login.js
```

---

### طريقة 2: الربط اليدوي المباشر

إذا كنت تريد إدخال رقم الهاتف مباشرة:

**ملف `manual-login.js`:**

```javascript
const { Client, LocalAuth } = require('whatsapp-web.js');
const readline = require('readline');
const QRCode = require('qrcode-terminal');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox']
    }
});

rl.question('أدخل رقم هاتفك (مع رمز الدولة مثل +966xxxxxxxxxx): ', (phone) => {
    console.log(`\n📱 جاري ربط رقم: ${phone}`);
    rl.close();
});

client.on('qr', (qr) => {
    console.log('\n🔐 أمسح رمز QR:');
    QRCode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('\n✅ تم الربط بنجاح!');
    console.log('🟢 البوت جاهز الآن');
    process.exit(0);
});

client.initialize();
```

**التشغيل:**
```bash
node manual-login.js
```

---

## 📋 معلومات الهاتف المطلوبة

| المعلومة | التفاصيل | مثال |
|---------|---------|------|
| **رمز الدولة** | الرمز الدولي للدولة | +966 (السعودية) |
| **رقم الهاتف** | الرقم بدون الصفر الأول | 512345678 |
| **الرقم الكامل** | رمز الدولة + الرقم | +966512345678 |

---

## 🔗 أكواد الدول الشهيرة

```
🇸🇦 السعودية: +966
🇪🇬 مصر: +20
🇦🇪 الإمارات: +971
🇲🇦 المغرب: +212
🇯🇴 الأردن: +962
🇰🇼 الكويت: +965
🇶🇦 قطر: +974
🇧🇭 البحرين: +973
🇴🇲 عمان: +968
🇵🇸 فلسطين: +970
```

---

## ⚠️ المشاكل الشائعة والحلول

### المشكلة 1: خطأ "npm: command not found"

**الحل:**
```bash
apt install -y npm
```

### المشكلة 2: خطأ في مسح QR Code

**الحل:**
```bash
# إعادة تثبيت المكتبات
npm install
# أو حذف المجلد session
rm -rf .wwebjs_cache
```

### المشكلة 3: البوت لا يتصل

**الحل:**
```bash
# تحقق من الاتصال بالإنترنت
ping google.com

# أعد تشغيل Termux
# أو حذف الجلسة
rm -rf session/
```

### المشكلة 4: "Timeout" أثناء مسح QR

**الحل:**
```bash
# زيادة مهلة الاتصال في index.js
client.initialize().then(() => {
    console.log('جاهز');
}).catch(err => console.error(err));
```

---

## 🚀 تشغيل البوت في الخلفية

### الطريقة 1: استخدام `nohup`

```bash
nohup node index.js > bot.log 2>&1 &
```

### الطريقة 2: استخدام `tmux`

```bash
# تثبيت tmux
apt install -y tmux

# إنشاء جلسة جديدة
tmux new-session -d -s aizen "cd ~/Aizen.bot && node index.js"

# عرض الجلسة
tmux attach-session -t aizen

# الخروج من الجلسة (Ctrl+B ثم D)
```

### الطريقة 3: استخدام `screen`

```bash
# تثبيت screen
apt install -y screen

# إنشاء جلسة جديدة
screen -S aizen -d -m bash -c "cd ~/Aizen.bot && node index.js"

# عرض الجلسة
screen -r aizen

# الخروج من الجلسة (Ctrl+A ثم D)
```

---

## 📊 التحقق من حالة البوت

```bash
# عرض البوتات الموجودة
ps aux | grep node

# عرض سجل الأخطاء
tail -f bot.log

# إيقاف البوت
pkill -f "node index.js"
```

---

## 💡 نصائح مهمة

✅ **احتفظ بـ Termux مفتوح** لضمان عمل البوت بدون توقف

✅ **لا تغلق الجلسة** إذا أغلقت Termux، سيتوقف البوت

✅ **استخدم tmux أو screen** للتشغيل المستمر

✅ **تحديث المكتبات** كل أسبوع:
```bash
npm update
```

✅ **النسخ الاحتياطي** للملفات المهمة

---

## 🎮 الأوامر الأساسية بعد الربط

```
.أوامر        - عرض جميع الأوامر
.أنمي ناروتو  - البحث عن أنمي
.مانجا ون بيس - البحث عن مانجا
.شخصية ناروتو  - معلومات الشخصية
.أفضلأنمي    - أفضل الأنميات
.بوتي         - معلومات البوت
```

---

## 📞 الدعم والمساعدة

إذا واجهت مشكلة:

1. تحقق من الاتصال بالإنترنت
2. أعد تثبيت المكتبات: `npm install`
3. أعد تشغيل Termux
4. احذف جلسة البوت: `rm -rf session/`

---

**✨ تم! البوت جاهز للاستخدام 🎌**
