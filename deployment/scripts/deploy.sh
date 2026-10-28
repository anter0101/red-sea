#!/usr/bin/env bash
# Run on the VPS by the release workflow.
# Pin the new images in .env, start the whole stack, then check health through Nginx.

set -euo pipefail

ROOT="${REDSEA_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$ROOT"

: "${BACKEND_IMAGE:?BACKEND_IMAGE is required}"
: "${FRONTEND_IMAGE:?FRONTEND_IMAGE is required}"
: "${APP_RELEASE_SHA:?APP_RELEASE_SHA is required}"

if [ ! -f .env ]; then
  echo "Missing ${ROOT}/.env. Create it from .env.example first." >&2
  exit 1
fi

set_env() {
  if grep -q "^$1=" .env; then
    sed -i "s|^$1=.*|$1=$2|" .env
  else
    printf '%s=%s\n' "$1" "$2" >> .env
  fi
}
set_env BACKEND_IMAGE "$BACKEND_IMAGE"
set_env FRONTEND_IMAGE "$FRONTEND_IMAGE"
set_env APP_RELEASE_SHA "$APP_RELEASE_SHA"

compose=(docker compose --file docker-compose.yml --file docker-compose.apps.yml)
"${compose[@]}" pull backend frontend
"${compose[@]}" up -d --remove-orphans --wait --wait-timeout 300 postgres redis minio backend frontend nginx

check() {
  local url="$1"
  local attempt
  for attempt in $(seq 1 12); do
    if curl -fsS -o /dev/null "$url"; then
      echo "ok ${url}"
      return 0
    fi
    sleep 5
  done
  echo "failed ${url}" >&2
  return 1
}
check http://127.0.0.1/api/health
check http://127.0.0.1/health

"${compose[@]}" ps
echo "Deployed ${APP_RELEASE_SHA}."
