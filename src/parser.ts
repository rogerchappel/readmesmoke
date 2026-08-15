import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { CommandSnippet } from './types.js';

const RUN_HINT = /^\s*<!--\s*readmesmoke:\s*run\s*-->\s*$/i;
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

    const fence = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (!fence) {
      hinted = false;
      continue;
    }

    const delimiter = fence[1];
    const info = fence[2].trim();
    if (delimiter[0] === '`' && info.includes('`')) {
      hinted = false;
      continue;
    }

    const language = (info.split(/\s+/, 1)[0] || '').toLowerCase();
    const start = index + 1;
    const body: string[] = [];
    index += 1;
    while (index < lines.length && !isClosingFence(lines[index], delimiter)) {
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

function isClosingFence(line: string, opener: string): boolean {
  const fence = line.match(/^ {0,3}(`+|~+)[ \t]*$/);
  return Boolean(fence && fence[1][0] === opener[0] && fence[1].length >= opener.length);
}

export function extractCommands(block: string): string[] {
  const commands: string[] = [];
  let current: string[] = [];
  let compoundDepth = 0;
  let heredocDelimiter: string | undefined;

  const flush = () => {
    if (current.length > 0) commands.push(current.join('\n'));
    current = [];
  };

  for (const physicalLine of block.split(/\r?\n/)) {
    const line = physicalLine.trim().replace(/^[$>]\s*/, '');

    if (heredocDelimiter) {
      current.push(physicalLine);
      if (line === heredocDelimiter) {
        heredocDelimiter = undefined;
        if (compoundDepth === 0) flush();
      }
      continue;
    }

    if (!line || (line.startsWith('#') && current.length === 0)) continue;
    current.push(line);

    const heredoc = line.match(/<<-?\s*(['"]?)([A-Za-z_][A-Za-z0-9_]*)\1/);
    if (heredoc) heredocDelimiter = heredoc[2];

    compoundDepth += compoundDelta(line);
    if (!heredocDelimiter && compoundDepth === 0 && !line.endsWith('\\')) flush();
  }

  flush();
  return commands;
}

function compoundDelta(line: string): number {
  const code = line.replace(/#.*$/, '');
  const opens = count(code, /\b(?:do|then|case)\b/g) + count(code, /(?:^|[;{]\s*)\{(?:\s|$)/g);
  const closes = count(code, /\b(?:done|fi|esac)\b/g) + count(code, /(?:^|[;}]\s*)\}(?:\s*;?\s*$)/g);
  return opens - closes;
}

function count(value: string, pattern: RegExp): number {
  return [...value.matchAll(pattern)].length;
}
