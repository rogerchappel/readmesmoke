import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const cli = new URL('../dist/cli.js', import.meta.url);

function invoke(args, cwd = process.cwd()) {
  return spawnSync(process.execPath, [cli.pathname, ...args], { cwd, encoding: 'utf8' });
}

test('value-taking options reject missing and option-shaped values', () => {
  for (const option of ['--config', '--format', '--input', '--root']) {
    const command = option === '--input' ? 'report' : 'scan';
    for (const suffix of [[], ['--json']]) {
      const result = invoke([command, option, ...suffix]);
      assert.equal(result.status, 2, `${option} ${suffix.join(' ')}`);
      assert.match(result.stderr, new RegExp(`${option} requires a value`));
      assert.match(result.stderr, /Usage:/);
    }
  }
});

test('options are command-aware', () => {
  for (const [command, args, option] of [
    ['scan', ['--execute'], '--execute'],
    ['scan', ['--input', 'report.json'], '--input'],
    ['run', ['--input', 'report.json'], '--input'],
    ['report', ['--input', 'report.json', '--config', 'config.json'], '--config'],
    ['report', ['--input', 'report.json', '--execute'], '--execute']
  ]) {
    const result = invoke([command, ...args]);
    assert.equal(result.status, 2);
    assert.match(result.stderr, new RegExp(`${option} is not valid for ${command}`));
  }
});

test('conflicting format selections are rejected', () => {
  for (const args of [
    ['scan', '--json', '--markdown'],
    ['scan', '--format', 'json', '--markdown'],
    ['scan', '--format', 'markdown', '--json']
  ]) {
    const result = invoke(args);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /conflicting output formats/);
  }
});

test('invalid usage does not plan or execute README commands', async () => {
  const root = await mkdtemp(join(tmpdir(), 'readmesmoke-cli-'));
  await writeFile(join(root, 'README.md'), '```sh\\nprintf planned > marker.txt\\n```\\n');
  await writeFile(join(root, '.readmesmoke.json'), JSON.stringify({
    docs: ['README.md'],
    allow: ['^printf '],
    timeoutMs: 1000
  }));

  const result = invoke(['run', '--execute', '--root', root, '--config'], root);
  assert.equal(result.status, 2);
  await assert.rejects(readFile(join(root, 'marker.txt')), { code: 'ENOENT' });
});

test('an absent explicit config fails before planning or execution', async () => {
  const root = await mkdtemp(join(tmpdir(), 'readmesmoke-cli-'));
  await writeFile(join(root, 'README.md'), '```sh\nprintf executed > marker.txt\n```\n');

  const result = invoke(['run', '--execute', '--root', root, '--config', 'missing.json'], root);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /cannot read config missing\.json/);
  assert.match(result.stderr, /Usage:/);
  await assert.rejects(readFile(join(root, 'marker.txt')), { code: 'ENOENT' });
});

test('an unreadable explicit config fails with a config diagnostic', async () => {
  const root = await mkdtemp(join(tmpdir(), 'readmesmoke-cli-'));
  await mkdir(join(root, 'config.json'));

  const result = invoke(['scan', '--root', root, '--config', 'config.json'], root);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /cannot read config config\.json/);
  assert.match(result.stderr, /Usage:/);
});

test('a malformed allow pattern fails with a config diagnostic and usage', async () => {
  const root = await mkdtemp(join(tmpdir(), 'readmesmoke-cli-'));
  await writeFile(join(root, 'README.md'), '```sh\nprintf planned > marker.txt\n```\n');
  await writeFile(join(root, '.readmesmoke.json'), JSON.stringify({
    docs: ['README.md'],
    allow: ['(unclosed'],
    timeoutMs: 1000
  }));

  for (const command of ['scan', 'run']) {
    const result = invoke(command === 'scan' ? ['scan', '--root', root, '--config', '.readmesmoke.json'] : ['run', '--execute', '--root', root, '--config', '.readmesmoke.json'], root);
    assert.equal(result.status, 2, command);
    assert.match(result.stderr, /config\.allow contains an invalid regular expression/, command);
    assert.match(result.stderr, /Usage:/, command);
  }
  await assert.rejects(readFile(join(root, 'marker.txt')), { code: 'ENOENT' });
});

test('an absent implicit default config continues with safe defaults', async () => {
  const root = await mkdtemp(join(tmpdir(), 'readmesmoke-cli-'));
  await writeFile(join(root, 'README.md'), '```sh\necho safe-default\n```\n');

  const result = invoke(['scan', '--root', root, '--json'], root);
  assert.equal(result.status, 0);
  assert.equal(JSON.parse(result.stdout).totals.planned, 1);
});

test('report exits unsuccessfully for failed and denied saved reports', async () => {
  const root = await mkdtemp(join(tmpdir(), 'readmesmoke-report-'));
  const base = {
    generatedAt: new Date(0).toISOString(),
    dryRun: false,
    root,
    totals: { planned: 1, allowed: 1, denied: 0, passed: 1, failed: 0, skipped: 0 },
    results: []
  };

  for (const totals of [
    { ...base.totals, failed: 1, passed: 0 },
    { ...base.totals, denied: 1, allowed: 0, passed: 0, skipped: 1 }
  ]) {
    await writeFile(join(root, 'report.json'), JSON.stringify({ ...base, totals }));
    const result = invoke(['report', '--input', 'report.json', '--root', root, '--json']);
    assert.equal(result.status, 1);
  }
});
