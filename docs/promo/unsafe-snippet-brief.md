# Unsafe Snippet Brief

## Hook

"A README smoke test should be able to say no before it runs anything."

## Demo beats

1. Open `examples/unsafe/README.md`.
2. Open `examples/unsafe/readmesmoke.config.json` and show that the command is
   allowlisted.
3. Run `bash demo/unsafe-snippet-plan.sh`.
4. Open the Markdown plan path and show the denied `sudo` command.
5. Emphasize that this is a maintainer workflow, not a sandbox for untrusted
   code.

## Copy points

- Planning and execution are separate commands.
- Built-in risk checks can deny a command even when an allow pattern matches.
- The fixture proves the denial path without executing the unsafe snippet.
