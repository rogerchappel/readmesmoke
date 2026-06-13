# Fixture-backed README Smoke Test

This recipe shows how to verify README commands without running arbitrary shell
snippets from the repository root.

## What the fixture contains

The `examples/basic` fixture includes a tiny `hello.js` file and a README with
two runnable commands:

```sh
echo readmesmoke fixture
node hello.js
```

The root `readmesmoke.config.json` copies that fixture into a temporary
workspace, then allows only the matching `echo` and `node hello.js` commands.

## Run the demo

```sh
bash demo/run-basic-readme-smoke.sh
```

The script builds the CLI, executes the allowlisted snippets, writes JSON output
to a temporary directory, then renders a Markdown report from the same data.

## When to adapt it

Use this pattern when documentation examples need a small known workspace, such
as a sample project, fixture file, or generated input. Keep the allowlist narrow
and commit the fixture so CI and local runs exercise the same commands.
