# readmesmoke PRD

Status: in-progress

## Summary

`readmesmoke` is a local-first CLI that extracts runnable shell snippets from README and docs, executes only explicitly allowed commands inside a temporary workspace, and writes a crisp pass/fail report. It keeps docs honest without turning every README into a tiny unexploded CI grenade. 🧨

## Problem

Developer tools often ship READMEs with commands that rot quickly. Agents also rely on README examples as executable instructions, so broken snippets waste time and create false confidence.

## Users

- OSS maintainers validating install and quickstart instructions.
- Agentic coding workflows that need safe, deterministic doc-command verification.
- Reviewers checking whether examples still work before a release.

## Goals

- Parse Markdown fenced blocks and tagged command comments.
- Run allowlisted commands in a temp directory with copied fixtures.
- Support dry-run, JSON, and Markdown reports.
- Default-deny risky commands and network access hints.
- Provide fixture-backed tests and a real CLI smoke.

## Non-goals

- Full shell sandboxing or container orchestration.
- Automatically fixing docs.
- Running arbitrary untrusted commands by default.

## V1 requirements

- TypeScript CLI with `scan`, `run`, and `report` flows.
- Config file `readmesmoke.config.json` for allowlist, env, fixtures, and docs globs.
- Markdown parser that captures ```bash blocks plus `<!-- readmesmoke: run -->` hints.
- Deterministic temp workspace runner with timeout and redacted output.
- Example fixture repo under `examples/`.
- Tests for parser, planner, risk checks, and report rendering.

## Safety

- Dry-run by default for generated plans.
- No shell execution unless commands match allowlist patterns.
- Timeout every command.
- Redact common secret-looking environment values.

## Attribution

Inspired by doctest-style documentation checks, README-driven development, and the needs of local agent workflows; renamed and reframed as a small safe OSS CLI rather than a CI service.
