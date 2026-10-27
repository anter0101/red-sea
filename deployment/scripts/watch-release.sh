#!/usr/bin/env bash
# Watch the color that just became public. On failure, switch Nginx back.
# 5xx share is judged only after MIN_SAMPLES access-log lines. The limit is MAX_5XX_PERCENT.

set -euo pipefail

ROOT="${REDSEA_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$ROOT"
# shellcheck source=env-file.sh
source "$(dirname "$0")/env-file.sh"

MIN_SAMPLES="${MIN_SAMPLES:-20}"
MAX_5XX_PERCENT="${MAX_5XX_PERCENT:-5}"
WINDOW_SECONDS="${WINDOW_SECONDS:-180}"
INTERVAL_SECONDS="${INTERVAL_SECONDS:-10}"

count_statuses() {
  local file="$1"
  local total=0
  local bad=0
  local status line
  while IFS= read -r line; do
    status=$(printf '%s\n' "$line" | sed -n 's/.*status=\([0-9][0-9][0-9]\).*/\1/p')
    if [ -n "$status" ]; then
      total=$((total + 1))
      case "$status" in
        5*) bad=$((bad + 1)) ;;
      esac
    fi
  done < "$file"
  printf '%s %s\n' "$total" "$bad"
}

if [ "${WATCH_RELEASE_COUNT_ONLY:-}" = "1" ]; then
  count_statuses "$1"
  exit 0
fi

state_file="${REDSEA_STATE_FILE:-/opt/redsea/state/active.json}"
previous_file="${REDSEA_PREVIOUS_FILE:-/opt/redsea/state/previous.json}"
if [ ! -f "$state_file" ]; then
  echo "result=failed"
  echo "No active.json. Nothing to watch." >&2
  exit 1
fi

expected_color=$(json_string_field "$state_file" color)
expected_sha=$(json_string_field "$state_file" gitSha)
backend_digest=$(json_string_field "$state_file" backendDigest)
frontend_digest=$(json_string_field "$state_file" frontendDigest)
case "$expected_color" in
  blue|green) ;;
  *)
    echo "result=failed"
    echo "active.json color is not blue or green." >&2
    exit 1
    ;;
esac

fail_window() {
  local reason="$1"
  echo "Watch failed: ${reason}" >&2
  if [ ! -f "$previous_file" ]; then
    echo "result=failed"
    echo "No previous color. Leaving ${expected_color} in place." >&2
    exit 1
  fi
  local previous_color previous_sha previous_backend previous_frontend
  previous_color=$(json_string_field "$previous_file" color)
  previous_sha=$(json_string_field "$previous_file" gitSha)
  previous_backend=$(json_string_field "$previous_file" backendDigest)
  previous_frontend=$(json_string_field "$previous_file" frontendDigest)
  if [ "$previous_color" != "blue" ] && [ "$previous_color" != "green" ]; then
    echo "result=rollback_failed"
    exit 1
  fi
  BACKEND_DIGEST="$previous_backend" \
    FRONTEND_DIGEST="$previous_frontend" \
    APP_RELEASE_SHA="$previous_sha" \
    bash "$(dirname "$0")/switch-color.sh" "$previous_color" || {
      echo "result=rollback_failed"
      exit 1
    }
  echo "result=rolled_back"
  echo "color=${previous_color}"
  echo "sha=${previous_sha}"
  echo "backend=${previous_backend}"
  echo "frontend=${previous_frontend}"
  exit 1
}

http_code() {
  py - "$1" "$2" "${3:-}" <<'PY'
import sys, urllib.error, urllib.request
url, dest, token = sys.argv[1], sys.argv[2], sys.argv[3]
request = urllib.request.Request(url)
if token:
    request.add_header("Authorization", "Bearer " + token)
try:
    with urllib.request.urlopen(request, timeout=15) as response:
        open(dest, "wb").write(response.read())
        print(response.status)
except urllib.error.HTTPError as error:
    open(dest, "wb").write(error.read())
    print(error.code)
PY
}

load_smoke_credentials
body=$(mktemp)
trap 'rm -f "$body"' EXIT
frontend_port=$(color_frontend_port "$expected_color")
compose=(docker compose --file docker-compose.yml --file docker-compose.apps.yml)
edge=(docker compose --file docker-compose.yml)

container_id() {
  local id
  id="$("${compose[@]}" ps -q "$1" || true)"
  printf '%s' "${id%%$'\n'*}"
}

backend_id=$(container_id "backend-${expected_color}")
frontend_id=$(container_id "frontend-${expected_color}")
if [ -z "$backend_id" ] || [ -z "$frontend_id" ]; then
  fail_window "color container is missing"
fi

restart_count() {
  docker inspect --format '{{.RestartCount}}' "$1"
}

running_state() {
  docker inspect --format '{{.State.Status}}' "$1"
}

backend_restarts=$(restart_count "$backend_id")
frontend_restarts=$(restart_count "$frontend_id")
log_start="$("${edge[@]}" exec -T nginx sh -c 'wc -l < /var/log/nginx/access.log' 2>/dev/null || printf '0')"
log_start=$(printf '%s' "$log_start" | tr -d '[:space:]')
case "$log_start" in
  ''|*[!0-9]*) log_start=0 ;;
esac

login() {
  py - "$body" <<'PY'
import json, os, sys, urllib.error, urllib.request
dest = sys.argv[1]
payload = json.dumps({
    "email": os.environ["SMOKE_ADMIN_EMAIL"],
    "password": os.environ["SMOKE_ADMIN_PASSWORD"],
}).encode()
request = urllib.request.Request(
    "http://127.0.0.1/api/auth/login",
    data=payload,
    headers={"Content-Type": "application/json"},
    method="POST",
)
try:
    with urllib.request.urlopen(request, timeout=20) as response:
        document = json.load(response)
        code = response.status
except urllib.error.HTTPError as error:
    document = {}
    code = error.code
token = document.get("token") if isinstance(document, dict) else ""
open(dest, "w", encoding="utf-8").write(token or "")
print(code)
PY
}

probe() {
  local code token login_code
  code=$(http_code "http://127.0.0.1/api/health" "$body" "")
  if [ "$code" != "200" ]; then
    echo "public health ${code}" >&2
    return 1
  fi
  if [ "$(json_string_field "$body" color)" != "$expected_color" ]; then
    echo "public health color changed" >&2
    return 1
  fi
  code=$(http_code "http://127.0.0.1:${frontend_port}/health" "$body" "")
  if [ "$code" != "200" ]; then
    echo "frontend health ${code}" >&2
    return 1
  fi
  login_code=$(login)
  token=$(cat "$body")
  if [ "$login_code" != "200" ] || [ -z "$token" ]; then
    echo "login ${login_code}" >&2
    return 1
  fi
  code=$(http_code "http://127.0.0.1/api/journeys?page=1&pageSize=1&sortField=id&sortOrder=DESC" "$body" "$token")
  if [ "$code" != "200" ]; then
    echo "journeys ${code}" >&2
    return 1
  fi
}

check_containers() {
  local id state restarts
  for pair in "backend-${expected_color}:${backend_id}:${backend_restarts}" "frontend-${expected_color}:${frontend_id}:${frontend_restarts}"; do
    id=$(container_id "${pair%%:*}")
    if [ "$id" != "$(printf '%s' "$pair" | cut -d: -f2)" ]; then
      echo "container id changed" >&2
      return 1
    fi
    state=$(running_state "$id")
    restarts=$(restart_count "$id")
    if [ "$state" != "running" ] || [ "$restarts" != "$(printf '%s' "$pair" | cut -d: -f3)" ]; then
      echo "container restarted" >&2
      return 1
    fi
    docker stats --no-stream --format '{{.Name}} cpu={{.CPUPerc}} mem={{.MemUsage}}' "$id" || true
  done
}

deadline=$((SECONDS + WINDOW_SECONDS))
while [ "$SECONDS" -lt "$deadline" ]; do
  probe || fail_window "health or login"
  check_containers || fail_window "container exited or restarted"
  sleep "$INTERVAL_SECONDS"
done

log_slice=$(mktemp)
"${edge[@]}" exec -T nginx sh -c "tail -n +$((log_start + 1)) /var/log/nginx/access.log" > "$log_slice" || true
read -r sample_total sample_bad < <(count_statuses "$log_slice")
rm -f "$log_slice"
echo "access_log samples=${sample_total} 5xx=${sample_bad} min=${MIN_SAMPLES} max_percent=${MAX_5XX_PERCENT}"
if [ "$sample_total" -ge "$MIN_SAMPLES" ] && [ $((sample_bad * 100)) -gt $((sample_total * MAX_5XX_PERCENT)) ]; then
  fail_window "5xx share ${sample_bad}/${sample_total}"
fi

echo "result=success"
echo "color=${expected_color}"
echo "sha=${expected_sha}"
echo "backend=${backend_digest}"
echo "frontend=${frontend_digest}"
