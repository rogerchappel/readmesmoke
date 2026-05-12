# CLI reference

## `readmesmoke scan`

Builds a command plan and exits without running commands.

Options:

- `--config <path>`: config file relative to `--root`.
- `--json`: emit JSON instead of Markdown.
- `--root <path>`: scan another repository root.

## `readmesmoke run`

Builds a plan and skips commands by default. Add `--execute` to run commands that pass allow and risk checks.

```sh
readmesmoke run --execute --json > report.json
```

## `readmesmoke report`

Renders a saved JSON report as JSON or Markdown.

```sh
readmesmoke report --input report.json --markdown
```
