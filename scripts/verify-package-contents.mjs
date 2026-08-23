import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

function collectTargets(value, targets = []) {
  if (typeof value === 'string') targets.push(value);
  else if (value && typeof value === 'object') {
    for (const child of Object.values(value)) collectTargets(child, targets);
  }
  return targets;
}

function normalizeTarget(target) {
  return target.replace(/^\.\//, '');
}

export function validatePackageContents(packageJson, packResult) {
  const files = new Set((packResult.files ?? []).map(({ path }) => path));
  const declaredTargets = [
    ...Object.values(packageJson.bin ?? {}),
    packageJson.main,
    packageJson.types,
    ...collectTargets(packageJson.exports),
  ].filter(Boolean).map(normalizeTarget);

  const requiredFiles = [
    ...declaredTargets,
    'README.md',
    'examples/basic/README.md',
    'demo/run-basic-readme-smoke.sh',
    'docs/tutorials/fixture-readme-smoke.md',
    'scripts/validate.sh',
    'scripts/validate-release-readiness.mjs',
  ];
  const missing = [...new Set(requiredFiles)].filter((file) => !files.has(file));

  if (missing.length > 0) {
    throw new Error(`Package is missing required distribution files:\n${missing.map((file) => `- ${file}`).join('\n')}`);
  }

  return requiredFiles.length;
}

export function main() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const result = spawnSync('npm', ['pack', '--dry-run', '--json'], { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }

  const [packResult] = JSON.parse(result.stdout);
  const count = validatePackageContents(packageJson, packResult);
  console.log(`Package contents verified (${packResult.files.length} files; ${count} required paths).`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
