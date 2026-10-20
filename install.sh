#!/usr/bin/env bash
set -Eeuo pipefail

LANG_CODE="fa"
VERSION="main"
REPO="https://github.com/ManubisGuard/subscription-template.git"
PANEL_DIR="${MANUBISGUARD_PANEL_DIR:-/opt/manubisguard-panel}"
ENV_FILE="${PANEL_DIR}/.env"
COMPOSE_FILE="${PANEL_DIR}/docker-compose.yml"
WORK_DIR="$(mktemp -d /tmp/manubisguard-subscription.XXXXXX)"

cleanup() { rm -rf "$WORK_DIR"; }
trap cleanup EXIT

usage() {
  cat <<'EOF'
Usage: install.sh [--lang en|fa|zh|ru] [--version <branch-or-tag>]
Environment override: MANUBISGUARD_PANEL_DIR=/path/to/manubisguard-panel
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --lang) [[ $# -ge 2 ]] || { usage >&2; exit 2; }; LANG_CODE="$2"; shift 2 ;;
    --version) [[ $# -ge 2 ]] || { usage >&2; exit 2; }; VERSION="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage >&2; exit 2 ;;
  esac
done

case "$LANG_CODE" in en|fa|zh|ru) ;; *) echo "Unsupported language: $LANG_CODE" >&2; exit 2 ;; esac
[[ -n "$VERSION" ]] || { echo "Version/branch cannot be empty." >&2; exit 2; }
[[ "$EUID" -eq 0 ]] || { echo "Run this installer as root, for example: curl ... | sudo bash -s -- --lang fa" >&2; exit 1; }

for cmd in git curl docker awk install mktemp; do
  command -v "$cmd" >/dev/null 2>&1 || { echo "Required command not found: $cmd" >&2; exit 1; }
done
docker compose version >/dev/null 2>&1 || { echo "Docker Compose v2 is required." >&2; exit 1; }

if [[ ! -f "$COMPOSE_FILE" || ! -f "$ENV_FILE" ]]; then
  echo "ManubisGuard Panel installation was not found at: $PANEL_DIR" >&2
  echo "Expected both docker-compose.yml and .env. Set MANUBISGUARD_PANEL_DIR if the panel is elsewhere." >&2
  exit 1
fi

read_env() {
  local key="$1"
  awk -v k="$key" '
    /^[[:space:]]*#/ { next }
    {
      line=$0
      sub(/^[[:space:]]*/, "", line)
      if (line ~ ("^" k "[[:space:]]*=")) {
        sub("^[^=]*=[[:space:]]*", "", line)
        gsub(/^"/, "", line)
        gsub(/"$/, "", line)
        print line
        exit
      }
    }
  ' "$ENV_FILE"
}

PANEL_SERVICE="$(read_env MANUBISGUARD_COMPOSE_SERVICE)"
PANEL_SERVICE="${PANEL_SERVICE:-manubisguard}"
DATA_DIR="$(read_env MANUBISGUARD_DATA_DIR)"
DATA_DIR="${DATA_DIR:-/var/lib/manubisguard}"

# Prefer the actual bind mount from the running Panel container. This prevents
# installing the file into a host directory that the container does not mount.
HOST_DATA_DIR="$DATA_DIR"
CONTAINER_DATA_DIR="$DATA_DIR"
CONTAINER_ID="$(cd "$PANEL_DIR" && docker compose -f "$COMPOSE_FILE" ps -q "$PANEL_SERVICE" 2>/dev/null | head -n 1 || true)"
if [[ -n "$CONTAINER_ID" ]]; then
  MOUNT_INFO="$(docker inspect --format '{{range .Mounts}}{{if eq .Destination "/var/lib/manubisguard"}}{{.Source}}|{{.Destination}}{{end}}{{end}}' "$CONTAINER_ID" 2>/dev/null || true)"
  if [[ "$MOUNT_INFO" == *"|"* ]]; then
    HOST_DATA_DIR="${MOUNT_INFO%%|*}"
    CONTAINER_DATA_DIR="${MOUNT_INFO#*|}"
  fi
fi

[[ "$HOST_DATA_DIR" = /* && "$CONTAINER_DATA_DIR" = /* ]] || {
  echo "Could not determine a valid absolute Panel data directory." >&2
  exit 1
}

DEST_DIR="${HOST_DATA_DIR%/}/templates/subscription"
DEST_FILE="$DEST_DIR/index.html"
TEMPLATE_CONTAINER_DIR="${CONTAINER_DATA_DIR%/}/templates/"
TEMPLATE_NAME="subscription/index.html"

if ! command -v bun >/dev/null 2>&1; then
  echo "Bun is not installed; installing Bun for root..."
  export BUN_INSTALL="${BUN_INSTALL:-/root/.bun}"
  curl -fsSL https://bun.sh/install | bash
  export PATH="$BUN_INSTALL/bin:$PATH"
fi
command -v bun >/dev/null 2>&1 || { echo "Bun installation failed." >&2; exit 1; }

echo "Building ManubisGuard subscription template (language=$LANG_CODE, ref=$VERSION)..."
git clone --depth 1 --branch "$VERSION" "$REPO" "$WORK_DIR/repo"
cd "$WORK_DIR/repo"
bun install --frozen-lockfile
VITE_FALLBACK_LANGUAGE="$LANG_CODE" bun run build
[[ -s dist/index.html ]] || { echo "Build did not produce dist/index.html." >&2; exit 1; }

# Back up the current template and environment before changing either.
if [[ -f "$DEST_FILE" ]]; then
  cp -a "$DEST_FILE" "${DEST_FILE}.bak.$(date +%Y%m%d%H%M%S)"
fi
cp -a "$ENV_FILE" "${ENV_FILE}.bak.$(date +%Y%m%d%H%M%S)"

install -d -m 0755 "$DEST_DIR"
TMP_DEST="$(mktemp "$DEST_DIR/.index.html.XXXXXX")"
install -m 0644 dist/index.html "$TMP_DEST"
mv -f "$TMP_DEST" "$DEST_FILE"

upsert_env() {
  local key="$1" value="$2" tmp
  tmp="$(mktemp "${ENV_FILE}.XXXXXX")"
  awk -v k="$key" -v v="$value" '
    BEGIN { done=0 }
    {
      line=$0
      sub(/^[[:space:]]*/, "", line)
      if (line ~ ("^" k "[[:space:]]*=")) {
        if (!done) { print k "=" v; done=1 }
        next
      }
      print
    }
    END { if (!done) print k "=" v }
  ' "$ENV_FILE" > "$tmp"
  cat "$tmp" > "$ENV_FILE"
  rm -f "$tmp"
  chmod 600 "$ENV_FILE"
}

upsert_env CUSTOM_TEMPLATES_DIRECTORY "\"$TEMPLATE_CONTAINER_DIR\""
upsert_env SUBSCRIPTION_PAGE_TEMPLATE "\"$TEMPLATE_NAME\""

# Recreate only the Panel application so the changed env settings are loaded.
# Do not run 'manubis restart': it restarts the database service too.
echo "Applying template settings and recreating only service: $PANEL_SERVICE"
cd "$PANEL_DIR"
docker compose -f "$COMPOSE_FILE" up -d --no-deps --force-recreate "$PANEL_SERVICE"

echo
echo "Subscription page template installed successfully."
echo "Host file:      $DEST_FILE"
echo "Container path: $TEMPLATE_CONTAINER_DIR$TEMPLATE_NAME"
echo "Panel service:  $PANEL_SERVICE"
echo "Database service was not restarted."