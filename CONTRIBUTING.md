# Contributing

Thanks for helping keep docs executable and boringly safe.

## Local setup

```sh
npm install
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
```

## Change shape

Please keep changes small and reviewable:

- parser changes should include Markdown fixture coverage;
- safety/risk changes should include tests for both allowed and denied cases;
- CLI behavior changes should update `docs/CLI.md` and smoke coverage when practical;
- never add telemetry, secret collection, or network execution by default.

## Pull requests

Use the PR template, link the task or issue, and include the command output for the verification you ran.
