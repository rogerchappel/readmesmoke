# CLI reference

## `readmesmoke scan`

Builds a command plan and exits without running commands.

Options:

- `--config <path>`: config file relative to `--root`.
- `--json`, `--markdown`, or `--format <json|markdown>`: select one output format.
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

Options are command-specific. A missing option value, another option where a value
is required, an option belonging to another command, or conflicting output format
selections prints the usage summary and exits with status 2 before scanning or
executing anything.

## Exit codes

- `0`: the command completed without failed or denied results.
- `1`: execution failed, or a `run`/`report` result contains failed or denied commands.
- `2`: invalid CLI usage; `scan` also uses 2 when its plan contains denied commands.
