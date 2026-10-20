# ManubisGuard Subscription Template

A responsive, localized browser subscription page for ManubisGuard Panel. Existing subscription payloads and URL behavior are preserved.

## Quick install

Run on the ManubisGuard Panel server. The installer detects the active panel container's data-volume mount when available, builds the selected language, configures the custom-template settings, and recreates **only the panel application container**. It does not restart the database.

```sh
curl -fsSL https://raw.githubusercontent.com/ManubisGuard/subscription-template/main/install.sh -o /tmp/manubisguard-subscription-install.sh
sudo bash /tmp/manubisguard-subscription-install.sh --lang fa
```

Supported languages: `en`, `fa`, `zh`, `ru`. Default: Persian (`fa`).

The default panel directory is `/opt/manubisguard-panel`. It must contain `.env` and `docker-compose.yml`. For a custom location:

```sh
curl -fsSL https://raw.githubusercontent.com/ManubisGuard/subscription-template/main/install.sh -o /tmp/manubisguard-subscription-install.sh
sudo env MANUBISGUARD_PANEL_DIR=/path/to/manubisguard-panel bash /tmp/manubisguard-subscription-install.sh --lang fa
```

Review the installer before running it as root if you want to inspect its actions.

## Install paths and settings

On a standard installation, the host-side HTML file is:

```text
/var/lib/manubisguard/templates/subscription/index.html
```

The panel environment file `/opt/manubisguard-panel/.env` must contain:

```dotenv
CUSTOM_TEMPLATES_DIRECTORY="/var/lib/manubisguard/templates/"
SUBSCRIPTION_PAGE_TEMPLATE="subscription/index.html"
```

The installer reads the actual bind mount for `/var/lib/manubisguard` from the running panel container, so the file is written to the host directory that the panel actually uses. It backs up the previous HTML file and `.env` with timestamps.

To apply the environment settings, it recreates only the application service:

```sh
cd /opt/manubisguard-panel
docker compose up -d --no-deps --force-recreate manubisguard
```

It intentionally avoids `manubis restart`, which restarts the database service as well.

## Branch or tag

Use only a branch or tag that exists in the repository:

```sh
sudo bash /tmp/manubisguard-subscription-install.sh --lang fa --version main
```

The default is `main`. A package version number does not by itself mean a Git tag or GitHub Release exists.

## Manual build and install

```sh
git clone https://github.com/ManubisGuard/subscription-template.git
cd subscription-template
bun install --frozen-lockfile
VITE_FALLBACK_LANGUAGE=fa bun run build
sudo install -D -m 0644 dist/index.html /var/lib/manubisguard/templates/subscription/index.html
```

Set the two environment variables above in `/opt/manubisguard-panel/.env`, then run the service-only Compose command shown above. If your Compose service name or data mount differs from the standard layout, adjust the paths accordingly.

## Build-time customization

```dotenv
VITE_PRIMARY_COLOR_LIGHT=oklch(0.48 0.11 250)
VITE_PRIMARY_COLOR_DARK=oklch(0.60 0.12 250)
VITE_BORDER_RADIUS=0.65rem
```

The design preserves panel-provided subscription-page data, including user status, traffic usage, expiry, protocol links, WireGuard, applications, announcements, support links, and usage statistics.

Repository: https://github.com/ManubisGuard/subscription-template