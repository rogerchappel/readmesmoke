import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectRisk, isDenied } from '../dist/index.js';

test('inspectRisk denies destructive commands', () => {
  const findings = inspectRisk('rm -rf /');
  assert.equal(isDenied(findings), true);
});

test('inspectRisk warns on network commands', () => {
  const findings = inspectRisk('curl https://example.com/file');
  assert.equal(findings.some((finding) => finding.level === 'warn'), true);
});
