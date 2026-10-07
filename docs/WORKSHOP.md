# 2026 workshop production and alignment

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

`conversation.html` provides seven guided conversations with saved, exportable notes. The six-page workbook follows that sequence. The 15-page speaker guide has an opening page, one page for each core slide, optional references, and a link directory. The presenter route is one page. Existing `practice.html` labs and the readiness checklist remain optional.

## Design and artifact production

The supplied `2026_NSPA_PPT_Template.pptx` provides the exact cover artwork, content footer, Arial type, orange headings (#FF7233), slate (#2E4F66), teal (#007681), pale aqua (#E4F4F4), and gold (#FFCD34). The official logo is unchanged and proportionally scaled.

The new artwork uses paper-cut and frosted-glass illustrations in the NSPA palette. Exact built-in imagegen prompts are recorded in `CONVERSATION-ART-PROMPTS.json` and `CONVERSATION-ART-REFINEMENTS.json`. Source images are under `2026/images/conversation/`. Wide compositions leave room for clear labels. Required text, labels, and sources are deterministically typeset outside the raster artwork.

Exact template dimensions are 13.3333 × 7.5 inches. Per the supplied production instructions, each slide is rendered as a 1536 × 864 PNG and placed full-frame in the PPTX. PowerPoint speaker notes remain editable. There are 24 native slide hyperlink actions; PDF export preserves them. The PNG ZIP contains exactly 18 numbered images. Older unreferenced slide PNGs are retained as historical assets.

`2026/webdeck.html` embeds the template, real HTML slide text, illustrations, and shared speaker notes in one file. It supports phone reflow, keyboard/touch navigation, notes, a synchronized presenter window, full screen, and one-slide-per-page printing. Arrow keys navigate; S toggles notes, V opens presenter view, F enters full screen, and P prints. Its framework comes from the supplied `webdeck_instructions.md`; integration fixes live in `webdeck-theme.css` and `webdeck-extras.js`.

## Shared sources and rebuild sequence

Private production inputs stay in git-ignored `supplemental-resources/`. Do not publish the source template, planning brief, or logos outside their approved public derivatives.

- `content.py`: fictional packet, rubric, prepared lab outputs, policy examples, sources, capacity statements.
- `route.py`: seven core conversation routes and timing, plus preserved optional lab routes.
- `facilitator.py`: shared speaking script, exact timing, workbook references, debriefs, and adaptations.
- `slides.py`: 18 slides, notes derived from that script, source and generated-art disclosures.
- `resources.py`: slide navigation and the matching resource directory.
- `render_slides.py`, `capture.cjs`, `assemble.mjs`: deterministic layouts, screenshots, and PPTX assembly.
- `conversation.py`, `experience.py`, `site.py`: guided companion, hub, optional labs, and presenter page.
- `pdfs.py`: matching workbook, guide, route, and preserved reference handouts.
- `webdeck.py`: self-contained HTML presentation.
- `offline.py` and `scripts/package_offline.py`: local edition and ZIP manifest.

Rebuild authored content first. Run `python3 scripts/workshop/render_slides.py`, then `node scripts/workshop/capture.cjs`. Assemble using the bundled Node runtime and the validated `assemble.mjs` build path; update output/receipt names for each revision. Run the presentation skill finalizer. Convert the validated PPTX with bundled LibreOffice, regenerate the 18-image ZIP, and visually inspect every rendered slide. Run `pdfs.py`, render every changed handout page, inspect it, then run `site.py` and `webdeck.py`.

For script-only cue changes, `sync_notes.py` can update editable PowerPoint notes without replacing other package parts. Changes to the slide text or artwork require re-rendering and assembly. `practice.js`, `workshop-flow.js`, and the workshop CSS are maintained directly. Conversation notes use separate online/offline storage keys and remain separate from older lab drafts.

Production dependencies: installed Codex primary runtime 26.905.11957, Artifact Tool 2.8.59, its bundled Node and LibreOffice, local Python with ReportLab/Pillow/lxml/pypdf, and the existing blog Playwright installation. Intermediates and QA images stay in `/tmp/nspa-workshop` rather than public directories.

## Sources and teaching boundaries

Guidance reviewed October 7, 2026. Sources include NIST's 2024 GenAI Profile, Turnitin's AI-writing detection FAQ, Liang et al. (2023), and Al Ali, Helcl & Libovický (2026). The hub and relevant notes preserve source links and qualified interpretations. Language, writing samples, and detectors differ between studies; do not imply a universal error rate or treat a detector flag as proof of misconduct.

C-101 is entirely fictional. The flawed summary is an authored teaching example, not a claimed model run. The case, rubric, practice rule, policy starter, and checklist are teaching tools, not validated instruments or official NSPA policy. In the fair-response conversation, the published practice rule allows translation assistance and imposes no translation disclosure requirement. No evidence of invented facts is supplied. Participants may find no misconduct concern and instead follow up on the ordinary missing enrollment document.

## Offline edition and preservation

Extract `2026/offline/nspa-2026-offline.zip` and open `index.html`. The edition includes the conversation companion, 18-slide webdeck, slides and handouts, speaking guide, optional labs, readiness checklist, ethics toolkit, and PROTECT manual worksheet. `library.html` includes all ten supplied homepage infographics and selected local guides, with the full online library address for later use. External publications and online services are not mirrored. Core participation needs no account or network connection.

The original two-page template-based takeaway DOCX/PDF remains unchanged. When it needs editing, render a temporary copy with the Documents skill so normalization cannot alter the canonical template package. Run `offline.py`, `scripts/package_offline.py`, and `site.py` after source changes. The ZIP excludes itself and includes SHA-256 checksums. Repackage after any offline file change, including README updates.

## Verification

Run `python3 scripts/check_site.py`, `python3 scripts/check_offline.py`, `python3 scripts/build_site.py`, and `git diff --check`. CI repeats the link checks and stages only public files, excluding scripts, docs, and private inputs.

October 7 verification covers all 18 slide layouts, native PPTX/PDF links and notes, every changed handout page, desktop and phone pages, direct conversation links, saved notes and export, print and no-JavaScript paths, presenter synchronization, and local-file offline operation with no remote requests. Confirm archive integrity and test the extracted edition at a different path. Verify live Pages content and download hashes after publication.
