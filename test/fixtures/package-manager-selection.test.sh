#!/usr/bin/env bash
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
project="$tmp/project"
mkdir -p "$project/.github" "$project/docs" "$project/scripts" "$tmp/bin"
for file in README.md AGENTS.md CONTRIBUTING.md SECURITY.md; do touch "$project/$file"; done
touch "$project/.github/pull_request_template.md"
cp "$repo_root/scripts/validate.sh" "$project/scripts/validate.sh"
printf '{"scripts":{"check":"true"}}\n' > "$project/package.json"
touch "$project/package-lock.json"
for manager in bun pnpm yarn npm; do
  printf '#!/usr/bin/env bash\nprintf "%%s\\n" "$(basename "$0") $*" >> "$CALL_LOG"\n' > "$tmp/bin/$manager"
  chmod +x "$tmp/bin/$manager"
done
export CALL_LOG="$tmp/calls" PATH="$tmp/bin:$PATH"
(cd "$project" && bash scripts/validate.sh > "$tmp/output")
grep -q 'using package manager: npm' "$tmp/output"
grep -q '^npm run check$' "$CALL_LOG"
if grep -Eq '^(bun|pnpm|yarn) ' "$CALL_LOG"; then
  echo 'validator used a manager other than the package-lock manager' >&2
  exit 1
fi
