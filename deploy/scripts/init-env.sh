#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_DIR="$BASE_DIR/env"
ENV_FILE="$ENV_DIR/entity-client.env"
EXAMPLE_FILE="$ENV_DIR/entity-client.env.example"



mkdir -p "$ENV_DIR"

if [[ ! -f "$ENV_FILE" ]]; then
    cp "$EXAMPLE_FILE" "$ENV_FILE"
    echo "Created $ENV_FILE"
fi

required=(
    API_PROXY_TARGET
    NEXT_PUBLIC_API_BASE_URL
)

for name in "${required[@]}"; do
    if ! grep -qE "^${name}=.+" "$ENV_FILE"; then
        echo "ERROR: ${name} is missing in $ENV_FILE" >&2
        exit 1
    fi
done

chmod 600 "$ENV_FILE"

echo "Environment initialized:"
echo "  Compose env: $ENV_FILE"

