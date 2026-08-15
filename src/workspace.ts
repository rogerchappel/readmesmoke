import { cp, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import type { ReadmeSmokeConfig } from './types.js';
import { pathExists } from './globs.js';

export interface PreparedWorkspace {
  path: string;
  cleanup(): Promise<void>;
}

export async function prepareWorkspace(root: string, config: ReadmeSmokeConfig): Promise<PreparedWorkspace> {
  const fixtures = (config.fixtures ?? []).map((fixture) => {
    const source = resolve(root, fixture);
    const destinationPath = relative(root, source);
    if (!destinationPath || destinationPath.startsWith(`..${sep}`) || isAbsolute(destinationPath)) {
      throw new Error(`fixture must resolve inside the project root: ${fixture}`);
    }
    return { source, destinationPath };
  });
  const workspace = await mkdtemp(join(tmpdir(), 'readmesmoke-'));
  for (const { source, destinationPath } of fixtures) {
    if (await pathExists(source)) {
      const destination = join(workspace, destinationPath);
      await mkdir(dirname(destination), { recursive: true });
      await cp(source, destination, { recursive: true });
    }
  }
  return {
    path: workspace,
    cleanup: () => rm(workspace, { recursive: true, force: true })
  };
}
