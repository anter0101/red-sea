#!/usr/bin/env bash
# Prove the inactive color before Nginx changes. A failure leaves the live color in place.

set -euo pipefail

ROOT="${REDSEA_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$ROOT"
# shellcheck source=env-file.sh
source "$(dirname "$0")/env-file.sh"

color="${1:-}"
case "$color" in
  blue|green) ;;
  *)
    echo "usage: pre-promote.sh blue|green" >&2
    exit 1
    ;;
esac

backend_port=$(color_backend_port "$color")
frontend_port=$(color_frontend_port "$color")
backend_url="http://127.0.0.1:${backend_port}"
frontend_url="http://127.0.0.1:${frontend_port}"

if [ "${PRE_PROMOTE_DRY_RUN:-}" = "1" ]; then
  printf 'color=%s\n' "$color"
  printf 'backend=%s\n' "$backend_url"
  printf 'frontend=%s\n' "$frontend_url"
  exit 0
fi

compose=(docker compose --file docker-compose.yml --file docker-compose.apps.yml)

wait_healthy() {
  local svc="$1"
  local attempt status id
  for attempt in $(seq 1 36); do
    id="$("${compose[@]}" ps -q "$svc" || true)"
    id=${id%%$'\n'*}
    if [ -n "$id" ]; then
      status=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$id")
      if [ "$status" = "healthy" ]; then
        return 0
      fi
    fi
    sleep 5
  done
  echo "${svc} did not become healthy." >&2
  return 1
}

wait_healthy "backend-${color}"
wait_healthy "frontend-${color}"

py() {
  if command -v python3 >/dev/null 2>&1; then
    python3 "$@"
  else
    python "$@"
  fi
}

http_code() {
  py - "$1" "$2" <<'PY'
import sys, urllib.error, urllib.request
url, dest = sys.argv[1], sys.argv[2]
try:
    with urllib.request.urlopen(url, timeout=15) as response:
        open(dest, "wb").write(response.read())
        print(response.status)
except urllib.error.HTTPError as error:
    open(dest, "wb").write(error.read())
    print(error.code)
PY
}

body=$(mktemp)
trap 'rm -f "$body"' EXIT

backend_code=$(http_code "${backend_url}/api/health" "$body")
if [ "$backend_code" != "200" ]; then
  echo "Inactive backend health returned ${backend_code}." >&2
  exit 1
fi
frontend_code=$(http_code "${frontend_url}/health" "$body")
if [ "$frontend_code" != "200" ]; then
  echo "Inactive frontend health returned ${frontend_code}." >&2
  exit 1
fi

anonymous=$(http_code "${backend_url}/api/journeys?page=1&pageSize=1" "$body")
case "$anonymous" in
  401|403) ;;
  *)
    echo "Unauthenticated GET /api/journeys returned ${anonymous}. Refusing to promote." >&2
    exit 1
    ;;
esac

load_smoke_credentials
export BASE_URL="$backend_url"
smoke_dir="${REDSEA_SMOKE_DIR:-/opt/redsea/smoke}"
if [ ! -f "${smoke_dir}/scripts/run-newman-smoke.mjs" ]; then
  echo "Newman smoke files are missing at ${smoke_dir}." >&2
  exit 1
fi
docker run --rm --network host \
  -e BASE_URL \
  -e SMOKE_ADMIN_EMAIL \
  -e SMOKE_ADMIN_PASSWORD \
  -e SMOKE_EMPLOYEE_EMAIL \
  -e SMOKE_EMPLOYEE_PASSWORD \
  -v "${smoke_dir}:/work" \
  -w /work \
  node:20-alpine \
  node scripts/run-newman-smoke.mjs

load_smoke_credentials
login_body=$(py - <<'PY'
import json, os
print(json.dumps({"email": os.environ["SMOKE_ADMIN_EMAIL"], "password": os.environ["SMOKE_ADMIN_PASSWORD"]}))
PY
)
token_file=$(mktemp)
login_code=$(py - "$backend_url" "$login_body" "$token_file" <<'PY'
import json, sys, urllib.error, urllib.request
base, payload, dest = sys.argv[1], sys.argv[2], sys.argv[3]
request = urllib.request.Request(
    base + "/api/auth/login",
    data=payload.encode(),
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
)
token=$(cat "$token_file")
rm -f "$token_file"
if [ "$login_code" != "200" ] || [ -z "$token" ]; then
  echo "Inactive login failed (${login_code})." >&2
  exit 1
fi

report_dir="${REDSEA_LOG_DIR:-/opt/redsea/log}/zap-${color}"
mkdir -p "$report_dir"
chmod 777 "$report_dir"
py - "$ROOT/zap/api-auth.yaml" "${report_dir}/api-auth.yaml" "$backend_url" "$login_body" "$token" <<'PY'
import pathlib, sys
template, dest, target, login_json, token = sys.argv[1:]
text = pathlib.Path(template).read_text(encoding="utf-8")
for needle in ("__TARGET__", "__LOGIN_JSON__", "__TOKEN__"):
    if needle not in text:
        raise SystemExit(f"ZAP plan is missing {needle}")
quoted_login = __import__("json").dumps(login_json)
text = text.replace("__LOGIN_JSON__", quoted_login)
text = text.replace("Bearer __TOKEN__", "Bearer " + token)
text = text.replace("__TARGET__", target)
pathlib.Path(dest).write_text(text, encoding="utf-8")
PY
docker run --rm --network host \
  -v "${report_dir}:/zap/wrk" \
  ghcr.io/zaproxy/zaproxy:stable \
  zap.sh -cmd -autorun /zap/wrk/api-auth.yaml
if [ ! -f "${report_dir}/zap-report.json" ]; then
  echo "ZAP did not write ${report_dir}/zap-report.json." >&2
  exit 1
fi
rm -f "${report_dir}/api-auth.yaml"
chmod 600 "${report_dir}/zap-report.json" || true
py - "${report_dir}/zap-report.json" <<'PY'
import json, sys
document = json.load(open(sys.argv[1], encoding="utf-8"))
high = medium = 0
for site in document.get("site") or []:
    for alert in site.get("alerts") or []:
        code = str(alert.get("riskcode", ""))
        name = alert.get("name") or alert.get("alert") or "alert"
        if code == "3":
            high += 1
            print(f"HIGH {name}")
        elif code == "2":
            medium += 1
print(f"zap_high={high} zap_medium={medium}")
raise SystemExit(1 if high else 0)
PY
echo "Inactive ${color} passed health, Newman, and the ZAP allowlist."
