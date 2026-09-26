# Шаблон подписки ManubisGuard

Современный адаптивный шаблон страницы подписки для **ManubisGuard Panel**.

Интерфейс переработан в том же стиле Cyber Pulse, что и панель ManubisGuard: тёмная основа, стеклянные поверхности, фиолетовый primary, mint/cyan accents, мягкое свечение и тонкая сетка.

## Возможности

- тёмный и системный режим
- English, فارسی, 中文 и Русский
- статистика трафика
- ссылки подписки и конфигураций
- QR-код и копирование
- загрузка WireGuard
- приложения и ссылки импорта
- объявления и поддержка
- адаптивный single-file HTML

## Установка

```sh
curl -fsSL https://raw.githubusercontent.com/ManubisGuard/subscription-template/main/install.sh | sudo bash -s -- --lang ru
```

Файл устанавливается в:

```text
/var/lib/manubisguard/templates/subscription/index.html
```

Настройки Panel находятся в:

```text
/opt/manubisguard-panel/.env
```

```dotenv
CUSTOM_TEMPLATES_DIRECTORY="/var/lib/manubisguard/templates/"
SUBSCRIPTION_PAGE_TEMPLATE="subscription/index.html"
```

Перезапуск:

```sh
sudo manubis restart
```

## Сборка

```sh
git clone https://github.com/ManubisGuard/subscription-template.git
cd subscription-template
bun install
bun run build
```

Результат: `dist/index.html`.

## Дизайн

Цветовая база ManubisGuard: `#05060B`, `#6667FD`, `#66F0D1`, `#9B5CFF`, glass surfaces, ambient gradients, cyber grid и controlled glow.

## Репозитории

https://github.com/ManubisGuard/subscription-template
https://github.com/ManubisGuard/ManubisGuard-Panel
