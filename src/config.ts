import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { ReadmeSmokeConfig } from './types.js';

const DEFAULT_CONFIG: ReadmeSmokeConfig = {
  docs: ['README.md', 'docs/**/*.md'],
  allow: ['^(?:npm|pnpm|yarn|bun) (?:install|test|run [a-zA-Z0-9:_-]+)$', '^node [./a-zA-Z0-9_-]+\\.js$', '^echo .+$'],
  timeoutMs: 10_000,
  fixtures: [],
  env: {},
  redact: ['TOKEN', 'SECRET', 'PASSWORD', 'API_KEY', 'PRIVATE_KEY']
};

export function defaultConfig(): ReadmeSmokeConfig {
  return structuredClone(DEFAULT_CONFIG);
}

export async function loadConfig(root = process.cwd(), configPath = 'readmesmoke.config.json'): Promise<ReadmeSmokeConfig> {
  const fullPath = resolve(root, configPath);
  try {
    await access(fullPath);
  } catch {
    return defaultConfig();
  }

  const parsed = JSON.parse(await readFile(fullPath, 'utf8')) as Partial<ReadmeSmokeConfig>;
  return normalizeConfig({ ...defaultConfig(), ...parsed });
}

export function normalizeConfig(config: ReadmeSmokeConfig): ReadmeSmokeConfig {
  return {
    ...config,
    docs: nonEmptyArray(config.docs, 'docs'),
    allow: nonEmptyArray(config.allow, 'allow'),
    timeoutMs: Math.max(100, Number(config.timeoutMs ?? 10_000)),
    fixtures: config.fixtures ?? [],
    env: config.env ?? {},
    redact: config.redact ?? defaultConfig().redact
  };
}

function nonEmptyArray(value: unknown, name: string): string[] {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== 'string')) {
    throw new Error(`config.${name} must be a non-empty string array`);
  }
  return value;
}
