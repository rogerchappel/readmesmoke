import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { CommandSnippet } from './types.js';

const RUN_HINT = /<!--\s*readmesmoke:\s*run\s*-->/i;
const SHELL_LANGUAGES = new Set(['bash', 'sh', 'shell', 'zsh', 'console']);

export async function parseMarkdownFile(root: string, file: string): Promise<CommandSnippet[]> {
  const markdown = await readFile(join(root, file), 'utf8');
  return parseMarkdown(markdown, file);
}

export function parseMarkdown(markdown: string, file = '<memory>'): CommandSnippet[] {
  const lines = markdown.split(/\r?\n/);
  const snippets: CommandSnippet[] = [];
  let hinted = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (RUN_HINT.test(line)) {
      hinted = true;
      continue;
    }

    const fence = line.match(/^```(\S*)/);
    if (!fence) continue;

    const language = (fence[1] || '').toLowerCase();
    const start = index + 1;
    const body: string[] = [];
    index += 1;
    while (index < lines.length && !lines[index].startsWith('```')) {
      body.push(lines[index]);
      index += 1;
    }

    if (hinted || SHELL_LANGUAGES.has(language)) {
      for (const command of extractCommands(body.join('\n'))) {
        snippets.push({
          id: `${file}:${start}:${snippets.length + 1}`,
          file,
          language: language || 'text',
          command,
          lineStart: start,
          lineEnd: index + 1,
          reason: hinted ? 'readmesmoke-hint' : 'fenced-block'
        });
      }
    }
    hinted = false;
  }

  return snippets;
}

export function extractCommands(block: string): string[] {
  return block
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith('#'))
    .map((line) => line.replace(/^[$>]\s*/, '').trim())
    .filter((line) => !line.endsWith('\\'));
}
