import { cp, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import type { ReadmeSmokeConfig } from './types.js';
import { pathExists } from './globs.js';

export interface PreparedWorkspace {
  path: string;
  cleanup(): Promise<void>;
}

export async function prepareWorkspace(root: string, config: ReadmeSmokeConfig): Promise<PreparedWorkspace> {
  const workspace = await mkdtemp(join(tmpdir(), 'readmesmoke-'));
  for (const fixture of config.fixtures ?? []) {
    const source = resolve(root, fixture);
    if (await pathExists(source)) {
      await cp(source, join(workspace, basename(fixture)), { recursive: true });
    }
  }
  return {
    path: workspace,
    cleanup: () => rm(workspace, { recursive: true, force: true })
  };
}
