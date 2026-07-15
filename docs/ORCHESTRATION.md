# Orchestration Plan

## Owner

One isolated OpenClaw sub-agent owns this repository for the May 20 AM OSS Factory run.

## Waves

1. Baseline scaffold review and package metadata.
2. Core CLI modules and config model.
3. Fixture-backed tests and example project data.
4. CLI smoke scripts and local validation.
5. README, safety, contributing, release metadata, GitHub description/topics.
6. Atomic commits, push to public `rogerchappel/readmesmoke`, branch protection best effort.

## Boundaries

- Work only inside `/Users/roger/Developer/my-opensource/_worktrees/20260520-am/readmesmoke` unless reading shared tools/docs.
- Do not edit the main checkout at `/Users/roger/Developer/my-opensource/readmesmoke`.
- Do not use another project's repo/worktree.
- Do not edit established main checkouts elsewhere.
- Keep everything local-first; no telemetry or secret upload.
- Push direct to `main` when locally verified.
