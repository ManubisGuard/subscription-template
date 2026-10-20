# قالب صفحه اشتراک ManubisGuard

قالب واکنش‌گرا و چندزبانه برای صفحه اشتراک در مرورگر؛ قرارداد داده و رفتار لینک‌های اشتراک پنل ManubisGuard حفظ می‌شود.

## نصب سریع

این دستورها را روی سرور پنل ManubisGuard اجرا کن. نصب‌کننده Mount واقعی داده‌های کانتینر پنل را تشخیص می‌دهد، قالب را می‌سازد، تنظیمات را اعمال می‌کند و **فقط کانتینر برنامه پنل** را بازسازی می‌کند؛ دیتابیس ری‌استارت نمی‌شود.

```sh
curl -fsSL https://raw.githubusercontent.com/ManubisGuard/subscription-template/main/install.sh -o /tmp/manubisguard-subscription-install.sh
sudo bash /tmp/manubisguard-subscription-install.sh --lang fa
```

زبان‌های پشتیبانی‌شده: `fa`، `en`، `zh`، `ru`. زبان پیش‌فرض فارسی است.

مسیر پیش‌فرض پنل `/opt/manubisguard-panel` است و باید فایل‌های `.env` و `docker-compose.yml` در آن وجود داشته باشند. برای مسیر سفارشی:

```sh
curl -fsSL https://raw.githubusercontent.com/ManubisGuard/subscription-template/main/install.sh -o /tmp/manubisguard-subscription-install.sh
sudo env MANUBISGUARD_PANEL_DIR=/path/to/manubisguard-panel bash /tmp/manubisguard-subscription-install.sh --lang fa
```

## مسیر نصب و تنظیمات

در نصب استاندارد، فایل HTML روی میزبان در این مسیر قرار می‌گیرد:

```text
/var/lib/manubisguard/templates/subscription/index.html
```

در فایل `/opt/manubisguard-panel/.env` این مقادیر تنظیم می‌شوند:

```dotenv
CUSTOM_TEMPLATES_DIRECTORY="/var/lib/manubisguard/templates/"
SUBSCRIPTION_PAGE_TEMPLATE="subscription/index.html"
```

نصب‌کننده مسیر میزبان را از Mount واقعی `/var/lib/manubisguard` در کانتینر پنل می‌خواند تا فایل دقیقاً در Volume مورد استفاده پنل قرار گیرد. پیش از تغییر، از فایل HTML قبلی و `.env` نسخه پشتیبان زمان‌دار می‌سازد.

برای اعمال متغیرهای محیطی، فقط سرویس برنامه پنل بازسازی می‌شود:

```sh
cd /opt/manubisguard-panel
docker compose up -d --no-deps --force-recreate manubisguard
```

از `manubis restart` استفاده نمی‌شود، چون سرویس دیتابیس را هم ری‌استارت می‌کند.

## انتخاب شاخه یا تگ

فقط شاخه یا تگی را انتخاب کن که واقعاً در مخزن وجود دارد:

```sh
sudo bash /tmp/manubisguard-subscription-install.sh --lang fa --version main
```

پیش‌فرض `main` است؛ شماره نسخه داخل `package.json` به‌تنهایی به معنی وجود Git tag یا Release نیست.

## نصب دستی

```sh
git clone https://github.com/ManubisGuard/subscription-template.git
cd subscription-template
bun install --frozen-lockfile
VITE_FALLBACK_LANGUAGE=fa bun run build
sudo install -D -m 0644 dist/index.html /var/lib/manubisguard/templates/subscription/index.html
```

دو متغیر بالا را در `/opt/manubisguard-panel/.env` ثبت کن و سپس دستور Compose برای بازسازی فقط سرویس پنل را اجرا کن. اگر نام سرویس یا مسیر Volume متفاوت است، مسیرها را مطابق نصب خودت تغییر بده.

## شخصی‌سازی هنگام Build

```dotenv
VITE_PRIMARY_COLOR_LIGHT=oklch(0.48 0.11 250)
VITE_PRIMARY_COLOR_DARK=oklch(0.60 0.12 250)
VITE_BORDER_RADIUS=0.65rem
```

طراحی جدید داده‌های صفحه اشتراک پنل، از جمله وضعیت کاربر، مصرف، تاریخ انقضا، لینک پروتکل‌ها، WireGuard، برنامه‌ها، اعلان‌ها، لینک پشتیبانی و آمار مصرف را حفظ می‌کند.

مخزن: https://github.com/ManubisGuard/subscription-template