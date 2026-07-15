# readmesmoke

CLI aliases: `readmesmoke` and `rsmoke` run the same checks, so the shorter alias works well in local smoke scripts.

`readmesmoke` is a local-first TypeScript CLI that smoke-tests runnable commands in READMEs and docs. It extracts shell snippets, checks them against an explicit allowlist, runs approved commands in a temporary fixture workspace, and writes a crisp pass/fail report.

It is intentionally boring about safety: dry-run first, default-deny execution, no telemetry, no cloud service, no secret collection.

## Install

```sh
npm install --save-dev readmesmoke
```

Or run this repo locally:

```sh
npm install
npm run build
node dist/cli.js scan
```

## Quick start

Create `readmesmoke.config.json`:

```json
{
  "docs": ["README.md", "docs/**/*.md"],
  "allow": ["^npm test$", "^node examples/hello\\.js$", "^echo .+$"],
  "fixtures": ["examples"],
  "timeoutMs": 10000
}
```

Scan docs without executing anything:

```sh
readmesmoke scan --json
```

Execute only allowlisted commands:

```sh
readmesmoke run --execute --json > readmesmoke-report.json
```

Render a Markdown report later:

```sh
readmesmoke report --input readmesmoke-report.json --markdown
```

For a fixture-backed CI artifact walkthrough, run:

```sh
bash demo/ci-report-artifact.sh
```

See [docs/tutorials/ci-report-artifact.md](docs/tutorials/ci-report-artifact.md)
for the plan, run, and Markdown report flow.

## Local demo

Run the included fixture walkthrough to build the CLI, execute the allowlisted
README snippets, and render JSON plus Markdown reports:

```sh
bash demo/run-basic-fixture.sh
```

See [docs/promo/basic-fixture-demo.md](docs/promo/basic-fixture-demo.md) for
the short demo script and promotion notes.

For a fixture-backed release-docs walkthrough, run:

```sh
bash demo/release-docs-check.sh
```

The demo writes a command plan, JSON execution report, and Markdown report under
`/tmp/readmesmoke-demo` or `$TMPDIR/readmesmoke-demo`.

## Runnable demo

Run the committed fixture-backed demo:

```sh
bash demo/run-basic-readme-smoke.sh
```

The script builds the CLI, executes the allowlisted snippets from
`examples/basic`, and prints the JSON and Markdown report paths. See
`docs/tutorials/fixture-backed-readme-smoke.md` for the full recipe.
For a PR-oriented explanation of the same fixture, see
`examples/fixture-project-review.md`.

To show the default-deny safety path with an intentionally unsafe fixture:

```sh
bash demo/unsafe-snippet-plan.sh
```

That demo plans `examples/unsafe/README.md` without executing anything and
expects the privileged command to be denied.

To compare an allowlisted fixture and a denied fixture in one packet:

```sh
bash demo/safe-vs-denied-plans.sh
```

See [docs/tutorials/safe-vs-denied-plans.md](docs/tutorials/safe-vs-denied-plans.md)
for the short safety-demo flow.

## How commands are discovered

`readmesmoke` captures:

- fenced `bash`, `sh`, `shell`, `zsh`, and `console` blocks;
- any fenced block immediately preceded by `<!-- readmesmoke: run -->`.

Prompts like `$ npm test` and `> echo hi` are normalized before planning.

## Safety model

- Commands are skipped unless they match an allowlist regex.
- Built-in risk checks deny obvious foot-guns like `sudo`, `rm -rf /`, SSH/SCP, raw disk writes, and curl-to-shell pipelines.
- Every command has a timeout.
- Execution happens in a temporary directory populated only with configured fixtures.
- Output redacts common secret-like values.

This is not a container sandbox. Treat it as a maintainer-friendly README smoke tester, not an untrusted-code isolation boundary.

## Verify this repo

```sh
npm test
npm run check
npm run build
npm run smoke
npm run package:smoke
npm run release:check
bash scripts/validate.sh
```

## Release readiness

Run the same checks that CI uses before opening a release PR:

```sh
npm run release:readiness
npm run release:check
```

`release:readiness` validates repository metadata, the package files allowlist, package smoke coverage, and CI placeholder cleanup. `release:check` runs the project build, test, smoke, and package dry-run checks where configured.

## Package contents

`npm run package:smoke` verifies that the tarball includes the compiled CLI,
examples, demo script, docs, and validation scripts referenced by this README.

## License

MIT
