#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
output_dir="${TMPDIR:-/tmp}/readmesmoke-demo-${RANDOM}"
json_report="${output_dir}/readmesmoke-report.json"
markdown_report="${output_dir}/readmesmoke-report.md"

mkdir -p "${output_dir}"

cd "${repo_root}"

npm run build
node dist/cli.js run --root examples/basic --config readmesmoke.config.json --execute --json > "${json_report}"
node dist/cli.js report --input "${json_report}" --markdown > "${markdown_report}"

grep -q "node hello.js" "${json_report}"
grep -q "readmesmoke fixture" "${json_report}"
grep -q "README" "${markdown_report}"

printf 'JSON report: %s\n' "${json_report}"
printf 'Markdown report: %s\n' "${markdown_report}"
