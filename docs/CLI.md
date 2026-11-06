# CLI reference

The package installs two equivalent executable names: `readmesmoke` and `rsmoke`.
Both accept the commands and options below; examples use `readmesmoke`, and you can
substitute `rsmoke` unchanged. Run either executable with `--help` (or `-h`) to
print the usage summary.

## `readmesmoke scan` (also `rsmoke scan`)

Builds a command plan and exits without running commands.

Options:

- `--config <path>`: required, readable config file relative to `--root`. Without
  this option, an absent default `readmesmoke.config.json` uses safe defaults.
- `--json`, `--markdown`, or `--format <json|markdown>`: select one output format.
- `--root <path>`: scan another repository root.

## `readmesmoke run` (also `rsmoke run`)

Builds a plan and skips commands by default. Add `--execute` to run commands that pass allow and risk checks.

Options:

- `--execute`: execute commands that pass allow and risk checks; otherwise they are
  skipped.
- `--config <path>`: load a config relative to `--root`.
- `--json`, `--markdown`, or `--format <json|markdown>`: select the output format.
- `--root <path>`: use another repository root.

```sh
readmesmoke run --execute --json > report.json
```

## `readmesmoke report` (also `rsmoke report`)

Renders a saved JSON report as JSON or Markdown.

Options:

- `--input <file>`: required saved JSON report, resolved relative to `--root`.
- `--json`, `--markdown`, or `--format <json|markdown>`: select the output format.
- `--root <path>`: resolve the input file from another root.

```sh
readmesmoke report --input report.json --markdown
```

Options are command-specific. A missing option value, another option where a value
is required, an option belonging to another command, or conflicting output format
selections prints the usage summary and exits with status 2 before scanning or
executing anything.

An explicitly selected config that is absent or unreadable likewise prints a
config diagnostic and usage, exits with status 2, and does not plan or execute
README commands. The same contract applies to a config file that is malformed
(invalid JSON or not a JSON object) or that contains an invalid field, such as
an unparseable `allow` regular expression or a non-string array field.

## Help and option availability

`--help` and `-h` are accepted before a command and print usage with exit code 0.
Command options are intentionally restricted: `scan` accepts `--config`, format
selectors, and `--root`; `run` adds `--execute`; `report` accepts `--input`, format
selectors, and `--root`. Missing values, unknown options, options used with the wrong
command, and conflicting format selectors exit with code 2 before any scan or run.

## Exit codes

- `0`: the command completed without failed or denied results.
- `1`: execution failed, or a `run`/`report` result contains failed or denied commands.
- `2`: invalid CLI usage; `scan` also uses 2 when its plan contains denied commands.
