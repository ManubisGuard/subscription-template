# قالب اشتراک ManubisGuard

قالب مدرن و واکنش‌گرای صفحه اشتراک و داشبورد کاربر برای **ManubisGuard Panel**.

هویت بصری قالب اکنون با پنل ManubisGuard یکپارچه است و از همان سبک Dark-native، Cyber Pulse، Glass UI، نورهای محیطی و Grid ظریف استفاده می‌کند.

## امکانات

- 🌌 رابط کاربری Dark-native
- 💜 Electric Violet همراه با Cyan و Mint
- ✨ کارت‌های شیشه‌ای، Glow و نور محیطی
- 📱 طراحی واکنش‌گرا برای موبایل و دسکتاپ
- 🌍 فارسی، انگلیسی، چینی و روسی
- 🌓 حالت روشن، تاریک و سیستم
- 📊 نمودار مصرف با بازه‌های زمانی مختلف
- 🔗 لینک اشتراک و لینک کانفیگ‌ها
- 📋 کپی سریع لینک و کانفیگ
- 📦 دانلود کانفیگ WireGuard
- 🔳 QR Code
- 🖥️ برنامه‌های پیشنهادی و لینک Import/Download
- 📢 اعلان و لینک پشتیبانی
- ⚡ خروجی Single-file برای استفاده مستقیم در پنل

## سازگاری

| قالب اشتراک | ManubisGuard Panel |
| --- | --- |
| \`v2\` | \`v3\` |
| سایر نسخه‌های پشتیبانی‌شده | \`v2\`، \`v1\` |

طراحی جدید قرارداد داده و رفتار لینک اشتراک را تغییر نمی‌دهد.

## نصب سریع

نصب‌کننده کاملاً برای ManubisGuard تنظیم شده است:

\`\`\`sh
curl -fsSL https://raw.githubusercontent.com/ManubisGuard/subscription-template/main/install.sh | sudo bash -s -- --lang fa
\`\`\`

زبان‌های قابل انتخاب: \`en\`، \`fa\`، \`zh\`، \`ru\`.

مسیر نصب:

\`\`\`text
/var/lib/manubisguard/templates/subscription/index.html
\`\`\`

فایل تنظیمات پنل:

\`\`\`text
/opt/manubisguard-panel/.env
\`\`\`

مقادیر مورد نیاز:

\`\`\`dotenv
CUSTOM_TEMPLATES_DIRECTORY="/var/lib/manubisguard/templates/"
SUBSCRIPTION_PAGE_TEMPLATE="subscription/index.html"
\`\`\`

سپس:

\`\`\`sh
sudo manubis restart
\`\`\`

## نصب دستی

\`\`\`sh
sudo mkdir -p /var/lib/manubisguard/templates/subscription
git clone https://github.com/ManubisGuard/subscription-template.git
cd subscription-template
bun install
VITE_FALLBACK_LANGUAGE=fa bun run build
sudo mkdir -p /var/lib/manubisguard/templates/subscription
sudo cp dist/index.html /var/lib/manubisguard/templates/subscription/index.html
sudo manubis restart
\`\`\`

## ساخت از سورس

\`\`\`sh
git clone https://github.com/ManubisGuard/subscription-template.git
cd subscription-template
bun install
bun run build
\`\`\`

فایل خروجی \`dist/index.html\` است.

نصب:

\`\`\`sh
sudo mkdir -p /var/lib/manubisguard/templates/subscription
sudo cp dist/index.html /var/lib/manubisguard/templates/subscription/index.html
sudo manubis restart
\`\`\`

## Design System

قالب از همان زبان بصری پنل ManubisGuard استفاده می‌کند:

- Background: \`#05060B\`
- Primary: \`#6667FD\`
- Secondary: \`#66F0D1\`
- Accent: \`#9B5CFF\`
- Glass surfaces
- Ambient gradients
- Cyber grid
- Border و Shadow کنترل‌شده
- Hover و Motion نرم
- کارت‌های گرد و عملیاتی

## شخصی‌سازی

مقادیر build-time همچنان پشتیبانی می‌شوند:

\`\`\`dotenv
VITE_PRIMARY_COLOR_LIGHT=oklch(0.48 0.11 250)
VITE_PRIMARY_COLOR_DARK=oklch(0.60 0.12 250)
VITE_BORDER_RADIUS=0.65rem
\`\`\`

## داده‌ها

داده‌های فعلی پنل همچنان پشتیبانی می‌شوند: وضعیت کاربر، مصرف، تاریخ انقضا، لینک پروتکل‌ها، WireGuard، برنامه‌ها، اعلان، پشتیبانی و آمار مصرف.

## مخزن

https://github.com/ManubisGuard/subscription-template

## مجوز

فایل \`LICENSE\` مخزن مرجع مجوز پروژه است.
