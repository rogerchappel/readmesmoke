import { readFile } from 'node:fs/promises';
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

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export async function loadConfig(root = process.cwd(), configPath?: string): Promise<ReadmeSmokeConfig> {
  const implicitDefault = configPath === undefined;
  const selectedPath = configPath ?? 'readmesmoke.config.json';
  const fullPath = resolve(root, selectedPath);
  let contents: string;
  try {
    contents = await readFile(fullPath, 'utf8');
  } catch (error) {
    if (implicitDefault && isNodeError(error) && error.code === 'ENOENT') return defaultConfig();
    throw new ConfigError(`cannot read config ${selectedPath}: ${errorMessage(error)}`);
  }

  const parsed = JSON.parse(contents) as Partial<ReadmeSmokeConfig>;
  return normalizeConfig({ ...defaultConfig(), ...parsed });
}

export function normalizeConfig(config: ReadmeSmokeConfig): ReadmeSmokeConfig {
  const timeoutMs = Number(config.timeoutMs ?? 10_000);
  if (!Number.isFinite(timeoutMs)) {
    throw new ConfigError('config.timeoutMs must be a finite number');
  }
  return {
    ...config,
    docs: nonEmptyArray(config.docs, 'docs'),
    allow: nonEmptyArray(config.allow, 'allow'),
    timeoutMs: Math.max(100, timeoutMs),
    fixtures: config.fixtures ?? [],
    env: config.env ?? {},
    redact: config.redact ?? defaultConfig().redact
  };
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function nonEmptyArray(value: unknown, name: string): string[] {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== 'string')) {
    throw new Error(`config.${name} must be a non-empty string array`);
  }
  return value;
}
