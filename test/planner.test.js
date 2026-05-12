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
