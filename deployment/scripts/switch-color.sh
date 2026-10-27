#!/usr/bin/env bash
# Point Nginx at one color, test the config, reload, then record active.json.
# If nginx -t or the public health check fails, the previous upstream file is restored.

set -euo pipefail

ROOT="${REDSEA_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$ROOT"
# shellcheck source=env-file.sh
source "$(dirname "$0")/env-file.sh"

color="${1:-}"
case "$color" in
  blue|green) ;;
  *)
    echo "usage: switch-color.sh blue|green" >&2
    exit 1
    ;;
esac

if [ -z "${APP_RELEASE_SHA:-}" ] || ! printf '%s' "$APP_RELEASE_SHA" | grep -Eq '^[0-9a-f]{40}$'; then
  echo "APP_RELEASE_SHA must be the full git SHA." >&2
  exit 1
fi

backend_source="${BACKEND_DIGEST:-${BACKEND_IMAGE:-}}"
frontend_source="${FRONTEND_DIGEST:-${FRONTEND_IMAGE:-}}"
backend_digest=$(normalize_digest "$backend_source") || {
  echo "BACKEND_IMAGE or BACKEND_DIGEST must be a sha256 digest." >&2
  exit 1
}
frontend_digest=$(normalize_digest "$frontend_source") || {
  echo "FRONTEND_IMAGE or FRONTEND_DIGEST must be a sha256 digest." >&2
  exit 1
}

upstream="${REDSEA_UPSTREAM_FILE:-$ROOT/nginx/upstreams.conf}"
template="${REDSEA_UPSTREAM_TEMPLATE:-$ROOT/nginx/upstreams.conf.template}"
state_file="${REDSEA_STATE_FILE:-/opt/redsea/state/active.json}"
if [ ! -f "$template" ] || [ ! -f "$upstream" ]; then
  echo "Missing ${template} or ${upstream}." >&2
  exit 1
fi

backup=$(mktemp)
cp "$upstream" "$backup"
cleanup() {
  rm -f "$backup"
}
trap cleanup EXIT

rendered=$(mktemp)
sed "s/__COLOR__/${color}/g" "$template" > "$rendered"
if grep -q '__COLOR__' "$rendered"; then
  echo "Upstream template still contains __COLOR__." >&2
  exit 1
fi
cat "$rendered" > "$upstream"
rm -f "$rendered"

restore_upstream() {
  cat "$backup" > "$upstream"
}

nginx_test() {
  case "${SWITCH_NGINX_RESULT:-}" in
    ok) return 0 ;;
    fail) return 1 ;;
  esac
  docker compose --file docker-compose.yml exec -T nginx nginx -t
}

nginx_reload() {
  if [ -n "${SWITCH_NGINX_RESULT:-}" ]; then
    return 0
  fi
  docker compose --file docker-compose.yml exec -T nginx nginx -s reload
}

nginx_start() {
  if [ -n "${SWITCH_NGINX_RESULT:-}" ]; then
    return 0
  fi
  docker compose --file docker-compose.yml up -d --no-deps nginx
}

if [ -z "${SWITCH_NGINX_RESULT:-}" ]; then
  nginx_id=$(docker compose --file docker-compose.yml ps -q nginx || true)
  nginx_id=${nginx_id%%$'\n'*}
  if [ -z "$nginx_id" ]; then
    nginx_start || {
      restore_upstream
      echo "Nginx did not start." >&2
      exit 1
    }
  fi
fi

if ! nginx_test; then
  restore_upstream
  if [ -z "${SWITCH_NGINX_RESULT:-}" ] && [ -z "${nginx_id:-}" ]; then
    nginx_start || true
  fi
  echo "nginx -t failed. Restored the previous upstream file and did not reload." >&2
  exit 1
fi

if [ -z "${SWITCH_NGINX_RESULT:-}" ] && [ -n "${nginx_id:-}" ]; then
  nginx_reload
fi

health_file=$(mktemp)
if [ -n "${SWITCH_HEALTH_FILE:-}" ]; then
  cp "$SWITCH_HEALTH_FILE" "$health_file"
  health_code=200
else
  health_code=$(py - "$health_file" <<'PY'
import sys, urllib.error, urllib.request
dest = sys.argv[1]
try:
    with urllib.request.urlopen("http://127.0.0.1/api/health", timeout=15) as response:
        open(dest, "wb").write(response.read())
        print(response.status)
except urllib.error.HTTPError as error:
    open(dest, "wb").write(error.read())
    print(error.code)
PY
)
fi

got_color=$(json_string_field "$health_file" color || true)
got_sha=$(json_string_field "$health_file" sha || true)
rm -f "$health_file"
if [ "$health_code" != "200" ] || [ "$got_color" != "$color" ] || [ "$got_sha" != "$APP_RELEASE_SHA" ]; then
  restore_upstream
  if [ -z "${SWITCH_NGINX_RESULT:-}" ]; then
    if [ -n "${nginx_id:-}" ]; then
      nginx_reload || true
    else
      nginx_start || true
    fi
  fi
  echo "Public /api/health did not report color=${color} sha=${APP_RELEASE_SHA}." >&2
  exit 1
fi

mkdir -p "$(dirname "$state_file")"
switched_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)
cat > "$state_file" <<EOF
{
  "color": "${color}",
  "backendDigest": "${backend_digest}",
  "frontendDigest": "${frontend_digest}",
  "gitSha": "${APP_RELEASE_SHA}",
  "switchedAt": "${switched_at}"
}
EOF
echo "Nginx is serving ${color} (${APP_RELEASE_SHA})."
