#!/usr/bin/env bash
set -euo pipefail

LANG_CODE="fa"
VERSION="latest"
DEST_DIR="/var/lib/manubisguard/templates/subscription"
DEST_FILE="\${DEST_DIR}/index.html"
ENV_FILE="/opt/manubisguard-panel/.env"

usage() {
  cat <<'EOF'
Usage: install.sh [--lang en|fa|zh|ru] [--version latest|<tag>]
EOF
}

while [[ \$# -gt 0 ]]; do
  case "\$1" in
    --lang) [[ \$# -ge 2 ]] || exit 1; LANG_CODE="\$2"; shift 2 ;;
    --version) [[ \$# -ge 2 ]] || exit 1; VERSION="\$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: \$1" >&2; usage; exit 1 ;;
  esac
done

case "\$LANG_CODE" in en|fa|zh|ru) ;; *) echo "Invalid language: \$LANG_CODE" >&2; exit 1 ;; esac
[[ -n "\$VERSION" ]] || { echo "Version cannot be empty." >&2; exit 1; }

RELEASE_PATH="latest/download"
if [[ "\$VERSION" != "latest" ]]; then RELEASE_PATH="download/\$VERSION"; fi

URL="https://github.com/ManubisGuard/subscription-template/releases/\${RELEASE_PATH}/\${LANG_CODE}.html"
if [[ "\$LANG_CODE" == "fa" ]]; then
  URL="https://github.com/ManubisGuard/subscription-template/releases/\${RELEASE_PATH}/index.html"
fi

mkdir -p "\$DEST_DIR"
if command -v wget >/dev/null 2>&1; then
  wget -q -O "\$DEST_FILE" "\$URL"
elif command -v curl >/dev/null 2>&1; then
  curl -fsSL "\$URL" -o "\$DEST_FILE"
else
  echo "Error: neither wget nor curl is installed." >&2
  exit 1
fi

mkdir -p "\$(dirname "\$ENV_FILE")"
touch "\$ENV_FILE"
chmod 600 "\$ENV_FILE"

upsert_env() {
  local key="\$1" value="\$2" tmp
  tmp="\$(mktemp)"
  awk -v k="\$key" -v v="\$value" '
    BEGIN { done=0 }
    {
      if (\$0 ~ "^[[:space:]]*" k "[[:space:]]*=") {
        if (!done) { print k "=" v; done=1 }
        next
      }
      print
    }
    END { if (!done) print k "=" v }
  ' "\$ENV_FILE" > "\$tmp"
  mv "\$tmp" "\$ENV_FILE"
}

upsert_env CUSTOM_TEMPLATES_DIRECTORY '"/var/lib/manubisguard/templates/"'
upsert_env SUBSCRIPTION_PAGE_TEMPLATE '"subscription/index.html"'

if command -v manubis >/dev/null 2>&1; then
  manubis restart
  echo "ManubisGuard subscription template installed and Panel restarted."
else
  echo "Installed at \$DEST_FILE. Run 'sudo manubis restart' manually."
fi
