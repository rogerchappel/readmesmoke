#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

npm run build

report_dir="${TMPDIR:-/tmp}/readmesmoke-demo"
rm -rf "$report_dir"
mkdir -p "$report_dir"

node dist/cli.js run --execute --json > "$report_dir/basic-report.json"
node dist/cli.js report --input "$report_dir/basic-report.json" --markdown > "$report_dir/basic-report.md"

test -s "$report_dir/basic-report.json"
test -s "$report_dir/basic-report.md"

echo "JSON report: $report_dir/basic-report.json"
echo "Markdown report: $report_dir/basic-report.md"
