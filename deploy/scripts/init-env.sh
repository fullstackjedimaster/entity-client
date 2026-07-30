#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$BASE_DIR/.env"
EXAMPLE_FILE="$BASE_DIR/.env.example"
ENV_DIR="$BASE_DIR/env"
APP_ENV="$ENV_DIR/entity-client.env"
APP_EXAMPLE="$ENV_DIR/entity-client.env.example"

mkdir -p "$ENV_DIR"

if [[ ! -f "$ENV_FILE" ]]; then
    cp "$EXAMPLE_FILE" "$ENV_FILE"
    echo "Created $ENV_FILE"
fi

if [[ ! -f "$APP_ENV" ]]; then
    cp "$APP_EXAMPLE" "$APP_ENV"
    echo "Created $APP_ENV"
fi

required=(
    API_PROXY_TARGET
    NEXT_PUBLIC_EC_API_BASE_URL
    NEXT_PUBLIC_RAG_DOCK_SCRIPT_URL
    NEXT_PUBLIC_HOST_APP_ID
    NEXT_PUBLIC_HOST_DENSITY
)

for name in "${required[@]}"; do
    if ! grep -qE "^${name}=.+" "$APP_ENV"; then
        echo "ERROR: ${name} is missing in $APP_ENV" >&2
        exit 1
    fi
done

chmod 600 "$ENV_FILE" "$APP_ENV"

echo "Environment initialized:"
echo "  Compose env: $ENV_FILE"
echo "  App env:     $APP_ENV"
