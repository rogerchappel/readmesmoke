# Fixture Project Review

This example shows the smallest useful readmesmoke review loop using the
committed `examples/basic` fixture.

## Fixture Inputs

`examples/basic/README.md` contains two runnable shell snippets:

```bash
echo readmesmoke fixture
```

```bash
node hello.js
```

`examples/basic/readmesmoke.config.json` allowlists exactly those commands and
copies only `hello.js` into the temporary execution workspace.

## Demo Command

```bash
npm run build
bash demo/run-basic-readme-smoke.sh
```

The demo writes:

- `${TMPDIR:-/tmp}/readmesmoke-demo/basic-report.json`
- `${TMPDIR:-/tmp}/readmesmoke-demo/basic-report.md`

## Review Angle

Use the JSON report for automation and the Markdown report for a pull request
comment. The important behavior is that command execution stays explicit:
snippets are discovered from Markdown, checked against the allowlist, run in a
temporary fixture workspace, and then rendered into a small report.

This fixture is intentionally tiny so maintainers can inspect every command
readmesmoke is allowed to run.
