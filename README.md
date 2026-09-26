# ManubisGuard Subscription Template

Modern, responsive subscription and user dashboard template for **ManubisGuard Panel**.

> A ManubisGuard-branded subscription experience using the same dark-native Cyber Pulse visual language as the ManubisGuard Panel.

## Highlights

- 🌌 Dark-native Cyber Pulse interface
- 💜 Electric violet, cyan and mint design tokens
- ✨ Glass surfaces, ambient gradients, subtle grid and controlled glow
- 📱 Responsive desktop and mobile layout
- 🌍 English, Persian, Chinese and Russian
- 🌓 Light, dark and system theme modes
- 📊 Traffic usage charts with selectable ranges
- 🔗 Subscription and protocol configuration links
- 📋 One-click copy for links and configs
- 📦 WireGuard config download
- 🔳 QR code actions
- 🖥️ Application recommendations and import links
- 📢 Announcements and support links
- ⚡ Single-file Vite output for direct Panel template usage

## Compatibility

| Subscription Template | ManubisGuard Panel |
| --- | --- |
| \`v2\` | \`v3\` |
| Other supported versions | \`v2\`, \`v1\` |

The redesign preserves the existing template data contract and subscription URL behavior.

## Quick Install

The installer is ManubisGuard-native and uses the same canonical directories as the ManubisGuard Panel:

\`\`\`sh
curl -fsSL https://raw.githubusercontent.com/ManubisGuard/subscription-template/main/install.sh | sudo bash -s -- --lang fa
\`\`\`

Supported languages: \`en\`, \`fa\`, \`zh\`, \`ru\`.

A specific release can be selected with \`--version\`:

\`\`\`sh
sudo bash install.sh --lang fa --version v2.2.1
\`\`\`

The generated page is installed at:

\`\`\`text
/var/lib/manubisguard/templates/subscription/index.html
\`\`\`

The installer configures:

\`\`\`text
/opt/manubisguard-panel/.env
\`\`\`

with:

\`\`\`dotenv
CUSTOM_TEMPLATES_DIRECTORY="/var/lib/manubisguard/templates/"
SUBSCRIPTION_PAGE_TEMPLATE="subscription/index.html"
\`\`\`

If the \`manubis\` CLI is available, the installer restarts the Panel automatically.

## Manual Install

\`\`\`sh
sudo mkdir -p /var/lib/manubisguard/templates/subscription
sudo wget -O /var/lib/manubisguard/templates/subscription/index.html \
https://github.com/ManubisGuard/subscription-template/releases/latest/download/index.html
\`\`\`

Set these values in \`/opt/manubisguard-panel/.env\`:

\`\`\`dotenv
CUSTOM_TEMPLATES_DIRECTORY="/var/lib/manubisguard/templates/"
SUBSCRIPTION_PAGE_TEMPLATE="subscription/index.html"
\`\`\`

Restart:

\`\`\`sh
sudo manubis restart
\`\`\`

## Build From Source

\`\`\`sh
git clone https://github.com/ManubisGuard/subscription-template.git
cd subscription-template
bun install
bun run build
\`\`\`

The output is \`dist/index.html\`. Install it with:

\`\`\`sh
sudo mkdir -p /var/lib/manubisguard/templates/subscription
sudo cp dist/index.html /var/lib/manubisguard/templates/subscription/index.html
sudo manubis restart
\`\`\`

## Design System

The template follows the ManubisGuard Panel visual system:

- Background: \`#05060B\`
- Primary: \`#6667FD\`
- Secondary: \`#66F0D1\`
- Accent: \`#9B5CFF\`
- Glassmorphism surfaces
- Ambient radial lighting
- Subtle cyber grid
- Controlled border and shadow depth
- Soft motion and hover feedback
- Rounded operational cards

Build-time overrides remain supported:

\`\`\`dotenv
VITE_PRIMARY_COLOR_LIGHT=oklch(0.48 0.11 250)
VITE_PRIMARY_COLOR_DARK=oklch(0.60 0.12 250)
VITE_BORDER_RADIUS=0.65rem
\`\`\`

## Template Data

Existing Panel-provided data remains supported, including user status, traffic, expiry, protocol links, WireGuard, applications, announcements, support URL and usage statistics.

The visual redesign is intentionally separated from this data contract.

## Releases

GitHub Actions builds one HTML artifact per locale. Persian is the default fallback and produces \`index.html\`; locale-specific artifacts are also generated.

## Repositories

- https://github.com/ManubisGuard/subscription-template
- https://github.com/ManubisGuard/ManubisGuard-Panel
- https://github.com/ManubisGuard/ManubisGuard-Node

## License

See the repository \`LICENSE\` file.
