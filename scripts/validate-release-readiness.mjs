import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packagePath = path.join(root, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const scripts = packageJson.scripts ?? {};
const failures = [];
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const releaseWorkflowPath = path.join(root, '.github', 'workflows', 'release.yml');
const releaseWorkflow = fs.existsSync(releaseWorkflowPath)
  ? fs.readFileSync(releaseWorkflowPath, 'utf8')
  : '';

function requireField(condition, message) {
  if (!condition) failures.push(message);
}

requireField(packageJson.repository, 'package.json must declare repository metadata');
requireField(Array.isArray(packageJson.files) && packageJson.files.length > 0, 'package.json must declare a non-empty files allowlist');
requireField(scripts['package:smoke'], 'package.json scripts must include package:smoke');
requireField(scripts['release:check'], 'package.json scripts must include release:check');
requireField(scripts.prepare === 'npm run build', 'package.json must build distributable files during Git installation');
requireField(
  readme.includes('npm install --save-dev github:rogerchappel/readmesmoke'),
  'README installation guidance must use the supported GitHub package source',
);
requireField(
  !readme.includes('npm install --save-dev readmesmoke\n'),
  'README must not claim the unpublished npm registry package is installable',
);
requireField(/gh release create/.test(releaseWorkflow), 'release workflow must publish a GitHub release artifact');
requireField(/npm pack/.test(releaseWorkflow), 'release workflow must build an npm-compatible tarball');
requireField(!/npm publish/.test(releaseWorkflow), 'release workflow must not imply npm registry publication');
requireField(!/id-token:\s*write/.test(releaseWorkflow), 'release workflow must not request unused OIDC permissions');
requireField(!/registry-url:/.test(releaseWorkflow), 'release workflow must not configure an unused npm registry');

const workflowDir = path.join(root, '.github', 'workflows');
if (fs.existsSync(workflowDir)) {
  const workflowFiles = fs.readdirSync(workflowDir).filter((file) => /\.ya?ml$/.test(file));
  requireField(workflowFiles.length > 0, 'repository must include at least one workflow file');

  for (const file of workflowFiles) {
    const workflow = fs.readFileSync(path.join(workflowDir, file), 'utf8');
    requireField(!/TODO|FIXME|template becomes an app|customization TODO/i.test(workflow), '.github/workflows/' + file + ' still contains placeholder text');
  }

  const combined = workflowFiles.map((file) => fs.readFileSync(path.join(workflowDir, file), 'utf8')).join('\n');
  requireField(/release:check/.test(combined), 'CI workflows must run npm run release:check');
}

if (failures.length > 0) {
  console.error('Release readiness validation failed:');
  for (const failure of failures) console.error('- ' + failure);
  process.exit(1);
}

console.log('Release readiness validation passed.');
