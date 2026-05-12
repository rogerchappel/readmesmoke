import test from 'node:test';
import assert from 'node:assert/strict';
import { globToRegExp } from '../dist/index.js';

test('globToRegExp matches recursive markdown docs', () => {
  const regex = globToRegExp('docs/**/*.md');
  assert.equal(regex.test('docs/guide/start.md'), true);
  assert.equal(regex.test('src/start.ts'), false);
});
