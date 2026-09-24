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

- NSPA colors and supplied conference artwork take precedence over the TCEA-specific names and colors in the generic production specification.
- 16:9 canvas (1536 x 864 PNGs) matches the supplied NSPA deck. The generic guide's 3:2 example was raised with the user; absent a preference, widescreen was used as stated in the conversation.
- Every slide is its own PNG and one full-slide image in the PPTX. No composite slides. Required text is deterministically typeset; source art was generated separately with the built-in image tool. See ARTWORK.md for prompts.
- 26 slides: 25 timed workshop slides plus a source appendix. Title notes are 49 words; content notes are 98-107 words, excluding source URLs.
- Slide text is rasterized per the supplied production guide. Speaker notes remain editable. Source wording, layouts, artwork, and a browser-accessible transcript are retained for revision.
- Arial/system sans and Georgia headings replace unavailable DM-family fonts while retaining the requested serif/sans contrast.
- `example1.png` was not supplied. The written visual standard and supplied NSPA template guided the design.

The supplied `supplemental-resources/logo.png` is used unchanged as `assets/nspa-logo.png` across the site, assessment, slides, and handouts. Primary teal #007C89 and gold #F9C20A are sampled from the logo; slate and pale aqua remain supporting template colors.

## Source and factual boundaries

The source brief and design instructions remain private in `supplemental-resources/`. The four research/product sources and their qualified interpretations appear in the workshop hub and relevant speaker notes. Guidance was reviewed September 24, 2026 and should be revisited before the October workshop.

The capacity matrix, rubric, and policy starter are original workshop teaching tools. They are not validated instruments, official NSPA policy, or legal determinations. All application material is fictional. Prepared reference outputs are authored examples, not claimed live model runs. Live demonstrations use the copyable synthetic packet in an organization-approved tool; offline paths are supplied.

## Rebuild and maintenance

`content.py` holds shared agenda, packet, prompts, rubric, policy, sources, and capacity descriptors. `slides.py` contains slide text and notes; `render_slides.py` creates deterministic HTML layouts. `pdfs.py` creates printable handouts with ReportLab. `site.py` produces the workshop pages. The JavaScript interaction files and workshop CSS are maintained directly.

Production used the installed Codex primary runtime (26.905.11957), Artifact Tool 2.8.59 for PPTX assembly, and its bundled LibreOffice for rendering. No desktop LibreOffice was used. Runtime loading tools were not exposed in this session; the matching installed runtime paths were inspected directly. Slide screenshot rendering used the existing local Playwright installation. All build intermediates and QA renders stay outside public output directories.

Validate links using `python3 scripts/check_site.py`. Website deployment excludes supplemental inputs and build scripts.

Rebuild order: `python3 scripts/workshop/render_slides.py`, `node scripts/workshop/capture.cjs`, then `assemble.mjs` with the bundled Node runtime and `RUNTIME_NODE_MODULES` set to its node_modules directory. The assembly source records the validated production paths; change final/receipt filenames for subsequent revisions. Convert the validated PPTX with bundled LibreOffice, regenerate the slide ZIP, run `pdfs.py` with the bundled Python, render the handouts to PNG, and run `site.py`.
