## October 21, 2026 — prompting practice and awareness self-check

Added a separate public collection titled **AI Prompting for Scholarship Review** at `2026/prompting/`. The existing workshop presentation, participant workbook, takeaways, and facilitator guide remain byte-identical. Public navigation calls the collection AI prompting practice, with no editorial labels about presentation versions.

- New 26-slide self-contained webdeck, editable PPTX with first-person speaker notes and eleven native tables, and matching participant PDF.
- ChatGPT practice Project setup, copyable instructions and three prompts, fictional application manifest/records/rules/statements/rubric, prepared teaching examples with source pointers, and a correction log. Prepared examples are clearly distinguished from captured live model output. No live AI account or API call was used during website tests.
- Reusable scholarship evidence review skill, manual-use guidance for ChatGPT/Claude, and six evaluation specifications. Skill structure validates. Product installation and feature availability remain tool/account dependent.
- Eight-scenario awareness self-check with confidence choices, per-question explanations, topic totals, suggested practice, text export, print reflection, and reset. Answers stay in memory and are not submitted or automatically stored. This is explicitly informal learning, not a validated measure or certification.
- `2026/overview.html` preserves the exact user-supplied description and three takeaways. Overview, self-check, and prompting links appear in workshop navigation; practice and self-check also appear in Resources. The blog resource post remains the first Resources item.
- Source and build instructions: `scripts/prompting/README.md`. `content.py` supplies both deck formats and shared notes. Packet ZIPs have a narrow staging allowlist, preserving retired ZIP exclusions.
- Poppins and NSPA template artwork carry the conference identity. Poppins OFL is included. Shared presenter preview ID correction was synchronized to the canonical webdecks repo, its spec, and standalone instructions. Existing NSPA original webdeck already contained that correction.

Validation: local link/migration checks, staging, ZIP integrity, exact session-description and PPTX script/title matches, native table/font/package/import checks, slide/PDF visual inspection, 360/412/800/1280px layouts, assessment unanswered/correct/incorrect/confidence/export/reset paths, clipboard prompts, keyboard deck navigation, presenter sync, and A-/A+ note size persistence. Original artifact hashes checked against a pre-work snapshot. Live verification follows deployment.

# October 19 participant infographic collection

Added the supplied `NSPA_Responsible_Scholarship_Review_Infographics.pptx` unchanged as `2026/handouts/nspa-responsible-scholarship-review-infographics.pptx`. It is linked from the participant hub, infographic collection, and resource library. The hub download is also maintained in `scripts/workshop/supplied_edition.py`.

# NSPA project handoff

## October 21 homepage sailboat entrance

The homepage workshop link now sits on a navy sailboat hull with white sails and a gold pennant, using native SVG that matches the existing conference illustration. The conference background, event mark, flowers, description, and destinations remain. `assets/home.css` scopes the responsive placement to the homepage: the boat uses the open space on the right at desktop widths and sits below the introduction on smaller screens. The two route cards now fill the row. Keyboard navigation, overlap, and horizontal overflow were checked across 360–1600 px widths. This change does not rebuild workshop artifacts.

## October 20 companion thumbnails and Resources navigation

Each of the nine Session Companion activities now pairs its heading and directions at left with the matching presentation slide at right. On narrower screens, the slide appears between the heading and directions. The optimized WebP previews link to the existing full-size PNGs. `ACTIVITY_SLIDES` in `scripts/workshop/revised_content.py` maps activities to physical slide positions 3, 5, 9, 11, 13, 15, 17, 20, and 25; `revised_edition.py:build_pages()` generates previews and markup. Notes, export, printing, and access without JavaScript remain available.

All existing Resources dropdowns now begin with the NSPA 2026 blog materials entry and include the infographic collection, resource library, four individual session titles, AI Fluency, Marketing Readiness, and The Prompt Library. The four session links replace the generic Session Archive entry and point directly to `resources/index.html#session1` through `#session4`: The Ethics of AI Use in Scholarships and Data Protection; Creating and Revising Scholarship Applications with AI; Automating Office Tasks with AI; AI for Marketing & Engagement: A Nonprofit Toolkit. The dropdown accommodates the full titles and scrolls within smaller screens. The shared list lives in `scripts/workshop/resource_navigation.py`; the workshop shell and `scripts/update_resource_navigation.py` use it. Public staging synchronizes static menus automatically. Browser QA covered all nine activities at 360, 412, 800, 1024, and 1280 pixels, notes persistence/export, printing, and access without JavaScript.

The user requested participant-facing wording without revision history. Companion introduction, presenter cards, and workbook cover now describe the materials directly. Activity 2 defines ASSIST, CHECK, and HUMAN, plus the safeguard and owner, in both the companion and workbook. The workbook remains 11 pages; PDF page content outside its cover and activity 2 is unchanged. Updated pages were rendered and visually checked.

## October 20 revised presentation and adaptive speaking guide — current

This section supersedes earlier slide counts, activity sequences, presenter downloads, and success-criteria text. Source: the user's `/home/mg/Downloads/NSPA26 Slides.pptx`, retained privately as `supplemental-resources/NSPA26 Slides.pptx`. The current deck has **28 slides**, including resource screens at positions 1, 7, and 28, nine activities, three policy sample responses, and take-home references at positions 26–27. Use physical slide positions for workbook and guide references; the source's printed footer numbers skip and repeat. Preserve all supplied slide artwork and five native tables.

Current delivery: **28-page participant presentation PDF, 11-page workbook, nine companion activities, two-page takeaways, updated presenter PowerPoint notes, image-based webdeck with readable HTML equivalents, adaptive facilitator guide, and 14-page landscape guide PDF with two thumbnails per page and 14-point speaking text**. `revised_content.py` is the common first-person script and activity source. The guide HTML adapts to Samsung phones/tablets and saves adjustable text size. The PowerPoint differs from the supplied file only in the 28 note XML parts; all visual parts are byte-identical. Do not restore the October 18 script.

The presenter hub offers only the webdeck, PowerPoint, adaptive guide, and guide PDF. The old timing table, route, editable-guide download, and full-transcript link are removed. Retired guide DOCX, route PDF, and presenter transcript are excluded from staging. No ZIP packages are published. Original resource collections and the seven-infographic PowerPoint remain available.

The supplied QR code (`2026/images/nspa26-qr-code.png`) resolves to the workshop resource blog post, not directly to the handout hub. The hub labels this accurately and provides the direct handout address alongside it. The revised success-criteria PNG/WebP keeps the original illustration style, with eight criteria matching the new activities. Its full text equivalent is in alt text; the separate text section is intentionally removed. Exact built-in imagegen prompt: `docs/SUCCESS-CRITERIA-20261020-PROMPT.json`.

Builders: `current_edition.py` now routes to `revised_edition.py`; `webdeck.py` rebuilds only the current webdeck. See the first section of `WORKSHOP.md` for export and notes preparation. QA: `docs/REVISED-20261020-QA.json`. User explicitly requested commit, push, and deployment, then checking a missing QR code in the blog entry after NSPA is complete.

## October 18 success-criteria infographic restored

The participant hub now shows the updated `2026/images/success-criteria.png` infographic (optimized WebP preview), with three learning-intention questions and six criteria aligned to the current 31-slide deck. It preserves the earlier illustration style while using the current five-part prompt structure and next-review-cycle pilot. `experience.py:learning_intentions()` supplies the matching accessible text and image download; `supplied_edition.py:build_pages()` includes it after the participant downloads. The user-requested “Session route and discussion time” section is removed from the participant hub; presenter timing remains in presenter materials. Original learning-intentions artwork is preserved. Exact built-in imagegen prompt: `docs/SUCCESS-CRITERIA-PROMPT.json`.

## October 18 original webdeck infographics restored

The user flagged the missing infographics in the native-text webdeck. The current webdeck now embeds all 31 original slide images as lossless WebP, preserving the supplied PowerPoint design, diagrams, logos, and existing artwork. Images come from the committed numbered PNG gallery. Do not replace the visuals with text cards. HTML equivalents remain for screen readers and are visible below each graphic on phones. The supplied speaking notes, presenter previews/synchronization, notes sizing, print, and source hyperlinks remain. The infographic slide image includes its original footer; the semantic sibling footer is hidden to avoid duplication. Only the webdeck is rebuilt with `webdeck.py`; participant documents and prior hub simplifications remain unchanged. Evidence: `docs/WEBDECK-ARTWORK-QA.json`.

## October 18 workshop resources page removed

The user requested removal of `2026/resources.html`. The page and its navigation links are removed; it is no longer generated or published. The original resource library and infographic collection remain available. The old URL returns 404. The hub also omits the supporting-resources link and the two introductory explanation paragraphs and describes the presentation download as “31 slides for viewing and sharing,” per the user’s follow-up edits.

Updated October 18, 2026.

## October 18 evening replacement presentation — current

This section supersedes the expanded-activity edition below. The user supplied `/home/mg/Downloads/NSPA26_TT_AI_SR.pptx` and `/media/mg/data/nspa/NSPA_Facilitator_Guide_Embedded_Images.docx`, then explicitly requested commit, push, and production deployment. The user confirmed the conference slot remains **October 21, 3:30–5:00 PM CT (90 minutes)**: **60-minute core plus 30 minutes for discussion and practice**.

Current delivery: **31 slides (29 core + two backups), 10-page participant workbook, eight companion activities, two-page NSPA-template takeaways, 32-page illustrated facilitator guide, one-page presenter route**. Participant hub: `2026/`. Unlisted presenter hub: `2026/p/`, including webdeck, PPTX with supplied speaking notes, guide PDF and original DOCX, route, and transcript. Presenter pages retain noindex. ZIP/offline publication remains canceled. Original library and infographic collections remain intact.

The PPTX preserves every supplied package part outside the 31 notes XML files. The notes use the user's supplied script, with pacing clarification on slide 1 and source links on slide 31. The guide DOCX is byte-identical to the supplied file and keeps all 31 embedded images. Participant PDF is a slide-only LibreOffice export, with both notes export options explicitly false. Most supplied slides are raster images; the readable participant transcript and webdeck provide real HTML text and tables.

Canonical builder: `scripts/workshop/supplied_edition.py`; `current_edition.py` is its compatibility entry point. The exact speaking script is in `scripts/workshop/presentation-20261018.txt`. `webdeck.py` rebuilds only the current webdeck. `takeaways.py` preserves all original DOCX parts except document.xml and keeps the attribution separate from the final bullet. Private source copies are ignored in `supplemental-resources/`; the committed PPTX is the fallback. Do not use the earlier activity or visual patchers for this edition.

The examples now use A17/B24/C09 document inventory, the tutoring excerpt and provisional 2/3 rubric match, and an evidence/source/question handoff. Earlier A-101–A-103 and 1–4 scoring are superseded. Optional C-101 labs retain their separate 0–2 rubric. Current companion storage uses `nspa-review-20261018-sr` to protect earlier drafts.

Rebuild and validation details are in the current WORKSHOP.md section. Evidence: `docs/SUPPLIED-31-SLIDE-QA.json`. The presenter next-slide preview ID collision is corrected in the project framework and its spec snapshot `docs/webdeck_spec_v5.md`. Publication remains authorized.

## October 18 expanded activities and visual revision — current

This section supersedes earlier counts, source-preservation requirements and offline packaging instructions. The 90-minute session is still October 21, 3:30–5:00 PM CT. Its integrated route includes eight complete activities (60 minutes of participant work) and 30 minutes for explanations and transitions, with 24 core slides and four optional backups.

The companion and **16-page participant workbook** now contain all case information, adopted practice rules, source quotations, examples, conversation steps and specific response prompts. The workbook has an illustrated cover. Participant wording uses first-person statements. The fictional-teaching disclosure appears once at the beginning of each format. There is no missing longer essay. Demo 1 is a two-channel document-follow-up procedure with a workload constraint; the rating activity models exact quoted evidence before participants compare their reasons. Reviewer roles, verification steps and policy boundaries are explicit.

Slides **3, 6, 7, 10, 11, 12, 13, 20 and 22** now use shared visual layouts in `scripts/workshop/visual_deck.py`: real HTML text and native PowerPoint text/tables around meaningful illustrations. Five native tables remain. Activity source and timing live in `activities.py`; the shared six-part prompt is in `demo_one.py`. The main builder remains `current_edition.py`. Updated speaker notes, 29-page guide, one-page route and private script match the activities. Source links in notes are preserved. The learning-intentions infographic now has six aligned success criteria; exact built-in imagegen prompts are in `REVISED-VISUAL-PROMPTS.json`.

Participant downloads are **only the workbook, slide-only presentation PDF, and session takeaways**, all linked from the hub. Canonical takeaway files are now `2026/handouts/session-takeaways.pdf` and `.docx`; the corrected standalone byline is preserved. The old takeaway addresses remain aliases in the staged site. The offline package, session kits and PNG ZIPs are no longer published. Historical tracked package files remain in the repository, but `build_site.py` excludes every ZIP and the old offline directories. Do not run `offline.py` or `package_offline.py` for this edition. Original resource collections are preserved.

Rebuild: run the main builder with the bundled Python (python-pptx, reportlab and lxml required); export the PPTX as slide-only PDF with both notes export options false; render numbered gallery PNGs; stage with `scripts/build_site.py`. Do not invoke legacy slide renderers or assemblers. Verify the 28 slides, all workbook/guide pages, desktop/phone interactions, presenter synchronization, draft persistence/export, no-JavaScript fallback and staged links. Publication remains authorized. Evidence: `EXPANDED-ACTIVITIES-QA.json`.

## October 18 takeaway attribution correction

The takeaway attribution is now a separate centered line after the six takeaway groups. The final bullet ends at “pause condition.” Both pages of the DOCX/PDF were rendered and inspected; all template parts other than `word/document.xml` are unchanged. Both offline archives and their manifests include the corrected files.

## October 18 supplied presentation replaces the core workshop

This section supersedes all earlier slide counts, core activities, workbook lengths, and rebuild instructions below. The session remains **90 minutes, October 21, 3:30–5:00 PM CT**. The user confirmed that they will expand resources to use the time. The supplied deck has **24 core slides plus four backups**. Its original core cues total about 60 minutes; 30 minutes remain flexible for discussion and resource practice.

Private inputs copied into ignored `supplemental-resources/`: `NSPA26-Scholarship-Review-Webdeck.html` and `trust_transparency_ai_scholarship_review_nspa26.pptx`, supplied from the Desktop. The published PowerPoint preserves all parts except the cover’s 90-minute label and matching notes on slides 1 and 24. All nine native tables and all other slide/package parts remain intact. The webdeck retains its supplied embedded v5 framework and NSPA design, with a local exit link, 90-minute label, corrected privacy-source URL, and a slightly taller slide 21 quote box.

Participant hub: `2026/`; companion: `2026/conversation.html`; 28-slide PDF without speaker notes: `2026/slides/nspa-trust-transparency-ai.pdf`; six-page workbook: `2026/handouts/participant-workbook.pdf`; two-page NSPA-template takeaways: `2026/offline/session-takeaways.pdf` (editable DOCX beside it). Eight companion sections cover trust, six-part prompts, three demos, workflow checks, applicant policy, and the 30 / 60 / 90-day plan. New storage keys preserve earlier conversation drafts.

Presenter materials remain unlisted under `2026/p/`: webdeck, PowerPoint, one-page route, 29-page guide, transcript with notes, and complete offline kit. Participant transcript and session kit exclude speaker notes. Presenter guide/script derive directly from the supplied webdeck notes. `docs/presentation-script.md` is current; the previously saved Desktop Markdown script predates this edition.

Additional C-101 labs and their 0–2 rubric remain optional and are explicitly distinguished from the current A-101–A-103 exercises and 1–4 community-impact criterion. The original resource library, infographic collection, and all their original assets remain unchanged.

Published content commit: `2a5fa7c`. GitHub Pages [run 39167428895](https://github.com/mguhlin/nspa/actions/runs/39167428895) succeeded. Twelve live pages and downloads matched local SHA-256 hashes, including both offline archives, participant slide PDF, workbook, takeaways, PowerPoint and webdeck.

Verification: all 28 slides and every changed handout page inspected; online desktop/phone and both extracted kits passed with zero script errors. Presenter sync, notes resizing, persistence/export, no-JavaScript access, and 28-page slide-only webdeck printing passed. PowerPoint finalizer passed package, layout and import checks; 12 participant and 83 presenter manifest entries verified. Evidence: `docs/CURRENT-EDITION-QA.json`.

Canonical new builder: `scripts/workshop/current_edition.py`. It uses the private supplied webdeck when available, otherwise the committed current webdeck, to generate current pages, workbook, route, guide, transcript and private script. `site.py` runs it after the preserved reference/lab builders. `webdeck.py` detects and preserves the current supplied edition. `pdfs.py` rebuilds the legacy references before replacing core participant/presenter PDFs with the current edition. Do not run `render_slides.py`, `capture.cjs`, `assemble.mjs`, `sync_notes.py`, or `presentation_script.py` for this edition; those remain legacy production tools. Read the October 18 section in WORKSHOP.md for the current export/package order.


Updated October 7, 2026. The workshop experience has been simplified for the October 21 presentation. Do not restart completed artwork or add PDFsplat (the user explicitly canceled that request).

## October 7 ten-page participant packet and Desktop script

The participant workbook is now exactly ten pages: an illustrated cover, the original six activity pages on pages 2-7, and three illustrated visual references on pages 8-10. The references cover evidence before interpretation, named human checkpoints, and a fair applicant response. Reused original artwork remains intact; PDF labels and examples are real text. All activity writing lines were preserved (6, 3, 6, 9, 7, 8 by activity page).

Workbook references are synchronized in the 15-page speaker guide, shared facilitator source, HTML transcript/webdeck notes, online/offline PowerPoint notes, and offline guide. Slide visuals and every PPTX part outside speaker-note XML are byte-identical to the previously reviewed deck. The participant slide PDF is unchanged. The Presentation PDF card now says only "18 slides for viewing and sharing"; the offline description says "12 core slides and 6 optional references."

Both archives were rebuilt and their manifests checked: participant kit 12 files, about 4.9 MiB; presenter kit 83 files, about 44.7 MiB. Both contain the ten-page workbook. Navigation and participant/presenter separation remain as described below. All ten workbook pages and all 15 guide pages were visually inspected. Online/offline PDF page-content streams match; only local link annotations differ. Local checks passed with 534 offline references and zero failures. Package/layout/import validators passed for both PowerPoint editions. QA evidence: `PARTICIPANT-PACKET-QA.json`.

The full first-person script is `docs/presentation-script.md`, generated by `scripts/workshop/presentation_script.py`. It includes spoken wording for all 12 timed core slides, six optional reference scripts, the prepared flawed draft, transitions, silence/timing cues, and responses when a conversation needs help. A verified matching copy is saved as `/home/mg/Desktop/NSPA2026-Presentation-Script.md`. The script remains outside the public website.

## October 7 participant simplification: current navigation

This section supersedes the public presenter paths and offline packaging described below. The participant landing page now shows only the conversation companion, workbook, slide PDF without notes, two-page takeaways, and a small session kit. Optional references, slide-image downloads, agenda, and sources are on `2026/resources.html`.

Resources is a native, keyboard-accessible drop-down on the landing page and workshop pages. It opens the infographic collection (`resources/infographics.html`), complete resource library (`resources/library.html`), and optional workshop materials. All ten original infographic downloads and every original library entry are preserved. The collection also includes six workshop quick-reference images. Old homepage `#library` and `#infographics` links redirect to their collections, with valid fallback anchors.

Presenter materials are unlisted under `2026/p/`: route, one-page route PDF, 15-page speaking guide, webdeck, full transcript, and PowerPoint with notes. Participant pages contain no presenter links. Presenter HTML has `noindex`; the folder remains public by direct URL. Participant slide text omits the speaking script. The canonical 18-slide PPTX and participant PDF retain their original bytes.

Only one complete offline ZIP appears on the presenter side: `2026/p/nspa-2026-presenter-offline.zip` (about 43.1 MB). Extract it and open `p/index.html`; the full guide is `p/facilitator.html`. It retains the optional offline library and original visuals. The participant session kit at `2026/offline/nspa-2026-offline.zip` is about 3.4 MB and contains 12 files plus its manifest: the local companion, workbook, slide PDF, takeaways, required styles/scripts/logo, and start instructions. It excludes presenter notes, PowerPoint, infographic/library files, and optional labs. Canonical PDF links in the participant kit lead to the website for optional references.

Build `site.py` and `webdeck.py`, then the selected PDFs, `offline.py`, and `scripts/package_offline.py`. The package builder emits two different manifests. Update and validate the offline PowerPoint after link changes before packaging. Verification evidence is in `PARTICIPANT-SIMPLIFICATION-QA.json`; it includes preservation checks, both archive hashes, and the offline presentation finalizer receipt. Repeat link checks, desktop/phone navigation, no-JavaScript Resources access, and extracted local-file kit checks before publishing.

## October 7 conversation redesign: current edition

This section supersedes the older slide counts, route, and deliverables below. The user's approved direction is social learning through structured conversation, different perspectives, reflection, and silence. Preserve every library resource and infographic.

- 12 core slides plus 6 optional references, with 24 native PPTX/PDF hyperlinks. The PNG ZIP and gallery contain 18 slides. Older slide assets remain available as historical files.
- One shared fictional case, C-101, runs through the experience. Participants question a deliberately flawed summary, compare reasons for one rubric criterion, reflect quietly for two full minutes, challenge and revise a workflow, hear an applicant's perspective, and choose one change to try with a colleague.
- `2026/conversation.html` is the core companion: seven conversations with saved/exportable notes. Original practice labs, readiness checklist, references, and resource library remain optional. Separate online/offline conversation storage keys protect older drafts.
- New NSPA-colored infographic artwork uses built-in imagegen. Prompts are in `CONVERSATION-ART-PROMPTS.json` and `CONVERSATION-ART-REFINEMENTS.json`; source assets are in `2026/images/conversation/`. All ten supplied homepage infographics and their original downloads are preserved.
- The speaker guide is 15 pages with one page for each core slide. It includes a friendly script, exact timing, partner turns, silence, debrief questions, workbook references, and adaptations. The workbook has six pages; the presenter route has one.
- The offline edition includes the same core route and all ten supplied homepage infographics in `library.html`. The full online library address is preserved. Archive size is about 43 MB.
- Current working checkout: `/home/mg/Documents/vibecoding/mguhlin/nspa`. Read the rewritten `WORKSHOP.md` for authoritative sources and rebuild order. The older `/media/mg/data/nspa` review copies predate this edition.

Participant clarification: every workbook space now says what to write, with examples where useful. The companion has matching response instructions. The optional prompt lab distinguishes the AI instruction block from participant work and explains task/criteria, evidence/limits, and output/human follow-up.

Final QA: all 18 slide layouts and every changed PDF page inspected; PPTX finalizer passed with no findings; 24 native links and substantive editable notes verified. Desktop/phone conversations, draft persistence/export, print, no-JavaScript, presenter synchronization, and extracted offline routes passed with zero script errors and zero external requests. All 79 archive checksums passed; 485 local offline references resolved. Full library preservation was compared against the previous commit. Evidence and artifact hashes are in `CONVERSATION-QA.json`.

Published content commit: `952347579e6eee49c62af04e5cf03a32a0a03e14`. Pages deployment [37672960807](https://github.com/mguhlin/nspa/actions/runs/37672960807) succeeded. Normal live URLs for 13 pages/downloads matched the local bytes, including PowerPoint, PDF, all three updated handouts, the PNG ZIP, and the offline ZIP. The downloaded archive passed every manifest checksum. Live desktop/phone browser checks verified all 18 slides, seven conversations, response guidance, presenter synchronization, separate online/offline storage, all ten infographic cards, and zero script errors. Documentation-only publication records follow this content commit; check Actions for the latest HEAD.

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
