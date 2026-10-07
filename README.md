# NSPA resources — Miguel Guhlin

Website: https://mguhlin.github.io/nspa/

A consolidated home for NSPA training resources and the 2026 conference collection.

- `index.html`: workshop starting point with a Resources drop-down.
- `resources/library.html`: complete searchable resource library (works without JavaScript).
- `resources/infographics.html`: all original infographic downloads and workshop visual references.
- `2026/p/`: unlisted presenter route, speaking guide, presentation with notes, and one complete offline ZIP.
- `resources/`: preserved training series, handouts, prompts, assessments, and teaching prototypes.
- `2026/`: conference workshop hub with a seven-conversation companion, 12 core slides plus 6 optional references, participant workbook, slide PDF without notes, and a small participant session kit. Optional practice labs, capacity matrix, and reference downloads sit behind Resources.
- `supplemental-resources/`: local session planning inputs; ignored by Git and excluded from deployment except this explanatory README is tracked.
- `docs/redirect-map.json`: exact legacy page routes and their destinations.
- `docs/MIGRATION.md`: source inventory, preservation notes, and known limitations.
- `docs/DESIGN.md`: colors and artwork from the supplied PowerPoint template.

## Preview and checks

Run `python3 scripts/check_site.py` and `python3 -m http.server 4178` from the repository, then open http://localhost:4178/.

## Publication

Push to `main`. GitHub Actions validates and deploys a static artifact to GitHub Pages. Only the website HTML, assets, and resources are published. Supplemental inputs, documentation, scripts, and source template files are excluded. No build dependencies or API keys are needed.

The old repositories remain online as redirects so bookmarks continue to work. GitHub Pages uses browser redirects, not HTTP 301 rules. JavaScript preserves queries and fragments; a no-JavaScript meta refresh and visible link provide fallback.

See `LICENSE` for the inherited resource license. Conference branding comes from the supplied NSPA template; no ownership of that branding is asserted.
