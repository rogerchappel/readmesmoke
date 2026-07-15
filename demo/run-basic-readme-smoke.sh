#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

npm run build >/dev/null

rm -rf .tmp/readmesmoke-demo
mkdir -p .tmp/readmesmoke-demo

node dist/cli.js scan --json > .tmp/readmesmoke-demo/plan.json || scan_code=$?
scan_code="${scan_code:-0}"
if [ "$scan_code" -ne 0 ]; then
  printf 'scan returned %s; expected all demo commands to be allowed\n' "$scan_code" >&2
  exit "$scan_code"
fi

node dist/cli.js run --execute --json > .tmp/readmesmoke-demo/report.json
node dist/cli.js report --input .tmp/readmesmoke-demo/report.json --markdown > .tmp/readmesmoke-demo/report.md

node -e "const fs=require('node:fs'); const report=JSON.parse(fs.readFileSync('.tmp/readmesmoke-demo/report.json','utf8')); if (report.totals.passed !== 2 || report.totals.failed !== 0 || report.totals.denied !== 0) { console.error(report.totals); process.exit(1); }"
grep -q "node hello.js" .tmp/readmesmoke-demo/report.md

printf 'JSON report: .tmp/readmesmoke-demo/report.json\n'
printf 'Markdown report: .tmp/readmesmoke-demo/report.md\n'
