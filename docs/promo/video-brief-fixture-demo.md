# Video Brief: Fixture-backed README Smoke Test

## Hook

"Your README says the command works. Here is a local smoke test that proves the
documented snippet still runs."

## Demo beats

1. Open `examples/basic/README.md` and point out the two shell snippets.
2. Open `readmesmoke.config.json` and show the narrow `allow` patterns.
3. Run `bash demo/run-basic-readme-smoke.sh`.
4. Open the generated Markdown report path printed by the script.
5. Call out the safety limit: this is a maintainer workflow, not an untrusted
   code sandbox.

## Grounding

- The fixture is committed under `examples/basic`.
- The config allowlist is committed in `readmesmoke.config.json`.
- The report is produced by `node dist/cli.js report --input ... --markdown`.
