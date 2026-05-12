import test from 'node:test';
import assert from 'node:assert/strict';
import { runPlan } from '../dist/index.js';

const command = {
  id: 'x',
  file: 'README.md',
  language: 'bash',
  command: 'echo runner-ok',
  lineStart: 1,
  lineEnd: 3,
  reason: 'fenced-block',
  allowed: true,
  allowPattern: '^echo',
  risk: []
};

test('runPlan skips commands during dry run', async () => {
  const [result] = await runPlan(process.cwd(), { docs: ['README.md'], allow: ['^echo'], timeoutMs: 1000 }, [command], false);
  assert.equal(result.status, 'skipped');
});

test('runPlan executes allowed commands', async () => {
  const [result] = await runPlan(process.cwd(), { docs: ['README.md'], allow: ['^echo'], timeoutMs: 1000 }, [command], true);
  assert.equal(result.status, 'passed');
  assert.match(result.stdout, /runner-ok/);
});
