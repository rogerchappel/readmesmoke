# Social Hooks

These drafts are grounded in the current README, examples, and CLI behavior.

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

- README examples drift quietly. `readmesmoke` extracts shell snippets, checks
  them against an allowlist, and runs only the commands a maintainer approves.
- Demo angle: open `examples/basic/README.md`, show the two snippets, then run
  `bash demo/run-basic-readme-smoke.sh` to produce JSON and Markdown reports.
- Safety angle: the default path is dry-run planning, and execution happens in a
  temporary workspace populated from configured fixtures.

## Proof points

- Fixture-backed command source: `examples/basic/README.md`
- Allowlist and fixture config: `readmesmoke.config.json`
- Runnable demo: `demo/run-basic-readme-smoke.sh`
