# Configuration

`readmesmoke.config.json` lives at the repository root by default. If that
implicit default file is absent, readmesmoke uses its safe defaults. A path
supplied with `--config` is required and must be readable.

```json
{
  "docs": ["README.md", "docs/**/*.md"],
  "allow": ["^npm test$", "^echo .+$"],
  "fixtures": ["examples"],
  "timeoutMs": 10000,
  "env": { "NODE_ENV": "test" },
  "redact": ["TOKEN", "SECRET", "PASSWORD", "API_KEY"]
}
```

## Fields

- `docs`: Markdown files or simple glob patterns to scan.
- `allow`: regular expressions. A command must match one and avoid deny rules before it can run.
- `fixtures`: project-relative files or directories copied into the temporary
  execution workspace at the same relative paths. This preserves distinct
  same-named fixtures from different directories. Each command runs from the
  copied path corresponding to its source Markdown file's directory, so a
  nested README can refer to a sibling fixture with a relative command such as
  `node hello.js`.
- `timeoutMs`: finite numeric per-command timeout. Values below 100ms are raised
  to 100ms; non-numeric, `NaN`, and infinite values are rejected.
- `env`: additional environment variables for child commands.
- `redact`: environment key markers whose values should be hidden in output.

Prefer narrow allow rules. `^npm test$` is safer and more auditable than `^npm .+$`.
