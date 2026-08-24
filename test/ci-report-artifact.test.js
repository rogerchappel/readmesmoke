import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = new URL('..', import.meta.url).pathname;

test('CI report demo accepts expected denial statuses and writes its artifacts', async () => {
  const outDir = await mkdtemp(join(tmpdir(), 'readmesmoke-ci-report-'));
  const result = spawnSync('bash', ['demo/ci-report-artifact.sh'], {
    cwd: root,
    env: { ...process.env, OUT_DIR: outDir },
    encoding: 'utf8'
  });

  assert.equal(result.status, 0, result.stderr);

  const plan = JSON.parse(await readFile(join(outDir, 'plan.json'), 'utf8'));
  const run = JSON.parse(await readFile(join(outDir, 'run.json'), 'utf8'));
  const report = await readFile(join(outDir, 'report.md'), 'utf8');

  assert.equal(plan.totals.planned, 2);
  assert.deepEqual(run.totals, {
    planned: 2,
    allowed: 1,
    denied: 1,
    passed: 1,
    failed: 0,
    skipped: 1
  });
  assert.match(report, /README/);
});
