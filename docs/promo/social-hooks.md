# readmesmoke Promotion Hooks

## Grounded facts

- `readmesmoke` extracts shell snippets from Markdown.
- It plans first and executes only allowlisted commands.
- It can copy configured fixtures into a temporary workspace.
- It writes JSON reports and can render Markdown reports later.
- It is local-first and does not use telemetry or a cloud service.

## Short posts

1. README commands are part of the product surface. `readmesmoke` gives them a
   local smoke test with an explicit allowlist.
2. Docs drift is easier to catch when examples are executable. `readmesmoke`
   scans Markdown, runs approved snippets, and leaves a JSON report.
3. Demo idea: two commands in `examples/basic/README.md`, one config file, one
   Markdown report showing both commands passed.

## Video outline

1. Open `examples/basic/README.md`.
2. Open `readmesmoke.config.json` and show the allowlist.
3. Run `bash demo/run-basic-readme-smoke.sh`.
4. Show `.tmp/readmesmoke-demo/report.md`.
5. Close with the safety boundary: maintainer-friendly README smoke tests, not
   an untrusted-code sandbox.
