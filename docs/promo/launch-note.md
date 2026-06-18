# Launch Note Draft

readmesmoke is a local-first CLI for smoke-testing runnable README and docs
commands. It extracts shell snippets from Markdown, checks each command against
an explicit allowlist, runs approved commands in a temporary fixture workspace,
and renders JSON or Markdown evidence.

The demo path is deliberately small:

```bash
bash demo/run-basic-readme-smoke.sh
```

That script builds the CLI, runs the snippets from `examples/basic/README.md`,
and writes both JSON and Markdown reports under
`${TMPDIR:-/tmp}/readmesmoke-demo`.

## Good Fit

- repos with README commands that drift over time;
- docs that need fixture-backed smoke checks before release;
- maintainers who want a visible allowlist before any docs command executes.

## Boundaries

- readmesmoke is not a container sandbox;
- skipped commands are expected unless they match the allowlist;
- fixtures should be small, reviewable, and free of secrets.

## Suggested CTA

Try the fixture demo, then add one README command and one fixture file from your
own project before wiring the report into CI.
