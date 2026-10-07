# NSPA project handoff

Updated October 7, 2026. The workshop experience has been simplified for the October 21 presentation. Do not restart completed artwork or add PDFsplat (the user explicitly canceled that request).

## October 6 front-page infographic additions

- Five supplied scholarship-team infographics are featured on the homepage with full-resolution PNG downloads, optimized WebP previews, textual descriptions, and related guides. Assets live in `assets/infographics/`; the main navigation links directly to the section. The original artwork is unchanged. A duplicate 2/2/2 source was published once. Matching entries are in the public mguhlin.org infographic collection.
- This update affects the public resource homepage only; existing workshop, presentation, and offline materials remain unchanged.

## October 6 readability and presentation update

- The homepage leads directly to the October workshop. Three routes distinguish following the workshop, getting handouts, and exploring resources afterward. Earlier sessions and assessments remain available in an expandable group.
- The hub initially offers the workbook and two-page takeaways. Other references, presenter formats, and the complete offline download are grouped separately.
- Online and offline practice now share six activities: request, fictional application, ratings, checkpoints, policy, and next step. One activity appears at a time; existing slide fragments reveal the correct activity and prepared demonstration. Drafts save in the browser and export together. No-JavaScript and print paths preserve all content.
- The readiness checklist shows one area at a time, with four statements, blank rating choices, notes, and a direct action-plan link. Prior ratings and notes remain compatible with the existing storage key.
- `2026/presenter.html` and `handouts/presenter-route.pdf` provide a compact time/slide/activity/question route. The full speaking guide and 26-slide presentation remain available. The workbook is now six pages in the same activity order. Speaking cues, transcript, webdeck, and editable PowerPoint notes share the updated workbook page references.
- Archive wording now uses the same three two-week phases for 2/2/2, removes the stale June “coming” badge, and distinguishes earlier account prerequisites from October participation. Ten longer reference pages have short starting instructions; resource descriptions and phone text are larger.
- Reviewed presentation copies are saved in `/media/mg/data/nspa`: PowerPoint, PDF, `nspa-presentation.html`, `nspa-speaking-guide.pdf`, and `nspa-presenter-route.pdf`. Copy hashes were verified.
- New shared sources: `scripts/workshop/route.py` and `experience.py`; interaction: `2026/workshop-flow.js` and maintained `practice.js`; `sync_notes.py` updates PowerPoint notes while preserving all other package parts.
- Validation covers desktop/phone overflow, guided navigation, direct demo fragments, clipboard, saved drafts and ratings, exports, print, no-JavaScript fallback, and local-file offline operation without remote requests. Workbook and one-page route were visually inspected; updated speaking-guide pages were checked. Git treats PDFs and presentation packages as binary through `.gitattributes`.

## Project and publication

- Repository: `/media/mg/data/vibecoding/mguhlin/nspa`, `mguhlin/nspa`, branch `main`.
- Website: https://mguhlin.github.io/nspa/
- Conference hub: https://mguhlin.github.io/nspa/2026/
- September implementation commit: `e5c9f93c59a56130e7d9ac7aa025988861e77e88`; see the current Git log for the October readability update.
- September verified Pages deployment: run `36078866838`. For the latest deployment, check GitHub Actions and compare the live workshop pages and offline archive with the current checkout.
- Standing user authorization in the parent `AGENTS.md`: finish changes, check, commit, push, deploy, and verify live without routine confirmation. Recheck working-tree status before edits.
- Git push uses the scoped repository credentials. Default `gh` account may be `mglearn`; for `mguhlin` operations use the appropriate authenticated account. `/tmp/nspa-gh.py` was a temporary helper that selects the existing `mguhlin` token internally. Never print tokens; temporary helpers may disappear.

## Session and preferences

Trust, Transparency, and AI: Building Responsible Scholarship Review Practices. October 21, 2026, 3:30–5:00 PM CT; 90 minutes.

The three outcomes are a clearer review prompt, a protected workflow with human decision ownership, and a fair approach to applicant AI use. Use fictional data. Detector signals are not proof of misconduct. Preserve qualified source interpretations already documented in the materials.

User preferences: match the supplied NSPA 2026 template and official logo; teal, aqua, slate, orange, and gold with readable contrast. Favor compact navigation over endless scroll. Processes and checklists should use infographics; photorealistic people are welcome with generated-image disclosure. Speaking notes and facilitator guidance should match and sound friendly, approachable, and jargon-free. Capacity statements start with “I can,” “I know how,” etc.; statement first, blank rating columns and notes afterward. Author links go to https://mguhlin.org.

## What is finished

- Consolidated NSPA repository and migration redirects (see `MIGRATION.md` and `redirect-map.json`).
- Compact resource library with quick links and Office Workflows, Marketing, Build & explore, and Ethics & privacy tabs.
- Restyled fluency assessment, corrected framework/prompt-toolkit contrast, mobile spacing, and readable badges.
- Template-matched 26-slide PowerPoint and PDF, generated illustrations/infographics, source notes, 38 clickable slide resource buttons, and a matching facilitator guide.
- Responsive self-contained webdeck: `2026/webdeck.html`. Real HTML text, embedded artwork, mobile reflow, presenter view, speaker notes, full screen, printing. Keys: arrows, S notes, V presenter, F fullscreen, P print.
- Conference banner concept image: `2026/images/session-concept.webp` (source PNG also retained).
- Complete offline package and two-page template-based takeaway.
- Reviewed 20 public mglearn repositories, then relevant source content. Combined ETHICAL model, ethical instruction blocks, and AI Ethics Case Court into one scholarship-focused toolkit. Added canonical PROTECT privacy tool link. Skipped overlapping checklists, unrelated classroom resources, and unsuitable selection/ranking instructions. See `MGLEARN-RESOURCE-REVIEW.md`.

## Files to open for review

- Offline start: `2026/offline/index.html` (double-click; no server needed).
- Portable archive: `2026/offline/nspa-2026-offline.zip` (about 28 MB). Extract first, keep folder structure intact, open `index.html`.
- Takeaway: `2026/offline/session-takeaways.docx` and `.pdf` (two pages).
- Offline deck: `2026/offline/webdeck.html`; PowerPoint/PDF/slide PNG ZIP under `offline/slides/`.
- Offline speaking route: `offline/facilitator.html`, plus full PDF under `offline/handouts/`.
- Practice: `offline/practice.html` with exportable draft fields and prepared demo references. Capacity matrix: `offline/capacity-matrix.html` with export/print.
- Ethics: `resources/ethics-toolkit.html`, also copied into `offline/resources/`.
- Offline PROTECT: `offline/resources/protect/index.html`. Manual worksheet adapted from seven source categories; JSON save/restore, text/CSV export, Print / Save as PDF. No AI service, keyword scoring, automatic approval, or CDN dependency. DOCX/image exports are deliberately not offered in this manual edition.
- External publications are summarized and their original addresses preserved in `offline/references.html`; complete external publications/services are not bundled. All core activities work without them. PDF/PPTX viewers may restrict local links; webdeck navigation is the tested route.

## Authoritative inputs and builders

Private, git-ignored inputs in `supplemental-resources/`: `SessionTitle_Description.txt`, `2026_NSPA_PPT_Template.pptx`, `nspa_2026_session_takeaways.docx`, logo files, and `webdeck_instructions.md`. Do not publish these source inputs.

Read `WORKSHOP.md` before rebuilding. Shared sources are under `scripts/workshop/`: `content.py`, `facilitator.py`, `slides.py`, `resources.py`, `infographics.py`. `site.py` builds workshop pages. `webdeck.py` builds the self-contained webdeck using the slide renderer and supplied full framework. `build_ethics.py` builds the consolidated toolkit. Library entries in root `index.html` are maintained directly.

Offline sequence: build source content first; run `takeaways.py` using the bundled artifact Python; render a TEMPORARY COPY and inspect all pages; save verified print PDF as `offline/session-takeaways.pdf`; run `offline.py`, `package_offline.py`, then `site.py`. The archive excludes itself and includes a SHA-256 manifest. Repackage after any offline file changes.

DOCX template fidelity: final DOCX preserves every package part except `word/document.xml`. Original colors, list treatments, header/footer artwork, and page geometry remain; body spacers were compacted to fit six takeaways on two pages. The runtime renderer may normalize input parts, so render a disposable copy and preserve the canonical DOCX. Final render matched the reviewed two-page images byte-for-byte.

Artifact dependencies used: `/home/mg/.cache/codex-runtimes/codex-primary-runtime/dependencies/`, bundled Python at `python/bin/python`, Node at `node/bin/node`, bundled LibreOffice via `bin/override`. Read applicable document/presentation/PDF skills for future artifact changes. Existing Playwright install: `/home/mg/Documents/vibecoding/mguhlin/blog/node_modules/@playwright/test`.

## Checks and continuing later

Run `python3 scripts/check_site.py`, `python3 scripts/check_offline.py`, and `git diff --check`. Both site checks run in Pages CI. `build_site.py` stages public files, excluding docs/scripts/private supplemental sources.

Completed QA: 386 offline references resolved; local-file browser tests with networking disabled and no remote requests/errors; all slides, presenter synchronization, local demo links, draft/plan export, mobile widths, PROTECT JSON restore and zero ratings. Extracted ZIP retested at a different path; archive checksums passed. PPTX slide XML and PDF page-content streams matched reviewed originals; offline hyperlinks and notes cues were the intended changes.

Temporary QA/build files live in `/tmp/nspa-offline-review` and `/tmp/nspa-workshop`; do not depend on their persistence. Start a future turn by reading this file and `WORKSHOP.md`, checking Git status/log, and asking what the user wants to review next if no new task is supplied. Recheck time-sensitive guidance before the conference if revising it.

## October 7 prompting infographic additions

Five supplied prompting infographics were renamed descriptively before publication and added to the homepage and matching blog collection. Original PNGs are preserved with optimized WebP previews, descriptions, download links, and related workflow guides. The homepage now features ten supplied visual guides.
