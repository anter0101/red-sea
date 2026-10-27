#!/usr/bin/env bash
# Start the inactive color and leave the live color containers alone.
# Missing /opt/redsea/state/active.json means first boot: prepare blue.
# The release workflow runs this on the VPS over SSH. It does not edit Nginx.

set -euo pipefail

ROOT="${REDSEA_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
STATE_FILE="${REDSEA_STATE_FILE:-/opt/redsea/state/active.json}"
cd "$ROOT"

require_digest() {
  local name="$1"
  local value="$2"
  if ! printf '%s' "$value" | grep -Eq '^[^[:space:]]+@sha256:[0-9a-f]{64}$'; then
    echo "${name} must be a registry digest (name@sha256:<64 hex>)." >&2
    exit 1
  fi
}

if [ -z "${BACKEND_IMAGE:-}" ] || [ -z "${FRONTEND_IMAGE:-}" ] || [ -z "${APP_RELEASE_SHA:-}" ]; then
  echo "BACKEND_IMAGE, FRONTEND_IMAGE, and APP_RELEASE_SHA are required." >&2
  exit 1
fi
require_digest BACKEND_IMAGE "$BACKEND_IMAGE"
require_digest FRONTEND_IMAGE "$FRONTEND_IMAGE"
if ! printf '%s' "$APP_RELEASE_SHA" | grep -Eq '^[0-9a-f]{40}$'; then
  echo "APP_RELEASE_SHA must be the full git SHA." >&2
  exit 1
fi

active=""
if [ -f "$STATE_FILE" ]; then
  active=$(sed -n 's/.*"color"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$STATE_FILE" | head -n 1 || true)
  active=${active//$'\r'/}
  if [ -z "$active" ]; then
    echo "No color in ${STATE_FILE}." >&2
    exit 1
  fi
fi

case "$active" in
  "") color=blue ;;
  blue) color=green ;;
  green) color=blue ;;
  *)
    echo "Color in ${STATE_FILE} must be blue or green (got ${active})." >&2
    exit 1
    ;;
esac

if [ "$color" = "blue" ]; then
  live=green
else
  live=blue
fi

if [ "${PREPARE_INACTIVE_DRY_RUN:-}" = "1" ]; then
  printf 'color=%s\n' "$color"
  printf 'start=backend-%s frontend-%s\n' "$color" "$color"
  printf 'leave=backend-%s frontend-%s\n' "$live" "$live"
  exit 0
fi

export BACKEND_IMAGE FRONTEND_IMAGE APP_RELEASE_SHA

compose=(docker compose --file docker-compose.yml --file docker-compose.apps.yml)

service_id() {
  local svc="$1"
  local status="${2:-}"
  if [ -n "$status" ]; then
    "${compose[@]}" ps --status "$status" -q "$svc"
  else
    "${compose[@]}" ps -q "$svc"
  fi
}

first_id() {
  local id="$1"
  id="${id//$'\r'/}"
  printf '%s' "${id%%$'\n'*}"
}

require_running() {
  local svc="$1"
  local id
  id="$(first_id "$(service_id "$svc" running)")"
  if [ -z "$id" ]; then
    echo "Shared service ${svc} is not running. Start postgres, redis, and minio first." >&2
    return 1
  fi
  printf '%s' "$id"
}

postgres_before="$(require_running postgres)" || exit 1
redis_before="$(require_running redis)" || exit 1
minio_before="$(require_running minio)" || exit 1
nginx_before="$(first_id "$(service_id nginx)")"
live_backend_before="$(first_id "$(service_id "backend-${live}")")"
live_frontend_before="$(first_id "$(service_id "frontend-${live}")")"

"${compose[@]}" up -d --no-deps --force-recreate --pull always \
  "backend-${color}" "frontend-${color}"

assert_same() {
  local label="$1"
  local before="$2"
  local after="$3"
  if [ "$before" != "$after" ]; then
    echo "${label} container id changed (${before} -> ${after})." >&2
    exit 1
  fi
}

postgres_after="$(require_running postgres)" || exit 1
redis_after="$(require_running redis)" || exit 1
minio_after="$(require_running minio)" || exit 1
assert_same postgres "$postgres_before" "$postgres_after"
assert_same redis "$redis_before" "$redis_after"
assert_same minio "$minio_before" "$minio_after"

if [ -n "$nginx_before" ]; then
  nginx_after="$(first_id "$(service_id nginx)")"
  assert_same nginx "$nginx_before" "$nginx_after"
fi
if [ -n "$live_backend_before" ]; then
  live_backend_after="$(first_id "$(service_id "backend-${live}")")"
  assert_same "backend-${live}" "$live_backend_before" "$live_backend_after"
fi
if [ -n "$live_frontend_before" ]; then
  live_frontend_after="$(first_id "$(service_id "frontend-${live}")")"
  assert_same "frontend-${live}" "$live_frontend_before" "$live_frontend_after"
fi

printf 'color=%s\n' "$color"
printf 'backend=%s\n' "$BACKEND_IMAGE"
printf 'frontend=%s\n' "$FRONTEND_IMAGE"
printf 'sha=%s\n' "$APP_RELEASE_SHA"
