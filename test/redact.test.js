import test from 'node:test';
import assert from 'node:assert/strict';
import { redactText } from '../dist/redact.js';

test('redactText hides configured secret environment values', () => {
  const output = redactText('token is abc123', { SERVICE_TOKEN: 'abc123' }, ['TOKEN']);
  assert.equal(output, 'token is [REDACTED]');
});

test('redactText hides inline secret assignments', () => {
  assert.equal(redactText('API_KEY=abc123'), 'API_KEY=[REDACTED]');
});
