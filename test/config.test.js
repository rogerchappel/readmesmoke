import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultConfig, normalizeConfig } from '../dist/index.js';

test('defaultConfig is local-first and safe', () => {
  const config = defaultConfig();
  assert.ok(config.allow.some((pattern) => pattern.includes('echo')));
  assert.equal(config.timeoutMs, 10000);
});

test('normalizeConfig enforces timeout floor', () => {
  const config = normalizeConfig({ docs: ['README.md'], allow: ['^echo'], timeoutMs: 1 });
  assert.equal(config.timeoutMs, 100);
});
