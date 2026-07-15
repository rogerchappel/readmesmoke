#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/readmesmoke-demo"
JSON_OUT="$OUT_DIR/release-docs.json"
MARKDOWN_OUT="$OUT_DIR/release-docs.md"

mkdir -p "$OUT_DIR"
cd "$ROOT_DIR"

npm run build

node dist/cli.js scan \
  --json > "$OUT_DIR/plan.json"

node dist/cli.js run \
  --execute \
  --json > "$JSON_OUT"

node dist/cli.js report \
  --input "$JSON_OUT" \
  --markdown > "$MARKDOWN_OUT"

test -s "$OUT_DIR/plan.json"
test -s "$JSON_OUT"
test -s "$MARKDOWN_OUT"
grep -q '"passed"' "$JSON_OUT"
grep -q "readmesmoke" "$MARKDOWN_OUT"

echo "Command plan: $OUT_DIR/plan.json"
echo "JSON run report: $JSON_OUT"
echo "Markdown report: $MARKDOWN_OUT"
