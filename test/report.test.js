import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReport, renderReport } from '../dist/index.js';

const result = {
  id: 'README.md:1:1',
  file: 'README.md',
  language: 'bash',
  command: 'echo ok',
  lineStart: 1,
  lineEnd: 3,
  reason: 'fenced-block',
  allowed: true,
  allowPattern: '^echo',
  risk: [],
  status: 'passed',
  exitCode: 0,
  durationMs: 5,
  stdout: 'ok',
  stderr: ''
};

test('buildReport totals results', () => {
  const report = buildReport('/repo', false, [result]);
  assert.equal(report.totals.passed, 1);
  assert.equal(report.totals.allowed, 1);
});

test('renderReport returns markdown summary', () => {
  const markdown = renderReport(buildReport('/repo', false, [result]), 'markdown');
  assert.match(markdown, /readmesmoke report/);
  assert.match(markdown, /echo ok/);
});
