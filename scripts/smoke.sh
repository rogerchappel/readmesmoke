#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

json_out="${TMPDIR:-/tmp}/readmesmoke-smoke.json"
node dist/cli.js run --execute --json > "$json_out"
node -e "const fs=require('node:fs'); const report=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); if (report.totals.passed !== 2 || report.totals.skipped !== 1 || report.totals.failed !== 0) { console.error(report.totals); process.exit(1); }" "$json_out"
node dist/cli.js report --input "$json_out" --markdown >/dev/null
printf 'readmesmoke smoke passed: %s\n' "$json_out"
