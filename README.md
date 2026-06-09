# readmesmoke

`readmesmoke` is a local-first TypeScript CLI that smoke-tests runnable commands in READMEs and docs. It extracts shell snippets, checks them against an explicit allowlist, runs approved commands in a temporary fixture workspace, and writes a crisp pass/fail report.

It is intentionally boring about safety: dry-run first, default-deny execution, no telemetry, no cloud service, no secret collection.

## Install

```sh
npm install --save-dev readmesmoke
```

Or run this repo locally:

```sh
npm install
npm run build
node dist/cli.js scan
```

## Quick start

Create `readmesmoke.config.json`:

```json
{
  "docs": ["README.md", "docs/**/*.md"],
  "allow": ["^npm test$", "^node examples/hello\\.js$", "^echo .+$"],
  "fixtures": ["examples"],
  "timeoutMs": 10000
}
```

Scan docs without executing anything:

```sh
readmesmoke scan --json
```

Execute only allowlisted commands:

```sh
readmesmoke run --execute --json > readmesmoke-report.json
```

Render a Markdown report later:

```sh
readmesmoke report --input readmesmoke-report.json --markdown
```

## How commands are discovered

`readmesmoke` captures:

- fenced `bash`, `sh`, `shell`, `zsh`, and `console` blocks;
- any fenced block immediately preceded by `<!-- readmesmoke: run -->`.

Prompts like `$ npm test` and `> echo hi` are normalized before planning.

## Safety model

- Commands are skipped unless they match an allowlist regex.
- Built-in risk checks deny obvious foot-guns like `sudo`, `rm -rf /`, SSH/SCP, raw disk writes, and curl-to-shell pipelines.
- Every command has a timeout.
- Execution happens in a temporary directory populated only with configured fixtures.
- Output redacts common secret-like values.

This is not a container sandbox. Treat it as a maintainer-friendly README smoke tester, not an untrusted-code isolation boundary.

## Verify this repo

```sh
npm test
npm run check
npm run build
npm run smoke
npm run package:smoke
npm run release:check
bash scripts/validate.sh
```

## License

MIT
