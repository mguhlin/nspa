# Trust Under Pressure

The Scholarship Decision Lab is a static Vite and TypeScript application for scholarship teams. Thirty fictional missions span six collections. Participants use the Know, Choose, Continue lenses and alternate Red Team risk investigation with Blue Team response planning.

Production: https://mguhlin.github.io/nspa/lab/

Introduction webdeck: https://mguhlin.github.io/nspa/lab/decks/introduction.html

## Develop and verify

Requires Node 20.19+ or Node 22+, npm, and Python 3 for the standard-library introduction-deck builder.

```sh
npm ci
npm run dev
npm run validate
npm test
npm run test:browser
npm run build
```

Local browser tests default to `/usr/bin/google-chrome`. Set `CHROME_PATH` to use another Chromium executable. CI installs Playwright Chromium. To serve the production build, use `npx vite preview`. `LAB_TEST_BASE` can point browser tests at another local server. Assets use relative URLs; mission routes use hash parameters so shared links work on GitHub Pages without server rewrites.

From the repository root, build the lab before running `python3 scripts/build_site.py`. The Pages workflow validates and tests the lab, builds it, and stages only `lab/dist` into `_site/lab`. Application source, tests, and internal documentation are not published.

## Content and components

- `src/data/scenarios.json`: all thirty complete authored scenarios, including the game schema, six clues per mission, response analyses, debriefs, 30-day actions, and category-level NIST CSF 2.0 connections.
- `src/data/instructions.ts`: the five interactive instruction screens.
- `src/data/resources.ts`: glossary and primary reference links.
- `src/schema.ts`: TypeScript contract and runtime content validator.
- `src/engine.ts`: sanitized hash routes, seven-round sequence, record shape, and optional timer.
- `src/main.ts`: reusable mission, evidence, team, clue, complication, debrief, progress, control, completion, and facilitator views.
- `src/style.css`: projection-first responsive layout and local fonts.
- `docs/image-prompts.md`: the thirty full image prompts and alternative text. The build also publishes a downloadable copy.
- `src/data/images.json`: coordinated image metadata and original prompts.
- `public/images/scenarios/`: thirty generated fictional editorial images, with 800-pixel responsive variants. The homepage reuses the Sarah image.
- `scripts/build-intro.py`: builds the self-contained five-slide Web Deck v5 introduction, embedding generated photos, local fonts, notes, and the retained framework. Rebuild after changing the deck content or framework copies.
- `public/worksheet.html`: accessible printable team worksheet.

The available source for this implementation was the user's thirty-scenario Version 2 brief; no separate original Version 1 scenario dataset was present in the checkout. The six named collections and all thirty listed situations are retained and fully developed here. NIST connections are teaching interpretations, not a claim of certification or coverage of all privacy, equity, and accessibility requirements.

To revise a mission, edit its structured record and run validation, engine tests, browser tests, and the build. Update the matching image metadata and prompt documentation if artwork changes. Schema changes should update the validator and negative validation tests. The current edition intentionally requires exactly thirty missions; expanding the library also requires changing that count contract and the visible library count.

## Facilitation

Start with **Start a mission**, choose solo, team, or facilitator mode, and follow the five instructions. Browse or search the six collections for another mission. Mission 06 is the default reference.

The projected interface displays at most two choices at once; **More choices** shows the rest without losing selections. Risks support multiple selections. Blue Team records one first response and its reasoning. Choices receive no scores and no immediate answer feedback.

Clues start concealed, open independently, and show one card at a time. They can be collapsed or hidden together. Nudges are generic thinking prompts. Recommended practices and response analyses appear in the debrief, or after deliberately revealing notes in a separate presenter window. Each debrief uses five short screens to preserve reading size. The twist must be explicitly revealed.

Right and Left move through stages and debrief screens. C opens clues, F toggles presentation mode, and T shows the optional timer. Single-key shortcuts can be disabled in the menu. Shortcuts do not run inside text inputs or dialogs. Full-screen display also has a clickable control. Timers default off and never submit decisions or advance the mission.

Open the facilitator guide from **Menu** for pacing and a separate presenter window. Keep that window on an unshared display. Mirroring one screen does not protect notes. Window synchronization is browser-local and requires BroadcastChannel; there is no remote multiplayer or device connection.

## Privacy and persistence

No registration, analytics, external AI calls, remote fonts, or backend services are used. Typed reasoning and reflections stay only in tab memory and are lost on reload or close. Record text is HTML-escaped, and can be copied or downloaded deliberately. Do not enter actual applicant or other private information. The blank worksheet prints independently.

Static source files contain clues and debrief data, so they are inspectable by someone who deliberately examines the application bundle. Concealment is an interface behavior, not a security boundary.

## Verification scope

Automated checks cover thirty-mission traversal, concealed and independently collapsible clues, response selection and analysis, instructions, browsing, random missions, timers, local records and export, reset, keyboard navigation, presenter synchronization, and axe accessibility checks. Projector layouts cover 1920×1080, 1600×900, 1366×768, and 1280×720; every mission and debrief page is additionally tested at 1280×720. Phone layouts are checked at 360 and 390 pixels. The introductory deck is verified slide by slide, on phones, in its presenter window, and in PDF print output.

Browser checks cannot replace a human screen-reader or actual conference-room test. The lab uses real buttons, native dialogs, visible focus, reduced-motion support, accessible status messages, and no forced time limits.

Image generation used the built-in image tool. Characters and events are fictional. Local Atkinson Hyperlegible fonts retain their SIL Open Font License. The copied Web Deck v5 framework retains its MIT license and invisible attribution.
