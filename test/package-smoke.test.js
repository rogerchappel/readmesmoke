import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { validatePackageContents } from '../scripts/verify-package-contents.mjs';

const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/package-smoke.json', import.meta.url), 'utf8'));
const asPackResult = (paths) => ({ files: paths.map((path) => ({ path })) });

test('accepts a tarball containing declared entry points and promised assets', () => {
  assert.doesNotThrow(() => validatePackageContents(fixture.packageJson, asPackResult(fixture.validFiles)));
});

test('rejects a tarball missing a required promised asset', () => {
  const missingDocs = fixture.validFiles.filter((path) => path !== 'docs/tutorials/fixture-readme-smoke.md');
  assert.throws(
    () => validatePackageContents(fixture.packageJson, asPackResult(missingDocs)),
    /Package is missing required distribution files:\n- docs\/tutorials\/fixture-readme-smoke\.md/,
  );
});
