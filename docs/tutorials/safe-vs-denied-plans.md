# Safe vs Denied Plans

This demo creates two planning reports from committed fixtures:

- `examples/basic` contains allowlisted `echo` and `node hello.js` snippets.
- `examples/unsafe` contains a privileged command that readmesmoke should deny.

## Run it

```bash
bash demo/safe-vs-denied-plans.sh
```

The script writes reports under `$TMPDIR/readmesmoke-safe-vs-denied` or
`/tmp/readmesmoke-safe-vs-denied`.

## What to show

Open `basic-plan.md` to show that allowed commands are discovered without
execution. Then open `unsafe-plan.json` to show the denied command and the
expected exit code `2`.

This is a short safety demo: it proves that readmesmoke can produce reviewable
plans before maintainers decide whether to run any README snippets.
