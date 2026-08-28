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

  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch (error) {
    throw new ConfigError(`cannot parse config ${selectedPath}: ${errorMessage(error)}`);
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new ConfigError(`config ${selectedPath} must contain a JSON object`);
  }
  return normalizeConfig({ ...defaultConfig(), ...(parsed as Partial<ReadmeSmokeConfig>) });
}
export function normalizeConfig(config: ReadmeSmokeConfig): ReadmeSmokeConfig {
  const timeoutMs = Number(config.timeoutMs ?? 10_000);
  if (!Number.isFinite(timeoutMs)) {
    throw new ConfigError('config.timeoutMs must be a finite number');
  }
  const allow = nonEmptyArray(config.allow, 'allow');
  for (const pattern of allow) {
    try {
      new RegExp(pattern);
    } catch (error) {
      throw new ConfigError(`config.allow contains an invalid regular expression: ${pattern} (${errorMessage(error)})`);
    }
  }
  return {
    ...config,
    docs: nonEmptyArray(config.docs, 'docs'),
    allow,
    timeoutMs: Math.max(100, timeoutMs),
    fixtures: stringArray(config.fixtures ?? [], 'fixtures'),
    env: stringRecord(config.env ?? {}, 'env'),
    redact: stringArray(config.redact ?? defaultConfig().redact, 'redact')
  };
}

function stringArray(value: unknown, name: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new ConfigError(`config.${name} must be a string array`);
  }
  return value;
}

function stringRecord(value: unknown, name: string): Record<string, string> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)
    || Object.values(value).some((item) => typeof item !== 'string')) {
    throw new ConfigError(`config.${name} must be a string-to-string object`);
  }
  return value as Record<string, string>;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function nonEmptyArray(value: unknown, name: string): string[] {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== 'string')) {
    throw new ConfigError(`config.${name} must be a non-empty string array`);
  }
  return value;
}
