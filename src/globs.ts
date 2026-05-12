import { readdir, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

export async function expandGlobs(root: string, patterns: string[]): Promise<string[]> {
  const files = await walk(root);
  const normalized = files.map((file) => relative(root, file).split(sep).join('/'));
  const matches = new Set<string>();
  for (const pattern of patterns) {
    const regex = globToRegExp(pattern);
    for (const file of normalized) {
      if (regex.test(file)) matches.add(file);
    }
  }
  return [...matches].sort();
}

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) results.push(...await walk(fullPath));
    if (entry.isFile()) results.push(fullPath);
  }
  return results;
}

export function globToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*\//g, '(?:.*/)?')
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*');
  return new RegExp(`^${escaped}$`);
}

export async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}
