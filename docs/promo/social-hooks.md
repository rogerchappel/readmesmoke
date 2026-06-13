# Social Hooks

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
