# Basic Fixture Demo

This walkthrough shows readmesmoke running only allowlisted README commands in
a temporary fixture workspace.

## Run

```sh
bash demo/run-basic-fixture.sh
```

The script builds the CLI, executes the commands documented in
`examples/basic/README.md`, writes a JSON report, renders a Markdown report,
and checks that both expected fixture commands appear in the output.

## What to show

- `examples/basic/README.md` contains two runnable shell snippets.
- `examples/basic/readmesmoke.config.json` allowlists the exact commands and
  copies only the fixture files into the execution workspace.
- The JSON report is suitable for automation.
- The Markdown report is suitable for a pull request or release note.

## Boundaries

readmesmoke is a maintainer-friendly smoke tester. It is not a container
sandbox and should not be used to execute untrusted commands.
