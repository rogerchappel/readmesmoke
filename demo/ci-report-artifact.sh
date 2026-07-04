#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OUT_DIR="${OUT_DIR:-tmp/ci-report-artifact}"
mkdir -p "$OUT_DIR"

npm run build

set +e
node dist/cli.js scan --root examples/ci-report --config readmesmoke.config.json --json > "$OUT_DIR/plan.json"
scan_status=$?
node dist/cli.js run --root examples/ci-report --config readmesmoke.config.json --execute --json > "$OUT_DIR/run.json"
run_status=$?
set -e

test "$scan_status" -eq 2
test "$run_status" -eq 1
node dist/cli.js report --input "$OUT_DIR/run.json" --markdown > "$OUT_DIR/report.md"

grep -q "docs are runnable" "$OUT_DIR/run.json"
grep -q "npm publish" "$OUT_DIR/plan.json"
grep -q "README" "$OUT_DIR/report.md"

printf 'Wrote CI report artifacts to %s\n' "$OUT_DIR"
