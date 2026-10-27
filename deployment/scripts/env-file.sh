#!/usr/bin/env bash
# Shared helpers for the VPS scripts. Source this file; do not execute it.

read_env_value() {
  local key="$1"
  local file="$2"
  local line
  line=$(grep -E "^${key}=" "$file" | tail -n 1 || true)
  line=${line#*=}
  line=${line%$'\r'}
  if [ "${#line}" -ge 2 ]; then
    local first last
    first=${line:0:1}
    last=${line:${#line}-1:1}
    if { [ "$first" = '"' ] && [ "$last" = '"' ]; } || { [ "$first" = "'" ] && [ "$last" = "'" ]; }; then
      line=${line:1:${#line}-2}
    fi
  fi
  printf '%s' "$line"
}

load_smoke_credentials() {
  local file="${REDSEA_ENV_FILE:-/opt/redsea/.env}"
  if [ -z "${SMOKE_ADMIN_EMAIL:-}" ] && [ -f "$file" ]; then
    SMOKE_ADMIN_EMAIL=$(read_env_value SMOKE_ADMIN_EMAIL "$file")
  fi
  if [ -z "${SMOKE_ADMIN_PASSWORD:-}" ] && [ -f "$file" ]; then
    SMOKE_ADMIN_PASSWORD=$(read_env_value SMOKE_ADMIN_PASSWORD "$file")
  fi
  if [ -z "${SMOKE_EMPLOYEE_EMAIL:-}" ] && [ -f "$file" ]; then
    SMOKE_EMPLOYEE_EMAIL=$(read_env_value SMOKE_EMPLOYEE_EMAIL "$file")
  fi
  if [ -z "${SMOKE_EMPLOYEE_PASSWORD:-}" ] && [ -f "$file" ]; then
    SMOKE_EMPLOYEE_PASSWORD=$(read_env_value SMOKE_EMPLOYEE_PASSWORD "$file")
  fi
  export SMOKE_ADMIN_EMAIL SMOKE_ADMIN_PASSWORD SMOKE_EMPLOYEE_EMAIL SMOKE_EMPLOYEE_PASSWORD
  if [ -z "${SMOKE_ADMIN_EMAIL:-}" ] || [ -z "${SMOKE_ADMIN_PASSWORD:-}" ] || [ -z "${SMOKE_EMPLOYEE_EMAIL:-}" ] || [ -z "${SMOKE_EMPLOYEE_PASSWORD:-}" ]; then
    echo "Set SMOKE_ADMIN_EMAIL, SMOKE_ADMIN_PASSWORD, SMOKE_EMPLOYEE_EMAIL, and SMOKE_EMPLOYEE_PASSWORD in ${file}." >&2
    return 1
  fi
}

color_backend_port() {
  case "$1" in
    blue) printf '18080' ;;
    green) printf '28080' ;;
    *) return 1 ;;
  esac
}

color_frontend_port() {
  case "$1" in
    blue) printf '13000' ;;
    green) printf '23000' ;;
    *) return 1 ;;
  esac
}

normalize_digest() {
  local value="$1"
  local hex
  case "$value" in
    *@sha256:*) hex=${value##*@sha256:} ;;
    sha256:*) hex=${value#sha256:} ;;
    *) return 1 ;;
  esac
  if ! printf '%s' "$hex" | grep -Eq '^[0-9a-f]{64}$'; then
    return 1
  fi
  printf 'sha256:%s' "$hex"
}

json_string_field() {
  local file="$1"
  local key="$2"
  sed -n "s/.*\"${key}\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p" "$file" | head -n 1
}

py() {
  if command -v python3 >/dev/null 2>&1; then
    python3 "$@"
  else
    python "$@"
  fi
}
