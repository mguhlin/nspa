# Web Deck v5 — NSPA project specification

Project correction, October 18, 2026: the next-slide preview uses `pvNextFrame`; the next-navigation button retains `pvNext`. Unique IDs keep the preview out of the button and restore the two-monitor next-slide image. The bundled project framework and inlined deck share this correction. The canonical local webdeck clone is absent on this machine.

# Standalone Instructions

This is the **self-contained** edition of the Web Deck v5 specification. Upload or paste
this *single file* into any web-based chatbot (ChatGPT, Claude, Gemini, Copilot, etc.),
then ask it to build a deck. Everything it needs is in this one document: the full
specification below, plus the **complete framework** embedded verbatim in
**Appendix A (CSS)** and **Appendix B (JavaScript)** at the end.

## How to use it with a chatbot

1. Upload (or paste) this entire file into the chat.
2. Then send a prompt like:

> Using the Web Deck v5 system fully described in the document I just gave you, build a
> **single self-contained HTML file** deck on **[TOPIC]** for **[AUDIENCE]**. Put the
> entire CSS from Appendix A inside one `<style>` tag in the `<head>`, and paste the
> entire JavaScript from Appendix B **verbatim and in full** inside one `<script>` tag
> just before `</body>` — do not abridge, summarize, or retype it. Add a Google Fonts
> link and a `:root` skin block for the palette/fonts (spec section 1.1). Follow the
> structure, class names, and on-slide writing style in the spec. Include a cover, a
> divider before each section, and content slides using the blocks where they fit. Keep
> on-slide text to short phrases and write real teleprompter speaker notes (about 100
> words, first person) in the `.notes` block of **every** slide. Give every slide a
> `.slide-footer`. Aim for about **[N]** slides. Output the complete file, ready to save
> and open in a browser.

## Reading note (standalone vs linked)

The specification below is written for the normal workflow, where a project **links**
two shared files (`assets/deck-framework.css` and `assets/deck-framework.js`). In this
**standalone** edition there are no separate files: wherever the spec says *"copy /
link `webdeck/assets/deck-framework.*`"*, the equivalent is to **paste Appendix A into a
single `<style>` tag and Appendix B into a single `<script>` tag** (just before
`</body>`), producing one portable HTML file. The framework injects its own navigation
chrome (controls, progress bar, exit icon) at runtime — you do not add those by hand.

Single-file skeleton:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Deck Title</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=...&display=swap" rel="stylesheet">
  <style>
    /* --- Appendix A (deck-framework.css) pasted in full --- */
    /* --- then your per-project :root skin + any deck-local one-offs (spec 1.1, 4) --- */
  </style>
</head>
<body>
  <div class="deck">
    <section class="slide cover current"> ... </section>
    <section class="slide divider"> ... </section>
    <section class="slide"> ... </section>
  </div>
  <script>
    /* --- Appendix B (deck-framework.js) pasted in full and verbatim --- */
  </script>
</body>
</html>
```

> To point the exit icon at a hub, change the `href` in the `exitLink` line inside the
> pasted Appendix B (default is `../index.html`).

---

# Web Deck Instructions — v5 (canonical, project-neutral)

*The single source of truth for the self-contained HTML slide-deck system used across `~/Documents/vibecoding` projects.*
*Canonical location: `~/Documents/vibecoding/webdeck/`. Last revised 2026-10-09.*

Any agent (Claude Code, ChatGPT/Codex, or a human) that is asked to **build or edit a web deck / slide deck** in any vibecoding project should follow this file. It is intentionally self-contained and tool-neutral: nothing here depends on a particular assistant. The reference framework lives beside it at `webdeck/assets/deck-framework.css` and `webdeck/assets/deck-framework.js`.

> **How projects use this.** Each deck project keeps its **own copy** of the two `assets/` files (so the deck is portable and deployable on its own). To start or refresh a project, copy `webdeck/assets/deck-framework.{css,js}` into the project's `assets/` and copy `webdeck/decks/template-deck.html` as a starting deck. When you change framework *behavior*, update this file in the same change, and re-sync the copies that are meant to track it.

---

## 0. What this system is

Self-contained HTML slide decks. **No build step, no bundler, no framework, no runtime dependency beyond Google Fonts.** Each deck is a single HTML file that presents fullscreen, carries teleprompter **speaker notes**, drives a **two-monitor presenter view**, exports to **PDF**, and scales to any screen.

Everything is powered by two shared files, plus one HTML file per deck:

| File | Role |
|---|---|
| `assets/deck-framework.css` | Design system, slide layout, navigation chrome, presenter-view styles, print rules. ~410 lines. |
| `assets/deck-framework.js` | Slide navigation, notes panel, presenter window, cross-window sync, exit icon, print. ~310 lines. IIFE, no dependencies. |
| `decks/<n>-<name>.html` (or `<name>.html`) | One deck. Links the two shared files + fonts; contains only its slides and any deck-local `<style>`. |

To reuse in a new project: copy those two `assets/` files and one deck as a template, then swap the slides.

### 0.1 Per-project customization (what changes, what stays)

**Stays the same across projects** (the shared framework): the 1280×720 canvas, slide types, content blocks, navigation chrome, presenter view, notes behavior, print rules, accessibility layer, keyboard map. Do not fork these casually.

**Customize per project** (local overrides, not edits to the shared framework):
- **Palette and fonts** — the framework ships a blue-and-silver editorial reference skin (§1). Re-skin by overriding the `:root` custom properties and the Google Fonts link in the deck's own `<style>`. (Example: the `eles` project re-skins to navy `#0A3476` + gold `#FCB040` with DM Serif Display + DM Sans. See §1.1.)
- **Footer brand / facilitator / URL** — set in each slide's `.slide-footer` (§2).
- **Exit-icon target** — the shared default links to `../index.html` with a generic label; point it at the project's hub (e.g. `../framework.html`) by editing the project's copy of `deck-framework.js`.
- **Deploy flow** — per project (§13).

### 0.2 Linked vs self-contained (inlined) decks — important

A deck can include the framework two ways:
1. **Linked** (default, recommended): `<link rel="stylesheet" href="../assets/deck-framework.css">` + `<script src="../assets/deck-framework.js"></script>`. Updating the `assets/` files updates every linked deck automatically.
2. **Self-contained / inlined**: the framework CSS is pasted into a `<style>` tag and the JS into a `<script>` tag, producing one portable file (good for offline use or a generator that stamps out single files).

**Consequence:** a change to `assets/deck-framework.*` reaches **linked** decks for free, but **does not** reach **inlined** decks — those carry their own embedded copy and must be patched in the built file (or regenerated if a generator inlines the framework at build time). When you make a framework change, check for inlined decks and patch/rebuild them too.

---

## 1. Aesthetic — blue-and-silver reference skin (editorial)

Distinguished editorial meets modern brief. **Typography is the hero.** Whitespace is generous. Accents are precise hairlines and brushed silver.

### Palette (`:root` CSS custom properties)

| Token | Hex | Use |
|---|---|---|
| `--navy` | `#102A54` | titles, footer bar, primary accent |
| `--navy-dk` | `#0B1D33` | cover / divider backgrounds |
| `--navy-md` / steel | `#2F5F8F` | secondary emphasis, "do" column, kicker text |
| `--gold` (steel accent) | `#6F8FAF` | bullets, bars, borders — a steel-blue in the reference skin |
| `--gold-lt` (silver) | `#C8D2DC` | subtitles, light strips on dark, hover highlight |
| `--lgray` | `#F5F8FC` | card fills |
| `--mgray` / `--hair` | `#DCE3EE` / `#E2E8F2` | hairline borders |
| `--slate` | `#51617A` | captions |
| `--text` | `#1C2B44` | body text |
| `--metal` | silver gradient | accent strips, footer rule, progress bar |
| `--paper` | subtle gradient | content-slide background |

> The `--gold*` token **names** are historical; in the reference skin their **values** are blue/silver. A project may re-skin them to any palette (see §1.1). Do/do-not columns use **steel (do) vs navy (do-not)** in the reference skin — monochrome, not green/red.

### Fonts — one Google Fonts link per deck `<head>`

- Display / headings: **Fraunces** (`--font-display`).
- Body: **Libre Franklin** (`--font-body`).
- Mono / prompts: **IBM Plex Mono** (`--font-mono`).

```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Libre+Franklin:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Type scale (on the 1280-px canvas)

Slide title Fraunces ~41 px · kicker 13 px tracked caps in steel (diamond marker + hairline rule) · lead 22 px · bullets 23 px · card heading 20 px · card body 18 px. **Keep on-slide reading text ≥ 18 px** for projector legibility (tracked micro-labels, eyebrows, pills, and the footer are the intentional exception).

**Motion:** one orchestrated entrance per slide — children of `.slide-body` rise-and-fade in sequence (softer blur-glide on covers/dividers). Respects `prefers-reduced-motion`.

### 1.1 Re-skinning per project (worked example)

Override tokens and fonts in the **deck's own `<style>`**, loaded after the framework stylesheet, so the shared file stays generic:

```css
:root{
  --navy:#0A3476; --navy-dk:#071f4a; --navy-md:#12428f; --steel:#12428f;
  --gold:#FCB040; --gold-lt:#fdd17a; --gold-dk:#b9791f;
  --mgray:#e2e7f5; --hair:#e2e7f5; --slate:#5a6680; --text:#1a1a2e;
  --metal:linear-gradient(180deg,#fdd17a 0%,#FCB040 55%,#e09a2e 100%);
  --paper:linear-gradient(174deg,#ffffff 0%,#f3f6fc 100%);
  --font-display:"DM Serif Display", Georgia, serif;
  --font-body:"DM Sans", system-ui, sans-serif;
  --font-mono:ui-monospace, Menlo, Consolas, monospace;
}
/* DM Serif Display ships one weight; pin headings to 400 to avoid faux-bold */
.slide h1,.slide h2,.slide h3,.slide h4,.slide-title,.cover h1,.divider h1{font-weight:400;}
```

Also load that project's Google Fonts link instead of the default one. Keep contrast ≥ 4.5:1 (§7).

---

## 2. The slide canvas

Every slide is a fixed **1280 × 720** (16:9) canvas. The JS scales it to the viewport, so you author at a constant size and it fits any screen. The scale is recomputed on resize. Below ~800 px wide, or at high browser zoom, the framework switches to a **reflow mode** (§7) so the deck stays readable on phones and meets WCAG reflow; on laptops and projectors it scales as one unit.

```html
<div class="deck">
  <section class="slide cover current"> … </section>   <!-- first slide gets `current` -->
  <section class="slide"> … </section>
  …
</div>
<script src="../assets/deck-framework.js"></script>
```

Each slide has three parts — **body, footer, notes**. The footer is a **sibling** of `.slide-body` (not inside it), so the framework can pin it to the bottom:

```html
<section class="slide">
  <div class="slide-body"> …visible content… </div>
  <div class="slide-footer">
    <span class="brand"><span class="star">✦</span> Brand</span>
    <span class="fac">Facilitator: Name</span>
    <span class="url">project.url</span>
  </div>
  <div class="notes"><p>…teleprompter text…</p></div>   <!-- never rendered on the slide -->
</section>
```

The framework reads `location.hash` on load, so `deck.html#4` opens on slide 4 — used for deep links **and** for screenshot verification (§10). `window.__deck.show(n)` (0-based) jumps programmatically — useful for an in-deck "jump to a section" menu (buttons calling `window.__deck.show(i)`; the framework ignores clicks on `<button>` so they do not also advance the slide).

---

## 3. Slide types

- **Cover** — `class="slide cover"`: dark gradient, silver left rule, inset hairline frame.
  ```html
  <div class="slide-body">
    <div class="cover-eyebrow">Event name</div>
    <h1>Big Title</h1>
    <div class="subtitle">Italic subtitle</div>
    <div class="meta"><strong>Facilitator:</strong> Name<br>url</div>
  </div>
  ```
- **Divider** — `class="slide divider"`: cover-like, with an oversized ghosted `.seg-num` numeral. Either a `cover` or an opening `divider` counts as the **title slide** (§6 exit-icon rule).
  ```html
  <div class="slide-body">
    <div class="seg-num">1</div>
    <div class="divider-eyebrow">Segment One · about 20 minutes</div>
    <h1>Section Title</h1>
    <div class="subtitle">One-line summary</div>
  </div>
  ```
- **Content** — the standard slide: kicker + title, then blocks.
  ```html
  <div class="slide-body">
    <div class="slide-kicker">Small tracked label</div>
    <h2 class="slide-title">The headline</h2>
    <p class="lead">Optional lead sentence.</p>
    <!-- blocks below -->
  </div>
  ```

> **Title width:** the framework caps `.slide-title` for the reference measure; if a title wraps to two lines when it could fit on one, widen it per deck (`.slide-title{max-width:none;}`) rather than shrinking the font.

---

## 4. Content blocks (drop into `.slide-body`)

- **Bullets** — `<ul class="bullets"><li>…</li></ul>`, 3–5 diamond bullets, short phrases; `<strong>` for emphasis.
- **Cards** — `<div class="grid cols-3">` (or `cols-2`) of `<div class="card">` (add `gold` for a top-tab). Card = `<h3><span class="ico">⚖️</span>Title</h3><p>…</p>`.
- **Steps** — `<div class="steps">` of `<div class="step"><div class="n">1</div><h4>…</h4><p>…</p></div>` — numbered process.
- **Guardrail (do / do-not)** — `<div class="guardrail">` with `.guardrail-col.will` ("Do") and `.guardrail-col.willnot` ("Do not"). Keep to ~3 items per column — it overflows easily. (Facilitator-only "how to run it" guidance belongs in notes, not on a projected slide.)
- **Compare** — `<div class="compare">` with two `<div class="compare-col">` (second one `alt`).
- **Callout** — `<div class="callout"><span class="label">LABEL</span><p>Big statement</p></div>`; add `light` for a pale version.
- **Reflect** — `<div class="reflect"><span>💬</span><p><strong>Lead.</strong> Italic prompt</p></div>`.
- **Prompt** — `<div class="prompt">…</div>` — dark mono block for prompt/citation text.
- **Stats** — `<div class="stat-row">` of `<div class="stat"><div class="num">Word</div><div class="lbl">…</div></div>`.
- **Pill** — `<span class="pill time">about 20 min</span>` or `pill tag`.
- **Scenario** — `<div class="scenario"><div class="scenario-label">Your task</div><p>…</p></div>`.
- **Next-step link** — points at an activity, resource, or the next deck:
  ```html
  <div class="next-step no-advance">
    <span class="ns-label">Do this next</span>
    <a href="../activities/x.html" target="_blank" rel="noopener">Open it <span class="arrow">↗</span></a>
  </div>
  ```
  Always give it `no-advance` (so the click does not flip the slide) and `target="_blank"`.

**Deck-local one-offs** (letter grids, tier cards, two-column layouts, image frames) live in a small `<style>` block in that deck's `<head>`. Always reuse the palette variables so they stay on-brand, and register any deck-local grid/absolute art in the `.deck.reflow` rules (§7).

---

## 5. Images and photos

Author at the fixed 1280×720 scale and place with absolute positioning (hero/divider art) or in a normal-flow `<figure>` (infographics) so text and image never collide.

### 5.1 Optimize first — always WebP

Convert every source PNG/JPG to WebP before adding it. Targets: **≤ ~160 KB**, longest edge ~1100–1200 px, quality 82–88.

```bash
magick source.png -resize 1160x -quality 86 assets/name.webp
magick source.png -crop 1400x600+0+120 +repage -resize 1160x -quality 86 assets/name.webp
```

**Sourcing:** use images you have rights to. Free/CC options include Unsplash (Unsplash License — free, incl. commercial, no attribution required) and Wikimedia Commons (CC/PD). Download and host locally; don't hotlink. Record sources in an HTML comment. Always visually vet an image before using it.

### 5.2 Placement patterns

- **Corner icon** — `<img class="slide-ico" src="…" alt="">` as the first child of `.slide-body` (floats top-right ~108 px). Only on slides whose top-right is empty.
- **Right hero with fade** — a large image bled off the right edge, masked so it dissolves into the slide (`-webkit-mask-image`/`mask-image` linear-gradient). Constrain the text column's `max-width`.
- **Divider photo** — a rounded, shadowed card floated right of divider text.
- **Image-left / words-right** — a two-column grid inside `.slide-body`.
- **Infographic figure** — a centered normal-flow `<figure>` with `max-height` so it stays on-canvas; reflows cleanly.

**Rule of thumb:** if an image leaves a big empty band, enlarge it, add a companion element, or switch to a two-column layout. Don't ship a slide that's half whitespace.

---

## 6. Navigation chrome

Injected once by the JS, fixed to the viewport (outside the scaled canvas):

- **`#progress`** — 3 px bar at the very top; width tracks position.
- **`#controls`** — top-right cluster (~62 % idle opacity, 100 % on hover): `‹` prev · counter · `›` next · 🗒 notes · 🖥 presenter · ⛶ fullscreen · ? help.
- **`#exitDeck`** — top-**left** exit-to-hub icon (a `log-out` glyph). **Hidden on the title slide** (`idx === 0`) and in print. It lives in the shared framework — do not add it per-deck; point its `href` at the project hub.

All chrome is hidden by the print stylesheet.

---

## 7. Accessibility (WCAG 2.1 AA)

**Built into the framework (automatic):**
- **Reflow mode** (1.4.10/1.4.4/1.4.12) — `fit()` toggles `.reflow` on `.deck` when `innerWidth < 800` or the fit scale drops below `0.55×`; slides become a single-column, scrollable, relative-type layout. **When you add a deck-local two-column grid or absolutely-positioned image, add its selector to the `.deck.reflow` collapse/neutralize rules** (in the deck's `<style>`) so it stacks cleanly on phones.
- **Visible focus** (2.4.7), **slide-change live region** (4.1.3), **reduced motion** (2.3.3), **non-text contrast** (1.4.11) — all handled.

**Author rules (per slide):** real text, never images of text (1.4.5); accurate `alt` (decorative = `alt=""`, 1.1.1); contrast ≥ 4.5:1 (1.4.3); don't encode meaning in color alone (1.4.1); every slide has a real heading.

**Not automatic:** screen-reader passes and RTL `lang="en"` marking — don't claim conformance without testing.

---

## 8. Speaker notes and the presenter view

**Notes.** Every slide carries `<div class="notes"><p>…</p></div>`. Hidden on the slide; surfaced two ways:

- **On the current screen** — press **S** (or **N**) to slide up a notes panel. Dismiss it the same way, with the **×** button in the panel header, or with **Esc**.
- **On a second monitor** — press **V** (or 🖥) to open a **presenter window**: current slide, next slide, notes in large type, an elapsed **timer** (click to pause; Reset button), and a clock. Put the main window on the projector, press **F** for fullscreen. The two windows stay in sync via `BroadcastChannel` + a `localStorage` fallback (same-origin). Close the presenter window with its **✕ Close** button (top bar) or **Esc** — no need to hunt for the OS window control.
- **Resizing the notes** — the presenter window's Speaker-notes panel carries **A− / A+** buttons (right of the "Speaker notes" label) to shrink or enlarge the notes text mid-talk; the **+** and **−** keys do the same. The size is clamped and **persists** across sessions via `localStorage` (key `webdeck-notes-scale`; default 20 px / scale 1.0).

**Writing the notes — teleprompter text, not stage directions:** first person, conversational; ~90–130 words per slide; cover what to say, what to watch for, and the transition. No em dashes. No meta-remarks ("say this…"). Put facilitator "how to run it" guidance here, not on the projected slide.

**Keyboard (main deck):** → / Space / PgDn next · ← / PgUp prev · Home / End first / last · **S** notes · **V** presenter · **F** fullscreen · **P** print/PDF · **?** help. Clicking the left third of a slide goes back, the rest advances (links, buttons, `.no-advance` ignored).

**Keyboard (presenter window):** → / Space / PgDn next · ← / PgUp prev · Home / End first / last · **T** reset timer · **+** / **−** enlarge / shrink the notes text.

---

## 9. Print / PDF export

Press **P** in any deck. The print stylesheet stacks every slide one-per-page at 1280 × 720, forces `print-color-adjust: exact`, resets the JS scaling transforms, and hides all chrome. "Save as PDF" gives a clean handout.

---

## 10. Verify before you ship — headless Chrome

Never trust an edit to a fixed-canvas slide by eye alone. Render it:

```bash
google-chrome --headless --disable-gpu --hide-scrollbars \
  --window-size=1280,720 --virtual-time-budget=4000 \
  --screenshot=/tmp/slide.png "file://$PWD/decks/0-overview.html#4"
```

Then open the PNG. Crop a detail with `magick /tmp/slide.png -crop 120x70+0+0 +repage /tmp/corner.png`. Check a **content slide** (element present) and the **title slide** (exit icon absent) when touching shared chrome, and render at phone width (`--window-size=380,820`) to confirm **reflow** (§7). To verify the **presenter view**, render `…/deck.html?presenter=1`.

---

## 11. Build a new deck — checklist

1. Copy `webdeck/assets/deck-framework.{css,js}` into the project's `assets/` (or confirm they're current). Copy `webdeck/decks/template-deck.html` as a starting deck.
2. Link the Google Fonts + `../assets/deck-framework.css` in `<head>`; add a deck-local `<style>` for the project skin (§1.1) and any one-offs.
   - Keep the **invisible framework attribution** in the `<head>` — the template ships it and it never renders on a slide:
     ```html
     <!-- Built with Web Deck v5 — https://mguhlin.github.io/webdecks/ · Developed by Miguel Guhlin - mguhlin.org · MIT -->
     <meta name="generator" content="Web Deck v5 (https://mguhlin.github.io/webdecks/) — developed by Miguel Guhlin - mguhlin.org">
     ```
     This credits the **framework**, not the deck. Put the deck's own owner in the footer / cover (`Facilitator: Name`), never the framework author — the framework author's name must not appear on any slide.
3. Open `<div class="deck">`. One `<section class="slide …">` per slide; give the **first** one `current`.
4. Start with a `cover`, use `divider` slides between segments, `content` slides between.
5. On every slide include the `.slide-footer` (sibling of `.slide-body`) and a `.notes` block.
6. Keep slides to 3–5 short bullets or one main block; push full sentences into the notes.
7. Optimize images to WebP (§5.1); place absolutely or in a `<figure>`; register deck-local grids/art in `.deck.reflow` (§7).
8. End the body with `<script src="../assets/deck-framework.js"></script>`.
9. Write teleprompter notes for **every** slide before calling it done.
10. Render each new/edited slide headless (§10) at 1280×720 **and** phone width.

### On-slide writing style

Second person · Oxford comma · spell out numbers one through ten · **no em dashes** · **no ampersands** (use "and") · **no colons in titles** · avoid hype words (empower, journey, embark, delve, unlock, elevate, discover, master).

---

## 12. Resource pages and i18n (optional)

Reader pages (hubs, activities, handouts) can use a sibling `assets/pages.css` with the same palette/fonts. A lightweight i18n engine (`data-i18n` attributes + a registered dictionary, persisted via `?lang=` + localStorage) adds a language switcher. Translate chrome; keep substantive content in its authored language unless the project says otherwise. These are project-specific; see the project's own notes.

---

## 13. Deploy workflow (per project)

Most vibecoding decks are static sites on **GitHub Pages**, deployed by pushing to the repo's default branch. General flow:

```bash
git add <files> && git commit -m "…"
git push origin main            # Pages auto-builds
# confirm live: curl -s -o /dev/null -w '%{http_code}' https://<user>.github.io/<repo>/<path>
```

Notes:
- Some repos require a specific GitHub account to push (e.g. `gh auth switch --user <name>` before the push, then switch back). Follow the project's own deploy note.
- `_site/` and similar build outputs may be gitignored; the **committed** source files are what deploy. For **generator-built, inlined** decks (§0.2), fix the generator *source* and **rebuild**, and patch any already-committed built file so the live page updates.
- After pushing, **verify the live URL** (poll until the new content appears; Pages takes ~30–90 s), and hard-refresh to clear cache.

Honor each repo's standing instructions (e.g. an `AGENTS.md` that authorizes commit/push/deploy without asking).

---

*End of v5. If you change the framework's public behavior (a keyboard binding, a chrome element, a content block, the presenter view), update this file in the same change, re-sync `webdeck/assets/`, and patch inlined decks (§0.2).*

---

# Appendix A — `deck-framework.css` (paste into one `<style>` tag)

The complete design system, layout, chrome, presenter view, print, and accessibility styles. Paste **everything between the fences** into a single `<style>` tag in the `<head>`.

```css
/* ============================================================
   Web Deck Framework (v5)  —  editorial, blue-and-silver reference skin.
   Developed by Miguel Guhlin - mguhlin.org · https://mguhlin.github.io/webdecks/
   Free to use (MIT). This header is attribution only; it never renders on a slide.
   Default: Fraunces + Libre Franklin + IBM Plex Mono. Re-skin per project via :root.
   Shared by every deck. Class names preserved.
   ============================================================ */

:root {
  /* palette (blue and silver) */
  --navy:    #102A54;
  --navy-dk: #0B1D33;
  --navy-md: #2F5F8F;
  --steel:   #2F5F8F;
  --gold:    #6F8FAF;   /* accent (kept name for compatibility) */
  --gold-lt: #C8D2DC;   /* silver */
  --gold-dk: #2F5F8F;
  --white:   #FFFFFF;
  --lgray:   #F5F8FC;
  --mgray:   #DCE3EE;
  --hair:    #E2E8F2;   /* hairline on light */
  --slate:   #51617A;
  --text:    #1C2B44;
  --good:    #6B7A8C;
  --better:  #2F5F8F;
  --best:    #102A54;
  --red:     #102A54;   /* "do not" */
  --red-bg:  #F1F3F6;
  --red-bd:  #CBD4DE;
  --green:   #2F5F8F;   /* "do" */
  --green-bg:#E4EDF7;
  --green-bd:#93AFCE;

  /* fonts */
  --font-display: "Fraunces", Georgia, "Times New Roman", serif;
  --font-body:    "Libre Franklin", system-ui, -apple-system, sans-serif;
  --font-mono:    "IBM Plex Mono", "Courier New", monospace;

  /* material */
  --metal: linear-gradient(180deg,#EEF3F9 0%,#C8D2DC 48%,#93AFCE 100%);
  --paper: linear-gradient(174deg,#FDFEFF 0%,#EEF3FA 100%);
  --sh-card: 0 1px 2px rgba(16,42,84,.05), 0 12px 26px rgba(16,42,84,.07);
  --sh-lift: 0 2px 4px rgba(16,42,84,.06), 0 18px 40px rgba(16,42,84,.10);

  --slide-w: 1280px;
  --slide-h: 720px;
}

*,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  height: 100%;
  font-family: var(--font-body);
  color: var(--text);
  background: #060F1F;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* ── Deck stage ─────────────────────────────────────────── */
.deck { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.deck::before {                         /* ambient backdrop */
  content:''; position:absolute; inset:-20%;
  background:
    radial-gradient(60% 60% at 20% 10%, rgba(47,95,143,.35), transparent 60%),
    radial-gradient(60% 60% at 90% 90%, rgba(16,42,84,.55), transparent 60%);
  filter: blur(20px);
}

/* Each slide is a fixed 16:9 canvas, scaled by JS. */
.slide {
  position: absolute; width: var(--slide-w); height: var(--slide-h);
  background: var(--paper); overflow: hidden; display: none;
  flex-direction: column; box-shadow: var(--sh-lift), 0 40px 90px rgba(0,0,0,.55);
}
.slide::after {                          /* fine grain / texture */
  content:''; position:absolute; inset:0; z-index:2; pointer-events:none; opacity:.05;
  mix-blend-mode: soft-light;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.slide.current { display: flex; }

.slide-body { position:relative; z-index:1; flex: 1; padding: 54px 72px 40px; display: flex; flex-direction: column; min-height: 0; }

/* ── Footer ─────────────────────────────────────────────── */
.slide-footer {
  position: relative; z-index: 3; height: 44px; min-height: 44px; background: var(--navy);
  display: flex; align-items: center; justify-content: space-between; padding: 0 26px;
  color: #C6D4EC; font-size: 11.5px;
}
.slide-footer::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:var(--metal); }
.slide-footer .brand {
  font-family: var(--font-display); font-weight: 600; font-size: 13px; letter-spacing: .06em;
  color: var(--gold-lt); display: flex; align-items: center; gap: 6px;
}
.slide-footer .brand .star { color: var(--gold-lt); }
.slide-footer .url { font-family: var(--font-body); font-weight: 600; font-size: 10.5px; letter-spacing:.03em; color: var(--gold-lt); }
.slide-footer .fac { font-style: italic; font-size: 11px; color: #9FB4D6; }

/* ── Type ───────────────────────────────────────────────── */
.slide h1, .slide h2, .slide h3, .slide h4 { font-family: var(--font-display); }

.slide-title {
  font-family: var(--font-display); font-size: 41px; font-weight: 600;
  color: var(--navy); line-height: 1.03; letter-spacing: -0.015em; margin-bottom: 4px; max-width: 24ch;
}
.slide-kicker {
  font-family: var(--font-body); font-size: 13px; font-weight: 600; letter-spacing: .26em;
  text-transform: uppercase; color: var(--steel); margin-bottom: 14px;
  display: flex; align-items: center; gap: 12px;
}
.slide-kicker::before { content:''; width:7px; height:7px; background:var(--steel); transform:rotate(45deg); flex:none; }
.slide-kicker::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,var(--mgray),transparent); }

.lead { font-family: var(--font-body); font-size: 22px; font-weight: 300; color: var(--slate); line-height: 1.5; max-width: 62ch; }

/* Bullets — editorial hanging diamonds */
.bullets { list-style: none; margin-top: 20px; display: flex; flex-direction: column; gap: 15px; }
.bullets li { position: relative; padding-left: 32px; font-size: 23px; font-weight: 400; color: var(--text); line-height: 1.38; }
.bullets li::before { content:''; position:absolute; left:2px; top:9px; width:11px; height:11px; background:var(--metal); transform:rotate(45deg); box-shadow:0 1px 2px rgba(16,42,84,.25); }
.bullets li strong { color: var(--navy); font-weight: 600; }

/* ── Cover / divider ────────────────────────────────────── */
.slide.cover, .slide.divider {
  background:
    radial-gradient(120% 90% at 12% -5%, #1B3E6E 0%, rgba(27,62,110,0) 52%),
    radial-gradient(90% 100% at 105% 108%, #123059 0%, rgba(18,48,89,0) 55%),
    linear-gradient(160deg,#0E2545 0%, #081627 100%);
}
.slide.cover::after, .slide.divider::after { opacity:.07; }
.slide.cover .slide-body, .slide.divider .slide-body { justify-content: center; padding-left: 92px; }
.slide.cover .slide-body::before, .slide.divider .slide-body::before {
  content:''; position:absolute; left:0; top:0; bottom:0; width:8px; background:var(--metal);
}
.slide.cover .slide-body::after, .slide.divider .slide-body::after {
  content:''; position:absolute; left:24px; right:40px; top:26px; bottom:26px;
  border:1px solid rgba(200,210,220,.18); pointer-events:none;
}
.cover-eyebrow, .divider-eyebrow {
  font-family: var(--font-body); font-size: 12.5px; font-weight: 600; letter-spacing: .28em;
  text-transform: uppercase; color: var(--gold-lt); margin-bottom: 20px;
}
.cover h1 { font-family: var(--font-display); font-size: 62px; font-weight: 600; color: #F4F8FE; line-height: 1.0; letter-spacing:-0.02em; max-width: 18ch; margin-bottom: 22px; }
.cover .subtitle { font-family: var(--font-display); font-size: 24px; font-style: italic; font-weight: 400; color: var(--gold-lt); max-width: 40ch; }
.cover .meta { font-family: var(--font-body); margin-top: 34px; font-size: 14px; color: #A9BEDD; line-height: 1.75; font-weight: 300; }
.cover .meta strong { color: #F4F8FE; font-weight: 500; }

.divider h1 { font-family: var(--font-display); font-size: 52px; font-weight: 600; color: #F4F8FE; line-height: 1.04; letter-spacing:-0.02em; max-width: 20ch; }
.divider .subtitle { font-family: var(--font-display); font-size: 22px; font-style: italic; color: var(--gold-lt); margin-top: 16px; max-width: 46ch; font-weight: 400; }
.divider .seg-num {
  position: absolute; top: 40px; right: 66px; margin: 0;
  font-family: var(--font-display); font-size: 300px; font-weight: 600; line-height: 1;
  color: transparent; -webkit-text-stroke: 1.5px rgba(200,210,220,.28); opacity: .9;
  z-index: 0; pointer-events: none;
}
.divider .divider-eyebrow, .divider h1, .divider .subtitle { position: relative; z-index: 1; }

/* ── Cards ──────────────────────────────────────────────── */
.grid { display: grid; gap: 16px; margin-top: 20px; }
.grid.cols-2 { grid-template-columns: 1fr 1fr; }
.grid.cols-3 { grid-template-columns: repeat(3, 1fr); }

.card {
  position: relative; background: var(--white); border: 1px solid var(--hair);
  border-radius: 4px; padding: 17px 19px 16px; box-shadow: var(--sh-card);
}
.card::before { content:''; position:absolute; left:0; top:0; width:36px; height:3px; background:var(--navy); border-radius:0 0 3px 0; }
.card.gold::before { background: var(--steel); }
.card h3 { font-family: var(--font-display); font-size: 20px; font-weight: 600; color: var(--navy); margin: 4px 0 7px; line-height: 1.15; display: flex; align-items: center; gap: 9px; }
.card p { font-family: var(--font-body); font-size: 18px; font-weight: 300; color: var(--slate); line-height: 1.5; }
.card .ico { font-size: 19px; }

/* ── Steps ──────────────────────────────────────────────── */
.steps { display: flex; gap: 15px; margin-top: 22px; align-items: stretch; }
.step { flex: 1; position: relative; background: var(--white); border: 1px solid var(--hair); border-radius: 4px; padding: 16px 17px; box-shadow: var(--sh-card); }
.step::before { content:''; position:absolute; left:0; top:0; right:0; height:3px; background:var(--metal); }
.step .n {
  width: 34px; height: 34px; border-radius: 50%; background: var(--navy); color: #fff;
  font-family: var(--font-display); font-weight: 600; font-size: 16px;
  display: flex; align-items: center; justify-content: center; margin-bottom: 11px;
}
.step h4 { font-family: var(--font-display); font-size: 18px; font-weight: 600; color: var(--navy); margin-bottom: 5px; }
.step p { font-family: var(--font-body); font-size: 16px; font-weight: 300; color: var(--slate); line-height: 1.42; }

/* ── Do / Do-not columns ────────────────────────────────── */
.guardrail { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 20px; }
.guardrail-col { border-radius: 4px; border: 1px solid; padding: 17px 19px; }
.guardrail-col.will { background: var(--green-bg); border-color: var(--green-bd); }
.guardrail-col.willnot { background: var(--red-bg); border-color: var(--red-bd); }
.guardrail-col h4 { font-family: var(--font-display); font-size: 18px; font-weight: 600; margin-bottom: 11px; display:flex; align-items:center; gap:8px; letter-spacing:-0.01em; }
.guardrail-col.will h4 { color: var(--green); }
.guardrail-col.willnot h4 { color: var(--red); }
.guardrail-col ul { list-style: none; display: flex; flex-direction: column; gap: 9px; }
.guardrail-col li { font-family: var(--font-body); font-size: 18px; font-weight: 300; line-height: 1.4; padding-left: 24px; position: relative; }
.guardrail-col.will li { color: #24446B; } .guardrail-col.willnot li { color: #1B2E48; }
.guardrail-col.will li::before { content:'✓'; position:absolute; left:0; color:var(--green); font-weight:700; }
.guardrail-col.willnot li::before { content:'✕'; position:absolute; left:0; color:var(--red); font-weight:700; }

/* ── Compare ────────────────────────────────────────────── */
.compare { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
.compare-col { position: relative; border-radius: 4px; padding: 18px 20px; background: var(--white); border: 1px solid var(--hair); box-shadow: var(--sh-card); }
.compare-col::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:var(--navy); }
.compare-col.alt::before { background: var(--steel); }
.compare-col h3 { font-family: var(--font-display); font-size: 21px; font-weight: 600; color: var(--navy); margin-bottom: 11px; }
.compare-col ul { list-style: none; display: flex; flex-direction: column; gap: 8px; }
.compare-col li { font-family: var(--font-body); font-size: 18px; font-weight: 300; padding-left: 20px; position: relative; color: var(--text); line-height: 1.35; }
.compare-col li::before { content:''; position:absolute; left:3px; top:8px; width:6px; height:6px; background:var(--steel); transform:rotate(45deg); }

/* ── Callout / reflect ──────────────────────────────────── */
.callout { position: relative; margin-top: 22px; background: var(--navy); color: #EAF1FB; border-radius: 5px; padding: 20px 26px 20px 28px; overflow: hidden; }
.callout::before { content:''; position:absolute; left:0; top:0; bottom:0; width:5px; background:var(--metal); }
.callout .label { font-family: var(--font-body); font-size: 11px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--gold-lt); margin-bottom: 8px; }
.callout p { font-family: var(--font-display); font-size: 22px; font-weight: 400; line-height: 1.35; }
.callout.light { background: #EEF3FA; color: var(--navy-dk); }
.callout.light::before { background: var(--navy); }
.callout.light .label { color: var(--steel); }

.reflect { margin-top: 20px; position: relative; background: var(--navy); border-radius: 5px; padding: 15px 20px 15px 22px; color: var(--gold-lt); font-family: var(--font-display); font-style: italic; font-size: 20px; display:flex; gap:12px; align-items:flex-start; overflow:hidden; }
.reflect::before { content:''; position:absolute; left:0; top:0; bottom:0; width:4px; background:var(--metal); }
.reflect strong { color: #F4F8FE; font-style: normal; font-weight: 600; }

/* ── Prompt / code ──────────────────────────────────────── */
.prompt {
  font-family: var(--font-mono); font-size: 16px; line-height: 1.55; background: #0C1B32; color: #DCE6F5;
  border-radius: 6px; padding: 17px 19px; white-space: pre-wrap; word-break: break-word;
  border: 1px solid #21406E; position: relative; box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
}
.prompt::before { content:''; position:absolute; left:0; top:12px; bottom:12px; width:3px; background:var(--steel); border-radius:0 2px 2px 0; }
.prompt .tok { color: var(--gold-lt); }

/* ── Stats ──────────────────────────────────────────────── */
.stat-row { display: flex; gap: 22px; margin-top: 24px; }
.stat { flex: 1; text-align: center; position: relative; background: var(--white); border: 1px solid var(--hair); border-radius: 5px; padding: 22px 12px 18px; box-shadow: var(--sh-card); }
.stat::after { content:''; position:absolute; left:26px; right:26px; bottom:0; height:3px; background:var(--metal); }
.stat .num { font-family: var(--font-display); font-size: 34px; font-weight: 600; color: var(--navy); line-height: 1; letter-spacing:-0.01em; }
.stat .lbl { font-family: var(--font-body); font-size: 17px; font-weight: 300; color: var(--slate); margin-top: 10px; line-height:1.4; }

/* ── Pills ──────────────────────────────────────────────── */
.pill { display: inline-flex; align-items:center; gap:6px; font-family: var(--font-body); font-size: 14px; font-weight: 600; padding: 4px 12px; border-radius: 999px; }
.pill.time { background: #fff; color: var(--navy); border: 1px solid var(--mgray); }
.pill.tag { background: var(--navy); color: var(--gold-lt); letter-spacing: .08em; text-transform: uppercase; font-size: 11px; }

/* ── Scenario / activity ────────────────────────────────── */
.scenario { position: relative; margin-top: 18px; background: #EEF3FA; border: 1px solid var(--green-bd); border-radius: 6px; padding: 18px 22px; }
.scenario::before { content:''; position:absolute; left:0; top:0; bottom:0; width:4px; background:var(--metal); border-radius:6px 0 0 6px; }
.scenario .scenario-label { font-family: var(--font-body); font-size: 13px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--steel); margin-bottom: 7px; }
.scenario p { font-family: var(--font-body); font-size: 19px; font-weight: 300; color: var(--text); line-height: 1.5; }

/* ── Misc ───────────────────────────────────────────────── */
.two-col-text { columns: 2; column-gap: 44px; margin-top: 16px; }
.spacer { flex: 1; } .muted { color: var(--slate); } .center { text-align: center; }
.mt-s { margin-top: 10px; } .mt-m { margin-top: 18px; }
a.inline { color: var(--navy); font-weight: 600; text-decoration: underline; text-decoration-color: var(--steel); text-underline-offset: 2px; }
a.inline:hover { text-decoration-color: var(--navy); }

/* Do-this-next reference to an activity or resource */
.next-step { margin-top: 20px; align-self: flex-start; display: inline-flex; align-items: center; gap: 16px;
  background: #EAF1FB; border: 1px solid var(--green-bd); border-left: 5px solid var(--steel);
  border-radius: 7px; padding: 13px 20px; box-shadow: var(--sh-card); }
.next-step .ns-label { font-family: var(--font-body); font-weight: 700; font-size: 12px; letter-spacing: .16em;
  text-transform: uppercase; color: var(--steel); white-space: nowrap; }
.next-step a { font-family: var(--font-body); font-weight: 600; font-size: 19px; color: var(--navy);
  text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
.next-step a .arrow { color: var(--steel); font-size: 16px; }
.next-step a:hover { color: var(--steel); }
.next-step a:hover .arrow { transform: translate(2px,-2px); }
.next-step a .arrow { transition: transform .15s; }

/* ── Presenter notes never render on the slide ──────────── */
.slide .notes { display: none; }

/* ── Entrance choreography ──────────────────────────────── */
@keyframes riseIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
@keyframes glideIn { from { opacity: 0; transform: translateY(24px); filter: blur(2px); } to { opacity: 1; transform: none; filter: none; } }
.slide.current .slide-body > * { animation: riseIn .52s cubic-bezier(.22,.7,.2,1) both; }
.slide.current.cover .slide-body > *, .slide.current.divider .slide-body > * { animation: glideIn .7s cubic-bezier(.22,.7,.2,1) both; }
.slide.current .slide-body > *:nth-child(1){animation-delay:.04s}
.slide.current .slide-body > *:nth-child(2){animation-delay:.11s}
.slide.current .slide-body > *:nth-child(3){animation-delay:.18s}
.slide.current .slide-body > *:nth-child(4){animation-delay:.25s}
.slide.current .slide-body > *:nth-child(5){animation-delay:.32s}
.slide.current .slide-body > *:nth-child(6){animation-delay:.39s}
.slide.current .slide-body > *:nth-child(7){animation-delay:.46s}
.slide.current .slide-body > *:nth-child(8){animation-delay:.53s}
.slide.current .slide-body > *:nth-child(9){animation-delay:.60s}
.slide.divider .seg-num { animation: none !important; }
@media (prefers-reduced-motion: reduce) {
  .slide.current .slide-body > * { animation: none !important; }
  #notesPanel, #progress, #controls button, .next-step a .arrow, .pv-btn, #exitDeck { transition: none !important; }
}

/* ── Presenter notes panel ──────────────────────────────── */
#notesPanel {
  position: fixed; left: 0; right: 0; bottom: 0; max-height: 42vh;
  background: linear-gradient(180deg, rgba(11,29,51,.98), rgba(8,22,39,.98));
  color: #E7EEFB; border-top: 2px solid; border-image: var(--metal) 1;
  padding: 20px 30px 24px; overflow-y: auto; transform: translateY(100%);
  transition: transform .28s cubic-bezier(.22,.7,.2,1); z-index: 50; backdrop-filter: blur(8px);
}
#notesPanel.open { transform: translateY(0); }
#notesPanel .np-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; font-family: var(--font-body); font-size: 11px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: var(--gold-lt); }
#notesPanel .np-head .np-slide { color: #8FA6C8; letter-spacing: .04em; text-transform: none; font-weight: 500; }
#notesPanel .np-head .np-close { margin-left: auto; cursor: pointer; background: transparent; border: 1px solid rgba(231,238,251,.28); color: #E7EEFB; width: 26px; height: 26px; border-radius: 7px; font-size: 20px; line-height: 1; display: flex; align-items: center; justify-content: center; letter-spacing: 0; padding: 0; font-weight: 400; transition: background .15s, border-color .15s; }
#notesPanel .np-head .np-close:hover { background: rgba(231,238,251,.12); border-color: var(--gold-lt); color: #fff; }
#notesPanel .np-body { font-family: var(--font-display); font-size: 18px; line-height: 1.6; max-width: 92ch; font-weight: 400; }
#notesPanel .np-body p { margin-bottom: 11px; }

/* ── Controls ───────────────────────────────────────────── */
#controls { position: fixed; top: 14px; right: 16px; z-index: 60; display: flex; align-items: center; gap: 7px; font-family: var(--font-body); font-size: 12px; color: #C6D4EC; opacity: .62; transition: opacity .2s; }
#controls:hover { opacity: 1; }
#controls button { background: rgba(16,42,84,.82); color: #EAF0FB; border: 1px solid rgba(200,210,220,.35); border-radius: 6px; width: 34px; height: 34px; cursor: pointer; font-size: 15px; display: flex; align-items: center; justify-content: center; transition: all .15s; }
#controls button:hover { background: var(--gold-lt); color: var(--navy-dk); border-color: var(--gold-lt); }
#counter { font-family: var(--font-mono); font-variant-numeric: tabular-nums; padding: 0 6px; min-width: 58px; text-align: center; letter-spacing:.04em; }

#progress { position: fixed; top: 0; left: 0; height: 3px; background: var(--metal); z-index: 60; transition: width .3s cubic-bezier(.22,.7,.2,1); width: 0; box-shadow:0 0 8px rgba(147,175,206,.6); }

#exitDeck { position: fixed; top: 14px; left: 16px; z-index: 60; width: 34px; height: 34px; display: none; align-items: center; justify-content: center; background: rgba(16,42,84,.82); color: #EAF0FB; border: 1px solid rgba(200,210,220,.35); border-radius: 6px; opacity: .62; transition: all .15s; text-decoration: none; }
#exitDeck:hover { opacity: 1; background: var(--gold-lt); color: var(--navy-dk); border-color: var(--gold-lt); }

/* ── Help ───────────────────────────────────────────────── */
#help { position: fixed; inset: 0; background: rgba(8,22,39,.94); z-index: 100; display: none; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
#help.open { display: flex; }
#help .help-card { background: var(--white); border-radius: 8px; padding: 32px 38px; max-width: 470px; box-shadow: 0 30px 80px rgba(0,0,0,.5); border-top: 3px solid; border-image: var(--metal) 1; }
#help h3 { font-family: var(--font-display); color: var(--navy); font-size: 23px; font-weight: 600; margin-bottom: 18px; }
#help table { width: 100%; border-collapse: collapse; font-family: var(--font-body); font-size: 15px; }
#help td { padding: 7px 4px; border-bottom: 1px solid var(--hair); color: var(--text); }
#help td kbd { background: var(--lgray); border: 1px solid var(--mgray); border-bottom-width: 2px; border-radius: 5px; padding: 2px 8px; font-family: var(--font-mono); font-size: 13px; color: var(--navy); }
#help .close-hint { margin-top: 18px; font-size: 13px; color: var(--slate); text-align: center; }

/* ── Print / PDF ────────────────────────────────────────── */
/* ================= a11y remediation ================= */
.sr-only{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
/* visible keyboard focus (WCAG 2.4.7) */
#controls:focus-within{opacity:1;}
#controls button:focus-visible,#exitDeck:focus-visible,.pv-btn:focus-visible,a.inline:focus-visible,.next-step a:focus-visible,.reflect a:focus-visible{outline:3px solid #F4F8FE;outline-offset:2px;}
#exitDeck:focus-visible{opacity:1;}
/* Reflow mode for narrow screens / high browser zoom (WCAG 1.4.10, 1.4.4, 1.4.12).
   The .reflow class is toggled on .deck by fit() in deck-framework.js. Slides drop the
   fixed 1280x720 transform-scaled canvas and become a normal-flow, single-column, scrollable
   layout with relative type, so content reflows and enlarged text/spacing no longer clips. */
.deck.reflow{position:static;display:block;height:auto;overflow:visible;background:var(--paper);}
.deck.reflow::before{display:none;}
.deck.reflow .slide{position:relative;left:auto!important;top:auto!important;transform:none!important;
  width:100%;max-width:940px;height:auto;min-height:0;overflow:visible;margin:0 auto 18px;box-shadow:none;display:none;}
.deck.reflow .slide.current{display:flex;}
.deck.reflow .slide::after{display:none;}
.deck.reflow .slide-body{padding:22px 18px 16px;}
.deck.reflow .slide-title{font-size:1.7rem;line-height:1.2;}
.deck.reflow .cover h1,.deck.reflow .divider h1,.deck.reflow h1{font-size:2rem;line-height:1.15;}
.deck.reflow .lead,.deck.reflow .subtitle{font-size:1.05rem;line-height:1.5;}
.deck.reflow .bullets li,.deck.reflow .card p,.deck.reflow .callout p,.deck.reflow .reflect p,.deck.reflow .step p{font-size:1rem;line-height:1.5;}
.deck.reflow .grid,.deck.reflow .steps,.deck.reflow .guardrail,.deck.reflow .compare,.deck.reflow .tcdlai-grid,.deck.reflow .tier3,.deck.reflow .approach,.deck.reflow .two-grid,.deck.reflow .bio-grid,.deck.reflow .obj-grid,.deck.reflow .steps3{grid-template-columns:1fr!important;display:block!important;}
.deck.reflow .grid > *,.deck.reflow .steps > *,.deck.reflow .steps3 > *{margin-bottom:12px;}
/* neutralize absolutely-positioned decorative art so it cannot overlap reflowed text */
.deck.reflow .cover-visual,.deck.reflow .divider-photo,.deck.reflow .desc-photo,.deck.reflow .obj-photo,.deck.reflow .recap-emblem{position:static!important;width:auto!important;max-width:100%;height:auto!important;transform:none!important;margin:10px auto;display:block;-webkit-mask-image:none;mask-image:none;}
.deck.reflow .frame-quote .fq-text{font-size:1.5rem;}

@media print {
  @page { size: 1280px 720px; margin: 0; }
  html, body { background: #fff; height: auto; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
  .deck::before { display: none !important; }
  .deck { position: static; display: block; }
  .slide { position: relative !important; left: auto !important; top: auto !important; display: flex !important; transform: none !important; page-break-after: always; break-after: page; box-shadow: none; margin: 0 auto; }
  .slide:last-child { page-break-after: auto; break-after: auto; }
  .slide.current .slide-body > * { animation: none !important; }
  #controls, #notesPanel, #progress, #help, #exitDeck, .back-bar { display: none !important; }
}

/* ── Small screens ──────────────────────────────────────── */
@media (max-width: 700px) { #controls { top: 8px; right: 8px; } #notesPanel { max-height: 55vh; } }

/* ── Presenter view (separate laptop window) ────────────── */
body.presenter-mode { overflow: hidden; background: #060F1F; }
body.presenter-mode .deck { display: none !important; }
body.presenter-mode .slide.current .slide-body > * { animation: none !important; }

#presenter { position: fixed; inset: 0; display: flex; flex-direction: column; background: #071527; color: #E7EEFB; font-family: var(--font-body); }
.pv-top { display: flex; align-items: center; gap: 20px; padding: 12px 22px; border-bottom: 1px solid rgba(200,210,220,.14); }
.pv-top .brand { font-family: var(--font-display); font-weight: 600; font-size: 15px; letter-spacing: .05em; color: var(--gold-lt); }
.pv-nav { display: flex; gap: 6px; }
.pv-btn { background: rgba(16,42,84,.75); border: 1px solid rgba(200,210,220,.3); color: #EAF0FB; border-radius: 6px; padding: 6px 12px; font-size: 13px; cursor: pointer; font-family: var(--font-body); transition: all .15s; }
.pv-btn:hover { background: var(--gold-lt); color: var(--navy-dk); border-color: var(--gold-lt); }
.pv-btn.icon { width: 34px; padding: 6px 0; font-size: 15px; }
.pv-count { font-family: var(--font-mono); font-size: 15px; color: var(--gold-lt); letter-spacing: .04em; }
.pv-spacer { margin-left: auto; }
.pv-metrics { display: flex; align-items: center; gap: 22px; }
.pv-timer { font-family: var(--font-mono); font-size: 30px; font-weight: 500; color: #F4F8FE; letter-spacing: .02em; cursor: pointer; }
.pv-timer.paused { color: #8093B4; }
.pv-clock { font-family: var(--font-mono); font-size: 15px; color: #8FA6C8; }
.pv-close { margin-left: 6px; }
.pv-close:hover { background: #E0566B; color: #fff; border-color: #E0566B; }

.pv-main { flex: 1; display: grid; grid-template-columns: 1.55fr 1fr; gap: 22px; padding: 22px; min-height: 0; }
.pv-main > * { min-width: 0; }
.pv-left, .pv-right { display: flex; flex-direction: column; min-height: 0; min-width: 0; }
.pv-right { gap: 16px; }
.pv-right > * { min-width: 0; }
.pv-label { font-size: 11px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: #8FA6C8; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
.pv-note-size { margin-left: auto; display: inline-flex; gap: 6px; }
.pv-size-btn { font-family: var(--font-body); font-size: 12px; font-weight: 700; line-height: 1; letter-spacing: normal; cursor: pointer; background: rgba(16,42,84,.75); border: 1px solid rgba(200,210,220,.3); color: #EAF0FB; border-radius: 5px; padding: 4px 9px; transition: all .15s; }
.pv-size-btn:hover { background: var(--gold-lt); color: var(--navy-dk); border-color: var(--gold-lt); }
.pv-size-btn:focus-visible { outline: 3px solid #F4F8FE; outline-offset: 2px; }
.pv-label .dot { width: 6px; height: 6px; background: var(--gold-lt); transform: rotate(45deg); }
.pv-frame { width: 100%; background: #04070E; border: 1px solid rgba(200,210,220,.2); border-radius: 6px; overflow: hidden; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,.4); }
.pv-holder { position: absolute; top: 0; left: 0; width: 1280px; height: 720px; transform-origin: top left; }
.pv-holder .slide { box-shadow: none !important; }
.pv-next-wrap { flex: 0 0 auto; }
.pv-notes { flex: 1; overflow-y: auto; background: rgba(11,29,51,.55); border: 1px solid rgba(200,210,220,.14); border-radius: 8px; padding: 18px 22px; min-height: 0; }
.pv-notes-body { font-family: var(--font-display); font-size: 20px; line-height: 1.62; color: #EBF2FD; font-weight: 400; }
.pv-notes-body p { margin-bottom: 12px; }
.pv-end { display: flex; align-items: center; justify-content: center; height: 100%; color: #8FA6C8; font-family: var(--font-display); font-style: italic; font-size: 20px; }
.pv-hint { padding: 8px 22px 12px; font-size: 12px; color: #6E82A6; border-top: 1px solid rgba(200,210,220,.1); }
.pv-hint kbd { font-family: var(--font-mono); background: rgba(255,255,255,.06); border: 1px solid rgba(200,210,220,.2); border-radius: 4px; padding: 1px 6px; color: #C6D4EC; font-size: 11px; }

/* Slide corner icon */
.slide-ico{position:absolute;top:38px;right:52px;width:108px;height:108px;object-fit:contain;border-radius:12px;z-index:1;}
```

---

# Appendix B — `deck-framework.js` (paste into one `<script>` tag)

The complete navigation, notes panel, presenter window, cross-window sync, and print logic. No dependencies. Paste **everything between the fences** into a single `<script>` tag just before `</body>`, verbatim and in full.

```javascript
/* ============================================================
   Web Deck Framework (v5): navigation, presenter view, sync, print
   Developed by Miguel Guhlin - mguhlin.org · https://mguhlin.github.io/webdecks/
   Free to use (MIT). This header is attribution only; it never renders on a slide.
   No dependencies. Include once per deck, after the slides.
   Two-monitor use: press V (or the 🖥 button) to open the
   presenter window on your laptop; drag the main window to the
   projector and press F for fullscreen. Both stay in sync.
   ============================================================ */
(function () {
  'use strict';

  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  if (!slides.length) return;
  var TOTAL = slides.length;

  // ── Cross-window sync (same origin) ─────────────────────
  var CH = 'webdeck:' + location.pathname;
  var bc = ('BroadcastChannel' in window) ? new BroadcastChannel(CH) : null;
  function send(msg) {
    if (bc) { try { bc.postMessage(msg); } catch (e) {} }
    try { localStorage.setItem(CH, JSON.stringify(Object.assign({ _t: Date.now() }, msg))); } catch (e) {}
  }
  function onMsg(fn) {
    if (bc) bc.onmessage = function (e) { fn(e.data); };
    window.addEventListener('storage', function (e) {
      if (e.key === CH && e.newValue) { try { fn(JSON.parse(e.newValue)); } catch (_) {} }
    });
  }

  var isPresenter = /[?&]presenter=1/.test(location.search);
  if (isPresenter) { initPresenter(); return; }

  /* ==========================================================
     MAIN DECK
     ========================================================== */
  var deck = document.querySelector('.deck');
  var SLIDE_W = 1280, SLIDE_H = 720, idx = 0;

  var progress = el('div', { id: 'progress' });
  var counter = el('span', { id: 'counter' });
  var controls = el('div', { id: 'controls' });
  controls.appendChild(btn('‹', 'Previous slide', prev));
  controls.appendChild(counter);
  controls.appendChild(btn('›', 'Next slide', next));
  controls.appendChild(btn('🗒', 'Toggle presenter notes here (S)', toggleNotes));
  controls.appendChild(btn('🖥', 'Open presenter view for your laptop (V)', openPresenter));
  controls.appendChild(btn('⛶', 'Fullscreen (F)', toggleFull));
  controls.appendChild(btn('?', 'Keyboard help', toggleHelp));

  var notesPanel = el('div', { id: 'notesPanel' });
  var npHead = el('div', { class: 'np-head' });
  var npTitle = document.createElement('span'); npTitle.textContent = 'Speaker Notes';
  var npSlide = el('span', { class: 'np-slide' });
  var npClose=el('button',{class:'np-close',title:'Close notes (S or Esc)','aria-label':'Close notes'});npClose.innerHTML='×';npClose.addEventListener('click',function(ev){ev.stopPropagation();notesPanel.classList.remove('open');});npHead.appendChild(npTitle); npHead.appendChild(npSlide); npHead.appendChild(npClose);
  var npBody = el('div', { class: 'np-body' });
  notesPanel.appendChild(npHead); notesPanel.appendChild(npBody);

  var help = el('div', { id: 'help' });
  help.innerHTML = '<div class="help-card"><h3>Keyboard shortcuts</h3>' +
    '<table>' +
    '<tr><td><kbd>→</kbd> <kbd>Space</kbd></td><td>Next slide</td></tr>' +
    '<tr><td><kbd>←</kbd></td><td>Previous slide</td></tr>' +
    '<tr><td><kbd>Home</kbd> / <kbd>End</kbd></td><td>First / last slide</td></tr>' +
    '<tr><td><kbd>V</kbd></td><td>Open presenter view (second monitor)</td></tr>' +
    '<tr><td><kbd>S</kbd></td><td>Toggle notes on this screen</td></tr>' +
    '<tr><td><kbd>F</kbd></td><td>Fullscreen</td></tr>' +
    '<tr><td><kbd>P</kbd></td><td>Print / export to PDF</td></tr>' +
    '</table><div class="close-hint">Press any key or click to close</div></div>';

  var exitLink = el('a', { id: 'exitDeck', href: '../index.html', title: 'Exit to home', 'aria-label': 'Exit to home' });
  exitLink.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>';

  // live region for slide-change announcements (WCAG 4.1.3)
  var liveRegion = el('div', { id: 'slideLive', 'aria-live': 'polite', 'aria-atomic': 'true', class: 'sr-only' });

  document.body.appendChild(progress);
  document.body.appendChild(controls);
  document.body.appendChild(exitLink);
  document.body.appendChild(notesPanel);
  document.body.appendChild(help);
  document.body.appendChild(liveRegion);

  function fit() {
    var pad = 24;
    var raw = Math.min((window.innerWidth - pad) / SLIDE_W, (window.innerHeight - pad) / SLIDE_H);
    // Reflow when the screen is narrow or zoom shrinks the fit below a usable scale (WCAG 1.4.10 / 1.4.4).
    var reflow = window.innerWidth < 800 || raw < 0.55;
    deck.classList.toggle('reflow', reflow);
    slides.forEach(function (s) {
      if (reflow) {
        s.style.transform = ''; s.style.left = ''; s.style.top = '';
      } else {
        s.style.transform = 'translate(-50%, -50%) scale(' + Math.max(0.2, raw) + ')';
        s.style.left = '50%'; s.style.top = '50%';
      }
    });
  }
  window.addEventListener('resize', fit);

  function show(n, fromSync) {
    idx = Math.max(0, Math.min(TOTAL - 1, n));
    slides.forEach(function (s, i) { s.classList.toggle('current', i === idx); });
    counter.textContent = (idx + 1) + ' / ' + TOTAL;
    progress.style.width = ((idx + 1) / TOTAL * 100) + '%';
    exitLink.style.display = (idx === 0) ? 'none' : 'flex';
    var titleEl = slides[idx].querySelector('.slide-title, h1, h2');
    liveRegion.textContent = 'Slide ' + (idx + 1) + ' of ' + TOTAL + (titleEl ? ': ' + titleEl.textContent.trim() : '');
    updateNotes();
    if (history.replaceState) history.replaceState(null, '', '#' + (idx + 1));
    if (!fromSync) send({ type: 'goto', idx: idx });
  }
  function next() { show(idx + 1); }
  function prev() { show(idx - 1); }

  function updateNotes() {
    var src = slides[idx].querySelector('.notes');
    npSlide.textContent = 'Slide ' + (idx + 1) + ' of ' + TOTAL;
    npBody.innerHTML = src ? src.innerHTML : '<p class="muted">No notes for this slide.</p>';
  }

  function toggleNotes() { notesPanel.classList.toggle('open'); }
  function toggleHelp() { help.classList.toggle('open'); }
  function toggleFull() {
    if (!document.fullscreenElement) { (document.documentElement.requestFullscreen || function () {}).call(document.documentElement); }
    else if (document.exitFullscreen) { document.exitFullscreen(); }
  }
  var presenterWin = null;
  function openPresenter() {
    presenterWin = window.open(location.pathname + '?presenter=1', 'webdeck-presenter',
      'width=1280,height=800,menubar=no,toolbar=no,location=no');
    if (presenterWin) setTimeout(function () { send({ type: 'goto', idx: idx }); }, 400);
  }

  document.addEventListener('keydown', function (e) {
    if (help.classList.contains('open')) { help.classList.remove('open'); return; }
    if (e.key === 'Escape' && notesPanel.classList.contains('open')) { notesPanel.classList.remove('open'); return; }
    switch (e.key) {
      case 'ArrowRight': case ' ': case 'PageDown': next(); e.preventDefault(); break;
      case 'ArrowLeft': case 'PageUp': prev(); e.preventDefault(); break;
      case 'Home': show(0); break;
      case 'End': show(TOTAL - 1); break;
      case 's': case 'S': case 'n': case 'N': toggleNotes(); break;
      case 'v': case 'V': openPresenter(); break;
      case 'f': case 'F': toggleFull(); break;
      case 'p': case 'P': window.print(); break;
      case '?': toggleHelp(); break;
    }
  });

  deck.addEventListener('click', function (e) {
    if (e.target.closest('a, button, input, textarea, select, .no-advance')) return;
    if (e.clientX < window.innerWidth * 0.32) prev(); else next();
  });
  help.addEventListener('click', function () { help.classList.remove('open'); });

  onMsg(function (m) {
    if (!m) return;
    if (m.type === 'goto' && m.idx !== idx) show(m.idx, true);
    else if (m.type === 'hello') send({ type: 'goto', idx: idx });
  });

  fit();
  var start = parseInt((location.hash || '').replace('#', ''), 10);
  show(isNaN(start) ? 0 : start - 1, true);
  window.__deck = { show: show, next: next, prev: prev, presenter: openPresenter };

  function el(tag, attrs) { var e = document.createElement(tag); if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function btn(label, title, fn) { var b = el('button', { title: title, 'aria-label': title }); b.textContent = label; b.addEventListener('click', function (ev) { ev.stopPropagation(); fn(); }); return b; }

  /* ==========================================================
     PRESENTER WINDOW
     ========================================================== */
  function initPresenter() {
    document.body.classList.add('presenter-mode');
    var pIdx = 0;
    var wrap = document.createElement('div'); wrap.id = 'presenter';
    wrap.innerHTML =
      '<div class="pv-top">' +
        '<span class="brand">✦ Presenter</span>' +
        '<div class="pv-nav">' +
          '<button class="pv-btn icon" id="pvPrev" title="Previous">‹</button>' +
          '<button class="pv-btn icon" id="pvNext" title="Next">›</button>' +
        '</div>' +
        '<span class="pv-count" id="pvCount">1 / ' + TOTAL + '</span>' +
        '<span class="pv-spacer"></span>' +
        '<div class="pv-metrics">' +
          '<span class="pv-timer" id="pvTimer" title="Click to pause or resume">00:00</span>' +
          '<button class="pv-btn" id="pvReset">Reset timer</button>' +
          '<span class="pv-clock" id="pvClock">--:--</span>' +
          '<button class="pv-btn pv-close" id="pvClose" title="Close presenter window (Esc)">✕ Close</button>' +
        '</div>' +
      '</div>' +
      '<div class="pv-main">' +
        '<div class="pv-left">' +
          '<div class="pv-label"><span class="dot"></span>Current slide</div>' +
          '<div class="pv-frame" id="pvCurrent"></div>' +
        '</div>' +
        '<div class="pv-right">' +
          '<div class="pv-next-wrap">' +
            '<div class="pv-label"><span class="dot"></span>Next up</div>' +
            '<div class="pv-frame" id="pvNextFrame"></div>' +
          '</div>' +
          '<div style="display:flex;flex-direction:column;min-height:0;flex:1;">' +
            '<div class="pv-label"><span class="dot"></span><span>Speaker notes</span>' +
              '<span class="pv-note-size"><button class="pv-size-btn" id="pvNotesDown" title="Smaller notes text (-)" aria-label="Smaller notes text">A−</button>' +
              '<button class="pv-size-btn" id="pvNotesUp" title="Larger notes text (+)" aria-label="Larger notes text">A+</button></span></div>' +
            '<div class="pv-notes"><div class="pv-notes-body" id="pvNotes"></div></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="pv-hint">Navigate with <kbd>←</kbd> <kbd>→</kbd> or <kbd>Space</kbd>. This window and the projector stay in sync. Put the other window on the projector and press <kbd>F</kbd> to go fullscreen.</div>';
    document.body.appendChild(wrap);

    var elCur = document.getElementById('pvCurrent');
    var elNext = document.getElementById('pvNextFrame');
    var elNotes = document.getElementById('pvNotes');
    var elCount = document.getElementById('pvCount');

    // Speaker-notes text sizing (A- / A+, or + / - keys), persisted across sessions.
    var NOTE_SCALE_KEY = 'webdeck-notes-scale';
    var noteScale = parseFloat(localStorage.getItem(NOTE_SCALE_KEY)) || 1;
    function applyNoteScale() {
      noteScale = Math.max(0.7, Math.min(2.2, noteScale));
      elNotes.style.fontSize = (20 * noteScale).toFixed(1) + 'px';
      try { localStorage.setItem(NOTE_SCALE_KEY, noteScale); } catch (e) {}
    }
    function bumpNotes(d) { noteScale = Math.round((noteScale + d) * 10) / 10; applyNoteScale(); }
    document.getElementById('pvNotesUp').onclick = function () { bumpNotes(0.1); };
    document.getElementById('pvNotesDown').onclick = function () { bumpNotes(-0.1); };
    applyNoteScale();

    function preview(container, i, big) {
      container.innerHTML = '';
      if (i < 0 || i >= TOTAL) { container.innerHTML = '<div class="pv-end">End of deck</div>'; container.style.height = (big ? 300 : 150) + 'px'; return; }
      var holder = document.createElement('div'); holder.className = 'pv-holder';
      var clone = slides[i].cloneNode(true);
      clone.classList.add('current');
      clone.style.position = 'absolute'; clone.style.left = '0'; clone.style.top = '0'; clone.style.margin = '0';
      var notesInClone = clone.querySelector('.notes'); if (notesInClone) notesInClone.remove();
      holder.appendChild(clone);
      container.appendChild(holder);
      scale(container, holder);
    }
    function scale(container, holder) {
      var w = container.clientWidth || 600;
      var s = w / 1280;
      holder.style.width = '1280px'; holder.style.height = '720px';
      holder.style.transform = 'scale(' + s + ')'; holder.style.transformOrigin = 'top left';
      container.style.height = (720 * s) + 'px';
    }
    function render() {
      preview(elCur, pIdx, true);
      preview(elNext, pIdx + 1, false);
      var src = slides[pIdx] && slides[pIdx].querySelector('.notes');
      elNotes.innerHTML = src ? src.innerHTML : '<p style="color:#8FA6C8">No notes for this slide.</p>';
      elCount.textContent = (pIdx + 1) + ' / ' + TOTAL;
    }
    function goto(n, fromSync) {
      pIdx = Math.max(0, Math.min(TOTAL - 1, n));
      render();
      if (!fromSync) send({ type: 'goto', idx: pIdx });
    }

    document.getElementById('pvPrev').onclick = function () { goto(pIdx - 1); };
    document.getElementById('pvNext').onclick = function () { goto(pIdx + 1); };
    document.getElementById('pvCurrent').onclick = function () { goto(pIdx + 1); };
    document.addEventListener('keydown', function (e) {
      switch (e.key) {
        case 'ArrowRight': case ' ': case 'PageDown': goto(pIdx + 1); e.preventDefault(); break;
        case 'ArrowLeft': case 'PageUp': goto(pIdx - 1); e.preventDefault(); break;
        case 'Home': goto(0); break;
        case 'End': goto(TOTAL - 1); break;
        case 'Escape': window.close(); break;
        case 't': case 'T': resetTimer(); break;
        case '+': case '=': bumpNotes(0.1); e.preventDefault(); break;
        case '-': case '_': bumpNotes(-0.1); e.preventDefault(); break;
      }
    });
    window.addEventListener('resize', render);

    onMsg(function (m) { if (m && m.type === 'goto') goto(m.idx, true); });
    send({ type: 'hello' });
    var last = null; try { last = JSON.parse(localStorage.getItem(CH)); } catch (e) {}
    goto(last && typeof last.idx === 'number' ? last.idx : 0, true);

    // Timer + clock
    var elapsed = 0, running = true;
    var elTimer = document.getElementById('pvTimer'), elClock = document.getElementById('pvClock');
    function fmt(s) { var m = Math.floor(s / 60), r = s % 60; return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r; }
    function tick() {
      if (running) { elapsed++; elTimer.textContent = fmt(elapsed); }
      var d = new Date();
      elClock.textContent = (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    }
    function resetTimer() { elapsed = 0; elTimer.textContent = '00:00'; }
    elTimer.onclick = function () { running = !running; elTimer.classList.toggle('paused', !running); };
    document.getElementById('pvReset').onclick = resetTimer;
    var pvCloseBtn = document.getElementById('pvClose'); if (pvCloseBtn) pvCloseBtn.onclick = function () { window.close(); };
    setInterval(tick, 1000); tick();
    render();
  }
})();

/* Copy-to-clipboard used by prompt blocks across decks and pages */
function copyText(btn, ev) {
  if (ev) ev.stopPropagation();
  var target = btn.getAttribute('data-target');
  var node = target ? document.getElementById(target)
                    : btn.parentElement.querySelector('.prompt, .copytext');
  if (!node) return;
  var clone = node.cloneNode(true);                 // strip the Copy button from the copied text
  var b = clone.querySelector('.copy-btn'); if (b) b.parentNode.removeChild(b);
  var text = (clone.innerText || clone.textContent || '').trim();
  if (!text) return;
  navigator.clipboard.writeText(text).then(function () {
    var old = btn.textContent;
    btn.textContent = 'Copied';
    btn.classList.add('copied');
    setTimeout(function () { btn.textContent = old; btn.classList.remove('copied'); }, 1600);
  });
}
```
