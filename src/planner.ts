import { expandGlobs } from './globs.js';
import { parseMarkdownFile } from './parser.js';
import { inspectRisk, isDenied } from './risk.js';
import type { PlannedCommand, ReadmeSmokeConfig } from './types.js';

export async function plan(root: string, config: ReadmeSmokeConfig): Promise<PlannedCommand[]> {
  const files = await expandGlobs(root, config.docs);
  const snippets = (await Promise.all(files.map((file) => parseMarkdownFile(root, file)))).flat();
  return snippets.map((snippet) => {
    const risk = inspectRisk(snippet.command);
    const allowPattern = config.allow.find((pattern) => new RegExp(pattern).test(snippet.command));
    return {
      ...snippet,
      risk,
      allowPattern,
      allowed: Boolean(allowPattern) && !isDenied(risk)
    };
  });
}
