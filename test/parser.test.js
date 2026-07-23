import test from 'node:test';
import assert from 'node:assert/strict';
import { extractCommands, parseMarkdown } from '../dist/index.js';

test('extractCommands strips prompts and comments', () => {
  assert.deepEqual(extractCommands('# install\n$ npm test\n> echo hello'), ['npm test', 'echo hello']);
});

test('extractCommands preserves backslash continuations', () => {
  assert.deepEqual(
    extractCommands('node tool.js \\\n  --flag value'),
    ['node tool.js \\\n--flag value']
  );
});

test('extractCommands keeps compound commands and heredocs coherent', () => {
  assert.deepEqual(
    extractCommands('for f in a b; do\n  echo "$f"\ndone\ncat <<EOF\n  hello\nEOF'),
    ['for f in a b; do\necho "$f"\ndone', 'cat <<EOF\n  hello\nEOF']
  );
});

test('parseMarkdown captures shell fences', () => {
  const snippets = parseMarkdown('```bash\nnpm test\n```', 'README.md');
  assert.equal(snippets.length, 1);
  assert.equal(snippets[0].command, 'npm test');
  assert.equal(snippets[0].reason, 'fenced-block');
});

test('parseMarkdown emits one snippet for a multiline shell program', () => {
  const snippets = parseMarkdown('```sh\nfor value in one two; do\n  echo "$value"\ndone\n```', 'README.md');
  assert.equal(snippets.length, 1);
  assert.equal(snippets[0].command, 'for value in one two; do\necho "$value"\ndone');
});

test('parseMarkdown captures explicit run hints on non-shell fences', () => {
  const snippets = parseMarkdown('<!-- readmesmoke: run -->\n```text\necho hinted\n```', 'README.md');
  assert.equal(snippets[0].command, 'echo hinted');
  assert.equal(snippets[0].reason, 'readmesmoke-hint');
});
