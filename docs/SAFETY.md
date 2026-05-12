# Safety notes

`readmesmoke` is designed for maintainers running their own docs locally.

It helps avoid accidental execution by combining three controls:

1. dry-run planning unless `run --execute` is used;
2. explicit regex allowlists;
3. built-in deny checks for common destructive or remote commands.

It does **not** provide hard sandboxing. If you need to run untrusted docs, use a disposable VM or container boundary in addition to this tool.

Good patterns:

```json
{ "allow": ["^npm test$", "^node examples/[a-z-]+\\.js$"] }
```

Risky patterns:

```json
{ "allow": [".*"] }
```

The temporary workspace starts empty except for configured fixtures, which keeps commands deterministic and reduces accidental writes to the source checkout.
