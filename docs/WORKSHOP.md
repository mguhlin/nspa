# 2026 workshop production and alignment

Session: **Trust, Transparency, and AI: Building Responsible Scholarship Review Practices**. October 21, 2026, 3:30-5:00 PM CT, 90 minutes. Audience: scholarship providers and review teams.

Purpose: help participants design an evidence-based AI-supported review task, protect the workflow, and define a fair response to applicant AI use. Desired action: leave with one bounded prompt, a workflow with named checkpoints, a policy starter, and a capacity target with an owner and date.

## Session expectations and evidence

| Brief expectation | Workshop work | Participant deliverable |
|---|---|---|
| Effective prompts and clear evaluation criteria | Slides 5-14; prompt repair; independent rubric calibration; two synthetic demonstrations | Revised prompt, evidence table, anchored rubric discussion |
| Privacy, security, and human oversight | Slides 3, 15-16; workflow checkpoint activity | Data approval gate, human owner, and stop rule |
| Applicant AI use, detection limitations, fairness and transparency | Slides 17-20; false-positive illustration; translation-support policy scenario | Permitted-use and disclosure decisions, neutral follow-up, review route |
| Adaptable frameworks for organizational use | Slides 21-25; six-domain capacity matrix; 30-day plan | Self-assessment linked to NSPA resources and exportable action plan |

## Design decisions

- The supplied `2026_NSPA_PPT_Template.pptx` provides the actual cover artwork, content footer, Arial type, orange headings (#FF7233), slate (#2E4F66), teal (#007681), pale aqua (#E4F4F4), and yellow (#FFCD34).
- Exact template slide dimensions: 13.3333 × 7.5 inches, 16:9. Each slide is rendered as a 1536 × 864 PNG and placed full-frame in the PPTX, as requested in the production guide. Speaker notes remain editable; an accessible HTML transcript accompanies the deck.
- 26 slides: 25 timed workshop slides and a source appendix. Processes and activities use nine generated infographic illustrations, a proportional 2/2/1-minute timeline, an evidence status board, and a color-coded scoring table. A 100-block chart visualizes the hypothetical detector example (each block represents ten essays; the assumed rate is not a measured result). Five photorealistic scenes of fictional adults appear across nine slides. Built-in imagegen prompts are recorded in `PHOTO-PROMPTS.json`; final photo assets are in `2026/images/photorealistic/`.
- The official supplied logo is used unchanged, proportionally scaled on light backgrounds. Its teal and gold also anchor the printable handouts.
- Friendly spoken wording and presenter cues share one source, `scripts/workshop/facilitator.py`, for the ten-page facilitator guide and slide notes. The agenda runs 3:30–5:00 PM. A final resource directory matches the slide navigation.
- The three-page capacity checklist has 24 first-person statements in the first column, blank Ready to learn / In progress / Ready to go columns, and Notes. The website starts unmarked and offers matching resources, saved responses, export, and print.

## Source and factual boundaries

The source brief and design instructions remain private in `supplemental-resources/`. The four research/product sources and their qualified interpretations appear in the workshop hub and relevant speaker notes. Guidance was reviewed September 24, 2026 and should be revisited before the October workshop.

The capacity matrix, rubric, and policy starter are original workshop teaching tools. They are not validated instruments, official NSPA policy, or legal determinations. All application material is fictional. Prepared reference outputs are authored examples, not claimed live model runs. Live demonstrations use the copyable synthetic packet in an organization-approved tool; offline paths are supplied.

## Rebuild and maintenance

`content.py` holds shared agenda, packet, prompts, rubric, policy, sources, and capacity statements. `facilitator.py` holds the speaking script; `slides.py` contains slide text and maps the shared script into notes; `render_slides.py` creates deterministic HTML layouts. `pdfs.py` creates printable handouts with ReportLab. `site.py` produces the workshop pages. The JavaScript interaction files and workshop CSS are maintained directly.

Production used the installed Codex primary runtime (26.905.11957), Artifact Tool 2.8.59 for PPTX assembly, and its bundled LibreOffice for rendering. No desktop LibreOffice was used. Runtime loading tools were not exposed in this session; the matching installed runtime paths were inspected directly. Slide screenshot rendering used the existing local Playwright installation. All build intermediates and QA renders stay outside public output directories.

Validate links using `python3 scripts/check_site.py`. Website deployment excludes supplemental inputs and build scripts.

Rebuild order: `python3 scripts/workshop/render_slides.py`, `node scripts/workshop/capture.cjs`, then `assemble.mjs` with the bundled Node runtime and `RUNTIME_NODE_MODULES` set to its node_modules directory. The assembly source records the validated production paths; change final/receipt filenames for subsequent revisions. Convert the validated PPTX with bundled LibreOffice, regenerate the slide ZIP, run `pdfs.py` with the bundled Python, render the handouts to PNG, and run `site.py`.

## Clickable slide resources

`resources.py` is the shared source for 38 slide buttons pointing to 13 unique destinations, including practice documents, both worked demo references, labs, the capacity checklist, and the action plan. Buttons are native PowerPoint hyperlink actions over the full-slide image; LibreOffice PDF export preserves all 38 links. Notes, the HTML transcript, and the speaking-guide directory carry the same destinations. PNGs are static images; use the PowerPoint, PDF, or transcript for clickable navigation.

`infographics.py` controls the new illustration captions and numerical displays. Exact imagegen prompts are in `INFOGRAPHIC-PROMPTS.json`; `INFOGRAPHIC-REVISION.json` records the evidence-comparison artwork correction. Final artwork lives in `2026/images/infographics/`. Required wording and numerical charts are deterministically typeset.

## Self-contained webdeck and session banner

`2026/webdeck.html` embeds the workshop template, real HTML slide text, illustrations, and shared speaking notes in one offline-capable file. The workshop hub includes presentation and download links. Online practice destinations still require a connection. Arrow keys navigate, S toggles notes, V opens the synchronized presenter window, F enters fullscreen, and P prints one slide per page.

Rebuild with `python3 scripts/workshop/webdeck.py`, then `python3 scripts/workshop/site.py`. The generator uses the existing slide renderer and content sources; no separate slide narrative is maintained. `deck-framework.css/js` preserve the framework supplied in `supplemental-resources/webdeck_instructions.md`; the duplicate presenter Next-button ID was corrected so it does not collide with the next-slide preview. NSPA palette, reflow layouts, accessibility fixes, and keyboard/touch integration are isolated in `webdeck-theme.css` and `webdeck-extras.js`.

The session banner uses generated concept art with reviewers, visible evidence, a protective shield, and a path to opportunity. The source PNG and optimized WebP are in `2026/images/session-concept.*`; the generation prompt is recorded in `BANNER-PROMPT.json`.

## Complete offline package

Everything needed for the conference is under `2026/offline/`. Extract `nspa-2026-offline.zip` and open `index.html`. Core activities use prepared teaching references instead of live AI calls. Webdeck resource actions, handout PDF actions, and PowerPoint hyperlink relationships point to local copies. Full external publications are not mirrored; the reference directory preserves source summaries and addresses.

The offline edition includes the consolidated ethics toolkit and a PROTECT manual worksheet with portable JSON restore plus text/CSV export and browser printing. The canonical online privacy tool remains on mglearn. See `MGLEARN-RESOURCE-REVIEW.md` for selection and deduplication decisions.

Rebuild: run `takeaways.py` with the bundled artifact Python, render a temporary COPY with the Documents renderer, inspect every page, and place the verified print PDF at `offline/session-takeaways.pdf`. Render a copy because the runtime may normalize document parts. The final DOCX preserves all template parts byte-for-byte except `word/document.xml`; its list spacing is compacted to keep six takeaways on two pages. Original title colors, typography, page geometry, branded header, and footer remain. Run `offline.py`, `package_offline.py`, and `site.py` in that order. `offline.py` preserves the authored takeaway files and rebuilds its other outputs from canonical content. The archive excludes itself and includes a SHA-256 file manifest.

Validation: `check_site.py` and `check_offline.py` run in deployment. Browser QA used file URLs with networking disabled; it covered all local HTML resource pages, 26-slide navigation, presenter synchronization, local demo links, draft/plan downloads, manual privacy review JSON restore, zero-score preservation, mobile widths, and absence of remote requests. PPTX slide XML and PDF page content streams are unchanged from their reviewed originals; only offline navigation and notes cues differ. Takeaway PDF is two pages, visually inspected against the supplied template.
