# Check Docs Before Release

This recipe shows a release-candidate documentation check with readmesmoke. It
plans the commands in README files first, then executes only the commands that
match the configured allowlist.

## Files

- `examples/basic/README.md`: a tiny README with runnable shell snippets.
- `examples/basic/hello.js`: fixture copied into the temporary workspace.
- `readmesmoke.config.json`: allowlist and fixture-copy settings for the demo.

## Dry-run the command plan

```sh
npm run build
node dist/cli.js scan --json
```

The scan output shows which commands were discovered and whether each one is
allowed. It does not execute commands.

## Execute the allowlisted commands

```sh
node dist/cli.js run --execute --json > /tmp/readmesmoke-release.json
node dist/cli.js report --input /tmp/readmesmoke-release.json --markdown
```

Use the Markdown report in a release note or pull request when reviewers need
evidence that documented commands still run.
