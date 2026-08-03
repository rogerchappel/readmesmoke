# CLI reference

## `readmesmoke scan`

Builds a command plan and exits without running commands.

Options:

- `--config <path>`: required, readable config file relative to `--root`. Without
  this option, an absent default `readmesmoke.config.json` uses safe defaults.
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

An explicitly selected config that is absent or unreadable likewise prints a
config diagnostic and usage, exits with status 2, and does not plan or execute
README commands.

## Exit codes

- `0`: the command completed without failed or denied results.
- `1`: execution failed, or a `run`/`report` result contains failed or denied commands.
- `2`: invalid CLI usage; `scan` also uses 2 when its plan contains denied commands.
