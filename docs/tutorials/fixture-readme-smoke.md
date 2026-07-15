# Fixture README Smoke Demo

This walkthrough uses the checked-in `examples/basic` fixture to show how
`readmesmoke` plans README commands, executes only allowlisted commands, and
turns the JSON result into a Markdown report.

## Inputs

- `readmesmoke.config.json` points at `examples/basic/README.md`.
- The allowlist accepts `echo readmesmoke fixture` and `node hello.js`.
- The fixture copy list includes `examples/basic/hello.js`.

## Run the demo

```sh
npm run build
node dist/cli.js scan --json > .tmp/readmesmoke-demo/plan.json
node dist/cli.js run --execute --json > .tmp/readmesmoke-demo/report.json
node dist/cli.js report --input .tmp/readmesmoke-demo/report.json --markdown > .tmp/readmesmoke-demo/report.md
```

Or run the wrapped demo:

```sh
bash demo/run-basic-readme-smoke.sh
```

The script verifies that two commands pass and that the Markdown report
mentions the `node hello.js` command.

## What to show

- `scan` is a dry planning step.
- `run --execute` still runs only allowlisted commands.
- The report can be rendered later from JSON.
- Execution happens in a temporary workspace populated by configured fixtures.

## Boundaries

- Do not describe `readmesmoke` as a container sandbox.
- Do not claim it runs untrusted arbitrary commands safely.
- Do not claim hosted service behavior; the demo is local-first.
