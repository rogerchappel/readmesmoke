import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ConfigError, defaultConfig, loadConfig, normalizeConfig } from '../dist/index.js';

test('defaultConfig is local-first and safe', () => {
  const config = defaultConfig();
  assert.ok(config.allow.some((pattern) => pattern.includes('echo')));
  assert.equal(config.timeoutMs, 10000);
});

test('normalizeConfig enforces timeout floor', () => {
  const config = normalizeConfig({ docs: ['README.md'], allow: ['^echo'], timeoutMs: 1 });
  assert.equal(config.timeoutMs, 100);
});

test('normalizeConfig rejects non-numeric and non-finite timeouts', () => {
  for (const timeoutMs of ['oops', Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    assert.throws(
      () => normalizeConfig({ docs: ['README.md'], allow: ['^echo'], timeoutMs }),
      /config\.timeoutMs must be a finite number/
    );
  }
});

test('loadConfig uses defaults when only the implicit default file is absent', async () => {
  const root = await mkdtemp(join(tmpdir(), 'readmesmoke-config-'));
  assert.deepEqual(await loadConfig(root), defaultConfig());
});

test('normalizeConfig rejects invalid allow regular expressions', () => {
  for (const allow of [['(unclosed'], ['[a-'], ['^(npm']]) {
    assert.throws(
      () => normalizeConfig({ docs: ['README.md'], allow, timeoutMs: 1000 }),
      (error) => error instanceof ConfigError && /config\.allow contains an invalid regular expression/.test(error.message)
    );
  }
});

test('normalizeConfig reports malformed array fields as ConfigError', () => {
  for (const config of [
    { docs: 'README.md', allow: ['^echo'], timeoutMs: 1000 },
    { docs: ['README.md'], allow: [], timeoutMs: 1000 },
    { docs: ['README.md'], allow: [42], timeoutMs: 1000 }
  ]) {
    assert.throws(() => normalizeConfig(config), ConfigError);
  }
});

test('normalizeConfig rejects malformed optional fields as ConfigError', () => {
  const base = { docs: ['README.md'], allow: ['^echo'], timeoutMs: 1000 };
  for (const [field, values] of Object.entries({
    fixtures: ['examples', [42]],
    redact: ['TOKEN', [null]],
    env: [[], { NODE_ENV: 42 }]
  })) {
    for (const value of values) {
      assert.throws(
        () => normalizeConfig({ ...base, [field]: value }),
        (error) => error instanceof ConfigError && new RegExp(`config\\.${field}`).test(error.message)
      );
    }
  }
});

test('normalizeConfig preserves valid optional fields and their defaults', () => {
  const base = { docs: ['README.md'], allow: ['^echo'], timeoutMs: 1000 };
  assert.deepEqual(normalizeConfig(base).fixtures, []);
  assert.deepEqual(normalizeConfig(base).env, {});
  assert.deepEqual(normalizeConfig({ ...base, fixtures: ['examples'], env: { NODE_ENV: 'test' }, redact: ['TOKEN'] }), {
    ...base,
    fixtures: ['examples'],
    env: { NODE_ENV: 'test' },
    redact: ['TOKEN']
  });
});

test('loadConfig reports malformed JSON as a config error', async () => {
  const root = await mkdtemp(join(tmpdir(), 'readmesmoke-config-'));
  await writeFile(join(root, 'readmesmoke.config.json'), '{ not json');
  await assert.rejects(loadConfig(root), ConfigError);
});

test('loadConfig requires a JSON object config', async () => {
  const root = await mkdtemp(join(tmpdir(), 'readmesmoke-config-'));
  await writeFile(join(root, 'readmesmoke.config.json'), '[]');
  await assert.rejects(loadConfig(root), /must contain a JSON object/);
});
