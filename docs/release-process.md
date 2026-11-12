# Release process

The release and release dry-run workflows install ReleaseBox from the upstream
repository at the immutable commit `9ef650354880ee84a1038d89e4522589c0f3d8b4`.
This revision is the upstream `main` commit reviewed for this pin (observed
2026-11-12); the workflows check out that exact commit rather than a mutable
tag or branch. Update both workflow pins together only after reviewing the new
upstream revision.

A version tag triggers the release workflow. The dry-run workflow exercises
the same pinned ReleaseBox commands on pull requests and manual dispatch.
