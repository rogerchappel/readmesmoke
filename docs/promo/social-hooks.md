# Social Hooks

These drafts are grounded in the current README, examples, and CLI behavior.

## Grounded facts

- `readmesmoke` extracts shell snippets from Markdown.
- It plans first and executes only allowlisted commands.
- It can copy configured fixtures into a temporary workspace.
- It writes JSON reports and can render Markdown reports later.
- It is local-first and does not use telemetry or a cloud service.

## Release Confidence Angle

README commands drift because docs are usually reviewed as prose.

readmesmoke extracts runnable snippets, denies everything by default, and only
executes commands that match a maintainer-owned allowlist.

Demo: `bash demo/release-docs-check.sh`.

## Safety Angle

Documentation smoke tests should not become arbitrary shell execution.

readmesmoke plans commands first, applies built-in risk checks, runs in a
temporary fixture workspace, and redacts secret-like output.

## Maintainer Workflow

Before shipping a release, run readmesmoke against the examples that users copy
from your README.

The output can be saved as JSON for automation or rendered as Markdown for a PR
appendix.

## Short posts

1. README commands are part of the product surface. `readmesmoke` gives them a
   local smoke test with an explicit allowlist.
2. Docs drift is easier to catch when examples are executable. `readmesmoke`
   scans Markdown, runs approved snippets, and leaves a JSON report.
3. Demo idea: two commands in `examples/basic/README.md`, one config file, one
   Markdown report showing both commands passed.
4. README examples drift quietly. `readmesmoke` extracts shell snippets, checks
  them against an allowlist, and runs only the commands a maintainer approves.
5. Demo angle: open `examples/basic/README.md`, show the two snippets, then run
  `bash demo/run-basic-readme-smoke.sh` to produce JSON and Markdown reports.
6. Safety angle: the default path is dry-run planning, and execution happens in a
  temporary workspace populated from configured fixtures.

## Video outline

1. Open `examples/basic/README.md`.
2. Open `readmesmoke.config.json` and show the allowlist.
3. Run `bash demo/run-basic-readme-smoke.sh`.
4. Show `.tmp/readmesmoke-demo/report.md`.
5. Close with the safety boundary: maintainer-friendly README smoke tests, not
   an untrusted-code sandbox.

## Proof points

- Fixture-backed command source: `examples/basic/README.md`
- Allowlist and fixture config: `readmesmoke.config.json`
- Runnable demo: `demo/run-basic-readme-smoke.sh`
