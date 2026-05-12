# Examples

## Fixture-backed README check

The included `examples/basic` fixture has two commands:

```sh
echo readmesmoke fixture
node hello.js
```

The root `readmesmoke.config.json` copies `examples/basic/hello.js` into a temporary workspace and allows exactly those two commands.

Run it with:

```sh
npm run build
node dist/cli.js run --execute --json
```

## Explicit hint

Use a hint when a command block is not labelled as shell:

<!-- readmesmoke: run -->
```text
echo hinted command
```
