#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$BASE_DIR/.env"
EXAMPLE_FILE="$BASE_DIR/.env.example"
ENV_DIR="$BASE_DIR/env"
APP_ENV="$ENV_DIR/entity-client.env"

mkdir -p "$ENV_DIR"

ensure_file_from_example() {
  local src="$1"
  local dst="$2"
  if [[ ! -f "$dst" ]]; then
    cp "$src" "$dst"
    echo "Created $dst"
  fi
}

get_value() {
  local file="$1"
  local key="$2"
  grep -E "^${key}=" "$file" | head -n1 | cut -d= -f2- || true
}

ensure_file_from_example "$EXAMPLE_FILE" "$ENV_FILE"

NEXT_PUBLIC_EC_API_BASE_URL="$(get_value "$ENV_FILE" "NEXT_PUBLIC_EC_API_BASE_URL")"
NEXT_PUBLIC_EC_DEFAULT_JWT="$(get_value "$ENV_FILE" "NEXT_PUBLIC_EC_DEFAULT_JWT")"
API_PROXY_TARGET="$(get_value "$ENV_FILE" "API_PROXY_TARGET")"
PORT="$(get_value "$ENV_FILE" "PORT")"

if [[ -z "$NEXT_PUBLIC_EC_API_BASE_URL" ]]; then
  echo "ERROR: NEXT_PUBLIC_EC_API_BASE_URL is missing in $ENV_FILE"
  exit 1
fi

if [[ -z "$API_PROXY_TARGET" ]]; then
  echo "ERROR: API_PROXY_TARGET is missing in $ENV_FILE"
  exit 1
fi

if [[ -z "$PORT" ]]; then
  PORT="3000"
fi

cat > "$APP_ENV" <<EOF
NEXT_PUBLIC_EC_API_BASE_URL=${NEXT_PUBLIC_EC_API_BASE_URL}
NEXT_PUBLIC_EC_DEFAULT_JWT=${NEXT_PUBLIC_EC_DEFAULT_JWT}
API_PROXY_TARGET=${API_PROXY_TARGET}
PORT=${PORT}
EOF

chmod 600 "$ENV_FILE" "$APP_ENV"

echo
echo "Environment initialized."
echo "  base env:  $ENV_FILE"
echo "  app env:   $APP_ENV"
echo
echo "Resolved values:"
echo "  NEXT_PUBLIC_EC_API_BASE_URL=$NEXT_PUBLIC_EC_API_BASE_URL"
echo "  API_PROXY_TARGET=$API_PROXY_TARGET"
echo "  PORT=$PORT"
