## AI prompting practice collection

The user requested a separate presentation focused on prompts, ChatGPT Projects, instructions, skills, administrative organization, and rubric evidence. Maintain it at `2026/prompting/` using `scripts/prompting/`. Its 31-slide beginner sequence and plain-language word guide lead into the unchanged three demonstration prompts. The self-check explains applicant codes and gives one simple next step per phase. See that folder’s README for building and checks. Do not rebuild the original presentation or its workbook/guide when updating this collection. The shared tab row contains only Trust, Transparency, and AI and AI Prompting Practice. Session overview and awareness self-check are linked from page content. Prompting presenter files belong only under `2026/p/`; its participant hub offers the slide PDF and practice materials. Keep `scripts/workshop/supplied_edition.py` navigation and the static workshop pages consistent.

# 2026 workshop production and alignment

## October 20 revised edition — current

Read the first section of HANDOFF.md. It supersedes the earlier builders, slide counts, and presenter downloads. The user's `NSPA26 Slides.pptx` has **28 slides and nine activities**. All source slide visuals, relationships, media, and five native tables stay unchanged. Only speaker-note XML bodies receive the shared first-person speaking text. Current PDFs: presentation 28 pages, workbook 11 pages, takeaways two pages, facilitator speaking guide 14 landscape pages with two slides per page and 14-point text.

Use bundled runtimes under `/home/mg/.cache/codex-runtimes/codex-primary-runtime/dependencies/`: `python/bin/python`, `node/bin/node`, and `bin/override/soffice`. The canonical framework clone is now the sibling `../webdecks/`; keep the project's framework copy and its existing presenter-preview ID correction.

1. Preserve the user's PPTX privately as `supplemental-resources/NSPA26 Slides.pptx`. Export it with bundled LibreOffice `impress_pdf_Export`, explicitly setting both `ExportNotesPages=false` and `ExportOnlyNotesPages=false`. Save the 28-page result to `2026/slides/nspa-trust-transparency-ai.pdf` and render `pdftoppm -scale-to 1536 -png`. Copy numbered images 01–28 to `2026/images/nspa-trust-transparency-ai/`. Do not publish a PNG ZIP.
2. Export notes JSON with bundled Python: `scripts/workshop/current_edition.py --notes-json /tmp/nspa-speaking-notes.json`. Then run bundled Node with `scripts/workshop/prepare_presenter.mjs SOURCE NOTES_JSON CANDIDATE_PPTX SCRATCH_DIR`. It imports the source with Artifact Tool, authors notes, and transplants only note bodies into the original package. Verify the 28 note bodies match the common script and every non-note file matches the source. Validate the candidate before copying to `2026/p/slides/nspa-trust-transparency-ai.pptx`.
3. Run bundled Python `scripts/workshop/current_edition.py`. It rebuilds the participant and presenter pages, companion, workbook, adaptive guide, two-slide-per-page guide PDF, and original-artwork webdeck with semantic text equivalents. `webdeck.py` rebuilds only the webdeck. All shared speaking text and the nine activities live in `revised_content.py`; `revised_edition.py` handles output. PowerPoint preparation and slide-image exports are separate deliberate steps.
4. Run `takeaways.py`, preserving every supplied NSPA DOCX template part except `word/document.xml`. Render a temporary copy with the Documents skill renderer and `--emit_pdf`; verify both pages, then copy the PDF to `2026/handouts/session-takeaways.pdf`.
5. The adaptive facilitator guide is `2026/p/facilitator-guide.html`, with its own CSS/JS and 18–36 px adjustable speaking text. It fits phone and tablet widths and keeps the thumbnail and first-person script together. The PDF uses two slide blocks per landscape page, thumbnails on the left and 14-point speaking text on the right. No editable-guide or route download is needed. Keep the simplified four-download presenter hub and omit the former timing table and discussion-reserve paragraph.
6. Success criteria: preserve the current illustration style, use the exact new eight-criterion text in `SUCCESS_TEXT`, and keep its text equivalent only in image alt text. The supplied QR image points to the workshop blog resource post. Link it accurately and keep a direct link to the handouts alongside it. New companion drafts use `nspa-review-20261020`, preserving previous-edition storage.
7. Verify all slide images, guide/workbook/takeaway pages, shared notes, 28-page webdeck printing, presenter previews/synchronization and note resizing, phone/tablet reflow and guide text-size persistence, all nine companion activities and draft export, no-JavaScript activities, and local/staged links. Run `check_site.py`, `build_site.py`, and `git diff --check`. Staging excludes retired presenter guide DOCX, route PDF, and presenter transcript, and all ZIPs. Commit, push, monitor GitHub Pages, and compare hashes of the live downloads and imagery.

## October 18 success-criteria infographic restored

The participant hub now shows the updated `2026/images/success-criteria.png` infographic (optimized WebP preview), with three learning-intention questions and six criteria aligned to the current 31-slide deck. It preserves the earlier illustration style while using the current five-part prompt structure and next-review-cycle pilot. `experience.py:learning_intentions()` supplies the matching accessible text and image download; `supplied_edition.py:build_pages()` includes it after the participant downloads. The user-requested “Session route and discussion time” section is removed from the participant hub; presenter timing remains in presenter materials. Original learning-intentions artwork is preserved. Exact built-in imagegen prompt: `docs/SUCCESS-CRITERIA-PROMPT.json`.

## October 18 original webdeck infographics restored

The user flagged the missing infographics in the native-text webdeck. The current webdeck now embeds all 31 original slide images as lossless WebP, preserving the supplied PowerPoint design, diagrams, logos, and existing artwork. Images come from the committed numbered PNG gallery. Do not replace the visuals with text cards. HTML equivalents remain for screen readers and are visible below each graphic on phones. The supplied speaking notes, presenter previews/synchronization, notes sizing, print, and source hyperlinks remain. The infographic slide image includes its original footer; the semantic sibling footer is hidden to avoid duplication. Only the webdeck is rebuilt with `webdeck.py`; participant documents and prior hub simplifications remain unchanged. Evidence: `docs/WEBDECK-ARTWORK-QA.json`.

## October 18 workshop resources page removed

The user requested removal of `2026/resources.html`. The page and its navigation links are removed; it is no longer generated or published. The original resource library and infographic collection remain available. The old URL returns 404. The hub also omits the supporting-resources link and the two introductory explanation paragraphs and describes the presentation download as “31 slides for viewing and sharing,” per the user’s follow-up edits.

## October 18 evening supplied 31-slide edition — current

Read the first current section of HANDOFF.md. This supersedes all earlier core counts and activity sources. The user confirmed **90 minutes (3:30–5:00 PM CT)**, using the new **60-minute core plus 30-minute discussion reserve**. Current formats: 31 slides, 10-page workbook, eight companion activities, two-page takeaways, 32-page supplied illustrated guide, one-page route. Slides 30–31 are backups.

Sources and entry points:

- `scripts/workshop/supplied_edition.py`: original-artwork webdeck with readable text equivalents, current pages/transcripts, workbook, route, and notes-only PPTX update.
- `scripts/workshop/presentation-20261018.txt`: the user's complete speaking notes, shared by the webdeck, PowerPoint, and private Markdown script.
- `scripts/workshop/current_edition.py`: current build compatibility entry point; `webdeck.py` rebuilds just the webdeck.
- `scripts/workshop/takeaways.py`: two-page original-template takeaways, with separate centered attribution. Only document.xml changes.
- Private inputs: `supplemental-resources/NSPA26_TT_AI_SR.pptx` and `NSPA_Facilitator_Guide_Embedded_Images.docx`. The final published PowerPoint and guide DOCX provide committed fallbacks.
- Canonical Web Deck v5 framework was refreshed from the full published standalone specification because the former local clone is absent. It is inlined in the portable webdeck with an exit link to the presenter hub. The projected view preserves the original infographic artwork; HTML equivalents support screen readers and phone reflow.

Rebuild order:

1. Run `scripts/workshop/current_edition.py` with bundled Python: `/home/mg/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python`. This preserves slide design/package parts while updating notes. Do not run the legacy slide assemblers, visual patchers, activity expansion, or offline builders.
2. Export PPTX using bundled `/home/mg/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/soffice`, `impress_pdf_Export`, and `ExportNotesPages=false`, `ExportOnlyNotesPages=false`. Save exactly 31 pages to `2026/slides/nspa-trust-transparency-ai.pdf`. Render `pdftoppm -scale-to 1536 -png`, copying 01.png–31.png into the numbered gallery. No ZIP.
3. Run `takeaways.py`; render a temporary copy with the Documents skill `render_docx.py --emit_pdf`. Save the verified two-page PDF to `2026/handouts/session-takeaways.pdf`. Preserve the supplied NSPA template and every package part outside document.xml.
4. The user-supplied illustrated guide is published unchanged as `2026/p/facilitator-guide.docx`; render/export it with `render_docx.py --emit_pdf` and save its verified 32-page PDF beside it. The 60-minute label describes the core; the presenter route explains the extra 30 minutes. The builder does not overwrite the supplied guide PDF when its DOCX exists.
5. Check all slides and handout pages visually. Validate PPTX package/layout/import and notes, source-part preservation, 31-page slide-only PDF, participant/presenter separation, desktop/phone layouts, notes resizing and two-window synchronization, draft persistence/export, no-JavaScript companion, 31-page webdeck printing, and local/staged links. Do not publish obsolete kits or ZIPs.
6. Run `scripts/check_site.py`, `scripts/build_site.py`, and `git diff --check`. Commit, push, monitor Pages deployment, then compare live download SHA-256 hashes with the published artifacts.

Current workbook pages: cover; balancing act; prompt repair; inventory; evidence and handoff; human checks/data protection; flagged essay; local rules; next-cycle commitments; reusable prompt. The companion matches pages 2–9, with a separate draft storage key for this edition. Required inputs are complete; there is no longer essay to locate. All example data and prepared drafts are fictional.

## October 18 expanded visual and activity edition — current

Read the current section in HANDOFF.md first. It supersedes the supplied-deck preservation and kit instructions below. Current delivery: **28 slides (24 core + 4 backups), 16-page illustrated-cover workbook, eight complete first-person companion activities, two-page takeaways, 29-page guide, one-page route**. The participant hub offers only workbook, presentation PDF without notes, and takeaways. Kit and ZIP publication is canceled.

Shared authoring sources: `current_edition.py`, `activities.py` (complete cases, worked examples and integrated 90-minute route), `demo_one.py` (six-part AI prompt), and `visual_deck.py` (nine revised HTML/native PPTX visual layouts and synchronized notes). Learning-intentions accessible text is in `experience.py`; imagegen prompts are in `REVISED-VISUAL-PROMPTS.json`. Five native PPTX tables remain; untouched slides retain their supplied design. All practice information is available in the companion/workbook; no longer essay is missing.

Current rebuild order:

1. Bundled Python: `scripts/workshop/current_edition.py`.
2. Bundled LibreOffice: export the resulting PPTX with `impress_pdf_Export`, `ExportNotesPages=false` and `ExportOnlyNotesPages=false`. Verify 28 slide pages; copy to `2026/slides/nspa-trust-transparency-ai.pdf`.
3. Render PDF with `pdftoppm -scale-to 1536 -png`; copy exactly `01.png`–`28.png` into the slide gallery. No ZIP rebuild.
4. Takeaway sources now belong in `2026/handouts/`. Preserve the separate author byline and original NSPA template. Do not run offline builders or legacy presentation assemblers.
5. Run local links, presentation finalizer, visual and interaction checks, `scripts/build_site.py` and staged link checks. The staging step excludes historical offline packages and all ZIPs, while retaining old takeaway URL aliases.
6. Commit, push, deploy and verify live downloads. Publication is explicitly authorized.

The earlier production history follows for provenance.

## October 18 supplied-deck edition — superseded

Session: **Trust, Transparency, and AI: Building Responsible Scholarship Review Practices**. October 21, 2026, **3:30–5:00 PM CT, 90 minutes**. The user explicitly confirmed the session length and plans to expand resource use. Preserve the supplied presentation and allow flexible discussion alongside its core cues.

- 24 core slides plus backups B1–B4 (28 slides total), with nine editable native PowerPoint tables.
- Three separate fictional teaching examples: triage of A-101–A-103, a repair-table essay with a 1–4 community-impact criterion, and supplied-evidence tags. Reused IDs do not imply a combined applicant record.
- Eight-section companion with local notes, copyable prompts, export, print, and no-JavaScript access. It needs no AI account. Separate current storage keys protect previous notes.
- Six-page workbook, two-page NSPA-template takeaways, participant slide-only PDF and transcript, 28-image ZIP/gallery. Unlisted presenter route, 29-page notes guide, PowerPoint, webdeck and full transcript.
- Existing C-101 labs, references, readiness checklist, library and infographics remain supplementary. C-101 uses a different packet and 0–2 rubric.

Current sources are `scripts/workshop/current_edition.py` and the supplied files in ignored `supplemental-resources/`. The committed `2026/p/webdeck.html` is the fallback content source on machines without private inputs. The builder preserves supplied slide text/design while updating the session label and obsolete site-mismatch notes. Only three PPTX parts change; all other parts must match the supplied source.

Rebuild order:

1. Run `python3 scripts/workshop/current_edition.py` (or `site.py` when preserved references/labs also need rebuilding). Do not use the earlier slide assembler or notes synchronizer.
2. Export the current `2026/p/slides/nspa-trust-transparency-ai.pptx` with bundled LibreOffice and `impress_pdf_Export`, explicitly setting `ExportNotesPages=false` and `ExportOnlyNotesPages=false`. Verify 28 pages and save to `2026/slides/nspa-trust-transparency-ai.pdf`.
3. Render that PDF with `pdftoppm -scale-to 1536 -png`. Save numbered images `01.png`–`28.png` under `2026/images/nspa-trust-transparency-ai/`, and zip exactly those 28 numbered images into `2026/slides/nspa-trust-transparency-ai-pngs.zip`.
4. Run `takeaways.py` with the bundled Python. Render a temporary copy using Documents `render_docx.py --emit_pdf`, inspect both pages, and save the verified PDF to `2026/offline/session-takeaways.pdf`. Preserve every DOCX package part except `word/document.xml`.
5. Run `offline.py`, then `scripts/package_offline.py`. Participant kit: 12 payload files; presenter kit: 83. Validate both manifests and extracted local-file operation.
6. Run `scripts/check_site.py`, `scripts/check_offline.py`, `scripts/build_site.py`, and `git diff --check`. Validate desktop/phone slides and every companion section, presenter sync and notes sizing, exports/persistence, no-JavaScript, print, 28-page participant PDF without speaker notes, and source package preservation.
7. Commit, push and verify GitHub Pages and live download hashes under the parent AGENTS.md standing authorization.

The earlier production history below is retained for optional materials and provenance. It does not define the current core presentation.


Session: **Trust, Transparency, and AI: Building Responsible Scholarship Review Practices**. October 21, 2026, 3:30-5:00 PM CT, 90 minutes. Audience: scholarship providers and review teams.

## October 7 conversation edition

The experience starts with trust, explores one fictional application from different perspectives, and ends with one change to try with a colleague. Independent thinking, equal partner turns, small-group challenges, quiet reflection, and revision make the learning visible. A complete prompt, policy, and readiness assessment are optional extensions rather than additional required outputs.

The presentation contains **12 core slides and 6 optional reference slides**. Hold slide 12 at the close. Slides 13-18 are outside the timed route. All original library resources, supplied infographics, longer practice labs, quick references, and prior-session materials remain available.

| Time CT | Core slides | Conversation and purpose |
|---|---|---|
| 3:30-3:40 | 1-2 | Welcome, trust memory, and listening to a partner |
| 3:40-3:50 | 3-4 | How conversation changes understanding; question a polished summary |
| 3:50-4:10 | 5-6 | Read C-101 independently; compare evidence and one scoring criterion |
| 4:10-4:15 | 7 | Two uninterrupted minutes of silence; reflect on an assumption |
| 4:15-4:35 | 8-9 | Map named human checkpoints; receive a peer challenge and revise |
| 4:35-4:50 | 10-11 | Discuss a fair rule; hear the applicant's perspective and revise a message |
| 4:50-5:00 | 12 | One change, a learning colleague, a date, and evidence of improvement |

`conversation.html` provides seven guided conversations with saved, exportable notes. The 10-page workbook has a cover, six activity pages (2-7), and three optional visual references (8-10): evidence before interpretation, human checkpoints, and a fair applicant response. All original activity writing lines are preserved. The 15-page speaker guide has an opening page, one page for each core slide, optional references, and a link directory. The presenter route is one page. Existing `practice.html` labs and the readiness checklist remain optional.

## Design and artifact production

The supplied `2026_NSPA_PPT_Template.pptx` provides the exact cover artwork, content footer, Arial type, orange headings (#FF7233), slate (#2E4F66), teal (#007681), pale aqua (#E4F4F4), and gold (#FFCD34). The official logo is unchanged and proportionally scaled.

The new artwork uses paper-cut and frosted-glass illustrations in the NSPA palette. Exact built-in imagegen prompts are recorded in `CONVERSATION-ART-PROMPTS.json` and `CONVERSATION-ART-REFINEMENTS.json`. Source images are under `2026/images/conversation/`. Wide compositions leave room for clear labels. Required text, labels, and sources are deterministically typeset outside the raster artwork.

Exact template dimensions are 13.3333 × 7.5 inches. Per the supplied production instructions, each slide is rendered as a 1536 × 864 PNG and placed full-frame in the PPTX. PowerPoint speaker notes remain editable. There are 24 native slide hyperlink actions; PDF export preserves them. The PNG ZIP contains exactly 18 numbered images. Older unreferenced slide PNGs are retained as historical assets.

`2026/p/webdeck.html` embeds the template, real HTML slide text, illustrations, and shared speaker notes in one file. It supports phone reflow, keyboard/touch navigation, notes, a synchronized presenter window, full screen, and one-slide-per-page printing. Arrow keys navigate; S toggles notes, V opens presenter view, F enters full screen, and P prints. Its framework comes from the supplied `webdeck_instructions.md`; integration fixes live in `webdeck-theme.css` and `webdeck-extras.js`.

## Shared sources and rebuild sequence

Private production inputs stay in git-ignored `supplemental-resources/`. Do not publish the source template, planning brief, or logos outside their approved public derivatives.

- `content.py`: fictional packet, rubric, prepared lab outputs, policy examples, sources, capacity statements.
- `route.py`: seven core conversation routes and timing, plus preserved optional lab routes.
- `facilitator.py`: shared speaking script, exact timing, workbook references, debriefs, and adaptations.
- `slides.py`: 18 slides, notes derived from that script, source and generated-art disclosures.
- `resources.py`: slide navigation and the matching resource directory.
- `render_slides.py`, `capture.cjs`, `assemble.mjs`: deterministic layouts, screenshots, and PPTX assembly.
- `conversation.py`, `experience.py`, `site.py`: guided companion, hub, optional labs, and presenter page.
- `pdfs.py` and `participant_packet.py`: matching workbook, cover/visual references, guide, route, and preserved reference handouts.
- `presentation_script.py`: exports the full first-person Markdown script to `docs/presentation-script.md`; the requested copy is on the Desktop.
- `webdeck.py`: self-contained HTML presentation.
- `offline.py` and `scripts/package_offline.py`: local edition and ZIP manifest.

Rebuild authored content first. Run `python3 scripts/workshop/render_slides.py`, then `node scripts/workshop/capture.cjs`. Assemble using the bundled Node runtime and the validated `assemble.mjs` build path; update output/receipt names for each revision. Run the presentation skill finalizer. Convert the validated PPTX with bundled LibreOffice, regenerate the 18-image ZIP, and visually inspect every rendered slide. Run `pdfs.py`, render every changed handout page, inspect it, then run `site.py` and `webdeck.py`.

For workbook-only changes, rebuild the selected PDFs and check their exact page count and every rendered page. Update `facilitator.py` workbook references, run `sync_notes.py` and `presentation_script.py`, then rebuild `site.py` and `webdeck.py`. Build `offline.py`, validate the online and offline PowerPoint packages with the presentation finalizer, and run `scripts/package_offline.py`. Participant-facing PDF descriptions should describe the slides without mentioning removed speaker notes.

For script-only cue changes, `sync_notes.py` can update editable PowerPoint notes without replacing other package parts. Changes to the slide text or artwork require re-rendering and assembly. `practice.js`, `workshop-flow.js`, and the workshop CSS are maintained directly. Conversation notes use separate online/offline storage keys and remain separate from older lab drafts.

Production dependencies: installed Codex primary runtime 26.905.11957, Artifact Tool 2.8.59, its bundled Node and LibreOffice, local Python with ReportLab/Pillow/lxml/pypdf, and the existing blog Playwright installation. Intermediates and QA images stay in `/tmp/nspa-workshop` rather than public directories.

## Sources and teaching boundaries

Guidance reviewed October 7, 2026. Sources include NIST's 2024 GenAI Profile, Turnitin's AI-writing detection FAQ, Liang et al. (2023), and Al Ali, Helcl & Libovický (2026). The hub and relevant notes preserve source links and qualified interpretations. Language, writing samples, and detectors differ between studies; do not imply a universal error rate or treat a detector flag as proof of misconduct.

C-101 is entirely fictional. The flawed summary is an authored teaching example, not a claimed model run. The case, rubric, practice rule, policy starter, and checklist are teaching tools, not validated instruments or official NSPA policy. In the fair-response conversation, the published practice rule allows translation assistance and imposes no translation disclosure requirement. No evidence of invented facts is supplied. Participants may find no misconduct concern and instead follow up on the ordinary missing enrollment document.

## Offline edition and preservation

Participant pages offer the conversation, workbook, slide PDF without speaker notes, and takeaways. Optional materials and both full collections sit behind the Resources drop-down. Infographics are consolidated at `resources/infographics.html`; the complete library is `resources/library.html`. Preserve every original asset and library entry. The ten original infographics and six workshop quick references remain available online.

Presenter materials are unlisted at `2026/p/`. Its one complete offline download is `2026/p/nspa-2026-presenter-offline.zip`. Extract it and open `p/index.html` for the route, `p/webdeck.html` for presenting, or `p/facilitator.html` for the full offline guide. It includes all presenter materials and the preserved local resources. The folder is public by direct URL and has no participant navigation links.

The participant kit remains at `2026/offline/nspa-2026-offline.zip` (about 4.9 MiB). It contains only the companion and its required assets, workbook, slide PDF, two-page takeaways, and start instructions. Standalone infographic and resource-library files, optional labs, PowerPoint, and all speaker materials are excluded. The three visual references embedded in the workbook are included. Participant PDFs retain website links for later reference. Both ZIPs have independent SHA-256 manifests; test the extracted kits at a different path. Core participation needs no account or network connection.

The original two-page template-based takeaway DOCX/PDF remains unchanged. When it needs editing, render a temporary copy with the Documents skill so normalization cannot alter the canonical template package. Run `offline.py`, `scripts/package_offline.py`, and `site.py` after source changes. The ZIP excludes itself and includes SHA-256 checksums. Repackage after any offline file change, including README updates.

## Verification

Run `python3 scripts/check_site.py`, `python3 scripts/check_offline.py`, `python3 scripts/build_site.py`, and `git diff --check`. CI repeats the link checks and stages only public files, excluding scripts, docs, and private inputs.

October 7 verification covers all 18 slide layouts, native PPTX/PDF links and notes, every changed handout page, desktop and phone pages, direct conversation links, saved notes and export, print and no-JavaScript paths, presenter synchronization, and local-file offline operation with no remote requests. Confirm archive integrity and test the extracted edition at a different path. Verify live Pages content and download hashes after publication.
