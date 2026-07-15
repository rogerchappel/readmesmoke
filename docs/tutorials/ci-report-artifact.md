# CI report artifact recipe

This recipe shows how to turn a README smoke run into durable CI artifacts:
a dry-run plan, an execution JSON file, and a Markdown report.

## Run it

```sh
bash demo/ci-report-artifact.sh
```

The script writes:

- `tmp/ci-report-artifact/plan.json` for the discovered command plan.
- `tmp/ci-report-artifact/run.json` for the allowlisted execution result.
- `tmp/ci-report-artifact/report.md` for a PR appendix or release note.

## Fixture behavior

`examples/ci-report/README.md` includes one harmless command and one risky
publish-shaped command. The fixture config only allows:

```sh
echo docs are runnable
```

That makes the demo useful for explaining both sides of the tool: discover the
full command surface, then execute only what a maintainer has approved.

## CI sketch

```yaml
- run: npm ci
- run: npm run build
- run: bash demo/ci-report-artifact.sh
- uses: actions/upload-artifact@v4
  with:
    name: readmesmoke-report
    path: tmp/ci-report-artifact
```
