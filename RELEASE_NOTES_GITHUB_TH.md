# Full GitHub installation package — v3.9.3

Package baseline: USEFUL_Acquisition_Planner_v3.9.3_CLEAN_FRESH_INSTALL(1).zip as provided by the user.

No modifications to app layout, HTML, CSS, site locations, or satellite JS logic. Modified from baseline:
- .github/workflows/update-orbit-assets.yml : build and deploy via GitHub Actions with OMM refresh
- GITHUB_INSTALL_TH.md : new installation guide
- README.md : link to guide

Added:
- scripts/check_orbit_status.py : per-satellite public orbit freshness report (generated during deployment)
- data/satellites/README.md : clarifies generated orbital asset locations
- RELEASE_NOTES_GITHUB_TH.md : package notes

The archive intentionally does NOT include made-up, old, or unverified orbital elements. GitHub Actions downloads them on its runner. No need to add generated files manually. If no fresh data is available, satellite positions are hidden.
