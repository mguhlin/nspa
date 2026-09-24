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
- 26 slides: 25 timed workshop slides and a source appendix. Processes and activities use authored icon diagrams and timelines. Five photorealistic scenes of fictional adults appear across nine slides. Built-in imagegen prompts are recorded in `PHOTO-PROMPTS.json`; final photo assets are in `2026/images/photorealistic/`.
- The official supplied logo is used unchanged, proportionally scaled on light backgrounds. Its teal and gold also anchor the printable handouts.
- Friendly spoken wording and presenter cues share one source, `scripts/workshop/facilitator.py`, for the nine-page facilitator guide and slide notes. The agenda runs 3:30–5:00 PM.
- The three-page capacity checklist has 24 first-person statements in the first column, blank Ready to learn / In progress / Ready to go columns, and Notes. The website starts unmarked and offers matching resources, saved responses, export, and print.

## Source and factual boundaries

The source brief and design instructions remain private in `supplemental-resources/`. The four research/product sources and their qualified interpretations appear in the workshop hub and relevant speaker notes. Guidance was reviewed September 24, 2026 and should be revisited before the October workshop.

The capacity matrix, rubric, and policy starter are original workshop teaching tools. They are not validated instruments, official NSPA policy, or legal determinations. All application material is fictional. Prepared reference outputs are authored examples, not claimed live model runs. Live demonstrations use the copyable synthetic packet in an organization-approved tool; offline paths are supplied.

## Rebuild and maintenance

`content.py` holds shared agenda, packet, prompts, rubric, policy, sources, and capacity statements. `facilitator.py` holds the speaking script; `slides.py` contains slide text and maps the shared script into notes; `render_slides.py` creates deterministic HTML layouts. `pdfs.py` creates printable handouts with ReportLab. `site.py` produces the workshop pages. The JavaScript interaction files and workshop CSS are maintained directly.

Production used the installed Codex primary runtime (26.905.11957), Artifact Tool 2.8.59 for PPTX assembly, and its bundled LibreOffice for rendering. No desktop LibreOffice was used. Runtime loading tools were not exposed in this session; the matching installed runtime paths were inspected directly. Slide screenshot rendering used the existing local Playwright installation. All build intermediates and QA renders stay outside public output directories.

Validate links using `python3 scripts/check_site.py`. Website deployment excludes supplemental inputs and build scripts.

Rebuild order: `python3 scripts/workshop/render_slides.py`, `node scripts/workshop/capture.cjs`, then `assemble.mjs` with the bundled Node runtime and `RUNTIME_NODE_MODULES` set to its node_modules directory. The assembly source records the validated production paths; change final/receipt filenames for subsequent revisions. Convert the validated PPTX with bundled LibreOffice, regenerate the slide ZIP, run `pdfs.py` with the bundled Python, render the handouts to PNG, and run `site.py`.
