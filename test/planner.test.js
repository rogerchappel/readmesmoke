import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { plan } from '../dist/index.js';

test('plan marks matching commands allowed and others denied', async () => {
  const root = await mkdtemp(join(tmpdir(), 'readmesmoke-plan-'));
  await writeFile(join(root, 'README.md'), '```bash\necho ok\nsudo echo no\n```');
  const planned = await plan(root, { docs: ['README.md'], allow: ['^echo ok$'], timeoutMs: 1000 });
  assert.equal(planned.length, 2);
  assert.equal(planned[0].allowed, true);
  assert.equal(planned[1].allowed, false);
});

test('plan allowlists a complete multiline command instead of its fragments', async () => {
  const root = await mkdtemp(join(tmpdir(), 'readmesmoke-plan-'));
  await writeFile(join(root, 'README.md'), '```sh\nfor value in one two; do\n  echo "$value"\ndone\n```');
  const planned = await plan(root, {
    docs: ['README.md'],
    allow: ['^for value in one two; do\\necho "\\$value"\\ndone$'],
    timeoutMs: 1000
  });
  assert.equal(planned.length, 1);
  assert.equal(planned[0].allowed, true);
});
