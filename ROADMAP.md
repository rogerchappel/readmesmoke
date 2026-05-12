# Roadmap

## 0.1 MVP

- local Markdown parser for shell snippets;
- allowlisted execution in temporary fixture workspaces;
- JSON and Markdown reports;
- deterministic fixture-backed tests and smoke script.

## Possible next steps

- richer Markdown command annotations for cwd/env/skip reasons;
- optional package-manager install cache fixtures;
- JUnit output for CI systems;
- shell command tokenization that preserves multi-line commands safely;
- container adapter examples without making containers a hard dependency.

Non-goal: becoming a remote CI service. `readmesmoke` should stay local-first.
