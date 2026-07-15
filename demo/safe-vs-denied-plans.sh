#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out_dir="${TMPDIR:-/tmp}/readmesmoke-safe-vs-denied"

cd "$repo_root"
rm -rf "$out_dir"
mkdir -p "$out_dir"

npm run build >/dev/null

node dist/cli.js scan \
  --root examples/basic \
  --config readmesmoke.config.json \
  --json > "$out_dir/basic-plan.json"

node dist/cli.js scan \
  --root examples/basic \
  --config readmesmoke.config.json \
  --markdown > "$out_dir/basic-plan.md"

set +e
node dist/cli.js scan \
  --root examples/unsafe \
  --config readmesmoke.config.json \
  --json > "$out_dir/unsafe-plan.json"
unsafe_status=$?
set -e

test "$unsafe_status" -eq 2
grep -q '"allowed": true' "$out_dir/basic-plan.json"
grep -q '"allowed": false' "$out_dir/unsafe-plan.json"
grep -q 'node hello.js' "$out_dir/basic-plan.md"
grep -q 'sudo echo no' "$out_dir/unsafe-plan.json"

cat > "$out_dir/README.md" <<EOF
# readmesmoke Safe vs Denied Plans

- Allowed plan JSON: basic-plan.json
- Allowed plan Markdown: basic-plan.md
- Denied plan JSON: unsafe-plan.json
- Denied scan exit: $unsafe_status
EOF

echo "Safe vs denied demo: $out_dir"
