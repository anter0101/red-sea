#!/usr/bin/env bash
# Run on the VPS after the release images are on GHCR.
# Prepare the idle color, prove it, switch Nginx, then watch. Do not prune images.

set -euo pipefail

ROOT="${REDSEA_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$ROOT"
mkdir -p /opt/redsea/state /opt/redsea/log /opt/redsea/smoke

if [ -f /opt/redsea/state/active.json ]; then
  cp /opt/redsea/state/active.json /opt/redsea/state/previous.json
else
  rm -f /opt/redsea/state/previous.json
fi

prepare_out=$(bash scripts/prepare-inactive.sh)
printf '%s\n' "$prepare_out"
color=$(printf '%s\n' "$prepare_out" | sed -n 's/^color=//p' | head -n 1)
if [ "$color" != "blue" ] && [ "$color" != "green" ]; then
  echo "result=failed"
  echo "prepare-inactive did not choose a color." >&2
  exit 1
fi

bash scripts/pre-promote.sh "$color"
bash scripts/switch-color.sh "$color"

set +e
watch_out=$(bash scripts/watch-release.sh)
watch_status=$?
set -e
printf '%s\n' "$watch_out"
exit "$watch_status"
