#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/readmesmoke-unsafe-demo"
PLAN_JSON="$OUT_DIR/unsafe-plan.json"
PLAN_MD="$OUT_DIR/unsafe-plan.md"

cd "$ROOT_DIR"
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

npm run build >/dev/null

set +e
node dist/cli.js scan \
  --root examples/unsafe \
  --config readmesmoke.config.json \
  --json > "$PLAN_JSON"
json_status=$?

node dist/cli.js scan \
  --root examples/unsafe \
  --config readmesmoke.config.json \
  --markdown > "$PLAN_MD"
markdown_status=$?
set -e

test "$json_status" -eq 2
test "$markdown_status" -eq 2
test -s "$PLAN_JSON"
test -s "$PLAN_MD"
grep -q '"allowed": false' "$PLAN_JSON"
grep -q 'refuses privileged commands' "$PLAN_JSON"
grep -q 'sudo echo no' "$PLAN_MD"

echo "JSON plan: $PLAN_JSON"
echo "Markdown plan: $PLAN_MD"
echo "Expected denied scan exit: $json_status"
