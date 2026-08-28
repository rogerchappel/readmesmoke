# Changelog

## Unreleased

- Denied curl/wget-to-shell pipelines in any position and anchored `rm -rf` denial to the root targets `/`, `~`, and `$HOME`.
- Enforced command timeouts as a hard bound that also terminates background children.
- Rejected invalid `allow` regular expressions and malformed config files with `ConfigError`, so the CLI exits 2 with a config diagnostic and usage.
- Validated optional `fixtures`, `env`, and `redact` shapes before planning or execution.
- Removed the undocumented `workdir` field from the exported config type.
- Added release-readiness validation for package metadata, CI placeholder cleanup, and package smoke coverage.

## 0.1.0 - 2026-05-12

Initial MVP:

- TypeScript CLI with `scan`, `run`, and `report` commands.
- Markdown parser for shell fences and `readmesmoke: run` hints.
- Allowlist planner with built-in risky command checks.
- Temporary fixture workspace runner with timeout and redaction.
- JSON and Markdown report rendering.
- Fixture-backed tests and smoke script.
