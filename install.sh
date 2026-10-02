#!/usr/bin/env bash
set -euo pipefail

LANG_CODE="fa"
VERSION="main"
REPO="https://github.com/ManubisGuard/subscription-template.git"
DEST_DIR="/var/lib/manubisguard/templates/subscription"
DEST_FILE="${DEST_DIR}/index.html"
ENV_FILE="/opt/manubisguard-panel/.env"
WORK_DIR="$(mktemp -d /tmp/manubisguard-subscription.XXXXXX)"

cleanup() {
  rm -rf "$WORK_DIR"
}
trap cleanup EXIT

usage() {
  cat <<'EOF'
Usage: install.sh [--lang en|fa|zh|ru] [--version main|<branch-or-tag>]
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --lang) [[ $# -ge 2 ]] || exit 1; LANG_CODE="$2"; shift 2 ;;
    --version) [[ $# -ge 2 ]] || exit 1; VERSION="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage; exit 1 ;;
  esac
done

case "$LANG_CODE" in en|fa|zh|ru) ;; *) echo "Invalid language: $LANG_CODE" >&2; exit 1 ;; esac
[[ -n "$VERSION" ]] || { echo "Version cannot be empty." >&2; exit 1; }

for cmd in git; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: $cmd is required. Install it and run this installer again." >&2
    exit 1
  fi
done

echo "Cloning ManubisGuard subscription template from $REPO ..."
git clone --depth 1 --branch "$VERSION" "$REPO" "$WORK_DIR/repo" >/dev/null 2>&1

cd "$WORK_DIR/repo"

if ! command -v bun >/dev/null 2>&1; then
  echo "Bun is not installed. Installing Bun ..."
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
  export PATH="$BUN_INSTALL/bin:$PATH"
fi

bun install --frozen-lockfile >/dev/null
VITE_FALLBACK_LANGUAGE="$LANG_CODE" bun run build >/dev/null

mkdir -p "$DEST_DIR"
cp dist/index.html "$DEST_FILE"

mkdir -p "$(dirname "$ENV_FILE")"
touch "$ENV_FILE"
chmod 600 "$ENV_FILE"

upsert_env() {
  local key="$1" value="$2" tmp
  tmp="$(mktemp)"
  awk -v k="$key" -v v="$value" '
    BEGIN { done=0 }
    {
      if ($0 ~ "^[[:space:]]*" k "[[:space:]]*=") {
        if (!done) { print k "=" v; done=1 }
        next
      }
      print
    }
    END { if (!done) print k "=" v }
  ' "$ENV_FILE" > "$tmp"
  mv "$tmp" "$ENV_FILE"
}

upsert_env CUSTOM_TEMPLATES_DIRECTORY '"/var/lib/manubisguard/templates/"'
upsert_env SUBSCRIPTION_PAGE_TEMPLATE '"subscription/index.html"'

if command -v manubis >/dev/null 2>&1; then
  manubis restart
  echo "ManubisGuard subscription template installed from your fork."
else
  echo "Installed at $DEST_FILE. Run 'sudo manubis restart' manually."
fi
