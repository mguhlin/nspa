# AI Prompting for Scholarship Review

Public hub: https://mguhlin.github.io/nspa/2026/prompting/

Participant materials contain the slide PDF and practice packet. The webdeck and PowerPoint with notes appear only on the unlisted presenter hub at `2026/p/`. The old participant-side webdeck, PowerPoint, and speaking-content JSON are removed from deployment. This is link separation on a public GitHub Pages site, not authentication.

This collection has its own 31-slide presentation and practice packet. Keep the original workshop slides, workbook, takeaways, and guide unchanged when rebuilding it.

- `content.py`: exact session description, plain-language assessment scenarios, fictional examples, source links, and the shared slide data.
- `beginner_deck.py`: introductory sequence and first-person notes, including vocabulary before use and optional Projects/skills after the demonstrations.
- `build.py`: overview, self-check, practice hub, demonstrations, source files and ZIPs, standalone webdeck, a non-published slide-content JSON in `scripts/prompting/`.
- `build_presentation.mjs`: Artifact Tool authoring and private finalization, followed by a byte-preserving copy into `2026/p/slides/`. Requires the bundled Node runtime, Artifact Tool, and installed Poppins fonts. Font files and OFL license are in the public assets folder. The private NSPA template is optional during subsequent builds because its supplied background artwork is already included. If present, the builder inspects and renders it and verifies the typography against it.
- `check_beginner.cjs`: self-contained applicant-code definitions, a standalone score/graph results and 18 illustrated slide compositions, slide bounds, pictures, phone layout, and word guide.
- `check_assessment_phases.cjs`: every score from zero to eight, simple phase ranges, topic graph, targeted suggestions, no activity links or extra result tasks, reset, and four widths.
- `check_interactions.cjs`: Playwright checks of feedback, score/reset, guided activity directions, clipboard prompts, phone/tablet layouts, slide navigation, presenter navigation/sync, and note resizing/persistence.

Run from the repository root:

```sh
python3 scripts/prompting/build.py
node scripts/prompting/build_presentation.mjs
```

Export the final PowerPoint through LibreOffice `impress_pdf_Export` with `ExportNotesPages=false`, writing privately before copying to `2026/prompting/slides/ai-prompting-scholarship-review.pdf`. Render and inspect slides and PDF pages before publication. Do not re-export original workshop artifacts.

The HTML deck embeds its fonts, background artwork, QR image, CSS, and JavaScript. Its resource links require a network connection. The project framework copy follows the canonical `mguhlin/webdecks` framework, with only the hub exit destination changed during inlining.

Local browser check (serve the parent workspace on port 8765):

```sh
node scripts/prompting/check_interactions.cjs
```

Set `NSPA_TEST_BASE` to a deployed `.../2026/` address to run the same browser checks live. The test uses Chromium and the bundled Playwright runtime, writes private evidence to `/tmp/nspa-prompting-review`, and never runs an AI model or submits applicant data.

Prepared outputs are authored teaching examples. The supplied skill evaluations are test specifications, not claims of model performance. Run prompts and evaluations in the actual chosen AI tool and record corrections. Both packet ZIPs are explicitly allowlisted by `scripts/build_site.py`; other ZIP archives remain excluded.

The self-check ends with a score out of eight, percentage, three topic bars, and up to three suggestions based on missed answers. Phase labels use simple ranges: 0–3 getting started, 4–6 checking AI answers, 7–8 keeping good habits. Confidence ratings, reflection/export tasks, and demonstration links are removed. Questions are embedded in the HTML so direct file:// use works. The separate guided activity page supplies four steps for each demonstration. Core copyable prompts and practice data remain unchanged.

`infographics.json` records the built-in image-generation base prompt, each scene, asset path, slide mapping, and editable captions. `infographic_content.py` attaches 18 original teaching visuals to the 31-slide sequence. All 12 native tables remain editable. The webdeck retains readable HTML equivalents and phone reflow.

USB packaging is separate from public deployment. After `python3 scripts/build_site.py`, run `python3 scripts/build_usb.py --output /media/mg/USB-DATA/nspa`. It creates facilitator/, participant/, and web/, plus a START-HERE.html and checksum manifest. Direct file links replace directory routes and same-site online URLs. The local awareness check needs no fetch or server. ChatGPT/live AI and external sites require internet. Test with `node scripts/check_usb.cjs /media/mg/USB-DATA/nspa` (browser network disabled).
