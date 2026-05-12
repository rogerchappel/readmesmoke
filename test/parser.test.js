import test from 'node:test';
import assert from 'node:assert/strict';
import { extractCommands, parseMarkdown } from '../dist/index.js';

test('extractCommands strips prompts and comments', () => {
  assert.deepEqual(extractCommands('# install\n$ npm test\n> echo hello'), ['npm test', 'echo hello']);
});

test('parseMarkdown captures shell fences', () => {
  const snippets = parseMarkdown('```bash\nnpm test\n```', 'README.md');
  assert.equal(snippets.length, 1);
  assert.equal(snippets[0].command, 'npm test');
  assert.equal(snippets[0].reason, 'fenced-block');
});

test('parseMarkdown captures explicit run hints on non-shell fences', () => {
  const snippets = parseMarkdown('<!-- readmesmoke: run -->\n```text\necho hinted\n```', 'README.md');
  assert.equal(snippets[0].command, 'echo hinted');
  assert.equal(snippets[0].reason, 'readmesmoke-hint');
});
