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
