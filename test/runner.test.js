import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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

test('runPlan executes a compound command as one shell program', async () => {
  const multiline = {
    ...command,
    command: 'for value in one two; do\n  echo "item:$value"\ndone',
    allowPattern: '^for '
  };
  const [result] = await runPlan(process.cwd(), { docs: ['README.md'], allow: ['^for '], timeoutMs: 1000 }, [multiline], true);
  assert.equal(result.status, 'passed');
  assert.equal(result.stdout, 'item:one\nitem:two\n');
});

test('runPlan executes a backslash continuation as one command', async () => {
  const continuation = {
    ...command,
    command: 'printf "%s:%s\\n" \\\nleft right',
    allowPattern: '^printf '
  };
  const [result] = await runPlan(process.cwd(), { docs: ['README.md'], allow: ['^printf '], timeoutMs: 1000 }, [continuation], true);
  assert.equal(result.status, 'passed');
  assert.equal(result.stdout, 'left:right\n');
});

test('runPlan executes heredoc content with its command', async () => {
  const heredoc = {
    ...command,
    command: 'cat <<EOF\nheredoc-ok\nEOF',
    allowPattern: '^cat <<EOF'
  };
  const [result] = await runPlan(process.cwd(), { docs: ['README.md'], allow: ['^cat <<EOF'], timeoutMs: 1000 }, [heredoc], true);
  assert.equal(result.status, 'passed');
  assert.equal(result.stdout, 'heredoc-ok\n');
});

test('runPlan preserves configured directory paths with the same basename', async () => {
  const root = await mkdtemp(join(tmpdir(), 'readmesmoke-runner-'));
  await mkdir(join(root, 'probe/a/data'), { recursive: true });
  await mkdir(join(root, 'probe/b/data'), { recursive: true });
  await writeFile(join(root, 'probe/a/data/shared.txt'), 'alpha');
  await writeFile(join(root, 'probe/b/data/shared.txt'), 'beta');

  const fixtureCommand = {
    ...command,
    command: 'cat probe/a/data/shared.txt probe/b/data/shared.txt',
    allowPattern: '^cat '
  };
  const [result] = await runPlan(root, {
    docs: ['README.md'],
    allow: ['^cat '],
    fixtures: ['probe/a/data', 'probe/b/data'],
    timeoutMs: 1000
  }, [fixtureCommand], true);

  assert.equal(result.status, 'passed');
  assert.equal(result.stdout, 'alphabeta');
});

test('runPlan preserves configured file paths with the same filename', async () => {
  const root = await mkdtemp(join(tmpdir(), 'readmesmoke-runner-'));
  await mkdir(join(root, 'probe/a'), { recursive: true });
  await mkdir(join(root, 'probe/b'), { recursive: true });
  await writeFile(join(root, 'probe/a/settings.json'), '{"source":"a"}');
  await writeFile(join(root, 'probe/b/settings.json'), '{"source":"b"}');

  const fixtureCommand = {
    ...command,
    command: 'cat probe/a/settings.json probe/b/settings.json',
    allowPattern: '^cat '
  };
  const [result] = await runPlan(root, {
    docs: ['README.md'],
    allow: ['^cat '],
    fixtures: ['probe/a/settings.json', 'probe/b/settings.json'],
    timeoutMs: 1000
  }, [fixtureCommand], true);

  assert.equal(result.status, 'passed');
  assert.equal(result.stdout, '{"source":"a"}{"source":"b"}');
});
