# Unsafe Snippet Plan

This recipe demonstrates the safety path: readmesmoke can plan README commands
and deny risky snippets before anything executes.

## Fixture

`examples/unsafe/README.md` contains:

```sh
sudo echo no
```

The fixture config intentionally allowlists that exact command so the denial is
driven by readmesmoke's built-in risk checks, not by a missing allow pattern.

## Run it

```sh
bash demo/unsafe-snippet-plan.sh
```

The script builds the CLI, runs `scan` in JSON and Markdown modes, expects exit
status `2`, and checks that the output marks the command as denied with
`refuses privileged commands`.

## Why it matters

This is useful in PR review because maintainers can separate two questions:

- Did the docs contain runnable shell snippets?
- Are any snippets too risky to execute in the fixture workspace?

The demo never passes `--execute`.
